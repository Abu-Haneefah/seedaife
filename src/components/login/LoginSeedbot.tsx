'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motionOff } from '@/lib/ticker';

export type MascotReaction = 'idle' | 'focus-email' | 'focus-password' | 'success' | 'error';

interface LoginSeedbotProps {
  reaction?: MascotReaction;
  className?: string;
}

const COL = {
  plum: 0x2a1450,
  lime: 0xb8f23c,
  bright: 0xd9ff7a,
  cream: 0xfff8e7,
};

export default function LoginSeedbot({ reaction = 'idle', className = '' }: LoginSeedbotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const currentReactionRef = useRef<MascotReaction>(reaction);
  currentReactionRef.current = reaction;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let root: THREE.Group | null = null;
    let head: THREE.Group | null = null;
    let armL: THREE.Group | null = null;
    let armR: THREE.Group | null = null;
    let eyeballs: THREE.Mesh[] = [];
    let leaf: THREE.Mesh | null = null;

    let animId = 0;
    let targetHeadRotY = 0;
    let targetHeadRotX = 0;
    let targetRootY = 0;
    let targetArmLRotZ = 0;
    let targetArmRRotZ = 0;
    let targetArmLRotX = 0;
    let targetArmRRotX = 0;
    let blinkTimer = 0;
    let isBlinking = false;
    let shakeTimer = 0;
    let hopTimer = 0;

    const width = canvas.parentElement?.clientWidth || 320;
    const height = canvas.parentElement?.clientHeight || 420;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.4, 6.2);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xfff8e7, 0x180a31, 1.2);
    const dirLight = new THREE.DirectionalLight(COL.lime, 1.4);
    dirLight.position.set(3, 4, 4);
    const rimLight = new THREE.DirectionalLight(0xa98bff, 1.1);
    rimLight.position.set(-3, 2, -2);
    scene.add(hemiLight, dirLight, rimLight);

    // Helpers
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
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
      });
      geo.center();
      return geo;
    }

    function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      return m;
    }

    // Build Mascot
    const limeMat = new THREE.MeshStandardMaterial({ color: COL.lime, roughness: 0.45, metalness: 0.1 });
    const plumMat = new THREE.MeshStandardMaterial({ color: COL.plum, roughness: 0.36, metalness: 0.16 });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: COL.bright,
      emissive: COL.lime,
      emissiveIntensity: 0.95,
      roughness: 0.3,
    });

    root = new THREE.Group();
    head = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);
    body.add(head);

    // Head components
    head.add(mesh(roundedBox(2.0, 1.76, 1.15, 0.54), limeMat, 0, 0.6, 0));
    head.add(mesh(roundedBox(1.42, 0.84, 0.2, 0.32), plumMat, 0, 0.62, 0.56));

    [-0.31, 0.31].forEach((x) => {
      const e = mesh(roundedBox(0.22, 0.36, 0.12, 0.1), eyeMat, x, 0.63, 0.65);
      eyeballs.push(e);
      head!.add(e);
    });

    // Ear pods
    head.add(mesh(roundedBox(0.38, 0.74, 0.56, 0.16), limeMat, -1.12, 0.6, 0));
    head.add(mesh(roundedBox(0.38, 0.74, 0.56, 0.16), limeMat, 1.12, 0.6, 0));
    head.add(mesh(roundedBox(0.1, 0.3, 0.3, 0.05), plumMat, -1.3, 0.6, 0));
    head.add(mesh(roundedBox(0.1, 0.3, 0.3, 0.05), plumMat, 1.3, 0.6, 0));

    // Sprout antenna
    const stem = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 12), limeMat, 0, 1.75, 0);
    head.add(stem);
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(0.1, 0.34, 0.5, 0.44, 0.82, 0.36);
    leafShape.bezierCurveTo(0.62, 0.02, 0.24, -0.06, 0, 0);
    const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    leafGeo.center();
    leaf = new THREE.Mesh(leafGeo, limeMat);
    leaf.position.set(0.35, 2.05, 0);
    leaf.rotation.z = 0.42;
    head.add(leaf);

    // Body
    body.add(mesh(roundedBox(0.5, 0.24, 0.5, 0.08), plumMat, 0, -0.4, 0));
    body.add(mesh(roundedBox(1.58, 0.6, 0.84, 0.26), limeMat, 0, -0.84, 0));

    // Arms
    armL = new THREE.Group();
    armL.position.set(-0.88, -0.68, 0);
    armL.add(mesh(roundedBox(0.32, 1.05, 0.34, 0.15), limeMat, 0, -0.48, 0));
    body.add(armL);

    armR = new THREE.Group();
    armR.position.set(0.88, -0.68, 0);
    armR.add(mesh(roundedBox(0.32, 1.05, 0.34, 0.15), limeMat, 0, -0.48, 0));
    body.add(armR);

    scene.add(root);

    // Mouse pointer listener
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = Math.max(-1, Math.min(1, x));
      mouseY = Math.max(-1, Math.min(1, y));
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle resize
    const handleResize = () => {
      if (!canvas.parentElement || !renderer || !camera) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Render loop
    let clock = 0;
    const render = () => {
      clock += 0.024;
      const r = currentReactionRef.current;

      // Handle reaction animations
      if (r === 'focus-password') {
        // Hands up covering eyes/visor!
        targetHeadRotX = 0.1;
        targetHeadRotY = 0;
        targetArmLRotZ = 1.6;
        targetArmRRotZ = -1.6;
        targetArmLRotX = -1.45;
        targetArmRRotX = -1.45;
      } else if (r === 'focus-email') {
        // Leaning and looking right toward form inputs
        targetHeadRotY = 0.38;
        targetHeadRotX = -0.15;
        targetArmLRotZ = 0.1;
        targetArmRRotZ = -0.15;
        targetArmLRotX = 0.1;
        targetArmRRotX = 0.1;
      } else if (r === 'success') {
        // Joyous bounce / hop
        hopTimer += 0.12;
        targetRootY = Math.abs(Math.sin(hopTimer)) * 0.45;
        targetHeadRotY = Math.sin(hopTimer * 0.8) * 0.2;
        targetHeadRotX = -0.1;
        targetArmLRotZ = 2.2;
        targetArmRRotZ = -2.2;
        targetArmLRotX = 0;
        targetArmRRotX = 0;
      } else if (r === 'error') {
        // Head shake "no-no"
        shakeTimer += 0.18;
        targetRootY = 0;
        targetHeadRotY = Math.sin(shakeTimer * 2.5) * 0.45;
        targetHeadRotX = 0.08;
        targetArmLRotZ = 0.35;
        targetArmRRotZ = -0.35;
        targetArmLRotX = 0.2;
        targetArmRRotX = 0.2;
      } else {
        // Idle tracking mouse
        targetRootY = Math.sin(clock * 1.5) * 0.08;
        targetHeadRotY = mouseX * 0.35;
        targetHeadRotX = -mouseY * 0.22;
        targetArmLRotZ = Math.sin(clock * 1.8) * 0.08;
        targetArmRRotZ = -Math.sin(clock * 1.8) * 0.08;
        targetArmLRotX = 0;
        targetArmRRotX = 0;
      }

      // Smooth lerp
      if (head && root && armL && armR) {
        head.rotation.y += (targetHeadRotY - head.rotation.y) * 0.12;
        head.rotation.x += (targetHeadRotX - head.rotation.x) * 0.12;
        root.position.y += (targetRootY - root.position.y) * 0.15;
        armL.rotation.z += (targetArmLRotZ - armL.rotation.z) * 0.14;
        armR.rotation.z += (targetArmRRotZ - armR.rotation.z) * 0.14;
        armL.rotation.x += (targetArmLRotX - armL.rotation.x) * 0.14;
        armR.rotation.x += (targetArmRRotX - armR.rotation.x) * 0.14;
      }

      // Leaf gentle sway
      if (leaf) {
        leaf.rotation.z = 0.42 + Math.sin(clock * 2.2) * 0.12;
      }

      // Blinking
      blinkTimer++;
      if (blinkTimer > 180 && !isBlinking) {
        isBlinking = true;
        blinkTimer = 0;
      }
      if (isBlinking) {
        eyeballs.forEach((e) => (e.scale.y = 0.1));
        if (blinkTimer > 8) {
          isBlinking = false;
          blinkTimer = 0;
          eyeballs.forEach((e) => (e.scale.y = 1));
        }
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div className={`login-mascot-wrap ${className}`}>
      {webGlSupported ? (
        <canvas ref={canvasRef} className="login-seedbot-canvas" />
      ) : (
        <div className={`login-mascot-fallback reaction-${reaction}`}>
          <div className="mascot-robot-face">
            <div className="mascot-head">
              <div className="mascot-eyes">
                <span className="mascot-eye" />
                <span className="mascot-eye" />
              </div>
            </div>
            <div className="mascot-badge">Seedbot</div>
          </div>
        </div>
      )}
      <div className="login-mascot-speech">
        {reaction === 'focus-email' && "What's your Seed AI email?"}
        {reaction === 'focus-password' && "I'm not looking! Your password is safe 🙈"}
        {reaction === 'success' && 'Welcome back, builder! 🎉'}
        {reaction === 'error' && "Oops! Let's double check those details."}
        {reaction === 'idle' && 'Ready to build with AI today?'}
      </div>
    </div>
  );
}
