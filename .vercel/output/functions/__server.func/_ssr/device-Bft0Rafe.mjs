async function getDeviceFingerprint() {
  const STORAGE_KEY = "pulse.device.token";
  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    const rawData = [
      crypto.randomUUID(),
      navigator.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      (/* @__PURE__ */ new Date()).getTimezoneOffset()
    ].join("|");
    const msgBuffer = new TextEncoder().encode(rawData);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    token = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
}
export {
  getDeviceFingerprint
};
