import { createContext } from 'react';

import type { SessionContextValue } from './SessionProvider.types';

export const SessionContext = createContext<SessionContextValue | null>(null);
