// e2e/register.spec.ts
import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Page (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
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

  test('should successfully submit the user login form and redirect to the dashboard', async ({
    page,
  }) => {
    const userEmail = 'globaltest@gmail.com';
    const password = 'strong_password123';

    await page.getByRole('textbox', { name: 'E-mail' }).fill(userEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/signin') && req.method() === 'POST',
    );

    await page.getByRole('button', { name: 'Sign In', exact: false }).click();

    const request = await requestPromise;
    const postData = request.postData();

    expect(postData).toContain('_csrf=');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should redirect to register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign up.' }).click();
    await expect(page).toHaveURL('/register');
  });
});
