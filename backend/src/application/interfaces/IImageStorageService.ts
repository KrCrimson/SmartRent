export interface UploadResult {
  url: string;
  publicId: string;
}

export interface IImageStorageService {
  upload(buffer: Buffer, folder: string): Promise<UploadResult>;
  delete(publicId: string): Promise<boolean>;
  getUrl(publicId: string): string;
}
