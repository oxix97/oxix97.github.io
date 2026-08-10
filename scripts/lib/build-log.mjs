const componentOverridePattern =
  /^.*already have a `(?:LanguageSelect|Pagination|ThemeSelect|SiteTitle|MarkdownContent)` component override.*$/gim;

export function findComponentOverrideWarnings(log) {
  return log.match(componentOverridePattern) ?? [];
}
