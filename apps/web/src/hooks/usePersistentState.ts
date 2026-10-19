/**
 * usePersistentState.ts
 * EPC Suite React Hook for persistent, stateful component state.
 * Syncs seamlessly with localStorage and broadcasts updates across components.
 */

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { getStoredItem, setStoredItem } from '../utils/persistentStorage';

export function usePersistentState<T>(
  key: string,
  defaultValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const initial = typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
    return getStoredItem<T>(key, initial);
  });

  const setPersistentState: Dispatch<SetStateAction<T>> = useCallback(
    (action) => {
      setState((prevState) => {
        const nextState = typeof action === 'function' ? (action as (prev: T) => T)(prevState) : action;
        setStoredItem(key, nextState);
        return nextState;
      });
    },
    [key]
  );

  // Sync state if another component or utility modifies this key
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ key: string; value: any }>;
      if (ce.detail && (ce.detail.key === key || ce.detail.key === '__ALL__')) {
        const initial = typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
        setState(getStoredItem<T>(key, initial));
      }
    };

    window.addEventListener('epc-storage-update', handler);
    return () => window.removeEventListener('epc-storage-update', handler);
  }, [key, defaultValue]);

  return [state, setPersistentState];
}
