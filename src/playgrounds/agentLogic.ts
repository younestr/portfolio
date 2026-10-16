export type SampleDocument = {
  id: string;
  title: string;
  text: string;
  tags: string[];
};
export type Scenario = {
  id: string;
  title: string;
  request: string;
  tool: string;
  args: Record<string, string | number>;
  facts: Record<string, string | number>;
  expected: string;
  response: (facts: Record<string, string | number>) => string;
};
export const sampleDocuments: SampleDocument[] = [
  {
    id: "POL-LEAVE",
    title: "Demo Works leave policy",
    text: "Fictional policy: annual leave requests require sufficient balance and manager review. This demonstration does not approve leave.",
    tags: ["leave", "employee", "balance", "request", "policy"],
  },
  {
    id: "POL-HYBRID",
    title: "Demo Works hybrid schedule",
    text: "Fictional policy: teams coordinate two shared office days per week. Exceptions require team review.",
    tags: ["hybrid", "office", "company", "policy"],
  },
  {
    id: "OPS-CALENDAR",
    title: "Demo Works meeting calendar",
    text: "Fictional calendar: a room cannot host overlapping bookings. Suggest another free slot instead of overwriting a booking.",
    tags: ["scheduling", "meeting", "conflict", "room", "calendar"],
  },
  {
    id: "OPS-ROUTES",
    title: "Demo Works collection constraints",
    text: "Fictional route rules: vans use accessible stops, collection demand must fit vehicle capacity, and the depot starts each route.",
    tags: [
      "transportation",
      "route",
      "capacity",
      "vehicle",
      "depot",
      "collection",
    ],
  },
];
export const scenarios: Scenario[] = [
  {
    id: "leave",
    title: "Summarize leave request",
    request: "Summarize employee E-104's leave request and remaining balance.",
    tool: "lookup_leave",
    args: { employee: "E-104", days: 3 },
    facts: { balance: 8, requested: 3 },
    expected: "5",
    response: (f) =>
      `Fictional employee E-104 requests ${f.requested} days. The recorded balance is ${f.balance}; ${Number(f.balance) - Number(f.requested)} days would remain. Manager review is still required. [POL-LEAVE]`,
  },
  {
    id: "policy",
    title: "Find hybrid policy",
    request: "What is the fictional company policy for shared office days?",
    tool: "read_policy",
    args: { policy: "hybrid" },
    facts: { days: 2 },
    expected: "2",
    response: (f) =>
      `The fictional hybrid policy asks teams to coordinate ${f.days} shared office days per week. Exceptions require team review. [POL-HYBRID]`,
  },
  {
    id: "schedule",
    title: "Resolve meeting conflict",
    request: "Resolve a scheduling conflict for meeting room R-2.",
    tool: "check_calendar",
    args: { room: "R-2", requested: "10:00" },
    facts: { occupied: "10:00", available: "11:00" },
    expected: "11:00",
    response: (f) =>
      `The fictional room is occupied at ${f.occupied}. Suggest ${f.available}, which the sample calendar marks free. No booking was changed. [OPS-CALENDAR]`,
  },
  {
    id: "routes",
    title: "Retrieve transport context",
    request: "Does the transportation collection route fit vehicle capacity?",
    tool: "check_route",
    args: { vehicle: "V-2", route: "R-7" },
    facts: { demand: 14, capacity: 12 },
    expected: "2",
    response: (f) =>
      `The fictional route demand is ${f.demand} units against capacity ${f.capacity}: it exceeds capacity by ${Number(f.demand) - Number(f.capacity)} units. Reassignment is needed before dispatch. [OPS-ROUTES]`,
  },
];
export function retrieve(request: string): SampleDocument[] {
  const words = new Set(request.toLowerCase().match(/[a-z]+/g) ?? []);
  return sampleDocuments
    .map((doc) => ({
      doc,
      score: doc.tags.filter((tag) => words.has(tag)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => x.doc);
}
export function agentExecution(scenario: Scenario) {
  const sources = retrieve(scenario.request),
    answer = scenario.response(scenario.facts);
  const citations = [...answer.matchAll(/\[([^\]]+)\]/g)].map((x) => x[1]);
  const checks = [
    {
      label: "source citations exist in retrieval",
      pass:
        citations.length > 0 &&
        citations.every((id) => sources.some((s) => s.id === id)),
    },
    {
      label: "required computed fact is present",
      pass: answer.includes(scenario.expected),
    },
    {
      label: "fictional scope is explicit",
      pass: answer.toLowerCase().includes("fictional"),
    },
  ];
  return {
    sources,
    answer,
    checks,
    stages: [
      { title: "REQUEST", log: scenario.request },
      {
        title: "CONTEXT",
        log: JSON.stringify(
          { tenant: "Demo Works (fictional)", ...scenario.facts },
          null,
          2,
        ),
      },
      {
        title: "RETRIEVAL",
        log: sources.map((s) => `${s.id}: ${s.title}\n${s.text}`).join("\n\n"),
      },
      {
        title: "TOOLS",
        log: JSON.stringify(
          {
            tool: scenario.tool,
            args: scenario.args,
            result: scenario.facts,
            mode: "deterministic mock",
          },
          null,
          2,
        ),
      },
      {
        title: "EVALUATION",
        log: checks
          .map((c) => `${c.pass ? "PASS" : "FAIL"} · ${c.label}`)
          .join("\n"),
      },
      { title: "RESPONSE", log: answer },
    ],
  };
}
