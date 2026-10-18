import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { CountUp } from './effects';

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock('motion/react', async (original) => ({
  ...await original(),
  useReducedMotion: () => preference.reduced,
  useInView: () => false,
}));

test('shows the final count when reduced motion is enabled after mounting', () => {
  const { rerender } = render(<CountUp value={2} suffix="×" />);
  expect(screen.getByText('00×')).toBeInTheDocument();
  preference.reduced = true;
  rerender(<CountUp value={2} suffix="×" />);
  expect(screen.getByText('02×')).toBeInTheDocument();
  rerender(<CountUp value={7} suffix="×" />);
  expect(screen.getByText('07×')).toBeInTheDocument();
});
