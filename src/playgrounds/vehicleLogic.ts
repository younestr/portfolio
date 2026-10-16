export type TrackPoint = { x: number; y: number };
export type Vehicle = {
  x: number;
  y: number;
  heading: number;
  speed: number;
  steering: number;
  error: number;
  distance: number;
  status: string;
};
export type Obstacle = TrackPoint & { radius: number };
export type ControllerConfig = {
  speed: number;
  gain: number;
  controller: "basic" | "pursuit";
};
export const angleWrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
export function makeTrack(): TrackPoint[] {
  return Array.from({ length: 100 }, (_, i) => ({
    x: 250 + 170 * Math.cos((i * Math.PI) / 50),
    y: 160 + 100 * Math.sin((i * Math.PI) / 50),
  }));
}
export function initialVehicle(): Vehicle {
  return {
    x: 420,
    y: 160,
    heading: Math.PI / 2,
    speed: 0,
    steering: 0,
    error: 0,
    distance: 0,
    status: "ready",
  };
}
export function nearestTrack(
  point: TrackPoint,
  track: TrackPoint[],
): { index: number; distance: number; signed: number } {
  let best = { index: 0, distance: Infinity, signed: 0 };
  for (let i = 0; i < track.length; i++) {
    const a = track[i],
      b = track[(i + 1) % track.length],
      dx = b.x - a.x,
      dy = b.y - a.y;
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy),
      ),
    );
    const x = a.x + t * dx,
      y = a.y + t * dy,
      d = Math.hypot(point.x - x, point.y - y);
    if (d < best.distance)
      best = {
        index: i,
        distance: d,
        signed: Math.sign(dx * (point.y - y) - dy * (point.x - x)) * d,
      };
  }
  return best;
}
export function sensorDistance(
  v: Vehicle,
  obstacle: Obstacle,
  angle: number,
  max = 90,
): number {
  const dx = Math.cos(v.heading + angle),
    dy = Math.sin(v.heading + angle),
    ox = v.x - obstacle.x,
    oy = v.y - obstacle.y;
  const b = ox * dx + oy * dy,
    c = ox * ox + oy * oy - obstacle.radius ** 2,
    disc = b * b - c;
  if (disc < 0) return max;
  const t = -b - Math.sqrt(disc);
  return t >= 0 && t <= max ? t : max;
}
export function stepVehicle(
  v: Vehicle,
  dt: number,
  config: ControllerConfig,
  track: TrackPoint[],
  obstacle: Obstacle,
): Vehicle {
  if (["collision", "off track"].includes(v.status)) return v;
  if (Math.hypot(v.x - obstacle.x, v.y - obstacle.y) < obstacle.radius + 9)
    return { ...v, speed: 0, status: "collision" };
  const nearest = nearestTrack(v, track);
  if (nearest.distance > 38)
    return { ...v, speed: 0, status: "off track", error: nearest.signed };
  const lookahead =
    config.controller === "pursuit" ? Math.max(20, config.speed * 0.55) : 14;
  let target = track[(nearest.index + 1) % track.length],
    travel = 0,
    index = nearest.index;
  while (travel < lookahead) {
    const a = track[index % track.length],
      b = track[(index + 1) % track.length];
    travel += Math.hypot(b.x - a.x, b.y - a.y);
    index++;
    target = b;
  }
  const alpha = angleWrap(
    Math.atan2(target.y - v.y, target.x - v.x) - v.heading,
  );
  const requested =
    config.controller === "pursuit"
      ? Math.atan2(36 * Math.sin(alpha), lookahead) * config.gain
      : alpha * config.gain;
  const steering = Math.max(-0.7, Math.min(0.7, requested));
  const sensor = Math.min(
    ...[-0.25, 0, 0.25].map((a) => sensorDistance(v, obstacle, a)),
  );
  const speed =
    sensor < 30 ? 0 : config.speed * Math.min(1, (sensor - 25) / 40);
  const next = {
    ...v,
    x: v.x + Math.cos(v.heading) * speed * dt,
    y: v.y + Math.sin(v.heading) * speed * dt,
    heading: angleWrap(v.heading + (speed / 18) * Math.tan(steering) * dt),
    speed,
    steering,
    error: nearest.signed,
    distance: v.distance + speed * dt,
    status: speed === 0 ? "obstacle braking" : "following",
  };
  if (
    Math.hypot(next.x - obstacle.x, next.y - obstacle.y) <
    obstacle.radius + 9
  )
    return { ...next, speed: 0, status: "collision" };
  return next;
}
