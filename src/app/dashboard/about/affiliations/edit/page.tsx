import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import AffiliationForm from '@/components/about/AffiliationForm';
import Link from 'next/link';

export default async function EditAffiliationPage({
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
    redirect('/dashboard/about/affiliations');
  }

  const repo = new ProfileRepository(agent);
  const affiliations = await repo.listAffiliations(session.did);
  const affiliation = affiliations.find((a) => a.rkey === rkey);

  if (!affiliation) {
    redirect('/dashboard/about/affiliations');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/about/affiliations"
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
          <h1 className="text-xl font-bold">Edit Affiliation</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update your affiliation details
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <AffiliationForm mode="edit" affiliation={affiliation} rkey={rkey} />
      </div>
    </main>
  );
}
