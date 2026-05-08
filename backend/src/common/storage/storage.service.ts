import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client?: S3Client;
  private readonly bucket?: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.getConfig('STORAGE_ACCESS_KEY_ID', 'S3_ACCESS_KEY');
    const secretAccessKey = this.getConfig('STORAGE_SECRET_ACCESS_KEY', 'S3_SECRET_KEY');
    this.bucket = this.getConfig('STORAGE_BUCKET', 'S3_BUCKET');
    this.publicBaseUrl = this.getConfig('STORAGE_PUBLIC_BASE_URL', 'S3_PUBLIC_BASE_URL');

    if (accessKeyId && secretAccessKey && this.bucket) {
      this.client = new S3Client({
        region: this.getConfig('STORAGE_REGION', 'S3_REGION') ?? 'eu-central-1',
        endpoint: this.getConfig('STORAGE_ENDPOINT', 'S3_ENDPOINT') || undefined,
        forcePathStyle: this.configService.get<string>('STORAGE_FORCE_PATH_STYLE') === 'true',
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  isConfigured() {
    return Boolean(this.client && this.bucket && this.publicBaseUrl);
  }

  async createPresignedUploadUrl(params: { key: string; contentType: string; sizeBytes?: number }) {
    if (!this.client || !this.bucket || !this.publicBaseUrl) {
      return {
        uploadUrl: `https://example.local/upload/${params.key}`,
        publicUrl: `https://example.local/public/${params.key}`,
        storageKey: params.key,
        mode: 'mock',
      };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType,
      ContentLength: params.sizeBytes,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 300 });
    return {
      uploadUrl,
      publicUrl: `${this.publicBaseUrl.replace(/\/$/, '')}/${params.key}`,
      storageKey: params.key,
      mode: 's3',
    };
  }

  async objectExists(key: string) {
    if (!this.client || !this.bucket) return true;
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch (error) {
      this.logger.warn(`S3 object not found or not readable: ${key}`);
      return false;
    }
  }

  async deleteObject(key: string) {
    if (!this.client || !this.bucket) return;
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  private getConfig(primary: string, fallback: string) {
    return this.configService.get<string>(primary) || this.configService.get<string>(fallback);
  }
}
