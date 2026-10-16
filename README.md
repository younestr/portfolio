# Younes Traouki — intelligence, engineered.

A spatial engineering portfolio built with React, TypeScript, Vite and original SVG technical studies. Enter a living code introduction, then navigate a finite rail of six engineering projects in an asymmetric terminal workspace.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite, normally http://127.0.0.1:5173. Vite selects another port if it is occupied.

```sh
npm test          # typing, physical key mapping and navigation-state tests
npm run build     # TypeScript checks and Vite production output in dist/
npm run preview   # serve the production output locally
```

## Navigation

| Input                      | Action                                                             |
| -------------------------- | ------------------------------------------------------------------ |
| Enter / visible enter hint | Transition from introduction to explorer                           |
| Wheel, Up / Down, j / k    | Select previous / next project                                     |
| Click thumbnail            | Select a project directly                                          |
| Drag rail                  | Navigate vertically on desktop, horizontally on mobile             |
| Enter / open project notes | Open detailed contribution, challenge, stack and illustrative code |
| Escape                     | Close command/buffer, return from details, or leave explorer       |
| :                          | Open contextual command palette                                    |
| ?                          | Open interaction guide                                             |

Commands: `about`, `projects`, `experience`, `skills`, `contact`, `resume`, `theme`, `help`, `home`.

Wheel gestures use a distance threshold, cooldown and momentum gate. The rail has six real projects and clamps at its ends. Keyboard navigation moves focus to the selected thumbnail. Dialogs retain keyboard focus and preserve project context.

## Motion and themes

The reducer owns INTRO, ENTERING, EXPLORER, PROJECT_TRANSITION, PROJECT_DETAIL, COMMAND, BUFFER and LEAVING states, active project, transition progress, direction and input modality. A separate typing state machine emits the actual physical key used by the hand visualizer. Navigation j/k events drive those same hands.

The OS reduced-motion preference disables typing/scene animation and supplies static content. The pause-motion control also disables transition choreography without blocking navigation. Animation loops stop on hidden tabs. Four themes cover every interface region and persist locally: Warm Terminal, Green Phosphor, Light Paper and Quiet Slate. No backend is required.

## Edit content

- `src/content.ts`: identity, contact URLs, project descriptions, experience, education, themes and intro snippets.
- `src/projectScenes.ts`: project-specific commands, illustrative code, technical labels and captions.
- `src/navigation.mjs`: pure application reducer.
- `src/ProjectRail.tsx`: finite tilted-object rail, original signal field and pointer gestures.
- `src/ProjectVisual.tsx`: original routing, video tracking, retrieval, tiled GEMM, robotics and inspection studies.
- `src/ContentBuffer.tsx`: personal content, theme picker and interaction guide.
- `src/TypingEngine.ts`, `src/engine.mjs`, `src/KeyboardVisualizer.tsx`: synchronized typing and landmark rendering.
- `src/App.tsx`: scene orchestration, input handling, explorer composition and modal buffers.
- `src/style.css`: spatial layout, choreography, responsive behavior and theme variables.

The proposed domain remains unconfigured; the safe identity label is used instead. GitHub, LinkedIn and Kaggle links are verified from the supplied CV. Optional social links disappear when blank. The original supplied PDF is downloadable from `public/Younes-Traouki-CV.pdf`.

## Content and deployment

Professional project descriptions are high-level owner-provided overviews. All code and technical diagrams are original illustrations, not employer source or actual screenshots. No private architecture, customer data, invented performance metrics or fabricated repository links are included. The CV intentionally contains the owner's contact information.

Inspired by the interaction and composition of https://hancore.dev/, with original identity, code, assets and content. Fonts are bundled locally through Fontsource. See `REFERENCE-STUDY.md` for confirmed observations and `DESIGN.md` for validation and limitations.

The production output uses relative asset paths and supports hosting below a repository subpath. Repository creation does not deploy the website. The existing local branch is `main`; a personal GitHub remote must be verified before pushing. Never push to an organization or force-push.

## YT.OS interactive environment

The introduction, portal and spatial explorer remain the entry point. Open the command launcher with **Ctrl/Cmd+K**, the simulated terminal with **~** (or Ctrl+backtick), and close windows with **Escape**. The original `:` commands still work; `:terminal`, `:palette`, `:sim`, `:diagnostics`, `:boot`, `:motion off` and `:zen` integrate the new environment. Header buttons provide touch access.

The terminal is a browser-local command interpreter, with no operating-system execution or network access. Try `help`, `projects`, `ls projects/`, `cd projects/fleet-intelligence`, `cat README.md`, `simulate 1`, `open 4`, `status`, `history`, `theme paper`, `motion reduced` and `resume`. Arrow keys recall history, Tab cycles completions, Shift+Tab moves focus, and listed files/directories are clickable. Unknown commands and malformed input return local errors. Output/history have bounded sizes. Hidden commands include `coffee`, `matrix`, `sudo hire younes`, `konami`, `zen` and `reboot`.

| Playground    | Actual local computation                                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fleet         | Capacity-aware assignment, nearest-neighbor construction and 2-opt; editable stop coordinates/demand, vehicle limits, feasibility and baseline comparison. Distance uses canvas units; this is a heuristic, not an exact optimizer. |
| Driver vision | Synthetic 3D landmark projection, yaw/pitch/gaze controls and explicit confidence/attention rules. No webcam or trained inference model.                                                                                            |
| Agent         | Six inspectable stages, keyword retrieval, deterministic sample tools, computed responses, citations and evaluation against fictional Demo Works records. No live LLM.                                                              |
| Matrix        | Real CPU-side multiply-accumulate work in scalar/tiled schedules; editable dimensions, selected dot products and explicitly theoretical memory traffic. No GPU execution or benchmark.                                              |
| Vehicle       | Bicycle dynamics, heading/pure-pursuit feedback, ray/circle obstacle sensing, braking, collision and off-track states. Distances and speeds use canvas units.                                                                       |
| Inspection    | Procedural products, deterministic defect features and threshold classification; camera/gate events, rejection counters and throughput based on simulated elapsed time. No YOLO inference.                                          |

Use Play/Step/Reset controls in each applicable lab. Simulations pause when covered by another workspace window; closing and reopening a lab starts a fresh lab state. Terminal history persists for the session. Preferences for theme, motion, recent actions and first-visit boot are stored locally, with graceful storage failure. Boot lasts 1.3 seconds in full motion, can be skipped, and can be replayed. Motion-off provides manual stepping; OS reduced-motion preference is respected. Hidden tabs suspend animation clocks. Diagnostics sample actual requestAnimationFrame timestamps only while open; FPS is scheduling telemetry, not hardware utilization or a performance guarantee.

### Architecture and validation

- `src/system/registryCore.ts` and `projects.ts` validate and derive one project registry from the existing content and explorer scenes.
- `src/system/actions.ts`, `shell.ts` and `YTEnvironment.tsx` connect the launcher, virtual filesystem and project navigation to shared actions.
- `src/system/WorkspaceWindow.tsx` handles modal focus and Escape; each playground loads in its own lazy chunk with a local error boundary.
- `src/playgrounds/*Logic.ts` contain pure domain functions; React components provide controls and visual feedback. Shared motion preferences and local visibility-aware clocks avoid background simulation work.
- `tests/ytos.test.mjs` transpiles the owned pure TypeScript modules for Node's test runner; it checks registry integrity, shell boundaries, capacity constraints, matrix equivalence, sensing, classification, citations, vision and portal integration. Run `npm test` and `npm run build` before committing or deploying.

No service credentials or backend configuration are required. All new visuals are code-native SVG/CSS. Existing professional summaries remain high-level public descriptions; sample datasets and simulations contain no employer implementation or customer records.
