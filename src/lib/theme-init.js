// Runs synchronously in <head>, before the stylesheet, so a stored theme is
// applied before the first paint and never flashes.
//
// This lives in its own file for one reason: astro.config.mjs reads the same
// bytes to compute its CSP hash. Edit it freely — the hash is derived at build
// time, so the two can never drift apart.
try {
  var t = localStorage.getItem("theme");
  if (t === "dark" || t === "light") document.documentElement.classList.add(t);
} catch (e) {}
