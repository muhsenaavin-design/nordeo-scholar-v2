// NordeoNews wordmark. When the official logo is final, replace the <strong> with
// <img src="/assets/nordeonews-logo.svg" alt="" width="…" height="…" />: the wrapper keeps
// the header spacing, and the link around it carries the accessible name.
export default function NordeoNewsBrand({ className = '' }) {
  return <span className={`news-brand ${className}`.trim()}>
    <strong className="news-brand-text">Nordeo<span>News</span></strong>
  </span>;
}
