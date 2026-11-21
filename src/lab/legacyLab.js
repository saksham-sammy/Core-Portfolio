/**
 * Lazy-loaded Legacy Arcade Lab (/lab)
 * Preserves the original 3-mode interactive WebGL experience
 * (Solar Core Realm · Forza Drive · Tactical FPS Range · 10 Missions)
 * without adding any bytes or visual clutter to the main editorial portfolio.
 */
export async function mountLegacyLab() {
  document.title = 'SAKSHAM SHARMA // EXPERIMENTAL LAB — Legacy 3D Arcade';

  // Mount the exact DOM container structure expected by the legacy engine
  document.body.innerHTML = `
    <canvas id="gl" aria-label="Interactive 3D portfolio canvas"></canvas>
    <div id="labels" aria-hidden="true"></div>
    <div id="stage-ui"></div>
    <div id="ui"></div>
    <div id="panel-root"></div>

    <a href="/" id="lab-return-btn" style="
      position:fixed; top:14px; left:14px; z-index:99999;
      display:inline-flex; align-items:center; gap:8px;
      padding:8px 14px; border-radius:999px;
      background:rgba(10,10,12,0.78); backdrop-filter:blur(12px);
      border:1px solid rgba(244,243,239,0.18); color:#F4F3EF;
      font:500 11px/1 'JetBrains Mono', monospace; letter-spacing:0.08em;
      text-decoration:none; text-transform:uppercase;
      transition:border-color .2s, background .2s;
    ">← Return to Studio</a>

    <div id="boot" data-ui>
      <div class="boot-top">
        <span class="boot-badge"><i></i> EXPERIMENTAL LAB // WEBGL 2.0</span>
        <span class="boot-loc">LEGACY 3D ARCHIVE · PUNE, IN</span>
      </div>
      <div class="boot-center">
        <p class="boot-kicker">3-MODE INTERACTIVE 3D SANDBOX // REALM · FORZA DRIVE · FPS RANGE</p>
        <h1 class="sr-only">Saksham Sharma — Experimental Lab</h1>
        <p class="boot-sub">10 playable micro-missions · Forza Drive playground · Tactical FPS range</p>
        <div class="boot-cta">
          <button id="boot-enter" class="btn primary big pulse" type="button">
            <span>🌌 ENTER REALM CORE</span><i>▸</i>
          </button>
          <button id="boot-drive" class="btn big" type="button">
            <span>🏎️ FORZA DRIVE</span>
          </button>
          <button id="boot-shooter" class="btn big" type="button">
            <span>🎯 TACTICAL FPS</span>
          </button>
          <button id="boot-recruiter" class="btn ghost big" type="button">
            ⚡ Executive Recruiter Dossier ↗
          </button>
        </div>
      </div>
      <div class="boot-foot">
        <span>SYNTHESIZED WEB AUDIO · CUSTOM GLSL SHADERS · ARCHIVED LAB</span>
        <span class="konami-hint">SECRET: ↑↑↓↓←→←→BA</span>
      </div>
    </div>

    <input id="kb" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-hidden="true" tabindex="-1" />
  `;

  // Dynamically import legacy stylesheet and WebGL modules only when /lab is opened
  await import('../style.css');
  const [
    { default: gsap },
    rendererMod,
    inputMod,
    fxMod,
    audioMod,
    storeMod,
    contentMod,
    titleMod,
    hubMod,
    driveMod,
    shooterMod,
    missionMod,
    uiMod,
  ] = await Promise.all([
    import('gsap'),
    import('../engine/renderer.js'),
    import('../engine/input.js'),
    import('../engine/fx.js'),
    import('../engine/audio.js'),
    import('../engine/store.js'),
    import('../data/content.js'),
    import('../world/title.js'),
    import('../world/hub.js'),
    import('../world/drive.js'),
    import('../world/shooter.js'),
    import('../world/mission.js'),
    import('../ui/ui.js'),
  ]);

  const { scene, onFrame, onBeforeRender, onAfterRender, startLoop, globalU } = rendererMod;
  const { initInput, endFrame, planePoint } = inputMod;
  const { fx } = fxMod;
  const { audio } = audioMod;
  const { store } = storeMod;
  const { missions } = contentMod;
  const { createTitle } = titleMod;
  const { createHub } = hubMod;
  const { createDriveWorld } = driveMod;
  const { createShooterWorld } = shooterMod;
  const { createMissionRunner } = missionMod;
  const { ui } = uiMod;

  initInput();
  audio.setMuted(!!store.state.muted);

  const runner = createMissionRunner();

  const hub = createHub({
    onSelect: (idx) => launchMission(idx),
    onInspect: (m) => ui.reveal(m, { skipped: false, first: false }),
    onToast: (msg) => ui.toast(msg),
  });
  hub.hide();

  const drive = createDriveWorld({
    onPlayMission: (idx) => launchMission(idx),
    onSelectMission: (idx) => launchMission(idx),
    onInspectMission: (m) => ui.reveal(m, { skipped: false, first: false }),
    onToast: (msg) => ui.toast(msg),
  });
  drive.hide();

  const shooter = createShooterWorld({
    onPlayMission: (idx) => launchMission(idx),
    onInspectMission: (m) => ui.reveal(m, { skipped: false, first: false }),
    onToast: (msg) => ui.toast(msg),
  });
  shooter.hide();

  const title = createTitle(['SAKSHAM', 'SHARMA']);
  title.group.position.set(0, 1.35, 0);
  scene.add(title.group);

  document.fonts?.ready?.then(() => title.form(2.4));
  title.form(2.4);

  function showActiveWorld() {
    const mode = store.state.worldMode || 'orrery';
    if (mode === 'drive') {
      hub.hide();
      shooter.hide();
      drive.show();
      drive.refresh();
    } else if (mode === 'shooter') {
      hub.hide();
      drive.hide();
      shooter.show();
      shooter.refresh();
    } else {
      drive.hide();
      shooter.hide();
      hub.show();
      hub.refresh();
    }
  }

  function hideAllWorlds() {
    hub.hide();
    drive.hide();
    shooter.hide();
  }

  function refreshAllWorlds() {
    hub.refresh();
    drive.refresh();
    shooter.refresh();
  }

  function setWorldMode(mode) {
    if (runner.active) runner.exit();
    ui.closeAll();
    store.setWorldMode(mode);
    globalU.uWarp.value = 0.45;
    gsap.to(globalU.uWarp, { value: 0, duration: 0.7, ease: 'power3.out' });
    showActiveWorld();
    chrome.update();
    const labels = {
      orrery: 'SOLAR CORE — Drag to rotate · Scroll to zoom · Click any planet or pill below',
      drive: 'FORZA PLAYGROUND — WASD to drive · [H] Shockwave · Click top GPS pills to teleport',
      shooter: 'TACTICAL FPS RANGE — Aim & click to shoot · [1][2][3] Weapons · [E] Play · [F] Story',
    };
    ui.toast(labels[mode] || 'Mode switched');
  }

  const actions = {
    card: () => { ui.closeAll(); ui.card(); },
    vault: () => { ui.closeAll(); ui.vault(); },
    certs: () => { ui.closeAll(); ui.certs(); },
    blogs: () => { ui.closeAll(); ui.blogs(); },
    contact: () => { ui.closeAll(); ui.contact(); },
    recruiter: () => { ui.closeAll(); ui.recruiter(actions); },
    pause: () => { ui.closeAll(); ui.pauseMenu(actions); },
    setMode: (mode) => setWorldMode(mode),
    playMission: (idx) => { ui.closeAll(); launchMission(idx); },
    inspectMission: (m) => { ui.closeAll(); ui.reveal(m, { skipped: false, first: false }); },
  };

  const chrome = ui.chrome(actions);
  ui.onPanel(
    () => { hub.blocked = true; drive.blocked = true; shooter.blocked = true; },
    (_entry, remaining) => {
      if (remaining === 0) {
        hub.blocked = false; drive.blocked = false; shooter.blocked = false;
        chrome.update();
      }
    },
  );

  let inBoot = true;
  const bootEl = document.getElementById('boot');

  async function exitBoot({ openRecruiter = false, initialMode = null } = {}) {
    if (!inBoot) return;
    inBoot = false;
    if (initialMode) store.setWorldMode(initialMode);
    audio.init();
    audio.sfx.boot();
    gsap.to(bootEl, { autoAlpha: 0, duration: 0.4, onComplete: () => bootEl?.remove() });
    globalU.uWarp.value = 0.75;
    gsap.to(globalU.uWarp, { value: 0, duration: 1.0, ease: 'power3.out' });
    await title.explode(0.85);
    scene.remove(title.group);
    title.dispose();
    showActiveWorld();
    chrome.show();
    chrome.update();
    if (openRecruiter) {
      ui.recruiter(actions);
    } else if (!store.state.intro && store.state.worldMode === 'orrery') {
      store.state.intro = true;
      store.save();
      await ui.briefing(actions);
    }
  }

  document.getElementById('boot-enter')?.addEventListener('click', () => exitBoot({ initialMode: 'orrery' }));
  document.getElementById('boot-drive')?.addEventListener('click', () => exitBoot({ initialMode: 'drive' }));
  document.getElementById('boot-shooter')?.addEventListener('click', () => exitBoot({ initialMode: 'shooter' }));
  document.getElementById('boot-recruiter')?.addEventListener('click', () => exitBoot({ openRecruiter: true, initialMode: 'orrery' }));

  async function launchMission(idx) {
    const m = missions[idx];
    if (!m || runner.active) return;
    ui.closeAll();
    chrome.hide();
    chrome.hideHint();
    const mode = store.state.worldMode || 'orrery';
    if (mode === 'orrery') {
      await hub.dive(idx);
    } else {
      globalU.uWarp.value = 0.65;
      gsap.to(globalU.uWarp, { value: 0, duration: 0.65, ease: 'power2.out' });
    }
    hideAllWorlds();
    const res = await runner.start(m);
    showActiveWorld();
    if (mode === 'orrery') hub.settle();
    chrome.show();
    if (res.result === 'win' || res.result === 'skip') {
      const skipped = res.result === 'skip';
      const first = store.markCleared(m.id, skipped, res.bonus || 0);
      refreshAllWorlds();
      chrome.update();
      if (mode === 'orrery') {
        hub.awardShards(m);
        hub.shift(-3.2, 0.75);
      }
      await ui.reveal(m, { bonus: res.bonus || 0, skipped, first });
      if (mode === 'orrery') hub.shift(0, 0.75);
      if (store.clearedCount() >= missions.length && first) ui.finale(actions);
    } else {
      refreshAllWorlds();
      chrome.update();
    }
  }

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let kIdx = 0;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && !inBoot) {
      if (ui.panelOpen) { ui.closeTop(); return; }
      if (runner.active) { runner.exit(); return; }
      audio.sfx.click();
      ui.pauseMenu(actions);
      return;
    }
    if (e.code === KONAMI[kIdx]) {
      kIdx++;
      if (kIdx === KONAMI.length) {
        kIdx = 0;
        store.state.god = !store.state.god;
        store.save();
        audio.sfx.win();
        refreshAllWorlds();
        chrome.update();
        ui.toast(store.state.god ? 'GOD MODE UNLOCKED: All shards & boss active!' : 'God Mode disabled');
      }
    } else {
      kIdx = e.code === KONAMI[0] ? 1 : 0;
    }
  });

  const mouseWorld = planePoint(0);
  onFrame((dt, t) => {
    if (inBoot) {
      planePoint(0, mouseWorld);
      mouseWorld.y -= 1.35;
      title.setMouseWorld(mouseWorld);
      title.update(dt, t);
    }
    fx.update(dt);
  });
  onBeforeRender(() => fx.applyShake());
  onAfterRender(() => {
    fx.removeShake();
    endFrame();
  });

  startLoop();
}
