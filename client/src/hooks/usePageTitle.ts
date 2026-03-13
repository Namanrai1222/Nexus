import { useEffect } from 'react';

const BASE = 'Nexus';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Where Communities Connect`;
  }, [title]);
}
