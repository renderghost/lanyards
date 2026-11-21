import { createFileRoute, Outlet } from '@tanstack/react-router';

import { LandingPage } from '@/features/auth/components/LandingPage/LandingPage';

/**
 * The homepage and the sign-in page are one page, its badge turned over to
 * sign in (#175): they share this layout, so the badge stays mounted and
 * turns between them.
 */
export const Route = createFileRoute('/_home')({
  // It draws its own header, on the brand blue (#151, #157).
  staticData: { ownHeader: true },
  component: Home,
});

function Home() {
  return (
    <>
      <LandingPage />
      <Outlet />
    </>
  );
}
