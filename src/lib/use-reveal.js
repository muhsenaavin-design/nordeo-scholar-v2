import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function useReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-reveal]:not(.is-visible)')];
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(node => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);
}
