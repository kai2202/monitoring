/**
 * Backend/src/middlewares/uploadMiddleware.ts
 *
 * Middleware Multer xử lý tiếp nhận file đính kèm bằng chứng sửa chữa (FleetMonitor):
 * - Giới hạn kích thước tối đa 10MB.
 * - Chấp nhận ảnh (JPEG, PNG, WEBP), tài liệu PDF và file nhật ký (.log, .txt, .csv, .json).
 * - Kèm wrapper trả lỗi JSON 400 tiếng Việt rõ ràng khi vượt dung lượng hoặc sai định dạng.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/octet-stream',
]);

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'pdf', 'log', 'txt', 'csv', 'json']);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
  if (ALLOWED_MIMES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP, PDF, LOG, TXT hoặc CSV.'));
  }
};

export const uploadAttachment = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Tối đa 10MB
  },
  fileFilter,
});

export const handleAttachmentUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadAttachment.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Dung lượng tệp vượt quá giới hạn tối đa 10MB.' });
      }
      return res.status(400).json({ error: `Lỗi tải tệp lên: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message || 'Tệp đính kèm không hợp lệ.' });
    }
    next();
  });
};
