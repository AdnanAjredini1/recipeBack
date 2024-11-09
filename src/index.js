import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { db } from "./storage/db.js";
import routes from "./routes/index.js";
import "./strategies/local-strategy.js";
// import './strategies/google-strategy.js'
import bcrypt from "bcrypt";
import { Server } from "socket.io";
import pgSession from "connect-pg-simple";

dotenv.config();

const PgSession = pgSession(session);

const server = express();
const io = new Server();

export { io };



server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(
  session({
    store: new PgSession({
      conString: "postgresql://recipesbackend_user:wr8IS4bpGtvgtRyQjYSpzRgX0V0mJyaR@dpg-csk7rlbtq21c73djgm40-a.frankfurt-postgres.render.com/recipesbackend",
      ssl: { rejectUnauthorized: false },
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,

    cookie: {
     httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 60 * 24,
    },
  })
);
server.use(passport.initialize());
server.use(passport.session());

server.use(
  cors({
    origin: "https://chefieebaa.vercel.app",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

db.connect((err) => {
  if (err) {
    console.error("Connection error", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

server.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    console.log("authenticated");
  } else {
    console.log("not authenticated");
  }
  res.send("welcome");
});

server.use(routes);
server.listen(3001, (req, res) => {
  console.log("Server is running at port 3001");
});

export default server;

//Hellooooo
