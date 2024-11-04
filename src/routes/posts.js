import { Router } from "express";
import { db } from "../storage/db.js";
import { uploadFile } from "../storage/firebase.js";
import { upload } from "../storage/multer.js";

const router = new Router();

router.get('/posts/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
 
    const result = await db.query(
      'SELECT * FROM posts WHERE user_id = $1',
      [user_id]
    );

  
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get("/api/posts", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching data (posts):", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/posts", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts ORDER BY created_at ASC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching data (posts):", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/posts/:id", async (req, res) => {
  const { id } = req.params.id;
  try {
    const result = await db.query("SELECT * FROM posts WHERE post_id = $1, ", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/api/posts/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, cookingTime, category } = req.body;
  const file = req.file;

  try {
    let downloadURL = null;
    if (file) {
      downloadURL = await uploadFile(file);
    }
    const result = await db.query(
      "UPDATE posts SET title = $1, content = $2, cooking_time = $3 , category = $4, post_image = COALESCE($5, post_image) WHERE post_id = $6 RETURNING * ",
      [title, description, cookingTime, category, downloadURL, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res
      .status(200)
      .json({ message: "Post updated successfully", post: result.rows[0] });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("api/posts/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, cookingTime, category } = req.body;
  const file = req.file;

  try {
    let downloadURL = null;
    if (file) {
      downloadURL = await uploadFile(file);
    }

    const result = await db.query(
      "UPDATE posts SET title = COALESCE($1, title), content= COALESCE($2, content), cooking_time = COALESCE($3, cooking_time), category = COALESCE($4, category) , post_image = COALESCE($5, post_image) WHERE post_id = $6 RETURNING *",
      [title, description, cookingTime, downloadURL, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/api/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM recipes WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res
      .status(200)
      .json({ message: "Recipe deleted successfully", recipe: result.rows[0] });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/api/posts", upload.single("image"), async (req, res) => {
  const { title, category, cookingTime, description } = req.body;
  const file = req.file;
  const user_id = req.user.user_id
  console.log("the logged in user", req.user);
  console.log(req.isAuthenticated());


  console.log(req.file, title, category, cookingTime, description);

  if (!file) {
    return res.status(404).json({ error: "No image file provided." });
  }

  try {
    const downloadURL = await uploadFile(file);

    const result = await db.query(
      "INSERT INTO posts (title, content,post_image, cooking_time, category,user_id) VALUES ($1, $2, $3, $4, $5,  $6) RETURNING *",
      [
        title,
        description,
        downloadURL,
        cookingTime,
        category,
        user_id,
      ]
    );
    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    console.error("Error inserting post:", err);
    res.status(500).json({ error: "Failed to create post." });
  }
});

export default router;
