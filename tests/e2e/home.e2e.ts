import { test, expect } from '@playwright/test';
import { makeRepositoryHarness } from '../utils/makeRepositoryHarness.ts';

test.describe('Home Page (E2E)', () => {
  const { clean, userRepository, postRepository, favoritesRepository } =
    makeRepositoryHarness();

  let GLOBAL_USER_ID: string;

  test.beforeAll(async () => {
    const user = await userRepository.findByEmail('globaltest@gmail.com');
    GLOBAL_USER_ID = user!.id;
  });

  test.beforeEach(async () => {
    await clean(['posts', 'favorites']);
  });

  test.afterAll(async () => {
    await clean(['posts', 'favorites']);
  });

  test('should display the default message when there is no search query', async ({
    page,
  }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', {
      name: 'Check out some of our Posts',
    });
    await expect(heading).toBeVisible();
  });

  test('should perform a search and display the searched term', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByRole('textbox', {
      name: 'Are you looking for something?',
    });
    await searchInput.fill('Node.js');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    await expect(page).toHaveURL(/\/\?search=Node\.js/);

    const resultHeading = page.getByRole('heading', {
      name: /You are searching for:/i,
    });
    await expect(resultHeading).toContainText('Node.js');
  });

  test('should change the sorting order to oldest', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Oldest' }).click();

    await expect(page).toHaveURL(/\/\?.*order=old/);
  });

  test('should change the sorting order to newest', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Newest' }).click();

    await expect(page).toHaveURL(/\/\?.*order=new/);
  });

  test('should clean the sorting order', async ({ page }) => {
    await page.goto('/?search=test&order=old');

    await page.getByRole('link', { name: 'Clear' }).click();

    await expect(page).toHaveURL('/');
  });

  test('should render and submit the form to add to favorites', async ({ page }) => {
    await postRepository.create({
      text: 'Create this text for test',
      user_id: GLOBAL_USER_ID,
    });

    await page.goto('/');

    const addFavoriteBtn = page.getByLabel('Add to favorites').first();

    await expect(addFavoriteBtn).toBeVisible();

    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/favorite/add') && request.method() === 'POST',
    );

    await addFavoriteBtn.click();

    const request = await requestPromise;
    const postData = request.postData();

    expect(postData).toContain('_csrf=');
    expect(postData).toContain('postID=');

    await expect(page).toHaveURL('/');
    await expect(page.getByLabel('View in Favorites').first()).toBeVisible();
  });

  test('should render the link and navigate to the favorites page', async ({
    page,
  }) => {
    const post = await postRepository.create({
      text: 'Create this text for test',
      user_id: GLOBAL_USER_ID,
    });

    await favoritesRepository.addPost({
      post_id: post!.id,
      user_id: GLOBAL_USER_ID,
    });

    await page.goto('/');

    const viewFavoritesLink = page.getByLabel('View in Favorites').first();

    await expect(viewFavoritesLink).toBeVisible();
    await expect(viewFavoritesLink).toHaveAttribute('href', '/favorites');

    await viewFavoritesLink.click();
    await expect(page).toHaveURL('/favorites');
  });

  test('should display an empty state when there are no posts', async ({ page }) => {
    await page.goto('/?search=termo_inexistente_123');

    await expect(page.getByText('No posts to show.')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Create your first post now.' }),
    ).toBeVisible();
  });
});
