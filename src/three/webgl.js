// WebGL capability and quality tier, shared by the persistent background and the career map.
let supported;
export function hasWebGL() {
  if (supported === undefined) {
    try {
      const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
      supported = !!gl;
      gl?.getExtension('WEBGL_lose_context')?.loseContext(); // do not leave a probe context open
    } catch {
      supported = false;
    }
  }
  return supported;
}

/** 'high' or 'medium'. `?tier=` forces one, same as the hero stage. */
export function quality() {
  const forced = new URLSearchParams(window.location.search).get('tier');
  if (forced) return forced;
  const small = window.matchMedia('(max-width: 720px)').matches;
  const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  return small || weak ? 'medium' : 'high';
}
