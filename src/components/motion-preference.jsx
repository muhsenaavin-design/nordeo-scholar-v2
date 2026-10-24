import { createContext, useContext, useLayoutEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const Preference = createContext(null);
const storageKey = 'nordeo-motion';

function initialMode() {
  const requested = new URLSearchParams(window.location.search).get('motion');
  if (['full', 'reduced', 'system'].includes(requested)) return requested;
  try { return localStorage.getItem(storageKey) || 'system'; } catch { return 'system'; }
}

export function MotionPreferenceProvider({ children }) {
  const systemReduced = useReducedMotion();
  const [mode, setMode] = useState(initialMode);
  const reduced = mode === 'system' ? !!systemReduced : mode === 'reduced';
  useLayoutEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    try { localStorage.setItem(storageKey, mode); } catch { /* Preferences still work without storage. */ }
    return () => { delete document.documentElement.dataset.motion; };
  }, [mode, reduced]);
  return <Preference.Provider value={{ reduced, mode, setMode }}>{children}</Preference.Provider>;
}

export function useAnimationPreference() {
  const preference = useContext(Preference);
  const systemReduced = useReducedMotion();
  return preference || { reduced: !!systemReduced };
}

export function MotionNotice() {
  const { reduced, setMode } = useAnimationPreference();
  return reduced ? <button className="motion-notice" type="button" onClick={() => setMode('full')}>Aktifkan animasi</button> : null;
}
