# Design and validation notes

## Reference study

Inspected https://hancore.dev/ in the browser: sparse identity/navigation, small monospaced code, line-number gutter, restrained syntax colors, Vim mode/status strip, dark negative space, keyboard/hand-tracking concept, and the colorscheme chooser. The reference uses a much larger theme catalog; this portfolio implements the four requested original schemes. The implementation follows the supplied warm palette and composition rather than copying branding, artwork, text or code. No pixel-perfect equivalence or exhaustive reproduction of reference interactions is claimed.

## Original implementation

A deterministic state machine types one character at a time, pauses at line boundaries and between files, and transitions through typing, hold and switch states. The same character selects a physical key and finger. Two SVG hands each contain 21 interpolated landmarks, connected finger bones, palm geometry, tracking bounds and metadata. Rendering uses requestAnimationFrame with visibility cleanup. Static reduced-motion and manual pause modes are available.

Content lives in editor buffers, including an explorable six-file project index. All professional project descriptions are high-level owner-supplied summaries. Code sequences are original illustrative fragments, not employer source. Theme variables cover text, syntax, surfaces, keys, landmarks and status bars. Fonts are local bundled assets.

## Verification on 2026-10-16

- Production build: TypeScript plus Vite passed.
- Three deterministic engine tests passed: character-to-key mapping, mode/file transitions, and punctuation/finger coverage.
- Browser: profile, education, projects, GPU project selection, experience, skills and contact buffers inspected.
- Commands: colon opens input; Enter executes; Escape returns home; unknown commands display an error.
- Theme: Light Paper selection applied to the whole interface and persisted after reload; Warm Terminal restored.
- Responsive: 390 x 844 mobile showed no horizontal overflow. 1280 x 720, 1440 x 900 and 1920 x 1080 desktop layouts fit the viewport after refinement.
- Preview HTML and CV endpoints returned HTTP 200. Downloadable CV SHA256 matches the supplied original.
- Browser console had no warning/error entries at the checked point.
- Source scan found no credential patterns; node_modules, dist, .env and .env.production are ignored.
- Reduced-motion and hidden-tab lifecycle support were reviewed in source; OS-level reduced-motion behavior was not separately emulated.

## GitHub blocker

`gh auth status` could not run because GitHub CLI is not installed or available on PATH. No repository was created, no origin was assigned, and nothing was pushed. Install GitHub CLI and authenticate as personal account `younestr`, then verify account type and repository nonexistence before creating the public repository. Never create it under an organization.
