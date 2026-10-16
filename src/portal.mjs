export const PORTAL_DURATION = 2100;
export const REDUCED_DURATION = 180;
export function smoothstep(a, b, value) {
  const x = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return x * x * (3 - 2 * x);
}
function integralStep(a, b, t) {
  if (t <= a) return 0;
  if (t >= b) return t - (a + b) / 2;
  const x = (t - a) / (b - a);
  return (b - a) * (x * x * x - 0.5 * x * x * x * x);
}
export function portalTimeline(progress, reverse = false, reduced = false) {
  const p = Math.max(0, Math.min(1, progress));
  const reveal = reduced ? smoothstep(0, 1, p) : smoothstep(0.32, 0.83, p);
  return {
    entry: reverse ? 1 - reveal : reveal,
    opacity: smoothstep(0.015, 0.17, p) * (1 - smoothstep(0.77, 1, p)),
    ring: smoothstep(0.07, 0.27, p) * (1 - smoothstep(0.79, 0.98, p)),
    speed: 0.08 + 5 * smoothstep(0.12, 0.66, p) - 4.95 * smoothstep(0.72, 1, p),
    travel:
      0.08 * p +
      5 * integralStep(0.12, 0.66, p) -
      4.95 * integralStep(0.72, 1, p),
    radius: reverse
      ? 0.15 + 0.2 * smoothstep(0.04, 0.62, p) - 0.25 * smoothstep(0.73, 1, p)
      : 0.13 + 0.18 * smoothstep(0.05, 0.65, p) + 1.15 * smoothstep(0.76, 1, p),
    chrome: 1 - smoothstep(0, 0.18, p) + smoothstep(0.83, 1, p),
    departure: smoothstep(0, 0.24, p),
  };
}
// A static 3D cylinder is projected through a moving camera. Depth, rather than
// a screen-space outward velocity, determines apparent speed and trail length.
/** @param {Float32Array | null} output */
export function projectStreak(
  radius,
  depth,
  focal,
  velocity,
  reverse = false,
  length = 1,
  output = null,
  offset = 0,
) {
  const head = (focal * radius) / depth;
  const trailDepth = Math.max(
    0.08,
    depth + (reverse ? -1 : 1) * velocity * 0.028 * length,
  );
  if (output) {
    output[offset] = head;
    output[offset + 1] = (focal * radius) / trailDepth;
    return output;
  }
  return [head, (focal * radius) / trailDepth];
}
export function createParticleField(count, seed = 7289) {
  const data = new Float32Array(count * 6);
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    data.set(
      [
        Math.cos(angle),
        Math.sin(angle),
        0.28 + random() * 2.5,
        random() * 3.85,
        0.35 + random() * 1.6,
        0.2 + random() * 0.8,
      ],
      i * 6,
    );
  }
  return data;
}
