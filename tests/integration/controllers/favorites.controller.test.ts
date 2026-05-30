import { app } from '@/app.ts';
import request from 'supertest';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';
import { getAuthenticatedSessionAndCsrf } from '../../utils/auth-helpers.ts';
import { expect, describe, it, beforeAll, beforeEach, afterAll } from 'vitest';

describe('FavoriteController Integration Tests', () => {
  const { postRepository, favoritesRepository, cleanAll, clean } =
    makeRepositoryHarness();

  let authCookies: string[] = [];
  let currentUserId: string = '';
  let csrfToken: string = '';

  beforeAll(async () => {
    await cleanAll();

    const authState = await getAuthenticatedSessionAndCsrf();
    authCookies = authState.authCookies;
    currentUserId = authState.currentUserId;
    csrfToken = authState.csrfToken!;
  });

  beforeEach(async () => {
    await clean(['favorites', 'favorites']);
  });

  afterAll(async () => {
    await cleanAll();
  });

  describe('POST /favorite/add', () => {
    it('should successfully add a post to favorites and redirect to home (/)', async () => {
      const post = await postRepository.create({
        text: 'A great post to be favorited',
        user_id: currentUserId,
      });

      const response = await request(app)
        .post('/favorite/add')
        .set('Cookie', authCookies)
        .send({
          _csrf: csrfToken,
          postID: post!.id,
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/');

      const userFavorites = await favoritesRepository.getFavoritesPosts(
        currentUserId,
        {
          page: 1,
          order: 'DESC',
        },
      );
      expect(userFavorites.data.length).toBeGreaterThan(0);
      expect(userFavorites.data[0]?.post_id).toBe(post!.id);
    });

    it('should fail validation if postID is missing and redirect back to home', async () => {
      const response = await request(app)
        .post('/favorite/add')
        .set('Cookie', authCookies)
        .send({
          _csrf: csrfToken,
          // postID explicitly omitted
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/');
    });
  });

  describe('GET /favorites', () => {
    it('should render the favorites page with status 200', async () => {
      const response = await request(app)
        .get('/favorites')
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(response.text).toContain('My Favorites');
    });
  });

  describe('DELETE /favorite/remove/:id', () => {
    it('should successfully remove a post from favorites and redirect to /favorites', async () => {
      const post = await postRepository.create({
        text: 'Post to be removed from favorites',
        user_id: currentUserId,
      });

      await favoritesRepository.addPost({
        user_id: currentUserId,
        post_id: post!.id,
      });

      const response = await request(app)
        .delete(`/favorite/remove/${post!.id}`)
        .set('Cookie', authCookies)
        .send({
          _csrf: csrfToken,
          user_id: currentUserId,
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/favorites');

      const userFavorites = await favoritesRepository.getFavoritesPosts(
        currentUserId,
        { page: 1, order: 'DESC' },
      );

      expect(userFavorites.data.length).toBe(0);
    });
  });
});
