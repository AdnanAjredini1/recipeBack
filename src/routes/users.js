import { Router } from "express";
import { db } from "../storage/db.js";

const router = new Router();

router.post("/api/users", async (req, res) => {
  const { username, email, password, image } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO users (username, email, password, user_image) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, password, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
