import { Router } from "express";
import { db } from "../storage/db.js";

const router = new Router();



router.get("/likes/user/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await db.query(
            `SELECT p.*
             FROM posts p
             JOIN likes l ON p.post_id = l.post_id
             WHERE l.user_id = $1`,
            [user_id]
        );

        const likedPosts = result.rows;

        res.status(200).json(likedPosts);
    } catch (error) {
        console.error("Error fetching liked posts:", error);
        res.status(500).json({ error: "Error fetching liked posts" });
    }
});


router.get("/like/:post_id", async (req, res) => {
    const { post_id } = req.params;
    const user_id = req.user.user_id;
    console.log('this endpoint is being called')
  
    try {
      const result = await db.query(
        "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
        [post_id, user_id]
      );
      const isLiked = result.rows.length > 0;
      console.log(isLiked, "isLiked ==================================");
      
      res.status(200).json({ isLiked });
    } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ error: "Error checking like status" });
    }
  });

router.post("/like", async (req, res) => {
  const { post_id } = req.body;
  const user_id = req.user.user_id;
  console.log(
    req.user.user_id,
    "req.user.user_id from likesssss =============================================== ======================== =========="
  );

  try {
    const result = await db.query(
      "INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING *",
      [post_id, user_id]
    );
    const isLiked = result.rows.length > 0;
    res.status(200).json({ isLiked });
  } catch (error) {
    console.error("Error liking recipe:", error);
    res.status(500).json({ error: "Error liking recipe" });
  }
});



router.delete("/like", async (req, res) => {
    const { post_id } = req.body;
    const user_id = req.user.user_id;

    try {
        const result = await db.query(
            "DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING *",
            [post_id, user_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Like not found" });
        }

        res.status(200).json({ message: "Like removed successfully" });
    } catch (error) {
        console.error("Error removing like:", error);
        res.status(500).json({ error: "Error removing like" });
    }
});



export default router;