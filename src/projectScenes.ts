export const projectScenes = [
  {
    slug: "fleet-intelligence",
    short: "fleet / routing",
    file: "optimization/vrp.py",
    mode: "CONSTRAINTS",
    command: "inspect fleet --constraints",
    notes: [
      "route feasibility before distance",
      "vehicle accessibility + collection rules",
      "operational planning / full-stack integration",
    ],
    code: `def feasible(route, vehicle):
    return (
        route.load <= vehicle.capacity
        and route.accessible_to(vehicle)
        and route.within_time_window()
    )

# Illustrative constraint boundary.
# The solver owns route assignment.`,
    meta: "GRAPH / FEASIBILITY",
    caption: "A route is useful only if it can run.",
  },
  {
    slug: "dashcam-intelligence",
    short: "vision / live streams",
    file: "vision/events.py",
    mode: "FRAME PIPELINE",
    command: "trace stream --event-pipeline",
    notes: [
      "camera transport → frame processing",
      "inference events → application workflows",
      "privacy-aware video management",
    ],
    code: `async def process(stream, detector, events):
    async for frame in stream:
        objects = await detector.infer(frame)
        await events.publish({
            "stream": frame.stream_id,
            "timestamp": frame.timestamp,
            "objects": objects,
        })`,
    meta: "PERCEPTION / EVENTS",
    caption: "From frames to application context.",
  },
  {
    slug: "enterprise-copilot",
    short: "agents / grounded context",
    file: "agents/retrieval.py",
    mode: "PROTOTYPE",
    command: "trace copilot --grounded-context",
    notes: [
      "retrieve relevant application context",
      "invoke explicit tools / retain sources",
      "evaluate answers before integration",
    ],
    code: `async def answer(question, context, model):
    documents = await context.retrieve(question)
    if not documents:
        return {"answer": "Insufficient context"}

    return await model.respond(
        question=question,
        sources=documents,
    )`,
    meta: "RETRIEVAL / ORCHESTRATION",
    caption: "Useful assistance needs a source of truth.",
  },
  {
    slug: "cuda-gemm",
    short: "compute / shared memory",
    file: "compute/tiled_gemm.cu",
    mode: "HPC / CUDA",
    command: "inspect gemm --memory-layout",
    notes: [
      "CPU and GPU implementation experiments",
      "tiling / streams / batched processing",
      "First Prize · HPC Hackathon · UM6P 2024",
    ],
    code: `// Conceptual inner product of a shared tile.
// A complete kernel also loads tiles,
// handles bounds and synchronizes threads.
for (int k = 0; k < TILE; ++k) {
    accumulator += tile_a[threadIdx.y][k]
                 * tile_b[k][threadIdx.x];
}
// Store after all tiles are accumulated.`,
    meta: "GEMM / SHARED MEMORY",
    caption: "Think in tiles. Respect the hardware.",
  },
  {
    slug: "autonomous-navigation",
    short: "robotics / closed loop",
    file: "robotics/control.cpp",
    mode: "CONTROL LOOP",
    command: "inspect vehicle --control-loop",
    notes: [
      "object detection + line following",
      "C++ decisions + sensor integration",
      "First Prize · CROMEK 7 · May 2024",
    ],
    code: `void step(const Observation& observation) {
    if (observation.stop_sign) {
        controller.stop();
        return;
    }
    controller.follow_line(
        observation.line_error
    );
}`,
    meta: "PERCEPTION / CONTROL",
    caption: "A decision is only useful when it moves.",
  },
  {
    slug: "industrial-vision",
    short: "inspection / event streaming",
    file: "inspection/pipeline.py",
    mode: "QUALITY CONTROL",
    command: "inspect line --defect-events",
    notes: [
      "IP camera integration / labeled datasets",
      "YOLOv8 training and detection workflow",
      "Kafka event streaming · TWD Services",
    ],
    code: `def inspect(frame, detector, producer):
    result = detector.predict(frame)
    for defect in result.defects:
        producer.send("inspection.events", {
            "frame_id": frame.id,
            "label": defect.label,
            "bounds": defect.bounds,
        })`,
    meta: "INFERENCE / STREAMING",
    caption: "Connect detection to the production line.",
  },
];
