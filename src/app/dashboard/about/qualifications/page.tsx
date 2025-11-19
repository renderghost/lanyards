import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import Link from 'next/link';

export default async function QualificationsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);
  const qualifications = await repo.listQualifications(session.did);

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
              <h1 className="text-xl font-bold">Qualifications</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your degrees, certifications, and credentials
              </p>
            </div>
            <Link
              href="/dashboard/about/qualifications/create"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Qualification
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {qualifications.length === 0 ? (
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
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">
              No qualifications yet
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Add your academic degrees, professional certifications, and other
              credentials.
            </p>
            <Link
              href="/dashboard/about/qualifications/create"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Qualification
            </Link>
          </div>
        ) : (
          // Qualifications list
          <div className="space-y-4">
            {qualifications.map((qualification) => (
              <div
                key={qualification.uri}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {qualification.name}
                      </h3>
                      {qualification.type && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                          {qualification.type}
                        </span>
                      )}
                    </div>
                    {qualification.institution && (
                      <p className="text-sm text-gray-600 mb-1">
                        {qualification.institution}
                      </p>
                    )}
                    {qualification.fieldOfStudy && (
                      <p className="text-sm text-gray-600 mb-2">
                        {qualification.fieldOfStudy}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {qualification.yearAwarded && (
                        <span>{qualification.yearAwarded}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/about/qualifications/edit?rkey=${encodeURIComponent(qualification.uri.split('/').pop() || '')}`}
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
