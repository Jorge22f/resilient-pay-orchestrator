import knex from "knex";
// @ts-expect-error- Knex dialect types mismatch with native driver layout
import config from "../../knexfile.js";

const environment = (process.env.NODE_ENV ||
  "development") as keyof typeof config;

const db = knex({
  ...config[environment],
  pool: { min: 2, max: 20 },
});

db.raw("SELECT 1")
  .then(() => {
    console.log("✅ PostgreSQL connected successfully");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection failed:", err);
  });

export default db;
