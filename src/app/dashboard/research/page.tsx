import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import Link from 'next/link';

export default async function ResearchPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);
  const works = await repo.listWorks(session.did);

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
              <h1 className="text-xl font-bold">Your Research</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your publications and scholarly works
              </p>
            </div>
            <Link
              href="/dashboard/research/create"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Research
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {works.length === 0 ? (
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">No research yet</h2>
            <p className="text-gray-600 text-sm mb-6">
              Add your first research item by entering its DOI. We&apos;ll
              automatically fetch the metadata from CrossRef.
            </p>
            <Link
              href="/dashboard/research/create"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Research
            </Link>
          </div>
        ) : (
          // Works list
          <div className="space-y-4">
            {works.map((work) => (
              <div
                key={work.rkey}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {work.title || work.doi}
                    </h3>
                    {work.authors && work.authors.length > 0 && (
                      <p className="text-sm text-gray-600 mb-2">
                        {work.authors.join(', ')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                        {work.type.replace(/-/g, ' ')}
                      </span>
                      {work.venue && (
                        <span className="text-xs text-gray-600">
                          {work.venue}
                        </span>
                      )}
                      {work.publicationDate && (
                        <span className="text-xs text-gray-500">
                          Published: {new Date(work.publicationDate).getFullYear()}
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://doi.org/${work.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                    >
                      DOI: {work.doi}
                    </a>
                  </div>
                  <Link
                    href={`/dashboard/research/edit?rkey=${encodeURIComponent(work.rkey)}`}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
