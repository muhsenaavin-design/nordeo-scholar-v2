import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { MotionPreferenceProvider, useAnimationPreference } from './motion-preference';

vi.mock('motion/react', () => ({ useReducedMotion: () => true }));
afterEach(() => { cleanup(); localStorage.clear(); history.replaceState(null, '', '/'); });

function Control() {
  const { reduced, setMode } = useAnimationPreference();
  return <button onClick={() => setMode('full')}>{reduced ? 'Aktifkan animasi' : 'Animasi aktif'}</button>;
}

test('explicitly enabling animations overrides and persists beyond the system reduced-motion preference', () => {
  const view = render(<MotionPreferenceProvider><Control /></MotionPreferenceProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Aktifkan animasi' }));
  expect(document.documentElement.dataset.motion).toBe('full');
  view.unmount();
  render(<MotionPreferenceProvider><Control /></MotionPreferenceProvider>);
  expect(screen.getByRole('button', { name: 'Animasi aktif' })).toBeInTheDocument();
});

test('a full-motion preview URL explicitly enables animations even when the system reduces motion', () => {
  history.replaceState(null, '', '/?motion=full');
  render(<MotionPreferenceProvider><Control /></MotionPreferenceProvider>);
  expect(screen.getByRole('button', { name: 'Animasi aktif' })).toBeInTheDocument();
  expect(document.documentElement.dataset.motion).toBe('full');
});
