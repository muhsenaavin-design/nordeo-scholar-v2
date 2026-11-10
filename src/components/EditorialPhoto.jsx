import { photoSourceSet } from '../lib/editorial-photos';

export default function EditorialPhoto({ src, sizes = '(max-width: 900px) 100vw, 50vw', ...props }) {
  const srcSet = photoSourceSet(src);
  return <img {...props} src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} />;
}
