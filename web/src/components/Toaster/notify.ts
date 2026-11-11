import { toast } from 'sonner';

import type { NotifyOptions } from './Toaster.types';

const toActionOptions = (options?: NotifyOptions) => ({
  ...(options?.id ? { id: options.id } : {}),
  ...(options?.action
    ? {
        action: {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        },
        // Action toasts stay until dismissed, with a close button, so nobody
        // has to beat a timer to use them (WCAG 2.2.1).
        duration: Number.POSITIVE_INFINITY,
        closeButton: true,
      }
    : {}),
});

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
  /** Removes the toast shown with this id, if it is still showing. */
  dismiss(id: string): void {
    toast.dismiss(id);
  },
};
