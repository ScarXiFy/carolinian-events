import { runMysqlCrudSmoke } from "../src/lib/crud-smoke.mjs";

const databaseUrl =
  process.env.DATABASE_URL ?? "mysql://root@localhost:3306/carolinian_events_db";

try {
  const result = await runMysqlCrudSmoke(databaseUrl);
  console.log(JSON.stringify(result, null, 2));

  if (!result.createdFound || !result.updatedFound || !result.deleted || result.stillExists) {
    process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
