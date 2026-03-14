import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook that manages state in localStorage.
 * Compatible with React 19 concurrent features by using standard useState/useEffect patterns
 * with robust error handling for JSON operations.
 */
export function useLocalStorageState<T>(key: string, initialState: T) {
  // Initialize state with value from localStorage or initialState
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      // If error, we'll fall back to initialState
    }
    return initialState;
  });

  // Update localStorage whenever state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  // Handle cross-tab synchronization (optional but good practice)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setState(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [state, setState] as const;
}
