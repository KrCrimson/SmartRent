/**
 * Value Object: Password
 * Representa una contraseña en el sistema
 */
export class Password {
  private readonly value: string;
  private readonly isHashed: boolean;

  constructor(password: string, isHashed: boolean = false) {
    if (!isHashed && !this.isValid(password)) {
      throw new Error('Password debe tener al menos 8 caracteres');
    }
    this.value = password;
    this.isHashed = isHashed;
  }

  private isValid(password: string): boolean {
    return password.length >= 8;
  }

  getValue(): string {
    return this.value;
  }

  isPasswordHashed(): boolean {
    return this.isHashed;
  }
}
