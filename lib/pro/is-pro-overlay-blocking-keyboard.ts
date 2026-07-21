/** True when a modal/dialog/overlay should block global G-sequence nav. */
export function isProOverlayBlockingKeyboard(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(
    document.querySelector('[aria-modal="true"]') ||
      document.querySelector("[data-pro-overlay]")
  );
}
