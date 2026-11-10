import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { notify } from '@/components/Toaster/notify';
import {
  type RestoreResult,
  restoreSession,
  signOut as endSession,
} from '@/lib/atproto/session';

import { SessionContext } from './SessionContext';
import type {
  SessionContextValue,
  SessionProviderProps,
  SessionState,
} from './SessionProvider.types';

const toState = (result: RestoreResult): SessionState =>
  result.status === 'restored'
    ? { status: 'signedIn', session: result.session }
    : { status: 'signedOut' };

export function SessionProvider({ children }: SessionProviderProps) {
  const { t } = useLingui();
  const [state, setState] = useState<SessionState>({ status: 'loading' });
  // Increments on every explicit restore or sign-out, so a slower, older
  // restore can never overwrite a newer outcome.
  const generation = useRef(0);

  const apply = useCallback(
    (result: RestoreResult) => {
      setState(toState(result));
      if (result.status === 'expired') {
        notify.info(t`You've been signed out. Please sign in again.`);
      }
    },
    [t]
  );

  useEffect(() => {
    let active = true;
    const started = generation.current;
    restoreSession().then((result) => {
      if (active && started === generation.current) apply(result);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const refresh = useCallback(async () => {
    const started = ++generation.current;
    const result = await restoreSession();
    if (started === generation.current) apply(result);
  }, [apply]);

  const signOut = useCallback(async () => {
    if (state.status !== 'signedIn') return;
    generation.current++;
    await endSession(state.session);
    setState({ status: 'signedOut' });
    notify.success(t`Signed out`);
  }, [state, t]);

  const value = useMemo<SessionContextValue>(
    () => ({ ...state, signOut, refresh }),
    [state, signOut, refresh]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
