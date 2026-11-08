/**
 * Backend/src/controllers/printers/branchController.ts
 *
 * Controller quản lý Sơ đồ Tòa nhà & Tầng (Building & Floors API - LAN-Only):
 * - Kết nối 100% PostgreSQL qua Prisma ORM (`Floor` & `Printer`), loại bỏ hoàn toàn thực thể `Branch`.
 * - Bảo vệ toàn vẹn dữ liệu: Không cho phép xóa Tầng đang còn máy in hoạt động.
 * - Duy trì tương thích hợp đồng JSON cho cả `/settings/branches` và `/settings/floors`.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

const DEFAULT_BUILDING = 'Trụ sở chính';

function deriveFloorCode(floorName: string): string {
  const digits = floorName.replace(/\D/g, '');
  if (digits) return `T${digits}`;
  const clean = floorName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return clean.slice(0, 6) || `FL-${Date.now().toString().slice(-3)}`;
}

async function buildBuildingFloorSummary(buildingName = DEFAULT_BUILDING) {
  const floors = await prisma.floor.findMany({
    where: { building: { equals: buildingName, mode: 'insensitive' } },
    orderBy: { code: 'asc' },
  });

  return {
    id: 'hq-main',
    name: buildingName,
    code: 'HQ-MAIN',
    address: 'Khuôn viên Mạng LAN Nội bộ',
    isHq: true,
    floors: floors.map((f) => f.name),
    floorItems: floors.map((f) => ({ id: f.id, code: f.code, name: f.name, building: f.building })),
  };
}

export class BranchController {
  // GET /api/v1/settings/branches
  public async getBranches(_req: Request, res: Response) {
    try {
      const floors = await prisma.floor.findMany({
        orderBy: { code: 'asc' },
      });

      const buildingMap = new Map<string, string[]>();
      buildingMap.set(DEFAULT_BUILDING, []);

      for (const fl of floors) {
        const bName = fl.building || DEFAULT_BUILDING;
        const list = buildingMap.get(bName) || [];
        list.push(fl.name);
        buildingMap.set(bName, list);
      }

      const result = Array.from(buildingMap.entries()).map(([bName, flNames], index) => ({
        id: index === 0 ? 'hq-main' : `building-${index + 1}`,
        name: bName,
        code: index === 0 ? 'HQ-MAIN' : `BLD-0${index + 1}`,
        address: 'Khuôn viên Mạng LAN Nội bộ',
        isHq: index === 0,
        floors: flNames,
      }));

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[BranchController.getBranches] Lỗi truy vấn sơ đồ tầng:', err);
      return res.status(500).json({ error: 'Không thể lấy sơ đồ tòa nhà và tầng', message: err.message });
    }
  }

  // POST /api/v1/settings/branches
  public async createBranch(req: Request, res: Response) {
    try {
      const { name, floors } = req.body || {};
      const cleanBuilding = String(name || DEFAULT_BUILDING).trim();
      if (!cleanBuilding) {
        return res.status(400).json({ error: 'Tên tòa nhà / trụ sở không được để trống.' });
      }

      const floorNames: string[] =
        Array.isArray(floors) && floors.length > 0
          ? floors.map((f: unknown) => String(f).trim()).filter(Boolean)
          : ['Tầng 1'];

      for (const fName of Array.from(new Set(floorNames))) {
        const code = deriveFloorCode(fName);
        await prisma.floor.upsert({
          where: { code },
          update: { name: fName, building: cleanBuilding },
          create: { code, name: fName, building: cleanBuilding },
        });
      }

      const summary = await buildBuildingFloorSummary(cleanBuilding);
      return res.status(201).json({
        success: true,
        data: summary,
      });
    } catch (err: any) {
      console.error('[BranchController.createBranch] Lỗi khởi tạo tầng:', err);
      return res.status(400).json({
        error: 'Không thể khởi tạo khu vực mới.',
        message: err.message,
      });
    }
  }

  // DELETE /api/v1/settings/branches/:id
  public async deleteBranch(_req: Request, res: Response) {
    return res.status(400).json({
      error: 'Hệ thống vận hành theo kiến trúc LAN-Only một Trụ sở chính duy nhất, không được phép xóa Trụ sở chính.',
    });
  }

  // POST /api/v1/settings/branches/:id/floors
  public async addFloor(req: Request, res: Response) {
    try {
      const cleanFloor = String(req.body?.name || req.body?.floorName || '').trim();
      if (!cleanFloor) {
        return res.status(400).json({ error: 'Tên tầng không được để trống.' });
      }

      const code = String(req.body?.code || deriveFloorCode(cleanFloor)).trim().toUpperCase();
      const existing = await prisma.floor.findFirst({
        where: {
          OR: [{ code }, { name: { equals: cleanFloor, mode: 'insensitive' } }],
        },
      });

      if (existing) {
        return res.status(409).json({ error: `Tầng '${cleanFloor}' (${code}) đã tồn tại trong hệ thống.` });
      }

      await prisma.floor.create({
        data: {
          building: DEFAULT_BUILDING,
          name: cleanFloor,
          code,
        },
      });

      const summary = await buildBuildingFloorSummary(DEFAULT_BUILDING);
      return res.status(201).json({
        success: true,
        data: summary,
      });
    } catch (err: any) {
      console.error('[BranchController.addFloor] Lỗi thêm tầng:', err);
      return res.status(400).json({ error: 'Không thể thêm tầng mới.', message: err.message });
    }
  }

  // DELETE /api/v1/settings/branches/:id/floors/:floorName
  public async removeFloor(req: Request, res: Response) {
    try {
      const { floorName } = req.params;
      const decodedFloor = decodeURIComponent(floorName).trim();

      const floorRecord = await prisma.floor.findFirst({
        where: {
          OR: [
            { name: { equals: decodedFloor, mode: 'insensitive' } },
            { code: { equals: decodedFloor, mode: 'insensitive' } },
          ],
        },
      });

      if (!floorRecord) {
        return res.status(404).json({ error: `Không tìm thấy '${decodedFloor}' trong Trụ sở chính.` });
      }

      const activePrinters = await prisma.printer.count({
        where: {
          OR: [
            { floorId: floorRecord.id },
            { floor: { equals: floorRecord.code, mode: 'insensitive' } },
            { floor: { equals: floorRecord.name, mode: 'insensitive' } },
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

