const PREVIEW_MESSAGE = "Preview mode. Connect a database to save changes.";

export function getEventFlashMessage(params = {}) {
  if (params.created === "1") {
    return {
      tone: "success",
      text: "Event created successfully.",
      showInline: false,
    };
  }

  if (params.updated === "1") {
    return {
      tone: "success",
      text: "Event updated successfully.",
      showInline: false,
    };
  }

  if (params.deleted === "1") {
    return {
      tone: "success",
      text: "Event deleted successfully.",
      showInline: false,
    };
  }

  if (params.organizerRequest === "pending") {
    return {
      tone: "success",
      text: "Organizer access request submitted.",
      showInline: false,
    };
  }

  if (
    params.created === "preview" ||
    params.updated === "preview" ||
    params.deleted === "preview"
  ) {
    return {
      tone: "info",
      text: PREVIEW_MESSAGE,
      showInline: false,
    };
  }

  return null;
}
