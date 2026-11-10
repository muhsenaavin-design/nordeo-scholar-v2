# Journal Finder Split — Implementation Plan

> **For agentic workers:** Execute inline. Steps use checkbox syntax. Spec: `docs/superpowers/specs/2026-11-10-journal-finder-split-design.md`.

**Goal:** Homepage `#jurnal` (journal finder) and `#artikel` (published articles) become two sibling sections; `/journals` keeps the combined block.

**Architecture:** `JournalFinder.jsx` keeps shared state and composes two presentational components, `JournalDirectory` and `PublishedArticles`. `layout="split"` renders two `<section>`s; the default renders one.

**Tech Stack:** React 19, Vite, Vitest + Testing Library, plain CSS.

---

### Task 1: Lock the behaviour with tests

**Files:** Modify `src/App.test.jsx:118-133`

- [ ] **Step 1: Update the homepage journal finder test**

```jsx
test('journal finder on the homepage filters journals only and keeps articles separate', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const search = screen.getByRole('searchbox', { name: /search journals/i });
  fireEvent.change(search, { target: { value: 'Shopee' } });
  expect(screen.getByText('1 journal')).toBeInTheDocument();
  expect(screen.getByText('4 of 14 articles · JETSI')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Clear/ }));
  fireEvent.click(screen.getByRole('button', { name: /^JIEL/ }));
  expect(screen.getByRole('heading', { name: /jiel is open for its first submissions/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Add the two-section test**

```jsx
test('homepage keeps the journal finder and published articles as separate sections', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const finder = screen.getByRole('heading', { level: 2, name: /find the journal that fits/i });
  const articles = screen.getByRole('heading', { level: 2, name: /published articles/i });
  expect(finder.closest('section')).toHaveAttribute('id', 'jurnal');
  expect(articles.closest('section')).toHaveAttribute('id', 'artikel');
  expect(document.getElementById('jurnal')).not.toContainElement(articles);
});
```

- [ ] **Step 3: Run tests — expect both to fail**

Run: `npm run test:run -- src/App.test.jsx`
Expected: FAIL (only one section, status still "1 journal · 2 articles").

### Task 2: Extract `JournalDirectory`

**Files:**
- Create: `src/components/JournalDirectory.jsx`
- Modify: `src/components/JournalFinder.jsx`

- [ ] **Step 1:** Move `DirectoryCard`, `categoryCount`, `visitLabel` into `JournalDirectory.jsx` (export `DirectoryCard` default-free). Keep identical markup.
- [ ] **Step 2:** `JournalDirectory` renders the `finder-head`, sidebar/toolbar, cards, and empty states. Props: `side`, `combined`, `query`, `onQueryChange`, `category`, `onChooseCategory`, `journals`, `selectedJournal`, `onShowArticles`, `articleCount`, `onReset`, `children` (articles block, combined layout only).
- [ ] **Step 3:** Result line: combined → `4 journals · 14 articles`; split → `4 journals`.
- [ ] **Step 4:** Empty copy: split → "No journal matches this search. Try another keyword, or show all fields."; combined keeps current copy.
- [ ] **Step 5:** Run tests — refactor alone must not change results.

### Task 3: Extract `PublishedArticles`

**Files:**
- Create: `src/components/PublishedArticles.jsx`
- Modify: `src/components/JournalFinder.jsx`

- [ ] **Step 1:** Move `ArticleCard` and the whole article block (head, journal tabs, focus chips, grid, empty state, footer).
- [ ] **Step 2:** Props: `headingLevel` (2 split / 3 combined), `showLead`, `journal`, `journals`, `articles`, `visibleArticles`, `searchPool`, `topic`, `topicCounts`, `onSelectJournal`, `onSelectTopic`, `limit`, `showArchiveLink`, `hasArticleFilters`, `onResetFilters`, `wrapperId`, `wrapperRef`.
- [ ] **Step 3:** Heading id `published-articles-heading` only when `headingLevel === 2`. Card title level = `headingLevel + 1`.
- [ ] **Step 4:** Lead paragraph when `showLead`: "Peer-reviewed work from the Nordeo journals, with the full text and DOI on each journal platform."
- [ ] **Step 5:** Run tests — should still pass.

### Task 4: Split layout + homepage wiring

**Files:**
- Modify: `src/components/JournalFinder.jsx`
- Modify: `src/pages/Home.jsx:92`

- [ ] **Step 1:** In `JournalFinder`, `split = layout === 'split'`; article search is `split ? '' : search`; `hasArticleFilters` uses that query.
- [ ] **Step 2:** Split render:

```jsx
<>
  <section className="journal-finder is-sidebar" id="jurnal" aria-labelledby="journal-finder-heading">
    <JournalDirectory ... combined={false} side />
  </section>
  <section className="articles-section" id="artikel" aria-labelledby="published-articles-heading" ref={articleRef}>
    <PublishedArticles headingLevel={2} showLead ... />
  </section>
</>
```

- [ ] **Step 3:** Combined render keeps one `<section id="jurnal">`, articles inside `.finder-main` via children, `wrapperId="artikel"`, `wrapperRef={articleRef}`.
- [ ] **Step 4:** `Home.jsx` → `<JournalFinder limit={4} layout="split" />`.
- [ ] **Step 5:** Delete dead duplicate markup.

### Task 5: CSS

**Files:** `src/styles.css`, `src/redesign.css`

- [ ] **Step 1:** Update article heading/card selectors from `h3`/`h4` to `:is(h2, h3)` / `:is(h3, h4)`.
- [ ] **Step 2:** Add:

```css
.articles-section {
  margin-top: clamp(40px, 4.5vw, 64px);
  padding-top: clamp(40px, 4.5vw, 56px);
  border-top: 1px solid var(--line);
  scroll-margin-top: 110px;
}
.articles-section .article-preview { margin-top: 0; padding: 0; border: 0; background: transparent; }
.articles-section .article-preview-head :is(h2) { font-size: clamp(34px, 3.8vw, 54px); line-height: 1.04; letter-spacing: -.03em; }
.article-preview-lead { max-width: 62ch; margin-top: 12px; font-size: 16px; line-height: 1.7; color: var(--ink-2); }
```

- [ ] **Step 3:** Run `npm run test:run` → all green.

### Task 6: Visual QA

- [ ] Desktop 1440: `http://localhost:5199/` — finder section, hairline, articles section; search "Shopee"; "See articles".
- [ ] Mobile 390: no horizontal overflow, tabs wrap.
- [ ] `/journals` — unchanged (tinted article panel, h3 heading, h4 cards).
- [ ] `npm run build` succeeds.

### Task 7: Commit

```bash
git add -A
git commit -m "feat(home): split journal finder from published articles"
```
