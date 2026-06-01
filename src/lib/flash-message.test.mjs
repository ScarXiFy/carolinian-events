import test from "node:test";
import assert from "node:assert/strict";

import { getEventFlashMessage } from "./flash-message.mjs";

test("getEventFlashMessage returns dashboard CRUD messages", () => {
  assert.deepEqual(getEventFlashMessage({ created: "1" }), {
    tone: "success",
    text: "Event created successfully.",
    showInline: false,
  });
  assert.deepEqual(getEventFlashMessage({ deleted: "1" }), {
    tone: "success",
    text: "Event deleted successfully.",
    showInline: false,
  });
  assert.deepEqual(getEventFlashMessage({ created: "preview" }), {
    tone: "info",
    text: "Preview mode. Connect a database to save changes.",
    showInline: false,
  });
});

test("getEventFlashMessage returns detail update messages", () => {
  assert.deepEqual(getEventFlashMessage({ updated: "1" }), {
    tone: "success",
    text: "Event updated successfully.",
    showInline: false,
  });
  assert.deepEqual(getEventFlashMessage({ updated: "preview" }), {
    tone: "info",
    text: "Preview mode. Connect a database to save changes.",
    showInline: false,
  });
});

test("getEventFlashMessage returns organizer request messages", () => {
  assert.deepEqual(getEventFlashMessage({ organizerRequest: "pending" }), {
    tone: "success",
    text: "Organizer access request submitted.",
    showInline: false,
  });
});

test("getEventFlashMessage ignores unknown query values", () => {
  assert.equal(getEventFlashMessage({ created: "nope" }), null);
  assert.equal(getEventFlashMessage({}), null);
});
