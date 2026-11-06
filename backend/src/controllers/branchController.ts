/**
 * Backend/src/controllers/branchController.ts
 *
 * Controller quản lý Danh mục Chi nhánh / Trụ sở & Sơ đồ Tầng (Branches & Floors API):
 * - Kết nối 100% PostgreSQL qua Prisma ORM (`Branch` & `Floor`).
 * - Bảo vệ toàn vẹn dữ liệu: Không cho phép xóa Tầng / Chi nhánh đang còn máy in hoạt động,
 *   và không cho phép xóa Trụ sở chính (HQ) khi còn chi nhánh vệ tinh.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const formatBranchResponse = (b: {
  id: string;
  name: string;
  code: string;
  address: string | null;
  isHq: boolean;
  floors: { name: string }[];
}) => ({
  id: b.id,
  name: b.name,
  code: b.code,
  address: b.address || undefined,
  isHq: b.isHq,
  floors: b.floors.map((f) => f.name),
});

export class BranchController {
  // GET /api/v1/settings/branches
  public async getBranches(_req: Request, res: Response) {
    try {
      const branches = await prisma.branch.findMany({
        include: { floors: { orderBy: { createdAt: 'asc' } } },
        orderBy: [{ isHq: 'desc' }, { createdAt: 'asc' }],
      });
      return res.status(200).json(branches.map(formatBranchResponse));
    } catch (err: any) {
      console.error('[BranchController.getBranches] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy danh sách chi nhánh', message: err.message });
    }
  }

  // POST /api/v1/settings/branches
  public async createBranch(req: Request, res: Response) {
    try {
      const { name, code, address, floors } = req.body || {};
      const cleanName = String(name || '').trim();
      if (!cleanName) {
        return res.status(400).json({ error: 'Tên chi nhánh / trụ sở không được để trống.' });
      }

      const existingCount = await prisma.branch.count();
      const rawCode = String(code || '').trim().toUpperCase();
      const finalCode = rawCode || `BR-${Date.now().toString().slice(-4)}`;
      const floorNames: string[] =
        Array.isArray(floors) && floors.length > 0
          ? floors.map((f: unknown) => String(f).trim()).filter(Boolean)
          : ['Tầng 1'];

      const created = await prisma.branch.create({
        data: {
          name: cleanName,
          code: finalCode,
          address: address ? String(address).trim() : null,
          isHq: existingCount === 0,
          floors: {
            create: Array.from(new Set(floorNames)).map((fName) => ({ name: fName })),
          },
        },
        include: { floors: { orderBy: { createdAt: 'asc' } } },
      });

      return res.status(201).json({
        success: true,
        data: formatBranchResponse(created),
      });
    } catch (err: any) {
      console.error('[BranchController.createBranch] Lỗi tạo chi nhánh:', err);
      return res.status(400).json({
        error: 'Không thể tạo chi nhánh mới (Tên hoặc Mã chi nhánh có thể đã tồn tại).',
        message: err.message,
      });
    }
  }

  // DELETE /api/v1/settings/branches/:id
  public async deleteBranch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const branch = await prisma.branch.findUnique({ where: { id } });
      if (!branch) {
        return res.status(404).json({ error: 'Không tìm thấy trụ sở / chi nhánh.' });
      }

      const totalBranches = await prisma.branch.count();
      if (branch.isHq && totalBranches > 1) {
        return res.status(400).json({
          error: 'Không thể xóa Trụ sở chính (HQ) của hệ thống khi còn chi nhánh khác.',
        });
      }

      const activePrinters = await prisma.printer.count({
        where: {
          OR: [{ branchId: branch.id }, { branch: { equals: branch.name, mode: 'insensitive' } }],
        },
      });

      if (activePrinters > 0) {
        return res.status(400).json({
          error: `Không thể xóa trụ sở này vì đang có ${activePrinters} máy in hoạt động. Vui lòng điều chuyển máy in trước!`,
        });
      }

      await prisma.$transaction([
        prisma.floor.deleteMany({ where: { branchId: branch.id } }),
        prisma.branch.delete({ where: { id: branch.id } }),
      ]);

      return res.status(200).json({ success: true, message: 'Đã xóa chi nhánh thành công.' });
    } catch (err: any) {
      console.error('[BranchController.deleteBranch] Lỗi xóa chi nhánh:', err);
      return res.status(500).json({ error: 'Không thể xóa chi nhánh', message: err.message });
    }
  }

  // POST /api/v1/settings/branches/:id/floors
  public async addFloor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cleanFloor = String(req.body?.name || req.body?.floorName || '').trim();
      if (!cleanFloor) {
        return res.status(400).json({ error: 'Tên tầng không được để trống.' });
      }

      const branch = await prisma.branch.findFirst({
        where: { OR: [{ id }, { name: { equals: id, mode: 'insensitive' } }] },
      });
      if (!branch) {
        return res.status(404).json({ error: 'Không tìm thấy chi nhánh tương ứng.' });
      }

      await prisma.floor.create({
        data: { branchId: branch.id, name: cleanFloor },
      });

      const updated = await prisma.branch.findUniqueOrThrow({
        where: { id: branch.id },
        include: { floors: { orderBy: { createdAt: 'asc' } } },
      });

      return res.status(201).json({
        success: true,
        data: formatBranchResponse(updated),
      });
    } catch (err: any) {
      console.error('[BranchController.addFloor] Lỗi thêm tầng:', err);
      return res.status(400).json({ error: 'Tầng này đã tồn tại hoặc dữ liệu không hợp lệ.', message: err.message });
    }
  }

  // DELETE /api/v1/settings/branches/:id/floors/:floorName
  public async removeFloor(req: Request, res: Response) {
    try {
      const { id, floorName } = req.params;
      const decodedFloor = decodeURIComponent(floorName).trim();

      const branch = await prisma.branch.findFirst({
        where: { OR: [{ id }, { name: { equals: id, mode: 'insensitive' } }] },
      });
      if (!branch) {
        return res.status(404).json({ error: 'Không tìm thấy chi nhánh tương ứng.' });
      }

      const floorRecord = await prisma.floor.findFirst({
        where: { branchId: branch.id, name: { equals: decodedFloor, mode: 'insensitive' } },
      });
      if (!floorRecord) {
        return res.status(404).json({ error: `Không tìm thấy '${decodedFloor}' trong chi nhánh này.` });
      }

      const activePrinters = await prisma.printer.count({
        where: {
          OR: [
            { floorId: floorRecord.id },
            {
              AND: [
                { branch: { equals: branch.name, mode: 'insensitive' } },
                { floor: { equals: decodedFloor, mode: 'insensitive' } },
              ],
            },
          ],
        },
      });

      if (activePrinters > 0) {
        return res.status(400).json({
          error: `Không thể xóa '${decodedFloor}' vì đang có ${activePrinters} máy in hoạt động. Vui lòng điều chuyển máy in trước!`,
        });
      }

      await prisma.floor.delete({ where: { id: floorRecord.id } });
      return res.status(200).json({ success: true, message: `Đã xóa '${decodedFloor}' thành công.` });
    } catch (err: any) {
      console.error('[BranchController.removeFloor] Lỗi xóa tầng:', err);
      return res.status(500).json({ error: 'Không thể xóa tầng', message: err.message });
    }
  }
}

export const branchController = new BranchController();

