import { Router } from "express";
import { db } from "../storage/db.js";

const router = new Router();

router.get("/comments/:post_id", async (req, res) => {
    const { post_id } = req.params;

    try {
        const result = await db.query(
            "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC",
            [post_id]
        );

        res.status(200).json(result.rows); 
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Error fetching comments" });
    }
});

router.post("/comment", async (req, res) => {
    const { post_id, content } = req.body;
    const user_id = req.user.user_id;


 console.log(post_id, "====================user id ================");

    console.log(user_id, "====================user id ================");
    

    try {
        const result = await db.query(
            "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
            [post_id, user_id, content]
        );
        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Error adding comment" });
    }
});


export default router;