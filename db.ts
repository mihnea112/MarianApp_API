import mysql from "mysql2";
import * as dotenv from "dotenv";

dotenv.config();

const pool = getPool();
function getPool() {
    console.log("Creating pool");
    
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}
class db {
  static async execute(sql: string) {
    return await pool.promise().execute(sql);
  }
}

export { db };
