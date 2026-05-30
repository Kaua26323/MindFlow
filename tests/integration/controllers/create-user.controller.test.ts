import argon2 from 'argon2';
import { app } from '@/app.ts';
import request from 'supertest';
import { expect, describe, it, beforeEach } from 'vitest';
import { getCsrfTokenAndCookies } from '../../utils/auth-helpers.ts';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';

describe('CreateUserController Integration Tests', () => {
  const { userRepository, cleanAll } = makeRepositoryHarness();

  beforeEach(async () => {
    await cleanAll();
  });

  describe('GET /register', () => {
    it('should render the registration page successfully with status 200', async () => {
      const response = await request(app).get('/register');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Create Account');
      expect(response.text).toContain('name="_csrf"');
    });
  });

  describe('POST /create-user', () => {
    it('should successfully create a new user, create a session, and redirect to /dashboard', async () => {
      const { csrfToken, cookies } = await getCsrfTokenAndCookies('/register');

      const newUserPayload = {
        _csrf: csrfToken,
        name: 'Kauan tests',
        email: 'kauan_tests@gmail.com',
        password: 'StrongPassword123!',
      };

      const response = await request(app)
        .post('/create-user')
        .set('Cookie', cookies)
        .send(newUserPayload);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/dashboard');

      const authCookies =
        (response.headers['set-cookie'] as unknown as string[]) || [];
      expect(authCookies.length).toBeGreaterThan(0);
      expect(authCookies.join(';')).toContain('connect.sid');

      const savedUser = await userRepository.findByEmail('kauan_tests@gmail.com');
      expect(savedUser).toBeDefined();
      expect(savedUser?.name).toBe('Kauan tests');

      expect(savedUser?.password).not.toBe('StrongPassword123!');
    });

    it('should fail when trying to register an email that already exists', async () => {
      await userRepository.create({
        name: 'Existing User',
        email: 'duplicate@test.com',
        password: await argon2.hash('SomePassword123!'),
      });

      const { csrfToken, cookies } = await getCsrfTokenAndCookies('/register');

      const response = await request(app)
        .post('/create-user')
        .set('Cookie', cookies)
        .send({
          _csrf: csrfToken,
          name: 'Another User',
          email: 'duplicate@test.com',
          password: 'NewPassword123!',
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/register');
    });

    it('should fail validation and redirect back to /register when payload is invalid', async () => {
      const { csrfToken, cookies } = await getCsrfTokenAndCookies('/register');

      const response = await request(app)
        .post('/create-user')
        .set('Cookie', cookies)
        .send({
          _csrf: csrfToken,
          name: 'AB',
          email: 'not-an-email',
          password: '',
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/register');

      const usersInDb = await userRepository.findByEmail('not-an-email');
      expect(usersInDb).toBeNull();
    });
  });
});
