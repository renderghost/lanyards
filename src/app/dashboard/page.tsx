import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import Link from 'next/link';
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
    // Get profile
    let profile = await repo.getProfile(session.did);

    // Create profile if it doesn't exist
    if (!profile) {
      const bskyProfile = await agent.getProfile({ actor: session.did });

      await repo.createProfile({
        did: session.did,
        handle: session.handle,
        displayName: bskyProfile.data.displayName,
        avatar: bskyProfile.data.avatar,
        description: bskyProfile.data.description,
      });

      profile = await repo.getProfile(session.did);
    }

    // Get counts for each section
    const [works, events, webLinks] = await Promise.all([
      repo.listWorks(session.did),
      repo.listEvents(session.did),
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
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {profile?.displayName || 'Your Profile'}
                </h2>
                <p className="text-sm text-gray-600">@{session.handle}</p>
              </div>
              <ShareProfileButton
                url={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${session.handle}`}
                handle={session.handle}
              />
            </div>
            <div className="flex gap-2">
              <Link
                href={`/${session.handle}`}
                className="flex-1 text-center text-sm py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                View Profile
              </Link>
              <Link
                href="/dashboard/profile/edit"
                className="flex-1 text-center text-sm py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Research Links */}
          <Link
            href="/dashboard/research"
            className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold mb-1">Research Links</h3>
                <p className="text-sm text-gray-600">
                  {works.length} publication{works.length !== 1 ? 's' : ''}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          {/* Events */}
          <Link
            href="/dashboard/events"
            className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold mb-1">Events</h3>
                <p className="text-sm text-gray-600">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          {/* WebLinks */}
          <Link
            href="/dashboard/links"
            className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold mb-1">WebLinks</h3>
                <p className="text-sm text-gray-600">
                  {webLinks.length} link{webLinks.length !== 1 ? 's' : ''}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
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
          <Link
            href="/auth"
            className="text-blue-600 hover:underline"
          >
            Return to Login
          </Link>
        </div>
      </main>
    );
  }
}
