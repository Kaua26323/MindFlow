import { AppError } from '@/errors/app-error.ts';
import type { HashProviderContract } from '@/application/ports/hash.port.ts';
import type {
  UserLoginDTO,
  UserRepository,
} from '@/application/repositories/user.repository.ts';

export class UserLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashProvider: HashProviderContract,
  ) {}

  async execute(userData: UserLoginDTO) {
    const { email, password } = userData;

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError('Incorrect email or password', 400);

    const verifyPassword = await this.hashProvider.compare(user.password, password);

    if (!verifyPassword) throw new AppError('Incorrect email or password', 400);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
