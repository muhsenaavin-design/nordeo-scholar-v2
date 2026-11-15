import { sanitizeHtml } from '../lib/rich-text';
import { usePageText } from '../lib/page-texts';

/** Shows the dashboard's version of a page text when one is saved, otherwise the built-in children. */
export default function EditableText({ id, className = '', children }) {
  const html = usePageText(id);
  if (!html) return children;
  return <div className={`page-richtext ${className}`.trim()} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
