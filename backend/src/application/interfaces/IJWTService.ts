/**
 * Interface del servicio JWT
 */
export interface IJWTService {
  /**
   * Generar access token
   */
  generateAccessToken(payload: { userId: string; email: string; role: string }): string;

  /**
   * Generar refresh token
   */
  generateRefreshToken(payload: { userId: string }): string;

  /**
   * Verificar y decodificar access token
   */
  verifyAccessToken(token: string): { userId: string; email: string; role: string };

  /**
   * Verificar y decodificar refresh token
   */
  verifyRefreshToken(token: string): { userId: string };
}
