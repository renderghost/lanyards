import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[DashboardLayout] Starting layout render');
  const session = await getSession();
  console.log('[DashboardLayout] Got session?', !!session);

  if (!session) {
    console.log('[DashboardLayout] No session, redirecting to /auth');
    redirect('/auth');
  }

  console.log('[DashboardLayout] Getting agent...');
  const agent = await getAgent();
  console.log('[DashboardLayout] Got agent?', !!agent);

  if (!agent) {
    console.log('[DashboardLayout] No agent, redirecting to /auth');
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);

  // Get fresh Bluesky profile data
  const bskyProfile = await agent.getProfile({ actor: session.did });

  // Get honorific data
  const honorific = await repo.getHonorific(session.did);

  // Get counts for each section
  const [
    affiliations,
    qualifications,
    skills,
    works,
    events,
    socialLinks,
    webLinks,
  ] = await Promise.all([
    repo.listAffiliations(session.did),
    repo.listQualifications(session.did),
    repo.listSkills(session.did),
    repo.listWorks(session.did),
    repo.listEvents(session.did),
    repo.listSocialLinks(session.did),
    repo.listWebLinks(session.did),
  ]);

  const profile = {
    handle: session.handle,
    displayName: bskyProfile.data.displayName,
    avatar: bskyProfile.data.avatar,
    honorific: honorific?.value,
  };

  const counts = {
    affiliations: affiliations.length,
    qualifications: qualifications.length,
    skills: skills.length,
    events: events.length,
    works: works.length,
    socialLinks: socialLinks.length,
    webLinks: webLinks.length,
  };

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} counts={counts} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
