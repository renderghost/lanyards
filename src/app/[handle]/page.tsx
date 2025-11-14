import { ProfileRepository } from '@/lib/data/repository';
import ProfileView from '@/components/profile/ProfileView';
import { getServerAgent, getPublicAgent } from '@/lib/auth/server-agent';
import { getSession } from '@/lib/auth/session';

interface PageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { handle } = await params;

  // Validate handle format - reject obvious non-handles
  if (
    !handle ||
    handle.includes('.ico') ||
    handle.includes('.png') ||
    handle.includes('.jpg') ||
    handle.includes('.svg') ||
    handle.length < 3
  ) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Handle</h1>
          <p className="text-gray-600 mb-6">
            The handle provided is not valid.
          </p>
          <a href="/" className="text-blue-600 hover:underline">
            Go to homepage
          </a>
        </div>
      </main>
    );
  }

  try {
    // Use public agent for resolving handle (doesn't require auth)
    const publicAgent = getPublicAgent();
    const resolved = await publicAgent.resolveHandle({ handle });
    const did = resolved.data.did;

    // Check if the current user is viewing their own profile
    const session = await getSession();
    const isOwner = session?.did === did;

    // Get authenticated agent for profile operations
    const agent = await getServerAgent();

    // Get Bluesky profile
    const bskyProfile = await agent.getProfile({ actor: did });

    // Get Lanyards profile
    const repo = new ProfileRepository(agent);
    const lanyardProfile = await repo.getProfile(did);

    if (!lanyardProfile) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">
              This user hasn&apos;t created a Lanyards profile yet.
            </p>
            <a href="/" className="text-blue-600 hover:underline">
              Go to homepage
            </a>
          </div>
        </main>
      );
    }

    // Get all profile data
    const [affiliations, webLinks, works, events] = await Promise.all([
      repo.listAffiliations(did),
      repo.listWebLinks(did),
      repo.listWorks(did),
      repo.listEvents(did),
    ]);

    return (
      <ProfileView
        profile={{
          ...lanyardProfile,
          displayName: bskyProfile.data.displayName,
          avatar: bskyProfile.data.avatar,
          banner: bskyProfile.data.banner,
          description: bskyProfile.data.description,
        }}
        affiliations={affiliations}
        webLinks={webLinks}
        works={works}
        events={events}
        isOwner={isOwner}
      />
    );
  } catch (error) {
    console.error('Error loading profile:', error);
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
          <p className="text-gray-600 mb-6">
            Unable to load this profile. Please try again later.
          </p>
          <a href="/" className="text-blue-600 hover:underline">
            Go to homepage
          </a>
        </div>
      </main>
    );
  }
}
