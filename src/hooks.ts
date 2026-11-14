import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

export function useFavorites() {
  const favs = useLiveQuery(() => db.favs.toArray(), []);
  const ids = useMemo(() => new Set((favs ?? []).map((f) => f.id)), [favs]);
  const toggle = async (id: string) => {
    if (ids.has(id)) await db.favs.delete(id);
    else await db.favs.put({ id });
  };
  return { ids, toggle };
}
