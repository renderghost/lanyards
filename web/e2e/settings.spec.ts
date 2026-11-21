import { expect, test } from './fixtures';

test('sends signed-out visitors to sign in first', async ({ page }) => {
  await page.goto('/settings');
  await expect(page).toHaveURL('/sign-in?returnTo=%2Fsettings');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sign in' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
