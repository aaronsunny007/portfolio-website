// Small directional marks for the garage and summary actions. Decorative: the label next to them carries the meaning.
export default function Arrow({ kind = 'out' }) {
  return (
    <svg className={`arrow arrow-${kind}`} viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
      {kind === 'out' && <path d="M3 9 L9 3 M4.2 3 H9 V7.8" />}
      {kind === 'right' && <path d="M2 6 H10 M7 3 L10 6 L7 9" />}
      {kind === 'down' && <path d="M2.5 4.5 L6 8 L9.5 4.5" />}
    </svg>
  );
}
