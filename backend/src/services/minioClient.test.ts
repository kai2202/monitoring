/**
 * Backend/src/services/minioClient.test.ts
 *
 * Kiểm thử đơn vị cho MinioService (TASK-BE-03):
 * - Kiểm tra tạo bucket nếu chưa tồn tại (ensureBucketExists).
 * - Kiểm tra sinh Presigned Upload URL có chữ ký bảo mật 15 phút.
 * - Kiểm tra sinh Presigned Download URL an toàn.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MinioService } from './minioClient';

describe('MinioService (S3 Object Storage)', () => {
  let service: MinioService;
  let mockClient: any;

  beforeEach(() => {
    service = new MinioService();
    mockClient = (service as any).client;

    mockClient.bucketExists = vi.fn().mockResolvedValue(true);
    mockClient.makeBucket = vi.fn().mockResolvedValue(undefined);
    mockClient.presignedPutObject = vi.fn().mockResolvedValue('https://s3.local/upload-presigned-url');
    mockClient.presignedGetObject = vi.fn().mockResolvedValue('https://s3.local/download-presigned-url');
  });

  it('phải tạo bucket mới khi bucketExists trả về false', async () => {
    mockClient.bucketExists = vi.fn().mockResolvedValue(false);

    await service.ensureBucketExists('test-bucket');

    expect(mockClient.bucketExists).toHaveBeenCalledWith('test-bucket');
    expect(mockClient.makeBucket).toHaveBeenCalledWith('test-bucket', 'us-east-1');
  });

  it('không tạo lại bucket khi bucket đã tồn tại', async () => {
    mockClient.bucketExists = vi.fn().mockResolvedValue(true);

    await service.ensureBucketExists('existing-bucket');

    expect(mockClient.bucketExists).toHaveBeenCalledWith('existing-bucket');
    expect(mockClient.makeBucket).not.toHaveBeenCalled();
  });

  it('phải sinh Presigned Upload URL hợp lệ', async () => {
    const url = await service.getPresignedUploadUrl('proofs/task-1/test.png', 'test-bucket', 900);

    expect(url).toBe('https://s3.local/upload-presigned-url');
    expect(mockClient.presignedPutObject).toHaveBeenCalledWith('test-bucket', 'proofs/task-1/test.png', 900);
  });

  it('phải sinh Presigned Download URL hợp lệ', async () => {
    const url = await service.getPresignedDownloadUrl('proofs/task-1/test.png', 'test-bucket', 900);

    expect(url).toBe('https://s3.local/download-presigned-url');
    expect(mockClient.presignedGetObject).toHaveBeenCalledWith('test-bucket', 'proofs/task-1/test.png', 900);
  });
});
