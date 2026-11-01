/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DeviceCapabilities {
  isLowEnd: boolean;
  prefersReducedMotion: boolean;
}

export interface BirdEntity {
  id: string;
  startX: number; // percentage (0 - 100)
  startY: number; // percentage (0 - 100)
  controlX: number; // Bezier control point X
  controlY: number; // Bezier control point Y
  endX: number; // Destination X
  endY: number; // Destination Y
  startScale: number;
  endScale: number;
  progress: number; // 0 to 1
  duration: number; // ms
  startTime: number;
  flapSpeed: number; // seconds per cycle
  flightAngle: number; // degrees
  color: string;
  active: boolean;
}

export interface LeafEntity {
  id: string;
  startX: number; // percentage (0 - 100)
  startY: number;
  currentX: number;
  currentY: number;
  rotation: number;
  rotateY: number;
  scale: number;
  speed: number;
  swayFreq: number;
  swayAmp: number;
  phase: number;
  color: string;
  active: boolean;
}

export interface ParticleEntity {
  x: number; // Canvas coordinate
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  currentAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  glowColor: string;
}

export interface BodhiHeroProps {
  onSelectRole: (role: 'teacher' | 'student' | 'admin' | 'landing') => void;
  uiLang: 'en' | 'hi';
  onToggleLang?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenTests?: () => void;
}
