# Nordeo and JETSI React Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the corporate and journal products into independent React and Tailwind CSS applications without retaining duplicated JETSI implementation in the Nordeo repository.

**Architecture:** Both repositories use Vite, React, Tailwind CSS, and declarative client routing. Nordeo owns corporate content and an external journal portfolio; JETSI owns journal routes and consumes a typed data service that can use local fixtures until a server-side OJS proxy is configured.

**Tech Stack:** React, Vite, Tailwind CSS, React Router, Vitest, Testing Library.

---

## File Structure

### Nordeo repository

- `package.json` - development, build, test, lint scripts and dependencies.
- `src/main.jsx` - React entry point.
- `src/App.jsx` - route definitions.
- `src/styles.css` - Tailwind import plus Nordeo tokens.
- `src/components/CorporateLayout.jsx` - shared header, mobile menu, footer, and journal link.
- `src/data/pages.js` - corporate page content and menu definitions.
- `src/pages/CorporatePage.jsx` - route-aware content page renderer.
- `src/pages/JournalPortfolioPage.jsx` - Nordeo journal catalog with external JETSI link.
- `src/config/links.js` - configurable external URLs.
- `src/App.test.jsx` - route and outbound-link behavior.

### JETSI repository

- `package.json`, `vite.config.js`, `index.html` - Vite application setup.
- `src/main.jsx`, `src/App.jsx`, `src/styles.css` - application entry, routes, and Stitch tokens.
- `src/components/JournalLayout.jsx` - utility ribbon, header, navigation, mobile drawer, sidebar, and footer.
- `src/data/journal.js` - local JETSI fixture data from the supplied reference.
- `src/lib/journalService.js` - local/OJS data boundary with safe fallback.
- `src/pages/HomePage.jsx`, `ArchivePage.jsx`, `AnnouncementsPage.jsx`, `EditorialPage.jsx`, `AboutPage.jsx`, `SubmissionsPage.jsx`, `ArticlePage.jsx` - journal routes.
- `src/App.test.jsx`, `src/lib/journalService.test.js` - route shell and service fallback coverage.
- `public/jetsi/` - copied JETSI logo, cover, and homepage image assets only.

### Task 1: Establish the React and Tailwind baseline in both repositories

**Files:**
- Create: `package.json`, `vite.config.js`, `src/main.jsx`, `src/styles.css` in both repositories.
- Test: `src/App.test.jsx` in both repositories.

- [ ] **Step 1: Write failing route-shell tests**

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';

test('renders a named site header', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('banner')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and verify it fails because `App` does not exist**

Run: `npm test -- --run src/App.test.jsx`

Expected: test runner reports a missing module.

- [ ] **Step 3: Add the minimal Vite entry and route shell**

```jsx
import { BrowserRouter } from 'react-router';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
```

- [ ] **Step 4: Run the test and production build**

Run: `npm test -- --run src/App.test.jsx && npm run build`

Expected: both commands exit 0.

- [ ] **Step 5: Commit each repository**

```bash
git add package.json package-lock.json vite.config.js index.html src
git commit -m "feat: initialize React and Tailwind application"
```

### Task 2: Convert Nordeo into the corporate application

**Files:**
- Create: `src/components/CorporateLayout.jsx`, `src/data/pages.js`, `src/config/links.js`, `src/pages/CorporatePage.jsx`, `src/pages/JournalPortfolioPage.jsx`.
- Modify: `src/App.jsx`, `src/App.test.jsx`.
- Remove after build verification: legacy `journals/jetsi/index.html`.

- [ ] **Step 1: Write failing tests for the corporate journal portfolio**

```jsx
test('keeps Jurnal Pengmas internal and sends JETSI to the configured external URL', () => {
  render(<MemoryRouter initialEntries={['/journals']}><App /></MemoryRouter>);
  expect(screen.getByRole('link', { name: /visit jetsi/i })).toHaveAttribute('href', 'https://nordeoscholar.com/jetsi');
  expect(screen.getByRole('link', { name: /pengmas/i })).toHaveAttribute('href', '/journals/jurnalpengmas');
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --run src/App.test.jsx`

Expected: missing portfolio route or links.

- [ ] **Step 3: Implement focused data-driven navigation**

```js
export const links = { jetsi: import.meta.env.VITE_JETSI_URL || 'https://nordeoscholar.com/jetsi' };
export const corporatePages = { '/about': { title: 'About Nordeo' }, '/services': { title: 'Services' } };
```

Use `CorporateLayout` for all internal routes; it receives page content through `Outlet` and reads its links from `links.js`.

- [ ] **Step 4: Run tests and build**

Run: `npm test -- --run && npm run build`

Expected: 0 failing tests and a `dist/` directory.

- [ ] **Step 5: Remove the legacy JETSI implementation and commit**

Run: `git rm journals/jetsi/index.html`

Expected: Git stages only the legacy JETSI page removal; no Nordeo corporate file is removed.

```bash
git add src journals/jetsi/index.html
git commit -m "feat: separate JETSI from Nordeo portal"
```

### Task 3: Build the JETSI journal portal from the Stitch reference

**Files:**
- Create: `src/components/JournalLayout.jsx`, `src/data/journal.js`, all files under `src/pages/` listed above.
- Copy: the three supplied JETSI images into `public/jetsi/`.
- Modify: `src/App.jsx`, `src/App.test.jsx`, `src/styles.css`.

- [ ] **Step 1: Write failing route tests**

```jsx
test.each(['/','/archives','/announcements','/editorial-team','/about','/submissions','/articles/banyuwangi-tourism-app'])('renders the journal shell at %s', (path) => {
  render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
  expect(screen.getByRole('banner')).toHaveTextContent(/jetsi/i);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --run src/App.test.jsx`

Expected: missing route modules.

- [ ] **Step 3: Implement the shared journal shell and local fixture contract**

```js
export const journal = {
  title: 'Journal of Engineering Technology and Science Integration',
  issn: '3164-5208',
  routes: ['/', '/current-issue', '/archives', '/announcements', '/editorial-team', '/about', '/submissions'],
};
```

The shell must provide desktop navigation, an accessible mobile menu button, active route state, the teal/amber Stitch tokens, and a publisher link to Nordeo.

- [ ] **Step 4: Run tests and build**

Run: `npm test -- --run && npm run build`

Expected: all routes render and the build succeeds.

- [ ] **Step 5: Commit**

```bash
git add public src
git commit -m "feat: build JETSI journal portal"
```

### Task 4: Add the secure OJS readiness boundary

**Files:**
- Create: `src/lib/journalService.js`, `src/lib/journalService.test.js`, `.env.example`, `docs/ojs-integration.md` in `jetsi-website`.

- [ ] **Step 1: Write a failing fallback test**

```js
import { getCurrentIssue } from './journalService';

test('uses local data when the protected OJS proxy is unavailable', async () => {
  await expect(getCurrentIssue({ fetcher: () => Promise.reject(new Error('offline')) })).resolves.toMatchObject({ volume: '1', number: '1' });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --run src/lib/journalService.test.js`

Expected: missing export.

- [ ] **Step 3: Add the minimal service boundary**

```js
import { currentIssue } from '../data/journal';

export async function getCurrentIssue({ fetcher = fetch } = {}) {
  try {
    const response = await fetcher('/api/ojs/issues/current');
    if (!response.ok) throw new Error('OJS unavailable');
    return response.json();
  } catch {
    return currentIssue;
  }
}
```

- [ ] **Step 4: Document the secret boundary and verify tests**

Run: `npm test -- --run src/lib/journalService.test.js && rg -n "OJS.*TOKEN|Authorization: Bearer" --glob '!node_modules/**'`

Expected: test passes; documentation explains server-side-only secrets and no token appears in client source.

- [ ] **Step 5: Commit**

```bash
git add src .env.example docs/ojs-integration.md
git commit -m "feat: add OJS-ready journal data boundary"
```

### Task 5: Verify separation and publish both applications

**Files:**
- Modify: `README.md` in both repositories.

- [ ] **Step 1: Verify file ownership**

Run in Nordeo: `git ls-files | rg '^journals/jetsi/'`

Expected: no output.

Run in JETSI: `git ls-files | rg 'src/pages|src/components|public/jetsi'`

Expected: JETSI portal source and assets are tracked.

- [ ] **Step 2: Run full verification in both repositories**

Run: `npm test -- --run && npm run build`

Expected: tests and production build exit 0 in both repositories.

- [ ] **Step 3: Push both main branches and compare local/remote SHAs**

```bash
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Expected: the two SHAs match for each repository.
