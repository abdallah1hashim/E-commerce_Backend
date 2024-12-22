import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "gg",
  password: "pass",
  port: 5432,
});

export default pool;
