import type { Did } from '@atcute/lexicons';
import { isDid } from '@atcute/lexicons/syntax';
import { createFileRoute, notFound } from '@tanstack/react-router';

import { LanyardPage } from '@/features/lanyard/components/LanyardPage/LanyardPage';

/** The QR target: stable across handle changes (spec §6.1, §7.6). */
export const Route = createFileRoute('/d/$did')({
  beforeLoad: ({ params }) => {
    if (!isDid(params.did)) throw notFound();
  },
  component: DidLanyard,
});

function DidLanyard() {
  const { did } = Route.useParams();
  return <LanyardPage did={did as Did} />;
}
