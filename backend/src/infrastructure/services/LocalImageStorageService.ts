import fs from 'fs';
import path from 'path';
import { IImageStorageService, UploadResult } from '@application/interfaces/IImageStorageService';
import { logger } from '@shared/utils/logger';

export class LocalImageStorageService implements IImageStorageService {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'public', 'uploads');
    this.baseUrl = `http://localhost:${process.env.PORT || '5000'}/uploads`;
    
    // Ensure directory exists
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(buffer: Buffer, folder: string = 'departments'): Promise<UploadResult> {
    try {
      const folderPath = path.join(this.baseDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = path.join(folderPath, fileName);
      
      fs.writeFileSync(filePath, buffer);

      return {
        url: `${this.baseUrl}/${folder}/${fileName}`,
        publicId: `${folder}/${fileName}`
      };
    } catch (error: any) {
      logger.error('Error en LocalImageStorageService.upload', { error: error.message });
      throw new Error('Error al guardar la imagen localmente');
    }
  }

  async delete(publicId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.baseDir, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (error: any) {
      logger.error('Error al eliminar imagen local', { 
        publicId, 
        error: error.message 
      });
      return false;
    }
  }

  getUrl(publicId: string): string {
    return `${this.baseUrl}/${publicId}`;
  }
}
