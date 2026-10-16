# Spatial portfolio — implementation and validation

## Design correction

The first version centered an editor and treated projects as text buffers. This revision replaces that composition with a two-scene application: a minimal typing introduction and an asymmetric interactive project workspace. Reference observations were recorded before implementation in REFERENCE-STUDY.md.

The explorer contains a narrow moving rail of tilted original technical previews; an irregular filament field; a central project-specific terminal; right-side technical studies and fine connectors; a fixed system status strip; and a smaller integrated keyboard, hands and mouse indicator. Copilot and CUDA projects prioritize source excerpts; routing, vision, robotics and inspection prioritize their technical diagrams. No reference code or assets were reused.

## Interaction engineering

A pure reducer owns scene, project, direction, transition progress, input modality, command context and motion activity. Scene transitions use one requestAnimationFrame progress loop. Wheel gestures use an accumulated-distance threshold, a cooldown and a momentum gate. Selection clamps to six projects. Pointer capture begins only after drag intent so clicks remain reliable. Keyboard selection moves focus to the active rail object, allowing Enter to open the correct project. Contextual modal buffers retain focus and preserve the active project.

The existing character-to-key typing engine is retained. Typing and navigation events drive the same SVG hand landmarks. The navigation device reports actual input modality. The pause control disables CSS animations and scene choreography while keeping panels visible and navigable. OS prefers-reduced-motion is also honored. Visibility listeners stop animation loops while hidden.

## Verification

- Final production TypeScript/Vite build passed after source formatting.
- Eight deterministic tests passed: typing/key mapping, timing/file transitions, finger coverage, scene choreography, bounded rapid navigation, command/Enter isolation, context restoration and intro command transitions.
- Browser: Enter from introduction; wheel forward/back; direct thumbnail click; arrows and j/k; Enter into details; Escape out of details; contextual about and experience commands; persistent theme after refresh.
- Browser: mobile horizontal rail drag moved selection correctly. Mobile 390 x 844 had page dimensions 390 x 844 without horizontal overflow.
- Browser: paused motion still allowed navigation and theme buffers; Light Paper updated the rail, code, diagrams, footer and hand visualization.
- A browser-found click/drag pointer-capture conflict and stale thumbnail focus on keyboard Enter were repaired and retested.
- Modal content and project notes preserve the owner's education, experience, achievements, contact links and original project summaries. The original downloadable CV is retained.
- Source formatter applied for readable maintainable modules; no formatter was added as a runtime dependency.

OS-level reduced-motion emulation is not exposed by the connected browser controls. The equivalent manual static path was tested, and the media-query hooks and CSS fallback were reviewed. Exact reference easing, gesture thresholds and implementation internals remain unverified; these are original decisions. Reference screenshots were compared visually, without a claim of pixel-perfect equivalence.

## Repository

The existing main branch and Git repository are used. There were no unrelated working-tree changes at the start. No origin remote is configured and GitHub CLI remains unavailable on PATH. No repository will be created or remote guessed during this correction; pushing requires an existing verified personal remote.

Final production preview: the built app loaded and entered the explorer with no browser warning/error entries. Additional viewport checks returned matching page/viewport dimensions at 320 x 844, 1440 x 900 and 1920 x 1080. All six projects were reached; navigation clamped at the final project. Desktop and mobile thumbnail selection and mobile rail dragging were retested.


## YT.OS validation — 16 October 2026

Added a derived shared project registry, action launcher, bounded browser-local shell, virtual filesystem, first-visit/replayable boot, runtime diagnostics and six lazy-loaded interactive labs. Original intro, spatial selection, project notes and cinematic portal remain intact. New code lives in `src/system` and `src/playgrounds`; the domain modules are independent of React.

Validation: 22 Node tests pass, including existing typing/navigation/portal regressions and new registry, shell, routing, matrix, vehicle, inspection, synthetic vision, agent citation and shared-navigation checks. TypeScript and Vite production build pass. Production output splits every playground into its own chunk.

Browser checks covered all six lab launches and controls, route recomputation with keyboard movement, driver presets, six workflow stages and citations, matrix size changes and computed values, vehicle stepping, conveyor inspection counters, virtual file listing, Tab completion, history recall, nested-window pause, actual FPS samples, launcher Ctrl+K, experience navigation, theme/motion changes, motion persistence, replay boot and focus/Shift+Tab. Tested 1440×900 desktop and 390×844 mobile; inspection and 8×8 matrix layouts fit without horizontal overflow. SVG pointer coordinates use the screen transform to account for viewBox letterboxing.

The vision, agent and defect examples use explicitly labeled deterministic synthetic data. Matrix traffic is an assumption-based model, not a GPU speed measurement. FPS telemetry is actual browser scheduling data sampled only while diagnostics are open; no universal frame-rate guarantee is made. Motion-off uses manual stepping. Labs pause when covered; closed labs reset on reopen. These remain educational demonstrators, not production solvers, trained inference services or physical safety systems.

Delivery constraint: branch `main` has no configured Git remote, and GitHub CLI is unavailable. No remote was created or modified and no push was attempted, as required by the existing-repository-only instructions.
