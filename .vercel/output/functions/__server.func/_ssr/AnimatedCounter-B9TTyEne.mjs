import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useMotionValue, a as useTransform, b as animate, m as motion } from "../_libs/framer-motion.mjs";
function AnimatedCounter({ value, decimals = 0, suffix = "" }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => v.toFixed(decimals) + suffix);
  reactExports.useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [value, mv]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { children: rounded });
}
export {
  AnimatedCounter as A
};
