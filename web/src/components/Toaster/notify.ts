import { toast } from 'sonner';

import type { NotifyOptions } from './Toaster.types';

const toActionOptions = (options?: NotifyOptions) =>
  options?.action
    ? {
        action: {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        },
      }
    : {};

/** Shows toast notifications. Render <Toaster /> once at the app root. */
export const notify = {
  success(message: string): void {
    toast.success(message);
  },
  error(message: string, options?: NotifyOptions): void {
    toast.error(message, toActionOptions(options));
  },
  info(message: string, options?: NotifyOptions): void {
    toast.info(message, toActionOptions(options));
  },
};
