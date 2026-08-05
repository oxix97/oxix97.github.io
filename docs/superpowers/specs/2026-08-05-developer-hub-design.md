# Developer Hub on GitHub Pages — Design

## Summary

Build a new personal developer hub from scratch with Astro and deploy it as the
GitHub user site `https://oxix97.github.io`. The local working destination will
be `/Users/chan/Desktop/gongbu/Github Pages`.

The site combines personal branding with four Markdown-driven content areas:
development articles, study notes, retrospectives, and project case studies. It
should help a recruiter understand the developer's focus and strongest work
quickly, while allowing new content to be published through ordinary Git
commits.

## Goals

- Present a clear backend-developer identity on the home page.
- Publish blog posts, study notes, retrospectives, and project case studies from
  Markdown or MDX files.
- Link the resume, GitHub profile, email, and other portfolio destinations.
- Produce fast, accessible, SEO-friendly static HTML.
- Deploy automatically to GitHub Pages after a successful push to `main`.
- Keep content authoring and maintenance simple enough for long-term use.

## Non-goals for the First Release

- A CMS, database, authentication, or server runtime.
- Comments, reactions, newsletters, or visitor accounts.
- Multiple languages.
- A complex animation system.
- Automatic import from Notion or another external content source.

These can be added later if real usage justifies them.

## Information Architecture

The primary navigation will be:

1. Home
2. Blog
3. Study
4. Retrospectives
5. Projects
6. About

The home page will contain:

- A concise hero with name, role, and one-sentence value proposition.
- Primary actions for Projects, Resume, and GitHub.
- A short technical-focus section.
- Two or three featured projects.
- Recent articles, study notes, and retrospectives.
- A compact contact section.

The About page will contain the longer self-introduction, work philosophy,
skills, experience summary, and resume link. Projects will emphasize problem,
decision, implementation, and result rather than a simple technology list.

## Technical Architecture

- **Framework:** Astro 7 in static-output mode.
- **Language:** TypeScript with strict checking.
- **Content:** Local Markdown by default; MDX only when an interactive or
  reusable component materially improves a post.
- **Content model:** Astro Content Collections with schema validation.
- **Styling:** Project-owned CSS using design tokens and scoped component
  styles. Avoid a large UI framework for the initial release.
- **Interactive UI:** Astro components by default. Add React only if a specific
  interactive widget requires it.
- **Search:** Pagefind-generated static search, included only after the primary
  content routes work reliably.
- **Hosting:** GitHub Pages at the user-site root.
- **Deployment:** GitHub Actions using the official Astro Pages action.

Most pages will ship no client-side JavaScript. JavaScript will be added only
to isolated interactive components such as theme controls or search.

## Content Model

Each content collection will validate its front matter at build time.

### Shared fields

- `title`: required string
- `description`: required string
- `publishedAt`: required date
- `updatedAt`: optional date
- `draft`: boolean, default `false`
- `tags`: string array, default empty
- `cover`: optional local image

### Collection-specific fields

- Blog: `category`, optional `series`
- Study: `topic`, optional `difficulty`
- Retrospectives: `period`, optional related project
- Projects: `featured`, `status`, `stack`, `repository`, optional live URL

Draft entries will be excluded from production builds. Collection schemas will
prevent incomplete metadata from reaching the deployed site.

## Visual Direction

The site should feel like a calm, technical editorial publication rather than
a template-heavy developer landing page.

- Strong Korean typography and comfortable long-form reading widths.
- Neutral background with one restrained accent color.
- Clear hierarchy, generous spacing, and minimal decoration.
- Light and dark themes that both meet contrast requirements.
- Project cards prioritize outcomes and technical decisions.
- Mobile navigation and content layouts are first-class, not retrofits.

Exact colors and typography will be selected during implementation, while
preserving this direction.

## Routing and URLs

The repository will be named `oxix97.github.io`, so production is served at the
root URL rather than under a repository subpath.

Examples:

- `/blog/<slug>/`
- `/study/<slug>/`
- `/retrospectives/<slug>/`
- `/projects/<slug>/`
- `/about/`

Routes and asset paths must work at both the local development origin and the
GitHub Pages root. A custom domain is not included in the first release.

## Deployment and Repository Safety

The local project will be created at `/Users/chan/Desktop/gongbu/Github Pages`.
The expected GitHub repository is `oxix97/oxix97.github.io`.

Before creating or pushing the remote repository:

1. Restore GitHub CLI authentication for `oxix97`.
2. Check whether `oxix97/oxix97.github.io` already exists.
3. If it exists, inspect its default branch and contents before any write.
4. Never force-push or overwrite an existing remote history.
5. Create the repository only when it does not already exist.

The GitHub Actions workflow will install locked dependencies, run checks, build
the site, upload the `dist` artifact, and deploy only from `main`. Pull requests
will build without deploying.

## Error Handling

- Invalid front matter fails the build with a clear schema error.
- Broken internal links and missing required images fail validation.
- External links open safely and are checked separately where practical.
- A custom 404 page preserves navigation back to the main content areas.
- Deployment is prevented when type checking or the production build fails.

## Accessibility and SEO

- Semantic landmarks and heading order on every page.
- Full keyboard access and visible focus styles.
- Sufficient light/dark color contrast.
- Reduced-motion support.
- Descriptive alt text for meaningful images.
- Canonical URLs, Open Graph data, RSS, sitemap, and `robots.txt`.
- Per-entry title and description metadata from the validated content schema.

## Verification

The implementation will include checks for:

- TypeScript and Astro diagnostics.
- Production build success.
- Content schema validation.
- Internal link and asset-path correctness.
- Representative home, listing, detail, project, and 404 routes.
- Responsive rendering at mobile and desktop widths.
- Keyboard navigation, focus visibility, and color contrast.
- A local preview of the exact static production output.
- A successful GitHub Pages workflow and reachable production URL.

## Delivery Sequence

1. Scaffold Astro and establish design tokens and the shared layout.
2. Define content collections and add representative Korean sample entries.
3. Build home, collection listings, content detail routes, Projects, and About.
4. Add metadata, RSS, sitemap, 404, theme behavior, and optional static search.
5. Run automated and visual verification.
6. Copy the verified project to the requested Desktop directory.
7. Authenticate GitHub CLI, safely create or connect the user-site repository,
   push `main`, enable Pages through GitHub Actions, and verify production.

## Success Criteria

- A visitor can understand the developer's role and strongest evidence within
  the first home-page viewport and reach a project or resume in one action.
- All four content types can be added with Markdown and a Git commit.
- The site remains readable and functional without client-side JavaScript,
  except for explicitly enhanced features.
- A push to `main` automatically results in a verified GitHub Pages deployment.
- No existing GitHub repository history or user content is overwritten.
