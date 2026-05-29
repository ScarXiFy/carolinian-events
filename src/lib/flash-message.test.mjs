import test from "node:test";
import assert from "node:assert/strict";

import { getEventFlashMessage } from "./flash-message.mjs";

test("getEventFlashMessage returns dashboard CRUD messages", () => {
  assert.deepEqual(getEventFlashMessage({ created: "1" }), {
    tone: "success",
    text: "Event created successfully.",
  });
  assert.deepEqual(getEventFlashMessage({ deleted: "1" }), {
    tone: "success",
    text: "Event deleted successfully.",
  });
  assert.deepEqual(getEventFlashMessage({ created: "preview" }), {
    tone: "info",
    text: "Preview mode. Connect MySQL to save changes.",
  });
});

test("getEventFlashMessage returns detail update messages", () => {
  assert.deepEqual(getEventFlashMessage({ updated: "1" }), {
    tone: "success",
    text: "Event updated successfully.",
  });
  assert.deepEqual(getEventFlashMessage({ updated: "preview" }), {
    tone: "info",
    text: "Preview mode. Connect MySQL to save changes.",
  });
});

test("getEventFlashMessage returns organizer request messages", () => {
  assert.deepEqual(getEventFlashMessage({ organizerRequest: "pending" }), {
    tone: "success",
    text: "Organizer access request submitted.",
  });
});

test("getEventFlashMessage ignores unknown query values", () => {
  assert.equal(getEventFlashMessage({ created: "nope" }), null);
  assert.equal(getEventFlashMessage({}), null);
});
