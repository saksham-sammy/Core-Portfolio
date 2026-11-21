/**
 * Curated Flagship Builds, Recruiter Credentials Spotlight & Engineering Domains
 * Written in Saksham's real, grounded engineering voice for top SWE / AI / Security internships.
 */

export const FLAGSHIP_WORKS = [
  {
    id: 'phishguard',
    num: '01',
    name: 'PhishGuard',
    year: '2026',
    domain: 'ML Security · Chrome MV3 Extension',
    stack: ['Python', 'Chrome MV3', 'FastAPI', 'React', 'Scikit-Learn'],
    metric: 'Pre-navigation ML phishing blocker · 0.9833 ROC-AUC · 90.3% live 2026 OpenPhish recall',
    summary:
      'Most phishing scanners visit the suspicious webpage first — leaking your IP or confirming an active click. I built PhishGuard to classify malicious links from the raw URL string alone and block them in Chrome before the browser even starts a TCP handshake.',
    architecture:
      'Combines a Manifest V3 extension hooking chrome.webNavigation.onBeforeNavigate (with a full-page Security Interstitial and live scan history sync) with a FastAPI + SQLite + React platform running 48 multi-view lexical/deception features + char 3–5 gram TF-IDF inside a calibrated stacking ensemble. Evaluated strictly domain-disjoint (93.0% accuracy, 92.25% zero-shot), backed by 63 pytest tests and an IEEE LaTeX paper.',
    url: 'https://github.com/saksham-sammy/phishguard',
    paperPdf: '/certificates/PhishGuard_Research_Paper.pdf',
  },
  {
    id: 'pm-copilot',
    num: '02',
    name: 'PM-Copilot',
    year: '2026',
    domain: 'Full-Stack AI · RAG Pipeline',
    stack: ['Next.js', 'FastAPI', 'ChromaDB', 'Sentence Transformers'],
    metric: 'Multi-provider semantic retrieval workbench for grounded PRDs & product roadmaps',
    summary:
      'An AI Product Management workspace that ingests specs, user research, and meeting notes into a local vector store so product teams can query real evidence and draft grounded PRDs without vendor lock-in.',
    architecture:
      'FastAPI backend chunks multi-format documents into dense sentence-transformer embeddings indexed in ChromaDB, retrieves ranked context windows, and streams grounded responses into a Next.js split-pane editor across swappable LLM providers.',
    url: 'https://github.com/saksham-sammy/PM-Copilot',
  },
  {
    id: 'lectura',
    num: '03',
    name: 'Lectura',
    year: '2026',
    domain: 'Client-Side AI · Accessibility',
    stack: ['Next.js 16', 'Tesseract.js', 'PDF.js', 'Web Speech API'],
    metric: '100% in-browser OCR, PDF/DOCX parsing & synced neural voice playback — zero file uploads',
    summary:
      'An accessible reading and document extraction suite designed so sensitive scans and PDFs never leave the user’s device. Extracts text client-side and reads it aloud with adjustable cadence and dyslexia-friendly typography.',
    architecture:
      'Runs Tesseract.js Web Workers and PDF/DOCX parsers directly in browser memory for privacy-preserving extraction, paired with sentence-synced Web Speech synthesis and distraction-free reading controls.',
    url: 'https://github.com/saksham-sammy/Lectura',
  },
  {
    id: 'algovision',
    num: '04',
    name: 'AlgoVision V2',
    year: '2025',
    domain: 'Algorithms · CS Education',
    stack: ['C++', 'Flask', 'Canvas / JS', 'DSA'],
    metric: 'Live step-by-step execution & complexity visualizer for Sorting, Searching & Linear Structures',
    summary:
      'Built after learning C++ DSA the hard way through late-night pointer bugs. AlgoVision turns abstract swaps, comparisons, and memory pointers into interactive visual rhythms students can scrub through step by step.',
    architecture:
      'Captures deterministic execution snapshots for Sorting, Binary/Linear Search, Stacks, Queues, and Linked Lists so learners can pause, inspect comparisons, and feel time-complexity differences live.',
    url: 'https://github.com/saksham-sammy/AlgoVision',
    demo: 'https://algo-vision-theta.vercel.app/',
  },
  {
    id: 'svj-3d',
    num: '05',
    name: 'SVJ 3D & Exotica PCMC',
    year: '2025',
    domain: 'Commercial Client Shipping · WebGL',
    stack: ['Next.js', 'Three.js', 'Spline 3D', 'Node.js CSPRNG'],
    metric: 'Live paid production deployments for Suraj Verma Jewellers & Exotica PCMC',
    summary:
      'Real-world client software built end-to-end under Sam Web Solutions: a real-time 3D jewellery showcase for Suraj Verma Jewellers (@mr_surajvarma), an SSR Next.js production website for Exotica PCMC, and a cryptographically verified giveaway picker used on live streams.',
    architecture:
      'Balanced PBR specular fidelity with fast mobile load budgets for SVJ 3D, paired with Next.js SSR + Tailwind + Framer Motion for Exotica PCMC and Web Crypto CSPRNG fairness proofs for live client draws.',
    url: 'https://github.com/saksham-sammy/SVJ---3D',
    demo: 'https://svj-surajvermajewellers.vercel.app/',
    secondaryDemo: 'https://exotica-main.vercel.app/',
    secondaryDemoLabel: 'Exotica Live ↗',
  },
  {
    id: 'tensorvision',
    num: '06',
    name: 'TensorVision GPU Lab',
    year: '2026',
    domain: 'GPU Compute · Systems Benchmarking',
    stack: ['Python', 'PyTorch', 'NumPy', 'AMD ROCm'],
    metric: '10M-element CPU vs. vectorized compute benchmarks & interactive matrix lab',
    summary:
      'Built alongside earning my AMD ROCm Certified Associate credential — a hands-on laboratory for benchmarking pure-Python loops against vectorized NumPy/PyTorch tensor operations and exploring matrix math interactively.',
    architecture:
      'Benchmarks 10M-element workloads across scalar and vectorized kernels, exposing live speedup ratios, memory layout effects, and an in-browser Jupyter notebook explorer.',
    url: 'https://github.com/saksham-sammy/TensorVision',
  },
];

export const SPOTLIGHT_CREDENTIALS = [
  {
    title: 'AMD ROCm Certified Associate',
    issuer: 'AMD · GPU Compute',
    pdf: '/certificates/AMD ROCm Certified Associate.pdf',
  },
  {
    title: 'Red Hat System Administration I & II',
    issuer: 'Red Hat Enterprise Linux',
    pdf: '/certificates/Redhat System Administration 1.pdf',
  },
  {
    title: 'Google Cybersecurity Specialization',
    issuer: 'Google · 8-Course Track',
    pdf: '/certificates/Coursera Google Cybersecurity Specilization.pdf',
  },
  {
    title: 'Smart India Hackathon 2026 — Selected',
    issuer: 'Govt. of India · MIC (PCU Pune)',
    pdf: '/certificates/PCU-SIH26-052_Saksham_Sharma_Selection_Certificate.pdf',
  },
  {
    title: 'Meta Full-Stack & Front-End Web',
    issuer: 'Meta · Django, React & Git',
    pdf: '/certificates/Coursera Full stack development with Django.pdf',
  },
  {
    title: 'CCNA: Networking, Switching & Routing',
    issuer: 'Cisco / Logical Operations',
    pdf: '/certificates/Coursera CCNA Networking Basics, Switching, Addressing.pdf',
  },
];

export const ARCHITECTURE_LAYERS = [
  {
    index: 0,
    num: '01',
    title: 'Systems, DSA & Security',
    subtitle: 'Core CS rigor, Linux administration & defensive tooling',
    tools: ['C++ (DSA)', 'Python', 'Red Hat Linux', 'MySQL / SQLite', 'Threat Modeling', 'Chrome MV3', 'Pytest'],
    proof: 'PhishGuard pre-navigation ML blocker (63 tests, IEEE paper), VisCrypt visual cryptography, Red Hat SysAdmin I & II, Google Cybersecurity.',
  },
  {
    index: 1,
    num: '02',
    title: 'AI, RAG & GPU Compute',
    subtitle: 'Applied inference, vector search & privacy-first browser ML',
    tools: ['FastAPI', 'ChromaDB RAG', 'Scikit-Learn', 'PyTorch & NumPy', 'Tesseract OCR', 'AMD ROCm'],
    proof: 'PM-Copilot semantic PRD workbench, Lectura 100% client-side OCR reader, TensorVision 10M-op GPU benchmark lab, SIH ’26 selection.',
  },
  {
    index: 2,
    num: '03',
    title: 'Full-Stack & Interactive WebGL',
    subtitle: 'Fast, clean interfaces shipped to real businesses & users',
    tools: ['Next.js & React 19', 'TypeScript', 'Three.js & GLSL', 'Tailwind CSS', 'GSAP & Lenis', 'Node.js & Django'],
    proof: 'Paid client launches for Suraj Verma Jewellers (SVJ 3D) & Exotica PCMC, custom GLSL shader studies, 30+ shipped repositories.',
  },
];
