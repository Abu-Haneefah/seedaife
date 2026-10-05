'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TICKER, lerp, clampNum, isTouch, motionOff, debounce, goToSection } from '@/lib/ticker';
import { useTimeMode, TimeMode } from '@/lib/time-mode';

const COL = {
  plum: 0x2a1450,
  deep: 0x180a31,
  lime: 0xb8f23c,
  bright: 0xd9ff7a,
  lilac: 0xa98bff,
  cream: 0xfff8e7,
  coral: 0xff6f61,
};

const PLANETS = [
  { level: '101', name: 'Generative AI 101', meta: 'Intro to AI and core concepts | about 6 weeks', color: COL.lime, a: 0 },
  { level: '102', name: 'Generative AI 102', meta: 'AI tools for building | about 8 weeks', color: COL.lilac, a: (Math.PI * 2) / 3 },
  { level: '103', name: 'Generative AI 103', meta: 'AI agents and vibe coding | 10 to 12 weeks', color: COL.coral, a: (Math.PI * 4) / 3 },
];

const TIME_LINES: Record<TimeMode, string[]> = {
  morning: [
    "Good morning! Ready to build?",
    "Rise and shine, builder! Let's explore AI.",
    "Early bird vibes! Let's code something new.",
    "Pick a planet to start today's learning!",
    "Ask me anything about AI!",
  ],
  afternoon: [
    "Good afternoon! What are we creating?",
    "High-energy coding session ahead!",
    "Powering through the day with AI!",
    "Ready for a mission? Pick a planet!",
    "Let's build something awesome!",
  ],
  night: [
    "Night owl mode activated!",
    "Cosmic vibes tonight. The future never sleeps!",
    "Late night vibe coding with AI!",
    "Stargazing and learning generative AI.",
    "Ready for a late-night mission?",
  ],
};

const MODE_LIGHTS = {
  morning: {
    hemiSky: 0xffedd0,
    hemiGround: 0x251346,
    hemiIntensity: 0.95,
    keyColor: 0xffb84d,
    keyIntensity: 1.35,
    rimColor: 0xe099ff,
    rimIntensity: 0.95,
    fillColor: 0xff9922,
    fillIntensity: 0.65,
    fogColor: 0x251346,
  },
  afternoon: {
    hemiSky: 0xfff8e7,
    hemiGround: 0x180a31,
    hemiIntensity: 0.88,
    keyColor: 0xb8f23c,
    keyIntensity: 1.25,
    rimColor: 0xa98bff,
    rimIntensity: 1.05,
    fillColor: 0xb8f23c,
    fillIntensity: 0.65,
    fogColor: 0x2a1450,
  },
  night: {
    hemiSky: 0x7c5eff,
    hemiGround: 0x05010b,
    hemiIntensity: 0.65,
    keyColor: 0xb8f23c,
    keyIntensity: 1.4,
    rimColor: 0x9a44ff,
    rimIntensity: 1.55,
    fillColor: 0x3d0d6e,
    fillIntensity: 0.85,
    fogColor: 0x0b0416,
  },
};

export default function SeedbotScene({ onOpenCourseLevel }: { onOpenCourseLevel?: (level: string) => void }) {
  const { activeMode } = useTimeMode();
  const activeModeRef = useRef<TimeMode>(activeMode);
  activeModeRef.current = activeMode;
  const updateLightsRef = useRef<((mode: TimeMode, immediate?: boolean) => void) | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipTitleRef = useRef<HTMLElement>(null);
  const tipMetaRef = useRef<HTMLSpanElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    if (updateLightsRef.current) {
      updateLightsRef.current(activeMode, false);
    }
  }, [activeMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const small = () => window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let root: THREE.Group | null = null;
    let body: THREE.Group | null = null;
    let head: THREE.Group | null = null;
    let leaf: THREE.Mesh | null = null;
    let armL: THREE.Group | null = null;
    let armR: THREE.Group | null = null;
    let planetsGroup: THREE.Group | null = null;
    let hitBox: THREE.Mesh | null = null;
    let hemiLight: THREE.HemisphereLight | null = null;
    let keyLight: THREE.DirectionalLight | null = null;
    let rimLight: THREE.DirectionalLight | null = null;
    let fillLight: THREE.PointLight | null = null;

    const eyeballs: THREE.Mesh[] = [];
    const planets: Array<{
      holder: THREE.Group;
      ball: THREE.Mesh;
      ring: THREE.Mesh;
      hit: THREE.Mesh;
      data: (typeof PLANETS)[0];
      scale: number;
    }> = [];
    const clouds: Array<{ pts: THREE.Points; depth: number }> = [];
    const sparks: THREE.Sprite[] = [];

    let raycaster = new THREE.Raycaster();
    let built = false;
    let rendering = false;
    let tabVisible = true;
    let hovered = -1;
    let failed = false;

    const ptr = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    const ptrNorm = { x: 0, y: 0 };
    const targetScroll = { v: 0 };
    const smoothScroll = { v: 0 };
    let blinkAt = 1.8;
    let blinkT = -1;
    let spinT = -1;
    let waveT = -1;
    let pulse = 0;
    const clock = { t: 0 };
    let lastBubbleMsg = '';
    let bubbleTimeout: ReturnType<typeof setTimeout> | undefined;

    function roundedBox(w: number, h: number, d: number, r: number) {
      const rr = Math.min(r, Math.min(w, h) / 2 - 0.002);
      const x = -w / 2;
      const y = -h / 2;
      const s = new THREE.Shape();
      s.moveTo(x + rr, y);
      s.lineTo(x + w - rr, y);
      s.quadraticCurveTo(x + w, y, x + w, y + rr);
      s.lineTo(x + w, y + h - rr);
      s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
      s.lineTo(x + rr, y + h);
      s.quadraticCurveTo(x, y + h, x, y + h - rr);
      s.lineTo(x, y + rr);
      s.quadraticCurveTo(x, y, x + rr, y);
      const geo = new THREE.ExtrudeGeometry(s, {
        depth: Math.max(d - 0.06, 0.02),
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 3,
      });
      geo.center();
      return geo;
    }

    function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      return m;
    }

    function showBubble(text: string) {
      const b = bubbleRef.current;
      if (!b || !built || !root) return;
      b.textContent = text;
      b.hidden = false;
      b.classList.add('is-on');
      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        b.classList.remove('is-on');
        setTimeout(() => {
          if (!b.classList.contains('is-on')) b.hidden = true;
        }, 400);
      }, 2600);
    }

    function sparkBurst() {
      if (!built || !root) return;
      for (let i = 0; i < (small() ? 10 : 22); i++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: dotTexture(),
            color: i % 3 === 0 ? COL.lilac : COL.lime,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        s.scale.setScalar(0.2 + Math.random() * 0.18);
        s.position.set(0, 0.6, 0.4);
        s.userData.v = new THREE.Vector3((Math.random() - 0.5) * 3.6, Math.random() * 2.6 + 0.4, (Math.random() - 0.5) * 2);
        s.userData.life = 0.9 + Math.random() * 0.5;
        root.add(s);
        sparks.push(s);
      }
    }

    function reactToSeedbot() {
      spinT = 0;
      pulse = 1;
      sparkBurst();
      const currentLines = TIME_LINES[activeModeRef.current] || TIME_LINES.morning;
      let msg = currentLines[Math.floor(Math.random() * currentLines.length)];
      if (currentLines.length > 1 && msg === lastBubbleMsg) {
        msg = currentLines[(currentLines.indexOf(msg) + 1) % currentLines.length];
      }
      lastBubbleMsg = msg;
      showBubble(msg);
    }

    function pickPlanet(idx: number, fromClick: boolean) {
      const p = planets[idx];
      if (!p) return;
      if (fromClick) {
        if (onOpenCourseLevel) {
          onOpenCourseLevel(p.data.level);
        } else if (typeof (window as any).Landing?.openLevel === 'function') {
          (window as any).Landing.openLevel(p.data.level);
        }
        goToSection('courses');
        showBubble(p.data.name);
      }
    }

    function dotTexture() {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      if (g) {
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(217,255,122,1)');
        grad.addColorStop(0.42, 'rgba(184,242,60,.85)');
        grad.addColorStop(1, 'rgba(184,242,60,0)');
        g.fillStyle = grad;
        g.beginPath();
        g.arc(32, 32, 32, 0, Math.PI * 2);
        g.fill();
      }
      return new THREE.CanvasTexture(c);
    }

    function glyphTexture(text: string, color: string) {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d');
      if (g) {
        g.font = '600 62px Inter, system-ui, sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.shadowColor = color;
        g.shadowBlur = 16;
        g.fillStyle = color;
        g.fillText(text, 64, 66);
      }
      return new THREE.CanvasTexture(c);
    }

    function makeCloud(count: number, mat: THREE.Material, spread: [number, number, number], seedOnly: boolean) {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * spread[0];
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
        pos[i * 3 + 2] = -Math.random() * spread[2] + spread[2] * 0.25;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, mat);
      if (seedOnly) pts.userData.seed = true;
      return pts;
    }

    function buildSeedbot() {
      const lime = new THREE.MeshStandardMaterial({ color: COL.lime, roughness: 0.45, metalness: 0.1 });
      const plum = new THREE.MeshStandardMaterial({ color: COL.plum, roughness: 0.36, metalness: 0.16 });
      const eyeMat = new THREE.MeshStandardMaterial({
        color: COL.bright,
        emissive: COL.lime,
        emissiveIntensity: 0.9,
        roughness: 0.3,
      });

      root = new THREE.Group();
      root.position.set(1.9, 0.15, 0);
      body = new THREE.Group();
      head = new THREE.Group();
      root.add(body);
      body.add(head);

      head.add(mesh(roundedBox(2.02, 1.78, 1.2, 0.56), lime, 0, 0.6, 0));
      head.add(mesh(roundedBox(1.44, 0.86, 0.2, 0.34), plum, 0, 0.62, 0.57));

      [-0.31, 0.31].forEach((x) => {
        const e = mesh(roundedBox(0.22, 0.38, 0.12, 0.1), eyeMat, x, 0.63, 0.66);
        eyeballs.push(e);
        head!.add(e);
      });

      head.add(mesh(roundedBox(0.4, 0.78, 0.58, 0.18), lime, -1.14, 0.6, 0));
      head.add(mesh(roundedBox(0.4, 0.78, 0.58, 0.18), lime, 1.14, 0.6, 0));
      head.add(mesh(roundedBox(0.1, 0.3, 0.3, 0.05), plum, -1.33, 0.6, 0));
      head.add(mesh(roundedBox(0.1, 0.3, 0.3, 0.05), plum, 1.33, 0.6, 0));

      const stem = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.62, 12), lime, 0, 1.78, 0);
      head.add(stem);
      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.bezierCurveTo(0.1, 0.34, 0.5, 0.44, 0.82, 0.36);
      leafShape.bezierCurveTo(0.62, 0.02, 0.24, -0.06, 0, 0);
      const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
        depth: 0.09,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
        curveSegments: 10,
      });
      leafGeo.center();
      leaf = new THREE.Mesh(leafGeo, lime);
      leaf.position.set(0.36, 2.06, 0);
      leaf.rotation.z = 0.42;
      head.add(leaf);

      body.add(mesh(roundedBox(0.52, 0.26, 0.52, 0.09), plum, 0, -0.42, 0));
      body.add(mesh(roundedBox(1.62, 0.62, 0.86, 0.28), lime, 0, -0.86, 0));

      armL = new THREE.Group();
      armL.position.set(-0.9, -0.7, 0);
      armL.add(mesh(roundedBox(0.34, 1.1, 0.36, 0.16), lime, 0, -0.5, 0));
      body.add(armL);

      armR = new THREE.Group();
      armR.position.set(0.9, -0.7, 0);
      armR.add(mesh(roundedBox(0.34, 1.1, 0.36, 0.16), lime, 0, -0.5, 0));
      body.add(armR);

      scene!.add(root);
    }

    function buildPlanets() {
      planetsGroup = new THREE.Group();
      planetsGroup.rotation.x = -0.3;
      planetsGroup.rotation.z = 0.12;
      const R = small() ? 2.5 : 3.1;
      PLANETS.forEach((p, i) => {
        const holder = new THREE.Group();
        const ang = p.a;
        holder.position.set(Math.cos(ang) * R, Math.sin(ang * 2) * 0.34, Math.sin(ang) * R);

        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 26, 20),
          new THREE.MeshStandardMaterial({ color: p.color, emissive: p.color, emissiveIntensity: 0.42, roughness: 0.35 })
        );
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.47, 0.016, 8, 44),
          new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.7 })
        );
        ring.rotation.x = Math.PI / 2.35;

        const hit = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
        hit.userData.planet = i;

        holder.add(ball, ring, hit);
        planetsGroup!.add(holder);
        planets.push({ holder, ball, ring, hit, data: p, scale: 1 });
      });
      scene!.add(planetsGroup);
    }

    function buildParticles() {
      const mobile = small();
      const seedCount = mobile ? 90 : 230;
      const glyphCount = mobile ? 14 : 42;
      const seedMat = new THREE.PointsMaterial({
        size: 0.16,
        map: dotTexture(),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        opacity: 0.9,
      });
      clouds.push({ pts: makeCloud(seedCount, seedMat, [26, 16, 20], true), depth: 0.5 });

      const glyphs = [
        ['</>', '#B8F23C'],
        ['{ }', '#A98BFF'],
        ['AI', '#FFF8E7'],
      ];
      glyphs.forEach((g, i) => {
        const mat = new THREE.PointsMaterial({
          size: 0.62,
          map: glyphTexture(g[0], g[1]),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
          opacity: 0.72,
        });
        clouds.push({ pts: makeCloud(glyphCount, mat, [24, 14, 18], false), depth: 0.24 + i * 0.12 });
      });
      clouds.forEach((c) => {
        c.pts.position.z = -4;
        scene!.add(c.pts);
      });
    }

    function buildLights() {
      hemiLight = new THREE.HemisphereLight(COL.cream, COL.deep, 0.85);
      scene!.add(hemiLight);

      keyLight = new THREE.DirectionalLight(COL.lime, 1.15);
      keyLight.position.set(5, 6.5, 6);
      scene!.add(keyLight);

      rimLight = new THREE.DirectionalLight(COL.lilac, 0.95);
      rimLight.position.set(-6, 2.5, -5.5);
      scene!.add(rimLight);

      fillLight = new THREE.PointLight(COL.lime, 0.6, 20);
      fillLight.position.set(0, -2.5, 4);
      scene!.add(fillLight);
    }

    function applyTimeMode(mode: TimeMode, immediate = false) {
      const conf = MODE_LIGHTS[mode];
      if (!conf || !scene || !hemiLight || !keyLight || !rimLight || !fillLight) return;
      const dur = immediate ? 0 : 0.8;

      gsap.to(hemiLight.color, {
        r: ((conf.hemiSky >> 16) & 255) / 255,
        g: ((conf.hemiSky >> 8) & 255) / 255,
        b: (conf.hemiSky & 255) / 255,
        duration: dur,
      });
      gsap.to(hemiLight.groundColor, {
        r: ((conf.hemiGround >> 16) & 255) / 255,
        g: ((conf.hemiGround >> 8) & 255) / 255,
        b: (conf.hemiGround & 255) / 255,
        duration: dur,
      });
      gsap.to(hemiLight, { intensity: conf.hemiIntensity, duration: dur });

      gsap.to(keyLight.color, {
        r: ((conf.keyColor >> 16) & 255) / 255,
        g: ((conf.keyColor >> 8) & 255) / 255,
        b: (conf.keyColor & 255) / 255,
        duration: dur,
      });
      gsap.to(keyLight, { intensity: conf.keyIntensity, duration: dur });

      gsap.to(rimLight.color, {
        r: ((conf.rimColor >> 16) & 255) / 255,
        g: ((conf.rimColor >> 8) & 255) / 255,
        b: (conf.rimColor & 255) / 255,
        duration: dur,
      });
      gsap.to(rimLight, { intensity: conf.rimIntensity, duration: dur });

      gsap.to(fillLight.color, {
        r: ((conf.fillColor >> 16) & 255) / 255,
        g: ((conf.fillColor >> 8) & 255) / 255,
        b: (conf.fillColor & 255) / 255,
        duration: dur,
      });
      gsap.to(fillLight, { intensity: conf.fillIntensity, duration: dur });

      if (scene.fog && 'color' in scene.fog) {
        gsap.to(scene.fog.color, {
          r: ((conf.fogColor >> 16) & 255) / 255,
          g: ((conf.fogColor >> 8) & 255) / 255,
          b: (conf.fogColor & 255) / 255,
          duration: dur,
        });
      }
    }
    updateLightsRef.current = applyTimeMode;

    function updatePointer(clientX: number, clientY: number) {
      ptr.x = clientX;
      ptr.y = clientY;
      ptrNorm.x = (clientX / window.innerWidth) * 2 - 1;
      ptrNorm.y = -(clientY / window.innerHeight) * 2 + 1;
    }

    function updateHover() {
      if (!built || !planets.length || !camera) return;
      const t = tipRef.current;
      const hits = raycaster.intersectObjects(
        planets.map((p) => p.hit),
        false
      );
      const next = hits.length ? hits[0].object.userData.planet : -1;
      if (next !== hovered) {
        hovered = next;
        if (t) {
          if (hovered >= 0) {
            const d = planets[hovered].data;
            if (tipTitleRef.current) tipTitleRef.current.textContent = d.name;
            if (tipMetaRef.current) tipMetaRef.current.textContent = d.meta;
            t.hidden = false;
            t.classList.add('is-on');
          } else {
            t.classList.remove('is-on');
            t.hidden = true;
          }
        }
        document.body.style.cursor = hovered >= 0 ? 'pointer' : '';
      }
      if (hovered >= 0 && t) {
        const v = new THREE.Vector3();
        planets[hovered].ball.getWorldPosition(v);
        v.project(camera);
        t.style.left = (v.x * 0.5 + 0.5) * window.innerWidth + 'px';
        t.style.top = (-v.y * 0.5 + 0.5) * window.innerHeight + 'px';
      }
    }

    let _bubbleV: THREE.Vector3 | null = null;
    function updateBubble() {
      const b = bubbleRef.current;
      if (!b || !b.classList.contains('is-on') || !root || !camera) return;
      if (!_bubbleV) _bubbleV = new THREE.Vector3();
      root.getWorldPosition(_bubbleV);
      _bubbleV.y += 2.5 * root.scale.y;
      _bubbleV.project(camera);
      b.style.left = ((_bubbleV.x * 0.5 + 0.5) * window.innerWidth).toFixed(1) + 'px';
      b.style.top = ((-_bubbleV.y * 0.5 + 0.5) * window.innerHeight).toFixed(1) + 'px';
    }

    function step(dt: number) {
      if (!built || failed || !scene || !camera || !renderer || !root || !head || !leaf || !armL || !armR || !planetsGroup) return;

      clock.t += dt;
      look.x = lerp(look.x, ptrNorm.x, Math.min(dt * 4.2, 0.16));
      look.y = lerp(look.y, ptrNorm.y, Math.min(dt * 4.2, 0.16));
      smoothScroll.v = lerp(smoothScroll.v, targetScroll.v, Math.min(dt * 3.4, 0.12));

      raycaster.setFromCamera(new THREE.Vector2(ptrNorm.x, ptrNorm.y), camera);
      updateHover();

      const float = Math.sin(clock.t * 1.15) * 0.13;
      if (blinkT < 0) {
        blinkAt -= dt;
        if (blinkAt <= 0) {
          blinkT = 0;
          blinkAt = 2.4 + Math.random() * 2.8;
        }
      } else {
        blinkT += dt;
        const k = clampNum(blinkT / 0.16, 0, 1);
        const sy = 1 - Math.sin(k * Math.PI) * 0.9;
        eyeballs.forEach((e) => {
          e.scale.y = sy;
        });
        if (k >= 1) {
          blinkT = -1;
          eyeballs.forEach((e) => {
            e.scale.y = 1;
          });
        }
      }

      pulse = Math.max(0, pulse - dt * 0.9);
      const glow = 0.9 + pulse * 1.8 + Math.sin(clock.t * 2) * 0.06;
      eyeballs.forEach((e, i) => {
        (e.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
        e.position.x = (i === 0 ? -0.31 : 0.31) + look.x * 0.05;
        e.position.y = 0.63 + look.y * 0.04;
      });

      head.rotation.y = look.x * 0.46;
      head.rotation.x = look.y * 0.26;
      leaf.rotation.z = 0.42 + Math.sin(clock.t * 1.7) * 0.14;

      let spinAngle = 0;
      if (spinT >= 0) {
        spinT += dt;
        const sp = Math.min(spinT / 1.15, 1);
        spinAngle = (1 - Math.pow(1 - sp, 3)) * Math.PI * 2;
        if (sp >= 1) spinT = -1;
      }
      root.rotation.y = Math.sin(clock.t * 0.28) * 0.16 + spinAngle;

      if (waveT >= 0) {
        waveT += dt;
        if (waveT > 2.6) {
          waveT = -1;
          armR.rotation.z = 0;
        } else {
          const decay = clampNum(1 - waveT / 2.6, 0, 1);
          armR.rotation.z = -(1.15 + Math.sin(waveT * 9) * 0.42) * decay;
        }
      }
      armL.rotation.z = Math.sin(clock.t * 0.9) * 0.08;

      const s = smoothScroll.v;
      let px: number, py: number, ps: number;
      if (small()) {
        px = 1.5;
        py = -1.25 + float * 0.6;
        ps = 0.5;
      } else if (s < 0.32) {
        const k = s / 0.32;
        px = 1.95;
        py = 0.2 - k * 0.25 + float;
        ps = 1 - k * 0.1;
      } else if (s < 0.55) {
        const k = (s - 0.32) / 0.23;
        px = lerp(1.95, -3.5, k);
        py = lerp(-0.05, -0.15, k) + float;
        ps = lerp(0.9, 0.78, k);
      } else {
        const k = clampNum((s - 0.55) / 0.45, 0, 1);
        px = lerp(-3.5, 3.5, k);
        py = lerp(-0.15, -1.5, k) + float;
        ps = lerp(0.78, 0.4, k);
      }
      root.position.set(px + ptrNorm.x * 0.28, py, 0);
      root.scale.setScalar(ps);
      updateBubble();

      camera.position.z = lerp(9.4, 12.4, s);
      camera.position.y = lerp(0.4, 0.05, s);
      camera.lookAt(0, lerp(0.25, -0.3, s), 0);

      const pVis = small() ? 0.001 : clampNum(1 - (s - 0.42) / 0.24, 0, 1);
      planetsGroup.scale.setScalar(Math.max(pVis, 0.001));
      planetsGroup.rotation.y += dt * (hovered >= 0 ? 0.05 : 0.24);
      planets.forEach((p, i) => {
        p.scale = lerp(p.scale, i === hovered ? 1.55 : 1, Math.min(dt * 5, 0.2));
        p.ball.scale.setScalar(p.scale);
        p.ring.scale.setScalar(p.scale);
        p.ring.rotation.z += dt * 0.6;
      });

      clouds.forEach((c) => {
        c.pts.rotation.y += dt * 0.02;
        c.pts.position.x = lerp(c.pts.position.x, -ptrNorm.x * 3.4 * c.depth, Math.min(dt * 2, 0.08));
        c.pts.position.y = lerp(c.pts.position.y, -ptrNorm.y * 1.9 * c.depth, Math.min(dt * 2, 0.08));
      });

      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.userData.life -= dt;
        sp.userData.v.y -= dt * 1.4;
        sp.position.addScaledVector(sp.userData.v, dt);
        sp.material.opacity = clampNum(sp.userData.life, 0, 1);
        if (sp.userData.life <= 0) {
          root.remove(sp);
          sp.material.dispose();
          sparks.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }

    function onResize() {
      if (!camera || !renderer) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
    }

    function syncLoop() {
      const want = built && tabVisible && !failed && !motionOff();
      if (want && !rendering) {
        rendering = true;
        TICKER.add(step);
      } else if (!want && rendering) {
        rendering = false;
        TICKER.remove(step);
      }
    }

    function onSceneTap(e: PointerEvent) {
      if (!built || !tabVisible || !camera) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('a,button,input,select,textarea,label,.modal,.mobile-menu,.chat,.workshop-form')) {
        return;
      }
      updatePointer(e.clientX, e.clientY);
      raycaster.setFromCamera(new THREE.Vector2(ptrNorm.x, ptrNorm.y), camera);

      const hits = raycaster.intersectObjects(
        planets.map((p) => p.hit),
        false
      );
      if (hits.length) {
        pickPlanet(hits[0].object.userData.planet, true);
        return;
      }
      if (hitBox && raycaster.intersectObject(hitBox, false).length) {
        reactToSeedbot();
      }
    }

    function init() {
      if (built || failed) return;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: canvas || undefined,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setClearColor(0x000000, 0);
      } catch {
        failed = true;
        setFallbackActive(true);
        return;
      }

      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(COL.plum, 13, 34);
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 90);
      camera.position.set(0, 0.4, 9.4);
      camera.lookAt(0, 0.25, 0);

      buildLights();
      applyTimeMode(activeModeRef.current, true);
      buildSeedbot();
      buildPlanets();
      buildParticles();

      hitBox = new THREE.Mesh(roundedBox(2.9, 3.5, 1.6, 0.4), new THREE.MeshBasicMaterial({ visible: false }));
      hitBox.position.set(0, 0.1, 0);
      body!.add(hitBox);

      built = true;
      onResize();
      if (!motionOff()) waveT = 0;
      syncLoop();
    }

    if (motionOff()) {
      setFallbackActive(true);
    } else {
      init();
    }

    const handlePointerMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', onSceneTap, { passive: true });
    const debouncedResize = debounce(onResize, 180);
    window.addEventListener('resize', debouncedResize);

    const handleVisibility = () => {
      tabVisible = !document.hidden;
      syncLoop();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let scrollTriggerInst: ScrollTrigger | null = null;
    const landingEl = document.querySelector('[data-view="landing"]') || document.body;
    if (landingEl) {
      scrollTriggerInst = ScrollTrigger.create({
        trigger: landingEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          targetScroll.v = self.progress;
        },
      });
    }

    // Expose global api for chat spark bursts & speech bubbles
    (window as any).Scene3D = {
      api: () => ({ showBubble, sparkBurst }),
      reduced: () => {
        syncLoop();
        setFallbackActive(motionOff());
      },
      refresh: onResize,
    };

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', onSceneTap);
      window.removeEventListener('resize', debouncedResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (scrollTriggerInst) scrollTriggerInst.kill();
      clearTimeout(bubbleTimeout);
      updateLightsRef.current = null;
      TICKER.remove(step);

      if (scene) {
        scene.traverse((o: any) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m: any) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          }
        });
      }
      renderer?.dispose();
    };
  }, [onOpenCourseLevel]);

  return (
    <div className="scene-layer" id="sceneLayer" aria-hidden="true">
      <canvas ref={canvasRef} id="seedbotCanvas" hidden={fallbackActive} />
      <div ref={fallbackRef} className={`scene-fallback${fallbackActive ? ' is-on' : ''}`} id="sceneFallback">
        <svg className="fallback-bot" viewBox="0 0 200 200">
          <use href="#seedai-mark" />
        </svg>
      </div>
      <div ref={bubbleRef} className="bubble" id="bubble" hidden />
      <div ref={tipRef} className="planet-tip" id="planetTip" hidden>
        <strong ref={tipTitleRef} className="tip-title" id="planetTipTitle" />
        <span ref={tipMetaRef} className="tip-meta" id="planetTipMeta" />
      </div>
    </div>
  );
}
