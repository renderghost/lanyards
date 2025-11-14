import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import EditResearchClient from '@/components/research/EditResearchClient';

export default async function EditResearchPage({
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
    redirect('/dashboard/research');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);
  const works = await repo.listWorks(session.did);

  // Find the work with the matching rkey
  const work = works.find((w) => w.rkey === params.rkey);

  if (!work) {
    redirect('/dashboard/research');
  }

  return <EditResearchClient work={work} />;
}
