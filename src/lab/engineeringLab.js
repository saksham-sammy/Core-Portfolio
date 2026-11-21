/**
 * YUREI STUDIO // PLAYABLE PROJECT LAB (/lab)
 * Every interactive toy here is a gamified version of Saksham's real shipped projects:
 *   01. Algo Audio Arena      — Sonified sorting visualizer (AlgoVision V2) + Manual Sort Challenge
 *   02. 3D Cube Pulse         — Raycasted 3D orbiting-cube target game & GLSL shader core (SVJ / WebGL)
 *   03. Typing Samurai × EQ   — Live code WPM speed arena + reactive 5-band equalizer (Typing Samurai + DualSense HapticPulse)
 */
import '../studio/tokens.css';
import { studioSound } from '../studio/sound.js';

const THEMES = {
  volt: { id: 'volt', hex: '#C8FF3D', rgb: [200, 255, 61], ink: '#09090B' },
  violet: { id: 'violet', hex: '#B388FF', rgb: [179, 136, 255], ink: '#09090B' },
  coral: { id: 'coral', hex: '#FF6B4A', rgb: [255, 107, 74], ink: '#09090B' },
};

const CODE_SNIPPETS = [
  { lang: 'C++ · DSA', code: 'while (lo <= hi) { int mid = lo + (hi - lo) / 2; if (a[mid] == x) return mid; }' },
  { lang: 'PYTHON · FASTAPI', code: '@app.post("/scan") async def screen(url: str): return {"score": model.predict(url)}' },
  { lang: 'THREE.JS · GLSL', code: 'float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.4); gl_FragColor = vec4(col, 1.0);' },
  { lang: 'REACT · TYPESCRIPT', code: 'const sorted = useMemo(() => items.filter(x => x.featured).slice(0, 8), [items]);' },
  { lang: 'SQL · MYSQL', code: 'SELECT room_id, COUNT(*) AS beds FROM allocations GROUP BY room_id HAVING beds < 4;' },
];

export async function mountEngineeringLab({ onBack }) {
  document.title = 'Saksham Sharma // Playable Project Lab';

  let activeTheme = THEMES.volt;
  try {
    const saved = localStorage.getItem('ss_studio_theme');
    if (saved && THEMES[saved]) activeTheme = THEMES[saved];
  } catch {}

  document.documentElement.style.setProperty('--accent', activeTheme.hex);
  document.documentElement.style.setProperty('--accent-rgb', activeTheme.rgb.join(', '));
  document.documentElement.style.setProperty('--accent-ink', activeTheme.ink);

  let root = document.getElementById('app');
  if (!root) {
    document.body.innerHTML = '<div id="app"></div>';
    root = document.getElementById('app');
  }

  root.innerHTML = `
    <div class="lab-shell">
      <header class="lab-topbar">
        <button type="button" class="ctrl-btn" id="lab-back-btn">
          ← Portfolio
        </button>

        <nav class="lab-tabs" role="tablist" aria-label="Playable Project Lab">
          <button type="button" class="lab-tab active" data-lab-tab="algo">01 · Algo Arena</button>
          <button type="button" class="lab-tab" data-lab-tab="cubes">02 · 3D Cube Pulse</button>
          <button type="button" class="lab-tab" data-lab-tab="typing">03 · Typing Samurai</button>
        </nav>

        <div class="topbar-controls">
          <button type="button" class="ctrl-btn" id="lab-sfx-btn" data-active="${studioSound.isEnabled()}">
            ${studioSound.isEnabled() ? 'SFX On' : 'SFX Off'}
          </button>
        </div>
      </header>

      <!-- 01: ALGO AUDIO ARENA (AlgoVision V2 Gamified) -->
      <section class="lab-pane active" id="pane-algo">
        <div class="lab-inner">
          <div class="lab-pane-head">
            <div>
              <span class="eyebrow">Inspired by AlgoVision V2 · C++ DSA</span>
              <h2>Sorting Algorithm Arena</h2>
            </div>
            <div class="lab-algo-stats">
              <div><span class="vis-k">COMPARISONS</span><b id="algo-cmp">0</b></div>
              <div><span class="vis-k">SWAPS</span><b id="algo-swp">0</b></div>
              <div><span class="vis-k">MODE</span><b id="algo-bigo">O(n log n)</b></div>
            </div>
          </div>

          <div class="lab-algo-stage" id="lab-algo-stage"></div>

          <div class="lab-algo-controls">
            <div class="lab-dock-group">
              <button type="button" class="console-mini-btn active" data-algo="quick">QuickSort</button>
              <button type="button" class="console-mini-btn" data-algo="merge">MergeSort</button>
              <button type="button" class="console-mini-btn" data-algo="heap">HeapSort</button>
              <button type="button" class="console-mini-btn" data-algo="bubble">Bubble</button>
              <button type="button" class="console-mini-btn" data-algo="manual">Play: Manual Sort</button>
            </div>
            <div class="lab-dock-sliders">
              <label id="algo-speed-wrap">
                <span>SPEED</span>
                <input type="range" id="sl-algo-speed" min="8" max="96" value="70" />
              </label>
              <button type="button" class="console-mini-btn" id="btn-algo-shuffle">Shuffle</button>
              <button type="button" class="btn-primary" id="btn-algo-run" style="padding:8px 18px;font-size:12px;">
                Run Sort ▸
              </button>
            </div>
          </div>
          <p class="lab-micro-note" id="algo-hint">
            Tip: Enable <b>SFX On</b> top-right to hear pitch-mapped Web Audio tones as elements sort — or switch to <b>Play: Manual Sort</b> and tap two bars to swap them yourself!
          </p>
        </div>
      </section>

      <!-- 02: 3D CUBE PULSE (Gamified 3D Cubes + Shader Core) -->
      <section class="lab-pane" id="pane-cubes">
        <canvas id="lab-shader-canvas"></canvas>

        <div class="lab-shader-badge">
          <span class="eyebrow">Inspired by SVJ 3D &amp; Core WebGL</span>
          <h1 id="cube-title">3D Cube Pulse</h1>
          <p id="cube-sub">Click or tap the glowing accent cubes orbiting the core before time runs out!</p>
        </div>

        <div class="lab-cube-hud" id="cube-hud">
          <div><span>SCORE</span><b id="cube-score">000</b></div>
          <div><span>COMBO</span><b id="cube-combo">×1</b></div>
          <div><span>TIME</span><b id="cube-time">30s</b></div>
          <div><span>BEST</span><b id="cube-best">000</b></div>
        </div>

        <div class="lab-dock">
          <div class="lab-dock-group">
            <button type="button" class="console-mini-btn active" id="btn-cube-play">Start 30s Blitz</button>
            <button type="button" class="console-mini-btn" id="btn-cube-free">Free Inspect</button>
            <button type="button" class="console-mini-btn" data-geo="core">Core</button>
            <button type="button" class="console-mini-btn" data-geo="knot">Knot</button>
            <button type="button" class="console-mini-btn" data-geo="octa">Octa</button>
          </div>
          <div class="lab-dock-sliders">
            <label>
              <span>NOISE</span>
              <input type="range" id="sl-noise" min="0" max="100" value="36" />
            </label>
            <button type="button" class="console-mini-btn active" id="btn-wire">Wire</button>
          </div>
        </div>
      </section>

      <!-- 03: TYPING SAMURAI × HAPTIC EQ -->
      <section class="lab-pane" id="pane-typing">
        <div class="lab-inner">
          <div class="lab-pane-head">
            <div>
              <span class="eyebrow">Inspired by Typing Samurai &amp; DualSense HapticPulse</span>
              <h2>Code Sprint &amp; Haptic EQ</h2>
            </div>
            <div class="lab-algo-stats">
              <div><span class="vis-k">LIVE WPM</span><b id="typ-wpm">0</b></div>
              <div><span class="vis-k">ACCURACY</span><b id="typ-acc">100%</b></div>
              <div><span class="vis-k">BEST WPM</span><b id="typ-best">0</b></div>
            </div>
          </div>

          <div class="typ-eq-bar" id="typ-eq-bar" aria-hidden="true">
            ${Array.from({ length: 18 }, () => '<span></span>').join('')}
          </div>

          <div class="typ-card">
            <div class="typ-head">
              <span class="eyebrow" id="typ-lang">C++ · DSA</span>
              <button type="button" class="console-mini-btn" id="btn-typ-next">Next Snippet ↻</button>
            </div>
            <div class="typ-prompt" id="typ-prompt"></div>
            <input type="text" id="typ-input" class="lab-url-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Start typing the code snippet above…" />
            <div class="typ-status" id="typ-status">Type to start the timer · Every keystroke pulses the reactive EQ</div>
          </div>
        </div>
      </section>
    </div>
  `;

  /* ==================== TAB & SOUND SWITCHING ==================== */
  let activePane = 'algo';
  const tabs = Array.from(root.querySelectorAll('[data-lab-tab]'));
  const panes = {
    algo: document.getElementById('pane-algo'),
    cubes: document.getElementById('pane-cubes'),
    typing: document.getElementById('pane-typing'),
  };

  let cubesBooted = false;
  let shaderResize = () => {};
  let disposeCubes = () => {};

  function setPane(key) {
    if (!panes[key]) return;
    activePane = key;
    studioSound.tick();
    tabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-lab-tab') === key));
    Object.entries(panes).forEach(([k, el]) => el?.classList.toggle('active', k === key));
    if (key === 'cubes') {
      if (!cubesBooted) {
        cubesBooted = true;
        initCubePulse();
      } else {
        shaderResize();
      }
    } else if (key === 'typing') {
      setTimeout(() => document.getElementById('typ-input')?.focus(), 40);
    }
  }
  tabs.forEach((t) => t.addEventListener('click', () => setPane(t.getAttribute('data-lab-tab'))));

  const sfxBtn = document.getElementById('lab-sfx-btn');
  sfxBtn?.addEventListener('click', () => {
    const on = studioSound.toggle();
    sfxBtn.setAttribute('data-active', String(on));
    sfxBtn.textContent = on ? 'SFX On' : 'SFX Off';
  });

  /* ==================== 01. ALGO AUDIO ARENA + MANUAL CHALLENGE ==================== */
  const algoStage = document.getElementById('lab-algo-stage');
  const cmpEl = document.getElementById('algo-cmp');
  const swpEl = document.getElementById('algo-swp');
  const bigoEl = document.getElementById('algo-bigo');
  const speedSlider = document.getElementById('sl-algo-speed');
  const speedWrap = document.getElementById('algo-speed-wrap');
  const runBtn = document.getElementById('btn-algo-run');
  const algoHint = document.getElementById('algo-hint');

  let arr = [];
  let selectedAlgo = 'quick';
  let sorting = false;
  let sortToken = 0;
  let cmpCount = 0;
  let swpCount = 0;
  let manualPicked = -1;

  const BIG_O = { quick: 'O(n log n)', merge: 'O(n log n)', heap: 'O(n log n)', bubble: 'O(n²)', manual: 'MANUAL PLAY' };

  function isSortedArr(a) {
    for (let i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false;
    return true;
  }

  function renderBars(activeIdx = [], sortedSet = new Set()) {
    if (!algoStage) return;
    const isManual = selectedAlgo === 'manual';
    algoStage.innerHTML = arr
      .map((val, i) => {
        const cls = sortedSet.has(i)
          ? 'sorted'
          : i === manualPicked || activeIdx.includes(i)
          ? 'active'
          : '';
        return `
          <div class="algo-bar ${cls} ${isManual ? 'manual-bar' : ''}" data-bar-i="${i}" style="height:${val}%">
            ${isManual ? `<span>${Math.round(val / 10)}</span>` : ''}
          </div>
        `;
      })
      .join('');
    if (cmpEl) cmpEl.textContent = String(cmpCount);
    if (swpEl) swpEl.textContent = String(swpCount);
  }

  function shuffleBars() {
    sortToken++;
    sorting = false;
    manualPicked = -1;
    cmpCount = 0;
    swpCount = 0;
    const isManual = selectedAlgo === 'manual';
    const count = isManual ? 8 : window.innerWidth < 640 ? 20 : 32;
    if (runBtn) {
      runBtn.style.display = isManual ? 'none' : 'inline-flex';
      runBtn.textContent = 'Run Sort ▸';
    }
    if (speedWrap) speedWrap.style.display = isManual ? 'none' : 'inline-flex';
    if (algoHint) {
      algoHint.innerHTML = isManual
        ? '<b>Manual Sort Challenge:</b> Click any two bars to swap them until all 8 bars are ordered shortest → tallest in the fewest swaps!'
        : 'Tip: Enable <b>SFX On</b> top-right to hear pitch-mapped Web Audio chimes — or switch to <b>Play: Manual Sort</b> to sort bars yourself.';
    }

    arr = Array.from({ length: count }, (_, i) => Math.round(16 + ((i + 1) / count) * 80));
    do {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (isSortedArr(arr));
    renderBars();
  }
  shuffleBars();

  algoStage?.addEventListener('click', (e) => {
    if (selectedAlgo !== 'manual') return;
    const bar = e.target.closest('[data-bar-i]');
    if (!bar) return;
    const idx = Number(bar.getAttribute('data-bar-i'));
    if (manualPicked === -1) {
      manualPicked = idx;
      studioSound.tick();
      renderBars([idx]);
    } else if (manualPicked === idx) {
      manualPicked = -1;
      renderBars();
    } else {
      [arr[manualPicked], arr[idx]] = [arr[idx], arr[manualPicked]];
      swpCount++;
      cmpCount++;
      const a = manualPicked;
      manualPicked = -1;
      studioSound.catchBlip(Math.min(8, swpCount));
      if (isSortedArr(arr)) {
        const all = new Set(arr.map((_, k) => k));
        renderBars([], all);
        studioSound.badgeUnlock();
        if (algoHint) algoHint.innerHTML = `<b style="color:var(--accent)">✦ SORTED IN ${swpCount} SWAPS!</b> Hit <b>Shuffle</b> to beat your swap count.`;
      } else {
        renderBars([a, idx]);
      }
    }
  });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const stepDelay = () => Math.max(8, Math.round(112 - Number(speedSlider?.value || 70)));
  const beepVal = (v) => {
    if (!studioSound.isEnabled()) return;
    studioSound.catchBlip(Math.min(8, Math.floor((v / 100) * 8) + 1));
  };

  async function runSort() {
    if (selectedAlgo === 'manual') return;
    if (sorting) {
      sortToken++;
      sorting = false;
      if (runBtn) runBtn.textContent = 'Run Sort ▸';
      return;
    }
    const token = ++sortToken;
    sorting = true;
    cmpCount = 0;
    swpCount = 0;
    if (runBtn) runBtn.textContent = 'Stop ■';
    const sorted = new Set();
    const alive = () => token === sortToken;

    if (selectedAlgo === 'quick') {
      async function qs(lo, hi) {
        if (!alive() || lo >= hi) { if (lo === hi) sorted.add(lo); return; }
        const pivot = arr[hi];
        let i = lo;
        for (let j = lo; j < hi; j++) {
          if (!alive()) return;
          cmpCount++;
          renderBars([j, hi], sorted);
          beepVal(arr[j]);
          await sleep(stepDelay());
          if (arr[j] < pivot) { [arr[i], arr[j]] = [arr[j], arr[i]]; swpCount++; i++; }
        }
        [arr[i], arr[hi]] = [arr[hi], arr[i]];
        swpCount++;
        sorted.add(i);
        await qs(lo, i - 1);
        await qs(i + 1, hi);
      }
      await qs(0, arr.length - 1);
    } else if (selectedAlgo === 'merge') {
      async function ms(l, r) {
        if (!alive() || l >= r) return;
        const m = (l + r) >> 1;
        await ms(l, m);
        await ms(m + 1, r);
        const left = arr.slice(l, m + 1);
        const right = arr.slice(m + 1, r + 1);
        let i = 0; let j = 0; let k = l;
        while (i < left.length && j < right.length) {
          if (!alive()) return;
          cmpCount++;
          arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];
          swpCount++;
          renderBars([k - 1], sorted);
          beepVal(arr[k - 1]);
          await sleep(stepDelay());
        }
        while (i < left.length && alive()) { arr[k++] = left[i++]; renderBars([k - 1], sorted); await sleep(stepDelay()); }
        while (j < right.length && alive()) { arr[k++] = right[j++]; renderBars([k - 1], sorted); await sleep(stepDelay()); }
      }
      await ms(0, arr.length - 1);
    } else if (selectedAlgo === 'heap') {
      async function heapify(n, i) {
        if (!alive()) return;
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        if (l < n) { cmpCount++; if (arr[l] > arr[largest]) largest = l; }
        if (r < n) { cmpCount++; if (arr[r] > arr[largest]) largest = r; }
        if (largest !== i) {
          [arr[i], arr[largest]] = [arr[largest], arr[i]];
          swpCount++;
          renderBars([i, largest], sorted);
          beepVal(arr[i]);
          await sleep(stepDelay());
          await heapify(n, largest);
        }
      }
      for (let i = (arr.length >> 1) - 1; i >= 0; i--) await heapify(arr.length, i);
      for (let i = arr.length - 1; i > 0; i--) {
        if (!alive()) return;
        [arr[0], arr[i]] = [arr[i], arr[0]];
        swpCount++;
        sorted.add(i);
        renderBars([0, i], sorted);
        await sleep(stepDelay());
        await heapify(i, 0);
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          if (!alive()) return;
          cmpCount++;
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            swpCount++;
          }
          renderBars([j, j + 1], sorted);
          beepVal(arr[j + 1]);
          await sleep(stepDelay());
        }
        sorted.add(arr.length - i - 1);
      }
    }

    if (alive()) {
      for (let i = 0; i < arr.length; i++) sorted.add(i);
      renderBars([], sorted);
      studioSound.badgeUnlock();
      sorting = false;
      if (runBtn) runBtn.textContent = 'Run Sort ▸';
    }
  }

  root.querySelectorAll('[data-algo]').forEach((b) => {
    b.addEventListener('click', () => {
      selectedAlgo = b.getAttribute('data-algo');
      root.querySelectorAll('[data-algo]').forEach((x) => x.classList.toggle('active', x === b));
      if (bigoEl) bigoEl.textContent = BIG_O[selectedAlgo] || 'O(n log n)';
      studioSound.tick();
      shuffleBars();
    });
  });
  document.getElementById('btn-algo-shuffle')?.addEventListener('click', () => { studioSound.tick(); shuffleBars(); });
  runBtn?.addEventListener('click', runSort);

  /* ==================== 02. 3D CUBE PULSE (RAYCASTED 3D TARGET GAME + GLSL CORE) ==================== */
  async function initCubePulse() {
    const shaderCanvas = document.getElementById('lab-shader-canvas');
    let THREE;
    let renderer;
    try {
      THREE = await import('three');
      renderer = new THREE.WebGLRenderer({ canvas: shaderCanvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      const sub = document.getElementById('cube-sub');
      if (sub) sub.textContent = 'WebGL is unavailable on this browser — try 01 Algo Arena or 03 Typing Samurai above!';
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, window.innerWidth / Math.max(1, window.innerHeight - 64), 0.1, 80);
    camera.position.set(0, 0, window.innerWidth < 700 ? 7.8 : 6.2);

    const rig = new THREE.Group();
    scene.add(rig);

    // Central custom GLSL Fresnel Core
    const uniforms = {
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(activeTheme.hex) },
      uNoise: { value: 0.36 },
      uPulse: { value: 0 },
    };

    const coreMat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: /* glsl */ `
        varying vec3 vNormal; varying vec3 vView;
        uniform float uTime; uniform float uNoise; uniform float uPulse;
        void main() {
          float n = sin(position.x * 3.0 + uTime * 1.5) * cos(position.y * 3.0 - uTime * 1.2);
          vec3 pos = position + normal * (n * (uNoise * 0.25 + uPulse * 0.2));
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormal; varying vec3 vView;
        uniform vec3 uAccent; uniform float uPulse;
        void main() {
          float fr = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.3);
          vec3 col = vec3(0.055, 0.058, 0.072) + uAccent * fr * (0.95 + uPulse * 0.8);
          gl_FragColor = vec4(col, 0.96);
        }
      `,
    });

    const wireMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(activeTheme.hex), wireframe: true, transparent: true, opacity: 0.28 });

    const forms = {
      core: new THREE.Group(),
      knot: new THREE.Group(),
      octa: new THREE.Group(),
    };
    forms.core.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 4), coreMat));
    forms.core.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.32, 1), wireMat));
    forms.knot.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.86, 0.26, 128, 22), coreMat));
    forms.knot.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.9, 0.28, 48, 8), wireMat));
    forms.octa.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.22, 1), coreMat));
    forms.octa.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.44, 1), wireMat));

    Object.entries(forms).forEach(([k, g]) => { g.visible = k === 'core'; rig.add(g); });

    // 10 Orbiting Interactive 3D Cubes (Raycastable Game Targets!)
    const cubeGeom = new THREE.BoxGeometry(0.48, 0.48, 0.48);
    const cubes = [];
    const cubeGroup = new THREE.Group();
    rig.add(cubeGroup);

    const accentColor = new THREE.Color(activeTheme.hex);
    const dimColor = new THREE.Color(0x272732);

    for (let i = 0; i < 10; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: dimColor.clone(),
        emissive: new THREE.Color(0x000000),
        metalness: 0.35,
        roughness: 0.35,
      });
      const mesh = new THREE.Mesh(cubeGeom, mat);
      const angle = (i / 10) * Math.PI * 2;
      const radius = 2.45 + (i % 2) * 0.45;
      const elev = ((i % 3) - 1) * 0.72;
      mesh.position.set(Math.cos(angle) * radius, elev, Math.sin(angle) * radius);
      mesh.userData = { idx: i, baseAngle: angle, radius, elev, lit: false, scalePop: 1 };
      cubeGroup.add(mesh);
      cubes.push(mesh);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    // Game State
    const CUBE_BEST_KEY = 'ss_cube_pulse_best_v1';
    let bestScore = 0;
    try { bestScore = Number(localStorage.getItem(CUBE_BEST_KEY) || 0); } catch {}
    let blitzActive = false;
    let freeInspect = false;
    let score = 0;
    let combo = 1;
    let timeLeft = 30;
    let litIdx = -1;

    const scoreEl = document.getElementById('cube-score');
    const comboEl = document.getElementById('cube-combo');
    const timeEl = document.getElementById('cube-time');
    const bestEl = document.getElementById('cube-best');
    const cubeSub = document.getElementById('cube-sub');
    const btnPlay = document.getElementById('btn-cube-play');
    const btnFree = document.getElementById('btn-cube-free');

    function syncCubeHud() {
      if (scoreEl) scoreEl.textContent = String(score).padStart(3, '0');
      if (comboEl) comboEl.textContent = `×${combo}`;
      if (timeEl) timeEl.textContent = `${Math.ceil(timeLeft)}s`;
      if (bestEl) bestEl.textContent = String(bestScore).padStart(3, '0');
    }
    syncCubeHud();

    function lightNextCube(prevIdx = -1) {
      cubes.forEach((c) => {
        c.userData.lit = false;
        c.material.color.copy(dimColor);
        c.material.emissive.setHex(0x000000);
      });
      let next = (Math.random() * cubes.length) | 0;
      if (next === prevIdx) next = (next + 3) % cubes.length;
      litIdx = next;
      const target = cubes[litIdx];
      target.userData.lit = true;
      target.userData.scalePop = 1.45;
      target.material.color.copy(accentColor);
      target.material.emissive.copy(accentColor).multiplyScalar(0.55);
    }

    function startBlitz() {
      freeInspect = false;
      blitzActive = true;
      score = 0;
      combo = 1;
      timeLeft = 30;
      btnPlay?.classList.add('active');
      btnFree?.classList.remove('active');
      if (cubeSub) cubeSub.textContent = 'HIT THE GLOWING CUBES! Streak morphs the central GLSL core.';
      lightNextCube();
      syncCubeHud();
      studioSound.tick();
    }

    // Light one inviting target cube right away so clicking immediately works!
    lightNextCube();

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let dragging = false;
    let moved = 0;
    let lx = 0;
    let ly = 0;
    let vx = 0.002;
    let vy = 0.006;

    const onDown = (e) => {
      const rect = shaderCanvas.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(cubes, false);

      if (hits.length > 0 && !freeInspect) {
        const hitCube = hits[0].object;
        if (hitCube.userData.lit) {
          if (!blitzActive) startBlitz();
          const pts = 10 * combo;
          score += pts;
          combo = Math.min(5, combo + 1);
          if (score > bestScore) {
            bestScore = score;
            try { localStorage.setItem(CUBE_BEST_KEY, String(bestScore)); } catch {}
          }
          uniforms.uPulse.value = 1.35;
          studioSound.catchBlip(combo);
          // Morph central core as combo climbs!
          const formKey = combo >= 4 ? 'knot' : combo >= 2 ? 'octa' : 'core';
          Object.entries(forms).forEach(([fk, fg]) => { fg.visible = fk === formKey; });
          lightNextCube(hitCube.userData.idx);
          syncCubeHud();
          return;
        }
      }

      dragging = true;
      moved = 0;
      lx = e.clientX;
      ly = e.clientY;
      shaderCanvas.setPointerCapture?.(e.pointerId);
    };

    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      moved += Math.hypot(dx, dy);
      vy = dx * 0.009;
      vx = dy * 0.009;
      rig.rotation.y += vy;
      rig.rotation.x += vx;
      lx = e.clientX;
      ly = e.clientY;
    };

    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      shaderCanvas.releasePointerCapture?.(e.pointerId);
      if (moved < 6) {
        uniforms.uPulse.value = 1.0;
        studioSound.pluck(3);
      }
    };

    shaderCanvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    btnPlay?.addEventListener('click', startBlitz);
    btnFree?.addEventListener('click', () => {
      freeInspect = true;
      blitzActive = false;
      btnFree.classList.add('active');
      btnPlay?.classList.remove('active');
      if (cubeSub) cubeSub.textContent = 'Free Inspect Mode — drag 360° to orbit or switch core geometry below.';
      studioSound.tick();
    });

    root.querySelectorAll('[data-geo]').forEach((b) => {
      b.addEventListener('click', () => {
        const k = b.getAttribute('data-geo');
        Object.entries(forms).forEach(([fk, fg]) => { fg.visible = fk === k; });
        uniforms.uPulse.value = 1.0;
        studioSound.tick();
      });
    });

    document.getElementById('sl-noise')?.addEventListener('input', (e) => {
      uniforms.uNoise.value = Number(e.target.value) / 100;
    });
    const btnWire = document.getElementById('btn-wire');
    btnWire?.addEventListener('click', () => {
      wireMat.visible = !wireMat.visible;
      btnWire.classList.toggle('active', wireMat.visible);
      studioSound.tick();
    });

    shaderResize = () => {
      const w = window.innerWidth;
      const h = Math.max(240, window.innerHeight - 64);
      camera.aspect = w / h;
      camera.position.z = w < 700 ? 7.8 : 6.2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    shaderResize();
    window.addEventListener('resize', shaderResize);

    let rafId = 0;
    let lastNow = performance.now();
    let elapsed = 0;

    function tick(now = performance.now()) {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      if (activePane !== 'cubes' || document.hidden) return;

      elapsed += dt;
      uniforms.uTime.value = elapsed;
      uniforms.uPulse.value = Math.max(0, uniforms.uPulse.value - dt * 2.1);

      if (blitzActive) {
        timeLeft = Math.max(0, timeLeft - dt);
        syncCubeHud();
        if (timeLeft <= 0) {
          blitzActive = false;
          studioSound.badgeUnlock();
          if (cubeSub) cubeSub.textContent = `TIME'S UP! Final Score: ${score} PTS (Best: ${bestScore}). Click Start 30s Blitz or any lit cube to play again!`;
        }
      }

      if (!dragging) {
        rig.rotation.y += vy;
        rig.rotation.x += vx;
        vy += (0.0055 - vy) * 0.04;
        vx += (0.0012 - vx) * 0.04;
      }

      cubes.forEach((c, idx) => {
        const d = c.userData;
        const a = d.baseAngle + elapsed * 0.42;
        c.position.x = Math.cos(a) * d.radius;
        c.position.z = Math.sin(a) * d.radius;
        c.position.y = d.elev + Math.sin(elapsed * 1.8 + idx) * 0.22;
        c.rotation.x += dt * (d.lit ? 2.4 : 0.7);
        c.rotation.y += dt * (d.lit ? 2.8 : 0.9);
        const targetS = d.lit ? 1.26 + Math.sin(elapsed * 8) * 0.1 : 0.92;
        d.scalePop += (targetS - d.scalePop) * 0.14;
        c.scale.setScalar(d.scalePop);
      });

      renderer.render(scene, camera);
    }
    tick();

    disposeCubes = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', shaderResize);
      shaderCanvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderer.dispose();
    };
  }

  /* ==================== 03. TYPING SAMURAI × HAPTIC EQ ==================== */
  const typLangEl = document.getElementById('typ-lang');
  const typPromptEl = document.getElementById('typ-prompt');
  const typInput = document.getElementById('typ-input');
  const typStatus = document.getElementById('typ-status');
  const typWpmEl = document.getElementById('typ-wpm');
  const typAccEl = document.getElementById('typ-acc');
  const typBestEl = document.getElementById('typ-best');
  const eqSpans = Array.from(document.querySelectorAll('#typ-eq-bar span'));

  const TYP_BEST_KEY = 'ss_typing_samurai_best_v1';
  let typBest = 0;
  try { typBest = Number(localStorage.getItem(TYP_BEST_KEY) || 0); } catch {}
  if (typBestEl) typBestEl.textContent = String(typBest);

  let snippetIdx = 0;
  let typStart = 0;
  let eqDecayTimer = 0;

  function pulseTypingEq(good = true) {
    eqSpans.forEach((sp, idx) => {
      const centerBoost = 1 - Math.abs(idx - eqSpans.length / 2) / (eqSpans.length / 2);
      const h = 18 + Math.round((Math.random() * 55 + centerBoost * 28));
      sp.style.height = `${Math.min(100, h)}%`;
      sp.style.background = good ? 'var(--accent)' : 'var(--danger)';
    });
    clearTimeout(eqDecayTimer);
    eqDecayTimer = setTimeout(() => {
      eqSpans.forEach((sp) => {
        sp.style.height = '14%';
        sp.style.background = 'rgba(255,255,255,0.16)';
      });
    }, 180);
  }

  function renderSnippet() {
    const sn = CODE_SNIPPETS[snippetIdx % CODE_SNIPPETS.length];
    const typed = typInput?.value || '';
    if (typLangEl) typLangEl.textContent = sn.lang;
    if (typPromptEl) {
      typPromptEl.innerHTML = sn.code
        .split('')
        .map((ch, i) => {
          const safe = ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '&' ? '&amp;' : ch;
          if (i < typed.length) {
            return `<span class="${typed[i] === ch ? 'ch-ok' : 'ch-err'}">${safe}</span>`;
          }
          if (i === typed.length) return `<span class="ch-cur">${safe}</span>`;
          return `<span>${safe}</span>`;
        })
        .join('');
    }
  }

  function loadSnippet(next = false) {
    if (next) snippetIdx = (snippetIdx + 1) % CODE_SNIPPETS.length;
    typStart = 0;
    if (typInput) typInput.value = '';
    if (typWpmEl) typWpmEl.textContent = '0';
    if (typAccEl) typAccEl.textContent = '100%';
    if (typStatus) typStatus.textContent = 'Type the snippet above to start the clock · Every keystroke pulses the EQ';
    renderSnippet();
  }
  loadSnippet(false);

  typInput?.addEventListener('input', () => {
    const sn = CODE_SNIPPETS[snippetIdx % CODE_SNIPPETS.length].code;
    const val = typInput.value;
    if (!typStart && val.length > 0) typStart = performance.now();

    let correct = 0;
    for (let i = 0; i < val.length; i++) if (val[i] === sn[i]) correct++;
    const lastOk = val.length === 0 || val[val.length - 1] === sn[val.length - 1];
    pulseTypingEq(lastOk);
    if (lastOk) studioSound.tick();
    else studioSound.bugHit();

    const acc = val.length ? Math.round((correct / val.length) * 100) : 100;
    const mins = Math.max(0.015, (performance.now() - (typStart || performance.now())) / 60000);
    const wpm = Math.round((correct / 5) / mins);

    if (typWpmEl) typWpmEl.textContent = String(wpm);
    if (typAccEl) typAccEl.textContent = `${acc}%`;
    renderSnippet();

    if (val === sn) {
      if (wpm > typBest) {
        typBest = wpm;
        try { localStorage.setItem(TYP_BEST_KEY, String(typBest)); } catch {}
        if (typBestEl) typBestEl.textContent = String(typBest);
      }
      studioSound.badgeUnlock();
      if (typStatus) typStatus.innerHTML = `<b style="color:var(--accent)">✦ SNIPPET CLEARED · ${wpm} WPM (${acc}% ACC)!</b> Click Next Snippet ↻ for another.`;
    }
  });

  document.getElementById('btn-typ-next')?.addEventListener('click', () => {
    studioSound.tick();
    loadSnippet(true);
    typInput?.focus();
  });

  /* ==================== CLEAN EXIT BACK TO PORTFOLIO ==================== */
  function disposeLab() {
    sortToken++;
    clearTimeout(eqDecayTimer);
    disposeCubes();
  }

  document.getElementById('lab-back-btn')?.addEventListener('click', () => {
    studioSound.tick();
    disposeLab();
    window.history.pushState({}, '', '/');
    onBack?.();
  });

  return { dispose: disposeLab };
}
