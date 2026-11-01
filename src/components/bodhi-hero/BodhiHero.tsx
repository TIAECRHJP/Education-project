/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BodhiBirds } from './BodhiBirds';
import { BodhiLeaves } from './BodhiLeaves';
import { BodhiParticles } from './BodhiParticles';
import { DeviceCapabilities, BodhiHeroProps } from './types';
import {
  Sparkles,
  BookOpen,
  Mic,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { translations } from '../../translations';

export const BodhiHero: React.FC<BodhiHeroProps> = ({
  onSelectRole,
  uiLang,
  darkMode = false,
  onOpenTests,
}) => {
  const t = translations[uiLang].hero;
  const [isDarkMode, setIsDarkMode] = useState<boolean>(darkMode);
  const burstTrigger = 0;
  const burstOrigin = null;
  const [cardRevealed, setCardRevealed] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Device capability detection (Low-end Android / CPU constraints & reduced motion)
  const [device, setDevice] = useState<DeviceCapabilities>({
    isLowEnd: false,
    prefersReducedMotion: false,
  });

  useEffect(() => {
    if (darkMode !== undefined) {
      setIsDarkMode(darkMode);
    }
  }, [darkMode]);

  useEffect(() => {
    const isLowConcurrency =
      typeof navigator !== 'undefined' &&
      navigator.hardwareConcurrency !== undefined &&
      navigator.hardwareConcurrency <= 4;

    const isLowMemory =
      typeof navigator !== 'undefined' &&
      (navigator as any).deviceMemory !== undefined &&
      (navigator as any).deviceMemory <= 2;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setDevice({
      isLowEnd: isLowConcurrency || isLowMemory,
      prefersReducedMotion,
    });

    // Staggered reveal for Hero Glass Card: smoothly rises after initial birds launch
    const timer = setTimeout(() => {
      setCardRevealed(true);
    }, prefersReducedMotion ? 100 : 1200);

    return () => clearTimeout(timer);
  }, []);

  // Parallax on mouse move for desktop
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (device.prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    setMousePos({ x: relX, y: relY });

  }, [device]);

  // Touch drag subtle parallax on mobile
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (device.prefersReducedMotion || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (touch.clientX - rect.left) / rect.width,
      y: (touch.clientY - rect.top) / rect.height,
    });
  }, [device]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative flex min-h-[min(740px,calc(100svh-4rem))] w-full flex-col justify-center overflow-hidden bg-slate-950/20 transition-colors duration-700"
      aria-label="Gurukul AI Bodhi Vriksh Hero Section"
    >
      <style>{`
        @keyframes breathingZoom {
          0%, 100% {
            transform: scale(1.00) translate(0px, 0px);
          }
          50% {
            transform: scale(1.035) translate(0px, -4px);
          }
        }
        @keyframes pulseSunRays {
          0%, 100% {
            opacity: 0.55;
            transform: rotate(-3deg) scale(0.96);
          }
          50% {
            opacity: 0.92;
            transform: rotate(3deg) scale(1.04);
          }
        }
        @keyframes trunkHeartbeat {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.95);
          }
          14% {
            opacity: 0.8;
            transform: scale(1.06);
          }
          28% {
            opacity: 0.45;
            transform: scale(0.98);
          }
          42% {
            opacity: 0.9;
            transform: scale(1.09);
          }
          70% {
            opacity: 0.35;
            transform: scale(0.95);
          }
        }
        @keyframes pulseGlowRing {
          0%, 100% {
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);
          }
          50% {
            box-shadow: 0 0 35px rgba(245, 158, 11, 0.6);
          }
        }
      `}</style>

      {/* Dark Mode Background Tone Overlay */}
      {isDarkMode && (
        <div
          className="absolute inset-0 bg-slate-950/40 mix-blend-multiply pointer-events-none z-1"
          aria-hidden="true"
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* LAYER 2: LIGHT RAYS (Near sun gap at x:53%, y:55%, screen blend) */}
      {/* ------------------------------------------------------------- */}
      <div
        className="absolute pointer-events-none z-5 overflow-hidden"
        style={{
          left: '53%',
          top: '55%',
          width: '520px',
          height: '520px',
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden="true"
      >
        <div
          className="w-full h-full rounded-full transition-opacity duration-1000"
          style={{
            background: isDarkMode
              ? 'radial-gradient(circle, rgba(251,191,36,0.65) 0%, rgba(245,158,11,0.35) 35%, rgba(217,119,6,0.1) 65%, rgba(0,0,0,0) 80%)'
              : 'radial-gradient(circle, rgba(255,243,205,0.7) 0%, rgba(254,215,170,0.4) 38%, rgba(251,191,36,0.15) 65%, rgba(255,255,255,0) 80%)',
            mixBlendMode: 'screen',
            animation: device.prefersReducedMotion
              ? 'none'
              : 'pulseSunRays 6s ease-in-out infinite',
          }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LAYER 3: BIRDS (SVG Flapping Silhouettes with Bezier takeoff) */}
      {/* ------------------------------------------------------------- */}
      <BodhiBirds
        device={device}
        burstTrigger={burstTrigger}
        burstOrigin={burstOrigin}
        darkMode={isDarkMode}
      />

      {/* ------------------------------------------------------------- */}
      {/* LAYER 4: FALLING PEEPAL LEAVES (Green & Gold 3D swaying leaves) */}
      {/* ------------------------------------------------------------- */}
      <BodhiLeaves
        device={device}
        burstTrigger={burstTrigger}
        burstOrigin={burstOrigin}
      />

      {/* ------------------------------------------------------------- */}
      {/* LAYER 5: CANVAS FIREFLIES & GOLDEN PARTICLES (Trunk & Roots) */}
      {/* ------------------------------------------------------------- */}
      <BodhiParticles
        device={device}
        darkMode={isDarkMode}
        mousePos={mousePos}
      />

      {/* ------------------------------------------------------------- */}
      {/* LAYER 6: TRUNK GLOW (4s Heartbeat-like pulsating golden aura) */}
      {/* ------------------------------------------------------------- */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: '49.8%',
          top: '78%',
          width: '240px',
          height: '240px',
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden="true"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: isDarkMode
              ? 'radial-gradient(circle, rgba(251,191,36,0.7) 0%, rgba(245,158,11,0.3) 45%, rgba(217,119,6,0) 75%)'
              : 'radial-gradient(circle, rgba(254,240,138,0.6) 0%, rgba(245,158,11,0.25) 45%, rgba(255,255,255,0) 75%)',
            mixBlendMode: 'screen',
            animation: device.prefersReducedMotion
              ? 'none'
              : 'trunkHeartbeat 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      <div className="relative z-30 mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-amber-200/35 bg-slate-950/55 px-6 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-lg sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
          <div className="relative">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3.5 py-2 text-xs font-bold text-amber-100">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{t.badge}</span>
              </div>
              {onOpenTests && (
                <button type="button" onClick={onOpenTests} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/50 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-900/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>Website self-check</span>
                </button>
              )}
            </div>

            <div className="max-w-4xl">
              <h1 className="text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t.headlineMain}{' '}
                <span className="bg-gradient-to-r from-amber-300 via-orange-200 to-yellow-100 bg-clip-text text-transparent">{t.headlineHighlight}</span>{' '}
                {t.headlineEnd}
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
                {t.subtitle}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSelectRole('student')}
                className="group inline-flex min-h-12 items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-950/30 transition hover:-translate-y-0.5 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <Mic className="h-4 w-4" />
                <span>{t.askDoubt}</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('teacher')}
                className="inline-flex min-h-12 items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <BookOpen className="h-4 w-4 text-amber-200" />
                <span>{t.tryTeacher}</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-4">
              <div><span className="block text-sm font-extrabold text-amber-200 sm:text-base">{t.metrics.citations}</span><span className="mt-1 block text-[11px] leading-4 text-slate-300">{t.metrics.citationsLabel}</span></div>
              <div><span className="block text-sm font-extrabold text-emerald-200 sm:text-base">{t.metrics.timedPlans}</span><span className="mt-1 block text-[11px] leading-4 text-slate-300">{t.metrics.timedPlansLabel}</span></div>
              <div><span className="block text-sm font-extrabold text-orange-200 sm:text-base">{t.metrics.speech}</span><span className="mt-1 block text-[11px] leading-4 text-slate-300">{t.metrics.speechLabel}</span></div>
              <div><span className="block text-sm font-extrabold text-sky-200 sm:text-base">{t.metrics.ocr}</span><span className="mt-1 block text-[11px] leading-4 text-slate-300">{t.metrics.ocrLabel}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
