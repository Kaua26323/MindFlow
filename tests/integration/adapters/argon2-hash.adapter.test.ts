import { Argon2HashAdapter } from '@/infra/adapters/argon2-hash.adapter.ts';

describe('Argon2HashAdapter (integration)', () => {
  const sut = new Argon2HashAdapter();

  it('should generate a secure hash from a plain text password', async () => {
    const password = 'any_secure_password123';

    const hash = await sut.hash(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
  });

  it('should return true when password matches the valid hash', async () => {
    const password = 'my_secret_password';

    const hash = await sut.hash(password);
    const isValid = await sut.compare(hash, password);

    expect(isValid).toBe(true);
  });

  it('should return false when password does not match the hash', async () => {
    const password = 'correct_password';
    const wrongPassword = 'wrong_password';

    const hash = await sut.hash(password);
    const isValid = await sut.compare(hash, wrongPassword);

    expect(isValid).toBe(false);
  });

  it('should handle false safely or throw mapping errors if hash is malformed', async () => {
    // Testamos o comportamento da biblioteca com dados corrompidos
    // para saber se precisamos envelopar o método em um try/catch no adapter
    const isValid = await sut.compare('invalid-hash-format', 'any_password');

    expect(isValid).toBe(false);
    // Nota: Se o argon2 estourar um erro em vez de retornar false,
    // este teste falhará, avisando que você precisa tratar o erro no adapter.
  });
});
