import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { db } from "./storage/db.js";
import routes from "./routes/index.js";
import './strategies/local-strategy.js'

dotenv.config();

const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
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



server.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
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
  res.send('welcome');
});

server.use(routes);

server.listen(3001, (req, res) => {
  console.log("Server is running at port 3001");
});


