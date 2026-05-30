import { test, expect } from '@playwright/test';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';

test.describe('Favorites Page (E2E)', () => {
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

  test('should display an empty state when the user has no favorites', async ({
    page,
  }) => {
    await page.goto('/favorites');

    await expect(
      page.getByRole('heading', { name: 'Nothing here yet...' }),
    ).toBeVisible();
    await expect(
      page.getByText("You haven't favorited anything yet..."),
    ).toBeVisible();

    const exploreLink = page.getByRole('link', { name: 'Explore Posts' });
    await expect(exploreLink).toBeVisible();
    await expect(exploreLink).toHaveAttribute('href', '/');
  });

  test('should list the posts favorited by the user', async ({ page }) => {
    const postText = 'Create post for test!!!';
    const post = await postRepository.create({
      text: postText,
      user_id: GLOBAL_USER_ID,
    });

    await favoritesRepository.addPost({
      user_id: GLOBAL_USER_ID,
      post_id: post!.id,
    });

    await page.goto('/favorites');

    await expect(page.getByRole('heading', { name: 'My Favorites' })).toBeVisible();
    await expect(page.getByText(`"${postText}"`)).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Remove from favorites' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'View on Home' })).toBeVisible();
  });

  test('should successfully remove a post from favorites', async ({ page }) => {
    const targetPostText = 'This post will be deleted!';
    const post = await postRepository.create({
      text: targetPostText,
      user_id: GLOBAL_USER_ID,
    });

    await favoritesRepository.addPost({
      user_id: GLOBAL_USER_ID,
      post_id: post!.id,
    });

    await page.goto('/favorites');

    const favoriteCard = page
      .locator('.favorite-item')
      .filter({ hasText: targetPostText });
    const removeBtn = favoriteCard.getByRole('button', {
      name: 'Remove from favorites',
    });

    const requestPromise = page.waitForRequest(
      (req) =>
        req.url().includes(`/favorite/remove/${post!.id}?_method=DELETE`) &&
        req.method() === 'POST',
    );

    await removeBtn.click();

    const request = await requestPromise;
    expect(request.postData()).toContain('_csrf=');

    await expect(page).toHaveURL('/favorites');

    await expect(page.getByText(targetPostText)).toBeHidden();
    await expect(
      page.getByRole('heading', { name: 'Nothing here yet...' }),
    ).toBeVisible();
  });

  test('should navigate to the home page when clicking "View on Home!"', async ({
    page,
  }) => {
    const post = await postRepository.create({
      text: 'Post to test navigation.',
      user_id: GLOBAL_USER_ID,
    });

    await favoritesRepository.addPost({
      user_id: GLOBAL_USER_ID,
      post_id: post!.id,
    });

    await page.goto('/favorites');

    await page.getByRole('link', { name: 'View on Home' }).first().click();

    await expect(page).toHaveURL('/');
  });
});
