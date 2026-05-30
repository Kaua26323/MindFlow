import { UserLoginUseCase } from './user-login.use-case.ts';
import { AppError } from '@/errors/app-error.ts';
import type { HashProviderContract } from '@/application/ports/hash.port.ts';
import type {
  UserRepository,
  UserLoginDTO,
} from '@/application/repositories/user.repository.ts';

describe('UserLoginUseCase (Unit)', () => {
  let sut: UserLoginUseCase;
  let userRepository: UserRepository;
  let hashProvider: HashProviderContract;

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      remove: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      findByEmail: vi.fn(),
    };

    hashProvider = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    sut = new UserLoginUseCase(userRepository, hashProvider);
  });

  const loginData: UserLoginDTO = {
    email: 'kaua123@example.com',
    password: 'correct_password123',
  };

  const mockUser = {
    id: 'user-1',
    name: 'Kauan souza',
    email: 'kaua123@example.com',
    password: 'hashed_password_stored_in_db',
    updatedAt: null,
    createdAt: new Date(),
  };

  it('should authenticate a user successfully with valid credentials', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(hashProvider.compare).mockResolvedValue(true);

    const result = await sut.execute(loginData);

    expect(result).toEqual({
      id: 'user-1',
      name: 'Kauan souza',
      email: 'kaua123@example.com',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
    expect(hashProvider.compare).toHaveBeenCalledWith(
      mockUser.password,
      loginData.password,
    );
  });

  it('should throw an AppError (400) if the email is not found', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(sut.execute(loginData)).rejects.toThrow(
      new AppError('Incorrect email or password', 400),
    );

    expect(hashProvider.compare).not.toHaveBeenCalled();
  });

  it('should throw an AppError (400) if the password does not match', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(hashProvider.compare).mockResolvedValue(false);

    await expect(sut.execute(loginData)).rejects.toThrow(
      new AppError('Incorrect email or password', 400),
    );

    expect(hashProvider.compare).toHaveBeenCalledWith(
      mockUser.password,
      loginData.password,
    );
  });
});
