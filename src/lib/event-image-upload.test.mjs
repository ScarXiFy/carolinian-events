import test from "node:test";
import assert from "node:assert/strict";

import { getSafeEventImageName, validateEventImageFile } from "./event-image-upload.mjs";

test("validateEventImageFile accepts safe image uploads", () => {
  const file = new File(["fake image"], "Poster Night.PNG", { type: "image/png" });

  assert.equal(validateEventImageFile(file), file);
});

test("validateEventImageFile rejects unsupported image types", () => {
  const file = new File(["fake pdf"], "poster.pdf", { type: "application/pdf" });

  assert.throws(() => validateEventImageFile(file), /Event image must be a JPG, PNG, WebP, or GIF file/);
});

test("getSafeEventImageName keeps extension and strips unsafe characters", () => {
  assert.match(
    getSafeEventImageName("My USC Poster!.png", () => "abc123"),
    /^abc123-my-usc-poster\.png$/,
  );
});
