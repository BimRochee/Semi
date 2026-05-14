import { AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';

import { useAppState } from '@/src/hooks/useAppState';

export function useAutoLock() {
  const { hasPin, isLocked, lockApp, state } = useAppState();
  const backgroundedAtRef = useRef<number | null>(null);
  const lockOnBackground = state.settings.lockOnBackground;
  const autoLockMinutes = state.settings.autoLockMinutes;

  useEffect(() => {
    if (!hasPin) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAtRef.current = Date.now();

        if (lockOnBackground && !isLocked) {
          lockApp();
        }

        return;
      }

      if (nextState !== 'active' || autoLockMinutes <= 0) {
        return;
      }

      const backgroundedAt = backgroundedAtRef.current;

      if (!backgroundedAt || isLocked) {
        return;
      }

      const elapsedMinutes = (Date.now() - backgroundedAt) / 1000 / 60;

      if (elapsedMinutes >= autoLockMinutes) {
        lockApp();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [autoLockMinutes, hasPin, isLocked, lockApp, lockOnBackground]);
}
