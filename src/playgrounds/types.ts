export type MotionMode = "full" | "reduced" | "off";
export type PlaygroundProps = {
  motion: MotionMode;
  active: boolean;
  onStatus: (status: string) => void;
};
export type Point = { x: number; y: number };
