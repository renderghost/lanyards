import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import Link from 'next/link';
import Image from 'next/image';
import ShareProfileButton from '@/components/profile/ShareProfileButton';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);

  try {
    // Get fresh Bluesky profile data
    const bskyProfile = await agent.getProfile({ actor: session.did });

    // Get identity and honorific data
    const [identity, honorific] = await Promise.all([
      repo.getIdentity(session.did),
      repo.getHonorific(session.did),
    ]);

    // Merge Bluesky data with Lanyard identity data
    const profile = {
      did: session.did,
      handle: session.handle,
      displayName: bskyProfile.data.displayName,
      avatar: bskyProfile.data.avatar,
      banner: bskyProfile.data.banner,
      description: bskyProfile.data.description,
      honorific: honorific?.value,
    };

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

    return (
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Lanyard</h1>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar */}
              {profile?.avatar && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
                  <Image
                    src={profile.avatar}
                    alt={profile.displayName || session.handle}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold truncate">
                      {profile?.honorific && profile.honorific !== 'none'
                        ? `${profile.honorific}. ${profile?.displayName || session.handle}`
                        : profile?.displayName || session.handle}
                    </h2>
                    <p className="text-sm text-gray-600">@{session.handle}</p>
                  </div>
                  <ShareProfileButton
                    url={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${session.handle}`}
                    handle={session.handle}
                  />
                </div>

                {/* Bio */}
                {profile?.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/${session.handle}`}
                className="flex-1 text-center text-sm py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                View Profile
              </Link>
              <Link
                href="/dashboard/about"
                className="flex-1 text-center text-sm py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit About
              </Link>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-3">About</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/about/affiliations"
                className="flex justify-between items-center py-2 hover:bg-gray-50 px-2 rounded -mx-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏛️</span>
                  <span className="text-sm">Affiliations</span>
                </div>
                <span className="text-xs text-gray-500">{affiliations.length}</span>
              </Link>
              <Link
                href="/dashboard/about/qualifications"
                className="flex justify-between items-center py-2 hover:bg-gray-50 px-2 rounded -mx-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎓</span>
                  <span className="text-sm">Qualifications</span>
                </div>
                <span className="text-xs text-gray-500">
                  {qualifications.length}
                </span>
              </Link>
              <Link
                href="/dashboard/about/skills"
                className="flex justify-between items-center py-2 hover:bg-gray-50 px-2 rounded -mx-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚡</span>
                  <span className="text-sm">Skills</span>
                </div>
                <span className="text-xs text-gray-500">{skills.length}</span>
              </Link>
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-3">Links</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/links/events"
                className="flex justify-between items-center py-2 hover:bg-gray-50 px-2 rounded -mx-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <span className="text-sm">Events</span>
                </div>
                <span className="text-xs text-gray-500">{events.length}</span>
              </Link>
              <Link
                href="/dashboard/links/research"
                className="flex justify-between items-center py-2 hover:bg-gray-50 px-2 rounded -mx-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📚</span>
                  <span className="text-sm">Research</span>
                </div>
                <span className="text-xs text-gray-500">{works.length}</span>
              </Link>
              <Link
                href="/dashboard/links/socials"
                className="flex justify-between items-center py-2 hover:bg-gray-50 px-2 rounded -mx-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <span className="text-sm">Socials</span>
                </div>
                <span className="text-xs text-gray-500">{socialLinks.length}</span>
              </Link>
              <Link
                href="/dashboard/links/web"
                className="flex justify-between items-center py-2 hover:bg-gray-50 px-2 rounded -mx-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <span className="text-sm">Web</span>
                </div>
                <span className="text-xs text-gray-500">{webLinks.length}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Unable to load your profile. Please try again later.
          </p>
          <Link href="/auth" className="text-blue-600 hover:underline">
            Return to Login
          </Link>
        </div>
      </main>
    );
  }
}
