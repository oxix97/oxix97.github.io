export type ContentType = 'blog' | 'study' | 'project' | 'page';

type Publishable = {
  data: {
    contentType: ContentType;
    date?: Date;
    publishedAt?: Date;
    draft?: boolean;
  };
};

export function publicationDate<T extends Publishable>(entry: T): Date | undefined {
  return entry.data.date ?? entry.data.publishedAt;
}

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
    const leftTime = publicationDate(left)?.getTime() ?? Number.NEGATIVE_INFINITY;
    const rightTime = publicationDate(right)?.getTime() ?? Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });
}
