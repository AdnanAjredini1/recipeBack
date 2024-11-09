import { Router } from "express";
import passport from "passport";
import { db } from "../storage/db.js";
import { upload } from "../storage/multer.js";
import bcrypt from 'bcrypt'
import { uploadFile } from "../storage/firebase.js";



const router = new Router();
const saltRounds = 10;

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);



router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err, "logout error");
      return res.status(500).json({ success: true, message: "Logout failed" });
    }
    res.status(200).json({ success: false, message: "Logged out successfully" });
  });
});

router.get("/auth/status", (req, res) => {
  console.log('====================================');
  console.log(req.headers.cookie);
  console.log('====================================');
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

router.post("/api/register", upload.single("image"), async (req, res) => {
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

    const user = result.rows[0];
    req.login(user, (err) => {
      if (err) {
        console.log("error happened while logging in the user", err);
      } else {
        console.log("user while login", user);
      }
    });

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

router.post("/api/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { successRedirect: "/", failureRedirect: "/", failureFlash: true },
    (err, user) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "An error occurred", error: err });
      }
      if (!user) {
        return res
          .status(401)
          .json({ message: "Incorrect username or password" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res
            .status(500)
            .json({ message: "Login error", error: loginErr });
        }
        res.status(200).json({ message: "Login successful", user });
        return next(req, res);
      });
    }
  )(req, res, next);
});

export default router;
