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
import http, { createServer } from "http";
dotenv.config();

const server = express();
// const httpServer = http.createServer(server);
const io = new Server();
//   cors: {
//     origin: "https://chefieebaa.vercel.app",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });
export { io };

const store = new session.MemoryStore();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
 
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
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

//Hello