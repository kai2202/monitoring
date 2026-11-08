/**
 * Backend/src/controllers/financeController.ts
 *
 * Quản trị Chi phí vận hành, Định mức Ngân sách & Hợp đồng thuê máy in (TASK-BE-12):
 * - Hạch toán chi phí trang in Mono/Color, chi phí thuê thiết bị, chi phí bảo dưỡng.
 * - Đối soát hạn mức ngân sách phòng ban và theo dõi thời hạn hợp đồng.
 * - Tuân thủ AGENTS.md Rule 4 (Bảo vệ bí mật tài chính trước KTV) & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class FinanceController {
  // GET /api/v1/finance/costs/breakdown
  async getCostBreakdown(req: Request, res: Response) {
    try {
      const userRole = req.user?.role;
      // Bảo vệ thông tin tài chính: KTV không được phép xem số tiền VNĐ
      if (userRole === 'FIELD_TECH') {
        return res.status(403).json({ error: 'FIELD_TECH không có quyền xem thông tin tài chính và chi phí VNĐ' });
      }

      const costConfig = await prisma.costRateConfig.findFirst({ orderBy: { effectiveDate: 'desc' } });
      const monoRate = costConfig?.monoRatePerPage || 150;
      const colorRate = costConfig?.colorRatePerPage || 1000;

      const printers = await prisma.printer.findMany({
        include: {
          counterRollups: {
            take: 30,
            orderBy: { recordedDate: 'desc' },
          },
          contracts: {
            where: { status: 'ACTIVE' },
          },
        },
      });

      let totalMonoPages = 0;
      let totalColorPages = 0;
      let totalRentalCost = 0;

      const departmentMap: Record<string, { mono: number; color: number; rental: number; cost: number }> = {};

      for (const p of printers) {
        const dept = p.department || 'Chưa phân bổ';
        if (!departmentMap[dept]) {
          departmentMap[dept] = { mono: 0, color: 0, rental: 0, cost: 0 };
        }

        const pMono = p.counterRollups.reduce((sum, r) => sum + r.deltaMono, 0);
        const pColor = p.counterRollups.reduce((sum, r) => sum + r.deltaColor, 0);
        const pRental = p.contracts.reduce((sum, c) => sum + c.monthlyRentalCost, 0);

        totalMonoPages += pMono;
        totalColorPages += pColor;
        totalRentalCost += pRental;

        departmentMap[dept].mono += pMono;
        departmentMap[dept].color += pColor;
        departmentMap[dept].rental += pRental;
        departmentMap[dept].cost += (pMono * monoRate) + (pColor * colorRate) + pRental;
      }

      const totalPrintingCost = (totalMonoPages * monoRate) + (totalColorPages * colorRate);
      const totalTco = totalPrintingCost + totalRentalCost;

      const breakdownByDepartment = Object.entries(departmentMap).map(([dept, data]) => ({
        department: dept,
        monoPages: data.mono,
        colorPages: data.color,
        printingCostVnd: (data.mono * monoRate) + (data.color * colorRate),
        rentalCostVnd: data.rental,
        totalCostVnd: data.cost,
        costPercent: totalTco > 0 ? Number(((data.cost / totalTco) * 100).toFixed(1)) : 0,
      }));

      return res.status(200).json({
        success: true,
        summary: {
          totalMonoPages,
          totalColorPages,
          totalPrintingCostVnd: totalPrintingCost,
          totalRentalCostVnd: totalRentalCost,
          totalTcoVnd: totalTco,
          rates: { monoRate, colorRate },
        },
        departments: breakdownByDepartment,
      });
    } catch (err: any) {
      console.error('[FinanceController.getCostBreakdown] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể tính toán bóc tách chi phí', message: err.message });
    }
  }

  // GET /api/v1/finance/budgets
  async getBudgets(req: Request, res: Response) {
    try {
      if (req.user?.role === 'FIELD_TECH') {
        return res.status(403).json({ error: 'FIELD_TECH không có quyền truy cập định mức ngân sách' });
      }

      const budgets = await prisma.departmentBudget.findMany({
        orderBy: { department: 'asc' },
      });

      return res.status(200).json({ success: true, count: budgets.length, data: budgets });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể truy vấn danh sách định mức ngân sách', message: err.message });
    }
  }

  // POST /api/v1/finance/budgets
  async setBudget(req: Request, res: Response) {
    try {
      const { department, monthlyQuotaVnd, monthlyPageQuota, fiscalYear } = req.body;

      if (!department) {
        return res.status(400).json({ error: 'Thiếu trường bắt buộc: department' });
      }

      const year = Number(fiscalYear) || new Date().getFullYear();

      const budget = await prisma.departmentBudget.upsert({
        where: {
          department_fiscalYear: {
            department,
            fiscalYear: year,
          },
        },
        update: {
          monthlyQuotaVnd: Number(monthlyQuotaVnd) || 10000000,
          monthlyPageQuota: Number(monthlyPageQuota) || 50000,
        },
        create: {
          department,
          monthlyQuotaVnd: Number(monthlyQuotaVnd) || 10000000,
          monthlyPageQuota: Number(monthlyPageQuota) || 50000,
          fiscalYear: year,
        },
      });

      return res.status(200).json({ success: true, message: 'Đã cập nhật định mức ngân sách', data: budget });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể lưu định mức ngân sách', message: err.message });
    }
  }

  // GET /api/v1/contracts
  async getContracts(_req: Request, res: Response) {
    try {
      const contracts = await prisma.printerContract.findMany({
        include: {
          vendor: { select: { id: true, name: true, phone: true } },
          printer: { select: { id: true, name: true, location: true } },
        },
        orderBy: { endDate: 'asc' },
      });

      return res.status(200).json({ success: true, count: contracts.length, data: contracts });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể truy vấn danh mục hợp đồng', message: err.message });
    }
  }

  // POST /api/v1/contracts
  async createContract(req: Request, res: Response) {
    try {
      const { contractNumber, vendorId, printerId, contractType, monthlyRentalCost, startDate, endDate } = req.body;

      if (!contractNumber || !startDate || !endDate) {
        return res.status(400).json({ error: 'Thiếu thông tin: contractNumber, startDate, endDate' });
      }

      const contract = await prisma.printerContract.create({
        data: {
          contractNumber,
          vendorId: vendorId || null,
          printerId: printerId || null,
          contractType: contractType || 'LEASE',
          monthlyRentalCost: Number(monthlyRentalCost) || 0,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'ACTIVE',
        },
      });

      return res.status(201).json({ success: true, message: 'Tạo hợp đồng thành công', data: contract });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể lưu hợp đồng', message: err.message });
    }
  }
}

export const financeController = new FinanceController();

