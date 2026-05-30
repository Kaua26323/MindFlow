// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';

test.describe('Dashboard Page (E2E)', () => {
  const { clean, userRepository, postRepository } = makeRepositoryHarness();

  let GLOBAL_USER_ID: string;

  test.beforeAll(async () => {
    const user = await userRepository.findByEmail('globaltest@gmail.com');
    GLOBAL_USER_ID = user!.id;
  });

  test.beforeEach(async () => {
    await clean(['posts', 'favorites']);
  });

  test('should display the empty state and a counter at zero when the user has no posts', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('No posts to show.')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Create your first post now.' }),
    ).toBeVisible();

    await expect(page.locator('p:has-text("Total Posts") + p')).toHaveText('0');
  });

  test('should list the posts created by the user and update the total counter', async ({
    page,
  }) => {
    await postRepository.create({
      text: 'My first post!',
      user_id: GLOBAL_USER_ID,
    });
    await postRepository.create({
      text: 'My second post!',
      user_id: GLOBAL_USER_ID,
    });

    await page.goto('/dashboard');

    await expect(page.getByText('My first post!')).toBeVisible();
    await expect(page.getByText('My second post!')).toBeVisible();

    await expect(page.locator('p:has-text("Total Posts") + p')).toHaveText('2');
  });

  test('should perform a valid search and filter the rendered posts', async ({
    page,
  }) => {
    await postRepository.create({
      text: 'Post about Node.js',
      user_id: GLOBAL_USER_ID,
    });
    await postRepository.create({
      text: 'Post about Playwright',
      user_id: GLOBAL_USER_ID,
    });

    await page.goto('/dashboard');

    const searchInput = page.getByPlaceholder('Search your posts...');
    await searchInput.fill('Playwright');

    await searchInput.press('Enter');

    await expect(page).toHaveURL('/dashboard?search=Playwright');

    await expect(page.getByText('Post about Playwright')).toBeVisible();
    await expect(page.getByText('Post about Node.js')).toBeHidden();
    await expect(page.getByText('1 post(s) found')).toBeVisible();
  });

  test('should display an alert message when searching for a non-existent term', async ({
    page,
  }) => {
    await postRepository.create({
      text: 'Post about Drizzle',
      user_id: GLOBAL_USER_ID,
    });

    await page.goto('/dashboard');

    const searchInput = page.getByPlaceholder('Search your posts...');
    await searchInput.fill('Python');
    await searchInput.press('Enter');

    await expect(page.getByText('No post found for the term Python')).toBeVisible();
    await expect(page.getByText('Post about Drizzle')).toBeHidden();
  });

  test('should clear search query parameters when clicking the "Clear" button', async ({
    page,
  }) => {
    await page.goto('/dashboard?search=test');

    await page.getByRole('link', { name: 'Clear' }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('should delete a post, wait for the redirect, and validate its removal from the screen', async ({
    page,
  }) => {
    const postText = 'Post that will be deleted';
    const post = await postRepository.create({
      text: postText,
      user_id: GLOBAL_USER_ID,
    });

    await page.goto('/dashboard');

    const deleteButton = page.getByRole('button', { name: 'Delete' }).first();

    await expect(page.getByText(postText)).toBeVisible();
    await expect(deleteButton).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) =>
        req.url().includes(`/delete-post/${post!.id}?_method=DELETE`) &&
        req.method() === 'POST',
    );

    await deleteButton.click();

    const request = await requestPromise;
    const postData = request.postData();

    expect(postData).toContain('_csrf=');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(postText)).toBeHidden();
  });

  test('should navigate correctly to the edit page', async ({ page }) => {
    const post = await postRepository.create({
      text: 'Post that will be updated',
      user_id: GLOBAL_USER_ID,
    });

    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Edit' }).first().click();
    await expect(page).toHaveURL(`/edit-post/${post?.id}`);
  });

  test('should navigate correctly to the new post page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'New Post' }).click();
    await expect(page).toHaveURL('/new-post');
  });
});
