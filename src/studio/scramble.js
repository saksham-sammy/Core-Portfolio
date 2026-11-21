/**
 * Performant editorial text-scramble reveal on section headers.
 * Preserves rich inner HTML (such as italic Instrument Serif <em> accents) upon completion,
 * and respects prefers-reduced-motion automatically.
 */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·—';

export function scrambleText(el, finalText, durationMs = 460) {
  if (!el) return;
  const originalHtml = el.innerHTML;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const len = finalText.length;
  const start = performance.now();
  function frame(now) {
    const p = Math.min(1, (now - start) / durationMs);
    const revealed = Math.floor(p * len);
    let out = '';
    for (let i = 0; i < len; i++) {
      const ch = finalText[i];
      if (ch === ' ' || i < revealed) {
        out += ch;
      } else {
        out += GLYPHS[(i * 7 + Math.floor(now / 36)) % GLYPHS.length];
      }
    }
    el.textContent = out;
    if (p < 1) {
      requestAnimationFrame(frame);
    } else {
      el.innerHTML = originalHtml;
    }
  }
  requestAnimationFrame(frame);
}

export function attachScrambleObservers(root = document) {
  const els = root.querySelectorAll('[data-scramble]');
  if (!els.length) return () => {};
  const seen = new WeakSet();
  const obs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          const targetText = entry.target.getAttribute('data-scramble') || entry.target.textContent || '';
          scrambleText(entry.target, targetText, 480);
        }
      }
    },
    { threshold: 0.35 }
  );
  els.forEach((el) => obs.observe(el));
  return () => obs.disconnect();
}
