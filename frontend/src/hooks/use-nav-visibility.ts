'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'fixme_hidden_nav';

export function useNavVisibility() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHidden(new Set(JSON.parse(stored) as string[]));
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const toggle = useCallback((href: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isHidden = useCallback((href: string) => hidden.has(href), [hidden]);

  return { hidden, toggle, isHidden, ready };
}
