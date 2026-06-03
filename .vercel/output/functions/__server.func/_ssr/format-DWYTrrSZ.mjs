function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}
function durationLabel(startIso, endIso) {
  const ms = Math.max(0, new Date(endIso).getTime() - new Date(startIso).getTime());
  const mins = Math.round(ms / 6e4);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} Hour${h > 1 ? "s" : ""} ${m} Minute${m > 1 ? "s" : ""}`;
  if (h) return `${h} Hour${h > 1 ? "s" : ""}`;
  return `${m} Minute${m > 1 ? "s" : ""}`;
}
function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export {
  fmtDate as a,
  durationLabel as d,
  fmtTime as f,
  toLocalInput as t
};
