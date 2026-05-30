// tests/e2e/new-post.spec.ts
import { test, expect } from '@playwright/test';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';

test.describe('Edit Post Page (E2E)', () => {
  const { clean, postRepository, userRepository } = makeRepositoryHarness();

  let GLOBAL_USER: string;
  let GLOBAL_POST: string;

  test.beforeAll(async () => {
    await clean(['posts']);
    const user = await userRepository.findByEmail('globaltest@gmail.com');
    GLOBAL_USER = user!.id;

    const post = await postRepository.create({
      user_id: GLOBAL_USER,
      text: 'Create this post for tests!',
    });

    GLOBAL_POST = post!.id;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/edit-post/${GLOBAL_POST}`);
  });

  test.afterAll(async () => {
    await clean(['posts']);
  });

  test('should render the UI correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Edit Post' })).toBeVisible();
    await expect(page.getByLabel('Your Post')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  });

  test('should successfully update a post, validate CSRF, and redirect to the dashboard', async ({
    page,
  }) => {
    const postContent = 'This post was updated!';

    await page.getByLabel('Your Post').fill(postContent);

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/update-post') && req.method() === 'POST',
    );

    await page.getByRole('button', { name: 'Save Changes' }).click();

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

    const longText = 'B'.repeat(200);
    await textarea.fill(longText);

    const inputValue = await textarea.inputValue();

    expect(inputValue.length).toBe(150);
  });

  test('should cancel and return to the dashboard when clicking "Cancel"', async ({
    page,
  }) => {
    await page.getByLabel('Your Post').fill('This text will not be updated.');

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
