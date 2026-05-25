import type { HashProviderContract } from '@/application/ports/hash.port.ts';
import argon2 from 'argon2';

export class Argon2HashAdapter implements HashProviderContract {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async compare(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return false;
    }
  }
}
