interface HashProviderContract {
  hash(password: string): Promise<string>;
  compare(hash: string, password: string): Promise<boolean>;
}

export type { HashProviderContract };
