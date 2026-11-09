// The opening gauge's two separate jobs. The needle's sweep is decoration on a fixed clock; loading progress is a separate readout
// that can only rise. Keeping them apart is what stops the number resetting and the needle winding round again.
export const IDLE = 0.16; // the needle's rest, the same idle the dashboard uses at standstill
export const SWEEP_UP = 0.45; // seconds to the redline
export const SWEEP_DOWN = 0.5; // seconds back to idle
export const SWEEP_END = SWEEP_UP + SWEEP_DOWN;
export const MAX_WAIT_MS = 20000; // after this the opening is abandoned for the settled page, so a stalled download can never trap anyone

/** Needle position (0..1 of the arc) t seconds into the one bounded sweep: up to the redline, back to idle, then it stays. */
export function needleAt(t) {
  if (t <= 0) return 0;
  if (t < SWEEP_UP) return 1 - Math.pow(1 - t / SWEEP_UP, 3);
  if (t < SWEEP_END) {
    const x = (t - SWEEP_UP) / SWEEP_DOWN;
    const e = x * x * (3 - 2 * x);
    return 1 + (IDLE - 1) * e;
  }
  return IDLE;
}

/** Loading percent that never goes backwards. The loader library reports per batch, so its raw value can restart or be NaN. */
export function nextPercent(prev, raw) {
  return Number.isFinite(raw) ? Math.min(100, Math.max(prev, raw)) : prev;
}
