import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

const ease = [0.22, 0.61, 0.36, 1];

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const reduced = useReducedMotion();
  if (reduced) return null;
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

export function CountUp({ value, pad = 2, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-12% 0px' });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, { duration: 1.1, ease, onUpdate: (latest) => setDisplay(Math.round(latest)) });
    return () => controls.stop();
  }, [inView, reduced, value]);
  return <span ref={ref} className="count-up">{String(display).padStart(pad, '0')}{suffix}</span>;
}

export function SpotlightCard({ className = '', children, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
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
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={className}>
      <motion.div className="parallax-inner" style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

export function PageFade({ routeKey, children }) {
  const reduced = useReducedMotion();
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
