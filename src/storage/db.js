import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const db = new pg.Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE,
    password: process.env.DATABASE_PASSWORD,
    port: 5432,
    ssl: {
      rejectUnauthorized: false  
    },
  });