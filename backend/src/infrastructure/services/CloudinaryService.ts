import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { IImageStorageService, UploadResult } from '@application/interfaces/IImageStorageService';
import { logger } from '@shared/utils/logger';

export class CloudinaryService implements IImageStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(buffer: Buffer, folder: string = 'departments'): Promise<UploadResult> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `smartrent/${folder}`,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto:good' },
            ],
          },
          (error, result: UploadApiResponse | undefined) => {
            if (error) {
              logger.error('Error al subir imagen a Cloudinary', { error: error.message });
              reject(error);
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            } else {
              reject(new Error('No se recibió respuesta de Cloudinary'));
            }
          }
        );

        uploadStream.end(buffer);
      });
    } catch (error: any) {
      logger.error('Error en CloudinaryService.upload', { error: error.message });
      throw new Error('Error al subir la imagen');
    }
  }

  async delete(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error: any) {
      logger.error('Error al eliminar imagen de Cloudinary', { 
        publicId, 
        error: error.message 
      });
      return false;
    }
  }

  getUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });
  }
}
