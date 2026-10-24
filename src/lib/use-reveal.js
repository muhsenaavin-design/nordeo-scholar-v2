import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Fades [data-reveal] nodes in as they enter the viewport, including nodes rendered after
// the route mounts (form steps, filtered lists).
export function useReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    const pending = () => [...document.querySelectorAll('[data-reveal]:not(.is-visible)')];
    if (!('IntersectionObserver' in window)) {
      pending().forEach(node => node.classList.add('is-visible'));
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
    const observeAll = () => pending().forEach(node => observer.observe(node));
    observeAll();
    const mutations = 'MutationObserver' in window ? new MutationObserver(observeAll) : null;
    mutations?.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations?.disconnect(); };
  }, [pathname]);
}
