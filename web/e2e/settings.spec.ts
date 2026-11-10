import { expect, HEADING, test } from './fixtures';

test('sends signed-out visitors to sign in first', async ({ page }) => {
  await page.goto('/settings');
  await expect(page).toHaveURL('/?returnTo=%2Fsettings');
  await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
