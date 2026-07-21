/** Light tap feedback on supported mobile browsers. */
export function proTapHaptic(ms = 8): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(ms);
  } catch {
    // ignore unsupported / blocked vibrate
  }
}
