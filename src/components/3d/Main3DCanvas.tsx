import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SceneSettings, SectionBackground, PerformanceMode } from '../../types';
import { SmoothBackground } from '../public/SmoothBackground';

interface Main3DCanvasProps {
  scrollProgress: number; // 0 to 1
  activeSection: 'pembukaan' | 'struktur' | 'anggota' | 'foto' | 'penutup';
  sceneSettingsList: SceneSettings[];
  activeBackground?: SectionBackground;
  performanceMode: PerformanceMode;
  reducedMotion: boolean;
  theme?: 'dark' | 'light';
}

export const Main3DCanvas: React.FC<Main3DCanvasProps> = ({
  scrollProgress,
  activeSection,
  sceneSettingsList,
  activeBackground,
  performanceMode,
  reducedMotion,
  theme = 'dark'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // References to preserve Three objects across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const orbitalGroupRef = useRef<THREE.Group | null>(null);
  const structuresGroupRef = useRef<THREE.Group | null>(null);
  const bgMeshRef = useRef<THREE.Mesh | null>(null);

  // Mouse parallax target
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Handle mouse move for subtle parallax
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Small parallax effect
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x * 0.15;
      mouseRef.current.targetY = y * 0.15;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  // Main Three.js setup and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detect device performance capability
    const isMobile = window.innerWidth < 768;
    let particleCount = 3500;
    if (performanceMode === 'LOW') particleCount = 800;
    else if (performanceMode === 'MEDIUM') particleCount = 1800;
    else particleCount = 3500; // HIGH or AUTO defaults to high performance

    const isLight = theme === 'light';

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(isLight ? 0xf8fafc : 0x080808, 0.015);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: performanceMode !== 'LOW',
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    // ------------------- 1. PARTICLE SYSTEM -------------------
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120; // Spread along z-depth
      scales[i] = Math.random() * 0.12 + 0.03;
      alphas[i] = Math.random() * 0.8 + 0.2;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Particle Shader Material - Netflix Red & Star Dust
    const particlesMaterial = new THREE.PointsMaterial({
      color: isLight ? 0xdc2626 : 0xe50914,
      size: 0.13,
      transparent: true,
      opacity: isLight ? 0.6 : 0.85,
      blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesMeshRef.current = particlesMesh;
    scene.add(particlesMesh);

    // ------------------- 2. ORBITAL LIGHT LINES -------------------
    const orbitalGroup = new THREE.Group();
    orbitalGroupRef.current = orbitalGroup;

    const lineCount = isMobile ? 3 : 6;
    for (let l = 0; l < lineCount; l++) {
      const curvePoints: THREE.Vector3[] = [];
      const radius = 8 + l * 2.5;
      const segments = 60;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const x = Math.cos(theta) * radius + (Math.random() - 0.5) * 0.5;
        const y = Math.sin(theta) * (radius * 0.6) + (Math.random() - 0.5) * 0.5;
        const z = Math.sin(theta * 2) * 4 - l * 10;
        curvePoints.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(curvePoints, true);
      const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.018, 8, true);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: isLight ? (l % 2 === 0 ? 0xdc2626 : 0xf43f5e) : (l % 2 === 0 ? 0xe50914 : 0xff4d56),
        wireframe: l % 3 === 0,
        transparent: true,
        opacity: isLight ? 0.35 : 0.45
      });
      const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      tubeMesh.rotation.x = Math.PI * 0.2 * l;
      tubeMesh.rotation.y = Math.PI * 0.1 * l;
      orbitalGroup.add(tubeMesh);
    }
    scene.add(orbitalGroup);

    // ------------------- 3. SILICON ABSTRACT STRUCTURES -------------------
    const structuresGroup = new THREE.Group();
    structuresGroupRef.current = structuresGroup;

    const panelGeo = new THREE.BoxGeometry(3, 3, 0.1);
    const panelMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xe2e8f0 : 0x0b1011,
      metalness: isLight ? 0.2 : 0.8,
      roughness: isLight ? 0.8 : 0.3,
      wireframe: false
    });

    for (let p = 0; p < (isMobile ? 4 : 8); p++) {
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        -p * 15 - 5
      );
      panel.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      structuresGroup.add(panel);
    }
    scene.add(structuresGroup);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x112225, 1.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7edde3, 2, 50);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Resize listener
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // ------------------- ANIMATION RENDER LOOP -------------------
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Camera journey based on scroll progress
      if (cameraRef.current) {
        if (reducedMotion) {
          cameraRef.current.position.set(0, 0, 15);
          cameraRef.current.lookAt(0, 0, 0);
        } else {
          // Camera travels along Z path from +15 to -80
          const targetZ = 15 - scrollProgress * 95;
          const targetX = Math.sin(scrollProgress * Math.PI * 2) * 2.5 + mouseRef.current.x;
          const targetY = Math.cos(scrollProgress * Math.PI * 1.5) * 1.5 + mouseRef.current.y;

          cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.08;
          cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.08;
          cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.08;

          cameraRef.current.lookAt(
            mouseRef.current.x * 2,
            mouseRef.current.y * 2,
            cameraRef.current.position.z - 20
          );
        }
      }

      // Rotate orbital rings
      if (orbitalGroupRef.current && !reducedMotion) {
        orbitalGroupRef.current.rotation.z = elapsedTime * 0.05;
        orbitalGroupRef.current.rotation.y = elapsedTime * 0.03;
      }

      // Slowly rotate structures
      if (structuresGroupRef.current && !reducedMotion) {
        structuresGroupRef.current.children.forEach((child, i) => {
          child.rotation.x += 0.002 * (i % 2 === 0 ? 1 : -1);
          child.rotation.y += 0.003;
        });
      }

      // Slowly float particles
      if (particlesMeshRef.current && !reducedMotion) {
        particlesMeshRef.current.rotation.y = elapsedTime * 0.02;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [performanceMode, reducedMotion, theme]);

  // Update particle colors / scene presets when active section changes
  useEffect(() => {
    if (!particlesMeshRef.current) return;
    const currentSetting = sceneSettingsList.find(s => s.section_key === activeSection);
    if (currentSetting) {
      const colorHex = parseInt(currentSetting.particle_settings.color.replace('#', ''), 16);
      (particlesMeshRef.current.material as THREE.PointsMaterial).color.setHex(colorHex);
    }
  }, [activeSection, sceneSettingsList]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Smooth Background image overlay layer */}
      <SmoothBackground activeBackground={activeBackground} />
    </div>
  );
};
