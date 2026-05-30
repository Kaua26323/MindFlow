import type { SearchParams } from '@/application/repositories/post.repository.ts';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';
import type { CreatePostDTO } from '@/application/repositories/post.repository.ts';

describe('DrizzlePostRepository (integration)', () => {
  const { userRepository, postRepository, clean } = makeRepositoryHarness();
  let testUserId: string;

  beforeEach(async () => {
    await clean(['users', 'posts']);
    const user = await userRepository.create({
      name: 'tests',
      email: 'test@gmail.com',
      password: '123456',
    });

    testUserId = user!.id;
  });

  afterAll(async () => {
    await clean(['users', 'posts']);
  });

  const getPostData = (id: string): CreatePostDTO => ({
    text: 'Hello World MindFlow',
    user_id: id,
  });

  const searchParams: SearchParams = {
    page: 1,
    search: '',
    order: 'DESC',
  };

  describe('create', () => {
    it('should successfully create and return a new post', async () => {
      const data = getPostData(testUserId);
      const result = await postRepository.create(data);

      expect(result).not.toBeNull();
      expect(result?.id).toBeDefined();
      expect(result?.text).toBe(data.text);
      expect(result?.user_id).toBe(testUserId);
      expect(result?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getAll', () => {
    it('should return an array of posts ordered by most recent', async () => {
      await postRepository.create(getPostData(testUserId));
      await new Promise((resolve) => setTimeout(resolve, 100)); // Short delay to ensure timestamp order.
      await postRepository.create({ text: 'Second Post', user_id: testUserId });

      const results = await postRepository.getAll(searchParams);

      expect(results.total).toBe(2);
      expect(results.data).toHaveLength(2);
      expect(results.data[0]?.text).toBe('Second Post'); // Must be the most recent post.
      expect(results.data[1]?.text).toBe('Hello World MindFlow');
    });

    it('should return an empty array if no posts exist', async () => {
      const results = await postRepository.getAll(searchParams);

      expect(results.total).toBe(0);
      expect(results.data).toEqual([]);
    });
  });

  describe('getOneById', () => {
    it('should return the post object when provided a valid ID', async () => {
      const created = await postRepository.create(getPostData(testUserId));
      const result = await postRepository.getOneById(created!.id);

      expect(result?.id).toBe(created?.id);
      expect(result?.text).toBe(created?.text);
    });

    it('should return null if the post ID does not exist', async () => {
      const result = await postRepository.getOneById(
        '00000000-0000-0000-0000-000000000000',
      );
      expect(result).toBeNull();
    });
  });
  describe('getAllByUserId', () => {
    it('should return only posts belonging to a specific user', async () => {
      // Create post for the main user.
      await postRepository.create(getPostData(testUserId));

      // Create another user and an associated post.
      const otherUser = await userRepository.create({
        name: 'Other User',
        email: 'other123@gmail.com',
        password: '123',
      });

      await postRepository.create({
        text: 'Other post',
        user_id: otherUser!.id,
      });

      const results = await postRepository.getAllByUserId(testUserId, searchParams);

      expect(results.total).toBe(1);
      expect(results.data).toHaveLength(1);
      expect(results.data[0]!.user_id).toBe(testUserId);
    });
  });
  describe('update', () => {
    it('should update the post text and return the updated object', async () => {
      const created = await postRepository.create(getPostData(testUserId));
      const newText = 'Updated content';

      expect(created?.updated_at).toBeNull();

      const result = await postRepository.update(created!.id, {
        text: newText,
      });

      expect(result?.text).toBe(newText);
      expect(result?.id).toBe(created?.id);
      expect(result?.updated_at).toBeInstanceOf(Date);
    });

    it('should update allowed fields and ignore protected ones', async () => {
      const created = await postRepository.create(getPostData(testUserId));

      await postRepository.update(created!.id, {
        id: 'new-id-attempt', // Protected
        user_id: 'new-user-attempt', // Protected
        createdAt: new Date(232131231), // Protected
        text: 'Security check', // Allowed
      });

      const updated = await postRepository.getOneById(created!.id);

      expect(updated?.id).toBe(created?.id);
      expect(updated?.user_id).toBe(created?.user_id);
      expect(updated?.text).toBe('Security check');
      expect(updated?.updated_at).toBeInstanceOf(Date);
      expect(updated?.createdAt).toStrictEqual(created?.createdAt);
    });
  });
  describe('remove', () => {
    it('should remove the post from database and return the deleted data', async () => {
      const created = await postRepository.create(getPostData(testUserId));

      const deleted = await postRepository.remove(created!.id);
      expect(deleted?.id).toBe(created?.id);

      const findAgain = await postRepository.getOneById(created!.id);
      expect(findAgain).toBeNull();
    });
  });
});
