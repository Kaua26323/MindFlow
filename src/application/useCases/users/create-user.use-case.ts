import { AppError } from '@/errors/app-error.ts';
import type { HashProviderContract } from '../../ports/hash.port.ts';

import type {
  CreateUserDTO,
  UserRepository,
} from '../../repositories/user.repository.ts';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashProvider: HashProviderContract,
  ) {}

  async execute(userData: CreateUserDTO) {
    const { name, email, password } = userData;

    // Validating business rules: Uniqueness - Fail-Fast
    const emailExist = await this.userRepository.findByEmail(email);
    if (emailExist) throw new AppError('This e-mail already exist!', 409);

    const nameExist = await this.userRepository.findByName(name);
    if (nameExist) throw new AppError('This name already exist!', 409);

    const hashPassword = await this.hashProvider.hash(password);

    const newUser = await this.userRepository.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    if (!newUser)
      throw new AppError('Internal error: User could not be created.', 500);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
  }
}
