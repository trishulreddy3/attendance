import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
const Field = reactExports.forwardRef(function Field2({ label, error, leftIcon, rightSlot, className, ...rest }, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "group flex items-center gap-2 rounded-lg border bg-card px-3 transition-all",
          "border-input focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15",
          error && "border-destructive focus-within:ring-destructive/15"
        ),
        children: [
          leftIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground [&_svg]:size-4", children: leftIcon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref,
              className: cn(
                "h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70",
                className
              ),
              ...rest
            }
          ),
          rightSlot
        ]
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-destructive", children: error })
  ] });
});
export {
  Field as F
};
