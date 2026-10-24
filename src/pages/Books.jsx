import { bookCatalog, bookProcess, bookTypes } from '../data/books';
import { contact } from '../config/links';
import { Arrow, SectionHeading, StatusPill } from '../components/parts';

function BookCoverStack() {
  const covers = bookCatalog.slice(0, 3);
  return <div className="book-stack" aria-label="Pratinjau sampul buku Nordeo">
    {covers.map((book, index) => <img key={book.id} className={`book-stack-cover book-stack-${index + 1}`} src={book.cover} alt={book.coverAlt} width="900" height="1200" loading={index === 0 ? 'eager' : 'lazy'} />)}
    <span className="book-stack-label"><strong>Nordeo Books</strong><small>Katalog 2026–2027</small></span>
  </div>;
}

export default function Books() {
  return <div className="microsite books-site">
    <section className="micro-hero books-hero">
      <div className="container micro-hero-grid">
        <div className="micro-hero-copy" data-reveal>
          <p className="eyebrow">BOOKS PUBLISHING · BOOKS.NORDEOSCHOLAR.COM</p>
          <h1>Ideas deserve<br /> a longer life.</h1>
          <p className="micro-hero-lede">Monograf, bunga rampai, dan panduan praktik untuk membawa gagasan akademik melampaui satu edisi jurnal. Diedit dengan sabar, dirancang untuk dibaca ulang.</p>
          <div className="micro-hero-actions"><a href="#katalog" className="button button-dark">Lihat katalog <Arrow /></a><a href={`mailto:${contact.books}?subject=Proposal%20buku%20Nordeo`} className="button button-outline">Ajukan proposal <Arrow diagonal /></a></div>
          <div className="micro-facts"><div><strong>4</strong><span>Judul dalam jalur terbit</span></div><div><strong>4</strong><span>Format penerbitan</span></div><div><strong>2026</strong><span>Katalog pertama</span></div></div>
        </div>
        <div className="micro-hero-art" data-reveal style={{ '--reveal-delay': '120ms' }}><BookCoverStack /></div>
      </div>
    </section>

    <section className="container micro-section" id="katalog" aria-labelledby="catalog-heading">
      <SectionHeading eyebrow="KATALOG" title={<>Buku yang sedang<br /> kami siapkan.</>} id="catalog-heading" copy={<><p>Empat judul pertama mencakup metode riset, penulisan ilmiah, publikasi, dan pengetahuan lokal. Status produksi diperbarui secara berkala.</p><p className="domain-note">books.nordeoscholar.com</p></>} />
      <div className="book-catalog">
        {bookCatalog.map((book, index) => <article className="book-card" key={book.id} data-reveal style={{ '--reveal-delay': `${index * 70}ms` }}>
          <div className="book-card-cover">
            <img src={book.cover} alt={book.coverAlt} width="900" height="1200" loading="lazy" />
            <StatusPill tone={book.status === 'Siap terbit' ? 'live' : 'preview'}>{book.status}</StatusPill>
          </div>
          <div className="book-card-body">
            <p className="card-category">{book.category} · {book.year}</p>
            <h3>{book.title}</h3>
            <p className="book-subtitle">{book.subtitle}</p>
            <p className="book-author">{book.author}</p>
            <p className="book-description">{book.description}</p>
            <p className="book-pages">{book.pages}</p>
          </div>
        </article>)}
      </div>
    </section>

    <section className="books-spread">
      <div className="container books-spread-inner">
        <div className="books-spread-quote" data-reveal>
          <p className="eyebrow">EDITORIAL NOTE</p>
          <blockquote>“Buku memberi sebuah gagasan ruang untuk bernapas — cukup panjang untuk diuji, cukup tenang untuk diingat.”</blockquote>
          <p className="quote-credit">Nordeo Editorial</p>
        </div>
        <div className="book-types" data-reveal style={{ '--reveal-delay': '100ms' }}>
          {bookTypes.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.copy}</p></article>)}
        </div>
      </div>
    </section>

    <section className="container micro-section" id="proses" aria-labelledby="process-heading">
      <SectionHeading eyebrow="PROSES PENERBITAN" title={<>Dari proposal<br /> menjadi bacaan.</>} id="process-heading" copy="Setiap buku melewati tinjauan, penyuntingan, desain, dan produksi. Kami menjaga komunikasi terbuka di setiap tahap." />
      <ol className="book-process">
        {bookProcess.map((step, index) => <li key={step.number} data-reveal style={{ '--reveal-delay': `${index * 60}ms` }}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></li>)}
      </ol>
    </section>

    <section className="container micro-section" id="penulis" aria-labelledby="authors-heading">
      <div className="author-cta" data-reveal>
        <div>
          <p className="eyebrow">UNTUK PENULIS</p>
          <h2 id="authors-heading">Punya naskah yang<br /> layak menjadi buku?</h2>
          <p>Kami menerima proposal monograf, bunga rampai yang sudah disunting, dan panduan praktik. Kirim ringkasan 1–2 halaman, daftar bab, target pembaca, dan satu contoh tulisan.</p>
          <ul className="check-list"><li>Gagasan jelas dan kontribusi terukur.</li><li>Struktur bab dan target pembaca sudah dipikirkan.</li><li>Hak cipta dan izin materi sudah jelas.</li></ul>
          <a href={`mailto:${contact.books}?subject=Proposal%20buku%20Nordeo`} className="button button-gold">Kirim proposal <Arrow diagonal /></a>
        </div>
        <div className="author-cta-side">
          <p className="eyebrow">YANG KAMI CARI</p>
          <dl>
            <div><dt>Bidang</dt><dd>Riset sosial, pendidikan, teknologi, humaniora, dan praktik profesional.</dd></div>
            <div><dt>Bahasa</dt><dd>Indonesia atau Inggris, dengan penyuntingan yang konsisten.</dd></div>
            <div><dt>Panjang</dt><dd>45.000–90.000 kata untuk monograf; lebih fleksibel untuk panduan.</dd></div>
            <div><dt>Waktu tinjauan</dt><dd>4–6 pekan untuk proposal awal.</dd></div>
          </dl>
          <p className="author-cta-contact">{contact.books}</p>
        </div>
      </div>
    </section>
  </div>;
}
