import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import QualificationForm from '@/components/about/QualificationForm';
import Link from 'next/link';

export default async function EditQualificationPage({
  searchParams,
}: {
  searchParams: Promise<{ rkey?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const params = await searchParams;
  const { rkey } = params;

  if (!rkey) {
    redirect('/dashboard/about/qualifications');
  }

  const repo = new ProfileRepository(agent);
  const qualifications = await repo.listQualifications(session.did);
  const qualification = qualifications.find((q) => q.rkey === rkey);

  if (!qualification) {
    redirect('/dashboard/about/qualifications');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/about/qualifications"
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
          <h1 className="text-xl font-bold">Edit Qualification</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update your qualification details
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <QualificationForm mode="edit" qualification={qualification} rkey={rkey} />
      </div>
    </main>
  );
}
