import argon2 from 'argon2';
import { app } from '@/app.ts';
import request from 'supertest';
import { makeRepositoryHarness } from './makeRepositoryHarness.ts';

async function getCsrfTokenAndCookies(route: string) {
  const response = await request(app).get(route);

  const cookies = (response.headers['set-cookie'] as unknown as string[]) || [];

  const csrfMatch = response.text.match(/name="_csrf" value="([^"]+)"/);
  const csrfToken = csrfMatch ? csrfMatch[1] : '';

  if (!csrfToken) {
    throw new Error('CSRF Token not found in the HTML response.');
  }

  return { csrfToken, cookies };
}

async function getAuthenticatedSessionAndCsrf() {
  const { userRepository } = makeRepositoryHarness();
  const userPassword = 'ValidPassword123!';
  const hashedPassword = await argon2.hash(userPassword);

  const user = await userRepository.create({
    name: 'User Test',
    email: 'user_test@gmail.com',
    password: hashedPassword,
  });

  const { csrfToken, cookies } = await getCsrfTokenAndCookies('/login');

  const signinRes = await request(app).post('/signin').set('Cookie', cookies).send({
    _csrf: csrfToken,
    email: 'user_test@gmail.com',
    password: userPassword,
  });

  const authCookies = (signinRes.headers['set-cookie'] as unknown as string[]) || [];

  const newPostRes = await request(app).get('/new-post').set('Cookie', authCookies);

  const csrfMatch = newPostRes.text.match(/name="_csrf" value="([^"]+)"/);
  const finalCsrfToken = csrfMatch ? csrfMatch[1] : '';

  return {
    currentUserId: user!.id,
    authCookies: authCookies,
    csrfToken: finalCsrfToken,
  };
}

export { getCsrfTokenAndCookies, getAuthenticatedSessionAndCsrf };
