import { createFileRoute } from '@tanstack/react-router';

import { CustomisePage } from '@/features/lanyard/customise/CustomisePage/CustomisePage';

export const Route = createFileRoute('/lanyard')({
  component: CustomisePage,
});
