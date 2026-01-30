import { ObjectId } from 'mongodb';
import { Request, Response, NextFunction } from 'express';

/**
 * Validar si un string es un ObjectId válido de MongoDB
 */
export function validateObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // Verificar longitud (24 caracteres hex)
  if (id.length !== 24) {
    return false;
  }

  // Verificar que solo contenga caracteres hexadecimales
  const hexRegex = /^[0-9a-fA-F]{24}$/;
  if (!hexRegex.test(id)) {
    return false;
  }

  try {
    // Intentar crear ObjectId para validación adicional
    new ObjectId(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Esquema de validación simple
 */
interface ValidationSchema {
  body?: {
    required?: string[];
    properties?: Record<string, any>;
  };
  query?: {
    properties?: Record<string, any>;
  };
  params?: {
    properties?: Record<string, any>;
  };
}

/**
 * Middleware básico de validación
 * Versión simplificada sin dependencias externas
 */
export const validateRequestMiddleware = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validaciones básicas para el body
    if (schema.body && req.body) {
      if (schema.body.required) {
        for (const field of schema.body.required) {
          if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
            errors.push(`${field} es requerido`);
          }
        }
      }

      // Validar tipos básicos si se especifican
      if (schema.body.properties) {
        Object.entries(schema.body.properties).forEach(([field, rules]) => {
          const value = req.body[field];
          
          if (value !== undefined && value !== null) {
            if (rules.type === 'string' && typeof value !== 'string') {
              errors.push(`${field} debe ser una cadena de texto`);
            }
            if (rules.type === 'number' && typeof value !== 'number') {
              errors.push(`${field} debe ser un número`);
            }
            if (rules.enum && !rules.enum.includes(value)) {
              errors.push(`${field} debe ser uno de: ${rules.enum.join(', ')}`);
            }
            if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
              errors.push(`${field} no puede exceder ${rules.maxLength} caracteres`);
            }
            if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
              errors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
            }
            if (rules.pattern && typeof value === 'string' && !new RegExp(rules.pattern).test(value)) {
              errors.push(`${field} tiene un formato inválido`);
            }
          }
        });
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Errores de validación',
        details: errors
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para validar ObjectId en parámetros
 */
export const validateObjectIdMiddleware = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    
    if (!validateObjectId(id)) {
      res.status(400).json({
        success: false,
        error: `${paramName} inválido`
      });
      return;
    }

    next();
  };
};

/**
 * Validar email
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar teléfono chileno
 */
export function validateChileanPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Formatos válidos: +56912345678, 912345678, 22345678
  const phoneRegex = /^(\+56)?[2-9]\d{7,8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validar RUT chileno
 */
export function validateRUT(rut: string): boolean {
  if (!rut || typeof rut !== 'string') {
    return false;
  }

  // Limpiar RUT (quitar puntos, guiones y espacios)
  const cleanRut = rut.replace(/[.-\s]/g, '').toLowerCase();
  
  // Verificar formato (debe tener entre 8-9 caracteres)
  if (cleanRut.length < 8 || cleanRut.length > 9) {
    return false;
  }

  // Separar número del dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const checkDigit = cleanRut.slice(-1);

  // Verificar que el número sea numérico
  if (!/^\d+$/.test(rutNumber)) {
    return false;
  }

  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculatedCheckDigit = remainder === 0 ? '0' : remainder === 1 ? 'k' : (11 - remainder).toString();

  return checkDigit === calculatedCheckDigit;
}

/**
 * Validar password
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password es requerido'] };
  }

  if (password.length < 8) {
    errors.push('Password debe tener al menos 8 caracteres');
  }

  if (password.length > 128) {
    errors.push('Password no puede tener más de 128 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password debe tener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password debe tener al menos una letra minúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Password debe tener al menos un número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password debe tener al menos un carácter especial');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Sanitizar string para prevenir inyecciones
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover eventos onclick, onload, etc.
    .slice(0, 1000); // Limitar longitud máxima
}

/**
 * Validar URL
 */
export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validar rango de fechas
 */
export function validateDateRange(from: string | Date, to: string | Date): boolean {
  try {
    const fromDate = typeof from === 'string' ? new Date(from) : from;
    const toDate = typeof to === 'string' ? new Date(to) : to;

    // Verificar que sean fechas válidas
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return false;
    }

    // Verificar que 'from' sea anterior a 'to'
    if (fromDate >= toDate) {
      return false;
    }

    // Verificar que no sea un rango muy grande (más de 1 año)
    const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 año en ms
    if (toDate.getTime() - fromDate.getTime() > maxRange) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validar archivo subido
 */
export interface FileValidationOptions {
  maxSize?: number; // en bytes
  allowedTypes?: string[]; // tipos MIME permitidos
  allowedExtensions?: string[]; // extensiones permitidas
}

export function validateFile(file: any, options: FileValidationOptions = {}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const {
    maxSize = 5 * 1024 * 1024, // 5MB por defecto
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  } = options;

  if (!file) {
    return { isValid: false, errors: ['Archivo es requerido'] };
  }

  // Validar tamaño
  if (file.size > maxSize) {
    errors.push(`Archivo demasiado grande. Máximo: ${maxSize / 1024 / 1024}MB`);
  }

  // Validar tipo MIME
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(`Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(', ')}`);
  }

  // Validar extensión
  const extension = '.' + file.originalname.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    errors.push(`Extensión no permitida. Extensiones válidas: ${allowedExtensions.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Escape HTML para prevenir XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}