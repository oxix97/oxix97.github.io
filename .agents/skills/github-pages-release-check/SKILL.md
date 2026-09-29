---
name: github-pages-release-check
description: Use when asked to commit, push, publish, verify a GitHub Pages release, or diagnose changes missing from this repository's public site. Excludes local-only editing unless release status is requested.
---

# GitHub Pages release check

Distinguish local edits, commits, remote branch state, deployment, and the public page. Follow [repository execution and scope rules](../../../AGENTS.md#task-routing-and-execution). Loading this skill does not authorize a push or deployment.

## Determine the requested endpoint

Reuse the current task's explicit branch and integration instructions. A local commit request ends at a local commit. A push request authorizes the specified remote update; report resulting deployment status without equating push success with publication. A publishing request includes checking the deployed result. A status or diagnosis request is read-only unless a fix is also authorized.

Past use of `main` or direct pushes is not standing permission for future tasks. If “반영” leaves a material destination unclear, inspect the current conversation first, then ask only about the unresolved destination. Complete independent inspection and validation meanwhile. Do not present a generic PR/merge menu when the user has already specified the endpoint.

## Inspect before changing Git state

Check current branch or detached HEAD, worktree, working changes, configured remotes, and the requested target branch. Account for existing user changes; stage only the intended files. Do not overwrite concurrent remote work. Reconcile it within scope and validate the result, without force-pushing or discarding unrelated changes.

A detached HEAD is a Git state, not proof that the requested integration is impossible. Inspect available named branches/worktrees and permissions, then use an authorized safe integration path. Respect explicit user choices about main-branch work. Use the app's managed worktree tools when worktree lifecycle operations are needed, and keep any checkout still in use.

## Validate the intended release

Read `package.json`, the lockfile/package-manager configuration, and `.github/workflows/deploy.yml` rather than copying historical versions or commands. The current repository exposes `verify` for checks, tests, build, and artifact verification. Use existing dependencies and the pinned package manager. Avoid creating another package manager's lockfile.

For a site-affecting release, run the required existing checks on the intended final content before pushing. For skill/instruction-only changes, validate the changed instructions and links; do not add site tests that merely match their wording. Respect explicit user test constraints, disclose skipped validation, and never describe it as passed. CI may still run after a push.

When checks fail, inspect the failure and repair issues caused by the authorized change. Do not remove safeguards to get green CI. Distinguish pre-existing failures and out-of-scope fixes. Missing access or a required external decision blocks only dependent steps; preserve completed work and report the exact limitation.

## Track the commit through deployment

1. Commit/push only if authorized. Use the requested commit language; otherwise use a concise Korean description consistent with this repository.
2. Verify the actual target remote branch contains the intended commit. If it advanced concurrently, confirm ancestry rather than requiring it to equal an older SHA.
3. Find the workflow run for that pushed commit and target branch. Inspect the conclusion of verification, build, and deploy jobs. Overall success with skipped deployment is not publication; the current workflow's manual dispatch does not deploy. Read the workflow before choosing any rerun/dispatch action.
4. For publication, verify the public URL and the changed behavior: numbered sidebar entries, category placement, project card, redirect, or other requested result. Use the browser for visible/interactive behavior and page retrieval for static content as appropriate. If deployment moved to a newer commit, ensure it contains the intended change and identify the actual deployed revision.

Wait in bounded intervals and communicate meaningful progress. Do not poll indefinitely or repeatedly rerun an unchanged failed workflow. If a run remains pending beyond the working session or access is unavailable, report pending/unverified status, the commit/run link, and what remains. A future background check requires the user's scheduling request.

## When the page still looks old

Compare local source, target remote commit, workflow result, deployed artifact when accessible, and the live page. File location, public slug, and rendered sidebar nesting can differ. Investigate build/content caches when source and artifact disagree; inspect browser caching when artifact and browser disagree. Do not diagnose “browser cache” from source files alone or blindly change cache settings. Cache repairs require evidence and authorization within the requested fix.

## Completion report

Report only verified stages, in Korean: intended changes, commit, target branch/push state, validation, deployment state, and public-page check when relevant. Clearly say “로컬만 반영”, “푸시 완료·배포 실패/대기”, or “배포 및 화면 확인 완료” as supported by evidence. Include useful commit/run/page links, not an unsupported blanket “완료”.
