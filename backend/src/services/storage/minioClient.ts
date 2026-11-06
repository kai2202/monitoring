/**
 * Backend/src/services/storage/minioClient.ts
 *
 * Dịch vụ kết nối và lưu trữ tệp đính kèm MinIO S3 (FleetMonitor):
 * - Lưu trữ ảnh chụp hiện trường, biên bản nghiệm thu bản in test và nhật ký thiết bị.
 * - Tự động kiểm tra/khởi tạo Bucket (`fleetmonitor-proofs`) và sinh Presigned URL an toàn.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC): Báo lỗi minh bạch khi kho lưu trữ gián đoạn.
 */

import { Client as MinioClient } from 'minio';
import { env } from '../../config/env';

export class StorageService {
  private client: MinioClient;
  private bucket: string;
  private bucketInitialized = false;

  constructor() {
    this.bucket = env.MINIO_BUCKET;
    this.client = new MinioClient({
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
  }

  public async ensureBucket(): Promise<void> {
    if (this.bucketInitialized) return;
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
      console.log(`[StorageService] Đã khởi tạo bucket MinIO: ${this.bucket}`);
    }
    this.bucketInitialized = true;
  }

  public async uploadBuffer(
    buffer: Buffer,
    objectName: string,
    mimeType: string
  ): Promise<string> {
    try {
      await this.ensureBucket();
      await this.client.putObject(this.bucket, objectName, buffer, buffer.length, {
        'Content-Type': mimeType,
      });
      return objectName;
    } catch (err: any) {
      throw new Error(
        `Không thể kết nối kho lưu trữ MinIO S3 (${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${this.bucket}): ${err?.message || 'Lỗi mạng'}`
      );
    }
  }

  public async getPresignedUrl(objectName: string, expirySeconds = 15 * 60): Promise<string> {
    try {
      return await this.client.presignedGetObject(this.bucket, objectName, expirySeconds);
    } catch (err: any) {
      throw new Error(
        `Không thể tạo liên kết tải tệp từ MinIO S3 (${objectName}): ${err?.message || 'Lỗi kết nối'}`
      );
    }
  }
}

export const storageService = new StorageService();
export default storageService;
