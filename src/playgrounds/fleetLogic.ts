export type Stop = { id: number; x: number; y: number; demand: number };
export type Route = {
  vehicle: number;
  stops: number[];
  load: number;
  distance: number;
};
export type FleetPlan = {
  routes: Route[];
  distance: number;
  unassigned: number[];
  violations: number;
  vehiclesUsed: number;
};
export const depot = { id: 0, x: 250, y: 160, demand: 0 };
export function fleetSeed(): Stop[] {
  return [
    [68, 65, 2],
    [140, 88, 3],
    [345, 50, 2],
    [432, 115, 4],
    [383, 247, 2],
    [230, 267, 3],
    [87, 228, 1],
    [187, 192, 2],
  ].map(([x, y, demand], i) => ({ id: i + 1, x, y, demand }));
}
export const distance = (a: Stop, b: Stop) => Math.hypot(a.x - b.x, a.y - b.y);
function routeDistance(ids: number[], nodes: Stop[]): number {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  let last = depot,
    total = 0;
  for (const id of ids) {
    const next = byId.get(id)!;
    total += distance(last, next);
    last = next;
  }
  return total + distance(last, depot);
}
function improve(ids: number[], nodes: Stop[]): number[] {
  let best = [...ids],
    cost = routeDistance(best, nodes),
    changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < best.length - 1; i++)
      for (let k = i + 1; k < best.length; k++) {
        const candidate = [
            ...best.slice(0, i),
            ...best.slice(i, k + 1).reverse(),
            ...best.slice(k + 1),
          ],
          next = routeDistance(candidate, nodes);
        if (next < cost - 1e-8) {
          best = candidate;
          cost = next;
          changed = true;
        }
      }
  }
  return best;
}
function construct(
  nodes: Stop[],
  vehicles: number,
  capacity: number,
  nearest: boolean,
  optimize: boolean,
): FleetPlan {
  let remaining = [...nodes];
  const routes: Route[] = [];
  for (let v = 0; v < vehicles; v++) {
    let load = 0,
      last = depot;
    let ids: number[] = [];
    while (true) {
      const candidates = remaining.filter((n) => n.demand <= capacity - load);
      if (!candidates.length) break;
      const chosen = nearest
        ? candidates.reduce((a, b) =>
            distance(a, last) < distance(b, last) ? a : b,
          )
        : candidates[0];
      ids.push(chosen.id);
      load += chosen.demand;
      last = chosen;
      remaining = remaining.filter((n) => n.id !== chosen.id);
    }
    if (ids.length) {
      if (optimize) ids = improve(ids, nodes);
      routes.push({
        vehicle: v + 1,
        stops: ids,
        load,
        distance: routeDistance(ids, nodes),
      });
    }
  }
  return {
    routes,
    distance: routes.reduce((s, r) => s + r.distance, 0),
    unassigned: remaining.map((n) => n.id),
    violations: remaining.length,
    vehiclesUsed: routes.length,
  };
}
export function solveFleet(
  nodes: Stop[],
  vehicles: number,
  capacity: number,
): { baseline: FleetPlan; improved: FleetPlan } {
  const baseline = construct(nodes, vehicles, capacity, false, false);
  const candidates = [
    construct(nodes, vehicles, capacity, false, true),
    construct(nodes, vehicles, capacity, true, true),
  ];
  const score = (p: FleetPlan) => p.violations * 100000 + p.distance;
  return {
    baseline,
    improved: candidates.reduce((a, b) => (score(a) <= score(b) ? a : b)),
  };
}
