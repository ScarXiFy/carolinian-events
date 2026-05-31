import test from "node:test";
import assert from "node:assert/strict";

import {
  createSupabaseEventImageUpload,
  getSafeEventImageName,
  validateEventImageFile,
} from "./event-image-upload.mjs";

test("validateEventImageFile accepts safe image uploads", () => {
  const file = new File(["fake image"], "Poster Night.PNG", { type: "image/png" });

  assert.equal(validateEventImageFile(file), file);
});

test("validateEventImageFile rejects unsupported image types", () => {
  const file = new File(["fake pdf"], "poster.pdf", { type: "application/pdf" });

  assert.throws(() => validateEventImageFile(file), /Event image must be a JPG, PNG, WebP, or GIF file/);
});

test("validateEventImageFile accepts images up to 5 MB", () => {
  const file = new File([new Uint8Array(5 * 1024 * 1024)], "poster.jpg", {
    type: "image/jpeg",
  });

  assert.equal(validateEventImageFile(file), file);
});

test("validateEventImageFile rejects images larger than 5 MB", () => {
  const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "poster.jpg", {
    type: "image/jpeg",
  });

  assert.throws(() => validateEventImageFile(file), /Event image must be 5 MB or smaller/);
});

test("getSafeEventImageName keeps extension and strips unsafe characters", () => {
  assert.match(
    getSafeEventImageName("My USC Poster!.png", () => "abc123"),
    /^abc123-my-usc-poster\.png$/,
  );
});

test("createSupabaseEventImageUpload returns signed upload details and public URL", async () => {
  const calls = [];
  const upload = createSupabaseEventImageUpload({
    createClient: (url, key) => {
      calls.push(["client", url, key]);
      return {
        storage: {
          from(bucket) {
            calls.push(["bucket", bucket]);
            return {
              createSignedUploadUrl: async (path) => {
                calls.push(["signed", path]);
                return { data: { signedUrl: "https://upload.example", token: "token_1" } };
              },
              getPublicUrl: (path) => {
                calls.push(["public", path]);
                return { data: { publicUrl: `https://cdn.example/${path}` } };
              },
            };
          },
        },
      };
    },
    idFactory: () => "abc123",
  });

  const details = await upload("Poster Night.PNG", {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable",
      SUPABASE_STORAGE_BUCKET: "event-images",
    },
  });

  assert.deepEqual(details, {
    bucket: "event-images",
    path: "events/abc123-poster-night.png",
    publicUrl: "https://cdn.example/events/abc123-poster-night.png",
    signedUrl: "https://upload.example",
    token: "token_1",
  });
  assert.deepEqual(calls[0], ["client", "https://project.supabase.co", "sb_publishable"]);
});
