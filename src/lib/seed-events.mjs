import { sampleEvents } from "./events.mjs";
import { readMysqlEvents, writeMysqlEvents } from "./mysql-events.mjs";

export async function seedMysqlEvents(
  url,
  {
    events = sampleEvents,
    readEvents = readMysqlEvents,
    writeEvents = writeMysqlEvents,
  } = {},
) {
  const existingEvents = await readEvents(url);

  if (existingEvents.length > 0) {
    return {
      inserted: 0,
      skipped: true,
      existing: existingEvents.length,
    };
  }

  for (const event of events) {
    await writeEvents.createEvent(url, event);
  }

  return {
    inserted: events.length,
    skipped: false,
    existing: 0,
  };
}
