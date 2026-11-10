import { useContext } from 'react';

import { SessionContext } from './SessionContext';
import type { SessionContextValue } from './SessionProvider.types';

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }
  return value;
}
