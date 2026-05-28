import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export function validateEventImageFile(file) {
  if (!file || !file.name || file.size <= 0) {
    throw new Error("Event image is required.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Event image must be a JPG, PNG, WebP, or GIF file.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Event image must be 2 MB or smaller.");
  }

  return file;
}

export function getSafeEventImageName(originalName, idFactory = randomUUID) {
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${idFactory()}-${baseName || "event-image"}${extension}`;
}

export async function saveEventImageFile(file, { cwd = process.cwd() } = {}) {
  const validFile = validateEventImageFile(file);
  const safeName = getSafeEventImageName(validFile.name);
  const uploadDir = path.join(cwd, "public", "uploads", "events");
  const uploadPath = path.join(uploadDir, safeName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(uploadPath, Buffer.from(await validFile.arrayBuffer()));

  return `/uploads/events/${safeName}`;
}
