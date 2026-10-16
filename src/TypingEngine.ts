import { useEffect, useState } from "react";
import { snippets } from "./content";
import { advance } from "./engine.mjs";
export function useTyping(paused: boolean) {
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [state, setState] = useState({
    file: 0,
    count: 105,
    phase: "typing",
    next: 0,
    key: "",
  });
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || reduced) return;
    let id = 0;
    let current = { ...state, next: 0 };
    const tick = (now: number) => {
      const next = advance(current, snippets, now);
      if (next !== current) {
        current = next;
        setState(next);
      }
      id = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(id);
      if (!document.hidden) {
        current.next = 0;
        id = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    if (!document.hidden) id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("visibilitychange", visibility);
    };
    // State is owned by this animation loop until paused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, reduced]);
  return {
    ...state,
    count: reduced ? snippets[state.file].code.length : state.count,
    key: reduced || paused ? "" : state.key,
    reduced,
  };
}
