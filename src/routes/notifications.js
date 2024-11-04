import { Router } from "express";
import { db } from "../storage/db.js";
import {io} from '../index.js'

const router = new Router();


router.post("/notification", async (req, res) => {
    const { userId, message, type, postId } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO notifications (user_id, message, type, post_id, read) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [userId, message, type, postId, false]
        );
        io.to(`user_${userId}`).emit("newNotification", result.rows[0]);
        console.log(result.rows[0], "new notificationnnnnnnnnnnnnnnnnnnnnnnnn");
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ error: "Error creating notification" });
    }
});

router.get("/notification/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query(
            `SELECT n.* 
             FROM notifications n
             JOIN posts p ON n.post_id = p.post_id
             WHERE p.user_id = $1
             ORDER BY n.created_at DESC `,
            [userId]
        );
        
        res.status(200).json(result.rows);
        // io.to(`user_${userId}`).emit("newNotification", result.rows[0]);

        console.log(result, "rsult, from notifiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
        
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Error fetching notifications" });
    }
});




router.put("/markAsRead", async (req, res) => {
    const  userId = req.user.user_id;
    try {
      
        const result = await db.query(
            `UPDATE notifications
             SET read = true
             WHERE post_id IN (
                 SELECT post_id FROM posts WHERE user_id = $1
             )`,
            [userId]
        );

     
        if (result.rowCount > 0) {
            io.to(`user_${userId}`).emit("notificationsMarkedAsRead");
            res.status(200).json({ message: "Notifications marked as read." });
        } else {
            res.status(404).json({ message: "No notifications found to mark as read." });
        }
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ error: "Error marking notifications as read" });
    }
});


export default router;