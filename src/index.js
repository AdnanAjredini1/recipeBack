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
const httpServer = http.createServer(server);
const io = new Server(httpServer, {
  cors: {
    origin: "https://chefieebaa.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
export { io };
io.on("connect", (socket) => {
  console.log("a user connected ==================================================================================================================");
});

// io.use((socket, next) => {
//   sessionMiddleware(socket.request, {}, next);
// });


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("registerUser", (userId) => {
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    socket.join(`user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
server.use(express.static("public"));
server.set('trust proxy', 1)

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    name:"GOKU",
    cookie: {
      maxAge: 1000 * 60 * 60 * 60 * 244,
      secure: true, // Ensures cookies are only sent over HTTPS
    //  httpOnly: true,   // Prevents client-side access
    //   sameSite: 'None',
    
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

httpServer.listen(3001, (req, res) => {
  console.log("Server is running at port 3001");
});


// hello