export async function getDeviceFingerprint(): Promise<string> {
  const STORAGE_KEY = "pulse.device.token";
  let token = localStorage.getItem(STORAGE_KEY);

  if (!token) {
    // Generate a unique token for this browser profile
    const rawData = [
      crypto.randomUUID(),
      navigator.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset()
    ].join("|");
    
    // Hash it using SHA-256 for a cleaner fingerprint
    const msgBuffer = new TextEncoder().encode(rawData);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    token = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    
    localStorage.setItem(STORAGE_KEY, token);
  }

  return token;
}
