import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import LinkForm from '@/components/links/LinkForm';
import Link from 'next/link';

export default async function EditLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ rkey?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const params = await searchParams;

  if (!params.rkey) {
    redirect('/dashboard/links/web');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);
  const links = await repo.listWebLinks(session.did);

  // Find the link with the matching rkey
  const link = links.find((l) => l.rkey === params.rkey);

  if (!link) {
    redirect('/dashboard/links/web');
  }

  if (link.isLocked) {
    // Redirect if trying to edit a locked link
    redirect('/dashboard/links/web');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/links/web"
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
          <h1 className="text-xl font-bold">Edit Link</h1>
          <p className="text-sm text-gray-600 mt-1">Update link details</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <LinkForm mode="edit" initialData={link} />
      </div>
    </main>
  );
}
