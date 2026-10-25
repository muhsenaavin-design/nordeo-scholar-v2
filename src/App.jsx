import { Suspense, lazy, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { MotionPreferenceProvider } from './components/motion-preference';
import { PageFade, ScrollProgress, useSectionNavigation } from './components/effects';
import { MainHeader, MicroHeader, SiteFooter } from './components/SiteChrome';
import { hostSite, resolveSite } from './lib/site';
import { useReveal } from './lib/use-reveal';
import Home from './pages/Home';
import Journals from './pages/Journals';
import { AboutPage, AuthorGuidePage, BooksPage, ContactPage, LegalPage, PengmasPage, PublicationEthicsPage } from './pages/InfoPages';
// NordeoNews and Academy load on demand so the landing page ships less JavaScript.
const NewsHome = lazy(() => import('./pages/news/NewsHome'));
const NewsArticle = lazy(() => import('./pages/news/NewsArticle'));
const NewsGuide = lazy(() => import('./pages/news/NewsGuide'));
const NewsSubmit = lazy(() => import('./pages/news/NewsSubmit'));
const TrainingHome = lazy(() => import('./pages/training/TrainingHome'));
const TrainingProgram = lazy(() => import('./pages/training/TrainingProgram'));
const TrainingRegister = lazy(() => import('./pages/training/TrainingRegister'));

function Layout({ children }) {
  const { pathname } = useLocation();
  const siteKey = resolveSite(pathname);
  const previousPath = useRef(pathname);
  useReveal();
  const replaySection = useSectionNavigation();
  useEffect(() => {
    if (previousPath.current !== pathname) document.getElementById('main-content')?.focus({ preventScroll: true });
    previousPath.current = pathname;
  }, [pathname]);
  return <div className={`site site-${siteKey}`}>
    <ScrollProgress />
    <a className="skip-link" href="#main-content">Skip to main content</a>
    {siteKey === 'main' ? <MainHeader onReplaySection={replaySection} /> : <MicroHeader siteKey={siteKey} />}
    <main id="main-content" tabIndex="-1"><PageFade routeKey={pathname}>{children}</PageFade></main>
    <SiteFooter siteKey={siteKey} />
  </div>;
}

function newsRoutes(base) {
  return [
    <Route key="news" path={`${base}/`} element={<NewsHome />} />,
    <Route key="news-guide" path={`${base}/panduan`} element={<NewsGuide />} />,
    <Route key="news-submit" path={`${base}/kirim`} element={<NewsSubmit />} />,
    <Route key="news-article" path={`${base}/:slug`} element={<NewsArticle />} />,
  ];
}

function trainingRoutes(base) {
  return [
    <Route key="training" path={`${base}/`} element={<TrainingHome />} />,
    <Route key="training-register" path={`${base}/daftar`} element={<TrainingRegister />} />,
    <Route key="training-program" path={`${base}/program/:id`} element={<TrainingProgram />} />,
  ];
}

function SiteRoutes() {
  const hosted = hostSite();
  if (hosted === 'news') return <Routes>{newsRoutes('')}<Route path="*" element={<LegalPage />} /></Routes>;
  if (hosted === 'training') return <Routes>{trainingRoutes('')}<Route path="*" element={<LegalPage />} /></Routes>;
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/journals" element={<Journals />} />
    <Route path="/journals/jurnalpengmas" element={<PengmasPage />} />
    <Route path="/author-guide" element={<AuthorGuidePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/collaboration" element={<Navigate to="/contact" replace />} />
    <Route path="/publication-ethics" element={<PublicationEthicsPage />} />
    <Route path="/books" element={<BooksPage />} />
    <Route path="/services" element={<Navigate to="/training/" replace />} />
    {newsRoutes('/news')}
    {trainingRoutes('/training')}
    <Route path="*" element={<LegalPage />} />
  </Routes>;
}

export default function App() {
  return <MotionPreferenceProvider><Layout><Suspense fallback={<div className="route-loading" aria-busy="true" />}><SiteRoutes /></Suspense></Layout></MotionPreferenceProvider>;
}
