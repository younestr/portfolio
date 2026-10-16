export type DefectKind = "normal" | "crack" | "shape" | "stain";
export type Features = { crack: number; shape: number; stain: number };
export type Product = {
  id: number;
  x: number;
  features: Features;
  inspection?: { label: string; confidence: number; reject: boolean };
  counted: boolean;
};
export type LineState = {
  products: Product[];
  nextId: number;
  elapsed: number;
  spawn: number;
  inspected: number;
  accepted: number;
  rejected: number;
  lastConfidence: number;
};
export function makeFeatures(id: number, kind?: DefectKind): Features {
  const selected =
    kind ??
    (["normal", "normal", "crack", "normal", "shape", "stain"] as DefectKind[])[
      id % 6
    ];
  const f = { crack: 0.08, shape: 0.06, stain: 0.05 };
  if (selected !== "normal") f[selected] = 0.72 + (id % 4) * 0.07;
  return f;
}
export function classify(
  features: Features,
  threshold: number,
): { label: string; confidence: number; reject: boolean } {
  const entries = Object.entries(features) as [keyof Features, number][];
  const [label, severity] = entries.reduce((a, b) => (a[1] >= b[1] ? a : b));
  const defect = severity >= 0.55;
  const confidence = defect ? 0.55 + 0.44 * severity : 0.96 - severity * 0.2;
  return {
    label:
      defect && confidence >= threshold ? label : "no defect above threshold",
    confidence,
    reject: defect && confidence >= threshold,
  };
}
export function initialLine(): LineState {
  return {
    products: [0, 1, 2].map((id) => ({
      id,
      x: -30 - id * 100,
      features: makeFeatures(id),
      counted: false,
    })),
    nextId: 3,
    elapsed: 0,
    spawn: 0,
    inspected: 0,
    accepted: 0,
    rejected: 0,
    lastConfidence: 0,
  };
}
export function injectProduct(state: LineState, kind: DefectKind): LineState {
  const x = Math.min(-40, ...state.products.map((p) => p.x - 65));
  return {
    ...state,
    products: [
      ...state.products,
      {
        id: state.nextId,
        x,
        features: makeFeatures(state.nextId, kind),
        counted: false,
      },
    ],
    nextId: state.nextId + 1,
  };
}
export function advanceLine(
  state: LineState,
  dt: number,
  speed: number,
  threshold: number,
): LineState {
  const next = {
    ...state,
    elapsed: state.elapsed + dt,
    spawn: state.spawn + dt,
    products: state.products.map((p) => ({ ...p, x: p.x + speed * dt })),
  };
  if (next.spawn >= 1.5 && next.products.length < 14) {
    next.spawn = 0;
    next.products.push({
      id: next.nextId,
      x: -40,
      features: makeFeatures(next.nextId),
      counted: false,
    });
    next.nextId++;
  }
  for (const p of next.products) {
    if (p.x >= 270 && !p.inspection) {
      p.inspection = classify(p.features, threshold);
      next.inspected++;
      next.lastConfidence = p.inspection.confidence;
    }
    if (p.x >= 480 && !p.counted && p.inspection) {
      p.counted = true;
      p.inspection.reject ? next.rejected++ : next.accepted++;
    }
  }
  next.products = next.products.filter((p) => p.x < 660);
  return next;
}
