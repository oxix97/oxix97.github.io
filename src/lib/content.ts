export type ContentType = 'blog' | 'study' | 'retrospective' | 'project' | 'page';

type Publishable = {
  data: {
    contentType: ContentType;
    publishedAt?: Date;
    draft?: boolean;
  };
};

export function onlyPublished<T extends Publishable>(entries: readonly T[]): T[] {
  return entries.filter((entry) => !entry.data.draft);
}

export function ofType<T extends Publishable>(
  entries: readonly T[],
  contentTypes: readonly ContentType[],
): T[] {
  const accepted = new Set<ContentType>(contentTypes);
  return entries.filter((entry) => accepted.has(entry.data.contentType));
}

export function byNewest<T extends Publishable>(entries: readonly T[]): T[] {
  return [...entries].sort((left, right) => {
    const leftTime = left.data.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY;
    const rightTime = right.data.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });
}
