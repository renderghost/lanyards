import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import SocialLinkForm from '@/components/links/SocialLinkForm';
import Link from 'next/link';

export default async function EditSocialLinkPage({
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
    redirect('/dashboard/links/socials');
  }

  const repo = new ProfileRepository(agent);
  const links = await repo.listSocialLinks(session.did);
  const link = links.find((l) => l.rkey === rkey);

  if (!link) {
    redirect('/dashboard/links/socials');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/links/socials"
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
          <h1 className="text-xl font-bold">Edit Social Link</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update your social media or academic profile link
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <SocialLinkForm mode="edit" link={link} rkey={rkey} />
      </div>
    </main>
  );
}
