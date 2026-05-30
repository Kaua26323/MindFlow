// tests/e2e/new-post.spec.ts
import { test, expect } from '@playwright/test';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';

test.describe('New Post Page (E2E)', () => {
  const { clean } = makeRepositoryHarness();

  test.beforeEach(async ({ page }) => {
    await clean(['posts']);
    await page.goto('/new-post');
  });

  test('should render the UI correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'New Post' })).toBeVisible();
    await expect(page.getByLabel('Your Post')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Post' })).toBeVisible();
    await expect(page.getByText('Tips for a great post:')).toBeVisible();
  });

  test('should successfully create a post, validate CSRF, and redirect to the dashboard', async ({
    page,
  }) => {
    const postContent = 'Testing the new post page';

    await page.getByLabel('Your Post').fill(postContent);

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/create-post') && req.method() === 'POST',
    );

    await page.getByRole('button', { name: 'Create Post' }).click();

    const request = await requestPromise;
    const postData = request.postData();

    expect(postData).toContain('_csrf=');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(postContent)).toBeVisible();
  });

  test('should enforce the maximum character limit (maxlength = 150)', async ({
    page,
  }) => {
    const textarea = page.getByLabel('Your Post');

    const longText = 'A'.repeat(200);
    await textarea.fill(longText);

    const inputValue = await textarea.inputValue();

    expect(inputValue.length).toBe(150);
  });

  test('should cancel creation and return to the dashboard when clicking "Cancel"', async ({
    page,
  }) => {
    await page.getByLabel('Your Post').fill('This text will not be saved.');

    await page.getByRole('link', { name: 'Cancel' }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('should return to the dashboard when clicking the back (arrow) button', async ({
    page,
  }) => {
    const backButton = page.getByRole('link').nth(4);

    await backButton.click();
    await expect(page).toHaveURL('/dashboard');
  });
});
