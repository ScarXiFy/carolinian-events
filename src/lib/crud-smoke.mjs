import { readMysqlEvents, writeMysqlEvents } from "./mysql-events.mjs";

const createInput = {
  eventName: "Codex CRUD Smoke Test",
  organizer: "Codex",
  description: "Temporary row created by the CRUD smoke test.",
  eventDate: "2026-08-01",
  eventTime: "10:00",
  location: "NCR Lab",
  category: "Academic",
  status: "Upcoming",
};

const updateInput = {
  ...createInput,
  eventName: "Codex CRUD Smoke Test Updated",
  description: "Temporary row updated by the CRUD smoke test.",
};

export async function runMysqlCrudSmoke(
  url,
  {
    readEvents = readMysqlEvents,
    writeEvents = writeMysqlEvents,
  } = {},
) {
  const created = await writeEvents.createEvent(url, createInput);
  const rowsAfterCreate = await readEvents(url);
  const createdRow = rowsAfterCreate.find((event) => event.id === created.id);

  await writeEvents.updateEvent(url, created.id, updateInput);
  const rowsAfterUpdate = await readEvents(url);
  const updatedRow = rowsAfterUpdate.find(
    (event) =>
      event.id === created.id &&
      event.event_name === updateInput.eventName &&
      event.description === updateInput.description,
  );

  const deleted = await writeEvents.deleteEvent(url, created.id);
  const rowsAfterDelete = await readEvents(url);
  const stillExists = rowsAfterDelete.some((event) => event.id === created.id);

  return {
    createdId: created.id,
    createdFound: Boolean(createdRow),
    updatedFound: Boolean(updatedRow),
    deleted: deleted.affectedRows === 1,
    stillExists,
  };
}
