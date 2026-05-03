import { makeRepositoryHarness } from '../utils/makeRepositoryHarness.ts';

describe('DrizzleFavoritesRepository (integration)', () => {
  const { cleanAll, userRepository, postRepository, favoritesRepository } =
    makeRepositoryHarness();

  const testData = {
    user_id: '',
    post_id: '',
  };

  beforeEach(async () => {
    await cleanAll();

    const user = await userRepository.create({
      name: 'favorites tests',
      email: 'favorites@gmail.com',
      password: '12345689',
    });

    const post = await postRepository.create({
      user_id: user!.id,
      text: 'Testing the favorites repository',
    });

    testData.user_id = user!.id;
    testData.post_id = post!.id;
  });

  afterAll(async () => {
    await cleanAll();
  });

  describe('addPost', async () => {
    it('should successfully favorite a post for a user', async () => {
      const results = await favoritesRepository.addPost(testData);

      expect(results).not.toBeNull();
      expect(results?.user_id).toBe(testData.user_id);
      expect(results?.post_id).toBe(testData.post_id);
      expect(results?.createdAt).toBeInstanceOf(Date);
    });

    it('should not throw if adding the same favorite twice (resilience check)', async () => {
      await favoritesRepository.addPost(testData);

      const secondAttempt = await favoritesRepository.addPost(testData);
      expect(secondAttempt).toBeNull();
    });
  });

  describe('getFavoritesPosts', () => {
    it('should return an array of favorites posts for a specific user', async () => {
      await favoritesRepository.addPost(testData);

      const results = await favoritesRepository.getFavoritesPosts(
        testData.user_id,
      );

      expect(results).toHaveLength(1);
      expect(results[0]!.user_id).toBe(testData.user_id);
      expect(results[0]!.post_id).toBe(testData.post_id);
    });

    it('should return an empty array if the user has no favorites posts', async () => {
      const results = await favoritesRepository.getFavoritesPosts(
        testData.user_id,
      );

      expect(results).toEqual([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('removePost', async () => {
    it('should remove a post from favorites and return the deleted record', async () => {
      await favoritesRepository.addPost(testData);

      const deleted = await favoritesRepository.removePost(testData);

      expect(deleted).not.toBeNull();
      expect(deleted?.user_id).toBe(testData.user_id);
      expect(deleted?.post_id).toBe(testData.post_id);

      const remaining = await favoritesRepository.getFavoritesPosts(
        testData.user_id,
      );
      expect(remaining).toEqual([]);
      expect(remaining).toHaveLength(0);
    });

    it('should return null when trying to remove a non-existent post from favorites', async () => {
      const result = await favoritesRepository.removePost({
        user_id: testData.user_id,
        post_id: '00000000-0000-0000-0000-000000000000',
      });

      expect(result).toBeNull();
    });
  });
});
