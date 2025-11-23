import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import ProfileForm from '@/components/profile/ProfileForm';
import Link from 'next/link';

export default async function EditProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);
  const identity = await repo.getIdentity(session.did);

  // Get fresh Bluesky profile data
  const bskyProfile = await agent.getProfile({ actor: session.did });

  // Merge Bluesky data with identity data
  const profile = {
    did: session.did,
    handle: bskyProfile.data.handle,
    displayName: bskyProfile.data.displayName,
    avatar: bskyProfile.data.avatar,
    banner: bskyProfile.data.banner,
    description: bskyProfile.data.description,
    ...identity,
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 leading-tight"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold leading-tight">Edit Profile</h1>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Update your researcher profile information
              </p>
            </div>
            <Link
              href={`/${profile.handle}`}
              className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}
