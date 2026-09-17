export function sanitizeFileNamePart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/['`]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.length > 0 ? normalized : "hisobot";
}

export function saveBlobAsFile(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function buildMapUrl(latitude: number, longitude: number): string {
  return `https://yandex.com/maps/?pt=${longitude},${latitude}&z=16&l=map`;
}
