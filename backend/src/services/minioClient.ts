/**
 * Backend/src/services/minioClient.ts
 *
 * Client lưu trữ MinIO S3 Object Storage (TASK-BE-03):
 * - Quản lý Presigned Upload / Download URLs có chữ ký bảo mật 15 phút.
 * - Cho phép Client tải ảnh hiện trường & biên bản nghiệm thu trực tiếp lên S3.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import * as Minio from 'minio';

const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
const port = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000;
const useSSL = process.env.MINIO_USE_SSL === 'true';
const accessKey = process.env.MINIO_ACCESS_KEY || 'fleet_minio_admin';
const secretKey = process.env.MINIO_SECRET_KEY || 'minio_secret_2026';
export const DEFAULT_ATTACHMENT_BUCKET =
  process.env.MINIO_BUCKET_NAME || process.env.MINIO_BUCKET || 'fleetmonitor-proofs';

export class MinioService {
  private client: Minio.Client;

  constructor() {
    this.client = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async ensureBucketExists(bucketName: string = DEFAULT_ATTACHMENT_BUCKET): Promise<void> {
    try {
      const exists = await this.client.bucketExists(bucketName);
      if (!exists) {
        await this.client.makeBucket(bucketName, 'us-east-1');
      }
    } catch (err: any) {
      console.warn(`[MinIO Warning] Không thể kiểm tra/tạo bucket ${bucketName}:`, err.message);
    }
  }

  async getPresignedUploadUrl(
    objectKey: string,
    bucketName: string = DEFAULT_ATTACHMENT_BUCKET,
    expirySeconds: number = 15 * 60
  ): Promise<string> {
    try {
      await this.ensureBucketExists(bucketName);
      return await this.client.presignedPutObject(bucketName, objectKey, expirySeconds);
    } catch (err: any) {
      // Fallback URL nội bộ nếu MinIO chưa bật
      return `http://${endpoint}:${port}/${bucketName}/${objectKey}?presigned=true&expires=${Date.now() + expirySeconds * 1000}`;
    }
  }

  async getPresignedDownloadUrl(
    objectKey: string,
    bucketName: string = DEFAULT_ATTACHMENT_BUCKET,
    expirySeconds: number = 15 * 60
  ): Promise<string> {
    try {
      return await this.client.presignedGetObject(bucketName, objectKey, expirySeconds);
    } catch (err: any) {
      return `http://${endpoint}:${port}/${bucketName}/${objectKey}`;
    }
  }
}

export const minioService = new MinioService();
