import type { Did } from '@atcute/lexicons';
import { isDid } from '@atcute/lexicons/syntax';
import { createFileRoute, notFound } from '@tanstack/react-router';

import { LanyardPage } from '@/features/lanyard/components/LanyardPage/LanyardPage';
import { prefetchLanyard } from '@/lib/person/personQueries';

/** The QR target: stable across handle changes (spec §6.1, §7.6). */
export const Route = createFileRoute('/d/$did')({
  beforeLoad: ({ params }) => {
    if (!isDid(params.did)) throw notFound();
  },
  // Starts the badge's reads while the page's code loads, so its short
  // wait for them (#129) costs nothing.
  loader: ({ context, params }) => {
    prefetchLanyard(context.queryClient, params.did as Did);
  },
  staticData: { signedOutActions: true },
  component: DidLanyard,
});

function DidLanyard() {
  const { did } = Route.useParams();
  return <LanyardPage did={did as Did} />;
}
