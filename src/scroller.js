// The page's one scroll system (Lenis, when it is running), so a selected checkpoint can scroll to its place.
export const scroller = {
  lenis: null,
  to(y, instant, duration = 1.1) {
    if (instant) window.scrollTo({ top: y, behavior: 'auto' });
    else if (this.lenis) this.lenis.scrollTo(y, { duration });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  },
};
