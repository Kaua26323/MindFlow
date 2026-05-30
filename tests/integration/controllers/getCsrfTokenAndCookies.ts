// tests/integration/controllers/user.controller.spec.ts
import request from 'supertest';
import { app } from '@/app.ts';

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

export { getCsrfTokenAndCookies };
