// tests/integration/controllers/user.controller.spec.ts
import argon2 from 'argon2';
import { app } from '@/app.ts';
import request from 'supertest';
import { expect, describe, it, beforeEach } from 'vitest';
import { getCsrfTokenAndCookies } from '../../utils/auth-helpers.ts';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';

describe('UserController Integration Tests', () => {
  const { userRepository, cleanAll } = makeRepositoryHarness();

  beforeEach(async () => {
    await cleanAll();
  });

  describe('POST /signin', () => {
    it('should successfully log in and redirect to /dashboard', async () => {
      const userPassword = 'strong_password123';
      const hashedPassword = await argon2.hash(userPassword);

      await userRepository.create({
        name: 'Supertest User',
        email: 'integration@test.com',
        password: hashedPassword,
      });

      const { csrfToken, cookies } = await getCsrfTokenAndCookies('/login');

      const response = await request(app)
        .post('/signin')
        .set('Cookie', cookies)
        .send({
          _csrf: csrfToken,
          email: 'integration@test.com',
          password: userPassword,
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/dashboard');
      expect(response.header['set-cookie']).toBeDefined();
    });

    it('should fail login with invalid credentials and redirect back to /login', async () => {
      const { csrfToken, cookies } = await getCsrfTokenAndCookies('/login');

      const response = await request(app)
        .post('/signin')
        .set('Cookie', cookies)
        .send({
          _csrf: csrfToken,
          email: 'nonexistent@test.com',
          password: 'wrong_password',
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/login');
    });

    it('should reject the request if CSRF token is missing', async () => {
      const response = await request(app).post('/signin').send({
        email: 'integration@test.com',
        password: 'any_password',
      });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/');
    });
  });

  describe('GET /logout (or POST /logout)', () => {
    it('should successfully destroy the user session and redirect to home (/)', async () => {
      const userPassword = 'strong_password123';
      const hashedPassword = await argon2.hash(userPassword);

      await userRepository.create({
        name: 'Logout Test User',
        email: 'logout@test.com',
        password: hashedPassword,
      });

      const { csrfToken, cookies: initialCookies } =
        await getCsrfTokenAndCookies('/login');

      const loginResponse = await request(app)
        .post('/signin')
        .set('Cookie', initialCookies)
        .send({
          _csrf: csrfToken,
          email: 'logout@test.com',
          password: userPassword,
        });

      const authCookies =
        (loginResponse.headers['set-cookie'] as unknown as string[]) || [];

      const response = await request(app).get('/logout').set('Cookie', authCookies);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/');

      const logoutCookies =
        (response.headers['set-cookie'] as unknown as string[]) || [];

      const cookieString = logoutCookies.join(';');

      const sessionDestroyed =
        cookieString === '' || cookieString.includes('connect.sid=;');
      expect(sessionDestroyed).toBe(true);
    });
  });
});
