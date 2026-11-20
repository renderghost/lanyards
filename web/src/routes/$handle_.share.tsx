import { createFileRoute, redirect } from '@tanstack/react-router';

import { SharePage } from '@/features/qr/components/SharePage/SharePage';

/** Show QR, at `/<handle>/share` (#150): anyone's badge, full screen. */
export const Route = createFileRoute('/$handle_/share')({
  beforeLoad: ({ params }) => {
    const lower = params.handle.toLowerCase();
    if (!params.handle.startsWith('did:') && lower !== params.handle) {
      throw redirect({ href: `/${lower}/share` });
    }
  },
  staticData: { fullScreen: true },
  component: Share,
});

function Share() {
  const { handle } = Route.useParams();
  return <SharePage handle={handle} />;
}
