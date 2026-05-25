interface ValidatorProviderContract {
  validate<T>(schema: unknown, data: unknown): Promise<T>;
}

export type { ValidatorProviderContract };
