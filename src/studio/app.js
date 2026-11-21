/**
 * Saksham Sharma — Flagship Personal Portfolio & Engineering Studio
 * Advanced successor to saksham-personalportfolio.vercel.app built in the Obsidian + Volt/Violet/Coral
 * Awwwards Gen-Z design system:
 *  - Premium split-shutter architectural preloader
 *  - Balanced Hero + CORE-01 Playable Console (Packet Run · Physics Stack · 3D Orb)
 *  - 20 Real-World & Web Projects with real screenshots, filter tabs & multi-shot Case Study Drawer
 *  - Honest Filterable Skills Arsenal (All / Proficient+ / Learning / Categories)
 *  - Experience + Visual Certificate Thumbnail Gallery (Zoom Lightbox + Expandable Specializations)
 *  - About with Zoomable Portrait (/profile.jpg & /about.jpg), clean professional traits & Pocket Synth
 *  - Yurei Studio (Sam Web Solutions) Services highlighting Steam Idler Pro, Exotica PCMC & SVJ 3D
 *  - Essays + Working Web3Forms Contact Form + Sent Messages Inbox + Playable /lab
 */
import './tokens.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile, blogs, timeline } from '../data/content.js';
import {
  PROFESSIONAL_TRAITS,
  ALL_PROJECTS,
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  CERTIFICATES,
  STUDIO_SERVICES,
} from './portfolioData.js';
import { createDotBackdrop } from './backdrop.js';
import { mountHeroConsole } from './console.js';
import { studioSound } from './sound.js';
import { attachScrambleObservers } from './scramble.js';

gsap.registerPlugin(ScrollTrigger);

const THEMES = {
  volt: { id: 'volt', name: 'Acid Volt', hex: '#C8FF3D', rgb: [200, 255, 61], ink: '#09090B' },
  violet: { id: 'violet', name: 'Electric Violet', hex: '#B388FF', rgb: [179, 136, 255], ink: '#09090B' },
  coral: { id: 'coral', name: 'Signal Coral', hex: '#FF6B4A', rgb: [255, 107, 74], ink: '#09090B' },
};

const PASSPORT_BADGES = [
  { id: 'arcade', label: 'Arcade Ace', hint: 'Catch 4 packets in Packet Run' },
  { id: 'physics', label: 'Physics Nerd', hint: 'Fling pills or trigger pulse in Physics Stack' },
  { id: 'synth', label: 'Beat Maker', hint: 'Tap the Pocket Synth pads' },
  { id: 'reader', label: 'Deep Diver', hint: 'Inspect a project case study or essay' },
  { id: 'cmd', label: 'Command Pro', hint: 'Open the ⌘K Command Palette' },
];

const MARQUEE_ITEMS = [
  'C++ & DSA',
  'Python & FastAPI',
  'Next.js & React 19',
  'PySide6 Desktop Apps',
  'Yurei Studio · Steam Idler Pro',
  'DualSense Audio DSP',
  'RAG & Machine Learning',
  'Three.js & WebGL',
  'Red Hat Linux & AMD ROCm',
  'Smart India Hackathon ’26',
];

const MSG_STORAGE_KEY = 'sws_messages';
const WEB3FORMS_KEY = 'b48045f4-8043-4282-8b09-c3e8ef06e3af';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadMessages() {
  try {
    const raw = JSON.parse(localStorage.getItem(MSG_STORAGE_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function mountStudioPortfolio({ onOpenLab }) {
  document.title = 'Saksham Sharma — Software Engineer · Yurei Studio';
  const root = document.getElementById('app');
  if (!root) return { dispose() {} };

  let activeTheme = THEMES.volt;
  try {
    const savedTheme = localStorage.getItem('ss_studio_theme');
    if (savedTheme && THEMES[savedTheme]) activeTheme = THEMES[savedTheme];
  } catch {}

  const unlockedBadges = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem('ss_explorer_badges') || '[]');
    if (Array.isArray(saved)) saved.forEach((b) => unlockedBadges.add(b));
  } catch {}

  const experienceRows = timeline.filter((t) => t.type !== 'education');
  const flatCertCount = CERTIFICATES.filter((c) => !c.isSpecialization).length;
  const specCount = CERTIFICATES.filter((c) => c.isSpecialization).length;
  const totalSkillsCount = SKILL_CATEGORIES.reduce((a, c) => a + c.skills.length, 0);

  root.innerHTML = `
    <canvas id="studio-dot-canvas" aria-hidden="true"></canvas>
    <div class="studio-ambient-glow" aria-hidden="true"></div>

    <!-- Premium Architectural Split-Shutter Preloader -->
    <div class="preloader" id="preloader" aria-hidden="true">
      <div class="preloader-shutter top"></div>
      <div class="preloader-shutter bottom"></div>
      <div class="preloader-center">
        <div class="preloader-emblem">
          <svg viewBox="0 0 68 68"><rect x="4" y="4" width="60" height="60" rx="14" /></svg>
          <span class="preloader-monogram">SS</span>
        </div>
        <div class="preloader-name"><span>Saksham Sharma</span></div>
        <div class="preloader-progress-row">
          <div class="preloader-bar"><div class="preloader-fill" id="preloader-fill"></div></div>
          <span class="preloader-count" id="preloader-count">00%</span>
        </div>
        <div class="preloader-meta">Software Engineering · Yurei Studio</div>
      </div>
    </div>

    <!-- Top Navigation Bar -->
    <header class="topbar">
      <a href="#hero" class="brand-mark" data-nav="#hero">
        <span class="brand-box">SS</span>
        <span class="brand-text">Saksham Sharma</span>
      </a>

      <nav class="topbar-nav" aria-label="Primary">
        <a href="#work" class="nav-link" data-nav="#work">Projects</a>
        <a href="#skills" class="nav-link" data-nav="#skills">Skills</a>
        <a href="#certificates" class="nav-link" data-nav="#certificates">Certificates</a>
        <a href="#about" class="nav-link" data-nav="#about">About</a>
        <a href="#services" class="nav-link" data-nav="#services">Studio</a>
        <a href="#contact" class="nav-link" data-nav="#contact">Contact</a>
      </nav>

      <div class="topbar-controls">
        <div class="theme-swatches" role="group" aria-label="Accent Theme">
          ${Object.values(THEMES)
            .map(
              (th) => `
            <button type="button" class="swatch-btn ${th.id === activeTheme.id ? 'active' : ''}"
              data-theme="${th.id}" style="background:${th.hex}" title="${esc(th.name)} Theme"
              aria-label="${esc(th.name)} Theme"></button>
          `
            )
            .join('')}
        </div>
        <button type="button" class="ctrl-btn ctrl-btn-lab" id="btn-top-lab" title="Playable Project Lab (/lab)">
          Lab ↗
        </button>
        <button type="button" class="ctrl-btn hide-xs" id="btn-audio" data-active="${studioSound.isEnabled()}" title="Toggle Web Audio SFX">
          <span id="audio-label">${studioSound.isEnabled() ? 'SFX On' : 'SFX Off'}</span>
        </button>
        <button type="button" class="ctrl-btn hide-xs" id="btn-cmd" title="Command Palette (Ctrl+K / ⌘K)">
          ⌘K
        </button>
        <button type="button" class="ctrl-btn mobile-menu-btn" id="btn-mob-menu" aria-label="Toggle navigation menu" aria-expanded="false">
          Menu
        </button>
      </div>
    </header>

    <!-- Mobile Navigation Sheet -->
    <div class="mobile-drawer" id="mobile-drawer" aria-hidden="true">
      <a href="#work" data-mob-nav="#work"><span>01 · Projects (${ALL_PROJECTS.length})</span><span>→</span></a>
      <a href="#skills" data-mob-nav="#skills"><span>02 · Skills Arsenal</span><span>→</span></a>
      <a href="#certificates" data-mob-nav="#certificates"><span>03 · Experience &amp; Certificates (${flatCertCount})</span><span>→</span></a>
      <a href="#about" data-mob-nav="#about"><span>04 · About &amp; Pocket Synth</span><span>→</span></a>
      <a href="#services" data-mob-nav="#services"><span>05 · Yurei Studio &amp; Services</span><span>→</span></a>
      <a href="#essays" data-mob-nav="#essays"><span>06 · Engineering Essays (${blogs.length})</span><span>→</span></a>
      <a href="#contact" data-mob-nav="#contact"><span>07 · Contact &amp; Form</span><span>→</span></a>
      <div class="mobile-drawer-row">
        <div style="display:inline-flex;gap:8px;align-items:center;">
          ${Object.values(THEMES)
            .map(
              (th) => `
            <button type="button" class="swatch-btn ${th.id === activeTheme.id ? 'active' : ''}"
              data-theme="${th.id}" style="background:${th.hex};width:18px;height:18px;" aria-label="${esc(th.name)} Theme"></button>
          `
            )
            .join('')}
        </div>
        <div style="display:flex;gap:8px;">
          <button type="button" class="ctrl-btn" id="btn-mob-audio">${studioSound.isEnabled() ? 'SFX On' : 'SFX Off'}</button>
          <a href="${esc(profile.resume)}" download class="ctrl-btn ctrl-btn-lab" style="padding:0 11px;">Resume PDF</a>
        </div>
      </div>
    </div>

    <main class="studio-main">
      <!-- ==================== 01. HERO + CORE-01 PLAYABLE CONSOLE ==================== -->
      <section class="section-shell hero-section" id="hero" data-section="hero">
        <div class="hero-grid">
          <div class="hero-left">
            <div class="status-pill">
              <span class="status-dot"></span>
              <span>Open to SWE / Full-Stack / AI Internships · Pune, IN</span>
            </div>

            <h1 class="hero-title">
              Saksham<br/><em>Sharma</em>
            </h1>

            <div class="hero-role-line">
              Software Engineer · B.Tech CSE @ PCU Pune (${esc(profile.batch)})
            </div>

            <p class="hero-bio">
              I'm a 3rd-year CS builder shipping real software end-to-end —
              <strong>full-stack AI &amp; web apps</strong>, <strong>Windows desktop utilities</strong>
              (Yurei Studio), <strong>real-time audio DSP &amp; 3D interfaces</strong>, and
              <strong>applied ML systems</strong>.
            </p>

            <div class="hero-actions">
              <a href="${esc(profile.resume)}" download class="btn-primary">
                <span>Download Resume</span>
                <span>↓</span>
              </a>
              <a href="#work" class="btn-ghost" data-nav="#work">
                <span>Explore Projects</span>
              </a>
              <button type="button" class="btn-ghost" id="btn-hero-lab">
                <span>Playable Lab ↗</span>
              </button>
            </div>

            <div class="hero-stats">
              <div>
                <div class="stat-k">30+</div>
                <div class="stat-l">Shipped Builds</div>
              </div>
              <div>
                <div class="stat-k">${flatCertCount}+</div>
                <div class="stat-l">Verified Certs</div>
              </div>
              <div>
                <div class="stat-k">SIH ’26</div>
                <div class="stat-l">National Selection</div>
              </div>
              <div>
                <div class="stat-k">2+</div>
                <div class="stat-l">Paid Client Launches</div>
              </div>
            </div>
          </div>

          <div class="console-shell" id="hero-console">
            <div class="console-bezel-top">
              <div class="console-id">
                <span class="console-led"></span>
                <span>CORE-01 // PLAYABLE</span>
              </div>
              <div class="console-tabs" role="tablist" aria-label="Interactive Console Modes">
                <button type="button" class="console-tab active" data-console-mode="game">Play</button>
                <button type="button" class="console-tab" data-console-mode="physics">Physics</button>
                <button type="button" class="console-tab" data-console-mode="orb">3D Orb</button>
              </div>
            </div>

            <div class="console-screen" id="console-stage">
              <div class="console-screen-hud">
                <span id="console-hud-left">PACKET RUN · READY</span>
                <span id="console-hud-right">AUTOPILOT</span>
              </div>
              <canvas id="console-canvas-2d"></canvas>
              <canvas id="console-canvas-3d"></canvas>
              <div class="console-overlay" id="console-overlay"></div>
            </div>

            <div class="console-bezel-bottom" id="console-footer-controls"></div>
          </div>
        </div>
      </section>

      <!-- ==================== KINETIC MARQUEE ==================== -->
      <div class="marquee-strip" aria-hidden="true">
        <div class="marquee-track">
          ${[...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
            .map((item) => `<span class="marquee-item">${esc(item)}</span>`)
            .join('')}
        </div>
      </div>

      <!-- ==================== 02. REAL-WORLD & WEB PROJECTS (WITH SCREENSHOTS & FILTERS) ==================== -->
      <section class="section-shell" id="work" data-section="work">
        <div class="section-head">
          <div>
            <span class="eyebrow">01 / Shipped Work</span>
            <h2 class="section-heading" data-scramble="Real-World Projects">Real-World <em>Projects</em></h2>
          </div>
          <p class="section-sub">
            Balancing full-stack web &amp; AI tools, native Windows desktop releases, hardware audio DSP,
            and live client launches. Click any project for its screenshot gallery &amp; architecture notes.
          </p>
        </div>

        <div class="filter-toolbar">
          <div class="filter-pills" id="proj-filters">
            <button type="button" class="filter-pill active" data-pfilter="featured">Featured (${ALL_PROJECTS.filter((p) => p.featured).length})</button>
            <button type="button" class="filter-pill" data-pfilter="all">All (${ALL_PROJECTS.length})</button>
            <button type="button" class="filter-pill" data-pfilter="desktop">Desktop &amp; Systems</button>
            <button type="button" class="filter-pill" data-pfilter="web">Web &amp; UI</button>
            <button type="button" class="filter-pill" data-pfilter="ai">AI &amp; ML</button>
            <button type="button" class="filter-pill" data-pfilter="client">Client Live</button>
          </div>
          <input type="text" class="index-search" id="proj-search" placeholder="Search projects or stack…" aria-label="Search projects" />
        </div>

        <div class="projects-grid" id="projects-grid"></div>
      </section>

      <!-- ==================== 03. INTERACTIVE SKILLS ARSENAL ==================== -->
      <section class="section-shell" id="skills" data-section="skills">
        <div class="section-head">
          <div>
            <span class="eyebrow">02 / Technical Arsenal</span>
            <h2 class="section-heading" data-scramble="Honest Skills Matrix">Honest Skills <em>Matrix</em></h2>
          </div>
          <p class="section-sub">
            An honest snapshot of what I write confidently today, what I ship in production, and what I'm actively deepening.
          </p>
        </div>

        <div class="filter-toolbar">
          <div class="filter-pills" id="skill-filters">
            <button type="button" class="filter-pill active" data-sfilter="all">All Skills (${totalSkillsCount})</button>
            <button type="button" class="filter-pill" data-sfilter="proficient">Strong &amp; Proficient</button>
            <button type="button" class="filter-pill" data-sfilter="learning">Currently Learning</button>
            <span class="filter-sep" aria-hidden="true"></span>
            ${SKILL_CATEGORIES.map(
              (c) => `<button type="button" class="filter-pill" data-sfilter="${esc(c.id)}">${esc(c.short)}</button>`
            ).join('')}
          </div>
        </div>

        <div class="skills-legend">
          <span class="lvl-badge lvl-strong">Strong</span>
          <span class="lvl-badge lvl-proficient">Proficient</span>
          <span class="lvl-badge lvl-familiar">Familiar</span>
          <span class="lvl-badge lvl-learning">Learning</span>
          <span>— ${totalSkillsCount} skills across ${SKILL_CATEGORIES.length} tracks</span>
        </div>

        <div class="skills-grid" id="skills-grid"></div>
      </section>

      <!-- ==================== 04. EXPERIENCE + VISUAL CERTIFICATE THUMBNAIL GALLERY ==================== -->
      <section class="section-shell" id="certificates" data-section="certificates">
        <div class="section-head">
          <div>
            <span class="eyebrow">03 / Credentials &amp; Track Record</span>
            <h2 class="section-heading" data-scramble="Experience & Certificates">Experience &amp; <em>Certificates</em></h2>
          </div>
          <p class="section-sub">
            Industry milestones plus ${flatCertCount} verified certificate thumbnails — click any certificate thumbnail to zoom in full-screen or open the original PDF.
          </p>
        </div>

        <div class="resume-strip">
          <div class="spotlight-card resume-panel">
            <div class="resume-panel-head">
              <h3 class="resume-panel-title">Experience &amp; Milestones</h3>
              <a href="${esc(profile.resume)}" download class="work-quick-link">Resume PDF ↗</a>
            </div>
            <div class="exp-list">
              ${experienceRows
                .map(
                  (item) => `
                <div class="exp-item">
                  <div class="exp-top">
                    <span class="exp-role">${esc(item.title)}</span>
                    <span class="exp-year">${esc(item.year)}</span>
                  </div>
                  <div class="exp-org">${esc(item.subtitle)}</div>
                  <p class="exp-desc">${esc(item.desc)}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="spotlight-card resume-panel" style="display:flex;flex-direction:column;gap:14px;">
            <div class="resume-panel-head" style="margin-bottom:0;">
              <h3 class="resume-panel-title">Education</h3>
              <span class="exp-year">${esc(profile.batch)}</span>
            </div>
            <div class="edu-box">
              <div class="exp-role">B.Tech Computer Science &amp; Engineering</div>
              <div class="exp-org" style="color:var(--ink-dim);margin-top:4px;">${esc(profile.school)}</div>
              <p class="exp-desc">
                Core focus: Data Structures &amp; Algorithms (C++), Operating Systems, DBMS, Computer Networks,
                Cybersecurity, Full-Stack Web &amp; GPU Compute.
              </p>
            </div>
            <div class="exp-item" style="border-bottom:1px solid var(--line);padding-bottom:12px;">
              <div class="exp-top"><span class="exp-role" style="font-size:14.5px;">Higher Secondary (PCM + CS)</span><span class="exp-year">2022–2024</span></div>
              <div class="exp-org">SB Patil Public School, Pune · 71%</div>
            </div>
            <div class="exp-item">
              <div class="exp-top"><span class="exp-role" style="font-size:14.5px;">Secondary (10th SSC)</span><span class="exp-year">2022</span></div>
              <div class="exp-org">Stepping Stone School, Pune · 83%</div>
            </div>
          </div>
        </div>

        <div class="filter-toolbar">
          <div class="filter-pills" id="cert-filters">
            <button type="button" class="filter-pill active" data-cfilter="all">All (${flatCertCount})</button>
            <button type="button" class="filter-pill" data-cfilter="specialization">Specializations (${specCount})</button>
            <button type="button" class="filter-pill" data-cfilter="hackathon">Hackathons</button>
            <button type="button" class="filter-pill" data-cfilter="internship">Internship</button>
            <button type="button" class="filter-pill" data-cfilter="cyber-linux">Cyber &amp; Linux</button>
            <button type="button" class="filter-pill" data-cfilter="web-ai">Web &amp; AI</button>
            <button type="button" class="filter-pill" data-cfilter="core-cs">Core CS</button>
          </div>
          <input type="text" class="index-search" id="cert-search" placeholder="Search certificates…" aria-label="Search certificates" />
        </div>

        <div class="certs-grid" id="certs-grid"></div>
        <div class="certs-more-wrap" id="certs-more-wrap"></div>
      </section>

      <!-- ==================== 05. ABOUT, ZOOMABLE PORTRAIT & POCKET SYNTH ==================== -->
      <section class="section-shell" id="about" data-section="about">
        <div class="section-head">
          <div>
            <span class="eyebrow">04 / About Me</span>
            <h2 class="section-heading" data-scramble="Code meets Craft">Code meets <em>Craft</em></h2>
          </div>
          <p class="section-sub">
            Reliable engineering fundamentals paired with sharp, responsive product execution.
          </p>
        </div>

        <div class="about-bento">
          <div class="spotlight-card about-profile-card">
            <button type="button" class="portrait-frame" id="btn-zoom-portrait" aria-label="Zoom in on Saksham Sharma's photograph">
              <img src="${esc(profile.avatar)}" alt="${esc(profile.name)}" loading="lazy" />
              <span class="portrait-zoom-pill">⤢ Zoom</span>
              <span class="portrait-badge" id="about-ist-badge">PUNE, IN · --:-- IST</span>
            </button>
            <div class="about-text">
              <h3>Hey, I'm Saksham.</h3>
              <p>
                I got hooked on programming in 12th grade when a tiny C calculator printed back to a black terminal.
                Before college I built Python moderation bots for 200+ member Discord communities; today I build across
                <strong>C++ DSA</strong>, <strong>Python / FastAPI</strong>, <strong>React / Next.js</strong>,
                and <strong>native Windows utilities</strong>. I'm seeking a <strong>SWE / Full-Stack / AI internship</strong>
                where I can own real features and ship cleanly from day one.
              </p>
              <div class="trait-grid">
                ${PROFESSIONAL_TRAITS.map(
                  (tr) => `
                  <div class="trait-pill">
                    <strong>${esc(tr.title)}</strong>
                    <span>${esc(tr.text)}</span>
                  </div>
                `
                ).join('')}
              </div>
            </div>
          </div>

          <div class="about-right-stack">
            <div class="spotlight-card synth-card">
              <div class="synth-head">
                <span class="synth-title">PO-SS // Pocket Web Audio Synth</span>
                <div class="synth-eq" id="synth-eq" aria-hidden="true">
                  <i></i><i></i><i></i><i></i><i></i><i></i>
                </div>
              </div>
              <div class="synth-pads" id="synth-pads">
                <button type="button" class="synth-pad" data-pad="kick"><span>01</span><span>KICK</span></button>
                <button type="button" class="synth-pad" data-pad="chord"><span>02</span><span>CHORD</span></button>
                <button type="button" class="synth-pad" data-pad="pluck"><span>03</span><span>PLUCK</span></button>
                <button type="button" class="synth-pad" data-pad="shimmer"><span>04</span><span>GLOW</span></button>
              </div>
            </div>

            <div class="spotlight-card lab-portal-card">
              <div>
                <span class="eyebrow">Playable Versions of My Projects</span>
                <h3>Enter the Interactive Lab</h3>
                <p>
                  Try gamified interactive versions of my real builds on <strong>/lab</strong>:
                  the sonified <strong>Algo Arena</strong> (with Manual Sort Challenge),
                  <strong>3D Cube Pulse</strong> WebGL target blitz, and <strong>Typing Samurai × Haptic EQ</strong>.
                </p>
              </div>
              <div class="lab-portal-foot">
                <div class="work-tags" style="margin:0;">
                  <span class="chip">Algo Arena</span>
                  <span class="chip">3D Cube Pulse</span>
                  <span class="chip">Typing Samurai</span>
                </div>
                <button type="button" class="btn-primary" id="btn-bento-lab" style="padding:10px 18px;font-size:13px;">
                  Open /lab ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================== 06. YUREI STUDIO (SAM WEB SOLUTIONS) SERVICES ==================== -->
      <section class="section-shell" id="services" data-section="services">
        <div class="section-head">
          <div>
            <span class="eyebrow">05 / Indie Studio &amp; Freelance</span>
            <h2 class="section-heading" data-scramble="Yurei Studio Services">Yurei Studio <em>Services</em></h2>
          </div>
          <p class="section-sub">
            My independent web &amp; desktop engineering studio (formerly Sam Web Solutions) — shipping commercial client
            websites alongside flagship Windows desktop tools like <strong>Steam Idler Pro</strong>.
          </p>
        </div>

        <div class="spotlight-card studio-banner">
          <div class="studio-brand-row">
            <div class="studio-mark">Y</div>
            <div>
              <h3>Yurei Studio <span style="font-family:var(--font-mono);font-size:11px;color:var(--accent);font-weight:500;">· by Sam Web Solutions</span></h3>
              <p>
                Home of <strong>Steam Idler Pro v3.0</strong>, <strong>CleanPulse Pro</strong>, <strong>ChronoPulse</strong>,
                and paid client launches for <strong>Exotica PCMC</strong> &amp; <strong>Suraj Verma Jewellers (SVJ 3D)</strong>.
              </p>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
            <span class="chip" style="border-color:rgba(var(--accent-rgb),0.45);color:var(--accent);padding:6px 12px;font-size:10.5px;">
              Websites from ₹3,000 · 1–2 Week Delivery
            </span>
            <a href="#contact" class="btn-primary" data-nav="#contact" style="padding:10px 18px;font-size:13px;">
              Get a Free Quote ↓
            </a>
          </div>
        </div>

        <div class="services-grid">
          ${STUDIO_SERVICES.map(
            (s) => `
            <article class="spotlight-card service-card">
              <span class="service-num">SERVICE ${esc(s.num)}</span>
              <h3 class="service-title">${esc(s.title)}</h3>
              <p class="service-desc">${esc(s.desc)}</p>
              <ul class="service-points">
                ${s.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}
              </ul>
            </article>
          `
          ).join('')}
        </div>
      </section>

      <!-- ==================== 07. ENGINEERING ESSAYS ==================== -->
      <section class="section-shell" id="essays" data-section="essays">
        <div class="section-head">
          <div>
            <span class="eyebrow">06 / Writing</span>
            <h2 class="section-heading" data-scramble="Engineering Notes">Engineering <em>Notes</em></h2>
          </div>
          <p class="section-sub">
            Short, honest writeups on learning C++, Red Hat vs Coursera, shipping bots, and building real software in college.
          </p>
        </div>

        <div class="essays-grid" id="essays-grid">
          ${blogs
            .map(
              (b, idx) => `
            <article class="spotlight-card essay-card" data-essay-idx="${idx}" tabindex="0" role="button">
              <div class="work-meta-top">
                <span class="work-meta-domain">${esc(b.tag)}</span>
                <span>${esc(b.date)} · ${esc(b.readTime)}</span>
              </div>
              <h3 class="essay-title">${esc(b.title)}</h3>
              <p class="essay-excerpt">${esc(b.excerpt)}</p>
              <span class="work-open-hint" style="margin-top:4px;">Read Essay ↗</span>
            </article>
          `
            )
            .join('')}
        </div>
      </section>

      <!-- ==================== 08. WORKING CONTACT FORM + INBOX + PASSPORT ==================== -->
      <section class="section-shell" id="contact" data-section="contact" style="padding-bottom:46px;">
        <div class="section-head">
          <div>
            <span class="eyebrow">07 / Say Hello</span>
            <h2 class="section-heading" data-scramble="Let's Build Together">Let's Build <em>Together</em></h2>
          </div>
          <p class="section-sub">
            Hiring for a SWE / AI / Full-Stack internship, need a website or desktop utility from Yurei Studio, or want to collaborate? Drop a message directly below.
          </p>
        </div>

        <div class="contact-layout">
          <div class="contact-left-stack">
            <div class="spotlight-card contact-box">
              <span class="eyebrow">Direct Signal</span>
              <h3 style="margin-top:8px;">Reach Me Directly</h3>
              <div class="contact-email-display">${esc(profile.email)}</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <button type="button" class="btn-primary" id="btn-copy-email" style="padding:10px 16px;font-size:13px;">
                  <span id="copy-email-label">Copy Email</span>
                </button>
                <a href="mailto:${esc(profile.email)}" class="btn-ghost" style="padding:10px 14px;">Mail App ↗</a>
                <a href="${esc(profile.resume)}" download class="btn-ghost" style="padding:10px 14px;">Resume PDF ↓</a>
              </div>
            </div>

            <div class="spotlight-card contact-box">
              <div class="contact-meta-list">
                <div><strong>Location</strong>${esc(profile.location)} (Open to Pune / Bengaluru / Mumbai / Remote)</div>
                <div><strong>Availability</strong>Software Engineering, Full-Stack, AI &amp; Freelance Studio Builds</div>
                <div>
                  <strong>Profiles</strong>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">
                    <a href="${esc(profile.github)}" target="_blank" rel="noopener noreferrer" class="work-quick-link">GitHub ↗</a>
                    <a href="${esc(profile.linkedin)}" target="_blank" rel="noopener noreferrer" class="work-quick-link">LinkedIn ↗</a>
                    <a href="${esc(profile.instagram)}" target="_blank" rel="noopener noreferrer" class="work-quick-link">Instagram ↗</a>
                  </div>
                </div>
              </div>
            </div>

            <div class="spotlight-card">
              <button type="button" class="inbox-toggle" id="btn-inbox-toggle">
                <span>Sent Messages History (<b id="inbox-count">0</b>)</span>
                <span id="inbox-chevron">▾</span>
              </button>
              <div class="inbox-body" id="inbox-body"></div>
            </div>
          </div>

          <form class="spotlight-card contact-form-card" id="contact-form">
            <h3 style="margin:0 0 4px;font-family:var(--font-display);font-size:21px;">Send a Message</h3>
            <p style="margin:0 0 18px;font-size:13.5px;color:var(--ink-dim);">
              Delivered straight to my inbox via Web3Forms — I read every message and reply within 24h.
            </p>

            <div class="form-grid-2">
              <div class="form-field">
                <label for="cf-name">Your Name *</label>
                <input type="text" id="cf-name" class="form-input" required placeholder="Alex / Recruiter Name" />
              </div>
              <div class="form-field">
                <label for="cf-email">Your Email *</label>
                <input type="email" id="cf-email" class="form-input" required placeholder="you@company.com" />
              </div>
            </div>

            <div class="form-field">
              <label for="cf-subject">Subject</label>
              <input type="text" id="cf-subject" class="form-input" placeholder="SWE Internship / Yurei Studio Project / Collaboration" />
            </div>

            <div class="form-field">
              <label for="cf-message">Message *</label>
              <textarea id="cf-message" class="form-input" required placeholder="Tell me about the role, project scope, or just say hello…"></textarea>
            </div>

            <button type="submit" class="btn-primary" id="cf-submit" style="width:100%;padding:13px 20px;">
              Send Message ↗
            </button>
            <div class="form-status-note" id="cf-status">Direct delivery enabled · Automatic email fallback included</div>
          </form>
        </div>

        <div class="passport-bar">
          <div class="passport-label">
            Interactive Passport · <strong id="passport-count">0/${PASSPORT_BADGES.length}</strong> Unlocked
          </div>
          <div class="passport-badges" id="passport-badges"></div>
        </div>

        <footer class="footer-bar">
          <div>© ${new Date().getFullYear()} Saksham Sharma · Yurei Studio · Pune, IN</div>
          <div class="ist-clock" id="ist-clock">PUNE · IST --:--:--</div>
          <div class="footer-links">
            <a href="${esc(profile.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="${esc(profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="${esc(profile.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="/lab" id="footer-lab-link">Playable Lab</a>
          </div>
        </footer>
      </section>
    </main>

    <!-- Full-Screen Zoom Lightbox (Portrait / Certificates / Project Screenshots) -->
    <div class="lightbox-backdrop" id="lightbox" role="dialog" aria-modal="true" aria-label="Image Lightbox">
      <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Close image">✕</button>
      <img class="lightbox-img" id="lightbox-img" alt="" />
      <div class="lightbox-bar" id="lightbox-bar"></div>
    </div>

    <!-- Slide-Over Case Study / Essay Drawer -->
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <aside class="drawer-panel" id="drawer-panel" aria-modal="true" role="dialog">
      <button type="button" class="drawer-close" id="drawer-close" aria-label="Close drawer">✕</button>
      <div id="drawer-content"></div>
    </aside>

    <!-- ⌘K Command Palette -->
    <div class="cmd-backdrop" id="cmd-backdrop">
      <div class="cmd-modal" role="dialog" aria-label="Command Palette">
        <input type="text" class="cmd-input" id="cmd-input" placeholder="Jump to section, switch theme, zoom portrait, or launch /lab…" autocomplete="off" />
        <div class="cmd-list" id="cmd-list"></div>
      </div>
    </div>

    <div class="studio-toast" id="studio-toast" role="status"></div>
  `;

  /* ==================== 1. THEME ACCENT SWITCHER ==================== */
  const dotBackdrop = createDotBackdrop(document.getElementById('studio-dot-canvas'));
  let heroConsole = null;

  function applyTheme(themeKey, notify = false) {
    const th = THEMES[themeKey] || THEMES.volt;
    activeTheme = th;
    document.documentElement.style.setProperty('--accent', th.hex);
    document.documentElement.style.setProperty('--accent-rgb', th.rgb.join(', '));
    document.documentElement.style.setProperty('--accent-ink', th.ink);
    document.querySelectorAll('.swatch-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-theme') === th.id);
    });
    dotBackdrop.setAccent(th.rgb);
    heroConsole?.setAccent(th);
    try { localStorage.setItem('ss_studio_theme', th.id); } catch {}
    if (notify) {
      studioSound.tick();
      showToast(`Accent switched to ${th.name}`);
    }
  }
  document.querySelectorAll('.swatch-btn').forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(btn.getAttribute('data-theme'), true));
  });

  /* ==================== 2. PREMIUM SPLIT-SHUTTER PRELOADER ==================== */
  const preloader = document.getElementById('preloader');
  const preCount = document.getElementById('preloader-count');
  const preFill = document.getElementById('preloader-fill');
  let pVal = 0;
  const preInterval = setInterval(() => {
    pVal = Math.min(100, pVal + Math.ceil((100 - pVal) * 0.24) + 4);
    if (preCount) preCount.textContent = `${String(pVal).padStart(2, '0')}%`;
    if (preFill) preFill.style.width = `${pVal}%`;
    if (pVal >= 100) {
      clearInterval(preInterval);
      setTimeout(() => preloader?.classList.add('done'), 180);
    }
  }, 42);

  /* ==================== 3. TOAST, LIGHTBOX & EXPLORER PASSPORT ==================== */
  const toastEl = document.getElementById('studio-toast');
  let toastTimer = 0;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  // Reusable Full-Screen Image Lightbox
  const lightboxEl = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxBar = document.getElementById('lightbox-bar');
  let lightboxOpen = false;

  function openLightbox({ src, caption = '', pdf = '', switches = null }) {
    if (!lightboxEl || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption;
    let barHtml = `<span>${esc(caption)}</span>`;
    if (switches && switches.length > 1) {
      barHtml += switches
        .map(
          (sw) =>
            `<button type="button" class="console-mini-btn ${sw.src === src ? 'active' : ''}" data-lb-src="${esc(sw.src)}" data-lb-cap="${esc(sw.label)}">${esc(sw.label)}</button>`
        )
        .join('');
    }
    if (pdf) {
      barHtml += `<a href="${esc(pdf)}" target="_blank" rel="noopener noreferrer" class="console-mini-btn active">Open PDF ↗</a>`;
    }
    if (lightboxBar) lightboxBar.innerHTML = barHtml;
    lightboxEl.classList.add('open');
    lightboxOpen = true;
    lenis.stop();
  }
  function closeLightbox() {
    if (!lightboxOpen) return;
    lightboxEl?.classList.remove('open');
    lightboxOpen = false;
    if (!drawerPanel?.classList.contains('open') && !cmdOpen) lenis.start();
  }
  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  lightboxEl?.addEventListener('click', (e) => {
    if (e.target === lightboxEl) closeLightbox();
  });
  lightboxBar?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lb-src]');
    if (!btn || !lightboxImg) return;
    studioSound.tick();
    lightboxImg.src = btn.getAttribute('data-lb-src');
    lightboxBar.querySelectorAll('[data-lb-src]').forEach((b) => b.classList.toggle('active', b === btn));
  });

  // Portrait Zoom button (supports switching between /profile.jpg & /about.jpg!)
  document.getElementById('btn-zoom-portrait')?.addEventListener('click', () => {
    studioSound.tick();
    openLightbox({
      src: profile.avatar,
      caption: 'Saksham Sharma · Pune, IN',
      switches: [
        { src: profile.avatar, label: 'Portrait' },
        { src: profile.aboutPhoto, label: 'Candid' },
      ],
    });
  });

  const passportCountEl = document.getElementById('passport-count');
  const passportBadgesEl = document.getElementById('passport-badges');
  function renderPassport() {
    if (passportCountEl) passportCountEl.textContent = `${unlockedBadges.size}/${PASSPORT_BADGES.length}`;
    if (passportBadgesEl) {
      passportBadgesEl.innerHTML = PASSPORT_BADGES.map((b) => {
        const has = unlockedBadges.has(b.id);
        return `<span class="badge-chip ${has ? 'unlocked' : ''}" title="${esc(b.hint)}">${has ? '✦ ' : ''}${esc(b.label)}</span>`;
      }).join('');
    }
  }
  renderPassport();

  function unlockBadge(id) {
    if (unlockedBadges.has(id)) return;
    const badge = PASSPORT_BADGES.find((b) => b.id === id);
    if (!badge) return;
    unlockedBadges.add(id);
    try { localStorage.setItem('ss_explorer_badges', JSON.stringify(Array.from(unlockedBadges))); } catch {}
    renderPassport();
    studioSound.badgeUnlock();
    showToast(`✦ Unlocked: ${badge.label} (${unlockedBadges.size}/${PASSPORT_BADGES.length})`);
  }

  /* ==================== 4. HERO CORE-01 PLAYABLE CONSOLE ==================== */
  heroConsole = mountHeroConsole(document.getElementById('hero-console'), {
    onUnlock: unlockBadge,
    getAccent: () => activeTheme,
  });
  applyTheme(activeTheme.id, false);

  /* ==================== 5. LENIS SMOOTH SCROLL + MOBILE MENU ==================== */
  const lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  const tickerFn = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);

  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  document.querySelectorAll('[data-section]').forEach((sec) => {
    const id = sec.getAttribute('data-section');
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 52%',
      end: 'bottom 48%',
      onEnter: () => navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('data-nav') === `#${id}`)),
      onEnterBack: () => navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('data-nav') === `#${id}`)),
    });
  });

  function scrollToSelector(sel) {
    const target = document.querySelector(sel);
    if (target) lenis.scrollTo(target, { offset: -64, duration: 1.0 });
  }
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      studioSound.tick();
      scrollToSelector(el.getAttribute('data-nav'));
    });
  });

  const mobDrawer = document.getElementById('mobile-drawer');
  const mobMenuBtn = document.getElementById('btn-mob-menu');
  let mobOpen = false;
  function setMobMenu(open) {
    mobOpen = open;
    mobDrawer?.classList.toggle('open', mobOpen);
    mobDrawer?.setAttribute('aria-hidden', String(!mobOpen));
    mobMenuBtn?.setAttribute('aria-expanded', String(mobOpen));
    if (mobMenuBtn) mobMenuBtn.textContent = mobOpen ? 'Close' : 'Menu';
  }
  mobMenuBtn?.addEventListener('click', () => { studioSound.tick(); setMobMenu(!mobOpen); });
  document.querySelectorAll('[data-mob-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      studioSound.tick();
      setMobMenu(false);
      scrollToSelector(a.getAttribute('data-mob-nav'));
    });
  });

  const onSpotlightMove = (e) => {
    const card = e.target.closest?.('.spotlight-card');
    if (card) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }
  };
  document.addEventListener('pointermove', onSpotlightMove, { passive: true });

  /* ==================== 6. PROJECTS SHOWCASE (SCREENSHOTS + FILTERS) ==================== */
  let projFilter = 'featured';
  let projQuery = '';
  const projectsGrid = document.getElementById('projects-grid');

  function renderProjects() {
    if (!projectsGrid) return;
    const q = projQuery.trim().toLowerCase();
    const list = ALL_PROJECTS.filter((p) => {
      const matchTab =
        projFilter === 'all'
          ? true
          : projFilter === 'featured'
          ? p.featured
          : p.categories.includes(projFilter);
      const matchQ =
        !q || `${p.title} ${p.subtitle} ${p.domain} ${p.summary} ${p.stack.join(' ')}`.toLowerCase().includes(q);
      return matchTab && matchQ;
    });

    projectsGrid.innerHTML =
      list
        .map((p) => {
          const badge =
            p.visibility === 'private-client'
              ? { txt: 'Client Live', cls: 'live' }
              : p.visibility === 'binary-release'
              ? { txt: 'Yurei Release', cls: 'live' }
              : p.demo
              ? { txt: 'Live Demo', cls: 'live' }
              : { txt: 'Open Source', cls: '' };
          return `
            <article class="spotlight-card proj-card" data-proj-id="${esc(p.id)}" tabindex="0" role="button">
              <div class="proj-thumb-wrap">
                <img src="${esc(p.image)}" alt="${esc(p.title)} screenshot" loading="lazy" />
                <div class="proj-thumb-scrim"></div>
                <span class="proj-vis-badge ${badge.cls}">${badge.txt}</span>
                ${p.gallery && p.gallery.length > 1 ? `<span class="proj-gallery-count">${p.gallery.length} shots</span>` : ''}
              </div>
              <div class="work-body">
                <div class="work-meta-top">
                  <span class="work-meta-domain">${esc(p.domain)}</span>
                  <span>${esc(p.year)}</span>
                </div>
                <h3 class="work-title">${esc(p.title)}</h3>
                <div class="work-subtitle">${esc(p.subtitle)}</div>
                <p class="work-metric">${esc(p.summary)}</p>
                <div class="work-tags">
                  ${p.stack.slice(0, 4).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
                </div>
                <div class="work-foot">
                  <div class="work-links">
                    ${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer" class="work-quick-link" data-stop-card>Live ↗</a>` : ''}
                    ${p.releaseUrl ? `<a href="${esc(p.releaseUrl)}" target="_blank" rel="noopener noreferrer" class="work-quick-link" data-stop-card>Release ↗</a>` : ''}
                    ${p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noopener noreferrer" class="work-quick-link" data-stop-card>GitHub</a>` : ''}
                    ${p.paperPdf ? `<a href="${esc(p.paperPdf)}" target="_blank" rel="noopener noreferrer" class="work-quick-link" data-stop-card>Paper</a>` : ''}
                  </div>
                  <span class="work-open-hint">Inspect ↗</span>
                </div>
              </div>
            </article>
          `;
        })
        .join('') || '<div style="padding:36px 12px;color:var(--muted);">No projects match that filter.</div>';
  }
  renderProjects();

  document.getElementById('proj-filters')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pfilter]');
    if (!btn) return;
    studioSound.tick();
    projFilter = btn.getAttribute('data-pfilter');
    document.querySelectorAll('#proj-filters .filter-pill').forEach((b) => b.classList.toggle('active', b === btn));
    renderProjects();
  });
  document.getElementById('proj-search')?.addEventListener('input', (e) => {
    projQuery = e.target.value;
    renderProjects();
  });
  projectsGrid?.addEventListener('click', (e) => {
    if (e.target.closest('[data-stop-card]')) return;
    const card = e.target.closest('[data-proj-id]');
    if (!card) return;
    const p = ALL_PROJECTS.find((x) => x.id === card.getAttribute('data-proj-id'));
    if (p) {
      studioSound.tick();
      unlockBadge('reader');
      openProjectDrawer(p);
    }
  });

  /* ==================== 7. INTERACTIVE SKILLS ARSENAL ==================== */
  let skillFilter = 'all';
  const skillsGrid = document.getElementById('skills-grid');

  function renderSkills() {
    if (!skillsGrid) return;
    let cats = SKILL_CATEGORIES;
    if (skillFilter === 'proficient') {
      cats = SKILL_CATEGORIES.map((c) => ({
        ...c,
        skills: c.skills.filter((s) => s.level === 'strong' || s.level === 'proficient'),
      })).filter((c) => c.skills.length > 0);
    } else if (skillFilter === 'learning') {
      cats = SKILL_CATEGORIES.map((c) => ({
        ...c,
        skills: c.skills.filter((s) => s.level === 'learning'),
      })).filter((c) => c.skills.length > 0);
    } else if (skillFilter !== 'all') {
      cats = SKILL_CATEGORIES.filter((c) => c.id === skillFilter);
    }

    skillsGrid.innerHTML = cats
      .map(
        (cat) => `
        <div class="spotlight-card skill-cat-card">
          <div class="skill-cat-head">
            <h3>${esc(cat.label)}</h3>
            <span class="skill-cat-count">${cat.skills.length}</span>
          </div>
          <div class="skill-cat-body">
            ${cat.skills
              .map((sk) => {
                const lv = SKILL_LEVELS[sk.level] || SKILL_LEVELS.familiar;
                return `
                  <div class="skill-item-pill">
                    <span>${esc(sk.name)}</span>
                    <span class="lvl-badge ${lv.cls}">${lv.label}</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      `
      )
      .join('');
  }
  renderSkills();

  document.getElementById('skill-filters')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-sfilter]');
    if (!btn) return;
    studioSound.tick();
    skillFilter = btn.getAttribute('data-sfilter');
    document.querySelectorAll('#skill-filters .filter-pill').forEach((b) => b.classList.toggle('active', b === btn));
    renderSkills();
  });

  /* ==================== 8. VISUAL CERTIFICATE THUMBNAIL GALLERY ==================== */
  let certFilter = 'all';
  let certQuery = '';
  let showAllCerts = false;
  const certsGrid = document.getElementById('certs-grid');
  const certsMoreWrap = document.getElementById('certs-more-wrap');

  function renderCertificates() {
    if (!certsGrid) return;
    const q = certQuery.trim().toLowerCase();

    let items;
    if (certFilter === 'specialization') {
      items = CERTIFICATES.filter(
        (c) => c.isSpecialization && (!q || `${c.title} ${c.issuer} ${c.desc}`.toLowerCase().includes(q))
      );
    } else {
      items = CERTIFICATES.filter((c) => {
        if (c.isSpecialization) return false;
        const matchTab = certFilter === 'all' ? true : c.cat === certFilter;
        const matchQ = !q || `${c.title} ${c.issuer} ${c.desc} ${c.badge}`.toLowerCase().includes(q);
        return matchTab && matchQ;
      });
    }

    const limit = showAllCerts || q || certFilter !== 'all' ? items.length : 12;
    const visible = items.slice(0, limit);

    certsGrid.innerHTML =
      visible
        .map((c) => {
          const subCourses = c.isSpecialization
            ? CERTIFICATES.filter((x) => !x.isSpecialization && x.group === c.group)
            : [];
          return `
            <article class="spotlight-card cert-card">
              <div class="cert-thumb-box" data-cert-zoom="${esc(c.thumb)}" data-cert-cap="${esc(c.title)} — ${esc(c.issuer)}" data-cert-pdf="${esc(c.pdf)}">
                <img src="${esc(c.thumb)}" alt="${esc(c.title)} thumbnail" loading="lazy" />
                <div class="cert-zoom-chip"><span>⤢ Zoom Preview</span></div>
                <span class="cert-badge-float">${esc(c.badge)}</span>
              </div>
              <div class="cert-body">
                <div class="cert-head-row">
                  <h3 class="cert-title">${esc(c.title)}</h3>
                  <span class="cert-date">${esc(c.date)}</span>
                </div>
                <div class="cert-issuer">${esc(c.issuer)}</div>
                <p class="cert-desc">${esc(c.desc)}</p>
                ${
                  subCourses.length
                    ? `
                    <div class="cert-subcourses">
                      <button type="button" class="cert-expand-btn" data-toggle-spec="${esc(c.id)}">
                        <span>${subCourses.length} sub-courses included</span>
                        <span>▾</span>
                      </button>
                      <div class="cert-sub-list" id="spec-list-${esc(c.id)}">
                        ${subCourses
                          .map(
                            (sc) =>
                              `<a href="${esc(sc.pdf)}" target="_blank" rel="noopener noreferrer" class="cert-sub-link">${esc(sc.title)} ↗</a>`
                          )
                          .join('')}
                      </div>
                    </div>
                  `
                    : ''
                }
                <div class="cert-foot">
                  <button type="button" class="work-quick-link" data-cert-zoom="${esc(c.thumb)}" data-cert-cap="${esc(c.title)} — ${esc(c.issuer)}" data-cert-pdf="${esc(c.pdf)}">
                    Zoom ⤢
                  </button>
                  <a href="${esc(c.pdf)}" target="_blank" rel="noopener noreferrer" class="work-open-hint">
                    View PDF ↗
                  </a>
                </div>
              </div>
            </article>
          `;
        })
        .join('') || '<div style="padding:32px 12px;color:var(--muted);">No certificates match that filter.</div>';

    if (certsMoreWrap) {
      if (items.length > limit) {
        certsMoreWrap.innerHTML = `
          <button type="button" class="btn-ghost" id="btn-show-all-certs">
            Show All ${items.length} Certificates (+${items.length - limit}) ↓
          </button>
        `;
        document.getElementById('btn-show-all-certs')?.addEventListener('click', () => {
          studioSound.tick();
          showAllCerts = true;
          renderCertificates();
        });
      } else if (showAllCerts && certFilter === 'all' && !q) {
        certsMoreWrap.innerHTML = `
          <button type="button" class="btn-ghost" id="btn-collapse-certs">
            Show Compact View ↑
          </button>
        `;
        document.getElementById('btn-collapse-certs')?.addEventListener('click', () => {
          studioSound.tick();
          showAllCerts = false;
          renderCertificates();
        });
      } else {
        certsMoreWrap.innerHTML = '';
      }
    }
  }
  renderCertificates();

  document.getElementById('cert-filters')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cfilter]');
    if (!btn) return;
    studioSound.tick();
    certFilter = btn.getAttribute('data-cfilter');
    document.querySelectorAll('#cert-filters .filter-pill').forEach((b) => b.classList.toggle('active', b === btn));
    renderCertificates();
  });
  document.getElementById('cert-search')?.addEventListener('input', (e) => {
    certQuery = e.target.value;
    renderCertificates();
  });
  certsGrid?.addEventListener('click', (e) => {
    const expBtn = e.target.closest('[data-toggle-spec]');
    if (expBtn) {
      const id = expBtn.getAttribute('data-toggle-spec');
      document.getElementById(`spec-list-${id}`)?.classList.toggle('open');
      studioSound.tick();
      return;
    }
    const zoomEl = e.target.closest('[data-cert-zoom]');
    if (zoomEl) {
      studioSound.tick();
      openLightbox({
        src: zoomEl.getAttribute('data-cert-zoom'),
        caption: zoomEl.getAttribute('data-cert-cap') || 'Certificate',
        pdf: zoomEl.getAttribute('data-cert-pdf') || '',
      });
    }
  });

  /* ==================== 9. POCKET SYNTH & ESSAYS ==================== */
  const eqBars = Array.from(document.querySelectorAll('#synth-eq i'));
  let eqResetTimer = 0;
  function pulseEq() {
    eqBars.forEach((bar) => { bar.style.height = `${6 + Math.round(Math.random() * 13)}px`; });
    clearTimeout(eqResetTimer);
    eqResetTimer = setTimeout(() => { eqBars.forEach((bar) => { bar.style.height = '5px'; }); }, 220);
  }
  document.getElementById('synth-pads')?.addEventListener('click', (e) => {
    const pad = e.target.closest('.synth-pad');
    if (!pad) return;
    studioSound.playPad(pad.getAttribute('data-pad'));
    syncAudioButton();
    pad.classList.add('hit');
    setTimeout(() => pad.classList.remove('hit'), 140);
    pulseEq();
    unlockBadge('synth');
  });

  document.getElementById('essays-grid')?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-essay-idx]');
    if (!card) return;
    const b = blogs[Number(card.getAttribute('data-essay-idx') || 0)];
    if (b) {
      studioSound.tick();
      unlockBadge('reader');
      openEssayDrawer(b);
    }
  });

  /* ==================== 10. CASE STUDY & ESSAY SLIDE-OVER DRAWER ==================== */
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerPanel = document.getElementById('drawer-panel');
  const drawerContent = document.getElementById('drawer-content');

  function openDrawer(html) {
    if (!drawerContent) return;
    drawerContent.innerHTML = html;
    drawerBackdrop?.classList.add('open');
    drawerPanel?.classList.add('open');
    lenis.stop();
  }
  function closeDrawer() {
    drawerBackdrop?.classList.remove('open');
    drawerPanel?.classList.remove('open');
    if (!lightboxOpen && !cmdOpen) lenis.start();
  }
  document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);

  function openProjectDrawer(p) {
    openDrawer(`
      <span class="eyebrow">${esc(p.domain)} · ${esc(p.year)}</span>
      <h2 class="drawer-title">${esc(p.title)}</h2>
      <div style="font-family:var(--font-mono);font-size:11.5px;color:var(--accent);">${esc(p.subtitle)}</div>
      <div class="work-tags" style="margin-top:14px;">
        ${p.stack.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
      </div>
      ${
        p.gallery && p.gallery.length
          ? `
        <div class="drawer-gallery" id="drawer-gallery">
          ${p.gallery
            .map(
              (g) => `
            <button type="button" class="drawer-shot" data-shot-src="${esc(g.src)}" data-shot-lbl="${esc(p.title)} · ${esc(g.label)}">
              <img src="${esc(g.src)}" alt="${esc(g.label)}" loading="lazy" />
              <span>${esc(g.label)} · ⤢</span>
            </button>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }
      <div class="drawer-body">
        <div class="drawer-block">
          <div class="eyebrow">Overview</div>
          <p>${esc(p.summary)}</p>
        </div>
        <div class="drawer-block">
          <div class="eyebrow">Architecture &amp; Engineering</div>
          <p>${esc(p.architecture)}</p>
          ${
            p.highlights?.length
              ? `<ul class="drawer-highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`
              : ''
          }
        </div>
        <div class="drawer-block" style="display:flex;flex-wrap:wrap;gap:10px;">
          ${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding:10px 18px;font-size:13px;">Open Live Site ↗</a>` : ''}
          ${p.secondaryDemo ? `<a href="${esc(p.secondaryDemo)}" target="_blank" rel="noopener noreferrer" class="btn-ghost">${esc(p.secondaryDemoLabel || 'Live Demo ↗')}</a>` : ''}
          ${p.releaseUrl ? `<a href="${esc(p.releaseUrl)}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding:10px 18px;font-size:13px;">Windows Release ↗</a>` : ''}
          ${p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noopener noreferrer" class="btn-ghost">GitHub Repo ↗</a>` : ''}
          ${p.paperPdf ? `<a href="${esc(p.paperPdf)}" target="_blank" rel="noopener noreferrer" class="btn-ghost">IEEE Paper PDF ↗</a>` : ''}
        </div>
      </div>
    `);

    drawerContent?.querySelectorAll('[data-shot-src]').forEach((btn) => {
      btn.addEventListener('click', () => {
        studioSound.tick();
        openLightbox({
          src: btn.getAttribute('data-shot-src'),
          caption: btn.getAttribute('data-shot-lbl') || p.title,
          switches: (p.gallery || []).map((g) => ({ src: g.src, label: g.label })),
        });
      });
    });
  }

  function openEssayDrawer(b) {
    openDrawer(`
      <span class="eyebrow">${esc(b.tag)} · ${esc(b.date)} · ${esc(b.readTime)}</span>
      <h2 class="drawer-title">${esc(b.title)}</h2>
      <div class="drawer-body">
        ${(b.paragraphs || [b.excerpt]).map((para) => `<p>${esc(para)}</p>`).join('')}
      </div>
    `);
  }

  /* ==================== 11. WORKING WEB3FORMS CONTACT FORM + SENT INBOX ==================== */
  const inboxCountEl = document.getElementById('inbox-count');
  const inboxBodyEl = document.getElementById('inbox-body');
  const inboxChevron = document.getElementById('inbox-chevron');
  let inboxOpen = false;

  function renderInbox() {
    const msgs = loadMessages();
    if (inboxCountEl) inboxCountEl.textContent = String(msgs.length);
    if (!inboxBodyEl) return;
    if (!msgs.length) {
      inboxBodyEl.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:8px 0;">No messages sent from this browser yet.</div>';
      return;
    }
    inboxBodyEl.innerHTML = msgs
      .map(
        (m) => `
        <div class="inbox-msg">
          <div class="inbox-msg-head">
            <span>${esc(m.name)} · ${esc(m.sentAt)}</span>
            <button type="button" class="inbox-del" data-del-msg="${esc(m.id)}" title="Delete">✕</button>
          </div>
          <div style="font-weight:500;color:var(--ink);margin-bottom:2px;">${esc(m.subject || '(No subject)')}</div>
          <div style="color:var(--ink-dim);">${esc(m.message)}</div>
        </div>
      `
      )
      .join('');
  }
  renderInbox();

  document.getElementById('btn-inbox-toggle')?.addEventListener('click', () => {
    inboxOpen = !inboxOpen;
    inboxBodyEl?.classList.toggle('open', inboxOpen);
    if (inboxChevron) inboxChevron.textContent = inboxOpen ? '▴' : '▾';
    studioSound.tick();
  });
  inboxBodyEl?.addEventListener('click', (e) => {
    const del = e.target.closest('[data-del-msg]');
    if (!del) return;
    const id = del.getAttribute('data-del-msg');
    const next = loadMessages().filter((m) => m.id !== id);
    try { localStorage.setItem(MSG_STORAGE_KEY, JSON.stringify(next)); } catch {}
    renderInbox();
  });

  const contactForm = document.getElementById('contact-form');
  const cfSubmit = document.getElementById('cf-submit');
  const cfStatus = document.getElementById('cf-status');
  let sendingForm = false;

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sendingForm) return;
    const name = document.getElementById('cf-name')?.value.trim() || '';
    const email = document.getElementById('cf-email')?.value.trim() || '';
    const subject = document.getElementById('cf-subject')?.value.trim() || '';
    const message = document.getElementById('cf-message')?.value.trim() || '';
    if (!name || !email || !message) return;

    sendingForm = true;
    if (cfSubmit) cfSubmit.textContent = 'Sending…';
    if (cfStatus) cfStatus.textContent = 'Delivering to Saksham’s inbox…';

    const stored = {
      id: String(Date.now()),
      name,
      email,
      subject,
      message,
      sentAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    const saveLocal = () => {
      const list = loadMessages();
      list.unshift(stored);
      try { localStorage.setItem(MSG_STORAGE_KEY, JSON.stringify(list.slice(0, 40))); } catch {}
      renderInbox();
    };

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name,
          email,
          subject: subject || `Portfolio message from ${name}`,
          message,
          from_name: 'Saksham Sharma · Yurei Studio Portfolio',
          replyto: email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        saveLocal();
        contactForm.reset();
        studioSound.badgeUnlock();
        showToast('Message delivered to Saksham’s inbox ✓');
        if (cfSubmit) cfSubmit.textContent = 'Message Sent ✓';
        if (cfStatus) cfStatus.textContent = 'Delivered! I usually reply within 24 hours.';
        setTimeout(() => { if (cfSubmit) cfSubmit.textContent = 'Send Message ↗'; }, 4000);
        sendingForm = false;
        return;
      }
    } catch {
      // Fall through cleanly to mailto fallback
    }

    saveLocal();
    const sub = encodeURIComponent(subject || `Message from ${name}`);
    const body = encodeURIComponent(`Hi Saksham,\n\n${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${profile.email}?subject=${sub}&body=${body}`;
    contactForm.reset();
    showToast('Saved locally & opened your mail app ✓');
    if (cfSubmit) cfSubmit.textContent = 'Opened Mail App ✓';
    if (cfStatus) cfStatus.textContent = 'Message saved to history & opened your default email client.';
    setTimeout(() => { if (cfSubmit) cfSubmit.textContent = 'Send Message ↗'; }, 4000);
    sendingForm = false;
  });

  /* ==================== 12. COPY EMAIL, IST CLOCK, SFX & ⌘K PALETTE ==================== */
  const copyLbl = document.getElementById('copy-email-label');
  function copyEmail() {
    navigator.clipboard?.writeText(profile.email).catch(() => {});
    studioSound.pluck(4);
    showToast(`Copied ${profile.email}`);
    if (copyLbl) {
      copyLbl.textContent = 'Copied ✓';
      setTimeout(() => { copyLbl.textContent = 'Copy Email'; }, 2200);
    }
  }
  document.getElementById('btn-copy-email')?.addEventListener('click', copyEmail);

  const clockEl = document.getElementById('ist-clock');
  const aboutBadgeEl = document.getElementById('about-ist-badge');
  function updateClock() {
    try {
      const full = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date());
      if (clockEl) clockEl.textContent = `PUNE · IST ${full}`;
      if (aboutBadgeEl) aboutBadgeEl.textContent = `PUNE, IN · ${full.slice(0, 5)} IST`;
    } catch {
      if (clockEl) clockEl.textContent = 'PUNE · IST';
    }
  }
  updateClock();
  const clockId = setInterval(updateClock, 1000);

  const btnAudio = document.getElementById('btn-audio');
  const audioLabel = document.getElementById('audio-label');
  const btnMobAudio = document.getElementById('btn-mob-audio');
  function syncAudioButton() {
    const on = studioSound.isEnabled();
    if (btnAudio) btnAudio.setAttribute('data-active', String(on));
    if (audioLabel) audioLabel.textContent = on ? 'SFX On' : 'SFX Off';
    if (btnMobAudio) btnMobAudio.textContent = on ? 'SFX On' : 'SFX Off';
  }
  function toggleAudio() {
    const on = studioSound.toggle();
    syncAudioButton();
    showToast(on ? 'Web Audio SFX enabled' : 'Audio muted');
  }
  btnAudio?.addEventListener('click', toggleAudio);
  btnMobAudio?.addEventListener('click', toggleAudio);

  const cmdBackdrop = document.getElementById('cmd-backdrop');
  const cmdInput = document.getElementById('cmd-input');
  const cmdList = document.getElementById('cmd-list');
  let cmdOpen = false;
  let cmdIndex = 0;

  const commands = [
    { label: 'Download Resume (PDF)', hint: 'PDF', run: () => { const a = document.createElement('a'); a.href = profile.resume; a.download = 'Saksham_Sharma_Resume.pdf'; a.click(); } },
    { label: 'Open Playable Project Lab (Algo · 3D Cubes · Typing)', hint: '/lab', run: () => launchLab() },
    { label: 'Jump to Projects Showcase', hint: 'Section 01', run: () => scrollToSelector('#work') },
    { label: 'Jump to Skills Arsenal', hint: 'Section 02', run: () => scrollToSelector('#skills') },
    { label: 'Jump to Visual Certificates Gallery', hint: 'Section 03', run: () => scrollToSelector('#certificates') },
    { label: 'Jump to About & Pocket Synth', hint: 'Section 04', run: () => scrollToSelector('#about') },
    { label: 'Jump to Yurei Studio Services & Steam Idler Pro', hint: 'Section 05', run: () => scrollToSelector('#services') },
    { label: 'Jump to Contact Form', hint: 'Section 07', run: () => scrollToSelector('#contact') },
    { label: 'Zoom Portrait Photograph', hint: 'Lightbox', run: () => document.getElementById('btn-zoom-portrait')?.click() },
    { label: 'Play Packet Run Mini-Game', hint: 'CORE-01', run: () => { scrollToSelector('#hero'); heroConsole?.setMode('game'); } },
    { label: 'Open Physics Stack Sandbox', hint: 'CORE-01', run: () => { scrollToSelector('#hero'); heroConsole?.setMode('physics'); } },
    { label: 'Inspect 3D Shader Orb', hint: 'CORE-01', run: () => { scrollToSelector('#hero'); heroConsole?.setMode('orb'); } },
    { label: 'Theme: Acid Volt (#C8FF3D)', hint: 'Accent', run: () => applyTheme('volt', true) },
    { label: 'Theme: Electric Violet (#B388FF)', hint: 'Accent', run: () => applyTheme('violet', true) },
    { label: 'Theme: Signal Coral (#FF6B4A)', hint: 'Accent', run: () => applyTheme('coral', true) },
    { label: 'Copy Email Address', hint: profile.email, run: () => copyEmail() },
  ];

  let filteredCmds = commands;
  function renderCmds() {
    if (!cmdList) return;
    const q = (cmdInput?.value || '').trim().toLowerCase();
    filteredCmds = commands.filter((c) => !q || `${c.label} ${c.hint}`.toLowerCase().includes(q));
    cmdIndex = Math.min(cmdIndex, Math.max(0, filteredCmds.length - 1));
    cmdList.innerHTML = filteredCmds
      .map(
        (c, i) => `
        <button type="button" class="cmd-item ${i === cmdIndex ? 'selected' : ''}" data-cmd-i="${i}">
          <span>${esc(c.label)}</span>
          <span class="cmd-hint">${esc(c.hint)}</span>
        </button>
      `
      )
      .join('');
  }
  function openCmd() {
    cmdOpen = true;
    cmdIndex = 0;
    if (cmdInput) cmdInput.value = '';
    renderCmds();
    cmdBackdrop?.classList.add('open');
    setTimeout(() => cmdInput?.focus(), 30);
    lenis.stop();
    studioSound.tick();
    unlockBadge('cmd');
  }
  function closeCmd() {
    cmdOpen = false;
    cmdBackdrop?.classList.remove('open');
    if (!lightboxOpen && !drawerPanel?.classList.contains('open')) lenis.start();
  }

  document.getElementById('btn-cmd')?.addEventListener('click', openCmd);
  cmdBackdrop?.addEventListener('click', (e) => { if (e.target === cmdBackdrop) closeCmd(); });
  cmdInput?.addEventListener('input', () => { cmdIndex = 0; renderCmds(); });
  cmdList?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cmd-item');
    if (!btn) return;
    const c = filteredCmds[Number(btn.getAttribute('data-cmd-i'))];
    closeCmd();
    c?.run();
  });

  const detachScramble = attachScrambleObservers(root);

  function onGlobalKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdOpen) closeCmd();
      else openCmd();
      return;
    }
    if (e.key === 'Escape') {
      if (lightboxOpen) closeLightbox();
      else if (cmdOpen) closeCmd();
      else if (mobOpen) setMobMenu(false);
      else closeDrawer();
      return;
    }
    if (cmdOpen) {
      if (e.key === 'ArrowDown') { e.preventDefault(); cmdIndex = (cmdIndex + 1) % Math.max(1, filteredCmds.length); renderCmds(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); cmdIndex = (cmdIndex - 1 + Math.max(1, filteredCmds.length)) % Math.max(1, filteredCmds.length); renderCmds(); }
      else if (e.key === 'Enter') { e.preventDefault(); const c = filteredCmds[cmdIndex]; closeCmd(); c?.run(); }
    }
  }
  window.addEventListener('keydown', onGlobalKeyDown);

  function disposePortfolio() {
    clearInterval(clockId);
    clearInterval(preInterval);
    clearTimeout(eqResetTimer);
    clearTimeout(toastTimer);
    detachScramble();
    window.removeEventListener('keydown', onGlobalKeyDown);
    document.removeEventListener('pointermove', onSpotlightMove);
    gsap.ticker.remove(tickerFn);
    lenis.destroy();
    ScrollTrigger.getAll().forEach((st) => st.kill());
    dotBackdrop.dispose();
    heroConsole?.dispose();
  }

  function launchLab() {
    studioSound.tick();
    window.history.pushState({}, '', '/lab');
    onOpenLab?.();
  }

  document.getElementById('btn-top-lab')?.addEventListener('click', launchLab);
  document.getElementById('btn-hero-lab')?.addEventListener('click', launchLab);
  document.getElementById('btn-bento-lab')?.addEventListener('click', launchLab);
  document.getElementById('footer-lab-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    launchLab();
  });

  return { dispose: disposePortfolio };
}
