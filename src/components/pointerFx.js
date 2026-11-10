// Pointer response for the cockpit's physical parts, in one pair of delegated listeners (no per-control state, no re-renders).
// [data-tilt] plates lean toward a mouse pointer; [data-spec] keys move their edge reflection to it. Touch and pen never tilt, and
// reduced motion turns both off, so every state still works without a pointer. The CSS owns the rest: poses, depth and focus.
const TILT = 3; // degrees at the plate's edge

export function installPointerFx() {
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || calm.matches) return;
    const t = e.target.closest?.('[data-tilt],[data-spec]');
    if (!t) return;
    const r = t.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (t.hasAttribute('data-spec')) {
      t.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      t.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    }
    const plate = t.hasAttribute('data-tilt') && t.firstElementChild;
    if (plate) {
      plate.dataset.live = '';
      plate.style.setProperty('--ry', `${((x - 0.5) * 2 * TILT).toFixed(2)}deg`);
      plate.style.setProperty('--rx', `${((0.5 - y) * 2 * TILT * 0.6).toFixed(2)}deg`);
    }
  };
  const onLeave = (e) => {
    const plate = e.target.matches?.('[data-tilt]') && e.target.firstElementChild; // pointerleave does not bubble: it is heard in the capture phase
    if (!plate) return;
    delete plate.dataset.live;
    plate.style.removeProperty('--rx');
    plate.style.removeProperty('--ry');
  };
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave, { capture: true, passive: true });
  return () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave, { capture: true });
  };
}
