/** Client-side resize/compress so reference stills fit in cloud project state. */
export async function compressReferenceImage(
  file: File,
  targetBytes = 120_000
): Promise<{ dataUrl: string; approxBytes: number }> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 1280;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height, 1));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const qualities = mime === "image/jpeg" ? [0.85, 0.75, 0.65, 0.55, 0.45] : [undefined];

  let best = canvas.toDataURL(mime);
  for (const q of qualities) {
    const dataUrl = q === undefined ? best : canvas.toDataURL(mime, q);
    const approxBytes = Math.round((dataUrl.length * 3) / 4);
    best = dataUrl;
    if (approxBytes <= targetBytes) {
      return { dataUrl, approxBytes };
    }
  }

  return { dataUrl: best, approxBytes: Math.round((best.length * 3) / 4) };
}

export function approxDataUrlBytes(dataUrl: string): number {
  return Math.round((dataUrl.length * 3) / 4);
}

/** Re-compress embedded stills before network save/analyze. */
export async function prepareReferenceUrlsForCloud(
  urls: string[],
  targetBytes = 55_000,
  opts?: { force?: boolean }
): Promise<string[]> {
  const prepared: string[] = [];
  for (const url of urls) {
    if (!url.startsWith("data:image")) {
      prepared.push(url);
      continue;
    }
    if (!opts?.force && approxDataUrlBytes(url) <= targetBytes * 1.2) {
      prepared.push(url);
      continue;
    }
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const file = new File([blob], "reference.jpg", { type: blob.type || "image/jpeg" });
      const { dataUrl } = await compressReferenceImage(file, targetBytes);
      prepared.push(dataUrl);
    } catch {
      prepared.push(url);
    }
  }
  return prepared;
}

/** Fit all embedded stills into a total byte budget (save path — always recompress). */
export async function fitReferencePhotosForCloudSave(
  urls: string[],
  totalBudgetBytes = 500_000
): Promise<string[]> {
  const links = urls.filter((u) => !u.startsWith("data:image"));
  const photos = urls.filter((u) => u.startsWith("data:image"));
  if (photos.length === 0) return urls;

  const total = photos.reduce((s, u) => s + approxDataUrlBytes(u), 0);
  const perPhotoTarget = Math.min(
    55_000,
    Math.max(22_000, Math.floor(totalBudgetBytes / photos.length))
  );
  const force = total > totalBudgetBytes * 0.7 || photos.length > 4;
  const compressed = await prepareReferenceUrlsForCloud(photos, perPhotoTarget, { force });
  return [...links, ...compressed];
}
