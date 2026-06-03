import { createFileRoute, useNavigate } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2, MapPin, ScanLine, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Scanner as QrScanner } from "@yudiel/react-qr-scanner";
import { useApp } from "@/lib/store";
import { fmtTime } from "@/lib/format";

export const Route = createFileRoute("/student/scan")({
  head: () => ({ meta: [{ title: "Scan QR — Pulse" }] }),
  component: ScanPage,
});

type Stage = "idle" | "scanning" | "geo" | "marking" | "success" | "fail";

function ScanPage() {
  const { sessions, currentStudent, markAttendance } = useApp();
  const nav = useNavigate();
  const me = currentStudent();
  const [stage, setStage] = useState<Stage>("idle");
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [pickedSessionId, setPickedSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [cachedPos, setCachedPos] = useState<{lat: number, lng: number} | null>(null);

  if (!me) return null;

  const liveSessions = sessions.filter(
    (s) => s.branch === me.branch &&
      Date.now() >= new Date(s.startTime).getTime() &&
      Date.now() <= new Date(s.endTime).getTime(),
  );

  // Pre-fetch location as soon as camera opens to prevent token expiration
  useEffect(() => {
    if (stage === "scanning") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setCachedPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => console.log("Location pre-fetch failed:", err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
      }
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== "geo") return;

    const performMark = async (lat: number, lng: number) => {
      setStage("marking");
      setTimeout(async () => {
        if (!pickedSessionId || !qrToken) {
          setError("Missing session or token");
          setStage("fail");
          return;
        }
        const r = await markAttendance(pickedSessionId, me.id, qrToken, lat, lng);
        if (!r.ok) { setError(r.error ?? "Couldn't mark attendance"); setStage("fail"); return; }
        setStage("success");
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ["#6366f1", "#22c55e", "#a5b4fc"] });
        setTimeout(() => nav({ to: "/student/dashboard" }), 3000);
      }, 400); // reduced delay for snappier feel
    };

    if (cachedPos) {
      // Use pre-fetched location!
      performMark(cachedPos.lat, cachedPos.lng);
    } else {
      // Fallback if not fetched yet
      const t = setTimeout(() => {
        if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser");
          setStage("fail");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => performMark(pos.coords.latitude, pos.coords.longitude),
          (err) => {
            setError("Location access denied or unavailable.");
            setStage("fail");
          },
          { enableHighAccuracy: true }
        );
      }, 400);
      return () => clearTimeout(t);
    }
  }, [stage, pickedSessionId, qrToken, me.id, markAttendance, cachedPos]);

  const reset = () => { setStage("idle"); setPickedSessionId(null); setQrToken(null); setError(""); setCachedPos(null); };

  const onScan = (result: string) => {
    // Expected format: pulse://session/{sessionId}/{qrToken}
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

  return (
    <div className="mx-auto max-w-3xl">
      <AnimatePresence mode="wait">
        {stage === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h2 className="text-2xl font-semibold tracking-tight">Scan Attendance QR</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tap below to open your camera and scan the projected QR code.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 rounded-2xl border border-dashed border-border p-10 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted"><ScanLine className="size-5 text-muted-foreground" /></div>
                <button onClick={() => setStage("scanning")} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-accent">
                  <ScanLine className="size-4" /> Open Camera
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === "scanning" && (
          <motion.div key="scan" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="mx-auto max-w-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold">Point your camera at the QR code</p>
              <button onClick={reset} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" aria-label="Cancel"><X className="size-4" /></button>
            </div>
            <div className="overflow-hidden rounded-3xl border border-border">
              <QrScanner 
                onScan={(result) => onScan(result[0].rawValue)} 
                onError={(err) => console.log(err)}
                formats={['qr_code']}
              />
            </div>
          </motion.div>
        )}

        {stage === "geo" && <GeoStep key="geo" />}
        {stage === "marking" && <MarkingStep key="mark" />}

        {stage === "success" && session && (
          <SuccessCard key="ok" session={session} onDone={() => nav({ to: "/student/dashboard" })} onAgain={reset} />
        )}

        {stage === "fail" && <FailCard key="fail" error={error} onRetry={reset} />}
      </AnimatePresence>
    </div>
  );
}

function GeoStep() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-md text-center">
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/15 text-primary">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <MapPin className="size-8" />
        </motion.div>
      </div>
      <p className="mt-4 font-semibold">Verifying location…</p>
      <p className="text-sm text-muted-foreground">Ensuring you're inside the attendance zone.</p>
      <div className="mx-auto mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.4 }} />
      </div>
    </motion.div>
  );
}

function MarkingStep() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-md text-center">
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/15 text-primary">
        <Loader2 className="size-8 animate-spin" />
      </div>
      <p className="mt-4 font-semibold">Marking attendance…</p>
      <p className="text-sm text-muted-foreground">Hang tight, almost done.</p>
    </motion.div>
  );
}

function SuccessCard({ session, onDone, onAgain }: { session: { name: string; subject: string; startTime: string; endTime: string }; onDone: () => void; onAgain: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-md text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="mx-auto grid size-24 place-items-center rounded-full bg-success text-success-foreground shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--success)_70%,transparent)]"
      >
        <CheckCircle2 className="size-12" />
      </motion.div>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">Attendance marked</h2>
      <p className="text-sm text-muted-foreground">You're all set — see you next class.</p>
      <div className="mx-auto mt-6 max-w-xs rounded-2xl border border-border bg-card p-4 text-left">
        <Row k="Session" v={session.name} />
        <Row k="Subject" v={session.subject} />
        <Row k="Time" v={`${fmtTime(session.startTime)} — ${fmtTime(session.endTime)}`} />
      </div>
      <div className="mt-5 flex justify-center gap-2">
        <button onClick={onAgain} className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-accent">Scan another</button>
        <button onClick={onDone} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Go to dashboard</button>
      </div>
    </motion.div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function FailCard({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-md text-center">
      <motion.div initial={{ x: 0 }} animate={{ x: [0, -8, 8, -6, 6, 0] }} transition={{ duration: 0.5 }}
        className="mx-auto grid size-20 place-items-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="size-9" />
      </motion.div>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">Attendance not marked</h2>
      <p className="text-sm text-muted-foreground">{error || "You are outside the allowed attendance zone."}</p>
      <button onClick={onRetry} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Try again</button>
    </motion.div>
  );
}
