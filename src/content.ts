export const profile = {
  name: 'Younes Traouki', label: 'younes / traouki', domain: '',
  role: 'AI Engineer / Data Scientist / Full-Stack Developer',
  location: 'Casablanca, Morocco', email: 'younestraouki2003@gmail.com',
  github: 'https://github.com/younestr', linkedin: 'https://linkedin.com/in/younestraouki', kaggle: 'https://www.kaggle.com/younestraouki',
  resume: './Younes-Traouki-CV.pdf',
};
export const commands = ['about', 'projects', 'experience', 'skills', 'contact', 'resume', 'theme', 'help', 'home'] as const;
export type Command = typeof commands[number];
export const themes = [
  { id: 'warm', label: 'Warm terminal', detail: 'charcoal / parchment / coral' },
  { id: 'green', label: 'Green phosphor', detail: 'black / sage / phosphor' },
  { id: 'paper', label: 'Light paper', detail: 'ivory / ink / terracotta' },
  { id: 'slate', label: 'Quiet slate', detail: 'blue-grey / mist / sand' },
];
export const projects = [
  { name: 'Fleet Intelligence & Route Optimization', file: 'fleet-intelligence.md', area: 'OPTIMIZATION / LOGISTICS', stack: 'Python · Java · Spring Boot · Angular · SQL · Timefold', description: 'Transportation management and fleet planning under real operational constraints.', challenge: 'Balance route feasibility, vehicle accessibility and collection requirements.', contribution: 'Contributing to VRP models, full-stack applications, fleet data processing and backend integration.', status: 'Professional work · public overview only' },
  { name: 'Real-Time Vision & Dashcam Intelligence', file: 'dashcam-intelligence.md', area: 'COMPUTER VISION / REAL-TIME', stack: 'Python · WebRTC · WebSocket · Angular · Spring Boot', description: 'Video intelligence workflows spanning camera streaming, driver monitoring and privacy-aware video management.', challenge: 'Connect live video, inference and application workflows coherently.', contribution: 'Engineering contributions across video processing and application integration; features are at different stages.', status: 'Professional work · public overview only' },
  { name: 'Enterprise AI Copilot', file: 'enterprise-copilot.md', area: 'RAG / AGENTIC AI', stack: 'Python · Ollama · Dify · Docker · LLM tooling', description: 'An integration and prototyping initiative for context-aware assistance in enterprise applications, including HR workflows.', challenge: 'Ground assistance in application context and evaluate tool-assisted responses.', contribution: 'Exploring retrieval, tool orchestration, live application data and judge-agent evaluation.', status: 'Integration / prototype initiative' },
  { name: 'GPU Matrix Optimization', file: 'cuda-gemm.md', area: 'HPC / CUDA', stack: 'C · CUDA · cuBLAS · shared memory', description: 'Dense matrix multiplication with hardware-aware computation. First Prize, HPC Hackathon, UM6P, December 2024.', challenge: 'Explore GPU memory access and parallel execution for GEMM.', contribution: 'Implemented CPU/GPU GEMM experiments, tiled kernels, streams, batches and shared-memory approaches.', status: 'Hackathon · first prize' },
  { name: 'Autonomous Vehicle Navigation', file: 'autonomous-navigation.md', area: 'ROBOTICS / EMBEDDED AI', stack: 'C++ · deep learning · sensors · real-time control', description: 'A miniature autonomous vehicle navigating signs, lines and constrained city environments. First Prize, CROMEK 7, May 2024.', challenge: 'Combine learned perception with dependable control and decision logic.', contribution: 'Worked on object detection, line following and C++ decision logic. Third Place, NXP Cup Qualifications, April 2024.', status: 'Competition engineering' },
  { name: 'Industrial Defect Detection', file: 'industrial-vision.md', area: 'INDUSTRIAL AI / STREAMING', stack: 'Python · YOLOv8 · IP cameras · Kafka', description: 'Real-time quality-control detection developed during the TWD Services internship.', challenge: 'Connect camera input, labeled data, model inference and streaming events.', contribution: 'Collected and labeled data, trained detection models and integrated camera and Kafka pipelines.', status: 'Internship project · public overview only' },
];
export const experience = [
  { company: 'R.I.M Telecom', role: 'Developer and Data Scientist', date: 'Aug 2025 — Present', text: 'Transportation management systems, AI-driven logistics, VRP optimization, IoT fleet data, dashboards and scalable backend integrations.' },
  { company: 'Centrale Danone', role: 'Data Science and AI Intern', date: 'Jan 2025 — Aug 2025', text: 'TMS development, collection-route constraints, decision-support simulation, REST APIs, database integration, Excel exports and React interfaces.' },
  { company: 'TWD Services', role: 'Data Science and AI Intern', date: 'Jun 2024 — Sep 2024', text: 'YOLOv8 industrial defect detection, IP cameras, Kafka, image labeling and model training. Early planning for a PDF knowledge-base chatbot.' },
];
export const education = [
  ['2023–2025', 'Master’s · Data Science & Artificial Intelligence', 'Mundiapolis University'],
  ['2022–2023', 'Bachelor’s · Applied Mathematics', 'FSTM Mohammedia'],
  ['2020–2022', 'DEUST · Science & Technology', 'FSTM Mohammedia'],
];
export const skills = [
  ['AI & machine learning', 'Machine Learning, Deep Learning, Computer Vision, NLP, RAG, Reinforcement Learning'],
  ['Optimization & computation', 'Vehicle Routing Problems, route optimization, CUDA, C/C++, matrix computation, decision support'],
  ['Backend engineering', 'Java, Spring Boot, Python, REST APIs, SQL, system integration'],
  ['Frontend engineering', 'Angular, React, TypeScript, JavaScript, HTML, CSS'],
  ['Infrastructure & tools', 'Docker, Git, Linux, Kafka, Ollama, Dify, TensorFlow, AWS'],
];
// Original illustrative fragments. No employer source code or private architecture.
export const snippets = [
  { path: '~/younes/about.py', language: 'python', code: `# intelligence, engineered.
# Casablanca, Morocco · 33.57° N

class YounesTraouki:
    role = "AI Engineer"
    focus = "models to production"

    interests = [
        "Artificial Intelligence",
        "Optimization",
        "Computer Vision",
        "Full-Stack Engineering",
    ]

    def philosophy(self) -> str:
        return "build systems that matter"

engineer = YounesTraouki()
` },
  { path: '~/younes/optimization/vrp.py', language: 'python', code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Route:
    distance_km: float
    load: int
    capacity: int
    accessible: bool

    def is_feasible(self) -> bool:
        return self.accessible and self.load <= self.capacity

def objective(routes: list[Route]) -> float:
    if not all(r.is_feasible() for r in routes):
        return float("inf")
    return sum(r.distance_km for r in routes)

# Feasibility first. Distance second.
` },
  { path: '~/younes/vision/detection.py', language: 'python', code: `from collections.abc import Iterable

def inspect_frames(frames: Iterable, detector, events):
    """Connect perception to an event pipeline."""
    for frame in frames:
        detections = detector.predict(frame)

        for detection in detections:
            if detection.confidence < 0.75:
                continue

            events.publish({
                "label": detection.label,
                "timestamp": frame.timestamp,
                "bounds": detection.bounds,
            })

# Illustrative pipeline; no client data.
` },
  { path: '~/younes/agents/copilot.py', language: 'python', code: `async def answer(question, retriever, model):
    documents = await retriever.search(question, limit=5)

    if not documents:
        return {"answer": "Insufficient context", "sources": []}

    context = "\n".join(doc.text for doc in documents)
    response = await model.generate(
        system="Use the supplied context. Cite sources.",
        context=context,
        question=question,
    )

    return {
        "answer": response.text,
        "sources": [doc.id for doc in documents],
    }
` },
  { path: '~/younes/systems/architecture.ts', language: 'typescript', code: `type FrameEvent = {
  streamId: string;
  timestamp: number;
  labels: string[];
};

interface EventStore {
  append(event: FrameEvent): Promise<void>;
}

export async function ingest(
  event: FrameEvent,
  store: EventStore,
) {
  if (!event.streamId) throw new Error("Missing stream");
  await store.append(event);
  return { accepted: true, timestamp: event.timestamp };
}
` },
];
