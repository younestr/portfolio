# Younes Traouki — intelligence, engineered.

A personal engineering portfolio presented as a living editor. Built with React, TypeScript, Vite and original SVG hand landmarks. No backend or external API is required.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm test          # deterministic typing / key synchronization tests
npm run build     # TypeScript checks and production output in dist/
npm run preview   # serve the production build locally
```

## Explore

Click the command hints, or press `:` and type a command followed by Enter. Escape returns home or closes the command input.

Commands: `about`, `projects`, `experience`, `skills`, `contact`, `resume`, `theme`, `help`, `home`.

Four persistent themes: Warm Terminal, Green Phosphor, Light Paper and Quiet Slate. Use “pause motion” for a static view. Reduced-motion preferences are respected, and animation loops stop when the document is hidden. Portfolio buffers pause typing for comfortable reading.

## Content and architecture

- `src/content.ts`: personal information, optional domain/social links, six project summaries, experience, education, themes and five original illustrative snippets.
- `src/engine.mjs`: pure typing state machine and physical key/finger mapping.
- `src/TypingEngine.ts`: React animation lifecycle, visibility and reduced-motion handling.
- `src/KeyboardVisualizer.tsx`: original keyboard geometry and two 21-landmark hands. Each typed character drives a physical key and interpolated finger target.
- `src/App.tsx`: editor shell, syntax rendering, commands and content buffers.
- `src/style.css`: responsive layout and complete theme tokens.
- `public/Younes-Traouki-CV.pdf`: user-supplied downloadable résumé.

Set `profile.domain` only after obtaining a real domain. GitHub, LinkedIn and Kaggle URLs are verified from embedded CV links; blank optional links are hidden. The GitHub profile was also supplied by the owner; project repository URLs are intentionally omitted where unknown.

## Public content

All displayed code snippets are original illustrative examples, not employer code. Professional projects contain only high-level descriptions supplied by the owner. No private source, credentials, customer data or invented metrics are included. The supplied CV includes contact details and is intentionally downloadable; review it before any future public deployment.

## Design reference

Inspired by the restrained terminal/editor composition of https://hancore.dev/. Branding, text, implementation and SVG geometry are original. IBM Plex Mono is bundled through Fontsource, so the site does not request Google Fonts.

## Publishing

The application uses relative asset paths and can be hosted from `dist/`, including under a repository subpath. GitHub repository creation does not itself deploy a website.

The requested repository is `younestr/younes-portfolio`, public, with `main` as its default branch. GitHub CLI must be installed and authenticated to the personal `younestr` account before repository creation or pushing. Do not create under an organization or overwrite an existing repository.
