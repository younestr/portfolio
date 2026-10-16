import { Component, Suspense, lazy } from "react";
import type { ErrorInfo, ReactNode } from "react";
import type { PlaygroundKind } from "./registryCore";
import type { PlaygroundProps } from "../playgrounds/types";
const labs = {
  fleet: lazy(() => import("../playgrounds/FleetPlayground")),
  vision: lazy(() => import("../playgrounds/VisionPlayground")),
  agent: lazy(() => import("../playgrounds/AgentPlayground")),
  matrix: lazy(() => import("../playgrounds/MatrixPlayground")),
  vehicle: lazy(() => import("../playgrounds/VehiclePlayground")),
  inspection: lazy(() => import("../playgrounds/InspectionPlayground")),
};
class LabBoundary extends Component<
  { children: ReactNode },
  { error: string; generation: number }
> {
  state = { error: "", generation: 0 };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    return this.state.error ? (
      <div className="yt-error">
        <p>Local playground could not be rendered: {this.state.error}</p>
        <button
          onClick={() =>
            this.setState({ error: "", generation: this.state.generation + 1 })
          }
        >
          reset playground
        </button>
      </div>
    ) : (
      <div key={this.state.generation}>{this.props.children}</div>
    );
  }
}
export default function PlaygroundHost({
  kind,
  ...props
}: PlaygroundProps & { kind: PlaygroundKind }) {
  const Lab = labs[kind];
  return (
    <LabBoundary key={kind}>
      <Suspense
        fallback={<p className="yt-muted">Loading local playground module…</p>}
      >
        <Lab {...props} motion={props.active ? props.motion : "off"} />
      </Suspense>
    </LabBoundary>
  );
}
