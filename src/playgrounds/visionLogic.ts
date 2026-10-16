export type DriverState = "attentive" | "left" | "right" | "down" | "closed";
export function syntheticConfidence(
  yaw: number,
  pitch: number,
  closed: boolean,
): number {
  return Math.max(
    0.2,
    Math.min(
      0.98,
      0.98 -
        Math.abs(yaw) * 0.0035 -
        Math.abs(pitch) * 0.0025 -
        (closed ? 0.04 : 0),
    ),
  );
}
export function attention(
  yaw: number,
  pitch: number,
  closed: boolean,
  threshold: number,
): string {
  if (syntheticConfidence(yaw, pitch, closed) < threshold)
    return "below detection threshold";
  if (closed) return "eyes closed";
  if (pitch > 22) return "looking down";
  if (yaw < -20) return "looking left";
  if (yaw > 20) return "looking right";
  return "attentive";
}
export function gazeAngles(
  x: number,
  y: number,
): { yaw: number; pitch: number } {
  return {
    yaw: (Math.atan2((x - 0.5) * 2, 1.5) * 180) / Math.PI,
    pitch: (Math.atan2((y - 0.5) * 2, 1.5) * 180) / Math.PI,
  };
}
export function faceLandmarks(
  yaw: number,
  pitch: number,
): { x: number; y: number }[] {
  const raw: number[][] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12;
    raw.push([Math.cos(a) * 74, Math.sin(a) * 95, 0]);
  }
  raw.push(
    [-27, -22, 15],
    [-15, -22, 20],
    [15, -22, 20],
    [27, -22, 15],
    [0, 5, 40],
    [-21, 35, 15],
    [0, 40, 22],
    [21, 35, 15],
    [-42, -40, 5],
    [42, -40, 5],
  );
  const y = (yaw * Math.PI) / 180,
    p = (pitch * Math.PI) / 180;
  return raw.map(([x0, y0, z0]) => {
    const x = x0 * Math.cos(y) + z0 * Math.sin(y),
      z = -x0 * Math.sin(y) + z0 * Math.cos(y);
    const yy = y0 * Math.cos(p) - z * Math.sin(p),
      zz = y0 * Math.sin(p) + z * Math.cos(p);
    const scale = 400 / (400 - zz);
    return { x: 240 + x * scale, y: 145 + yy * scale };
  });
}
