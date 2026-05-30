// tests/integration/controllers/post.controller.spec.ts
import { app } from '@/app.ts';
import request from 'supertest';
import { expect, describe, it, beforeAll } from 'vitest';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';
import { getAuthenticatedSessionAndCsrf } from '../../utils/auth-helpers.ts';

describe('PostController Integration Tests', () => {
  const { postRepository, cleanAll, clean } = makeRepositoryHarness();

  let authCookies: string[] = [];
  let currentUserId: string;
  let csrfToken: string;

  beforeAll(async () => {
    await cleanAll();
    const authState = await getAuthenticatedSessionAndCsrf();

    authCookies = authState.authCookies;
    currentUserId = authState.currentUserId;
    csrfToken = authState.csrfToken!;
  });

  beforeEach(async () => {
    await clean(['posts']);
  });

  afterAll(async () => {
    await cleanAll();
  });

  describe('GET /new-post', () => {
    it('should render the create post page for authenticated users', async () => {
      const response = await request(app)
        .get('/new-post')
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(response.text).toContain('New Post');
    });
  });

  describe('POST /create-post', () => {
    it('should successfully create a post and redirect to dashboard', async () => {
      const postText = 'Integration test post content.';

      const response = await request(app)
        .post('/create-post')
        .set('Cookie', authCookies)
        .send({
          _csrf: csrfToken,
          user_id: currentUserId,
          text: postText,
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/dashboard');

      const posts = await postRepository.getAllByUserId(currentUserId, {
        page: 1,
        search: '',
        order: 'DESC',
      });

      expect(posts.data.length).toBeGreaterThan(0);
      expect(posts.data[0]?.text).toBe(postText);
    });

    it('should fail validation when text is empty and redirect to /new-post', async () => {
      const response = await request(app)
        .post('/create-post')
        .set('Cookie', authCookies)
        .send({
          _csrf: csrfToken,
          text: '', // Invalid payload
          user_id: currentUserId,
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/new-post');
    });
  });

  describe('GET /edit-post/:id & POST /update-post', () => {
    it('should render the edit page with the target post data', async () => {
      const post = await postRepository.create({
        text: 'Original Text',
        user_id: currentUserId,
      });

      const response = await request(app)
        .get(`/edit-post/${post!.id}`)
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Original Text');
    });

    it('should update the post and redirect to dashboard', async () => {
      const post = await postRepository.create({
        text: 'Text to be updated',
        user_id: currentUserId,
      });

      const updatedText = 'Updated Integration Text';

      const response = await request(app)
        .post('/update-post')
        .set('Cookie', authCookies)
        .send({
          _csrf: csrfToken,
          user_id: currentUserId,
          post_id: post!.id,
          text: updatedText,
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/dashboard');

      const updatedPost = await postRepository.getOneById(post!.id);
      expect(updatedPost?.text).toBe(updatedText);
    });
  });

  describe('DELETE /delete-post/:id', () => {
    it('should delete the post and redirect to dashboard', async () => {
      const post = await postRepository.create({
        text: 'Post to be deleted',
        user_id: currentUserId,
      });

      const response = await request(app)
        .delete(`/delete-post/${post!.id}`)
        .set('Cookie', authCookies)
        .send({
          _csrf: csrfToken,
          user_id: currentUserId,
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/dashboard');

      const deletedPost = await postRepository.getOneById(post!.id);
      expect(deletedPost).toBeNull();
    });
  });
});
