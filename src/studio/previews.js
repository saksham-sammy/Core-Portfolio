/**
 * Purpose-Built Interactive Visual Headers for Each Flagship Build
 * Every flagship card renders a crisp, domain-authentic, mobile-safe micro-visual
 * that immediately communicates what the software actually does.
 */

export function renderFlagshipVisual(id) {
  switch (id) {
    case 'phishguard':
      return `
        <div class="work-visual work-vis-phish" aria-hidden="true">
          <div class="vis-grid"></div>
          <div class="vis-browser-bar">
            <span class="vis-lights"><i></i><i></i><i></i></span>
            <span class="vis-url-pill">
              <span class="vis-danger-dot"></span>
              http://paypa1-secure-login.xyz/auth
            </span>
            <span class="vis-block-tag">BLOCKED</span>
          </div>
          <div class="vis-phish-telemetry">
            <div>
              <span class="vis-k">HOOK</span>
              <span class="vis-v">onBeforeNavigate</span>
            </div>
            <div>
              <span class="vis-k">ROC-AUC</span>
              <span class="vis-v accent">0.9833</span>
            </div>
            <div>
              <span class="vis-k">ENGINE</span>
              <span class="vis-v">48 · Fetch-Free</span>
            </div>
          </div>
        </div>
      `;

    case 'pm-copilot':
      return `
        <div class="work-visual work-vis-rag" aria-hidden="true">
          <div class="vis-grid"></div>
          <div class="vis-rag-flow">
            <div class="vis-node vis-node-src">
              <span class="vis-dot"></span>
              <span>PRD_v2.pdf</span>
            </div>
            <div class="vis-wire"><span></span></div>
            <div class="vis-node vis-node-core">
              <span class="vis-pill">CHROMA · 384d</span>
              <span class="vis-sub">Semantic Top-K</span>
            </div>
            <div class="vis-wire"><span></span></div>
            <div class="vis-node vis-node-out">
              <span class="vis-dot accent"></span>
              <span>Spec ↗</span>
            </div>
          </div>
          <div class="vis-badge-row">
            <span>RAG PIPELINE</span>
            <span>MULTI-LLM</span>
            <span>FASTAPI</span>
          </div>
        </div>
      `;

    case 'lectura':
      return `
        <div class="work-visual work-vis-ocr" aria-hidden="true">
          <div class="vis-grid"></div>
          <div class="vis-doc-frame">
            <div class="vis-scan-beam"></div>
            <div class="vis-doc-line w85"></div>
            <div class="vis-doc-line w65"></div>
            <div class="vis-doc-line w92"></div>
            <div class="vis-doc-line w50"></div>
          </div>
          <div class="vis-wave">
            <i style="--h:36%"></i><i style="--h:82%"></i><i style="--h:55%"></i>
            <i style="--h:94%"></i><i style="--h:68%"></i><i style="--h:42%"></i>
            <i style="--h:76%"></i><i style="--h:48%"></i>
          </div>
        </div>
      `;

    case 'algovision':
      return `
        <div class="work-visual work-vis-algo" aria-hidden="true">
          <div class="vis-grid"></div>
          <div class="vis-bars" data-algo-bars>
            <span style="--h:34%"></span>
            <span style="--h:74%"></span>
            <span style="--h:48%"></span>
            <span style="--h:92%" class="hi"></span>
            <span style="--h:62%"></span>
            <span style="--h:28%"></span>
            <span style="--h:84%" class="hi"></span>
            <span style="--h:54%"></span>
            <span style="--h:68%"></span>
            <span style="--h:40%"></span>
          </div>
          <div class="vis-badge-row">
            <span>QUICKSORT</span>
            <span>STEP-BY-STEP</span>
            <span>O(n log n)</span>
          </div>
        </div>
      `;

    case 'svj-3d':
      return `
        <div class="work-visual work-vis-svj" aria-hidden="true">
          <div class="vis-grid"></div>
          <svg class="vis-gem-svg" viewBox="0 0 180 110" fill="none">
            <polygon points="54,18 126,18 156,48 90,98 24,48" stroke="currentColor" stroke-width="1.35" stroke-opacity="0.78" />
            <polyline points="24,48 156,48" stroke="currentColor" stroke-width="1" stroke-opacity="0.45" />
            <polyline points="54,18 68,48 90,98 112,48 126,18" stroke="currentColor" stroke-width="1" stroke-opacity="0.54" />
            <polyline points="68,48 90,18 112,48" stroke="currentColor" stroke-width="1" stroke-opacity="0.38" />
          </svg>
          <div class="vis-badge-row">
            <span>PBR WEBGL</span>
            <span>SVJ · EXOTICA</span>
            <span>CLIENT LIVE</span>
          </div>
        </div>
      `;

    case 'tensorvision':
      return `
        <div class="work-visual work-vis-tensor" aria-hidden="true">
          <div class="vis-grid"></div>
          <div class="vis-bench-rows">
            <div class="vis-bench-row">
              <span class="vis-bench-lbl">PYTHON LOOP</span>
              <div class="vis-bench-track"><i style="width:94%"></i></div>
              <span class="vis-bench-val">1.42s</span>
            </div>
            <div class="vis-bench-row">
              <span class="vis-bench-lbl">NUMPY SIMD</span>
              <div class="vis-bench-track"><i class="mid" style="width:24%"></i></div>
              <span class="vis-bench-val">38ms</span>
            </div>
            <div class="vis-bench-row">
              <span class="vis-bench-lbl">PYTORCH GPU</span>
              <div class="vis-bench-track"><i class="fast" style="width:9%"></i></div>
              <span class="vis-bench-val accent">11ms</span>
            </div>
          </div>
          <div class="vis-badge-row">
            <span>10M ELEMENTS</span>
            <span>AMD ROCM</span>
            <span>129× SPEEDUP</span>
          </div>
        </div>
      `;

    default:
      return `<div class="work-visual"><div class="vis-grid"></div></div>`;
  }
}

/**
 * Gently animates the AlgoVision preview bars when hovered so the card feels alive.
 */
export function attachFlagshipPreviewMotion(rootEl) {
  const barWrap = rootEl?.querySelector('[data-algo-bars]');
  if (!barWrap) return () => {};
  const bars = Array.from(barWrap.children);
  const heights = [34, 74, 48, 92, 62, 28, 84, 54, 68, 40];
  let i = 0;
  let timer = 0;

  const card = barWrap.closest('.work-card');
  if (!card) return () => {};

  const step = () => {
    const a = i % (heights.length - 1);
    const b = a + 1;
    if (heights[a] > heights[b]) {
      const tmp = heights[a];
      heights[a] = heights[b];
      heights[b] = tmp;
    } else if (a === heights.length - 2) {
      heights.sort(() => Math.random() - 0.5);
    }
    bars.forEach((bar, idx) => {
      bar.style.setProperty('--h', `${heights[idx]}%`);
      bar.classList.toggle('hi', idx === a || idx === b);
    });
    i++;
  };

  const onEnter = () => {
    clearInterval(timer);
    step();
    timer = setInterval(step, 320);
  };
  const onLeave = () => {
    clearInterval(timer);
  };

  card.addEventListener('mouseenter', onEnter);
  card.addEventListener('mouseleave', onLeave);

  return () => {
    clearInterval(timer);
    card.removeEventListener('mouseenter', onEnter);
    card.removeEventListener('mouseleave', onLeave);
  };
}
