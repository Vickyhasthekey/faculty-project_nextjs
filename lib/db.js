import mysql from "mysql2/promise";

const sslDisabled = process.env.MYSQL_SSL === "false";

export const connection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  ssl: sslDisabled ? undefined : { rejectUnauthorized: true },
});
