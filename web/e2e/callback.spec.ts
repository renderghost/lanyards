import { expect, test } from './fixtures';

test('explains a cancelled sign-in and scrubs the URL', async ({ page }) => {
  await page.goto('/oauth/callback#error=access_denied');
  await expect(page.getByText('Sign-in was cancelled.')).toBeVisible();
  expect(page.url()).not.toContain('#');
  await expect(page.getByRole('link', { name: 'Try again' })).toHaveAttribute(
    'href',
    '/'
  );
});

test('explains a callback with nothing to finish', async ({ page }) => {
  await page.goto('/oauth/callback');
  await expect(
    page.getByText('This sign-in link has expired or was already used.')
  ).toBeVisible();
});
