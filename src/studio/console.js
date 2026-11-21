/**
 * CORE-01 — Interactive Playable Hardware Console (Hero Right-Column Bento)
 * Strictly contained inside its own rounded hardware frame so page text stays 100% crisp.
 * Built for instant zero-lag responsiveness on both desktop mouse and mobile touch.
 *
 * Modes:
 *  1. `game`    — PACKET RUN: 60fps arcade mini-game (catch tech stack, dodge red bugs/phish)
 *  2. `physics` — STACK LAB: 2D rigid-body pill playground (hover, grab, fling, radial shockwaves, Zero-G)
 *  3. `orb`     — 3D STUDIO: Three.js GLSL shader orb (hover light parallax, 360° inertial drag, 3 switchable forms)
 */
import { studioSound } from './sound.js';

const GOOD_PACKETS = [
  'C++', 'PYTHON', 'THREE.JS', 'REACT', 'FASTAPI', 'ROCM', 'MV3', 'NEXT.JS', 'PYTORCH', 'LINUX',
];
const BAD_PACKETS = ['BUG', 'PHISH', 'SEGFAULT', 'XSS'];

const PHYSICS_SKILLS = [
  { label: 'C++ DSA', accent: true },
  { label: 'Python', accent: false },
  { label: 'Chrome MV3', accent: true },
  { label: 'FastAPI', accent: false },
  { label: 'React 19', accent: false },
  { label: 'Three.js', accent: true },
  { label: 'Next.js', accent: false },
  { label: 'PyTorch', accent: false },
  { label: 'TypeScript', accent: false },
  { label: 'Linux', accent: false },
  { label: 'SQL', accent: false },
  { label: 'ROCm', accent: true },
];

export function mountHeroConsole(container, { onUnlock, getAccent }) {
  if (!container) return { setMode() {}, setAccent() {}, dispose() {} };

  const canvas2d = container.querySelector('#console-canvas-2d');
  const canvas3d = container.querySelector('#console-canvas-3d');
  const modeBtns = Array.from(container.querySelectorAll('[data-console-mode]'));
  const hudLeft = container.querySelector('#console-hud-left');
  const hudRight = container.querySelector('#console-hud-right');
  const footerControls = container.querySelector('#console-footer-controls');
  const overlayEl = container.querySelector('#console-overlay');
  const stageEl = container.querySelector('#console-stage');

  let mode = 'game'; // 'game' | 'physics' | 'orb'
  let accentHex = getAccent?.()?.hex || '#C8FF3D';
  let accentRgb = getAccent?.()?.rgb || [200, 255, 61];

  const ctx = canvas2d.getContext('2d');
  let W = 420;
  let H = 330;
  let dpr = 1;
  let onResizePhysHook = null;

  function resize2d() {
    if (!stageEl) return;
    const rect = stageEl.getBoundingClientRect();
    const nextW = Math.max(220, Math.floor(rect.width));
    const nextH = Math.max(220, Math.floor(rect.height));
    if (nextW === W && nextH === H && canvas2d.width > 0) return;
    W = nextW;
    H = nextH;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas2d.width = Math.floor(W * dpr);
    canvas2d.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResizePhysHook?.();
  }
  resize2d();

  const ro = new ResizeObserver(() => {
    resize2d();
    if (orbApi) orbApi.resize();
  });
  ro.observe(stageEl);

  /* ============================================================================
   * MODE 1: PACKET RUN (Playable 60fps Arcade Mini-Game)
   * ============================================================================ */
  const BEST_KEY = 'ss_packet_run_best_v1';
  let bestScore = 0;
  try { bestScore = Number(localStorage.getItem(BEST_KEY) || 0); } catch {}

  const game = {
    state: 'attract', // 'attract' | 'playing' | 'over'
    score: 0,
    combo: 0,
    catches: 0,
    shields: 3,
    paddleX: 210,
    paddleTargetX: 210,
    paddleW: 82,
    keys: { left: false, right: false },
    items: [],
    particles: [],
    floats: [],
    spawnTimer: 0,
    elapsed: 0,
    shake: 0,
    flashRed: 0,
  };

  function resetGame(playNow = true) {
    game.state = playNow ? 'playing' : 'attract';
    game.score = 0;
    game.combo = 0;
    game.catches = 0;
    game.shields = 3;
    game.paddleX = W * 0.5;
    game.paddleTargetX = W * 0.5;
    game.items = [];
    game.particles = [];
    game.floats = [];
    game.spawnTimer = 0.2;
    game.elapsed = 0;
    game.shake = 0;
    game.flashRed = 0;
    syncOverlay();
  }

  function spawnPacket() {
    const isBad = Math.random() < (game.state === 'attract' ? 0.22 : Math.min(0.36, 0.24 + game.elapsed * 0.004));
    const label = isBad
      ? BAD_PACKETS[(Math.random() * BAD_PACKETS.length) | 0]
      : GOOD_PACKETS[(Math.random() * GOOD_PACKETS.length) | 0];
    const width = Math.max(46, label.length * 7.6 + 18);
    const speedBase = game.state === 'attract' ? 92 : 110 + Math.min(130, game.elapsed * 3.1);
    game.items.push({
      x: 30 + Math.random() * Math.max(40, W - 60),
      y: -18,
      w: width,
      h: 24,
      vy: speedBase + Math.random() * 44,
      vx: (Math.random() - 0.5) * 20,
      bad: isBad,
      label,
    });
  }

  function emitBurst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const spd = 50 + Math.random() * 115;
      game.particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 20,
        life: 0.44 + Math.random() * 0.22,
        maxLife: 0.65,
        color,
        r: 1.8 + Math.random() * 2.2,
      });
    }
  }

  function updateGame(dt) {
    game.elapsed += dt;
    game.shake = Math.max(0, game.shake - dt * 28);
    game.flashRed = Math.max(0, game.flashRed - dt * 2.8);

    if (game.state === 'attract') {
      const good = game.items
        .filter((it) => !it.bad && it.y < H - 24)
        .sort((a, b) => b.y - a.y)[0];
      if (good) game.paddleTargetX = good.x;
      else game.paddleTargetX = W * 0.5 + Math.sin(game.elapsed * 1.4) * (W * 0.22);
    } else if (game.state === 'playing') {
      const keySpeed = 420;
      if (game.keys.left) game.paddleTargetX -= keySpeed * dt;
      if (game.keys.right) game.paddleTargetX += keySpeed * dt;
    }

    const halfP = game.paddleW * 0.5;
    game.paddleTargetX = Math.max(halfP + 10, Math.min(W - halfP - 10, game.paddleTargetX));
    game.paddleX += (game.paddleTargetX - game.paddleX) * Math.min(1, dt * 24);

    if (game.state !== 'over') {
      game.spawnTimer -= dt;
      if (game.spawnTimer <= 0) {
        spawnPacket();
        const cadence = game.state === 'attract' ? 0.8 : Math.max(0.36, 0.76 - game.elapsed * 0.008);
        game.spawnTimer = cadence;
      }
    }

    const paddleY = H - 28;
    for (let i = game.items.length - 1; i >= 0; i--) {
      const it = game.items[i];
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      if (it.x < it.w * 0.5 + 8 || it.x > W - it.w * 0.5 - 8) it.vx *= -1;

      const hitY = it.y + it.h * 0.5 >= paddleY - 7 && it.y - it.h * 0.5 <= paddleY + 9;
      const hitX = Math.abs(it.x - game.paddleX) <= (game.paddleW * 0.5 + it.w * 0.44);

      if (hitY && hitX && game.state !== 'over') {
        game.items.splice(i, 1);
        if (it.bad) {
          emitBurst(it.x, paddleY, '#FF4D6A', 12);
          if (game.state === 'playing') {
            game.combo = 0;
            game.shields -= 1;
            game.shake = 7;
            game.flashRed = 0.65;
            studioSound.bugHit();
            game.floats.push({ x: it.x, y: paddleY - 14, text: '-1 SHIELD', color: '#FF5D73', life: 0.75 });
            if (game.shields <= 0) {
              game.state = 'over';
              if (game.score > bestScore) {
                bestScore = game.score;
                try { localStorage.setItem(BEST_KEY, String(bestScore)); } catch {}
              }
              syncOverlay();
            }
          }
        } else {
          emitBurst(it.x, paddleY, accentHex, 10);
          if (game.state === 'playing') {
            game.combo += 1;
            game.catches += 1;
            const mult = Math.min(4, 1 + Math.floor(game.combo / 4));
            const pts = 10 * mult;
            game.score += pts;
            if (game.score > bestScore) {
              bestScore = game.score;
              try { localStorage.setItem(BEST_KEY, String(bestScore)); } catch {}
            }
            studioSound.catchBlip(game.combo);
            game.floats.push({
              x: it.x,
              y: paddleY - 14,
              text: mult > 1 ? `+${pts} ×${mult}` : `+${pts}`,
              color: accentHex,
              life: 0.7,
            });
            if (game.catches === 4) onUnlock?.('arcade');
          }
        }
        continue;
      }

      if (it.y > H + 26) {
        if (!it.bad && game.state === 'playing') game.combo = 0;
        game.items.splice(i, 1);
      }
    }

    for (let i = game.particles.length - 1; i >= 0; i--) {
      const p = game.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 190 * dt;
      p.life -= dt;
      if (p.life <= 0) game.particles.splice(i, 1);
    }
    for (let i = game.floats.length - 1; i >= 0; i--) {
      const f = game.floats[i];
      f.y -= 38 * dt;
      f.life -= dt;
      if (f.life <= 0) game.floats.splice(i, 1);
    }

    if (hudLeft) {
      const mult = Math.max(1, Math.min(4, 1 + Math.floor(game.combo / 4)));
      hudLeft.textContent =
        game.state === 'playing'
          ? `SCORE ${String(game.score).padStart(3, '0')} · ×${mult}`
          : `PACKET RUN · BEST ${String(bestScore).padStart(3, '0')}`;
    }
    if (hudRight) {
      const hearts = '●'.repeat(Math.max(0, game.shields)) + '○'.repeat(Math.max(0, 3 - game.shields));
      hudRight.textContent = game.state === 'playing' ? `SHIELD ${hearts}` : 'AUTOPILOT';
    }
  }

  function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.038)';
    ctx.lineWidth = 1;
    const step = 28;
    ctx.beginPath();
    for (let x = step; x < W; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = step; y < H; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  }

  function renderGame() {
    ctx.save();
    if (game.shake > 0.2) {
      ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
    }

    ctx.clearRect(0, 0, W, H);
    drawGrid();

    if (game.flashRed > 0.01) {
      ctx.fillStyle = `rgba(255, 77, 106, ${(game.flashRed * 0.22).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.font = '600 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const it of game.items) {
      const x = it.x - it.w * 0.5;
      const y = it.y - it.h * 0.5;

      drawRoundedRect(x, y, it.w, it.h, 7);
      if (it.bad) {
        ctx.fillStyle = 'rgba(255, 68, 98, 0.17)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 92, 118, 0.8)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = '#FF7B8E';
      } else {
        ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.14)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.78)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = '#F5F5F7';
      }
      ctx.fillText(it.label, it.x, it.y + 0.5);
    }

    const paddleY = H - 28;
    const px = game.paddleX - game.paddleW * 0.5;
    ctx.save();
    ctx.shadowColor = accentHex;
    ctx.shadowBlur = 14;
    drawRoundedRect(px, paddleY - 5, game.paddleW, 10, 5);
    ctx.fillStyle = accentHex;
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#09090B';
    ctx.fillRect(game.paddleX - 9, paddleY - 1.5, 18, 3);

    for (const p of game.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.font = '600 11px "JetBrains Mono", monospace';
    for (const f of game.floats) {
      ctx.globalAlpha = Math.min(1, f.life * 1.6);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* ============================================================================
   * MODE 2: PHYSICS STACK (Responsive 2D Rigid-Body Sandbox + Spring Tether + Shockwaves)
   * ============================================================================ */
  const phys = {
    initialized: false,
    zeroG: false,
    bodies: [],
    ripples: [],
    dragBody: null,
    hoverBody: null,
    ptrX: 0,
    ptrY: 0,
    dragOffX: 0,
    dragOffY: 0,
    samples: [], // rolling { x, y, t } for smooth velocity release
  };

  onResizePhysHook = () => {
    if (!phys.initialized) return;
    for (const b of phys.bodies) {
      b.x = Math.max(b.w * 0.5 + 10, Math.min(W - b.w * 0.5 - 10, b.x));
      b.y = Math.max(b.h * 0.5 + 24, Math.min(H - b.h * 0.5 - 10, b.y));
    }
  };

  function initPhysics() {
    const cols = W < 340 ? 2 : 3;
    const cellW = Math.max(84, (W - 44) / cols);
    phys.bodies = PHYSICS_SKILLS.map((sk, idx) => {
      const compact = W < 340;
      const w = Math.max(compact ? 62 : 68, sk.label.length * (compact ? 7.2 : 7.8) + 22);
      const h = compact ? 28 : 31;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        label: sk.label,
        accent: sk.accent,
        w,
        h,
        x: Math.min(W - w * 0.5 - 12, Math.max(w * 0.5 + 12, 34 + col * cellW + cellW * 0.35 + (Math.random() - 0.5) * 14)),
        y: 38 + row * 40 + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 130,
        vy: -20 - Math.random() * 60,
        angle: (Math.random() - 0.5) * 0.28,
        angVel: (Math.random() - 0.5) * 1.4,
      };
    });
    phys.ripples = [];
    phys.dragBody = null;
    phys.hoverBody = null;
    phys.initialized = true;
  }

  function findPhysicsBody(x, y) {
    for (let i = phys.bodies.length - 1; i >= 0; i--) {
      const b = phys.bodies[i];
      // Transform point into pill's local rotated coordinates with generous +10px touch padding
      const dx = x - b.x;
      const dy = y - b.y;
      const cos = Math.cos(-b.angle);
      const sin = Math.sin(-b.angle);
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;
      if (Math.abs(lx) <= b.w * 0.5 + 10 && Math.abs(ly) <= b.h * 0.5 + 10) {
        return b;
      }
    }
    return null;
  }

  function emitShockwave(x, y) {
    phys.ripples.push({ x, y, r: 8, maxR: 135, life: 1 });
    studioSound.bounce(0.75);
    for (const b of phys.bodies) {
      const dx = b.x - x;
      const dy = b.y - y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 175) {
        const force = (1 - dist / 175) * 520;
        b.vx += (dx / dist) * force;
        b.vy += (dy / dist) * force - 160;
        b.angVel += ((dx > 0 ? 1 : -1) * force) * 0.008;
      }
    }
    onUnlock?.('physics');
  }

  function shakePhysics() {
    if (!phys.initialized) initPhysics();
    studioSound.bounce(0.9);
    phys.ripples.push({ x: W * 0.5, y: H * 0.65, r: 10, maxR: 170, life: 1 });
    for (const b of phys.bodies) {
      b.vx += (Math.random() - 0.5) * 480;
      b.vy -= 280 + Math.random() * 300;
      b.angVel += (Math.random() - 0.5) * 6;
    }
    onUnlock?.('physics');
  }

  function updatePhysics(dt) {
    if (!phys.initialized) initPhysics();
    const gravity = phys.zeroG ? 0 : 780;
    const damp = phys.zeroG ? 0.996 : 0.992;

    for (const b of phys.bodies) {
      if (b === phys.dragBody) {
        // Silky spring attraction toward pointer while grabbed
        const targetX = Math.max(b.w * 0.5 + 8, Math.min(W - b.w * 0.5 - 8, phys.ptrX - phys.dragOffX));
        const targetY = Math.max(b.h * 0.5 + 8, Math.min(H - b.h * 0.5 - 8, phys.ptrY - phys.dragOffY));
        b.vx = (targetX - b.x) * 20;
        b.vy = (targetY - b.y) * 20;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.angle += (Math.max(-0.35, Math.min(0.35, b.vx * 0.0007)) - b.angle) * 0.25;
        b.angVel = 0;
        continue;
      }

      b.vy += gravity * dt;
      b.vx *= damp;
      b.vy *= damp;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.angle += b.angVel * dt;
      b.angVel *= 0.96;
      if (!phys.zeroG && Math.abs(b.vy) < 30) b.angle *= 0.92;

      const hw = b.w * 0.5;
      const hh = b.h * 0.5;
      const pad = 8;

      if (b.x - hw < pad) {
        b.x = pad + hw;
        if (Math.abs(b.vx) > 100) studioSound.bounce(Math.abs(b.vx) / 600);
        b.vx = Math.abs(b.vx) * 0.64;
        b.angVel += b.vy * 0.002;
      } else if (b.x + hw > W - pad) {
        b.x = W - pad - hw;
        if (Math.abs(b.vx) > 100) studioSound.bounce(Math.abs(b.vx) / 600);
        b.vx = -Math.abs(b.vx) * 0.64;
        b.angVel -= b.vy * 0.002;
      }

      if (b.y - hh < pad + 20) {
        b.y = pad + 20 + hh;
        b.vy = Math.abs(b.vy) * 0.58;
      } else if (b.y + hh > H - pad) {
        b.y = H - pad - hh;
        if (Math.abs(b.vy) > 130) studioSound.bounce(Math.abs(b.vy) / 650);
        b.vy = -Math.abs(b.vy) * 0.48;
        b.vx *= 0.89;
        b.angVel += b.vx * 0.0028;
      }
    }

    // 2 solver passes for crisp non-overlapping stacks
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < phys.bodies.length; i++) {
        for (let j = i + 1; j < phys.bodies.length; j++) {
          const a = phys.bodies[i];
          const b = phys.bodies[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const minX = (a.w + b.w) * 0.49;
          const minY = (a.h + b.h) * 0.52;
          const ox = minX - Math.abs(dx);
          const oy = minY - Math.abs(dy);
          if (ox > 0 && oy > 0) {
            let nx = 0;
            let ny = 0;
            let pen = 0;
            if (ox < oy) {
              nx = dx >= 0 ? 1 : -1;
              pen = ox;
            } else {
              ny = dy >= 0 ? 1 : -1;
              pen = oy;
            }
            const aFixed = a === phys.dragBody;
            const bFixed = b === phys.dragBody;
            if (!aFixed && !bFixed) {
              a.x -= nx * pen * 0.5;
              a.y -= ny * pen * 0.5;
              b.x += nx * pen * 0.5;
              b.y += ny * pen * 0.5;
            } else if (aFixed) {
              b.x += nx * pen;
              b.y += ny * pen;
            } else if (bFixed) {
              a.x -= nx * pen;
              a.y -= ny * pen;
            }

            if (pass === 0) {
              const rvx = b.vx - a.vx;
              const rvy = b.vy - a.vy;
              const velNorm = rvx * nx + rvy * ny;
              if (velNorm < 0) {
                const imp = -(1 + 0.48) * velNorm * 0.5;
                if (!aFixed) {
                  a.vx -= imp * nx;
                  a.vy -= imp * ny;
                  a.angVel += (nx * rvy - ny * rvx) * 0.0014;
                }
                if (!bFixed) {
                  b.vx += imp * nx;
                  b.vy += imp * ny;
                  b.angVel -= (nx * rvy - ny * rvx) * 0.0014;
                }
              }
            }
          }
        }
      }
    }

    for (let i = phys.ripples.length - 1; i >= 0; i--) {
      const rp = phys.ripples[i];
      rp.r += (rp.maxR - rp.r) * Math.min(1, dt * 11);
      rp.life -= dt * 2.4;
      if (rp.life <= 0) phys.ripples.splice(i, 1);
    }

    if (hudLeft) hudLeft.textContent = phys.dragBody ? `GRABBING · ${phys.dragBody.label}` : 'DRAG PILLS · TAP GRID FOR PULSE';
    if (hudRight) hudRight.textContent = phys.zeroG ? '0.00 G' : '9.81 m/s²';
  }

  function renderPhysics() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();

    // Shockwave ripples
    for (const rp of phys.ripples) {
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${(rp.life * 0.55).toFixed(3)})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // Visual spring tether when grabbing a pill
    if (phys.dragBody) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(phys.dragBody.x, phys.dragBody.y);
      ctx.lineTo(phys.ptrX, phys.ptrY);
      ctx.strokeStyle = accentHex;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(phys.ptrX, phys.ptrY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = accentHex;
      ctx.fill();
      ctx.restore();
    }

    ctx.font = `500 ${W < 340 ? '10.5px' : '11.5px'} "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const b of phys.bodies) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      const isDragged = b === phys.dragBody;
      const isHovered = b === phys.hoverBody && !phys.dragBody;

      if (isDragged || isHovered) {
        ctx.shadowColor = accentHex;
        ctx.shadowBlur = isDragged ? 16 : 9;
      }

      drawRoundedRect(-b.w * 0.5, -b.h * 0.5, b.w, b.h, 999);
      if (b.accent) {
        ctx.fillStyle = isDragged
          ? accentHex
          : `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${isHovered ? 0.25 : 0.16})`;
        ctx.fill();
        ctx.strokeStyle = accentHex;
        ctx.lineWidth = isDragged || isHovered ? 1.8 : 1.15;
        ctx.stroke();
        ctx.fillStyle = isDragged ? '#09090B' : accentHex;
      } else {
        ctx.fillStyle = isDragged ? accentHex : isHovered ? '#22222b' : '#16161c';
        ctx.fill();
        ctx.strokeStyle = isDragged || isHovered ? accentHex : 'rgba(255,255,255,0.16)';
        ctx.lineWidth = isDragged || isHovered ? 1.6 : 1.1;
        ctx.stroke();
        ctx.fillStyle = isDragged ? '#09090B' : '#F4F4F6';
      }

      ctx.fillText(b.label, 0, 0.5);
      ctx.restore();
    }
  }

  /* ============================================================================
   * MODE 3: 3D STUDIO ORB (Hyper-Responsive Three.js GLSL Sculpture · 3 Forms)
   * ============================================================================ */
  let orbApi = null;
  let orbLoading = false;
  let orbShape = 'core'; // 'core' | 'knot' | 'lattice'

  async function ensureOrb() {
    if (orbApi || orbLoading) return;
    orbLoading = true;
    if (hudLeft) hudLeft.textContent = 'INITIALIZING WEBGL…';

    const THREE = await import('three');

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas3d,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      if (hudLeft) hudLeft.textContent = 'WEBGL UNAVAILABLE ON THIS DEVICE';
      if (hudRight) hudRight.textContent = 'TRY PLAY OR PHYSICS';
      orbLoading = false;
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 50);
    camera.position.set(0, 0, 5.2);

    const group = new THREE.Group();
    scene.add(group);

    const coreUniforms = {
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(accentHex) },
      uPulse: { value: 0 },
      uHover: { value: 0 },
      uPtr: { value: new THREE.Vector2(0, 0) },
    };

    const shaderMat = new THREE.ShaderMaterial({
      uniforms: coreUniforms,
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        uniform float uTime;
        uniform float uPulse;
        uniform float uHover;
        void main() {
          float amp = 0.042 + uHover * 0.03 + uPulse * 0.14;
          float wave = sin(position.x * 3.4 + uTime * 2.0) * cos(position.y * 3.4 - uTime * 1.6) * amp;
          vec3 displaced = position + normal * wave;
          vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        uniform vec3 uAccent;
        uniform float uPulse;
        uniform float uHover;
        uniform vec2 uPtr;
        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vView);
          vec3 L = normalize(vec3(uPtr.x * 2.5 + 0.8, uPtr.y * 2.2 + 1.1, 2.6));
          float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.2);
          float spec = pow(max(dot(N, normalize(L + V)), 0.0), 28.0);
          vec3 base = vec3(0.052, 0.055, 0.072);
          vec3 col = base
            + uAccent * fresnel * (0.85 + uHover * 0.45 + uPulse * 0.85)
            + vec3(1.0) * spec * (0.25 + uHover * 0.35);
          gl_FragColor = vec4(col, 0.96);
        }
      `,
      transparent: true,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentHex),
      wireframe: true,
      transparent: true,
      opacity: 0.36,
    });

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf5f5f7,
      transparent: true,
      opacity: 0.22,
    });

    // Build 3 switchable sculpture groups
    const shapeGroups = {};

    // 1. CORE (Fresnel Icosahedron + Geodesic Wire + Orbital Rings)
    const gCore = new THREE.Group();
    gCore.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.14, 3), shaderMat));
    const coreWire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), wireMat);
    gCore.add(coreWire);
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.01, 8, 96), ringMat);
    ring1.rotation.x = Math.PI * 0.42;
    gCore.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.04, 0.008, 8, 96), ringMat);
    ring2.rotation.y = Math.PI * 0.34;
    ring2.rotation.x = -Math.PI * 0.24;
    gCore.add(ring2);
    group.add(gCore);
    shapeGroups.core = gCore;

    // 2. KNOT (Chromatic Torus Knot)
    const gKnot = new THREE.Group();
    gKnot.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.92, 0.28, 128, 22), shaderMat));
    gKnot.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.95, 0.295, 48, 8), wireMat));
    gKnot.visible = false;
    group.add(gKnot);
    shapeGroups.knot = gKnot;

    // 3. LATTICE (Octahedron Matrix + Starfield Nodes)
    const gLattice = new THREE.Group();
    gLattice.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.18, 1), shaderMat));
    gLattice.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 1), wireMat));
    const ptsCount = 180;
    const ptsArr = new Float32Array(ptsCount * 3);
    for (let i = 0; i < ptsCount; i++) {
      const r = 1.65 + Math.random() * 0.65;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      ptsArr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      ptsArr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      ptsArr[i * 3 + 2] = r * Math.cos(ph);
    }
    const ptsGeom = new THREE.BufferGeometry();
    ptsGeom.setAttribute('position', new THREE.BufferAttribute(ptsArr, 3));
    const ptsMat = new THREE.PointsMaterial({ color: new THREE.Color(accentHex), size: 0.045, transparent: true, opacity: 0.85 });
    gLattice.add(new THREE.Points(ptsGeom, ptsMat));
    gLattice.visible = false;
    group.add(gLattice);
    shapeGroups.lattice = gLattice;

    let orbDragging = false;
    let movedDist = 0;
    let lastX = 0;
    let lastY = 0;
    let velX = 0.003;
    let velY = 0.008;
    let pulse = 0;
    let hoverTarget = 0;
    const ptrNorm = { x: 0, y: 0 };

    function setShape(next) {
      if (!shapeGroups[next]) return;
      orbShape = next;
      Object.entries(shapeGroups).forEach(([k, g]) => { g.visible = k === next; });
      pulse = 1.0;
      velY += 0.045;
      studioSound.pluck(2);
      syncFooterControls();
    }

    function resize() {
      const rect = stageEl.getBoundingClientRect();
      const rw = Math.max(200, Math.floor(rect.width));
      const rh = Math.max(200, Math.floor(rect.height));
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh, false);
    }
    resize();

    const onDown = (e) => {
      if (mode !== 'orb') return;
      orbDragging = true;
      movedDist = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas3d.setPointerCapture?.(e.pointerId);
      pulse = 0.9;
      studioSound.pluck(3);
    };
    const onMove = (e) => {
      if (mode !== 'orb') return;
      const rect = canvas3d.getBoundingClientRect();
      ptrNorm.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      ptrNorm.y = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      hoverTarget = 1;

      if (orbDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        movedDist += Math.hypot(dx, dy);
        velY = dx * 0.011;
        velX = dy * 0.011;
        group.rotation.y += velY;
        group.rotation.x += velX;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    const onLeave = () => {
      hoverTarget = 0;
    };
    const onUp = (e) => {
      if (!orbDragging) return;
      orbDragging = false;
      canvas3d.releasePointerCapture?.(e.pointerId);
      // Clean click without drag -> big pulse burst!
      if (movedDist < 6) {
        pulse = 1.4;
        velY += 0.06;
        studioSound.pluck(5);
      }
    };

    canvas3d.addEventListener('pointerdown', onDown);
    canvas3d.addEventListener('pointermove', onMove, { passive: true });
    canvas3d.addEventListener('pointerleave', onLeave, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    orbApi = {
      resize,
      setShape,
      setAccent(hex) {
        coreUniforms.uAccent.value.set(hex);
        wireMat.color.set(hex);
        ptsMat.color.set(hex);
      },
      render(dt, elapsed) {
        coreUniforms.uTime.value = elapsed;
        pulse = Math.max(0, pulse - dt * 2.2);
        coreUniforms.uPulse.value = pulse;
        coreUniforms.uHover.value += (hoverTarget - coreUniforms.uHover.value) * 0.1;
        coreUniforms.uPtr.value.x += (ptrNorm.x - coreUniforms.uPtr.value.x) * 0.12;
        coreUniforms.uPtr.value.y += (ptrNorm.y - coreUniforms.uPtr.value.y) * 0.12;

        if (!orbDragging) {
          group.rotation.y += velY;
          group.rotation.x += velX;
          // Gentle hover magnetic tilt when hovering without dragging
          group.rotation.x += (ptrNorm.y * 0.25 * coreUniforms.uHover.value - (group.rotation.x % (Math.PI * 2))) * 0.012;
          velY += (0.007 - velY) * 0.035;
          velX += (0.002 - velX) * 0.035;
        }
        coreWire.rotation.y = -elapsed * 0.25;
        ring1.rotation.z = elapsed * 0.34;
        ring2.rotation.z = -elapsed * 0.24;

        if (hudLeft) hudLeft.textContent = `3D ${orbShape.toUpperCase()} · DRAG OR CLICK`;
        if (hudRight) {
          const deg = Math.round(((group.rotation.y * 180) / Math.PI) % 360);
          hudRight.textContent = `YAW ${String((deg + 360) % 360).padStart(3, '0')}° · GLSL`;
        }
        renderer.render(scene, camera);
      },
      dispose() {
        canvas3d.removeEventListener('pointerdown', onDown);
        canvas3d.removeEventListener('pointermove', onMove);
        canvas3d.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('pointerup', onUp);
        renderer.dispose();
      },
    };
    orbLoading = false;
    syncFooterControls();
  }

  /* ============================================================================
   * OVERLAYS, FOOTER CONTROLS & POINTER/TOUCH INPUT
   * ============================================================================ */
  function syncOverlay() {
    if (!overlayEl) return;
    if (mode === 'game' && game.state === 'attract') {
      overlayEl.innerHTML = `
        <button type="button" class="console-play-cta" id="btn-start-packet-run">
          <span class="play-dot"></span>
          <span>PLAY PACKET RUN</span>
        </button>
        <div class="console-micro-hint">Catch stack · Dodge red bugs · Drag or ← →</div>
      `;
      overlayEl.classList.add('visible');
      overlayEl.querySelector('#btn-start-packet-run')?.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSound.tick();
        resetGame(true);
      });
    } else if (mode === 'game' && game.state === 'over') {
      overlayEl.innerHTML = `
        <div class="console-gameover">
          <div class="go-tag">RUN COMPLETE</div>
          <div class="go-score">${game.score}<span>PTS</span></div>
          <div class="go-best">BEST · ${bestScore} PTS</div>
          <button type="button" class="console-play-cta" id="btn-retry-packet-run">
            <span>PLAY AGAIN ↻</span>
          </button>
        </div>
      `;
      overlayEl.classList.add('visible');
      overlayEl.querySelector('#btn-retry-packet-run')?.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSound.tick();
        resetGame(true);
      });
    } else {
      overlayEl.innerHTML = '';
      overlayEl.classList.remove('visible');
    }
  }

  function syncFooterControls() {
    if (!footerControls) return;
    if (mode === 'game') {
      footerControls.innerHTML = `
        <span class="console-key-hint">SLIDE / MOUSE OR <b>A / D</b></span>
        <button type="button" class="console-mini-btn" id="btn-console-reset">RESET</button>
      `;
      footerControls.querySelector('#btn-console-reset')?.addEventListener('click', () => {
        studioSound.tick();
        resetGame(true);
      });
    } else if (mode === 'physics') {
      footerControls.innerHTML = `
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button type="button" class="console-mini-btn" id="btn-phys-shake">SHAKE</button>
          <button type="button" class="console-mini-btn ${phys.zeroG ? 'active' : ''}" id="btn-phys-zerog">
            ${phys.zeroG ? 'ZERO-G ON' : 'ZERO-G'}
          </button>
        </div>
        <button type="button" class="console-mini-btn" id="btn-phys-drop">RE-DROP</button>
      `;
      footerControls.querySelector('#btn-phys-shake')?.addEventListener('click', shakePhysics);
      footerControls.querySelector('#btn-phys-drop')?.addEventListener('click', () => {
        studioSound.tick();
        initPhysics();
      });
      footerControls.querySelector('#btn-phys-zerog')?.addEventListener('click', () => {
        phys.zeroG = !phys.zeroG;
        studioSound.tick();
        if (phys.zeroG) {
          phys.bodies.forEach((b) => {
            b.vy -= 95 + Math.random() * 80;
            b.vx += (Math.random() - 0.5) * 90;
          });
        }
        onUnlock?.('physics');
        syncFooterControls();
      });
    } else {
      footerControls.innerHTML = `
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button type="button" class="console-mini-btn ${orbShape === 'core' ? 'active' : ''}" data-orb-shape="core">CORE</button>
          <button type="button" class="console-mini-btn ${orbShape === 'knot' ? 'active' : ''}" data-orb-shape="knot">KNOT</button>
          <button type="button" class="console-mini-btn ${orbShape === 'lattice' ? 'active' : ''}" data-orb-shape="lattice">LATTICE</button>
        </div>
        <span class="console-key-hint">DRAG 360°</span>
      `;
      footerControls.querySelectorAll('[data-orb-shape]').forEach((b) => {
        b.addEventListener('click', () => orbApi?.setShape(b.getAttribute('data-orb-shape')));
      });
    }
  }

  function setMode(nextMode) {
    if (!['game', 'physics', 'orb'].includes(nextMode)) return;
    mode = nextMode;
    studioSound.tick();
    modeBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-console-mode') === mode));

    canvas2d.style.display = mode === 'orb' ? 'none' : 'block';
    canvas3d.style.display = mode === 'orb' ? 'block' : 'none';
    canvas2d.style.cursor = mode === 'physics' ? 'pointer' : 'crosshair';

    if (mode === 'physics' && !phys.initialized) {
      initPhysics();
    } else if (mode === 'orb') {
      ensureOrb();
    }
    syncOverlay();
    syncFooterControls();
  }

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.getAttribute('data-console-mode')));
  });

  function getLocalPos(e) {
    const r = canvas2d.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onCanvasPointerDown(e) {
    const pos = getLocalPos(e);
    if (mode === 'game') {
      if (game.state === 'attract') resetGame(true);
      game.paddleTargetX = pos.x;
      canvas2d.setPointerCapture?.(e.pointerId);
    } else if (mode === 'physics') {
      if (!phys.initialized) initPhysics();
      const hit = findPhysicsBody(pos.x, pos.y);
      if (hit) {
        phys.dragBody = hit;
        phys.ptrX = pos.x;
        phys.ptrY = pos.y;
        phys.dragOffX = (pos.x - hit.x) * 0.4;
        phys.dragOffY = (pos.y - hit.y) * 0.4;
        phys.samples = [{ x: pos.x, y: pos.y, t: performance.now() }];
        canvas2d.style.cursor = 'grabbing';
        canvas2d.setPointerCapture?.(e.pointerId);
        studioSound.tick();
        onUnlock?.('physics');
      } else {
        // Clicking empty grid pops nearby pills with a crisp shockwave!
        emitShockwave(pos.x, pos.y);
      }
    }
  }

  function onCanvasPointerMove(e) {
    const pos = getLocalPos(e);
    if (mode === 'game') {
      if (game.state === 'playing') {
        game.paddleTargetX = pos.x;
      }
    } else if (mode === 'physics') {
      phys.ptrX = pos.x;
      phys.ptrY = pos.y;
      if (phys.dragBody) {
        const now = performance.now();
        phys.samples.push({ x: pos.x, y: pos.y, t: now });
        while (phys.samples.length > 6 && now - phys.samples[0].t > 75) {
          phys.samples.shift();
        }
      } else {
        phys.hoverBody = findPhysicsBody(pos.x, pos.y);
        canvas2d.style.cursor = phys.hoverBody ? 'grab' : 'pointer';
      }
    }
  }

  function onCanvasPointerUp(e) {
    if (mode === 'physics' && phys.dragBody) {
      const now = performance.now();
      const first = phys.samples[0];
      if (first) {
        const dtMs = Math.max(16, now - first.t);
        const vx = ((phys.ptrX - first.x) / dtMs) * 1000;
        const vy = ((phys.ptrY - first.y) / dtMs) * 1000;
        phys.dragBody.vx = Math.max(-820, Math.min(820, vx * 0.85));
        phys.dragBody.vy = Math.max(-820, Math.min(820, vy * 0.85));
        phys.dragBody.angVel = phys.dragBody.vx * 0.008;
      }
      phys.dragBody = null;
      phys.samples = [];
      canvas2d.style.cursor = 'pointer';
      canvas2d.releasePointerCapture?.(e.pointerId);
    } else if (mode === 'game') {
      canvas2d.releasePointerCapture?.(e.pointerId);
    }
  }

  function onCanvasPointerLeave() {
    if (mode === 'physics' && !phys.dragBody) {
      phys.hoverBody = null;
      canvas2d.style.cursor = 'pointer';
    }
  }

  canvas2d.addEventListener('pointerdown', onCanvasPointerDown);
  canvas2d.addEventListener('pointermove', onCanvasPointerMove);
  canvas2d.addEventListener('pointerleave', onCanvasPointerLeave);
  window.addEventListener('pointerup', onCanvasPointerUp);

  function onKeyDown(e) {
    if (mode !== 'game' || game.state !== 'playing') return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') game.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') game.keys.right = true;
  }
  function onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') game.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') game.keys.right = false;
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  let rafId = 0;
  let lastTs = performance.now();
  let totalElapsed = 0;

  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(0.045, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;
    totalElapsed += dt;

    if (document.hidden) return;

    if (mode === 'game') {
      updateGame(dt);
      renderGame();
    } else if (mode === 'physics') {
      updatePhysics(dt);
      renderPhysics();
    } else if (mode === 'orb' && orbApi) {
      orbApi.render(dt, totalElapsed);
    }
  }

  syncOverlay();
  syncFooterControls();
  rafId = requestAnimationFrame(loop);

  return {
    setMode,
    setAccent(theme) {
      accentHex = theme.hex;
      accentRgb = theme.rgb;
      if (orbApi) orbApi.setAccent(theme.hex);
    },
    dispose() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas2d.removeEventListener('pointerdown', onCanvasPointerDown);
      canvas2d.removeEventListener('pointermove', onCanvasPointerMove);
      canvas2d.removeEventListener('pointerleave', onCanvasPointerLeave);
      window.removeEventListener('pointerup', onCanvasPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      orbApi?.dispose();
    },
  };
}
