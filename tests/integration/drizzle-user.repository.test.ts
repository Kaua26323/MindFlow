import { makeRepositoryHarness } from '../utils/makeRepositoryHarness.ts';
import type { NewUser } from '@/infra/db/drizzle/schemas/users.schema.ts';

describe('DrizzleUserRepository (integration)', () => {
  const { userRepository, clean } = makeRepositoryHarness();

  beforeEach(async () => {
    await clean(['users']);
  });
  afterAll(async () => {
    await clean(['users']);
  });

  const userData: NewUser = {
    name: 'test',
    email: 'test123@gmail.com',
    password: 'test123',
  };

  describe('create', () => {
    it('should successfully create and return a new user', async () => {
      const results = await userRepository.create(userData);
      expect(results).not.toBeNull();
      expect(results?.id).toBeDefined();
      expect(results?.email).toBe(userData.email);
      expect(results?.password).toBe(userData.password);
      expect(results?.createdAt).toBeInstanceOf(Date);
    });

    it('should fail when creating a user with a duplicate email', async () => {
      await userRepository.create(userData);

      await expect(
        userRepository.create({ ...userData, name: 'Other name' }),
      ).rejects.toThrow();
    });

    it('should fail when creating a user with a duplicate name', async () => {
      await userRepository.create(userData);

      await expect(
        userRepository.create({ ...userData, email: 'other123@gmail.com' }),
      ).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should return the user object if it exists', async () => {
      await userRepository.create(userData);

      const results = await userRepository.findByEmail(userData.email);
      expect(results).not.toBeNull();
      expect(results?.id).toBeDefined();
      expect(results?.email).toBe(userData.email);
      expect(results?.password).toBe(userData.password);
      expect(results?.createdAt).toBeInstanceOf(Date);
    });

    it('should return "null" if the user doesn"t exist', async () => {
      await userRepository.create(userData);

      const results = await userRepository.findByEmail('otheremail@gmail.com');
      expect(results).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return the user object if it exists', async () => {
      await userRepository.create(userData);

      const results = await userRepository.findByName(userData.name);
      expect(results).not.toBeNull();
      expect(results?.id).toBeDefined();
      expect(results?.email).toBe(userData.email);
      expect(results?.password).toBe(userData.password);
      expect(results?.createdAt).toBeInstanceOf(Date);
    });

    it('should return "null" if the user doesn"t exist', async () => {
      await userRepository.create(userData);

      const results = await userRepository.findByName('Other Name');
      expect(results).toBeNull();
    });
  });

  describe('remove', () => {
    it('should return the deleted user data and remove it from DB', async () => {
      const user = await userRepository.create(userData);

      expect(user?.id).toBeDefined();

      const deletedUser = await userRepository.remove(user!.id);
      expect(deletedUser?.id).toBe(user?.id);

      expect(deletedUser).not.toBeNull();
      expect(deletedUser?.id).toBe(user?.id);

      const findInDb = await userRepository.findByEmail(userData.email);
      expect(findInDb).toBeNull();
    });
  });
});
