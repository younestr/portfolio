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
