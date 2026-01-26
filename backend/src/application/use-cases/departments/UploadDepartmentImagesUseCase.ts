import { IDepartmentRepository } from '@domain/repositories/IDepartmentRepository';
import { IImageStorageService } from '@application/interfaces/IImageStorageService';
import { NotFoundError } from '@domain/errors/NotFoundError';
import { Department } from '@domain/entities/Department';

export class UploadDepartmentImagesUseCase {
  constructor(
    private departmentRepository: IDepartmentRepository,
    private imageStorageService: IImageStorageService
  ) {}

  async execute(departmentId: string, imageBuffers: Buffer[]): Promise<Department> {
    // Verificar que el departamento existe
    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundError('Departamento no encontrado');
    }

    // Subir cada imagen a Cloudinary
    const uploadPromises = imageBuffers.map(buffer =>
      this.imageStorageService.upload(buffer, 'departments')
    );

    const uploadResults = await Promise.all(uploadPromises);
    const newImageUrls = uploadResults.map(result => result.url);

    // Agregar las nuevas URLs al array de imágenes del departamento
    const updatedImages = [...department.images, ...newImageUrls];

    // Actualizar el departamento
    const updated = await this.departmentRepository.update(departmentId, {
      images: updatedImages,
    });

    if (!updated) {
      throw new Error('Error al actualizar el departamento con las imágenes');
    }

    return updated;
  }
}
