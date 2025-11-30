import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import ProfileForm from '@/components/profile/ProfileForm';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  console.log('[DashboardPage] ====== Starting Dashboard Page Render ======');
  console.log('[DashboardPage] Timestamp:', new Date().toISOString());

  const session = await getSession();
  console.log('[DashboardPage] Got session?', !!session);
  console.log('[DashboardPage] Session DID:', session?.did);

  if (!session) {
    console.log('[DashboardPage] ❌ No session found, redirecting to /auth');
    redirect('/auth');
  }

  console.log('[DashboardPage] ✅ Session validated, getting agent...');
  const agent = await getAgent();
  console.log('[DashboardPage] Got agent?', !!agent);

  if (!agent) {
    console.log('[DashboardPage] ❌ No agent available, redirecting to /auth');
    console.log('[DashboardPage] This usually means OAuth session restore failed');
    redirect('/auth');
  }

  console.log('[DashboardPage] ✅ Agent validated, proceeding with dashboard render');

  const repo = new ProfileRepository(agent);

  // Get fresh Bluesky profile data
  const bskyProfile = await agent.getProfile({ actor: session.did });

  // Get honorific and location from repository
  const [honorific, location] = await Promise.all([
    repo.getHonorific(session.did),
    repo.getLocation(session.did),
  ]);

  // Merge fresh Bluesky data with Lanyard data
  const profile = {
    did: session.did,
    handle: session.handle,
    displayName: bskyProfile.data.displayName,
    avatar: bskyProfile.data.avatar,
    banner: bskyProfile.data.banner,
    description: bskyProfile.data.description,
    honorific: honorific?.value,
    location: location
      ? {
          city: location.city,
          country: location.country,
        }
      : undefined,
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button variant="outline" asChild>
            <Link href={`/${session.handle}`}>View Profile</Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col p-4">
        <div className="mx-auto w-full max-w-2xl">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </>
  );
}
