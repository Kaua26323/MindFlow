import { ZodError, type ZodType } from 'zod';
import type { ValidatorProviderContract } from '@/application/ports/validator.port.ts';
import { AppError } from '@/application/errors/app-error.ts';

export class ZodValidatorAdapter implements ValidatorProviderContract {
  async validate<T>(schema: ZodType<T>, data: unknown): Promise<T> {
    try {
      return schema.parse(data);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];

        const message = firstIssue
          ? `${firstIssue.message}`
          : 'Validation failed';

        throw new AppError(message);
      }

      throw error;
    }
  }
}
