import { useEffect } from "react";
import type { MotionMode } from "../playgrounds/types";
export default function BootSequence({
  motion,
  projects,
  actions,
  finish,
}: {
  motion: MotionMode;
  projects: number;
  actions: number;
  finish: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(
      finish,
      motion === "full" ? 1300 : motion === "reduced" ? 180 : 0,
    );
    return () => clearTimeout(timer);
  }, [motion, finish]);
  return (
    <div className={`yt-boot yt-motion-${motion}`}>
      <div>
        <span>YT.OS / LOCAL INITIALIZATION</span>
        {[
          "interface resources",
          "personal identity",
          `${projects} project entries`,
          `${actions} registered actions`,
          "browser workspace",
        ].map((line, i) => (
          <p key={line} style={{ animationDelay: `${i * 130}ms` }}>
            <b>[ OK ]</b> {line}
          </p>
        ))}
        <p className="yt-boot-ready">session ready.</p>
        <button autoFocus onClick={finish}>
          skip ↵
        </button>
      </div>
    </div>
  );
}
