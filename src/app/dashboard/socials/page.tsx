import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import Link from 'next/link';

const PLATFORM_DISPLAY: Record<string, { label: string; icon: string }> = {
  bluesky: { label: 'Bluesky', icon: '🦋' },
  twitter: { label: 'Twitter/X', icon: '𝕏' },
  linkedin: { label: 'LinkedIn', icon: '💼' },
  mastodon: { label: 'Mastodon', icon: '🐘' },
  researchgate: { label: 'ResearchGate', icon: '🔬' },
  googlescholar: { label: 'Google Scholar', icon: '🎓' },
  orcid: { label: 'ORCID', icon: '🆔' },
  semble: { label: 'Semble', icon: '🩺' },
  other: { label: 'Other', icon: '🔗' },
};

export default async function SocialsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);
  const socials = await repo.listSocialLinks(session.did);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2 leading-5"
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
              <h1 className="text-xl font-bold leading-7">Social Links</h1>
              <p className="text-sm text-gray-600 mt-1 leading-5">
                Manage your social media profiles
              </p>
            </div>
            <Link
              href="/dashboard/socials/create"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors leading-5"
            >
              Add Social
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {socials.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2 leading-6">
              No social links yet
            </h2>
            <p className="text-gray-600 text-sm mb-6 leading-5">
              Add links to your Bluesky, Twitter, LinkedIn, ORCID, and other
              social profiles.
            </p>
            <Link
              href="/dashboard/socials/create"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors leading-5"
            >
              Add Social Link
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {socials.map((social) => {
              const platform =
                PLATFORM_DISPLAY[social.platform] || PLATFORM_DISPLAY.other;
              return (
                <div
                  key={social.rkey}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{platform.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 leading-5">
                            {social.displayName || platform.label}
                          </h3>
                          {social.username && (
                            <p className="text-sm text-gray-500 leading-5">
                              @{social.username}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all leading-5"
                      >
                        {social.url}
                      </a>
                    </div>
                    <Link
                      href={`/dashboard/socials/edit?rkey=${encodeURIComponent(social.rkey)}`}
                      className="text-sm text-gray-600 hover:text-gray-900 leading-5"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
