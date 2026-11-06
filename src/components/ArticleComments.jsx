import { useMemo, useState } from 'react';
import { STORE, makeId, read, write } from '../lib/store';
import { Check, Field, bind, focusFirstError, isEmail } from './forms';

// Reader comments under a NordeoNews article, modelled on the classic "Tinggalkan balasan"
// pattern: name and email required (email never shown), one level of replies, and an
// option to remember the reader on this device. There is no comment server yet, so comments
// are kept in this browser; swap read/write for an API call when one exists.

const MAX = 1500;
const EMPTY = { name: '', email: '', comment: '', remember: false };

const initials = name => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('') || '?';
const when = iso => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

function Comment({ item, replies, onReply, replyingTo }) {
  return <li className="comment" id={`komentar-${item.id}`}>
    <span className="comment-avatar" aria-hidden="true">{initials(item.name)}</span>
    <div className="comment-body">
      <p className="comment-meta"><strong>{item.name}</strong><time dateTime={item.at}>{when(item.at)}</time></p>
      <p className="comment-text">{item.comment}</p>
      {onReply && <button type="button" className="comment-reply" onClick={() => onReply(item)} aria-expanded={replyingTo === item.id}>Balas</button>}
      {replies?.length > 0 && <ol className="comment-replies">{replies.map(reply => <Comment key={reply.id} item={reply} />)}</ol>}
    </div>
  </li>;
}

export default function ArticleComments({ storyId }) {
  const [all, setAll] = useState(() => read(STORE.newsComments, {}));
  const saved = useMemo(() => read(STORE.commenter, null), []);
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(saved || {}), remember: Boolean(saved) }));
  const [errors, setErrors] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [notice, setNotice] = useState('');
  const list = all[storyId] || [];
  const top = list.filter(item => !item.parentId);
  const repliesOf = id => list.filter(item => item.parentId === id);
  const field = (name, options) => bind(form, setForm, errors, name, options);

  const submit = event => {
    event.preventDefault();
    const found = {};
    if (!form.name.trim()) found.name = 'Tulis nama Anda.';
    if (!isEmail(form.email)) found.email = 'Gunakan alamat email yang valid.';
    if (form.comment.trim().length < 3) found.comment = 'Tulis komentar Anda.';
    setErrors(found);
    if (Object.keys(found).length) { focusFirstError(found); return; }
    const item = { id: makeId('comment'), name: form.name.trim(), email: form.email.trim(), comment: form.comment.trim().slice(0, MAX), at: new Date().toISOString(), parentId: replyTo?.id || null };
    const next = { ...all, [storyId]: [...list, item] };
    write(STORE.newsComments, next);
    if (form.remember) write(STORE.commenter, { name: item.name, email: item.email });
    else write(STORE.commenter, null);
    setAll(next);
    setForm(current => ({ ...current, comment: '' }));
    setReplyTo(null);
    setNotice('Komentar Anda sudah tampil.');
  };

  const startReply = item => {
    setReplyTo(item);
    setNotice('');
    requestAnimationFrame(() => document.getElementById('comment')?.focus());
  };

  return <section className="article-comments" aria-labelledby="comments-heading">
    <h2 id="comments-heading">Komentar <span>({list.length})</span></h2>
    {top.length > 0 ? <ol className="comment-list">{top.map(item => <Comment key={item.id} item={item} replies={repliesOf(item.id)} onReply={startReply} replyingTo={replyTo?.id} />)}</ol>
      : <p className="comment-empty">Belum ada komentar. Jadilah yang pertama menanggapi berita ini.</p>}

    <form className="comment-form" noValidate onSubmit={submit} aria-labelledby="comment-form-heading">
      <div className="comment-form-head">
        <h3 id="comment-form-heading">{replyTo ? <>Balas {replyTo.name}</> : 'Tinggalkan balasan'}</h3>
        {replyTo && <button type="button" className="text-link finder-text-button" onClick={() => setReplyTo(null)}>Batalkan balasan</button>}
      </div>
      <p className="field-hint">Alamat email Anda tidak akan dipublikasikan. Kolom bertanda <span aria-hidden="true">*</span><span className="sr-only">wajib</span> wajib diisi.</p>
      <Field id="comment" label="Komentar *" error={errors.comment} counter={`${form.comment.length}/${MAX}`}>
        <textarea rows={5} maxLength={MAX} {...field('comment')} />
      </Field>
      <div className="field-pair">
        <Field id="name" label="Nama *" error={errors.name}><input type="text" autoComplete="name" {...field('name')} /></Field>
        <Field id="email" label="Email *" error={errors.email}><input type="email" autoComplete="email" {...field('email')} /></Field>
      </div>
      <Check id="remember" checked={form.remember} onChange={remember => setForm(current => ({ ...current, remember }))}>Simpan nama dan email saya di perangkat ini untuk komentar berikutnya.</Check>
      <div className="comment-actions">
        <button type="submit" className="button button-dark">Kirim komentar</button>
        <p className="comment-notice" role="status">{notice}</p>
      </div>
      <p className="form-footnote">Kolom komentar belum terhubung ke server redaksi; untuk sementara komentar tersimpan di perangkat ini.</p>
    </form>
  </section>;
}
