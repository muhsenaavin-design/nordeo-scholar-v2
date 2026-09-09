# Nordeo and JETSI Repository Split Design

## Goal

Maintain two independent React and Tailwind CSS applications:

- `nordeo-scholar-v2` is the Nordeo corporate website.
- `jetsi-website` is the JETSI journal portal.

The existing Stitch directory is a design and content reference only. Its generated HTML will not be copied into either product repository as production code.

## Repository Ownership

### Nordeo (`nordeo-scholar-v2`)

Owns the corporate homepage, corporate assets, About, Books, Services, News, Research, Education, Community Service, Innovation, Academic Events, Collaboration, Contact, legal pages, and the journal portfolio page.

`journals/index.html` becomes a Nordeo-owned portfolio route that links to external journal applications. `journals/jurnalpengmas/` remains in Nordeo until it has an independent portal requirement.

The legacy `journals/jetsi/index.html` is removed from Nordeo after the JETSI portal owns its replacement. No JETSI page source is duplicated in Nordeo.

### JETSI (`jetsi-website`)

Owns the following routes, recreated from the Stitch reference:

- `/` - journal homepage and current-issue summary
- `/current-issue` - issue-focused view
- `/archives` - issue catalog
- `/announcements` - calls and journal announcements
- `/editorial-team` - editorial and advisory board
- `/about` - journal profile and editorial policies
- `/submissions` - author guidelines and submission resources
- `/articles/:slug` - article detail

The shared JETSI shell contains the utility ribbon, journal header, responsive menu, footer, and mobile drawer. The current Stitch navigation items without a dedicated reference screen (`reviewers`, `search`, `register`, and `login`) are represented as explicit integration links or deferred routes; they are not fabricated as static content pages.

## Application Structure

Each repository uses an independent React application with Tailwind CSS, a route-aware layout, and reusable components. There is no shared package in version one; duplicated tokens are intentionally small and locally owned to avoid cross-repository release coupling.

Nordeo components include `CorporateHeader`, `CorporateFooter`, `JournalPortfolio`, and generic page content sections. JETSI components include `JournalHeader`, `JournalNav`, `MobileJournalMenu`, `IssueCard`, `ArticleCard`, `SidebarModules`, and `JournalFooter`.

JETSI design tokens follow the supplied Stitch system: deep teal, teal, amber/gold, Plus Jakarta Sans headings, Inter body text, responsive 12-column layout, and a 340px desktop sidebar. Nordeo keeps its corporate identity while adopting the same accessibility and responsive implementation standards.

## Data and OJS Integration

JETSI needs current issues, articles, announcements, and article metadata from OJS. Public checks against the current OJS API endpoints return `403 Unauthorized`, so the browser must never receive an OJS API token.

JETSI will call a same-origin backend-for-frontend endpoint (for example `/api/ojs/*`) or a serverless equivalent. That server-side boundary stores the OJS token in deployment secrets, sends the authenticated request to OJS, validates the response, and returns only the fields required by the UI.

Until OJS credentials and the deployment target are available, UI development uses typed local fixtures mirroring the OJS response shape. No token is committed to Git, placed in a Vite environment variable exposed to the browser, or pasted into chat.

Nordeo consumes no OJS API. Its journal portfolio links are environment-configured external URLs, beginning with the existing JETSI URL until the new deployment URL is known.

## Navigation and Cross-Links

Nordeo has one canonical outbound JETSI link. JETSI has an explicit publisher link back to Nordeo. Both are configured in their respective application configuration rather than duplicated across page components.

The Nordeo journal portfolio continues to list JETSI and Jurnal Pengmas. JETSI-owned pages and assets do not remain under the Nordeo route tree after the cutover.

## Error Handling and Accessibility

The JETSI OJS boundary distinguishes unavailable, unauthorized, malformed, and empty responses. The UI shows a compact retry state while retaining the page shell and cached or fixture content where appropriate.

Both applications provide keyboard-operable menus, visible focus states, semantic landmarks, descriptive image alternatives, and a mobile navigation control that the Stitch reference currently lacks.

## Verification

- Build and lint each React application independently.
- Verify every Nordeo menu route resolves internally or points to a configured external journal URL.
- Verify each JETSI navigation route renders the expected shared header, footer, and active state.
- Verify mobile menu keyboard and viewport behavior.
- Verify no OJS secret is present in Git history, tracked files, or browser bundles.
- Verify `nordeo-scholar-v2` has no JETSI portal implementation after cutover and `jetsi-website` owns all JETSI implementation files.

## Out of Scope

- A separate Jurnal Pengmas repository.
- OJS administration, submission workflow changes, or data migration.
- A shared cross-repository component package.
