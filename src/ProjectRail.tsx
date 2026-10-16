import { useRef } from "react";
import { projects } from "./content";
import { projectScenes } from "./projectScenes";
import ProjectVisual from "./ProjectVisual";
type Props = {
  active: number;
  select: (index: number, modality: string) => void;
  move: (delta: number, modality: string) => void;
  open: () => void;
};
export default function ProjectRail({ active, select, move, open }: Props) {
  const gesture = useRef({ x: 0, y: 0, dragged: false });
  return (
    <aside className="project-rail" aria-label="Project selection">
      <svg className="signal-field" viewBox="0 0 100 600" aria-hidden="true">
        <path
          className="signal-spine"
          d="M78 0 C44 94 94 116 63 208 S91 346 61 425 S85 548 72 600"
        />
        {Array.from({ length: 90 }, (_, i) => {
          const y = i * 7;
          const knot =
            Math.exp(-Math.pow((y - 230 - active * 12) / 48, 2)) * 48 +
            Math.exp(-Math.pow((y - 460 + active * 9) / 33, 2)) * 29;
          const strength =
            5 + Math.sin(i * 1.71 + active) * 9 + Math.cos(i * 0.83) * 5 + knot;
          return (
            <path
              key={i}
              d={`M${70 + Math.sin(i * 0.15) * 8} ${y} Q${50 - strength * 0.8} ${y - 26} ${65 - strength} ${y - 13} L${65 + Math.cos(i) * 10} ${y + 12}`}
              style={{ opacity: 0.14 + (i % 7) * 0.07 }}
            />
          );
        })}
      </svg>
      <span className="rail-label">INDEX / ENGINEERING</span>
      <div
        className="rail-viewport"
        onPointerDown={(e) => {
          gesture.current = { x: e.clientX, y: e.clientY, dragged: false };
        }}
        onPointerMove={(e) => {
          if (
            e.buttons &&
            Math.hypot(
              e.clientX - gesture.current.x,
              e.clientY - gesture.current.y,
            ) > 12
          )
            e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          const g = gesture.current;
          const delta = matchMedia("(max-width: 760px)").matches
            ? e.clientX - g.x
            : e.clientY - g.y;
          if (Math.abs(delta) > 35) {
            g.dragged = true;
            move(delta < 0 ? 1 : -1, "drag");
          }
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          gesture.current.dragged = false;
        }}
      >
        <div
          className="rail-track"
          style={{ "--selection": active } as React.CSSProperties}
        >
          {projects.map((p, i) => (
            <button
              key={p.file}
              className={`rail-object ${i === active ? "selected" : ""}`}
              style={
                {
                  "--item": i,
                  "--tilt": `${[-8, 6, -4, 7, -7, 5][i]}deg`,
                } as React.CSSProperties
              }
              onClick={() => {
                if (gesture.current.dragged) {
                  gesture.current.dragged = false;
                  return;
                }
                select(i, "pointer");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (i !== active) select(i, "keyboard");
                  else open();
                }
              }}
              onFocus={(e) => {
                if (e.currentTarget.matches(":focus-visible"))
                  select(i, "keyboard");
              }}
              aria-label={`Select ${p.name}`}
              aria-current={i === active ? "true" : undefined}
            >
              <span className="thumbnail">
                <ProjectVisual project={i} compact active={i === active} />
              </span>
              <span className="rail-object-label">
                <span>{String(i + 1).padStart(2, "0")}</span>
                {projectScenes[i].short}
              </span>
            </button>
          ))}
        </div>
      </div>
      <span className="selection-marker" aria-hidden="true">
        ▸
      </span>
      <div className="rail-controls">
        <button
          onClick={() => move(-1, "pointer")}
          disabled={active === 0}
          aria-label="Previous project"
        >
          ↑
        </button>
        <span>scroll · drag · select</span>
        <button
          onClick={() => move(1, "pointer")}
          disabled={active === projects.length - 1}
          aria-label="Next project"
        >
          ↓
        </button>
      </div>
    </aside>
  );
}
