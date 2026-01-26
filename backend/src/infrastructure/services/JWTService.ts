import { injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { IJWTService } from '@application/interfaces/IJWTService';

/**
 * Implementación del servicio JWT
 */
@injectable()
export class JWTService implements IJWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'default_secret';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  generateAccessToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry
    } as jwt.SignOptions);
  }

  generateRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry
    } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): { userId: string; email: string; role: string } {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as any;
      return {
        userId: decoded.userId
      };
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }
  }
}
