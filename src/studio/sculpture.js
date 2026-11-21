/**
 * "The Living Extruded Blueprint" — Single-World Real-Time 3D Studio Canvas
 *
 * Uses Three.js SVGLoader + ExtrudeGeometry + ONE signature custom GLSL shader material:
 * frosted obsidian glass / brushed ceramic monolith with Fresnel rim lighting,
 * subtle chromatic dispersion along grazing angles, cursor-reactive specular sheen,
 * and surgical blueprint wireframe edges that dissolve cleanly as 2D extrudes into 3D.
 */
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import gsap from 'gsap';
import { BLUEPRINT_SVGS } from './blueprints.js';

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 mvPos = viewMatrix * worldPos;
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uAccent;
  uniform vec3 uRimTint;
  uniform float uExtrudeProgress;
  uniform float uHighlight;
  uniform float uOpacity;

  varying vec3 vNormalW;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  // Lightweight procedural micro-grain for brushed ceramic / frosted obsidian feel
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vViewPos);

    // Dual studio softbox lights + cursor-reactive specular key light
    vec3 L1 = normalize(vec3(2.8 + uPointer.x * 2.4, 3.2 + uPointer.y * 1.8, 4.2));
    vec3 L2 = normalize(vec3(-3.4, -1.6, 2.2));
    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);

    float ndl1 = max(dot(N, L1), 0.0);
    float ndl2 = max(dot(N, L2), 0.0);
    float spec1 = pow(max(dot(N, H1), 0.0), 42.0);
    float spec2 = pow(max(dot(N, H2), 0.0), 18.0);

    // Physical Fresnel rim with delicate chromatic dispersion (Igloo-inspired restraint)
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.1);
    float fresnelR = pow(1.0 - max(dot(N, normalize(V + vec3(0.018, 0.0, 0.0))), 0.0), 3.2);
    float fresnelB = pow(1.0 - max(dot(N, normalize(V - vec3(0.018, 0.008, 0.0))), 0.0), 3.0);

    // Brushed ceramic micro-anisotropy along horizontal grooves
    float grain = (hash(floor(vWorldPos.xy * 110.0)) - 0.5) * 0.025;
    float sheenBand = smoothstep(0.65, 1.0, sin(vWorldPos.y * 2.4 - uTime * 0.45 + uPointer.x * 1.4) * 0.5 + 0.5);

    // Base frosted obsidian charcoal
    vec3 baseCol = vec3(0.055, 0.058, 0.072) + grain;
    vec3 diffuse = baseCol * (0.45 + 0.65 * ndl1) + vec3(0.045, 0.047, 0.056) * ndl2;

    // Chromatic glass refraction edge (restrained alabaster + subtle warm/cool dispersion)
    vec3 dispRim = vec3(fresnelR, fresnel, fresnelB) * mix(uRimTint, uAccent, 0.35 + uHighlight * 0.45);
    vec3 specular = vec3(0.96, 0.95, 0.92) * spec1 * (0.42 + 0.32 * uExtrudeProgress)
                  + uAccent * spec2 * 0.16;

    // Subtle internal frosted glow when hovered or highlighted in Act III
    vec3 innerGlow = uAccent * (0.04 + 0.09 * sheenBand) * (0.35 + uHighlight * 1.35);

    vec3 col = diffuse + dispRim * (0.62 + 0.45 * uHighlight) + specular + innerGlow;

    // Subtle studio depth fog toward deep matte charcoal (#0A0A0C)
    float depthFade = smoothstep(-7.5, 2.5, vWorldPos.z);
    col = mix(vec3(0.039, 0.039, 0.047), col, clamp(depthFade, 0.35, 1.0));

    gl_FragColor = vec4(col, uOpacity);
  }
`;

export function createBlueprintSculpture(canvas) {
  const isMobile = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 0, isMobile ? 10.6 : 8.8);

  const root = new THREE.Group();
  scene.add(root);

  // Subtle ambient architectural reference rings (razor-thin hairlines in studio background)
  const gridGroup = new THREE.Group();
  const ringMat = new THREE.LineBasicMaterial({
    color: 0xf4f3ef,
    transparent: true,
    opacity: 0.065,
  });
  for (const r of [2.65, 3.6]) {
    const pts = [];
    const segs = isMobile ? 64 : 120;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -1.8));
    }
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
  }
  // Hairline cross axes
  const axisPts = [
    new THREE.Vector3(-4.4, 0, -1.8), new THREE.Vector3(4.4, 0, -1.8),
    new THREE.Vector3(0, -3.8, -1.8), new THREE.Vector3(0, 3.8, -1.8),
  ];
  gridGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(axisPts), ringMat));
  scene.add(gridGroup);

  // Shared signature frosted-obsidian glass shader factory
  const baseUniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uAccent: { value: new THREE.Color('#E8DFCE') },
    uRimTint: { value: new THREE.Color('#F4F3EF') },
    uExtrudeProgress: { value: 0.08 },
    uHighlight: { value: 0.0 },
    uOpacity: { value: 0.96 },
  };

  function makeGlassMaterial(extra = {}) {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: baseUniforms.uTime,
        uPointer: baseUniforms.uPointer,
        uAccent: baseUniforms.uAccent,
        uRimTint: baseUniforms.uRimTint,
        uExtrudeProgress: baseUniforms.uExtrudeProgress,
        uHighlight: { value: extra.highlight ?? 0.0 },
        uOpacity: { value: extra.opacity ?? 0.96 },
      },
    });
  }

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xf4f3ef,
    transparent: true,
    opacity: 0.34,
  });

  const loader = new SVGLoader();

  /** Build a normalized, centered extruded mesh + hairline blueprint wireframe from an SVG string */
  function buildGlyphGroup(svgStr, { depth = 26, bevel = 2.2, scale = 0.022, mat = null } = {}) {
    const parsed = loader.parse(svgStr);
    const grp = new THREE.Group();
    const material = mat || makeGlassMaterial();
    const curveSegments = isMobile ? 8 : 16;

    for (const path of parsed.paths) {
      const shapes = SVGLoader.createShapes(path);
      for (const shape of shapes) {
        const geom = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelThickness: bevel,
          bevelSize: bevel * 0.75,
          bevelSegments: isMobile ? 2 : 3,
          curveSegments,
        });
        // Center 200x200 SVG space around origin & flip Y for Three.js coordinates
        geom.translate(-100, -100, -depth * 0.5);
        geom.scale(scale, -scale, scale);
        geom.computeVertexNormals();

        const mesh = new THREE.Mesh(geom, material);
        grp.add(mesh);

        const edges = new THREE.EdgesGeometry(geom, 24);
        const line = new THREE.LineSegments(edges, edgeMat);
        grp.add(line);
      }
    }
    return { group: grp, material };
  }

  // Build primary morphable glyphs (monolith + 5 flagship project emblems)
  const glyphKeys = ['monolith', 'pmCopilot', 'phishGuard', 'lectura', 'algoVision', 'svj3d'];
  const glyphNodes = {};
  const primaryHolder = new THREE.Group();
  root.add(primaryHolder);

  for (const key of glyphKeys) {
    const built = buildGlyphGroup(BLUEPRINT_SVGS[key], { depth: 28, bevel: 2.0, scale: 0.0215 });
    built.group.visible = key === 'monolith';
    built.group.scale.set(1, 1, 0.06); // Starts near-flat 2D architectural blueprint!
    primaryHolder.add(built.group);
    glyphNodes[key] = built;
  }

  // Build Act III Exploded Isometric Blueprint Stack (3 Z-separated ceramic plates)
  const layersHolder = new THREE.Group();
  layersHolder.visible = false;
  root.add(layersHolder);

  const layerKeys = ['layerSystems', 'layerAi', 'layerWebgl'];
  const layerNodes = layerKeys.map((k, idx) => {
    const mat = makeGlassMaterial({ opacity: 0.94, highlight: idx === 0 ? 0.5 : 0.0 });
    const built = buildGlyphGroup(BLUEPRINT_SVGS[k], { depth: 12, bevel: 1.4, scale: 0.0195, mat });
    built.baseZ = (1 - idx) * 1.15;
    built.group.position.z = 0;
    layersHolder.add(built.group);
    return built;
  });

  // Subtle floating studio dust motes (very sparse, alabaster hairline specs)
  const dustCount = isMobile ? 35 : 75;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 13;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 8.5;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1.5;
  }
  const dustGeom = new THREE.BufferGeometry();
  dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xf4f3ef,
    size: 0.028,
    transparent: true,
    opacity: 0.24,
  });
  const dust = new THREE.Points(dustGeom, dustMat);
  scene.add(dust);

  // Interactive state
  let activeGlyph = 'monolith';
  let scrollProgress = 0; // 0..1 across all 5 acts
  let activeLayerIdx = 0;
  let zenMode = false;
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  const zenRot = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  const pointerSmooth = { x: 0, y: 0 };

  // Act-based restrained studio lighting shifts (warm platinum -> cool slate -> alabaster)
  const actAccents = [
    new THREE.Color('#E8DFCE'), // Act I: Warm Alabaster
    new THREE.Color('#CFD8E3'), // Act II: Architectural Slate
    new THREE.Color('#DED8CC'), // Act III: Brushed Ceramic
    new THREE.Color('#BFC4CE'), // Act IV: Editorial Steel
    new THREE.Color('#EDE5D6'), // Act V: Serene Ivory
  ];
  const tempColor = new THREE.Color();

  function setGlyph(key) {
    if (!glyphNodes[key] || key === activeGlyph) return;
    const prev = glyphNodes[activeGlyph];
    const next = glyphNodes[key];
    activeGlyph = key;

    gsap.killTweensOf(prev.group.scale);
    gsap.killTweensOf(prev.material.uniforms.uOpacity);
    gsap.to(prev.material.uniforms.uOpacity, {
      value: 0,
      duration: 0.26,
      ease: 'power2.in',
      onComplete: () => { prev.group.visible = false; },
    });

    next.group.visible = true;
    next.material.uniforms.uOpacity.value = 0;
    const curZ = Math.max(0.18, baseUniforms.uExtrudeProgress.value);
    next.group.scale.set(0.92, 0.92, curZ);
    gsap.to(next.group.scale, { x: 1, y: 1, duration: 0.55, ease: 'power3.out' });
    gsap.to(next.material.uniforms.uOpacity, { value: 0.96, duration: 0.42, ease: 'power2.out' });
    gsap.fromTo(next.material.uniforms.uHighlight, { value: 0.95 }, { value: 0.2, duration: 0.85, ease: 'power2.out' });
  }

  function setActiveLayer(idx) {
    activeLayerIdx = idx;
    layerNodes.forEach((node, i) => {
      gsap.to(node.material.uniforms.uHighlight, {
        value: i === idx ? 0.95 : 0.0,
        duration: 0.45,
        ease: 'power2.out',
      });
      gsap.to(node.group.scale, {
        x: i === idx ? 1.06 : 0.96,
        y: i === idx ? 1.06 : 0.96,
        duration: 0.45,
        ease: 'power3.out',
      });
    });
  }

  function setScrollProgress(p) {
    scrollProgress = Math.max(0, Math.min(1, p));
  }

  function setZenMode(enabled) {
    zenMode = Boolean(enabled);
    if (!zenMode) {
      gsap.to(zenRot, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' });
    }
  }

  // Pointer parallax & Zen orbit drag
  function onPointerMove(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerTarget.x = nx;
    pointerTarget.y = ny;
    if (zenMode && dragging) {
      zenRot.y += (e.clientX - dragStart.x) * 0.0065;
      zenRot.x += (e.clientY - dragStart.y) * 0.0065;
      dragStart = { x: e.clientX, y: e.clientY };
    }
  }
  function onPointerDown(e) {
    if (!zenMode) return;
    dragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp() {
    dragging = false;
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });

  function onResize() {
    const mobile = window.innerWidth < 768;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  let rafId = 0;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    baseUniforms.uTime.value = t;

    pointerSmooth.x += (pointerTarget.x - pointerSmooth.x) * 0.06;
    pointerSmooth.y += (pointerTarget.y - pointerSmooth.y) * 0.06;
    baseUniforms.uPointer.value.set(pointerSmooth.x, pointerSmooth.y);

    // Smooth act-based accent tint interpolation
    const actFloat = scrollProgress * 4;
    const actA = Math.min(4, Math.floor(actFloat));
    const actB = Math.min(4, actA + 1);
    tempColor.copy(actAccents[actA]).lerp(actAccents[actB], actFloat - actA);
    baseUniforms.uAccent.value.copy(tempColor);

    // 2D-to-3D Extrusion curve: flat razor blueprint at scroll=0 -> solid glass monolith by Act I end
    const extrude = THREE.MathUtils.clamp(0.06 + scrollProgress * 4.4, 0.06, 1.15);
    baseUniforms.uExtrudeProgress.value = extrude;

    const activeNode = glyphNodes[activeGlyph];
    if (activeNode) {
      activeNode.group.scale.z += (extrude - activeNode.group.scale.z) * 0.09;
    }

    // Blueprint wireframe hairlines are crisp in 2D and soften gracefully into subtle bevel lines in 3D
    edgeMat.opacity = THREE.MathUtils.lerp(0.46, 0.17, Math.min(1, scrollProgress * 4.5));

    // Exploded Isometric Layers (Act III window: scrollProgress 0.44 .. 0.72)
    const inAct3 = scrollProgress > 0.43 && scrollProgress < 0.73;
    const explodeAmt = inAct3
      ? Math.sin(((scrollProgress - 0.43) / 0.3) * Math.PI)
      : 0;

    if (explodeAmt > 0.14 && !zenMode) {
      primaryHolder.visible = false;
      layersHolder.visible = true;
      layerNodes.forEach((node, idx) => {
        const targetZ = (1 - idx) * 1.25 * explodeAmt;
        const liftX = idx === activeLayerIdx ? 0.24 : 0;
        node.group.position.z += (targetZ - node.group.position.z) * 0.08;
        node.group.position.x += (liftX - node.group.position.x) * 0.08;
      });
    } else {
      primaryHolder.visible = true;
      layersHolder.visible = false;
    }

    // Scroll-driven camera choreography across the 5 Acts
    let targetPosX = 0;
    let targetPosY = 0;
    let targetCamZ = isMobile ? 10.6 : 8.8;
    let targetRotX = 0;
    let targetRotY = 0;

    if (zenMode) {
      targetPosX = 0;
      targetPosY = 0;
      targetCamZ = isMobile ? 9.2 : 7.4;
      targetRotX = zenRot.x;
      targetRotY = zenRot.y + t * 0.14;
    } else if (scrollProgress < 0.22) {
      // Act I — Centered living blueprint extruding as you scroll
      const p = scrollProgress / 0.22;
      targetPosX = THREE.MathUtils.lerp(0, 1.35, p);
      targetRotY = p * 0.48 + Math.sin(t * 0.35) * 0.06;
      targetRotX = p * 0.18 + Math.cos(t * 0.28) * 0.04;
      targetCamZ = (isMobile ? 10.6 : 8.8) - p * 0.7;
    } else if (scrollProgress < 0.45) {
      // Act II — Flagship Deck: monolith frames right side & morphs per hovered project
      const p = (scrollProgress - 0.22) / 0.23;
      targetPosX = isMobile ? 0 : THREE.MathUtils.lerp(1.45, 1.75, p);
      targetPosY = 0.08;
      targetRotY = 0.48 + p * 0.65 + Math.sin(t * 0.3) * 0.08;
      targetRotX = 0.16 + Math.cos(t * 0.25) * 0.05;
      targetCamZ = isMobile ? 10.4 : 8.4;
    } else if (scrollProgress < 0.72) {
      // Act III — Exploded Isometric Blueprint Stack
      targetPosX = isMobile ? 0 : -1.55;
      targetPosY = 0.05;
      targetRotX = 0.46;
      targetRotY = -0.64 + Math.sin(t * 0.25) * 0.06;
      targetCamZ = isMobile ? 11.2 : 9.1;
    } else if (scrollProgress < 0.89) {
      // Act IV — Recedes calmly behind the Swiss Index table
      targetPosX = 0;
      targetPosY = -0.25;
      targetRotY = t * 0.12;
      targetRotX = 0.12;
      targetCamZ = isMobile ? 12.2 : 10.6;
    } else {
      // Act V — Serene closing monolith
      targetPosX = 0;
      targetPosY = 0.15;
      targetRotY = t * 0.18;
      targetRotX = 0.18;
      targetCamZ = isMobile ? 10.2 : 8.5;
    }

    root.position.x += (targetPosX - root.position.x) * 0.06;
    root.position.y += (targetPosY - root.position.y) * 0.06;
    root.rotation.x += (targetRotX - pointerSmooth.y * 0.14 - root.rotation.x) * 0.06;
    root.rotation.y += (targetRotY + pointerSmooth.x * 0.22 - root.rotation.y) * 0.06;
    camera.position.z += (targetCamZ - camera.position.z) * 0.06;

    gridGroup.rotation.z = t * 0.015;
    dust.rotation.y = t * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  return {
    setGlyph,
    setActiveLayer,
    setScrollProgress,
    setZenMode,
    dispose() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
  };
}
