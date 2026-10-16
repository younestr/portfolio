import {
  createParticleField,
  portalTimeline,
  smoothstep,
  projectStreak,
} from "./portal.mjs";

/** Reused buffers and 16 batched strokes; no particle objects per frame. */
export class PortalRenderer {
  private context: CanvasRenderingContext2D;
  private field = createParticleField(2600);
  private projected = new Float32Array(2600 * 4);
  private buckets = new Uint8Array(2600);
  private halo = document.createElement("canvas");
  private width = 1;
  private height = 1;
  private dpr = 1;
  private count = 2600;
  constructor(
    private canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
  ) {
    this.context = context;
    // One reusable scattering sprite, not a gradient or blur for every star.
    this.halo.width = this.halo.height = 512;
    const glow = this.halo.getContext("2d")!;
    const gradient = glow.createRadialGradient(256, 256, 177, 256, 256, 256);
    gradient.addColorStop(0, "rgba(226,222,190,.13)");
    gradient.addColorStop(0.12, "rgba(226,222,190,.075)");
    gradient.addColorStop(0.42, "rgba(226,222,190,.025)");
    gradient.addColorStop(1, "rgba(226,222,190,0)");
    glow.fillStyle = gradient;
    glow.fillRect(0, 0, 512, 512);
    this.resize();
  }
  resize() {
    this.width = innerWidth;
    this.height = innerHeight;
    const mobile = this.width < 761;
    this.count = mobile ? 1100 : 2600;
    // Bound raster memory and fill work at 1920p / high-DPI screens.
    this.dpr = Math.min(
      devicePixelRatio || 1,
      mobile ? 1.25 : 1.5,
      Math.sqrt(3600000 / (this.width * this.height)),
    );
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }
  draw(progress: number, reverse: boolean) {
    const c = this.context,
      w = this.width,
      h = this.height;
    const t = portalTimeline(progress, reverse);
    c.clearRect(0, 0, w, h);
    if (t.opacity <= 0) return;
    c.globalAlpha = t.opacity;
    c.fillStyle = "#0c0c0c";
    c.fillRect(0, 0, w, h);
    const cx = w / 2,
      cy = h / 2,
      scale = Math.min(w, h);
    const radius = scale * t.radius;
    const focal = scale * 0.76,
      far = 3.85,
      max = Math.hypot(w, h) * 0.73;
    const data = this.field,
      points = this.projected,
      buckets = this.buckets;
    for (let i = 0; i < this.count; i++) {
      const at = i * 6,
        point = i * 4;
      let cycle = (data[at + 3] + t.travel * (reverse ? 1 : -1)) % far;
      if (cycle < 0) cycle += far;
      const z = 0.15 + cycle;
      projectStreak(
        data[at + 2],
        z,
        focal,
        t.speed,
        reverse,
        data[at + 4],
        points,
        point,
      );
      const head = points[point],
        tail = points[point + 1];
      // Clip the projected cylinder to the silhouette, never streak over it.
      let near = Math.max(radius + 2, Math.min(head, tail));
      let distant = Math.min(max, Math.max(head, tail));
      if (distant <= near || near > max) {
        buckets[i] = 255;
        continue;
      }
      if (distant - near < 0.65) distant = near + 0.65;
      const edgeFade = 1 - smoothstep(max * 0.65, max, distant);
      const depthFade = 0.45 + 0.55 * (1 - z / 4);
      const strength = data[at + 5] * edgeFade * depthFade;
      buckets[i] = Math.min(15, Math.max(0, Math.floor(strength * 15)));
      points[point] = cx + data[at] * near;
      points[point + 1] = cy + data[at + 1] * near;
      points[point + 2] = cx + data[at] * distant;
      points[point + 3] = cy + data[at + 1] * distant;
    }
    c.strokeStyle = "#dedac0";
    c.lineCap = "round";
    for (let bucket = 0; bucket < 16; bucket++) {
      c.globalAlpha = t.opacity * t.ring * Math.min(0.94, 0.2 + bucket * 0.068);
      c.lineWidth = 0.45 + (bucket / 15) * 0.65;
      c.beginPath();
      for (let i = 0; i < this.count; i++)
        if (buckets[i] === bucket) {
          const p = i * 4;
          c.moveTo(points[p], points[p + 1]);
          c.lineTo(points[p + 2], points[p + 3]);
        }
      c.stroke();
    }
    c.globalAlpha = t.opacity * t.ring;
    const haloSize = radius * 2.9;
    c.drawImage(
      this.halo,
      cx - haloSize / 2,
      cy - haloSize / 2,
      haloSize,
      haloSize,
    );
    // Smooth opaque occlusion with an almost imperceptible interior falloff.
    c.globalAlpha = t.opacity;
    c.fillStyle = "#010201";
    c.beginPath();
    c.arc(cx, cy, radius, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#e4e0c3";
    for (let pass = 0; pass < 3; pass++) {
      c.lineWidth = pass === 0 ? 10 : pass === 1 ? 3 : 0.85;
      c.globalAlpha =
        t.opacity * t.ring * (pass === 0 ? 0.025 : pass === 1 ? 0.065 : 0.82);
      c.beginPath();
      c.arc(cx, cy, radius + 0.6, 0, Math.PI * 2);
      c.stroke();
    }
    c.globalAlpha = 1;
  }
  dispose() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.canvas.width = this.canvas.height = 1;
    this.halo.width = this.halo.height = 1;
  }
}
