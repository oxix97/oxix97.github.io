# Rapide + Starlight Blog Redesign

## Summary

Replace the current Starlight Obsidian presentation with Rapide and add
`starlight-blog` as the owner of chronological blog behavior. Keep the existing
Astro/Starlight site, published study notes, project case studies, About page,
GitHub Pages root URL, and `main` deployment workflow. Remove the obsolete
retrospective content and the Obsidian-only graph and backlink implementation.

The migration is staged in one feature branch so dependency, theme, blog,
content, and deployment failures can be isolated. Each stage must leave a
buildable site and have an automated contract before the next stage starts.

## Goals

- Adopt the Rapide visual system without copying or maintaining theme internals.
- Use `starlight-blog` for blog listings, pagination, tags, authors, recent and
  featured posts, RSS, and structured data.
- Avoid the Rapide and Blog `ThemeSelect` component override collision.
- Upgrade to the Astro 7 and Starlight 0.41 generation required by Blog 0.28.
- Switch dependency management from npm to pnpm with one committed lockfile.
- Preserve all current study, project, About, and blog article content.
- Introduce Study, Troubleshooting, Projects, and Blog as clear content areas.
- Preserve existing public Study and Project URLs while reorganizing files.
- Keep GitHub Pages deployment on `main` with static output at the user-site root.

## Non-goals

- Giscus comments, analytics, Mermaid, multilingual content, automatic Open
  Graph image generation, or Obsidian vault synchronization.
- Inventing PromptHub or troubleshooting case studies that do not yet exist.
- Reproducing Obsidian graph or backlink behavior after removing that theme.
- Changing the repository name, public domain, or GitHub Pages deployment model.
- Redesigning the resume PDF.

## Compatibility Baseline

Use exact dependency versions for reproducible builds:

- Node.js 24 in local and GitHub Actions environments. This satisfies the
  `>=22.12.0` floor required by Astro 7 and `starlight-blog` 0.28.0.
- pnpm 11.21.0 through Corepack, with `packageManager` pinned to
  `pnpm@11.21.0` in `package.json`.
- Astro 7.2.0.
- `@astrojs/starlight` 0.41.7.
- `starlight-theme-rapide` 0.5.2.
- `starlight-blog` 0.28.0.

Rapide 0.5.2 supports Starlight 0.34 and newer. Blog 0.28.0 requires Starlight
0.41 or newer and Node 22.12 or newer. The selected versions are the newest
compatible releases verified from the npm registry on 2026-08-10.

## Plugin Composition and Component Ownership

Configure the plugins in this order:

1. `starlight-theme-rapide`
2. `starlight-blog`

Rapide owns `LanguageSelect`, `Pagination`, and `ThemeSelect`. Blog is configured
with `navigation: 'header-start'`, so it owns `SiteTitle` and
`MarkdownContent`, adds the Blog link beside the site title, and does not try to
override `ThemeSelect`. A production build must not emit duplicate component
override warnings.

The current custom `PageTitle` override remains only if Starlight 0.41 and
Rapide still require it for one-H1 rendering. Otherwise it is removed with its
contract replaced by an output-level heading test.

## Content Architecture

Starlight's existing `docs` collection remains the single content collection.
The directory responsibilities are:

- `study/`: evergreen, hierarchical knowledge notes.
- `troubleshooting/`: evidence-based project problem-solving records following
  the PAR structure.
- `projects/`: project context, architecture, decisions, and outcomes.
- `blog/`: chronological Dev Log, Retrospective, and Career posts handled by
  `starlight-blog`.
- `about`: long-form personal and professional introduction.

The current `retrospectives/` directory and its 2026 first-half retrospective
are deleted without a redirect, as explicitly approved. The Retrospective
content type remains available only as a future Blog subcategory, not as a
top-level route.

Existing study and project documents may move into clearer physical folders,
but their current public paths remain stable through explicit Starlight `slug`
frontmatter when a move changes the inferred URL. Existing content is not
rewritten merely to satisfy the new taxonomy.

The first release creates useful index pages for Study, Troubleshooting, and
Projects. Empty topic directories and fabricated placeholder articles are not
committed.

## Blog Model

Blog entries live below `src/content/docs/blog/`. The current technical
decision article is retained and migrated from `publishedAt` to Blog's `date`
field. Blog frontmatter uses:

- `date`: required publication date for a post.
- `authors`: a configured author key or inline author.
- `tags`: optional list of tags.
- `excerpt`: concise listing copy.
- `featured`: optional featured-post flag.
- `cover`: optional accessible cover image.

The global author configuration identifies `oxix97` and links to the GitHub
profile. `starlight-blog` generates `/blog/`, tag pages, author pages,
pagination, `/blog/rss.xml`, structured data, recent posts, and featured posts.

The existing root `/rss.xml` feed remains as a temporary compatibility feed
backed by the same published Blog data. `/blog/rss.xml` is the canonical feed
advertised in page metadata and site navigation.

## Home and Navigation

Replace the Obsidian-specific custom Astro home shell with a Starlight splash
page authored in MDX. The home page keeps the current Korean positioning,
Projects, Resume, and GitHub calls to action, but adopts Rapide's spacing,
typography, surfaces, light/dark color system, and Expressive Code themes.

Two small project-owned components remain:

- `ProjectCard.astro`: renders a project title, problem-oriented summary,
  status, stack, and internal destination.
- `TechBadge.astro`: renders one technology label with a consistent accessible
  style.

Primary navigation is Home, Study, Troubleshooting, Projects, Blog, and About.
The previous Retrospectives entry is removed. Blog's header-start navigation
link must appear exactly once and remain reachable from the mobile menu.

## Removals

Remove the following Obsidian-only implementation after replacement contracts
are failing and ready:

- `starlight-theme-obsidian` and `starlight-site-graph` dependencies.
- `pageThemeObsidianSchema` from the content schema.
- The browser `micromatch` Vite alias and its compatibility module and tests.
- Graph, backlinks, and Obsidian-specific frontmatter.
- Graph/backlink artifact checks and Obsidian-specific CSS variables.
- The top-level Retrospectives navigation, index, and post.
- `package-lock.json` after `pnpm-lock.yaml` has been generated successfully.

## Error Handling and Migration Gates

- Package installation fails on unsupported Node or incompatible peer ranges.
- Content schema errors fail Astro checking before a production build.
- Blog entries missing `date` fail the Blog content contract.
- Theme or Blog component override warnings fail an explicit build-log check.
- Missing expected Blog, tag, RSS, Study, Project, About, search, sitemap, or 404
  artifacts fail production artifact verification.
- Existing Study and Project canonical routes are asserted before and after file
  moves.
- GitHub Pages deploys only after checks, tests, build, and artifact verification
  succeed.

## Testing Strategy

Use Vitest contract tests and production artifact verification:

- Dependency and configuration contracts assert exact package versions, plugin
  order, `navigation: 'header-start'`, and the absence of Obsidian packages.
- Content tests assert Blog dates and author metadata, removal of retrospective
  content, URL-preserving slugs, and the presence of each top-level index.
- Build verification checks home content, one H1, Pagefind, sitemap, 404,
  `/blog/`, `/blog/rss.xml`, compatibility `/rss.xml`, tag and author routes,
  and representative preserved Study and Project URLs.
- Build logs are captured in CI and checked for duplicate component override
  warnings.
- Browser-level visual QA covers desktop and mobile layouts, the Blog link,
  mobile navigation, light/dark switching, keyboard focus, and horizontal
  overflow.

## Staged Delivery

1. Establish the Node 24 and pnpm toolchain without changing the current Astro
   and Starlight versions, then prove the baseline with the pnpm lockfile.
2. Upgrade Astro and Starlight and replace Obsidian with Rapide in one atomic
   stage because Obsidian 0.4.1 cannot run on the Astro 7 integration API. Remove
   obsolete graph compatibility code only after Rapide contracts pass.
3. Add `starlight-blog` with header-start navigation and migrate the existing
   Blog article and RSS behavior.
4. Remove Retrospectives, add Troubleshooting, and reorganize Study and Projects
   while preserving published routes.
5. Replace the home shell and custom CSS with the Rapide-aligned MDX landing
   page and focused project components.
6. Update GitHub Actions for pnpm, run full automated and visual verification,
   then merge to `main` only after all gates pass.

## Success Criteria

- Rapide controls the visible Starlight theme in both light and dark modes.
- Blog listing, post, tag, author, featured/recent UI, structured data, and RSS
  are produced by `starlight-blog` without component override warnings.
- Search, sitemap, 404, About, Study, Projects, and GitHub Pages deployment keep
  working.
- Existing Study and Project URLs remain valid.
- The approved retrospective content and top-level route are absent.
- `pnpm install --frozen-lockfile`, Astro checks, all tests, the production
  build, artifact verification, and visual QA pass before merging to `main`.
