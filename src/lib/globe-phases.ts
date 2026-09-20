// lib/globe-phases.ts
export const PHASES = {
  heroShrink:  [0.12, 0.30],
  rise:        [0.15, 0.40],   // tip -> center
  beatStart:   0.30,           // 3 feature beats
  beatStep:    0.15,           // each beat occupies [start, start+0.15]
  sink:        [0.75, 1.00],   // center (1.75x) -> upper center 1x resting place
  outroIn:     [0.82, 0.94],
} as const;

export const GLOBE = {
  tipFraction: 0.09,          // fraction of the globe's DIAMETER visible on screen 1 (scaled for 1.75x size)
  radiusVsViewport: 0.63,     // globe radius in center = min(viewport.w, viewport.h) * 0.63 (1.75x size)
  finalRadiusVsViewport: 0.285,// globe radius on last page = min(viewport.w, viewport.h) * 0.285 (1.3x bigger: 0.22 * 1.3)
  finalYFraction: 0.25,        // upper viewport placement on last page (+0.25 * vh)
  tiltDeg: 23.4,
  spinTurns: 2,               // full Y rotations across the whole scroll
  idleSpeed: 0.08,            // rad/sec continuous rotation in place
  damping: 4,
} as const;
