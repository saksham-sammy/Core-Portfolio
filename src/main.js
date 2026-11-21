/**
 * Entrypoint & Seamless SPA Route Switcher
 * - `/`    -> Saksham Sharma — Playable Editorial Portfolio & Resume
 * - `/lab` -> Lazy-loaded Interactive Engineering Lab (GLSL Core · Algo Audio · PhishGuard Sandbox)
 */
let currentCleanup = null;

async function mountRoute() {
  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/lab' || window.location.hash === '#lab') {
    const { mountEngineeringLab } = await import('./lab/engineeringLab.js');
    const api = await mountEngineeringLab({
      onBack: () => mountRoute(),
    });
    currentCleanup = api?.dispose || null;
    return;
  }

  const { mountStudioPortfolio } = await import('./studio/app.js');
  const api = mountStudioPortfolio({
    onOpenLab: () => mountRoute(),
  });
  currentCleanup = api?.dispose || null;
}

window.addEventListener('popstate', () => {
  mountRoute();
});

mountRoute();
