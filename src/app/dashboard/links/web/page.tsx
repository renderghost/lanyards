import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import Link from 'next/link';

const PLATFORM_ICONS: Record<string, string> = {
  bluesky: '🦋',
  twitter: '🐦',
  linkedin: '💼',
  researchgate: '🔬',
  googlescholar: '🎓',
  orcid: '🆔',
  semble: '👥',
  custom: '🔗',
};

const PLATFORM_NAMES: Record<string, string> = {
  bluesky: 'Bluesky',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  researchgate: 'ResearchGate',
  googlescholar: 'Google Scholar',
  orcid: 'ORCID',
  semble: 'Semble',
  custom: 'Custom Link',
};

export default async function LinksPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);
  const links = await repo.listWebLinks(session.did);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
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
              <h1 className="text-xl font-bold">WebLinks</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage social media and custom web links
              </p>
            </div>
            <Link
              href="/dashboard/links/web/create"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Link
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {links.length === 0 ? (
          // Zero-data state
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">No links yet</h2>
            <p className="text-gray-600 text-sm mb-6">
              Add links to your social media profiles, ORCID, Google Scholar, or
              custom websites.
            </p>
            <Link
              href="/dashboard/links/web/create"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Link
            </Link>
          </div>
        ) : (
          // Links list
          <div className="space-y-4">
            {links.map((link) => {
              const platformIcon =
                PLATFORM_ICONS[link.platform || 'custom'] || '🔗';
              const platformName =
                PLATFORM_NAMES[link.platform || 'custom'] || 'Link';

              return (
                <div
                  key={link.rkey}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{platformIcon}</span>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {link.title || platformName}
                          </h3>
                          {link.username && (
                            <p className="text-sm text-gray-600">
                              @{link.username}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {link.url}
                      </a>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                          {link.type}
                        </span>
                        {link.isLocked && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                    {!link.isLocked && (
                      <Link
                        href={`/dashboard/links/web/edit?rkey=${encodeURIComponent(link.rkey)}`}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
                    )}
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
