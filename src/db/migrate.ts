import "dotenv/config";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./client";

await migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("Database migrations applied.");
