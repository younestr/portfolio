type Props = { project: number; compact?: boolean; active?: boolean };
const nodes = [
  [35, 125],
  [79, 48],
  [145, 86],
  [209, 30],
  [265, 102],
  [217, 168],
  [115, 172],
  [284, 185],
];
export default function ProjectVisual({
  project,
  compact = false,
  active = true,
}: Props) {
  return (
    <svg
      viewBox="0 0 320 220"
      className={`project-visual visual-${project} ${compact ? "compact" : ""} ${active ? "is-active" : ""}`}
      role="img"
      aria-label={
        [
          "Illustrative route network",
          "Illustrative video tracking frame",
          "Illustrative retrieval and agent pipeline",
          "Illustrative tiled matrix multiplication",
          "Illustrative autonomous driving track",
          "Illustrative industrial inspection conveyor",
        ][project]
      }
    >
      <defs>
        <pattern
          id={`grid-${project}-${compact}`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="currentColor"
            strokeWidth=".35"
            opacity=".2"
          />
        </pattern>
      </defs>
      <rect
        width="320"
        height="220"
        fill={`url(#grid-${project}-${compact})`}
      />
      {project === 0 && (
        <>
          <g className="graph-edges">
            {[
              [0, 1],
              [0, 6],
              [1, 2],
              [1, 3],
              [2, 3],
              [2, 4],
              [2, 6],
              [3, 4],
              [4, 5],
              [5, 6],
              [4, 7],
              [5, 7],
            ].map(([a, b], i) => (
              <line
                key={i}
                x1={nodes[a][0]}
                y1={nodes[a][1]}
                x2={nodes[b][0]}
                y2={nodes[b][1]}
              />
            ))}
          </g>
          <path
            className="route-path"
            d="M35 125 L79 48 L145 86 L209 30 L265 102 L284 185 L217 168 L115 172 Z"
          />
          {nodes.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={i === 0 ? 6 : 3} />
              <text x={x + 8} y={y + 3}>
                {i === 0 ? "DEPOT" : `n${i}`}
              </text>
            </g>
          ))}
          <circle className="vehicle" r="4">
            <animateMotion
              dur="13s"
              repeatCount="indefinite"
              path="M35 125 L79 48 L145 86 L209 30 L265 102 L284 185 L217 168 L115 172 Z"
            />
          </circle>
          <text x="14" y="210">
            constraint graph / feasible path
          </text>
        </>
      )}
      {project === 1 && (
        <>
          <path
            className="road-grid"
            d="M58 220 L125 60 M262 220 L195 60 M160 220 V60 M0 130 H320 M0 180 H320"
          />
          <path d="M55 42 V24 H74 M246 24 H265 V42 M55 177 V194 H74 M246 194 H265 V177" />
          <rect
            className="tracking-target"
            x="120"
            y="65"
            width="77"
            height="105"
            rx="3"
          />
          <path d="M136 105 L158 97 L182 106 M145 132 Q160 141 174 131" />
          {[
            [143, 105],
            [176, 105],
            [160, 121],
            [151, 135],
            [169, 135],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2" />
          ))}
          <path className="scanline" d="M55 64 H265" />
          <text x="124" y="57">
            TRACK_01
          </text>
          <text x="14" y="210">
            frame → perception → event
          </text>
        </>
      )}
      {project === 2 && (
        <>
          <g className="pipeline-lines">
            <path d="M53 106 H268 M112 106 V53 H198 V106 M112 106 V165 H198 V106" />
          </g>
          {[
            [24, 88, "query"],
            [98, 35, "retrieve"],
            [98, 147, "tools"],
            [184, 88, "model"],
            [258, 88, "reply"],
          ].map(([x, y, t], i) => (
            <g key={i} className={`pipeline-node node-${i}`}>
              <rect
                x={Number(x)}
                y={Number(y)}
                width={i === 4 ? 47 : 60}
                height="35"
              />
              <text x={Number(x) + 7} y={Number(y) + 21}>
                {t}
              </text>
            </g>
          ))}
          <text x="14" y="210">
            grounded context / explicit sources
          </text>
        </>
      )}
      {project === 3 && (
        <>
          {[0, 1, 2].map((matrix) => (
            <g key={matrix} transform={`translate(${18 + matrix * 105},58)`}>
              {Array.from({ length: 36 }, (_, i) => (
                <rect
                  key={i}
                  className={
                    Math.floor(i / 6) === project || i % 6 === 2
                      ? `tile tile-active tile-${i % 6}`
                      : "tile"
                  }
                  x={(i % 6) * 12}
                  y={Math.floor(i / 6) * 12}
                  width="10"
                  height="10"
                />
              ))}
              <text x="0" y="95">
                {["A / shared", "B / shared", "C / output"][matrix]}
              </text>
            </g>
          ))}
          <text x="105" y="96">
            ×
          </text>
          <text x="210" y="96">
            =
          </text>
          <text x="14" y="210">
            GEMM / tiled memory access
          </text>
        </>
      )}
      {project === 4 && (
        <>
          <path
            className="track-boundary"
            d="M65 180 C5 155 35 55 103 40 S280 28 282 90 S170 110 187 160 S118 205 65 180 Z"
          />
          <path
            className="track-center"
            d="M70 161 C30 145 54 73 108 60 S260 48 260 90 S149 103 166 157 S110 177 70 161 Z"
          />
          <path
            className="track-boundary"
            d="M78 143 C58 130 75 91 114 80 S234 68 238 87 S126 95 145 155 S109 153 78 143 Z"
          />
          <g className="car">
            <rect x="64" y="147" width="20" height="11" rx="2" />
            <path d="M84 152 L122 129 M84 152 L128 156 M84 152 L121 177" />
          </g>
          <path d="M216 128 L223 114 L230 128 Z" />
          <text x="14" y="210">
            perception + control / closed loop
          </text>
        </>
      )}
      {project === 5 && (
        <>
          <path d="M15 146 H306 M15 177 H306" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={22 + i * 24} cy="163" r="5" />
          ))}
          {[0, 1, 2, 3].map((v) => (
            <g key={v} transform={`translate(${30 + v * 73},100)`}>
              <path d="M0 35 Q0 2 25 4 Q50 4 50 35 Z" />
              <rect
                className={v === 2 ? "defect-box" : ""}
                x="-4"
                y="-2"
                width="58"
                height="42"
              />
              {v === 2 && (
                <>
                  <path className="defect" d="M21 10 L29 16 L22 23" />
                  <text x="0" y="-10">
                    INSPECT
                  </text>
                </>
              )}
            </g>
          ))}
          <path d="M145 30 H180 V55 H145 Z M162 55 V84 M147 83 L162 72 L178 83" />
          <path className="scanline" d="M15 93 H305" />
          <text x="14" y="210">
            camera → inference → Kafka
          </text>
        </>
      )}
    </svg>
  );
}
