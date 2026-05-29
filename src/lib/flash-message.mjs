const PREVIEW_MESSAGE = "Preview mode. Connect MySQL to save changes.";

export function getEventFlashMessage(params = {}) {
  if (params.created === "1") {
    return {
      tone: "success",
      text: "Event created successfully.",
    };
  }

  if (params.updated === "1") {
    return {
      tone: "success",
      text: "Event updated successfully.",
    };
  }

  if (params.deleted === "1") {
    return {
      tone: "success",
      text: "Event deleted successfully.",
    };
  }

  if (params.organizerRequest === "pending") {
    return {
      tone: "success",
      text: "Organizer access request submitted.",
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
    };
  }

  return null;
}
