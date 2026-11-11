// Where the "P1" callout sits and what it points at. The photo is 1362x762 and is shown with object-fit: cover, so the landmark is found through
// the same crop the browser applies (box size, --fx / --fy object-position), never from viewport percentages that only fit one size.
export const PHOTO = { w: 1362, h: 762 };
export const SHOULDER = { x: 0.7342, y: 0.2415 }; // the outer top corner of his right shoulder (photo pixel 1000, 184), as fractions of the photo

/** A point of the photo (fractions) in the coordinates of the box that shows it. */
export function coverPoint(box, fx, fy, p = SHOULDER) {
  const s = Math.max(box.w / PHOTO.w, box.h / PHOTO.h);
  return { s, x: (box.w - PHOTO.w * s) * fx + p.x * PHOTO.w * s, y: (box.h - PHOTO.h * s) * fy + p.y * PHOTO.h * s };
}

const r = (n) => Math.round(n * 10) / 10;

/**
  The tab sits in the dark to the right of his shoulder. One connector leaves its left edge, runs level, then bends once, diagonally, to an arrowhead that stops
  just short of the shoulder. `limitX` is the right edge of what is visible, in the box's coordinates, so the tab never leaves the screen.
  Everything is in the box's own pixels (the same units as the photo's crop), so it can be drawn in one SVG of that size.
*/
export function markGeometry(box, fx, fy, { narrow = false, limitX = box.w } = {}) {
  const { s, x, y } = coverPoint(box, fx, fy);
  const u = narrow ? 1 : Math.min(1.25, Math.max(0.8, s));
  const tab = { w: narrow ? 34 : 40, h: narrow ? 22 : 26 };
  const run = (narrow ? 12 : 18) * u; // the level part of the connector
  const rise = (narrow ? 30 : 46) * u;
  const gap = 8; // the arrowhead stops this far from the shoulder
  const margin = 14;
  let dx = (narrow ? 38 : 56) * u;
  dx = Math.max(16, Math.min(dx, limitX - margin - tab.w - run - x));
  const by = Math.max(tab.h / 2 + 8, y - rise);
  const bend = { x: x + dx, y: by };
  const len = Math.hypot(bend.x - x, bend.y - y);
  const d = { x: (bend.x - x) / len, y: (bend.y - y) / len }; // from the shoulder towards the bend
  const tip = { x: x + d.x * gap, y: y + d.y * gap };
  const head = 11, half = 4.6;
  const base = { x: tip.x + d.x * head, y: tip.y + d.y * head };
  const tabLeft = bend.x + run;
  return {
    w: r(box.w), h: r(box.h),
    tab: { x: r(tabLeft), y: r(by - tab.h / 2), w: tab.w, h: tab.h },
    line: `M${r(tabLeft)} ${r(by)} L${r(bend.x)} ${r(by)} L${r(base.x)} ${r(base.y)}`,
    head: `${r(tip.x)},${r(tip.y)} ${r(base.x - d.y * half)},${r(base.y + d.x * half)} ${r(base.x + d.y * half)},${r(base.y - d.x * half)}`,
    tip: { x: r(tip.x), y: r(tip.y) },
    shoulder: { x: r(x), y: r(y) },
  };
}
