import { randomUUID } from "node:crypto";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const EVENT_IMAGE_BUCKET = "event-images";
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
    throw new Error("Event image must be 5 MB or smaller.");
  }

  return file;
}

export function getSafeEventImageName(originalName, idFactory = randomUUID) {
  const originalExtension = path.extname(originalName);
  const extension = originalExtension.toLowerCase();
  const baseName = path
    .basename(originalName, originalExtension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${idFactory()}-${baseName || "event-image"}${extension}`;
}

export async function saveEventImageFile(file, { cwd = process.cwd() } = {}) {
  void cwd;
  throw new Error("Local event image storage has been replaced by Supabase Storage.");
}

export function validateEventImageUploadMetadata({ name, type, size }) {
  return validateEventImageFile({ name, type, size });
}

export function validateStoredEventImageUrl(value, { env = process.env } = {}) {
  const imageUrl = String(value ?? "").trim();
  if (!imageUrl) return "";

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Supabase URL is not configured.");
  }

  const parsedImageUrl = new URL(imageUrl);
  const parsedSupabaseUrl = new URL(supabaseUrl);

  if (parsedImageUrl.hostname !== parsedSupabaseUrl.hostname) {
    throw new Error("Event image must come from the configured Supabase project.");
  }

  if (!parsedImageUrl.pathname.includes(`/storage/v1/object/public/${getEventImageBucket(env)}/`)) {
    throw new Error("Event image must come from the event image bucket.");
  }

  return imageUrl;
}

export function validateStoredEventImageUrls(values, options = {}) {
  if (!Array.isArray(values)) {
    throw new Error("Event images must be a list.");
  }

  return [...new Set(values.map((value) => validateStoredEventImageUrl(value, options)).filter(Boolean))];
}

export function getEventImageBucket(env = process.env) {
  return env.SUPABASE_STORAGE_BUCKET || EVENT_IMAGE_BUCKET;
}

export function createSupabaseEventImageUpload({
  createClient: clientFactory = createClient,
  idFactory = randomUUID,
} = {}) {
  return async function createUpload(originalName, { env = process.env } = {}) {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase Storage is not configured.");
    }

    const bucket = getEventImageBucket(env);
    const safeName = getSafeEventImageName(originalName, idFactory);
    const filePath = `events/${safeName}`;
    const supabase = clientFactory(supabaseUrl, supabaseKey);
    const storage = supabase.storage.from(bucket);
    const { data, error } = await storage.createSignedUploadUrl(filePath);

    if (error) {
      throw new Error(error.message || "Unable to create upload URL.");
    }

    const publicUrlResult = storage.getPublicUrl(filePath);

    return {
      bucket,
      path: filePath,
      publicUrl: publicUrlResult.data.publicUrl,
      signedUrl: data.signedUrl,
      token: data.token,
    };
  };
}

export const createEventImageUpload = createSupabaseEventImageUpload();

export async function createEventImageUploadForFile(file, options = {}) {
  const validFile = validateEventImageUploadMetadata(file);
  return createEventImageUpload(validFile.name, options);
}
