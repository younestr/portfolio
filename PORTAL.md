# Cinematic portal transition

## Scope and reference

Only the transition between the existing introduction and explorer is changed. Both scenes remain mounted with the same stable layout, typography, colors, project content, rail, footer and theme system.

The live reference Enter sequence was captured in successive screenshots. Confirmed visual phases: code/glyph dissolution, a circular black silhouette with a fine warm rim, densely projected radial streaks, increasing apparent streak length, and the explorer settling after travel. Browser screenshot latency prevented reliable 100–200 ms sampling; actual capture timestamps were recorded rather than presented as exact animation timing. The original implementation uses a compact 2.1-second sequence instead of claiming identical timing or source internals.

## Implementation

- `src/CinematicPortalTransition.tsx`: one requestAnimationFrame lifecycle, visibility suspension, resize handling, coarse reducer progress and completion, reduced-motion fallback, aggregate timing diagnostics.
- `src/PortalRenderer.ts`: optimized Canvas 2D renderer, projected star cylinder, depth-derived trails, occluding void, thin layered rim and precomputed scattering sprite.
- `src/portal.mjs`: pure choreography, integrated camera acceleration/deceleration, projection and repeatable particle buffers.
- `src/App.tsx`: mounts the transition only in ENTERING/LEAVING, keeps both destination scenes prepared, temporarily pauses covered hand rendering, and restores focus on completion.
- `src/navigation.mjs`: makes portal travel atomic, rejecting duplicate Enter, Back, commands and project-selection actions until completion.
- `src/style.css`: portal-only compositing rules and gentle opacity fallback; stable page layout rules remain unchanged.
- `tests/portal.test.mjs`: projection, acceleration, choreography, finite buffers and duplicate-input regression tests.
- `package.json`: includes portal tests in the existing test command. No dependency added.

## Choreography

Departure gently recedes and dims the current scene. The near-black overlay and luminous edge form first; a perspective field accelerates, making closer streaks move and elongate faster. The destination scene reaches its final position beneath the opaque middle phase before the overlay recedes. Reverse travel changes depth direction and contracts the rim, sharing the same visual environment. Navigation is enabled only after completion; Canvas unmounts and releases its buffers and event listeners.

The existing reduced-motion preference and pause control select an approximately 180 ms opacity crossfade with no star field, scale, blur or moving tunnel. Mid-transition preference changes continue from current progress. A missing Canvas context uses the same gentle path.

## Performance

Desktop: 2,600 seeded particles. Mobile: 1,100. Typed arrays and sixteen stroke batches are reused per frame. DPR is capped at 1.5 desktop / 1.25 mobile, with a 3.6-million-pixel raster ceiling. Halo texture and gradients are prepared once. React receives coarse progress; per-frame compositing updates run directly against CSS properties. Covered hand/project animations pause during travel. Resize redraws the current frame immediately; hidden tabs suspend the clock and resume from the same elapsed time. Diagnostics retain only aggregate counts and timing, not a growing event log.

The 60 FPS target is a rendering goal, not a claim inferred from screenshots. Browser screenshot capture introduces substantial frame stalls; clean production runs and measured draw cost are recorded separately in final validation notes.

## Final validation

- Production build: passed. All twelve tests passed, including the existing eight navigation/typing tests.
- Captured forward departure, formation, acceleration and arrival, plus mobile reverse travel, and compared the circular silhouette/rim/streak geometry with captured reference frames. Increased field density and luminosity after the first visual pass.
- Production browser: keyboard and pointer entry, reverse navigation, repeated cycles, duplicate Enter/command/Escape during travel, resize during travel, retained project selection and theme, and working project details after arrival.
- Canvas count returned to zero after every completed cycle. Production console showed no warnings or errors. Resize redraw preserved rendering at 1920 x 1080; 1440 x 900 and 390 x 844 were also checked. Mobile page remained 390 x 844 without overflow.
- The existing pause control exercised the same 180 ms gentle path used by the OS reduced-motion preference, in both directions. No tunnel was drawn in that mode. OS-level preference emulation is unavailable through the connected browser controls; the media-query hook itself was reviewed.
- An uninterrupted production run measured approximately 1.9 ms average Canvas draw work at 1920 x 1080, and approximately 0.84 ms on the mobile viewport. Overall frame delivery in the automated desktop browser had substantial scheduling stalls, including long gaps; 60 FPS was not verified. Screenshot capture makes this worse. These figures describe the tested environment and are not a guarantee of frame cadence on other hardware.
- Stable layouts were preserved: CSS changes are scoped to active portal compositing, plus formatting and the new programmatic focus target. No project content, theme tokens, rail geometry, footer content or stable page positioning was redesigned.
