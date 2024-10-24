import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import multer from "multer";
import { initializeApp } from "firebase/app";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,

  authDomain: process.env.AUTH_DOMAIN,

  projectId: process.env.PROJECT_ID,

  storageBucket: process.env.STORAGE_BUCKET,

  messagingSenderId: process.env.MESSAGING_SENDER_ID,

  appId: process.env.APP_ID,
};

const app = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(app);

const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(cors());
const saltRounds = 10;

server.use(
  session({
    secret: "ERENNNN",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 60 * 244,
    },
  })
);

server.use(passport.initialize());
server.use(passport.session());

const upload = multer({ storage: multer.memoryStorage() });



const db = new pg.Client({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

db.connect();

db.query("SELECT * FROM  users", (err, res) => {
  if (err) {
    console.error("Connection error", err.stack);
  } else {
    console.log("Connected to the database");
  }
});



server.get("/",  async (req, res) => {
  res.send(req.user)
});

server.post("/api/users", async (req, res) => {
  const { username, email, password, image } = req.body;
  try {
    console.log("----------------------------", username, email, password);
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

server.get("/api/posts", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching data (posts):", error);
    res.status(500).json({ message: "Server error" });
  }
});

server.get("/api/recipes/:id", async (req, res) => {
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

server.put("/api/posts/:id", upload.single("image"), async (req, res) => {
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

server.patch("api/posts/:id", upload.single("image"), async (req, res) => {
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

server.delete("/api/posts/:id", async (req, res) => {
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

server.post("/api/posts", upload.single("image"), async (req, res) => {
  const { title, category, cookingTime, description } = req.body;
  const file = req.file;

  console.log(
    req.file,
    "req file ----------------------------------------------------"
  );

  if (!file) {
    return res.status(404).json({ error: "No image file provided." });
  }

  try {
    const downloadURL = await uploadFile(file);

    const result = await db.query(
      "INSERT INTO posts (title, content,post_image, cooking_time, category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, downloadURL, cookingTime, category]
    );
    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    console.error("Error inserting post:", err);
    res.status(500).json({ error: "Failed to create post." });
  }
});

server.post("/api/register", upload.single("image"), async (req, res) => {
  const { username, email, password } = req.body;
  const file = req.file;
  console.log(file);

  console.log(email, "EMAIL");
  console.log(password, "PASSWORD");
  console.log(username, "USERNAME");

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.status(400).json({ message: "Email already exists." });
      return;
    }

    const hash = await bcrypt.hash(password, saltRounds);

    let imageURL = null;
    if (file) {
      imageURL = await uploadFile(file);
    }

    const result = await db.query(
      "INSERT INTO users (username, email, password, user_image) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, hash, imageURL]
    );
    console.log(result);

    // const user = result;
    // req.login(user, (err) => {
    //   console.log(err);

    // });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        user_image: result.rows[0].user_image || null,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

server.post(
  "/api/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

passport.use(
  "local",
  new Strategy({usernameField:"email"},async function verify(email, password, cb) {
    console.log(email, password);
    try {
      const CheckResult = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (CheckResult.rows.length > 0) {
        const user = CheckResult.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(
          password,
          storedHashedPassword,
          async function (err, result) {
            if (err) {
              return cb(err);
            } else {
              if (result) {
                return cb(null, user);
              } else {
                return cb(null, false, { message: "Incorrect password" });
              }
            }
          }
        );
      } else {
        return cb(null, false, { message: "User not found" });
      }
    } catch (err) {
      return cb(err);
    }
  })
);


passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

server.listen(3001, (req, res) => {
  console.log("Server is running at port 3001");
});

const uploadFile = async (file) => {
  const storageRef = ref(firebaseStorage, `uploads/${file.originalname}`);

  try {
    const uploadResult = await uploadBytes(storageRef, file.buffer);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (err) {
    console.error("Error uploading file to Firebase Storage:", err);
    throw err;
  }
};
