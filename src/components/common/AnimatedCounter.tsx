import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export function AnimatedCounter({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => v.toFixed(decimals) + suffix);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}
