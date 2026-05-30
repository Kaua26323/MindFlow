import argon2 from 'argon2';
import { test as setup, expect } from '@playwright/test';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';

setup('Authenticate user (Setup)', async ({ page }) => {
  const { userRepository, cleanAll } = makeRepositoryHarness();

  await cleanAll();

  const hashedPassword = await argon2.hash('strong_password123');

  await userRepository.create({
    name: 'global user',
    email: 'globaltest@gmail.com',
    password: hashedPassword,
  });

  await page.goto('/login');
  await page.getByLabel('E-mail').fill('globaltest@gmail.com');
  await page.getByLabel('Password').fill('strong_password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/dashboard');

  await page.context().storageState({ path: 'tests/e2e/setup/user.json' });
});
