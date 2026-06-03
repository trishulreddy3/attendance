import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { c as confetti } from "../_libs/canvas-confetti.mjs";
import { S as Scanner } from "../_libs/yudiel__react-qr-scanner.mjs";
import { u as useApp } from "./router-BUawHviS.mjs";
import { f as fmtTime } from "./format-DWYTrrSZ.mjs";
import "../_libs/sonner.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import { S as ScanLine, X, k as MapPin, l as LoaderCircle, j as CircleCheck, T as TriangleAlert } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/barcode-detector.mjs";
import "../_libs/webrtc-adapter.mjs";
import "../_libs/sdp.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/stomp__stompjs.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function ScanPage() {
  const {
    sessions,
    currentStudent,
    markAttendance
  } = useApp();
  const nav = useNavigate();
  const me = currentStudent();
  const [stage, setStage] = reactExports.useState("idle");
  const [qrToken, setQrToken] = reactExports.useState(null);
  const [pickedSessionId, setPickedSessionId] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [cachedPos, setCachedPos] = reactExports.useState(null);
  if (!me) return null;
  sessions.filter((s) => s.branch === me.branch && Date.now() >= new Date(s.startTime).getTime() && Date.now() <= new Date(s.endTime).getTime());
  reactExports.useEffect(() => {
    if (stage === "scanning") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => setCachedPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }), (err) => console.log("Location pre-fetch failed:", err), {
          enableHighAccuracy: true,
          maximumAge: 1e4,
          timeout: 15e3
        });
      }
    }
  }, [stage]);
  reactExports.useEffect(() => {
    if (stage !== "geo") return;
    const performMark = async (lat, lng) => {
      setStage("marking");
      setTimeout(async () => {
        if (!pickedSessionId || !qrToken) {
          setError("Missing session or token");
          setStage("fail");
          return;
        }
        const r = await markAttendance(pickedSessionId, me.id, qrToken, lat, lng);
        if (!r.ok) {
          setError(r.error ?? "Couldn't mark attendance");
          setStage("fail");
          return;
        }
        setStage("success");
        confetti({
          particleCount: 80,
          spread: 70,
          origin: {
            y: 0.4
          },
          colors: ["#6366f1", "#22c55e", "#a5b4fc"]
        });
      }, 400);
    };
    if (cachedPos) {
      performMark(cachedPos.lat, cachedPos.lng);
    } else {
      const t = setTimeout(() => {
        if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser");
          setStage("fail");
          return;
        }
        navigator.geolocation.getCurrentPosition((pos) => performMark(pos.coords.latitude, pos.coords.longitude), (err) => {
          setError("Location access denied or unavailable.");
          setStage("fail");
        }, {
          enableHighAccuracy: true
        });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [stage, pickedSessionId, qrToken, me.id, markAttendance, cachedPos]);
  const reset = () => {
    setStage("idle");
    setPickedSessionId(null);
    setQrToken(null);
    setError("");
    setCachedPos(null);
  };
  const onScan = (result) => {
    if (result && result.startsWith("pulse://session/")) {
      const parts = result.split("/");
      if (parts.length >= 5) {
        const sid = parts[3];
        const token = parts[4];
        setPickedSessionId(sid);
        setQrToken(token);
        setStage("geo");
      }
    }
  };
  const session = pickedSessionId ? sessions.find((s) => s.id === pickedSessionId) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
    stage === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, exit: {
      opacity: 0,
      y: -10
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Scan Attendance QR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Tap below to open your camera and scan the projected QR code." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 rounded-2xl border border-dashed border-border p-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid size-12 place-items-center rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "size-5 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setStage("scanning"), className: "mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-accent", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "size-4" }),
          " Open Camera"
        ] })
      ] }) })
    ] }, "idle"),
    stage === "scanning" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      scale: 0.98
    }, animate: {
      opacity: 1,
      scale: 1
    }, exit: {
      opacity: 0,
      scale: 0.98
    }, className: "mx-auto max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Point your camera at the QR code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: reset, className: "rounded-md p-1.5 text-muted-foreground hover:bg-accent", "aria-label": "Cancel", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-3xl border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scanner, { onScan: (result) => onScan(result[0].rawValue), onError: (err) => console.log(err), formats: ["qr_code"] }) })
    ] }, "scan"),
    stage === "geo" && /* @__PURE__ */ jsxRuntimeExports.jsx(GeoStep, {}, "geo"),
    stage === "marking" && /* @__PURE__ */ jsxRuntimeExports.jsx(MarkingStep, {}, "mark"),
    stage === "success" && session && /* @__PURE__ */ jsxRuntimeExports.jsx(SuccessCard, { session, onDone: () => nav({
      to: "/student/dashboard"
    }), onAgain: reset }, "ok"),
    stage === "fail" && /* @__PURE__ */ jsxRuntimeExports.jsx(FailCard, { error, onRetry: reset }, "fail")
  ] }) });
}
function GeoStep() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    y: 8
  }, animate: {
    opacity: 1,
    y: 0
  }, exit: {
    opacity: 0
  }, className: "mx-auto max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid size-20 place-items-center rounded-full bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { animate: {
      scale: [1, 1.15, 1]
    }, transition: {
      duration: 1.4,
      repeat: Infinity
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-8" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-semibold", children: "Verifying location…" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Ensuring you're inside the attendance zone." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "h-full bg-primary", initial: {
      width: 0
    }, animate: {
      width: "100%"
    }, transition: {
      duration: 1.4
    } }) })
  ] });
}
function MarkingStep() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    y: 8
  }, animate: {
    opacity: 1,
    y: 0
  }, exit: {
    opacity: 0
  }, className: "mx-auto max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid size-20 place-items-center rounded-full bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-8 animate-spin" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-semibold", children: "Marking attendance…" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Hang tight, almost done." })
  ] });
}
function SuccessCard({
  session,
  onDone,
  onAgain
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    scale: 0.96
  }, animate: {
    opacity: 1,
    scale: 1
  }, exit: {
    opacity: 0
  }, className: "mx-auto max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      scale: 0,
      rotate: -30
    }, animate: {
      scale: 1,
      rotate: 0
    }, transition: {
      type: "spring",
      stiffness: 220,
      damping: 14
    }, className: "mx-auto grid size-24 place-items-center rounded-full bg-success text-success-foreground shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--success)_70%,transparent)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-12" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 text-2xl font-semibold tracking-tight", children: "Attendance marked" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "You're all set — see you next class." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mt-6 max-w-xs rounded-2xl border border-border bg-card p-4 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Session", v: session.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Subject", v: session.subject }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Time", v: `${fmtTime(session.startTime)} — ${fmtTime(session.endTime)}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onAgain, className: "rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-accent", children: "Scan another" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onDone, className: "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: "Go to dashboard" })
    ] })
  ] });
}
function Row({
  k,
  v
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: v })
  ] });
}
function FailCard({
  error,
  onRetry
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    scale: 0.96
  }, animate: {
    opacity: 1,
    scale: 1
  }, exit: {
    opacity: 0
  }, className: "mx-auto max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      x: 0
    }, animate: {
      x: [0, -8, 8, -6, 6, 0]
    }, transition: {
      duration: 0.5
    }, className: "mx-auto grid size-20 place-items-center rounded-full bg-destructive/15 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-9" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 text-2xl font-semibold tracking-tight", children: "Attendance not marked" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: error || "You are outside the allowed attendance zone." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRetry, className: "mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: "Try again" })
  ] });
}
export {
  ScanPage as component
};
