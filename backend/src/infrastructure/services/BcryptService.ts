import { injectable } from 'tsyringe';
import bcrypt from 'bcryptjs';
import { IPasswordHashService } from '@application/interfaces/IPasswordHashService';

/**
 * Implementación del servicio de hashing con Bcrypt
 */
@injectable()
export class BcryptService implements IPasswordHashService {
  private readonly rounds: number;

  constructor() {
    this.rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  }

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.rounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
