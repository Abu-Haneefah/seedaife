
"use strict";

/* ================================ CONFIG ================================
   Values come from THREE places, checked in this order:
   1) env.js  -> window.__SEEDAI_ENV__ (loaded first; works on file:// too)
   2) ".env"   -> fetched by bootstrap() when served over http(s)
   3) the bracketed fallbacks below, if a value is still missing.
   Keep env.js and .env in sync.
   Only public values belong here: the Supabase ANON key (never the
   service-role key), the contact email, the WhatsApp number and socials.
   WhatsApp links use https://wa.me/ plus the number in digits only.
   ======================================================================== */
const ENV = (typeof window !== "undefined" && window.__SEEDAI_ENV__) || {};
function envVal(key, fallback) {
  const v = ENV[key];
  if (typeof v === "string" && v.trim() !== "" && !/^\[.*\]$/.test(v.trim())) return v.trim();
  return fallback;
}
const CONFIG = {
  SUPABASE_URL: envVal("SUPABASE_URL", "[SUPABASE_URL]"),
  SUPABASE_ANON_KEY: envVal("SUPABASE_ANON_KEY", "[SUPABASE_ANON_KEY]"),
  SEEDAI_EMAIL: envVal("SEEDAI_EMAIL", "[SEEDAI_EMAIL]"),
  WHATSAPP_NUMBER: envVal("WHATSAPP_NUMBER", "[WHATSAPP_NUMBER]"),
  INSTAGRAM_URL: envVal("INSTAGRAM_URL", ""),
  YOUTUBE_URL: envVal("YOUTUBE_URL", ""),
  LINKEDIN_URL: envVal("LINKEDIN_URL", ""),
  SITE_URL: envVal("SITE_URL", "")
};
/* .env loader: plain KEY=value lines, # comments, optional quotes or a
   leading "export ". Fetches ".env" next to index.html (local server or
   static hosting). On file:// or when the file is missing it simply keeps
   the fallbacks, so Stage 1 still works with no keys at all. */
const ENV_KEYS = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SEEDAI_EMAIL", "WHATSAPP_NUMBER", "INSTAGRAM_URL", "YOUTUBE_URL", "LINKEDIN_URL", "SITE_URL"];
function parseEnv(text) {
  const out = {};
  String(text || "").split(/\r?\n/).forEach(function (line) {
    const s = String(line).trim();
    if (!s || s.charAt(0) === "#") return;
    const body = s.replace(/^export\s+/, "");
    const i = body.indexOf("=");
    if (i < 1) return;
    const key = body.slice(0, i).trim();
    let val = body.slice(i + 1).trim();
    if (val.length > 1 && ((val.charAt(0) === '"' && val.slice(-1) === '"') || (val.charAt(0) === "'" && val.slice(-1) === "'"))) val = val.slice(1, -1);
    if (!/^[A-Z0-9_]+$/.test(key)) return;
    val = val.trim();
    if (val && !/^\[.*\]$/.test(val) && ENV_KEYS.indexOf(key) > -1) out[key] = val;
  });
  return out;
}
function bootEnv() {
  if (typeof fetch !== "function") return Promise.resolve(false);
  let timer = null;
  let ctrl = null;
  try { ctrl = new AbortController(); } catch (err) { ctrl = null; }
  const opts = { cache: "no-store" };
  if (ctrl) { opts.signal = ctrl.signal; timer = setTimeout(function () { try { ctrl.abort(); } catch (err2) {} }, 2500); }
  return fetch(".env", opts)
    .then(function (res) { if (!res || !res.ok) return null; return res.text(); })
    .then(function (text) {
      if (timer) clearTimeout(timer);
      if (!text) return false;
      const vals = parseEnv(text);
      let changed = false;
      ENV_KEYS.forEach(function (k) {
        if (vals[k] && CONFIG[k] !== vals[k]) { CONFIG[k] = vals[k]; changed = true; }
      });
      return changed;
    })
    .catch(function () { if (timer) clearTimeout(timer); return false; });
}

/* ================================= UTILS =============================== */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const lerp = (a, b, t) => a + (b - a) * t;
const clampNum = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const isPlaceholder = (v) => !v || /^\[.*\]$/.test(String(v).trim());
const digitsOnly = (v) => String(v || "").replace(/\D/g, "");
const isTouch = () => window.matchMedia("(hover: none)").matches;

function debounce(fn, wait) {
  let t;
  return function () {
    const args = arguments, ctx = this;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(ctx, args); }, wait || 150);
  };
}
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function motionOff() {
  return STATE.reducedMotion || document.documentElement.classList.contains("reduce-motion");
}
function waLink(text) {
  const n = digitsOnly(CONFIG.WHATSAPP_NUMBER);
  return n ? "https://wa.me/" + n + (text ? "?text=" + encodeURIComponent(text) : "") : "";
}
function mailLink(subject) {
  if (isPlaceholder(CONFIG.SEEDAI_EMAIL)) return "";
  return "mailto:" + CONFIG.SEEDAI_EMAIL + (subject ? "?subject=" + encodeURIComponent(subject) : "");
}
/* Only http(s) URLs from CONFIG are allowed into an href. Everything else
   (missing, a placeholder, or anything such as javascript:) returns "". */
function safeUrl(v) {
  const s = String(v || "").trim();
  if (!s || isPlaceholder(s)) return "";
  return /^https?:\/\/[^\s]+$/i.test(s) ? s : "";
}
function goToSection(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 78;
  window.scrollTo({ top: top, behavior: motionOff() ? "auto" : "smooth" });
}

/* ONE shared requestAnimationFrame loop for the whole site.
   GSAP keeps its own internal ticker; everything custom registers here. */
const TICKER = (function () {
  const fns = [];
  let raf = 0, last = 0;
  function loop(t) {
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    for (let i = 0; i < fns.length; i++) fns[i](dt, t);
    raf = requestAnimationFrame(loop);
  }
  return {
    add: function (fn) { if (fns.indexOf(fn) === -1) fns.push(fn); },
    remove: function (fn) { const i = fns.indexOf(fn); if (i > -1) fns.splice(i, 1); },
    start: function () { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } },
    stop: function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    running: function () { return !!raf; }
  };
})();

/* ================================= STATE =============================== */
const STATE = {
  route: "/",
  view: "landing",
  reducedMotion: false,
  user: null,
  session: null,
  sceneReady: false
};

/* ================================ ROUTER ===============================
   Hash router. "#/" style hashes are routes; plain "#section" hashes are
   in-page anchors on the landing view. Route guards arrive in Stage 4.
   ======================================================================= */
const ROUTES = {
  "/": { view: "landing", title: "Seed AI Academy | Learn AI. Build with AI. Grow with AI." },
  "/register": { view: "register", title: "Register | Seed AI Academy" },
  "/login": { view: "login", title: "Login | Seed AI Academy" }
};
const DEFAULT_ROUTE = "/";

const ROUTER = (function () {
  function hashPath() {
    const h = window.location.hash || "";
    return h.indexOf("#/") === 0 ? h.slice(1) : null;
  }
  function anchorId() {
    const h = window.location.hash || "";
    return h.indexOf("#/") === 0 ? null : h.replace(/^#/, "");
  }
  function resolve(path) {
    const clean = (path || "/").split("?")[0];
    return ROUTES[clean] ? clean : DEFAULT_ROUTE;
  }
  function navigate(path) {
    if (("#" + path) === window.location.hash) { render(); return; }
    window.location.hash = "#" + path;
  }
  function render() {
    const path = resolve(hashPath());
    const route = ROUTES[path];
    const anchor = anchorId();

    STATE.route = path;
    STATE.view = route.view;

    $$(".view").forEach(function (v) {
      const active = v.getAttribute("data-view") === route.view;
      v.hidden = !active;
      v.classList.toggle("is-active", active);
    });

    document.title = route.title;
    const layer = $("#sceneLayer");
    if (layer) layer.hidden = route.view !== "landing";

    closeMobileMenu();
    const el = anchor ? document.getElementById(anchor) : null;
    if (route.view === "landing") {
      if (el) window.setTimeout(function () { goToSection(el); }, 60);
      else window.scrollTo({ top: 0, behavior: "auto" });
      if (window.Scene3D) Scene3D.onEnter();
      if (window.Landing) Landing.refresh();
      if (window.GSAPRefresh) window.GSAPRefresh();
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
      if (window.Scene3D) Scene3D.onExit();
    }
  }
  return {
    render: render,
    navigate: navigate,
    start: function () {
      window.addEventListener("hashchange", render);
      render();
    }
  };
})();

/* =============================== SUPABASE ==============================
   Stage 2 owns this. Nothing here runs while the CONFIG placeholders are
   empty, so Stage 1 works with no Supabase keys at all.
   ======================================================================= */
const SUPABASE = {
  client: null,
  ready: function () {
    return !!(this.client && !isPlaceholder(CONFIG.SUPABASE_URL) && !isPlaceholder(CONFIG.SUPABASE_ANON_KEY));
  },
  init: function () {
    /* TODO (Stage 2): include the pinned Supabase JS v2 CDN build, then
       this.client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
       Never place a service-role key in the front end. */
    return this.client;
  }
};

/* ================================= AUTH ================================
   Stage 4 owns sign-in, sign-out, password reset and role routing.
   ======================================================================= */
const AUTH = {
  currentUser: function () { return STATE.user; },
  isSignedIn: function () { return !!STATE.session; },
  signIn: function () { ROUTER.navigate("/login"); },
  signOut: function () { ROUTER.navigate("/"); }
  /* TODO (Stage 4): register, login, logout, role routing, Kid mode PIN. */
};

/* ================================== 3D ==================================
   Stage 1 hero scene. "Seedbot" is built entirely from code (no external
   model files) with rounded ExtrudeGeometry boxes, plus an orbiting planet
   system (101/102/103) and a drifting particle field. One shared renderer,
   one rAF loop (TICKER), and a scroll-driven dolly via ScrollTrigger scrub.
   ======================================================================= */
const Scene3D = (function () {
  const COL = { plum: 0x2A1450, deep: 0x180A31, lime: 0xB8F23C, bright: 0xD9FF7A, lilac: 0xA98BFF, cream: 0xFFF8E7, coral: 0xFF6F61 };
  const small = () => window.innerWidth < 768;

  const PLANETS = [
    { level: "101", name: "Generative AI 101", meta: "Intro to AI and core concepts | about 6 weeks", color: COL.lime, a: 0 },
    { level: "102", name: "Generative AI 102", meta: "AI tools for building | about 8 weeks", color: COL.lilac, a: Math.PI * 2 / 3 },
    { level: "103", name: "Generative AI 103", meta: "AI agents and vibe coding | 10 to 12 weeks", color: COL.coral, a: Math.PI * 4 / 3 }
  ];

  let renderer, scene, camera, canvas;
  let root, body, head, leaf, armL, armR, planetsGroup;
  const eyeballs = [];
  const planets = [];
  const clouds = [];
  let raycaster, rayPlane, hitBox;
  let built = false, rendering = false, onRoute = false, tabVisible = true, bound = false;
  let hovered = -1, failed = false;

  // Pointer / animation state
  const ptr = { x: 0, y: 0 };
  const look = { x: 0, y: 0 };
  const ptrNorm = { x: 0, y: 0 };
  const targetScroll = { v: 0 };
  const smoothScroll = { v: 0 };
  let blinkAt = 1.8, blinkT = -1, spinT = -1, waveT = -1, pulse = 0;
  const sparks = [];
  const clock = { t: 0 };
  const bubble = () => $("#bubble");
  const tip = () => $("#planetTip");
  const LAST_BUBBLE = { msg: "" };
  const LINES = ["Let's build something!", "Ready for a mission?", "Ask me anything about AI!", "I can help you build this.", "Pick a planet and start learning!"];

  /* --- rounded box geometry (ExtrudeGeometry with bevel) --------------- */
  function roundedBox(w, h, d, r) {
    const rr = Math.min(r, Math.min(w, h) / 2 - 0.002);
    const x = -w / 2, y = -h / 2;
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
      depth: Math.max(d - 0.06, 0.02), curveSegments: 8,
      bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3
    });
    geo.center();
    return geo;
  }
  function mesh(geo, mat, x, y, z) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }

  /* --- Seedbot --------------------------------------------------------- */
  function buildSeedbot() {
    const lime = new THREE.MeshStandardMaterial({ color: COL.lime, roughness: 0.45, metalness: 0.1 });
    const plum = new THREE.MeshStandardMaterial({ color: COL.plum, roughness: 0.36, metalness: 0.16 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: COL.bright, emissive: COL.lime, emissiveIntensity: 0.9, roughness: 0.3 });

    root = new THREE.Group();
    root.position.set(1.9, 0.15, 0);
    body = new THREE.Group();
    head = new THREE.Group();
    root.add(body);
    body.add(head);

    // head + visor + underside
    head.add(mesh(roundedBox(2.02, 1.78, 1.2, 0.56), lime, 0, 0.6, 0));
    head.add(mesh(roundedBox(1.44, 0.86, 0.2, 0.34), plum, 0, 0.62, 0.57));

    // eyes (pill shapes, emissive lime)
    [-0.31, 0.31].forEach(function (x) {
      const e = mesh(roundedBox(0.22, 0.38, 0.12, 0.1), eyeMat, x, 0.63, 0.66);
      eyeballs.push(e);
      head.add(e);
    });

    // ear pods
    head.add(mesh(roundedBox(0.4, 0.78, 0.58, 0.18), lime, -1.14, 0.6, 0));
    head.add(mesh(roundedBox(0.4, 0.78, 0.58, 0.18), lime, 1.14, 0.6, 0));
    head.add(mesh(roundedBox(0.1, 0.3, 0.3, 0.05), plum, -1.33, 0.6, 0));
    head.add(mesh(roundedBox(0.1, 0.3, 0.3, 0.05), plum, 1.33, 0.6, 0));

    // antenna stem + sprout leaf (gently sways)
    const stem = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.62, 12), lime, 0, 1.78, 0);
    head.add(stem);
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(0.1, 0.34, 0.5, 0.44, 0.82, 0.36);
    leafShape.bezierCurveTo(0.62, 0.02, 0.24, -0.06, 0, 0);
    const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.09, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 10 });
    leafGeo.center();
    leaf = new THREE.Mesh(leafGeo, lime);
    leaf.position.set(0.36, 2.06, 0);
    leaf.rotation.z = 0.42;
    head.add(leaf);

    // neck + shoulders
    body.add(mesh(roundedBox(0.52, 0.26, 0.52, 0.09), plum, 0, -0.42, 0));
    body.add(mesh(roundedBox(1.62, 0.62, 0.86, 0.28), lime, 0, -0.86, 0));

    // arms pivot at the shoulders
    armL = new THREE.Group();
    armL.position.set(-0.9, -0.7, 0);
    armL.add(mesh(roundedBox(0.34, 1.1, 0.36, 0.16), lime, 0, -0.5, 0));
    body.add(armL);
    armR = new THREE.Group();
    armR.position.set(0.9, -0.7, 0);
    armR.add(mesh(roundedBox(0.34, 1.1, 0.36, 0.16), lime, 0, -0.5, 0));
    body.add(armR);

    scene.add(root);
  }

/* --- orbiting planets (101 / 102 / 103) ------------------------------ */
  function buildPlanets() {
    planetsGroup = new THREE.Group();
    planetsGroup.rotation.x = -0.3;
    planetsGroup.rotation.z = 0.12;
    const R = small() ? 2.5 : 3.1;
    PLANETS.forEach(function (p, i) {
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
      planetsGroup.add(holder);
      planets.push({ holder: holder, ball: ball, ring: ring, hit: hit, data: p, scale: 1 });
    });
    scene.add(planetsGroup);
  }

  /* --- particle field: lime seeds plus glowing code glyphs ------------- */
  function dotTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(217,255,122,1)");
    grad.addColorStop(0.42, "rgba(184,242,60,.85)");
    grad.addColorStop(1, "rgba(184,242,60,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(32, 32, 32, 0, Math.PI * 2);
    g.fill();
    return new THREE.CanvasTexture(c);
  }
  function glyphTexture(text, color) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    g.font = "600 62px Inter, system-ui, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = color;
    g.shadowBlur = 16;
    g.fillStyle = color;
    g.fillText(text, 64, 66);
    return new THREE.CanvasTexture(c);
  }
  function makeCloud(count, mat, spread, seedOnly) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread[0];
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
      pos[i * 3 + 2] = -Math.random() * spread[2] + spread[2] * 0.25;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, mat);
    if (seedOnly) pts.userData.seed = true;
    return pts;
  }
  function buildParticles() {
    const mobile = small();
    const seedCount = mobile ? 90 : 230;
    const glyphCount = mobile ? 14 : 42;
    const seedMat = new THREE.PointsMaterial({ size: 0.16, map: dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: 0.9 });
    clouds.push({ pts: makeCloud(seedCount, seedMat, [26, 16, 20], true), depth: 0.5 });

    const glyphs = [["</>", "#B8F23C"], ["{ }", "#A98BFF"], ["AI", "#FFF8E7"]];
    glyphs.forEach(function (g, i) {
      const mat = new THREE.PointsMaterial({ size: 0.62, map: glyphTexture(g[0], g[1]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: 0.72 });
      clouds.push({ pts: makeCloud(glyphCount, mat, [24, 14, 18], false), depth: 0.24 + i * 0.12 });
    });
    clouds.forEach(function (c) {
      c.pts.position.z = -4;
      scene.add(c.pts);
    });
  }

  /* --- lighting -------------------------------------------------------- */
  function buildLights() {
    scene.add(new THREE.HemisphereLight(COL.cream, COL.deep, 0.85));
    const key = new THREE.DirectionalLight(COL.lime, 1.15);
    key.position.set(5, 6.5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(COL.lilac, 0.95);
    rim.position.set(-6, 2.5, -5.5);
    scene.add(rim);
    const fill = new THREE.PointLight(COL.lime, 0.6, 20);
    fill.position.set(0, -2.5, 4);
    scene.add(fill);
  }

  /* --- sparks: small burst used when Seedbot answers a prompt ---------- */
  function sparkBurst() {
    if (!built || !root) return;
    for (let i = 0; i < (small() ? 10 : 22); i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: i % 3 === 0 ? COL.lilac : COL.lime, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.scale.setScalar(0.2 + Math.random() * 0.18);
      s.position.set(0, 0.6, 0.4);
      s.userData.v = new THREE.Vector3((Math.random() - 0.5) * 3.6, Math.random() * 2.6 + 0.4, (Math.random() - 0.5) * 2);
      s.userData.life = 0.9 + Math.random() * 0.5;
      root.add(s);
      sparks.push(s);
    }
  }

/* --- pointer + scroll input ------------------------------------------ */
  function updatePointer(clientX, clientY) {
    ptr.x = clientX;
    ptr.y = clientY;
    ptrNorm.x = (clientX / window.innerWidth) * 2 - 1;
    ptrNorm.y = -(clientY / window.innerHeight) * 2 + 1;
  }
  function bindInput() {
    window.addEventListener("pointermove", function (e) { updatePointer(e.clientX, e.clientY); }, { passive: true });

    // Touch screens: use device tilt when available, otherwise a slow idle drift.
    if (isTouch() && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function (e) {
        if (e.gamma == null) return;
        ptrNorm.x = clampNum(e.gamma / 40, -1, 1);
        ptrNorm.y = clampNum((e.beta - 45) / 40, -1, 1);
      }, { passive: true });
    }

    window.addEventListener("pointerdown", onSceneTap, { passive: true });
    window.addEventListener("resize", debounce(onResize, 180));
    document.addEventListener("visibilitychange", function () {
      tabVisible = !document.hidden;
      syncLoop();
    });

    const landing = $('[data-view="landing"]');
    if (landing && window.ScrollTrigger && window.gsap) {
      ScrollTrigger.create({
        trigger: landing, start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: function (self) { targetScroll.v = self.progress; }
      });
    } else {
      window.addEventListener("scroll", function () {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        targetScroll.v = clampNum(window.scrollY / max, 0, 1);
      }, { passive: true });
    }
  }
  function interactiveTarget(el) {
    return !!(el && el.closest && el.closest("a,button,input,select,textarea,label,.modal,.mobile-menu,.chat,.workshop-form"));
  }
  function onSceneTap(e) {
    if (!built || !onRoute || !tabVisible) return;
    if (interactiveTarget(e.target)) return;
    updatePointer(e.clientX, e.clientY);
    raycaster = raycaster || new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ptrNorm.x, ptrNorm.y), camera);

    const hits = raycaster.intersectObjects(planets.map(function (p) { return p.hit; }), false);
    if (hits.length) { pickPlanet(hits[0].object.userData.planet, true); return; }
    if (hitBox && raycaster.intersectObject(hitBox, false).length) reactToSeedbot();
  }
  function reactToSeedbot() {
    spinT = 0;
    pulse = 1;
    sparkBurst();
    let msg = LINES[Math.floor(Math.random() * LINES.length)];
    if (LINES.length > 1 && msg === LAST_BUBBLE.msg) msg = LINES[(LINES.indexOf(msg) + 1) % LINES.length];
    LAST_BUBBLE.msg = msg;
    showBubble(msg);
  }
  function showBubble(text) {
    if (!built || !root) return;
    const b = bubble();
    if (!b) return;
    b.textContent = text;
    b.hidden = false;
    b.classList.add("is-on");
    window.clearTimeout(showBubble.t);
    showBubble.t = window.setTimeout(function () {
      b.classList.remove("is-on");
      window.setTimeout(function () { if (!b.classList.contains("is-on")) b.hidden = true; }, 400);
    }, 2600);
  }
  function pickPlanet(idx, fromClick) {
    const p = planets[idx];
    if (!p) return;
    if (fromClick) {
      if (window.Landing && Landing.openLevel) Landing.openLevel(p.data.level);
      const ladder = document.getElementById("courses");
      if (ladder) goToSection(ladder);
      showBubble(p.data.name);
    }
  }
  function updateHover() {
    if (!built || !planets.length) return;
    const t = tip();
    const hits = raycaster.intersectObjects(planets.map(function (p) { return p.hit; }), false);
    const next = hits.length ? hits[0].object.userData.planet : -1;
    if (next !== hovered) {
      hovered = next;
      if (t) {
        if (hovered >= 0) {
          const d = planets[hovered].data;
          $("#planetTipTitle").textContent = d.name;
          $("#planetTipMeta").textContent = d.meta;
          t.hidden = false;
          t.classList.add("is-on");
        } else {
          t.classList.remove("is-on");
          t.hidden = true;
        }
      }
      document.body.style.cursor = hovered >= 0 ? "pointer" : "";
    }
    if (hovered >= 0 && t) {
      const v = new THREE.Vector3();
      planets[hovered].ball.getWorldPosition(v);
      v.project(camera);
      t.style.left = ((v.x * 0.5 + 0.5) * window.innerWidth) + "px";
      t.style.top = ((-v.y * 0.5 + 0.5) * window.innerHeight) + "px";
    }
  }

let _bubbleV = null;
  function updateBubble() {
    const b = bubble();
    if (!b || !b.classList.contains("is-on")) return;
    if (!root || !camera) return;
    if (!_bubbleV) _bubbleV = new THREE.Vector3();
    root.getWorldPosition(_bubbleV);
    _bubbleV.y += 2.5 * root.scale.y;
    _bubbleV.project(camera);
    b.style.left = ((_bubbleV.x * 0.5 + 0.5) * window.innerWidth).toFixed(1) + "px";
    b.style.top = ((-_bubbleV.y * 0.5 + 0.5) * window.innerHeight).toFixed(1) + "px";
  }

/* --- the shared render step ----------------------------------------- */
  function step(dt) {
    if (!built || failed) return;
    raycaster = raycaster || new THREE.Raycaster();
    clock.t += dt;

    // lerp easing for pointer-following and the scroll dolly
    look.x = lerp(look.x, ptrNorm.x, Math.min(dt * 4.2, 0.16));
    look.y = lerp(look.y, ptrNorm.y, Math.min(dt * 4.2, 0.16));
    smoothScroll.v = lerp(smoothScroll.v, targetScroll.v, Math.min(dt * 3.4, 0.12));

    raycaster.setFromCamera(new THREE.Vector2(ptrNorm.x, ptrNorm.y), camera);
    updateHover();

    // idle float + periodic blink
    const float = Math.sin(clock.t * 1.15) * 0.13;
    if (blinkT < 0) {
      blinkAt -= dt;
      if (blinkAt <= 0) { blinkT = 0; blinkAt = 2.4 + Math.random() * 2.8; }
    } else {
      blinkT += dt;
      const k = clampNum(blinkT / 0.16, 0, 1);
      const sy = 1 - Math.sin(k * Math.PI) * 0.9;
      eyeballs.forEach(function (e) { e.scale.y = sy; });
      if (k >= 1) { blinkT = -1; eyeballs.forEach(function (e) { e.scale.y = 1; }); }
    }
    pulse = Math.max(0, pulse - dt * 0.9);
    const glow = 0.9 + pulse * 1.8 + Math.sin(clock.t * 2) * 0.06;
    eyeballs.forEach(function (e, i) {
      e.material.emissiveIntensity = glow;
      e.position.x = (i === 0 ? -0.31 : 0.31) + look.x * 0.05;
      e.position.y = 0.63 + look.y * 0.04;
    });

    // head follows the pointer; body adds a slow drift plus the click spin
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

    // waves one arm on load, then settles
    if (waveT >= 0) {
      waveT += dt;
      if (waveT > 2.6) { waveT = -1; armR.rotation.z = 0; }
      else {
        const decay = clampNum(1 - waveT / 2.6, 0, 1);
        armR.rotation.z = -(1.15 + Math.sin(waveT * 9) * 0.42) * decay;
      }
    }
    armL.rotation.z = Math.sin(clock.t * 0.9) * 0.08;

    // robot placement: hero, then beside the ladder, then parked in the corner
    const s = smoothScroll.v;
    let px, py, ps;
    if (small()) {
      px = 1.5; py = -1.25 + float * 0.6; ps = 0.5;
    } else if (s < 0.32) {
      const k = s / 0.32;
      px = 1.95; py = 0.2 - k * 0.25 + float; ps = 1 - k * 0.1;
    } else if (s < 0.55) {
      const k = (s - 0.32) / 0.23;
      px = lerp(1.95, -3.5, k); py = lerp(-0.05, -0.15, k) + float; ps = lerp(0.9, 0.78, k);
    } else {
      const k = clampNum((s - 0.55) / 0.45, 0, 1);
      px = lerp(-3.5, 3.5, k); py = lerp(-0.15, -1.5, k) + float; ps = lerp(0.78, 0.4, k);
    }
    root.position.set(px + ptrNorm.x * 0.28, py, 0);
    root.scale.setScalar(ps);
    updateBubble();

    // camera dolly centres the depth of the scene
    camera.position.z = lerp(9.4, 12.4, s);
    camera.position.y = lerp(0.4, 0.05, s);
    camera.lookAt(0, lerp(0.25, -0.3, s), 0);

    // planets live in the hero and retire as the course ladder arrives
    const pVis = small() ? 0.001 : clampNum(1 - (s - 0.42) / 0.24, 0, 1);
    planetsGroup.scale.setScalar(Math.max(pVis, 0.001));
    planetsGroup.rotation.y += dt * (hovered >= 0 ? 0.05 : 0.24);
    planets.forEach(function (p, i) {
      p.scale = lerp(p.scale, i === hovered ? 1.55 : 1, Math.min(dt * 5, 0.2));
      p.ball.scale.setScalar(p.scale);
      p.ring.scale.setScalar(p.scale);
      p.ring.rotation.z += dt * 0.6;
    });

    // drifting particle field with pointer parallax
    clouds.forEach(function (c) {
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

/* --- lifecycle ------------------------------------------------------- */
  function onResize() {
    if (!built) return;
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
  }
  function syncLoop() {
    const want = built && onRoute && tabVisible && !failed && !motionOff();
    if (want && !rendering) {
      rendering = true;
      TICKER.add(step);
    } else if (!want && rendering) {
      rendering = false;
      TICKER.remove(step);
    }
  }
  function showFallback() {
    const fb = $("#sceneFallback");
    if (fb) fb.classList.add("is-on");
    const c = $("#seedbotCanvas");
    if (c) c.hidden = true;
  }
  function disposeScene() {
    if (!scene) return;
    scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    while (scene.children.length) scene.remove(scene.children[0]);
    eyeballs.length = 0;
    planets.length = 0;
    clouds.length = 0;
    sparks.length = 0;
    planetsGroup = null;
    hitBox = null;
    built = false;
    hovered = -1;
  }
  function init() {
    if (built || failed) return;
    if (!window.THREE) { failed = true; showFallback(); return; }
    canvas = canvas || $("#seedbotCanvas");
    if (!renderer) {
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !small(), alpha: true, powerPreference: "high-performance" });
      } catch (err) {
        failed = true;
        showFallback();
        return;
      }
      renderer.setClearColor(0x000000, 0);
    }
    if (!scene) {
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(COL.plum, 13, 34);
    }
    if (!camera) camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 90);
    onResize();
    camera.position.set(0, 0.4, 9.4);
    camera.lookAt(0, 0.25, 0);

    buildLights();
    buildSeedbot();
    buildPlanets();
    buildParticles();
    if (!bound) { bound = true; bindInput(); }

    // invisible hit box so tapping Seedbot is easy on any screen size
    hitBox = new THREE.Mesh(roundedBox(2.9, 3.5, 1.6, 0.4), new THREE.MeshBasicMaterial({ visible: false }));
    hitBox.position.set(0, 0.1, 0);
    body.add(hitBox);

    built = true;
    if (!motionOff()) waveT = 0;
    syncLoop();
  }

  function onEnter() {
    onRoute = true;
    if (motionOff()) { if (built) syncLoop(); else showFallback(); return; }
    init();
    syncLoop();
  }
  function onExit() {
    onRoute = false;
    syncLoop();
    disposeScene();
  }
  function wing() { return { showBubble: showBubble, sparkBurst: sparkBurst }; }

  return {
    init: init,
    onEnter: onEnter,
    onExit: onExit,
    refresh: function () { onResize(); },
    reduced: function () { syncLoop(); },
    api: wing
  };
})();
window.Scene3D = Scene3D;

/* ====================== SHARED UI HELPERS (top level) ==================
   Declared at the top level so the router and the 3D module can call them.
   ====================================================================== */
function openMobileMenu() {
  const mm = $("#mobileMenu");
  if (!mm) return;
  mm.hidden = false;
  document.body.classList.add("menu-open");
  document.body.style.overflow = "hidden";
  const btn = $("#navToggle");
  if (btn) btn.setAttribute("aria-expanded", "true");
  requestAnimationFrame(function () { mm.classList.add("is-open"); });
  const close = $("#mmClose");
  if (close) close.focus();
}
function closeMobileMenu() {
  const mm = $("#mobileMenu");
  if (!mm || mm.hidden) return;
  mm.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  document.body.style.overflow = "";
  const btn = $("#navToggle");
  if (btn) btn.setAttribute("aria-expanded", "false");
  window.setTimeout(function () { if (!mm.classList.contains("is-open")) mm.hidden = true; }, 380);
}
/* ScrollTrigger recalculation, shared with the router. */
function GSAPRefresh() {
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
}
/* TODO (Stage 2): replace this stub with an insert into the Supabase "leads"
   table (public insert only, RLS-protected). Until then it logs and stores
   locally so the flow can be tested end to end. */
function submitLead(data) {
  console.log("[Seed AI] lead captured (stub, awaiting Stage 2)", data);
  try {
    const key = "seedai_leads";
    const list = JSON.parse(window.localStorage.getItem(key) || "[]");
    list.push(Object.assign({ created_at: new Date().toISOString() }, data));
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch (err) { /* private mode: ignore */ }
  return { ok: true, stored: "localStorage" };
}

/* =============================== LANDING ===============================
   Stage 1 landing page behaviour: preloader, navbar, mobile menu, cursor
   glow, modals, CONFIG links, reveals, counters, carousel, course ladder,
   learner tabs, the scripted Seedbot chat and the free-workshop form.
   ====================================================================== */
const Landing = (function () {
  const MODAL_COPY = {
    privacy: {
      title: "Privacy",
      body: [
        "Placeholder text. Replace with a real Privacy Policy and get it legally reviewed before launch, especially for children's data.",
        "In summary, Seed AI Academy only collects what is needed to run classes and keep parents informed. Children under 13 never get their own login: they learn as a profile under a parent account, protected by a PIN. There is no advertising to children.",
        "For privacy questions, set SEEDAI_EMAIL in the .env file."
      ]
    },
    terms: {
      title: "Terms",
      body: [
        "Placeholder text. Replace with real Terms of Service before launch.",
        "Course lengths, prerequisites and project outcomes described on this site follow our current curriculum plan. Delivery format (live, self-paced, in person) is confirmed at registration.",
        "Pricing is announced at launch. Join the free workshop to get early access."
      ]
    },
    whatsapp: {
      title: "WhatsApp",
      body: [
        "The WhatsApp button is wired to CONFIG.WHATSAPP_NUMBER in the https://wa.me/ format.",
        "Add your number in the .env file (WHATSAPP_NUMBER, digits only, including the country code) and this button goes live everywhere on the site."
      ]
    },
    email: {
      title: "Email",
      body: [
        "Every email link on the site reads from CONFIG.SEEDAI_EMAIL.",
        "Add your address in the .env file (SEEDAI_EMAIL) and this link goes live."
      ]
    }
  };

  let modalOpen = null, lastFocus = null;
  let api = {};

  /* --------------------------- preloader ---------------------------- */
  function initPreloader() {
    const pre = $("#preloader");
    if (!pre) return;
    const key = "seedai_intro_seen";
    let seen = false;
    try { seen = window.sessionStorage.getItem(key) === "1"; } catch (err) { }
    let done = false;

    function hide(instant) {
      if (done) return;
      done = true;
      try { window.sessionStorage.setItem(key, "1"); } catch (err) { }
      if (instant) { pre.hidden = true; return; }
      pre.classList.add("is-lifting");
      window.setTimeout(function () { pre.hidden = true; }, 950);
    }
    if (seen || motionOff()) { hide(true); return; }
    const btn = $("#preSkip");
    if (btn) btn.addEventListener("click", function () { hide(true); });
    window.setTimeout(function () { hide(false); }, 1950);
  }

  /* ---------------------------- navbar ------------------------------ */
  function initNav() {
    const nav = $("#navbar");
    if (nav) {
      const onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 14); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    const toggle = $("#navToggle");
    if (toggle) toggle.addEventListener("click", function () {
      const mm = $("#mobileMenu");
      if (mm && !mm.hidden) closeMobileMenu(); else openMobileMenu();
    });
    const close = $("#mmClose");
    if (close) close.addEventListener("click", closeMobileMenu);
    const mm = $("#mobileMenu");
    if (mm) mm.addEventListener("click", function (e) { if (e.target.closest("a")) closeMobileMenu(); });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeMobileMenu(); closeModal(); }
    });
    window.addEventListener("resize", debounce(function () {
      if (window.innerWidth >= 900) closeMobileMenu();
    }, 200));
  }

  /* ------------------------- cursor glow ---------------------------- */
  function initCursorGlow() {
    if (isTouch() || motionOff()) return;
    if (!window.matchMedia("(min-width: 900px)").matches) return;
    const glow = $("#glowCursor");
    if (!glow) return;
    document.body.classList.add("has-cursor");
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cur = { x: pos.x, y: pos.y };
    window.addEventListener("pointermove", function (e) { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });
    TICKER.add(function (dt) {
      cur.x = lerp(cur.x, pos.x, Math.min(dt * 7, 0.22));
      cur.y = lerp(cur.y, pos.y, Math.min(dt * 7, 0.22));
      glow.style.transform = "translate(" + cur.x.toFixed(1) + "px," + cur.y.toFixed(1) + "px)";
    });
  }

/* --------------------------- modals ------------------------------- */
  function openModal(key) {
    const cfg = MODAL_COPY[key];
    const box = $("#modal");
    if (!cfg || !box) return;
    $("#modalTitle").textContent = cfg.title;
    const body = $("#modalBody");
    body.textContent = "";
    cfg.body.forEach(function (t) {
      const p = document.createElement("p");
      p.textContent = t;             // textContent only: never innerHTML for copy or user data
      body.appendChild(p);
    });
    lastFocus = document.activeElement;
    box.hidden = false;
    modalOpen = key;
    document.body.style.overflow = "hidden";
    const close = $("#modalClose");
    if (close) close.focus();
  }
  function closeModal() {
    const box = $("#modal");
    if (!box || box.hidden) return;
    box.hidden = true;
    modalOpen = null;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function initModals() {
    const box = $("#modal");
    if (!box) return;
    const close = $("#modalClose");
    if (close) close.addEventListener("click", closeModal);
    const back = $(".modal-backdrop", box);
    if (back) back.addEventListener("click", closeModal);
    $$("[data-modal]").forEach(function (b) {
      b.addEventListener("click", function () { openModal(b.getAttribute("data-modal")); });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Tab" && modalOpen) {
        const focusables = $$("button, a[href], input, select, textarea", box).filter(function (el) { return !el.hidden; });
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------------------- CONFIG driven links ----------------------- */
  // Idempotent: safe to run again after .env loads, without double-binding.
  // Handlers are state-aware: they only intercept when values are still
  // missing, so a second pass with real .env values just works.
  function bindOnce(el, fn) {
    if (!el || el.hasAttribute("data-env-bound")) return;
    el.setAttribute("data-env-bound", "1");
    el.addEventListener("click", fn);
  }
  function applyConfig() {
    const email = $("#footerEmail");
    const mail = mailLink("Seed AI Academy");
    if (email) {
      if (mail) {
        email.href = mail;
        email.textContent = CONFIG.SEEDAI_EMAIL;
        email.removeAttribute("title");
      } else {
        email.href = "#";
        email.textContent = "Email us (address pending)";
        email.setAttribute("title", "Set SEEDAI_EMAIL in the .env file");
      }
      bindOnce(email, function (e) {
        if (!mailLink("Seed AI Academy")) { e.preventDefault(); openModal("email"); }
      });
    }
    const wa = $("#footerWhatsapp");
    if (wa) {
      const link = waLink("Hi Seed AI Academy, I would like to know more about your courses.");
      if (link) { wa.href = link; setPending(wa, false); }
      else { setPending(wa, true); }
    }
    const fab = $("#waFab");
    if (fab) {
      const link = waLink("Hi Seed AI Academy, I would like to know more about your courses.");
      if (link) {
        fab.href = link; fab.target = "_blank"; fab.rel = "noopener";
        fab.setAttribute("aria-label", "Chat with Seed AI Academy on WhatsApp");
      } else {
        fab.removeAttribute("href");
        fab.removeAttribute("target");
        fab.setAttribute("aria-label", "WhatsApp details are added before launch");
      }
      bindOnce(fab, function (e) {
        if (!waLink("Hi Seed AI Academy, I would like to know more about your courses.")) {
          e.preventDefault(); openModal("whatsapp");
        }
      });
    }
    applySocial();
  }
  /* Social links also come from .env (INSTAGRAM_URL, YOUTUBE_URL, LINKEDIN_URL).
     Missing or invalid values fall back to a muted "coming soon" state. */
  const SOCIAL_LINKS = [
    { sel: "#socialInstagram", key: "INSTAGRAM_URL", label: "Instagram" },
    { sel: "#socialYoutube", key: "YOUTUBE_URL", label: "YouTube" },
    { sel: "#socialLinkedin", key: "LINKEDIN_URL", label: "LinkedIn" }
  ];
  function applySocial() {
    SOCIAL_LINKS.forEach(function (s) {
      const el = $(s.sel);
      if (!el) return;
      const url = safeUrl(CONFIG[s.key]);
      bindOnce(el, function (e) { if (!safeUrl(CONFIG[s.key])) e.preventDefault(); });
      if (url) {
        el.href = url;
        el.target = "_blank";
        el.rel = "noopener";
        el.textContent = s.label;
        el.setAttribute("aria-label", s.label + " for Seed AI Academy, opens in a new tab");
        el.classList.remove("social-ph");
        el.removeAttribute("aria-disabled");
        el.removeAttribute("title");
      } else {
        el.removeAttribute("href");
        el.removeAttribute("target");
        el.textContent = s.label + " \u00b7 coming soon";
        el.setAttribute("aria-label", s.label + " link coming soon");
        el.classList.add("social-ph");
        el.setAttribute("aria-disabled", "true");
        el.setAttribute("title", "Add " + s.key + " to the .env file");
      }
    });
  }
  function setPending(el, pending) {
    if (pending) {
      el.removeAttribute("href");
      el.removeAttribute("target");
      el.textContent = "WhatsApp (number pending)";
      el.setAttribute("title", "Set WHATSAPP_NUMBER in the .env file");
    } else {
      el.textContent = "WhatsApp";
      el.removeAttribute("title");
    }
    bindOnce(el, function (e) {
      if (!waLink("Hi Seed AI Academy, I would like to know more about your courses.")) {
        e.preventDefault(); openModal("whatsapp");
      }
    });
  }

  /* ----------------------- reduce motion ---------------------------- */
  function initReduceMotion() {
    const input = $("#reduceToggle");
    const html = document.documentElement;
    let stored = null;
    try { stored = window.localStorage.getItem("seedai_reduce_motion"); } catch (err) { }
    const on = stored === null ? prefersReducedMotion() : stored === "1";
    STATE.reducedMotion = on;
    html.classList.toggle("reduce-motion", on);
    if (input) {
      input.checked = on;
      input.addEventListener("change", function () {
        const v = input.checked;
        STATE.reducedMotion = v;
        html.classList.toggle("reduce-motion", v);
        try { window.localStorage.setItem("seedai_reduce_motion", v ? "1" : "0"); } catch (err) { }
        if (window.Scene3D) Scene3D.reduced();
        $$(".reveal").forEach(function (el) { if (v) el.classList.add("is-in"); });
        GSAPRefresh();
      });
    }
  }

/* --------------------- wiring + reveals --------------------------- */
  function initWiring() {
    // Buttons (not anchors) scroll to a section; anchors keep their hash so
    // the router can switch views and honour the anchor.
    $$("button[data-scroll]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        const target = document.getElementById(el.getAttribute("data-scroll"));
        if (!target) return;
        e.preventDefault();
        closeMobileMenu();
        if (STATE.view !== "landing") {
          ROUTER.navigate("/");
          window.setTimeout(function () { goToSection(target); }, 140);
        } else {
          goToSection(target);
        }
      });
    });
    $$("[data-return-home]").forEach(function (el) {
      el.addEventListener("click", function () { ROUTER.navigate("/"); });
    });
    $$("[data-goto]").forEach(function (el) {
      el.addEventListener("click", function () {
        const target = document.getElementById(el.getAttribute("data-goto"));
        ROUTER.navigate("/");
        if (target) window.setTimeout(function () { goToSection(target); }, 140);
      });
    });
  }

  function initReveals() {
    const els = $$(".reveal");
    if (!els.length) return;
    if (motionOff()) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    if (window.gsap && window.ScrollTrigger) {
      els.forEach(function (el) {
        ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: function () { el.classList.add("is-in"); } });
      });
    } else {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.06 });
      els.forEach(function (el) { io.observe(el); });
    }
    // Safety net: never leave content invisible if a trigger fails.
    window.setTimeout(function () { els.forEach(function (el) { el.classList.add("is-in"); }); }, 5000);
  }

  function initCounters() {
    const nodes = $$(".counter-num");
    if (!nodes.length) return;
    const run = function (el) {
      const target = parseFloat(el.getAttribute("data-count")) || 0;
      const dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";
      if (motionOff()) { el.textContent = target.toFixed(dec) + suffix; return; }
      const dur = 1500, t0 = performance.now();
      const tick = function (now) {
        const p = clampNum((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (p < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function initHowPath() {
    const line = $("#howPathLine");
    const host = $(".how");
    if (!line || !host) return;
    const draw = function () { line.classList.add("is-drawn"); };
    if (motionOff()) { draw(); return; }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { draw(); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(host);
    window.setTimeout(draw, 4500);
  }

/* ------------------------ coverflow carousel ---------------------- */
  function initCarousel() {
    const cf = $("#carousel");
    if (!cf) return;
    const cards = $$(".cf-card", cf);
    const dotsWrap = $("#cfDots");
    const vp = $(".cf-viewport", cf);
    if (!cards.length || !vp) return;
    let active = 0, timer = null;

    vp.setAttribute("tabindex", "0");
    vp.setAttribute("role", "group");
    vp.setAttribute("aria-label", "Project carousel. Use the left and right arrow keys to browse.");

    cards.forEach(function (card, i) {
      const li = document.createElement("li");
      const b = document.createElement("button");
      const title = $(".cf-title", card);
      b.type = "button";
      b.className = "cf-dot";
      b.setAttribute("aria-label", "Show project " + (i + 1) + (title ? ": " + title.textContent : ""));
      b.addEventListener("click", function () { go(i); });
      li.appendChild(b);
      dotsWrap.appendChild(li);
    });
    const dots = $$(".cf-dot", dotsWrap);

    function layout() {
      const w = vp.clientWidth || 900;
      const gap = Math.max(74, Math.min(w * 0.2, 170));
      cards.forEach(function (card, i) {
        let d = (i - active + cards.length) % cards.length;
        if (d > cards.length / 2) d -= cards.length;
        const abs = Math.abs(d);
        card.style.transform = "translateX(" + (d * gap) + "px) translateZ(" + (-abs * 200) + "px) rotateY(" + (d * -30) + "deg)";
        card.style.opacity = abs > 2 ? "0" : String(Math.max(0.22, 1 - abs * 0.36));
        card.style.filter = abs === 0 ? "none" : "brightness(0.62)";
        card.style.zIndex = String(20 - abs);
        card.style.pointerEvents = abs === 0 ? "auto" : "none";
        card.classList.toggle("is-active", abs === 0);
        if (abs === 0) card.removeAttribute("inert"); else card.setAttribute("inert", "");
        const btn = $(".cf-inner", card);
        if (btn) btn.tabIndex = abs === 0 ? 0 : -1;
      });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === active); });
    }
    function go(i) { active = (i + cards.length) % cards.length; layout(); }
    function next() { go(active + 1); }
    function prev() { go(active - 1); }

    cards.forEach(function (card) {
      const btn = $(".cf-inner", card);
      if (btn) btn.addEventListener("click", function () {
        const flipped = card.classList.toggle("is-flipped");
        btn.setAttribute("aria-expanded", flipped ? "true" : "false");
      });
    });

    const prevBtn = $("#cfPrev"), nextBtn = $("#cfNext");
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);
    vp.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    });

    const stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };
    const play = function () {
      if (motionOff() || timer) return;
      timer = window.setInterval(next, 5200);
    };
    cf.addEventListener("pointerenter", stop);
    cf.addEventListener("focusin", stop);
    cf.addEventListener("pointerleave", play);
    cf.addEventListener("focusout", play);

    let sx = 0, sy = 0, swiping = false;
    cf.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true;
    }, { passive: true });
    cf.addEventListener("touchend", function (e) {
      if (!swiping) return;
      swiping = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else prev(); }
    }, { passive: true });

    layout();
    play();
    window.addEventListener("resize", debounce(layout, 180));
  }

/* -------------------------- course ladder ------------------------- */
  const LADDER_LEVELS = {
    "101": { badge: "101", title: "Generative AI 101", sub: "Introduction to AI and core concepts", weeks: "About 6 weeks", prereq: "None", ages: "Ages 11+ (and up)", project: "A short AI-assisted video or story, plus a personal prompt playbook.", topics: ["What AI is and is not", "AI vs machine learning vs generative AI", "How language models work in plain terms", "Prompting basics", "Image, audio and video generation", "Creating videos with AI tools", "Hallucinations, bias, copyright and privacy", "Responsible use"] },
    "102": { badge: "102", title: "Generative AI 102", sub: "AI tools for building", weeks: "About 8 weeks", prereq: "101 or placement test", ages: "Ages 13+ (and up)", project: "A live, published 3 to 4 page website.", topics: ["Build a landing page with AI", "Build a multi-step 3 to 4 page website", "Design generation: layouts, colour and brand kit", "AI-written site copy", "Forms and navigation", "Responsive checks", "Fixing AI output", "Publishing the site"] },
    "103": { badge: "103", title: "Generative AI 103", sub: "AI agents and vibe coding", weeks: "10 to 12 weeks", prereq: "102", ages: "Ages 14+ (and up)", project: "A deployed app with a database, plus one automated agent workflow for your role.", topics: ["Vibe-code a full working app and website", "A database, accounts and deployment", "Plan and specify work for AI agents", "Automate workflows", "Connect AI to Google Calendar, Docs, Sheets and email", "Testing, debugging and security basics", "Role tracks: accountant, content creator, educator"] }
  };

  function initLadder() {
    const panel = $("#coursePanel");
    const steps = $$(".lstep");
    if (!panel || !steps.length) return;

    function fill(level) {
      const d = LADDER_LEVELS[level];
      if (!d) return;
      $("#lpBadge").textContent = d.badge;
      $("#lpTitle").textContent = d.title;
      $("#lpSub").textContent = d.sub;
      $("#lpWeeks").textContent = d.weeks;
      $("#lpPrereq").textContent = d.prereq;
      $("#lpAges").textContent = d.ages;
      $("#lpProject").textContent = d.project;
      const list = $("#lpTopics");
      list.textContent = "";
      d.topics.forEach(function (t) {
        const li = document.createElement("li");
        li.textContent = t;
        list.appendChild(li);
      });
      panel.classList.remove("acc-101", "acc-102", "acc-103");
      panel.classList.add("acc-" + level);
    }
    function openLevel(level) {
      fill(level);
      panel.hidden = false;
      steps.forEach(function (s) {
        const on = s.getAttribute("data-level") === level;
        s.classList.toggle("is-open", on);
        const b = $(".lstep-btn", s);
        if (b) b.setAttribute("aria-expanded", on ? "true" : "false");
      });
    }
    function closePanel() {
      panel.hidden = true;
      steps.forEach(function (s) {
        s.classList.remove("is-open");
        const b = $(".lstep-btn", s);
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }
    steps.forEach(function (s) {
      const b = $(".lstep-btn", s);
      if (b) b.addEventListener("click", function () {
        const level = s.getAttribute("data-level");
        if (s.classList.contains("is-open")) closePanel(); else openLevel(level);
      });
    });
    const close = $("#lpClose");
    if (close) close.addEventListener("click", closePanel);

    api.openLevel = openLevel;
  }

/* --------------------- who it is for (tabs) ----------------------- */
  function initWho() {
    const tabs = $$(".who-tab");
    const panels = $$(".who-panel");
    const cube = $("#whoCube");
    if (!tabs.length) return;
    const FACE_CLASS = ["cube--0", "cube--1", "cube--2", "cube--3", "cube--4"];

    function activate(i) {
      tabs.forEach(function (t, k) {
        const on = k === i;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, k) {
        const on = k === i;
        p.classList.toggle("is-active", on);
        p.hidden = !on;
      });
      if (cube) {
        FACE_CLASS.forEach(function (c) { cube.classList.remove(c); });
        cube.classList.add(FACE_CLASS[i] || FACE_CLASS[0]);
      }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activate(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); tabs[(i + 1) % tabs.length].focus(); tabs[(i + 1) % tabs.length].click(); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); const p = (i - 1 + tabs.length) % tabs.length; tabs[p].focus(); tabs[p].click(); }
        if (e.key === "Home") { e.preventDefault(); tabs[0].focus(); tabs[0].click(); }
        if (e.key === "End") { e.preventDefault(); tabs[tabs.length - 1].focus(); tabs[tabs.length - 1].click(); }
      });
    });
    activate(0);
  }

/* -------------------- talk to Seedbot (scripted) ------------------ */
  const SEEDBOT_RULES = [
    { keys: ["dino", "dinosaur", "game", "scratch", "character"], reply: "A dinosaur game! Nice. We would start in Scratch: pick a hero, animate it frame by frame, then add a score and levels. Want it to roar when it wins?" },
    { keys: ["website", "site", "web", "page", "html", "landing"], reply: "A website is a great first build. Plan the pages (home, about, contact), sketch one section, then let AI help with the words and the layout. In Generative AI 102 you publish it for real." },
    { keys: ["agent", "automat", "workflow", "email", "sheet", "calendar"], reply: "An agent that saves you hours, my favourite kind of project. We define one job, for example sorting email into folders, then connect the tools and test it until it just runs." },
    { keys: ["robot", "seedbot", "you"], reply: "That is me. I am a small robot with a sprout antenna. Students build characters like me in the first project of the ladder." },
    { keys: ["price", "cost", "fee", "pay"], reply: "Pricing is announced at launch. Join the free workshop and we will tell you first." },
    { keys: ["kid", "child", "age", "young", "parent"], reply: "Children from 6 are welcome. Under 13 they learn under a parent account with a PIN, and parents see class reminders and progress in the parent dashboard." },
    { keys: ["python", "code", "coding", "javascript", "react"], reply: "We start with visual block coding, then Web Foundations with HTML and CSS, then JavaScript and React. By the end you are shipping real apps." }
  ];
  const SEEDBOT_FALLBACK = [
    "Let's make it real. Tell me who it is for and what it should do, then we pick the simplest first step and build from there.",
    "Good idea. In a Seed AI class we would shrink that into one small first version, build it, then make it better together.",
    "I like it. Every project starts the same way here: one clear prompt, one small build, then we improve it step by step."
  ];
  function seedbotReply(prompt) {
    const p = String(prompt || "").toLowerCase();
    for (let i = 0; i < SEEDBOT_RULES.length; i++) {
      const r = SEEDBOT_RULES[i];
      if (r.keys.some(function (k) { return p.indexOf(k) > -1; })) return r.reply;
    }
    return SEEDBOT_FALLBACK[Math.floor(Math.random() * SEEDBOT_FALLBACK.length)];
  }
  function addMsg(role, text) {
    const log = $("#chatLog");
    if (!log) return null;
    const wrap = document.createElement("div");
    wrap.className = "msg msg-" + role;
    const p = document.createElement("p");
    p.textContent = text;               // user text is never inserted as HTML
    wrap.appendChild(p);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }
  function askSeedbot(prompt) {
    const text = String(prompt || "").trim().slice(0, 140);
    if (!text) return;
    addMsg("user", text);
    const reply = seedbotReply(text);
    const typing = document.createElement("div");
    typing.className = "msg msg-bot";
    const dots = document.createElement("span");
    dots.className = "msg-typing";
    dots.innerHTML = "<i></i><i></i><i></i>";
    typing.appendChild(dots);
    const log = $("#chatLog");
    if (log) { log.appendChild(typing); log.scrollTop = log.scrollHeight; }
    if (window.Scene3D && Scene3D.api) { const a = Scene3D.api(); if (a && a.sparkBurst) a.sparkBurst(); }
    window.setTimeout(function () {
      if (typing.parentNode) typing.parentNode.removeChild(typing);
      addMsg("bot", reply);
      if (window.Scene3D && Scene3D.api) { const a = Scene3D.api(); if (a && a.showBubble) a.showBubble("Let's build something!"); }
    }, 720);
  }
  function initChat() {
    const form = $("#chatForm");
    const input = $("#chatInput");
    if (form && input) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        askSeedbot(input.value);
        input.value = "";
        input.focus();
      });
    }
    $$("#chatChips .chip-btn").forEach(function (c) {
      c.addEventListener("click", function () { askSeedbot(c.getAttribute("data-prompt") || c.textContent); });
    });
  }

/* --------------------------- FAQ accordion ------------------------ */
  function initFaq() {
    const accs = $$(".acc");
    if (!accs.length) return;
    accs.forEach(function (acc) {
      const btn = $(".acc-btn", acc);
      const panel = $(".acc-panel", acc);
      if (!btn || !panel) return;
      btn.addEventListener("click", function () {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
        acc.classList.toggle("is-open", !open);
      });
    });
  }

  /* ------------------------- pointer tilt (shared) ------------------- */
  // "tilts toward the pointer" for the active coverflow card + formats cards.
  function initTilt() {
    if (isTouch() || motionOff()) return;
    const px = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    window.addEventListener("pointermove", function (e) { px.x = e.clientX; px.y = e.clientY; }, { passive: true });

    const acc = { x: 0, y: 0 };
    let armed = null;

    TICKER.add(function (dt) {
      const target = document.querySelector(".cf-card.is-active .cf-inner");
      const hov = !target ? document.querySelector(".glass-card:hover") : null;
      const el = target || hov;
      if (!el) {
        if (armed && document.body.contains(armed)) armed.classList.remove("is-tilt");
        armed = null;
        acc.x = 0; acc.y = 0;
        return;
      }
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const vars = target ? ["--tx", "--ty"] : ["--tile-rx", "--tile-ry"];
      const speed = target ? 14 : 8;
      const amp = target ? [7, 9] : [6, 8];
      const dx = clampNum((px.x - (r.left + r.width / 2)) / 520, -1, 1);
      const dy = clampNum((px.y - (r.top + r.height / 2)) / 520, -1, 1);
      acc.x = lerp(acc.x, -dy * amp[0], Math.min(dt * speed, 0.35));
      acc.y = lerp(acc.y, dx * amp[1], Math.min(dt * speed, 0.35));
      el.style.setProperty(vars[0], acc.x.toFixed(2) + "deg");
      el.style.setProperty(vars[1], acc.y.toFixed(2) + "deg");
      el.classList.add("is-tilt");
      if (armed && armed !== el) armed.classList.remove("is-tilt");
      armed = el;
    });
    window.addEventListener("pointerleave", function () { px.x = window.innerWidth / 2; px.y = window.innerHeight / 2; });
  }

  /* ------------------------ free workshop form ---------------------- */
  function setFieldError(fieldId, errId, show) {
    const field = $("#" + fieldId);
    const err = $("#" + errId);
    if (!field || !err) return;
    const wrap = field.closest(".field") || field;
    wrap.classList.toggle("has-error", !!show);
    err.hidden = !show;
    field.setAttribute("aria-invalid", show ? "true" : "false");
  }
  function initWorkshop() {
    const form = $("#workshopForm");
    if (!form) return;
    const role = $("#wsRole");
    const ageField = $("#wsAgeField");
    const success = $("#workshopSuccess");
    const successBody = $("#workshopSuccessBody");

    if (role && ageField) {
      role.addEventListener("change", function () {
        const isParent = role.value === "parent";
        ageField.hidden = !isParent;
        if (!isParent) { const a = $("#wsAge"); if (a) a.value = ""; }
      });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let ok = true;

      const name = $("#wsName"), email = $("#wsEmail"), age = $("#wsAge");
      if (!name.value.trim()) { setFieldError("wsName", "wsNameErr", true); ok = false; } else setFieldError("wsName", "wsNameErr", false);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { setFieldError("wsEmail", "wsEmailErr", true); ok = false; } else setFieldError("wsEmail", "wsEmailErr", false);
      if (!role.value) { setFieldError("wsRole", "wsRoleErr", true); ok = false; } else setFieldError("wsRole", "wsRoleErr", false);
      if (!ageField.hidden) {
        if (!age.value) { setFieldError("wsAge", "wsAgeErr", true); ok = false; } else setFieldError("wsAge", "wsAgeErr", false);
      }
      if (!ok) {
        const firstBad = $(".field.has-error input, .field.has-error select");
        if (firstBad) firstBad.focus();
        return;
      }

      const data = {
        name: name.value.trim(),
        email: email.value.trim(),
        audience: role.value,
        child_age_band: ageField.hidden ? "" : age.value
      };
      submitLead(data);
      if (successBody) successBody.textContent = "Thanks " + data.name + ", we will send the free workshop details to " + data.email + ".";
      form.hidden = true;
      success.hidden = false;
      if (success) success.querySelector("#workshopAgain").focus();
    });
    const again = $("#workshopAgain");
    if (again) again.addEventListener("click", function () {
      success.hidden = true;
      form.hidden = false;
      form.reset();
      if (ageField) ageField.hidden = true;
      const n = $("#wsName");
      if (n) n.focus();
    });
    // clear the error styling as the visitor types again
    $$("#workshopForm input, #workshopForm select").forEach(function (el) {
      el.addEventListener("input", function () {
        const wrap = el.closest(".field");
        if (wrap) wrap.classList.remove("has-error");
        const err = $("#" + el.id + "Err");
        if (err) err.hidden = true;
      });
    });
  }

  function init() {
    initPreloader();
    initNav();
    initModals();
    applyConfig();
    initReduceMotion();
    initCursorGlow();
    initTilt();
    initWiring();
    initReveals();
    initCounters();
    initHowPath();
    initCarousel();
    initLadder();
    initWho();
    initChat();
    initFaq();
    initWorkshop();
    const yr = $("#year");
    if (yr) yr.textContent = String(new Date().getFullYear());
  }
  function refresh() {
    if (window.Scene3D) Scene3D.refresh();
  }

  return {
    init: init,
    refresh: refresh,
    refreshConfig: function () { applyConfig(); },
    openLevel: function (level) { if (api.openLevel) api.openLevel(level); }
  };
})();
window.Landing = Landing;

/* =============================== REGISTER =============================
   Stage 3 replaces the placeholder view with four different registration
   experiences. The route already exists so navigation works today.
   ====================================================================== */
const REGISTER = {
  mount: function () {
    /* TODO (Stage 3): entry screen "#/register" with four 3D-tilt cards:
       parent registering a child (6 to 12), teenager (13 to 17, parent
       consent), adult, and professional. Wire to Supabase Auth + database. */
  }
};

/* ================================= LOGIN ==============================
   Stage 4 adds sign-in, sign-out, password reset and role routing.
   ====================================================================== */
const LOGIN = {
  mount: function () {
    /* TODO (Stage 4): email and password sign-in, password reset, then
       role routing to the correct dashboard with Kid mode PIN support. */
  }
};

/* ============================ DASHBOARD SHELL ========================= */
const DASHBOARD_SHELL = {
  mount: function () {
    /* TODO (Stage 5): shared dashboard frame: sidebar, top bar, notification
       bell, greeting + role badge, and the guest, learner and parent views. */
  }
};

/* ================================= LEARNER =========================== */
const LEARNER = {
  mount: function () { /* TODO (Stage 5): learner home, my class, my work, my project showcase. */ }
};

/* ================================= PARENT ============================ */
const PARENT = {
  mount: function () { /* TODO (Stage 5): child profiles, progress, billing/notifications, messages. */ }
};

/* =============================== INSTRUCTOR ========================== */
const INSTRUCTOR = {
  mount: function () { /* TODO (Stage 6): classes, attendance, assignments, grading, messages. */ }
};

/* ================================== ADMIN ============================ */
const ADMIN = {
  mount: function () { /* TODO (Stage 7): users, roles, courses, classes, announcements, audit log. */ }
};

/* ============================== NOTIFICATIONS ======================== */
const NOTIFICATIONS = {
  mount: function () { /* TODO (Stage 5): bell menu, unread counts, realtime updates from Supabase. */ }
};

/* =============================== BOOTSTRAP ===========================
   Order matters: resolve the reduced-motion state and render the active
   view before the 3D scene and the landing handlers start.
   ====================================================================== */
window.GSAPRefresh = GSAPRefresh;

(async function bootstrap() {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  STATE.reducedMotion = prefersReducedMotion();
  TICKER.start();
  ROUTER.start();          // renders the initial view and calls Landing.init()
  Landing.init();
  if (STATE.view === "landing" && window.Scene3D) Scene3D.onEnter();
  document.body.classList.add("is-ready");
  // Optional second pass: a real .env file (same folder) overrides the defaults.
  try {
    if (await bootEnv() && window.Landing && Landing.refreshConfig) Landing.refreshConfig();
  } catch (err) { /* keep the placeholder fallbacks */ }
})();