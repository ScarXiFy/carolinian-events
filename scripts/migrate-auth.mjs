import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { getDatabaseConfig } from "../src/lib/database-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  const config = getDatabaseConfig();

  if (!config.isConfigured) {
    throw new Error("DATABASE_URL is required to run auth and participant migrations.");
  }

  console.log("Connecting to configured MySQL database.");
  const connection = await mysql.createConnection(config.url);

  try {
    const sqlFile = path.join(__dirname, "../database/migrations/01_auth_participants.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Split statements by semicolon
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      try {
        await connection.query(statement);
      } catch (error) {
        if (error?.code === "ER_DUP_FIELDNAME") {
          console.log("Skipping existing column.");
          continue;
        }

        throw error;
      }
    }
    console.log("Migration successful.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
