import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createITSALogoGroup } from '../3d/itsaLogoGeometry';
import { setupITSALighting } from '../3d/itsaLogoMaterial';

export const ITSA3DLogo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. Lighting & Procedural 3D Geometry
    const lighting = setupITSALighting(scene);
    const logoGroup = createITSALogoGroup();
    scene.add(logoGroup);

    // Initial scale & opacity for 1.5s intro assembly transition
    logoGroup.scale.set(0.001, 0.001, 0.001);
    let introProgress = 0;

    // 3. Interaction state variables
    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };
    let scrollY = window.scrollY;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      targetRotation.y = mouseX * 0.35;
      targetRotation.x = -mouseY * 0.25;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      scrollVelocity = (scrollY - lastScrollY) * 0.002;
      lastScrollY = scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 4. Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Intro assembly animation (0 -> 1.5s)
      if (introProgress < 1) {
        introProgress += 0.015;
        const scaleVal = Math.min(1, introProgress);
        logoGroup.scale.set(scaleVal, scaleVal, scaleVal);
      }

      // Smooth inertia damping for mouse tilt
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

      // Decay scroll velocity
      scrollVelocity *= 0.92;

      // Idle movement + Mouse inertia + Scroll velocity response
      logoGroup.rotation.y = elapsedTime * 0.2 + currentRotation.y + scrollVelocity * 2.0;
      logoGroup.rotation.x = currentRotation.x + Math.sin(elapsedTime * 0.8) * 0.05;
      logoGroup.rotation.z = Math.cos(elapsedTime * 0.5) * 0.03;

      // Floating sine wave & pulse breathing
      logoGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      const pulse = 1.0 + Math.sin(elapsedTime * 2.0) * 0.02;
      if (introProgress >= 1) {
        logoGroup.scale.set(pulse, pulse, pulse);
      }

      // Dynamic light shifts
      lighting.fillLight.intensity = 3.5 + Math.sin(elapsedTime * 3) * 1.0;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Localized background backdrop mask to suppress video-embedded symbol seamlessly */}
      <div
        style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,8,20,0.75) 0%, rgba(0,8,20,0.3) 55%, rgba(0,8,20,0) 80%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* 3D WebGL Canvas Overlay for Procedural ITSA Logo */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
    </div>
  );
};
