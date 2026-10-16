# Reference interaction study — revision 2

Confirmed in the live browser before implementation:

- Enter from the landing page transitions to /site/#about. The reference itself navigates to another route; this implementation will use an in-app animated scene transition as requested.
- The explorer has a narrow left rail of tilted thumbnail objects. The active thumbnail is larger and aligned to an arrow. Adjacent items remain visible.
- Wheel input changes project selection and moves the rail. One browser wheel gesture traversed several entries; this version will deliberately gate gestures to one step.
- ArrowDown advances one item. Clicking a rail entry selects it. The URL hash, center terminal path/content and footer metadata change.
- Enter on a selected project revealed fuller terminal output and media. Upward wheel movement reversed selection.
- The center is an open terminal canvas, not a large framed editor. Right-side ASCII-like artwork connects to other visual elements via fine dashed lines.
- A fine branching signal/filament field runs beside the rail. Technical status information sits on a fixed horizontal band; keyboard, hands and mouse visualization sit beneath it.
- The bottom hints explicitly advertise project arrows, shot arrows, Enter and command input.

Not yet confirmed: exact reference gesture thresholds, animation easing, implementation internals and complete mobile behavior. These will be original implementation decisions. No source, images, creator identity, live metrics or proprietary assets will be copied.

Revision architecture: reducer-owned INTRO → ENTERING → EXPLORER → PROJECT_TRANSITION / PROJECT_DETAIL, with COMMAND and BUFFER states returning to their previous context. A finite six-project rail, original technical SVG identities, synchronized input feedback, keyboard/pointer/drag navigation, and persistent themes replace the former one-buffer composition.

Additional reference observations: at 390 pixels the tested reference view appeared as a very compact scaled workspace. This rebuild instead uses a readable horizontal rail on mobile. The footer command hint was visible, but the tested colon input did not expose an observable command panel; its exact behavior is not claimed as confirmed.
