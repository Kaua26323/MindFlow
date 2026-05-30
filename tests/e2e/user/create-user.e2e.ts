// e2e/register.spec.ts
import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Create User Page (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should toggle password visibility when clicking the eye icon', async ({
    page,
  }) => {
    const passwordInput = page.getByLabel('Password');
    const toggleButton = page.getByRole('button').first();

    await expect(passwordInput).toHaveAttribute('type', 'password');

    await passwordInput.fill('my_secret_password');

    await toggleButton.click();

    await expect(passwordInput).toHaveAttribute('type', 'text');

    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should successfully submit the user creation form and redirect to the dashboard', async ({
    page,
  }) => {
    const dynamicUser = `User:${Date.now()}`;
    const dynamicEmail = `new_user_${Date.now()}@email.com`;

    await page.getByRole('textbox', { name: 'Name' }).fill(dynamicUser);
    await page.getByRole('textbox', { name: 'E-mail' }).fill(dynamicEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill('SuperStrong123!');

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/create-user') && req.method() === 'POST',
    );

    await page.getByRole('button', { name: 'Create Account', exact: false }).click();

    const request = await requestPromise;
    const postData = request.postData();

    expect(postData).toContain('_csrf=');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should redirect to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign In.' }).click();
    await expect(page).toHaveURL('/login');
  });
});
