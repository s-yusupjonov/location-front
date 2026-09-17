import { useMemo } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";

const defaultOptions = {
  threshold: 0.4,
  distance: 100,
  ignoreLocation: true,
  minMatchCharLength: 1,
};

export function useFuzzySearch<TItem>(
  items: TItem[],
  keys: string[],
  query: string,
  options?: IFuseOptions<TItem>,
): TItem[] {
  const fuse = useMemo(
    () => new Fuse(items, { ...defaultOptions, keys, ...options }),
    [items, keys, options],
  );

  return useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return items;
    return fuse.search(trimmed).map((result) => result.item);
  }, [fuse, query, items]);
}
