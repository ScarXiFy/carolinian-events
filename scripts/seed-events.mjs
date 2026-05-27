import { seedMysqlEvents } from "../src/lib/seed-events.mjs";

const databaseUrl =
  process.env.DATABASE_URL ?? "mysql://root@localhost:3306/carolinian_events_db";

try {
  const result = await seedMysqlEvents(databaseUrl);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
