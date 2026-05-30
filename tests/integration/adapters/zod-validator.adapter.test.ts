import { z } from 'zod';
import { AppError } from '@/errors/app-error.ts';
import { ZodValidatorAdapter } from '@/infra/adapters/zod-validator.adapter.ts';

describe('ZodValidatorAdapter', () => {
  const sut = new ZodValidatorAdapter();

  it('should return the validated data successfully', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const validData = { name: 'Kauan Souza', age: 30 };

    const result = await sut.validate(schema, validData);

    expect(result).toEqual(validData);
  });

  it('should throw an AppError with the first error message when validation fails', async () => {
    const schema = z.object({
      name: z.string().min(3, 'Name must be at least 3 characters.'),
      age: z.number().min(18, 'Minimum age is 18.'),
    });

    const invalidData = { name: 'Ka', age: 15 };

    const promise = sut.validate(schema, invalidData);

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toThrow('Name must be at least 3 characters.');
  });

  it('should rethrow the original exception if the error is not an instance of ZodError', async () => {
    const fakeSchema = {
      parse: () => {
        throw new Error('Internal error!');
      },
    } as any;

    const promise = sut.validate(fakeSchema, {});

    await expect(promise).rejects.toBeInstanceOf(Error);
    await expect(promise).rejects.toThrow('Internal error!');
  });
});
