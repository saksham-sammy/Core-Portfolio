/**
 * Whisper-Quiet Architectural Dot-Matrix Backdrop
 * Inspired by Linear, Nothing OS, and Awwwards Developer Award portfolios.
 * Never obscures or competes with text — softly bends & illuminates right around the pointer.
 */
export function createDotBackdrop(canvas) {
  if (!canvas) return { setAccent() {}, dispose() {} };

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let accentRgb = [200, 255, 61]; // Acid Volt default

  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
  const spacing = window.innerWidth < 768 ? 40 : 34;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  function onPointerMove(e) {
    pointer.tx = e.clientX;
    pointer.ty = e.clientY;
    pointer.active = true;
  }
  function onPointerLeave() {
    pointer.active = false;
    pointer.tx = -9999;
    pointer.ty = -9999;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });

  let rafId = 0;
  const radius = 165;
  const radiusSq = radius * radius;

  function render() {
    rafId = requestAnimationFrame(render);

    if (pointer.active) {
      if (pointer.x < -5000) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      } else {
        pointer.x += (pointer.tx - pointer.x) * 0.16;
        pointer.y += (pointer.ty - pointer.y) * 0.16;
      }
    } else {
      pointer.x = -9999;
      pointer.y = -9999;
    }

    ctx.clearRect(0, 0, width, height);

    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;
    const ox = ((width % spacing) * 0.5) | 0;
    const oy = ((height % spacing) * 0.5) | 0;

    // 1. Quiet static base lattice (ultra-low opacity so text stays 100% crisp)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
    for (let r = 0; r < rows; r++) {
      const y = oy + r * spacing;
      for (let c = 0; c < cols; c++) {
        const x = ox + c * spacing;
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        if (dx * dx + dy * dy < radiusSq) continue;
        ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
      }
    }

    // 2. Reactive pointer field (subtle accent glow + micro magnetic deflection)
    if (pointer.active && pointer.x > -1000) {
      const minC = Math.max(0, Math.floor((pointer.x - radius - ox) / spacing));
      const maxC = Math.min(cols - 1, Math.ceil((pointer.x + radius - ox) / spacing));
      const minR = Math.max(0, Math.floor((pointer.y - radius - oy) / spacing));
      const maxR = Math.min(rows - 1, Math.ceil((pointer.y + radius - oy) / spacing));

      for (let r = minR; r <= maxR; r++) {
        const baseY = oy + r * spacing;
        for (let c = minC; c <= maxC; c++) {
          const baseX = ox + c * spacing;
          const dx = baseX - pointer.x;
          const dy = baseY - pointer.y;
          const distSq = dx * dx + dy * dy;
          if (distSq >= radiusSq) continue;

          const dist = Math.sqrt(distSq) || 0.001;
          const t = 1 - dist / radius;
          const push = t * t * 9;
          const x = baseX + (dx / dist) * push;
          const y = baseY + (dy / dist) * push;
          const size = 1.5 + t * 2.1;
          const alpha = 0.08 + t * 0.42;

          ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  render();

  return {
    setAccent(rgb) {
      if (Array.isArray(rgb) && rgb.length === 3) accentRgb = rgb;
    },
    dispose() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    },
  };
}
