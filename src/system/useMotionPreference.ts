import { useCallback, useEffect, useState } from "react";
import type { MotionMode } from "../playgrounds/types";
export function useMotionPreference() {
  const [preference, setPreferenceState] = useState<MotionMode>(() => {
    try {
      const saved = localStorage.getItem("yt-motion");
      return ["full", "reduced", "off"].includes(saved ?? "")
        ? (saved as MotionMode)
        : "full";
    } catch {
      return "full";
    }
  });
  const [osReduced, setOsReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOsReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const setPreference = useCallback((value: MotionMode) => {
    setPreferenceState(value);
    try {
      localStorage.setItem("yt-motion", value);
    } catch {}
  }, []);
  const motion: MotionMode =
    preference === "off"
      ? "off"
      : osReduced || preference === "reduced"
        ? "reduced"
        : "full";
  return { motion, preference, setPreference, osReduced };
}
