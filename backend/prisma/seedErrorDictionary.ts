/**
 * Backend/prisma/seedErrorDictionary.ts
 *
 * Tự động nạp 75 mã lỗi phần cứng chuẩn hóa từ file CSV vào PostgreSQL:
 * - Nguồn: docs/snmp-oids/error_dictionary_import.csv
 * - Tuân thủ AGENTS.md Rule 1, 5, 6 & Rule 7.1 (< 300 LOC).
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

export async function seedErrorDictionary(prisma: PrismaClient): Promise<number> {
  console.log('[Seed] Đang nạp danh mục 75 mã lỗi phần cứng từ CSV vào ErrorDictionary...');

  const csvPath = path.resolve(__dirname, '../../docs/snmp-oids/error_dictionary_import.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn(`[Seed] Không tìm thấy file CSV tại ${csvPath}`);
    return 0;
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return 0;

  let upsertCount = 0;

  // Header: vendor,errorCode,errorName,affectedSubsystem,severity,description
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Xử lý chuỗi CSV có dấu ngoặc kép bọc mô tả
    const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),(.*)$/);
    if (!match) continue;

    const vendor = match[1].trim();
    const rawCode = match[2].trim();
    const canonicalCode = match[3].trim();
    const subsystem = match[4].trim();
    const severity = match[5].trim().toLowerCase();
    let descriptionVi = match[6].trim();

    if (descriptionVi.startsWith('"') && descriptionVi.endsWith('"')) {
      descriptionVi = descriptionVi.slice(1, -1).replace(/""/g, '"').trim();
    }

    const isPaperJam =
      subsystem.toLowerCase().includes('paper') ||
      rawCode.toLowerCase().includes('jam') ||
      descriptionVi.toLowerCase().includes('kẹt giấy');

    const isCoverOpen =
      rawCode.toUpperCase().includes('DOOR') ||
      rawCode.toUpperCase().includes('COVER') ||
      descriptionVi.toLowerCase().includes('nắp') ||
      descriptionVi.toLowerCase().includes('cửa');

    const isConsumable =
      subsystem.toLowerCase().includes('developer') ||
      subsystem.toLowerCase().includes('drum') ||
      rawCode.toLowerCase().includes('toner') ||
      descriptionVi.toLowerCase().includes('mực');

    await prisma.errorDictionary.upsert({
      where: {
        vendor_rawCode: {
          vendor,
          rawCode,
        },
      },
      update: {
        canonicalCode,
        subsystem,
        descriptionVi,
        severity,
        isPaperJam,
        isCoverOpen,
        isConsumable,
      },
      create: {
        vendor,
        rawCode,
        canonicalCode,
        subsystem,
        descriptionVi,
        severity,
        isPaperJam,
        isCoverOpen,
        isConsumable,
      },
    });

    upsertCount++;
  }

  console.log(`[Seed] Hoàn tất nạp ${upsertCount} mã lỗi phần cứng vào bảng ErrorDictionary.`);
  return upsertCount;
}
