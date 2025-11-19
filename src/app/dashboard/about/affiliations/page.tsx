import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import Link from 'next/link';

export default async function AffiliationsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);
  const affiliations = await repo.listAffiliations(session.did);

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
              <h1 className="text-xl font-bold">Affiliations</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your institutional and organizational affiliations
              </p>
            </div>
            <Link
              href="/dashboard/about/affiliations/create"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Affiliation
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {affiliations.length === 0 ? (
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">No affiliations yet</h2>
            <p className="text-gray-600 text-sm mb-6">
              Add your institutional affiliations, including universities,
              research centers, or organizations you work with.
            </p>
            <Link
              href="/dashboard/about/affiliations/create"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Affiliation
            </Link>
          </div>
        ) : (
          // Affiliations list
          <div className="space-y-4">
            {affiliations.map((affiliation) => (
              <div
                key={affiliation.uri}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {affiliation.organizationName}
                      </h3>
                      {affiliation.isPrimary && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    {affiliation.department && (
                      <p className="text-sm text-gray-600 mb-1">
                        {affiliation.department}
                      </p>
                    )}
                    {affiliation.role && (
                      <p className="text-sm text-gray-600 mb-2">
                        {affiliation.role}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {affiliation.startDate && (
                        <span>
                          {new Date(affiliation.startDate).getFullYear()}
                          {affiliation.endDate
                            ? ` - ${new Date(affiliation.endDate).getFullYear()}`
                            : ' - Present'}
                        </span>
                      )}
                      {affiliation.organizationType && (
                        <span className="capitalize">
                          • {affiliation.organizationType}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/about/affiliations/edit?rkey=${encodeURIComponent(affiliation.uri.split('/').pop() || '')}`}
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
