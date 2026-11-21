import { expect, test } from './fixtures';
import { ADA, mockPerson, signIn } from './mocks';

test('sends signed-out visitors to sign in first', async ({ page }) => {
  await page.goto('/settings');
  await expect(page).toHaveURL('/sign-in?returnTo=%2Fsettings');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sign in' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('signing out goes to the homepage (#172)', async ({ page }) => {
  await mockPerson(page);
  await signIn(page, { did: ADA.did, scope: 'atproto transition:generic' });
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByText('Signed out')).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Welcome to Lanyards' })
  ).toBeVisible();
  await expect(
    page.getByRole('banner').getByRole('link', { name: 'Sign in' })
  ).toBeVisible();
});
