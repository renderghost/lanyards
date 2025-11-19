import { ProfileRepository } from '@/lib/data/repository';
import ProfileView from '@/components/profile/ProfileView';
import { getPublicAgent } from '@/lib/auth/server-agent';
import { getAgent } from '@/lib/auth/atproto';
import { getSession } from '@/lib/auth/session';
import Link from 'next/link';

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
    // Check if user is authenticated
    const session = await getSession();
    const agent = session ? await getAgent() : null;

    // If no authenticated session, require sign in to view profiles
    if (!agent) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              You need to sign in to view Lanyards profiles. This helps us access public Bluesky data on your behalf.
            </p>
            <Link
              href="/auth"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </main>
      );
    }

    // Resolve handle to DID
    const publicAgent = getPublicAgent();
    const resolved = await publicAgent.resolveHandle({ handle });
    const did = resolved.data.did;

    // Check if the current user is viewing their own profile
    const isOwner = session?.did === did;

    // Get Bluesky profile (requires authentication)
    const bskyProfile = await agent.getProfile({ actor: did });

    // Get Lanyards profile data
    const repo = new ProfileRepository(agent);

    // Get all profile data
    const [identity, honorific, location, affiliations, qualifications, skills, socialLinks, webLinks, works, events] = await Promise.all([
      repo.getIdentity(did),
      repo.getHonorific(did),
      repo.getLocation(did),
      repo.listAffiliations(did),
      repo.listQualifications(did),
      repo.listSkills(did),
      repo.listSocialLinks(did),
      repo.listWebLinks(did),
      repo.listWorks(did),
      repo.listEvents(did),
    ]);

    return (
      <ProfileView
        profile={{
          did,
          handle,
          displayName: bskyProfile.data.displayName,
          avatar: bskyProfile.data.avatar,
          banner: bskyProfile.data.banner,
          description: bskyProfile.data.description,
          honorific: honorific?.value,
          location: location ? {
            city: location.city,
            country: location.country,
          } : undefined,
        }}
        affiliations={affiliations}
        qualifications={qualifications}
        skills={skills}
        socialLinks={socialLinks}
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
