# Developer Hub on GitHub Pages — Revised Design

## Summary

Build a new Korean personal developer hub from scratch with Astro, Starlight,
and the Starlight Obsidian theme, then deploy it as the GitHub user site
`https://oxix97.github.io`. The requested local delivery destination is
`/Users/chan/Desktop/gongbu/Github Pages`.

The site combines a portfolio-oriented landing page with an Obsidian-like
knowledge base. Development articles, study notes, retrospectives, project case
studies, and the longer self-introduction are written as Markdown or MDX and
published through ordinary Git commits.

## Goals

- Present a clear backend-developer identity and strongest evidence on the home
  page.
- Publish all long-form content from local Markdown or MDX files.
- Make relationships between notes visible through backlinks and a site graph.
- Link the resume, GitHub profile, email, and other portfolio destinations.
- Produce fast, accessible, searchable, SEO-friendly static HTML.
- Deploy automatically to GitHub Pages after a successful push to `main`.
- Keep authoring and maintenance simple enough for long-term use.

## Non-goals for the First Release

- A CMS, database, authentication, or server runtime.
- Comments, reactions, newsletters, or visitor accounts.
- Multiple languages.
- A complex animation system.
- Automatic import from Notion or an Obsidian vault.

These can be added later if real usage justifies them.

## Chosen Product Shape

Use a hybrid Starlight site rather than a conventional marketing site or four
independent Astro content collections:

1. A custom Astro home page at `/` uses Starlight's page shell and the Obsidian
   theme, but is arranged for personal branding, featured projects, recent
   writing, and contact actions.
2. One typed Starlight `docs` collection stores all long-form content below
   `src/content/docs/`.
3. Folder names provide stable public routes and sidebar groups: `blog`,
   `study`, `retrospectives`, `projects`, and `about`.
4. Starlight provides Markdown/MDX rendering, navigation, table of contents,
   static search, sitemap integration, and accessible documentation primitives.
5. Starlight Obsidian provides the dark editorial visual system, backlinks, and
   graph view.

This structure preserves Starlight's knowledge-base strengths while giving the
home page enough freedom to work as a resume and self-promotion entry point.

## Information Architecture

The primary navigation is:

1. Home
2. Blog
3. Study
4. Retrospectives
5. Projects
6. About

The home page contains:

- A concise hero with name, role, and one-sentence value proposition.
- Primary actions for Projects, Resume, and GitHub.
- A short technical-focus section.
- Two or three featured projects.
- Recent development articles, study notes, and retrospectives.
- A compact contact section.

The About page contains the longer self-introduction, work philosophy, skills,
experience summary, and resume link. Project pages emphasize problem,
constraints, decision, implementation, measurable result, and next improvement
rather than a technology list alone.

## Technical Architecture

- **Framework:** Astro 5 in static-output mode.
- **Documentation framework:** `@astrojs/starlight` 0.35 or a compatible locked
  version.
- **Theme:** `starlight-theme-obsidian` 0.4.1, used as a real Starlight plugin
  under its MIT license.
- **Graph dependency:** `starlight-site-graph` 0.5, required by the theme.
- **Language:** TypeScript with strict checking.
- **Content:** Local Markdown by default; MDX only when a reusable component
  materially improves an entry.
- **Content model:** One Starlight `docs` collection extended with a validated
  custom schema.
- **Home:** `src/pages/index.astro` rendered with Starlight's `StarlightPage`
  component using a splash-style layout.
- **Styling:** The theme owns the base UI. Project-owned CSS variables and small
  components add the oxix97 identity without copying the reference site's
  branding or proprietary assets.
- **Search:** Starlight's Pagefind-backed static search.
- **Hosting:** GitHub Pages at the user-site root.
- **Deployment:** GitHub Actions using the official Astro Pages workflow.

The build-verified compatibility baseline on 2026-08-05 is Astro 5.18.2,
Starlight 0.35.3, Starlight Obsidian 0.4.1, and starlight-site-graph 0.5.0. Astro
7.1.6 and Starlight 0.41.6 satisfy the declared peer range but fail at runtime
because the theme's graph integration still uses an Astro 5 integration API. Exact
versions will be locked in `package-lock.json` and verified by a production
build before delivery.

## Content Model

Every entry in `src/content/docs/` uses Starlight's standard frontmatter plus a
small custom extension.

### Shared custom fields

- `contentType`: `blog`, `study`, `retrospective`, `project`, or `page`
- `publishedAt`: required for publishable records; omitted only for evergreen
  pages such as About
- `updatedAt`: optional date
- `tags`: string array, default empty
- `featured`: boolean, default `false`
- `draft`: Starlight's built-in draft field

### Optional type-specific fields

- Blog: `category`, optional `series`
- Study: `topic`, optional `difficulty`
- Retrospective: `period`, optional related project
- Project: `status`, `stack`, optional repository and live URL

The extended schema validates field types at build time. Production home and
listing queries exclude drafts. Folder placement and `contentType` must agree;
an artifact verification script checks representative URLs and metadata.

## Visual Direction: Starlight Obsidian

The reference is the official Starlight Obsidian theme documentation. The site
uses the package itself and customizes it for oxix97 instead of reproducing the
reference site's name, copy, icons, or assets.

### Desktop

- Near-black base around `#111213` with restrained borders and surfaces.
- Muted off-white body text and a purple accent close to
  `hsl(258 61% 66%)`.
- A sticky hierarchy sidebar on the left, a focused reading column of roughly
  `45rem`, and a contextual rail on the right for graph, table of contents, and
  backlinks.
- Editorial typography, compact metadata, strong code blocks, and restrained
  callouts.
- The home page keeps the same colors and rhythm but uses a wider splash layout
  for hero, evidence cards, and recent records.

### Mobile

- Compact top navigation with the sidebars and graph rail collapsed.
- A single full-width reading column with approximately `1rem` page padding.
- Touch targets of at least 44px, visible focus states, and no horizontal
  scrolling for prose or code.
- Cards collapse to one column and preserve Projects, Resume, and GitHub near
  the top of the home page.

Light mode remains available through Starlight's theme control, but dark mode is
the primary art direction. Reduced-motion preferences are respected.

## Routing and URLs

The repository is expected to be named `oxix97.github.io`, so production is
served at the root URL rather than under a repository subpath.

Examples:

- `/blog/<slug>/`
- `/study/<slug>/`
- `/retrospectives/<slug>/`
- `/projects/<slug>/`
- `/about/`

Routes and asset paths must work at both the local development origin and the
GitHub Pages root. A custom domain is not included in the first release.

## Deployment and Repository Safety

The local project is first built and verified in the Codex workspace, then
copied to `/Users/chan/Desktop/gongbu/Github Pages`. The expected GitHub
repository is `oxix97/oxix97.github.io`.

Before creating or pushing the remote repository:

1. Restore GitHub CLI authentication for `oxix97`.
2. Check whether `oxix97/oxix97.github.io` already exists.
3. If it exists, inspect its default branch and contents before any write.
4. Never force-push or overwrite existing remote history.
5. Create the repository only when it does not already exist.

The GitHub Actions workflow installs locked dependencies, runs checks and tests,
builds the site, uploads the `dist` artifact, and deploys only from `main`. Pull
requests build without deploying.

## Error Handling

- Invalid frontmatter fails the build with a schema error.
- Broken representative internal links and missing required assets fail artifact
  verification.
- Theme/plugin peer-dependency conflicts fail installation or the production
  build and block delivery.
- External links open safely and are checked separately where practical.
- Starlight's 404 page preserves navigation back to the main content areas.
- Deployment is prevented when checks, tests, or the production build fail.

## Accessibility and SEO

- Semantic landmarks and heading order on every page.
- Full keyboard access and visible focus styles.
- Sufficient light/dark color contrast.
- Reduced-motion support.
- Descriptive alt text for meaningful images.
- Canonical URLs, Open Graph data, RSS, sitemap, and `robots.txt`.
- Per-entry title and description metadata from the validated schema.
- Korean document language and locale-aware dates.

## Verification

The implementation includes checks for:

- TypeScript and Astro diagnostics.
- Production build success with the locked plugin versions.
- Extended Starlight frontmatter validation.
- Draft filtering and newest-first sorting on the home page.
- Internal route and asset-path correctness.
- Representative home, content, project, About, RSS, sitemap, and 404 output.
- Presence of Starlight search plus Obsidian graph and backlink UI.
- Responsive rendering at mobile and desktop widths.
- Keyboard navigation, focus visibility, color contrast, and reduced motion.
- A local preview of the exact static production output.
- A successful GitHub Pages workflow and reachable production URL.

## Delivery Sequence

1. Scaffold the locked Astro 5, Starlight, Starlight Obsidian, and graph stack.
2. Extend the Starlight docs schema and add representative Korean Markdown.
3. Apply oxix97 branding and build the custom splash-style home components.
4. Configure sidebar groups, About, projects, RSS, robots, and 404.
5. Run automated, production-artifact, and visual verification.
6. Copy the verified project to the requested Desktop directory.
7. Authenticate GitHub CLI, safely create or connect the user-site repository,
   push `main`, enable Pages through GitHub Actions, and verify production.

## Success Criteria

- A visitor understands the developer's role and strongest evidence within the
  first home-page viewport and can reach a project or resume in one action.
- Blog, study, retrospective, project, and About content can be maintained with
  Markdown and Git commits.
- Long-form pages visibly use the Starlight Obsidian layout with working search,
  table of contents, graph view, and backlinks.
- The site remains readable and functional when optional client enhancements do
  not load.
- A push to `main` automatically results in a verified GitHub Pages deployment.
- No existing GitHub repository history or user content is overwritten.
