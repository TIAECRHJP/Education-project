/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { DeviceCapabilities, ParticleEntity } from './types';

interface BodhiParticlesProps {
  device: DeviceCapabilities;
  darkMode?: boolean;
  mousePos?: { x: number; y: number } | null;
}

export const BodhiParticles: React.FC<BodhiParticlesProps> = ({
  device,
  darkMode = false,
  mousePos,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ParticleEntity[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    if (device.prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI resize
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize 40 to 60 golden fireflies (20 on low-end)
    const particleCount = device.isLowEnd ? 20 : 50;
    const particles: ParticleEntity[] = [];

    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 600;

    for (let i = 0; i < particleCount; i++) {
      // Spawn near trunk and roots: x 44% to 56%, y 72% to 95%
      const px = (0.44 + Math.random() * 0.12) * w;
      const py = (0.72 + Math.random() * 0.23) * h;

      particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -0.35 - Math.random() * 0.65, // rising upwards
        radius: 1.2 + Math.random() * (darkMode ? 2.4 : 1.8),
        baseAlpha: 0.4 + Math.random() * 0.4,
        currentAlpha: 0.5,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        color: darkMode ? '#fef08a' : '#f59e0b',
        glowColor: darkMode ? 'rgba(251, 191, 36, 0.45)' : 'rgba(245, 158, 11, 0.3)',
      });
    }

    particlesRef.current = particles;

    // Page Visibility API
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // IntersectionObserver to pause when hero is off-screen
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          isVisibleRef.current = entry.isIntersecting && !document.hidden;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Frame rate throttle: 30 FPS on low-end/mobile, 60 FPS on desktop
    const targetInterval = device.isLowEnd ? 1000 / 30 : 1000 / 60;

    const render = (time: number) => {
      if (!isVisibleRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const delta = time - lastFrameTimeRef.current;
      if (delta < targetInterval) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }
      lastFrameTimeRef.current = time - (delta % targetInterval);

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);

      const parts = particlesRef.current;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        // Twinkle opacity
        p.twinklePhase += p.twinkleSpeed;
        p.currentAlpha = p.baseAlpha + Math.sin(p.twinklePhase) * 0.35;
        p.currentAlpha = Math.max(0.1, Math.min(1, p.currentAlpha));

        // Upward drift
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.twinklePhase) * 0.25;

        // Desktop mouse attraction drift
        if (mousePos && !device.isLowEnd) {
          const dx = mousePos.x * width - p.x;
          const dy = mousePos.y * height - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 30000 && distSq > 400) {
            p.x += (dx / distSq) * 35;
            p.y += (dy / distSq) * 20;
          }
        }

        // Recycle when reaching canopy upper boundary (y <= 42% of height)
        if (p.y < height * 0.42) {
          p.x = (0.44 + Math.random() * 0.12) * width;
          p.y = (0.74 + Math.random() * 0.21) * height;
          p.vx = (Math.random() - 0.5) * 0.45;
          p.vy = -0.35 - Math.random() * 0.65;
          p.twinklePhase = Math.random() * Math.PI * 2;
        }

        // Draw soft glowing particle
        ctx.save();
        ctx.globalAlpha = p.currentAlpha * (darkMode ? 1.25 : 0.95);

        // Radial glow halo
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 3.5
        );
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.4, p.glowColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [device, darkMode, mousePos]);

  if (device.prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      aria-hidden="true"
    />
  );
};
