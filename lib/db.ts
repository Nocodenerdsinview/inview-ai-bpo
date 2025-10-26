import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";
import path from "path";

const sqlite = new Database(path.join(process.cwd(), "inview.db"));
export const db = drizzle(sqlite, { schema });

export { schema };

