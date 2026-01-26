/**
 * Interface del servicio de hashing de passwords
 */
export interface IPasswordHashService {
  /**
   * Hashear un password
   */
  hash(password: string): Promise<string>;

  /**
   * Comparar un password con su hash
   */
  compare(password: string, hash: string): Promise<boolean>;
}
