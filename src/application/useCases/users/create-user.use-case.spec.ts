import { AppError } from '@/errors/app-error.ts';
import { CreateUserUseCase } from './create-user.use-case.ts';

import type { HashProviderContract } from '@/application/ports/hash.port.ts';
import type {
  CreateUserDTO,
  UserRepository,
} from '@/application/repositories/user.repository.ts';

describe('CreateUserUseCase (Unit)', () => {
  let sut: CreateUserUseCase;
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

    sut = new CreateUserUseCase(userRepository, hashProvider);
  });

  const userData: CreateUserDTO = {
    name: 'Kauã Souza',
    email: 'kaua@example.com',
    password: 'secure_password123',
  };

  const mockUserCreated = {
    id: 'user-1',
    name: 'Kauã Souza',
    email: 'kaua@example.com',
    password: 'hashed_password',
    updatedAt: null,
    createdAt: new Date(),
  };

  it('should create a user successfully when all business rules are met', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.findByName).mockResolvedValue(null);
    vi.mocked(hashProvider.hash).mockResolvedValue('hashed_password');
    vi.mocked(userRepository.create).mockResolvedValue(mockUserCreated);

    const result = await sut.execute(userData);

    expect(result).toEqual({
      id: 'user-1',
      name: 'Kauã Souza',
      email: 'kaua@example.com',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(userRepository.findByName).toHaveBeenCalledWith(userData.name);
    expect(hashProvider.hash).toHaveBeenCalledWith(userData.password);
    expect(userRepository.create).toHaveBeenCalledWith({
      name: userData.name,
      email: userData.email,
      password: 'hashed_password',
    });
  });

  it('should throw an AppError (409) if the e-mail already exists', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUserCreated);

    await expect(sut.execute(userData)).rejects.toThrow(
      new AppError('This e-mail already exist!', 409),
    );

    expect(userRepository.findByName).not.toHaveBeenCalled();
    expect(hashProvider.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an AppError (409) if the name already exists', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.findByName).mockResolvedValue(mockUserCreated);

    await expect(sut.execute(userData)).rejects.toThrow(
      new AppError('This name already exist!', 409),
    );

    expect(hashProvider.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an AppError (500) if user repository fails to create the user', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.findByName).mockResolvedValue(null);
    vi.mocked(hashProvider.hash).mockResolvedValue('hashed_password');
    vi.mocked(userRepository.create).mockResolvedValue(null);

    await expect(sut.execute(userData)).rejects.toThrow(
      new AppError('Internal error: User could not be created.', 500),
    );
  });
});
