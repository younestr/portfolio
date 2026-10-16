export type Matrix = number[][];
export type TileEvent = { rows: number[]; cols: number[]; ks: number[] };
export function createMatrix(n: number, offset = 0): Matrix {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => ((r * 3 + c * 2 + offset) % 5) + 1),
  );
}
export function zeroMatrix(n: number): Matrix {
  return Array.from({ length: n }, () => Array(n).fill(0));
}
export function multiply(A: Matrix, B: Matrix): Matrix {
  const n = A.length;
  if (
    !n ||
    B.length !== n ||
    A.some((r) => r.length !== n) ||
    B.some((r) => r.length !== n)
  )
    throw new Error("Expected equally sized square matrices");
  return A.map((row) =>
    B[0].map((_, c) => row.reduce((sum, a, k) => sum + a * B[k][c], 0)),
  );
}
export function matrixSchedule(
  n: number,
  tile: number,
  mode: "naive" | "tiled",
): TileEvent[] {
  if (n < 1 || tile < 1 || n % tile)
    throw new Error("Tile size must divide matrix size");
  const events: TileEvent[] = [];
  const size = mode === "naive" ? 1 : tile;
  for (let r = 0; r < n; r += size)
    for (let c = 0; c < n; c += size)
      for (let k = 0; k < n; k += size)
        events.push({
          rows: Array.from({ length: size }, (_, i) => r + i),
          cols: Array.from({ length: size }, (_, i) => c + i),
          ks: Array.from({ length: size }, (_, i) => k + i),
        });
  return events;
}
export function applyTile(
  C: Matrix,
  A: Matrix,
  B: Matrix,
  event: TileEvent,
): Matrix {
  const next = C.map((row) => [...row]);
  for (const r of event.rows)
    for (const c of event.cols)
      for (const k of event.ks) next[r][c] += A[r][k] * B[k][c];
  return next;
}
