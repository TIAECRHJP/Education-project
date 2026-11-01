/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { LeafEntity, DeviceCapabilities } from './types';

interface BodhiLeavesProps {
  device: DeviceCapabilities;
  burstTrigger: number;
  burstOrigin?: { x: number; y: number } | null;
}

const PEAPAL_COLORS = [
  '#4ade80', // fresh green
  '#22c55e', // lush peepal green
  '#84cc16', // lime golden
  '#eab308', // pure gold
  '#f59e0b', // warm amber
  '#d97706', // copper gold
];

export const BodhiLeaves: React.FC<BodhiLeavesProps> = ({
  device,
  burstTrigger,
  burstOrigin,
}) => {
  const [leaves, setLeaves] = useState<LeafEntity[]>([]);
  const leavesRef = useRef<LeafEntity[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Generate a drifting peepal leaf
  const createDriftingLeaf = (id: string, initialY?: number): LeafEntity => {
    const startX = 26 + Math.random() * 48; // lower canopy zone
    const startY = initialY ?? (46 + Math.random() * 20); // strictly below 30% tagline

    return {
      id,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      rotation: Math.random() * 360,
      rotateY: Math.random() * 360,
      scale: 0.65 + Math.random() * 0.45,
      speed: 0.045 + Math.random() * 0.035, // percent per frame
      swayFreq: 0.015 + Math.random() * 0.02,
      swayAmp: 1.8 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
      color: PEAPAL_COLORS[Math.floor(Math.random() * PEAPAL_COLORS.length)],
      active: true,
    };
  };

  // Initialize leaves pool
  useEffect(() => {
    if (device.prefersReducedMotion) return;

    // 12 leaves on high-end, 5 on low-end
    const count = device.isLowEnd ? 5 : 12;
    const initialLeaves: LeafEntity[] = [];

    for (let i = 0; i < count; i++) {
      // Stagger vertically so leaves are already drifting on page open
      const initialY = 48 + (i / count) * 45;
      initialLeaves.push(createDriftingLeaf(`leaf_init_${i}`, initialY));
    }

    leavesRef.current = initialLeaves;
    setLeaves([...initialLeaves]);
  }, [device]);

  // Burst leaves on tree tap/click (12 leaves scatter out from tree)
  useEffect(() => {
    if (burstTrigger === 0 || device.prefersReducedMotion) return;

    const burstCount = device.isLowEnd ? 5 : 12;
    const originX = burstOrigin ? burstOrigin.x : 50;
    const originY = burstOrigin ? Math.max(42, burstOrigin.y) : 52;
    const burstLeaves: LeafEntity[] = [];

    for (let k = 0; k < burstCount; k++) {
      const offsetX = (Math.random() - 0.5) * 16;
      const offsetY = (Math.random() - 0.5) * 10;
      burstLeaves.push({
        id: `burst_leaf_${Date.now()}_${k}`,
        startX: originX + offsetX,
        startY: Math.max(38, originY + offsetY),
        currentX: originX + offsetX,
        currentY: Math.max(38, originY + offsetY),
        rotation: Math.random() * 360,
        rotateY: Math.random() * 360,
        scale: 0.75 + Math.random() * 0.5,
        speed: 0.06 + Math.random() * 0.05,
        swayFreq: 0.02 + Math.random() * 0.025,
        swayAmp: 2.5 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        color: PEAPAL_COLORS[Math.floor(Math.random() * PEAPAL_COLORS.length)],
        active: true,
      });
    }

    leavesRef.current = [...leavesRef.current, ...burstLeaves];
  }, [burstTrigger, burstOrigin, device]);

  // Animation frame update for falling sway
  useEffect(() => {
    if (device.prefersReducedMotion) return;

    let isRunning = true;

    const updateLeaves = () => {
      if (!isRunning) return;

      const pool = leavesRef.current;
      for (let i = 0; i < pool.length; i++) {
        const leaf = pool[i];
        if (!leaf.active) continue;

        leaf.phase += leaf.swayFreq;
        leaf.currentY += leaf.speed;
        leaf.currentX = leaf.startX + Math.sin(leaf.phase) * leaf.swayAmp;
        leaf.rotation += 0.35;
        leaf.rotateY += 0.5;

        // Reset when falling past the bottom of the hero (102%)
        if (leaf.currentY > 102) {
          if (leaf.id.startsWith('burst_leaf_')) {
            // Burst leaves expire
            leaf.active = false;
          } else {
            // Ambient leaves recycle back to the lower canopy
            leaf.currentY = 46 + Math.random() * 8;
            leaf.startX = 26 + Math.random() * 48;
            leaf.currentX = leaf.startX;
            leaf.phase = Math.random() * Math.PI * 2;
          }
        }
      }

      // Filter out dead burst leaves occasionally
      leavesRef.current = pool.filter(l => l.active);
      setLeaves([...leavesRef.current]);

      animFrameRef.current = requestAnimationFrame(updateLeaves);
    };

    animFrameRef.current = requestAnimationFrame(updateLeaves);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [device.prefersReducedMotion]);

  if (device.prefersReducedMotion || leaves.length === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-15"
      aria-hidden="true"
    >
      {leaves.map(leaf => (
        <div
          key={leaf.id}
          className="absolute"
          style={{
            left: `${leaf.currentX}%`,
            top: `${leaf.currentY}%`,
            transform: `translate(-50%, -50%) rotate(${leaf.rotation}deg) rotateY(${leaf.rotateY}deg) scale(${leaf.scale})`,
            willChange: 'transform, left, top',
          }}
        >
          {/* Peepal Leaf SVG: Heart shape with pointed drip tip and vein */}
          <svg
            viewBox="0 0 24 26"
            className="w-5 h-6 drop-shadow-sm filter"
            style={{ color: leaf.color }}
          >
            {/* Heart Leaf Blade with slender drip tip at top */}
            <path
              d="M 12,1 C 11.5,5 4,8 3,14 C 2,19.5 7,24 12,24 C 17,24 22,19.5 21,14 C 20,8 12.5,5 12,1 Z"
              fill="currentColor"
              opacity="0.88"
            />
            {/* Center Midrib Vein */}
            <path
              d="M 12,3 L 12,24"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            {/* Lateral Secondary Veins */}
            <path
              d="M 12,9 Q 8,11 6,13 M 12,9 Q 16,11 18,13 M 12,14 Q 8,16 6,18 M 12,14 Q 16,16 18,18"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
