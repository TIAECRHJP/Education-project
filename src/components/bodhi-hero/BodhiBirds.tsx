/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BirdEntity, DeviceCapabilities } from './types';

interface BodhiBirdsProps {
  device: DeviceCapabilities;
  burstTrigger: number;
  burstOrigin?: { x: number; y: number } | null;
  darkMode?: boolean;
}

export const BodhiBirds: React.FC<BodhiBirdsProps> = ({
  device,
  burstTrigger,
  burstOrigin,
  darkMode = false,
}) => {
  const [birds, setBirds] = useState<BirdEntity[]>([]);
  const birdsRef = useRef<BirdEntity[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const flockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to compute quadratic Bezier position
  const getBezierPoint = (
    p0: number,
    p1: number,
    p2: number,
    t: number
  ): number => {
    const oneMinusT = 1 - t;
    return oneMinusT * oneMinusT * p0 + 2 * oneMinusT * t * p1 + t * t * p2;
  };

  // Helper to compute tangent angle in degrees
  const getBezierAngle = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    t: number
  ): number => {
    const dx = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1);
    const dy = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  // Spawn an initial takeoff bird from canopy edge
  const createTakeoffBird = useCallback((index: number, total: number): BirdEntity => {
    // Canopy edge: x 30% to 70%, y 42% to 58% (safe from top 30% tagline)
    const flyLeft = index % 2 === 0;
    const startX = 35 + (index / total) * 30 + (Math.random() * 6 - 3);
    const startY = 44 + Math.random() * 14;

    // Must never enter the top 30% (where tagline sits)
    // Control point and destination stay strictly at or below y: 30%
    const endX = flyLeft ? -8 - Math.random() * 10 : 108 + Math.random() * 10;
    const endY = 31 + Math.random() * 14; // below 30%
    const controlX = flyLeft ? startX - 20 - Math.random() * 15 : startX + 20 + Math.random() * 15;
    const controlY = Math.max(30.5, Math.min(startY - 10, endY - 6)); // ensure >= 30.5%

    return {
      id: `takeoff_${index}_${Date.now()}_${Math.random()}`,
      startX,
      startY,
      controlX,
      controlY,
      endX,
      endY,
      startScale: 0.95 + Math.random() * 0.25,
      endScale: 0.42 + Math.random() * 0.15, // gets smaller as it flies away (depth)
      progress: 0,
      duration: 5200 + Math.random() * 2000,
      startTime: performance.now() + index * 320, // staggered launch
      flapSpeed: 0.32 + Math.random() * 0.12,
      flightAngle: flyLeft ? -15 : 15,
      color: darkMode ? '#3b2f1f' : '#292218',
      active: true,
    };
  }, [darkMode]);

  // Spawn a crossing flock bird
  const createFlockBird = useCallback((flockIndex: number, flyLeft: boolean): BirdEntity => {
    // Random height strictly below top 30% tagline: y: 32% to 56%
    const startY = 32 + Math.random() * 22;
    const endY = Math.max(30.5, startY + (Math.random() * 10 - 5));
    const startX = flyLeft ? 106 + flockIndex * 4 : -6 - flockIndex * 4;
    const endX = flyLeft ? -10 : 110;
    const controlX = 50 + (Math.random() * 20 - 10);
    const controlY = Math.max(30.2, (startY + endY) / 2 + (Math.random() * 6 - 3));

    return {
      id: `flock_${Date.now()}_${flockIndex}_${Math.random()}`,
      startX,
      startY,
      controlX,
      controlY,
      endX,
      endY,
      startScale: 0.55 + Math.random() * 0.2,
      endScale: 0.5 + Math.random() * 0.2,
      progress: 0,
      duration: 10000 + Math.random() * 3000,
      startTime: performance.now() + flockIndex * 280,
      flapSpeed: 0.36 + Math.random() * 0.1,
      flightAngle: flyLeft ? 180 : 0,
      color: darkMode ? '#362b1b' : '#33291d',
      active: true,
    };
  }, [darkMode]);

  // Initial takeoff sequence on page load
  useEffect(() => {
    if (device.prefersReducedMotion) return;

    // Low-end reduction: 3 birds instead of 7
    const count = device.isLowEnd ? 3 : 6;
    const initialBirds: BirdEntity[] = [];
    for (let i = 0; i < count; i++) {
      initialBirds.push(createTakeoffBird(i, count));
    }

    birdsRef.current = initialBirds;
    setBirds([...initialBirds]);

    // Schedule crossing flocks every 14 - 18 seconds
    const scheduleNextFlock = () => {
      const delay = (device.isLowEnd ? 20 : 14 + Math.random() * 4) * 1000;
      flockTimerRef.current = setTimeout(() => {
        if (document.hidden) {
          scheduleNextFlock();
          return;
        }

        const flockSize = device.isLowEnd ? 2 : 3 + Math.floor(Math.random() * 2);
        const flyLeft = Math.random() > 0.5;
        const newFlock: BirdEntity[] = [];
        for (let j = 0; j < flockSize; j++) {
          newFlock.push(createFlockBird(j, flyLeft));
        }

        // Add to active pool
        birdsRef.current = [...birdsRef.current.filter(b => b.active), ...newFlock];
        scheduleNextFlock();
      }, delay);
    };

    scheduleNextFlock();

    return () => {
      if (flockTimerRef.current) clearTimeout(flockTimerRef.current);
    };
  }, [device, createTakeoffBird, createFlockBird]);

  // Interactive Click / Tap Burst (6 birds scattering)
  useEffect(() => {
    if (burstTrigger === 0 || device.prefersReducedMotion) return;

    const burstCount = device.isLowEnd ? 3 : 6;
    const originX = burstOrigin ? burstOrigin.x : 50;
    const originY = burstOrigin ? Math.max(38, burstOrigin.y) : 52;
    const burstBirds: BirdEntity[] = [];

    for (let k = 0; k < burstCount; k++) {
      const angleRad = ((k / burstCount) * 180 + 190) * (Math.PI / 180); // upward arc
      const flyLeft = Math.cos(angleRad) < 0;
      const endX = flyLeft ? -10 - Math.random() * 15 : 110 + Math.random() * 15;
      const endY = 31 + Math.random() * 15; // stays below 30% tagline
      const controlX = originX + Math.cos(angleRad) * 25;
      const controlY = Math.max(31, originY + Math.sin(angleRad) * 15);

      burstBirds.push({
        id: `burst_${Date.now()}_${k}`,
        startX: originX + (Math.random() * 6 - 3),
        startY: originY + (Math.random() * 4 - 2),
        controlX,
        controlY,
        endX,
        endY,
        startScale: 0.9 + Math.random() * 0.25,
        endScale: 0.4 + Math.random() * 0.15,
        progress: 0,
        duration: 4800 + Math.random() * 1800,
        startTime: performance.now() + k * 120,
        flapSpeed: 0.28 + Math.random() * 0.08,
        flightAngle: flyLeft ? -25 : 25,
        color: darkMode ? '#4a3a25' : '#1f1912',
        active: true,
      });
    }

    birdsRef.current = [...birdsRef.current, ...burstBirds];
  }, [burstTrigger, burstOrigin, device, darkMode]);

  // Main animation frame loop
  useEffect(() => {
    if (device.prefersReducedMotion) return;

    let isRunning = true;

    const renderLoop = (time: number) => {
      if (!isRunning) return;

      const currentPool = birdsRef.current;
      let hasActive = false;

      for (let i = 0; i < currentPool.length; i++) {
        const b = currentPool[i];
        if (!b.active) continue;

        if (time < b.startTime) {
          hasActive = true;
          continue;
        }

        const elapsed = time - b.startTime;
        const t = Math.min(1, elapsed / b.duration);
        b.progress = t;

        if (t >= 1) {
          b.active = false;
        } else {
          hasActive = true;
        }
      }

      // Keep only active birds or scheduled birds
      const cleaned = currentPool.filter(b => b.active);
      birdsRef.current = cleaned;
      setBirds([...cleaned]);

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [device.prefersReducedMotion]);

  if (device.prefersReducedMotion || birds.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-20"
      aria-hidden="true"
    >
      <style>{`
        @keyframes bodhiWingLeft {
          0% { transform: scaleY(0.9) rotate(-14deg); }
          100% { transform: scaleY(-0.75) rotate(24deg); }
        }
        @keyframes bodhiWingRight {
          0% { transform: scaleY(0.9) rotate(14deg); }
          100% { transform: scaleY(-0.75) rotate(-24deg); }
        }
      `}</style>

      {birds.map(bird => {
        if (bird.progress <= 0 || !bird.active) return null;

        // Position via Bézier interpolation
        const posX = getBezierPoint(bird.startX, bird.controlX, bird.endX, bird.progress);
        const rawY = getBezierPoint(bird.startY, bird.controlY, bird.endY, bird.progress);

        // Strict clamp: never enter top 30% (tagline boundary)
        const posY = Math.max(30.2, rawY);

        const currentScale =
          bird.startScale + (bird.endScale - bird.startScale) * bird.progress;
        const currentAngle = getBezierAngle(
          bird.startX,
          bird.startY,
          bird.controlX,
          bird.controlY,
          bird.endX,
          bird.endY,
          bird.progress
        );

        // Gentle up-down bobbing wave
        const bob = Math.sin(bird.progress * Math.PI * 8) * 0.6;
        const finalY = posY + bob;

        return (
          <div
            key={bird.id}
            className="absolute transition-opacity duration-300"
            style={{
              left: `${posX}%`,
              top: `${finalY}%`,
              transform: `translate(-50%, -50%) rotate(${currentAngle}deg) scale(${currentScale})`,
              opacity: bird.progress > 0.88 ? (1 - bird.progress) / 0.12 : 1,
              willChange: 'transform, left, top',
            }}
          >
            {/* Inline Flapping Silhouette SVG */}
            <svg
              viewBox="-24 -16 48 32"
              className="w-7 h-5 sm:w-9 sm:h-6 overflow-visible filter drop-shadow-sm"
              style={{ color: bird.color }}
            >
              {/* Left Wing */}
              <path
                d="M 0,-1.5 C -7,-9 -15,-12 -21,-8 C -17,-2 -9,0 0,0"
                fill="currentColor"
                style={{
                  transformOrigin: '0px 0px',
                  animation: `bodhiWingLeft ${bird.flapSpeed}s ease-in-out infinite alternate`,
                }}
              />
              {/* Right Wing */}
              <path
                d="M 0,-1.5 C 7,-9 15,-12 21,-8 C 17,-2 9,0 0,0"
                fill="currentColor"
                style={{
                  transformOrigin: '0px 0px',
                  animation: `bodhiWingRight ${bird.flapSpeed}s ease-in-out infinite alternate`,
                }}
              />
              {/* Bird Torso & Tail */}
              <path
                d="M -1,-4 C -1,-6 0,-7 1,-6 C 2,-4 1.5,4 0,7 C -1.5,4 -1,-4 -1,-4 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
