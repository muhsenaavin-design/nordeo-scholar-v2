import { Link } from 'react-router';
import JournalFinder from '../components/JournalFinder';
import { Arrow, useDocumentTitle } from '../components/parts';

export default function Journals() {
  useDocumentTitle('Our Journals');
  return <>
    <section lang="en" className="container inner-page journals-intro" data-reveal>
      <h1 lang="en">Journals for<br />{' '}<em>useful knowledge.</em></h1>
      <p className="page-intro">Two peer-reviewed Nordeo journals: JETSI for engineering and technology, JIEL for education and learning. Both are open access with double-blind review.</p>
      <div className="journals-intro-meta">
        <div><strong>14</strong><span>JETSI articles published</span></div>
        <div><strong>13</strong><span>Records in GARUDA</span></div>
        <div><strong>02</strong><span>Active journals</span></div>
      </div>
    </section>
    <div lang="en" className="container journals-finder"><JournalFinder limit={20} showArchiveLink={false} /></div>
    <article lang="en" className="container journal-archive journals-closing">
      <div><h2>Know the scope <em>and the ethics.</em></h2><p>Each journal has its own author guidelines, ethics policy, and submission workflow. Check that your manuscript fits before opening the journal platform.</p></div>
      <Link to="/author-guide" className="button button-outline">Read the Author Guide</Link>
    </article>
  </>;
}
