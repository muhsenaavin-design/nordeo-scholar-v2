import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useLocation } from 'react-router';
import { useAnimationPreference } from './motion-preference';

const ease = [0.22, 0.61, 0.36, 1];

// React Bits-inspired patterns, implemented locally with the existing Motion dependency.
export function BlurText({ text }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, amount: 0.2 });
  const { reduced } = useAnimationPreference();
  return <span ref={ref} className="blur-text"><span className="sr-only">{text}</span><span aria-hidden="true">{text.split(' ').map((word, index) => <motion.span key={index} className="blur-word" initial={false} animate={visible || reduced ? { filter: 'blur(0px)', opacity: 1, y: 0 } : { filter: 'blur(5px)', opacity: 0, y: 8 }} transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : index * 0.025, ease }}>{word}{' '}</motion.span>)}</span></span>;
}

export function Magnet({ children }) {
  const { reduced } = useAnimationPreference();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 20 });
  const springY = useSpring(y, { stiffness: 220, damping: 20 });
  const reset = () => { x.set(0); y.set(0); };
  return <span className="magnet" onPointerMove={event => {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.12);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.18);
  }} onPointerLeave={reset} onPointerCancel={reset} onBlur={reset}><motion.span className="magnet-inner" style={reduced ? undefined : { x: springX, y: springY }}>{children}</motion.span></span>;
}

export function useSectionNavigation() {
  const { pathname, hash, key } = useLocation();
  const { reduced } = useAnimationPreference();
  const [request, setRequest] = useState(0);
  useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    const section = document.getElementById(hash.slice(1));
    if (!section) return;
    let arrival;
    let scrolling;
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      const heading = section.querySelector('h2, h1') || section;
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      if (!reduced && heading.animate) arrival = heading.animate([
        { opacity: 0.35, filter: 'blur(5px)', transform: 'translateY(14px)' },
        { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
      ], { duration: 700, easing: 'cubic-bezier(.22,.61,.36,1)' });
    };
    // Measure after the mobile drawer closes and the new route has rendered.
    const frame = requestAnimationFrame(() => {
      const offset = document.querySelector('.site-header')?.getBoundingClientRect().height || 80;
      const top = Math.max(0, Math.min(section.getBoundingClientRect().top + window.scrollY - offset - 24, document.documentElement.scrollHeight - window.innerHeight));
      const from = window.scrollY;
      if (reduced || Math.abs(top - from) < 2) { window.scrollTo({ top, behavior: 'instant' }); finish(); return; }
      scrolling = animate(from, top, { duration: Math.min(1.25, 0.45 + Math.abs(top - from) / 4500), ease, onUpdate: value => window.scrollTo({ top: value, behavior: 'instant' }), onComplete: finish });
    });
    const stop = () => { cancelled = true; scrolling?.stop(); arrival?.cancel(); };
    const onKey = event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) stop(); };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame); stop();
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', onKey);
    };
  }, [pathname, hash, key, reduced, request]);
  return () => setRequest(value => value + 1);
}

export function HeroImage({ src, alt, width, height }) {
  const ref = useRef(null);
  const { reduced } = useAnimationPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  return <motion.img ref={ref} className="hero-image" src={src} alt={alt} width={width} height={height} fetchPriority="high" style={reduced ? undefined : { y, scale }} />;
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const { reduced } = useAnimationPreference();
  if (reduced) return null;
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

export function CountUp({ value, pad = 2, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-12% 0px' });
  const { reduced } = useAnimationPreference();
  const [display, setDisplay] = useState(reduced ? value : 0);
  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, { duration: 1.1, ease, onUpdate: (latest) => setDisplay(Math.round(latest)) });
    return () => controls.stop();
  }, [inView, reduced, value]);
  return <span ref={ref} className="count-up">{String(reduced ? value : display).padStart(pad, '0')}{suffix}</span>;
}

export function SpotlightCard({ className = '', children, ...rest }) {
  const ref = useRef(null);
  const { reduced } = useAnimationPreference();
  const onPointerMove = (event) => {
    if (reduced || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    ref.current.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };
  return <article ref={ref} className={`spotlight ${className}`} onPointerMove={onPointerMove} {...rest}>{children}</article>;
}

export function Parallax({ children, className = '', distance = 32 }) {
  const ref = useRef(null);
  const { reduced } = useAnimationPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={className}>
      <motion.div className="parallax-inner" style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

export function PageFade({ routeKey, children }) {
  const { reduced } = useAnimationPreference();
  return (
    <motion.div
      key={routeKey}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
    >
      {children}
    </motion.div>
  );
}
