import { IDepartmentRepository } from '@domain/repositories/IDepartmentRepository';
import { IImageStorageService } from '@application/interfaces/IImageStorageService';
import { NotFoundError } from '@domain/errors/NotFoundError';
import { Department } from '@domain/entities/Department';

export class DeleteDepartmentImageUseCase {
  constructor(
    private departmentRepository: IDepartmentRepository,
    private imageStorageService: IImageStorageService
  ) {}

  async execute(departmentId: string, imageUrl: string): Promise<Department> {
    // Verificar que el departamento existe
    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundError('Departamento no encontrado');
    }

    // Verificar que la imagen existe en el departamento
    if (!department.images.includes(imageUrl)) {
      throw new NotFoundError('Imagen no encontrada en este departamento');
    }

    // Extraer el publicId de la URL de Cloudinary
    // URL format: https://res.cloudinary.com/cloud/image/upload/v123/folder/publicId.ext
    const urlParts = imageUrl.split('/');
    const fileWithExt = urlParts[urlParts.length - 1];
    const publicId = `smartrent/departments/${fileWithExt.split('.')[0]}`;

    // Eliminar de Cloudinary
    await this.imageStorageService.delete(publicId);

    // Remover la URL del array de imágenes
    const updatedImages = department.images.filter(img => img !== imageUrl);

    // Actualizar el departamento
    const updated = await this.departmentRepository.update(departmentId, {
      images: updatedImages,
    });

    if (!updated) {
      throw new Error('Error al actualizar el departamento');
    }

    return updated;
  }
}
