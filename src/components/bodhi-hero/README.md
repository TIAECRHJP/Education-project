# BodhiHero Component Guide

> An animated, award-level hero section for **Gurukul AI**, depicting the sacred Bodhi Tree (*Ficus religiosa*) with the story *"Roots of knowledge, wings of tomorrow / ज्ञान की जड़ें, कल के पंख"*.

---

## 1. Layer Architecture (7 Layers)

1. **Layer 1: Base Image** (`/public/bodhi_vriksh.webp` with `/public/bodhi_vriksh.png` fallback)
   - Object-cover with a subtle 20-second breathing zoom (`scale: 1.00 -> 1.035`).
   - Interactive mouse-move parallax on desktop (shifts up to 12px) and touch drag on mobile.
   - Preserves top 30% of the image intact where the tagline sits.

2. **Layer 2: Soft Light Rays**
   - Screen-blended radial sun aura positioned at `(53%, 55%)` near the sun gap.
   - Slowly pulses opacity (6s loop) and rotates ±3 degrees.
   - Dynamically shifts to a warm golden tone in Dark Mode.

3. **Layer 3: Flapping SVG Birds (`BodhiBirds.tsx`)**
   - Realistic two-winged SVG bird silhouettes with independent flapping wings.
   - **Takeoff**: 6 birds launch staggered by 300ms on load along smooth quadratic Bézier trajectories toward the left/right horizon.
   - **Ambient Crossing Flocks**: 3–5 birds cross every 14–18 seconds below the 30% tagline boundary.
   - **Interactive Burst**: 6 birds scatter when the tree is tapped or clicked.

4. **Layer 4: Peepal Falling Leaves (`BodhiLeaves.tsx`)**
   - Authentic Peepal heart-shaped leaves with pointed drip tips and vein details.
   - 12 leaves drift downward with 3D rotation (`rotateZ`, `rotateY`) and sinusoidal side-to-side sway.
   - 12 extra leaves scatter on interactive tap/click.

5. **Layer 5: Fireflies & Golden Particles (`BodhiParticles.tsx`)**
   - High-performance canvas layer with 50 twinkling glowing embers rising from the roots/trunk (`x: 44%-56%, y: 72%-95%`) up into the canopy.
   - Embers gently gravitate toward the mouse cursor on desktop.
   - Automatic 30 FPS cap on mobile/low-concurrency devices.
   - Automatically pauses when the browser tab is hidden or when scrolled out of view.

6. **Layer 6: Pulsing Trunk Glow**
   - Amber aura on the central trunk pulsing in sync with a gentle 4-second heartbeat rhythm.

7. **Layer 7: Frosted Glass UI Card**
   - Translucent glass card (`backdrop-blur-xl bg-white/85 dark:bg-slate-900/80`) framing the lower root area.
   - Includes headline, subtitle, English/Hindi language toggle, dark mode toggle, and primary CTAs.
   - Staggered reveal after initial bird takeoff.

---

## 2. Tuning Counts, Speeds & Trajectories

All counts and parameters can be adjusted directly in the component files:

| Feature | File | Variable | Default | Tuning Guide |
|---|---|---|---|---|
| **Takeoff Birds** | `BodhiBirds.tsx` | `count` | `6` (high) / `3` (low) | Adjust for more/fewer birds during initial launch |
| **Bird Flight Duration** | `BodhiBirds.tsx` | `duration` | `5200ms - 7200ms` | Lower to make flight faster, higher for gentle soar |
| **Bird Flap Speed** | `BodhiBirds.tsx` | `flapSpeed` | `0.32s - 0.44s` | Duration of one wing flap cycle |
| **Flock Frequency** | `BodhiBirds.tsx` | `delay` | `14s - 18s` | Time between ambient crossing flocks |
| **Falling Leaves Count** | `BodhiLeaves.tsx` | `count` | `12` (high) / `5` (low) | Number of ambient drifting leaves |
| **Leaf Fall Speed** | `BodhiLeaves.tsx` | `speed` | `0.045 - 0.08` | Vertical descent rate (% per frame) |
| **Leaf Sway Width** | `BodhiLeaves.tsx` | `swayAmp` | `1.8 - 4.0` | Amplitude of horizontal side-to-side drift |
| **Fireflies Count** | `BodhiParticles.tsx` | `particleCount`| `50` (high) / `20` (low) | Number of rising embers |
| **Firefly Rise Speed** | `BodhiParticles.tsx` | `vy` | `-0.35 to -1.0` | Upward drift velocity (px per frame) |
| **Tagline Safety Line** | All components | `minY` | `30.2%` | Keep strictly `>= 30%` so the baked text is never obscured |

---

## 3. Accessibility & Performance Safeguards

- **Reduced Motion Support**:
  When `prefers-reduced-motion: reduce` is enabled, all flying birds, falling leaves, canvas animations, and zooms are suppressed. A peaceful, soft static glow is maintained.
- **Low-End Android Device Detection**:
  Detects `navigator.hardwareConcurrency <= 4` or `deviceMemory <= 2` to automatically reduce particle and bird entities by 60%, maintaining 60 FPS performance on entry-level smartphones.
- **Battery & CPU Conservation**:
  - Uses `IntersectionObserver` to halt canvas drawing whenever the hero scrolls out of view.
  - Listens to the `visibilitychange` API to pause all loops when the browser tab is in the background.
- **Screen Reader & Keyboard Accessibility**:
  - Base image has descriptive alt text: *"A glowing bodhi tree with golden light and birds, with the tagline Roots of knowledge, wings of tomorrow"*.
  - Tree interactive target is accessible via `Enter` or `Space` key with visible focus state.
  - Animated layers have `aria-hidden="true"` and `pointer-events: none`.
