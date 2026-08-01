import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import next from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import chatRouter from "./routes/chats.js";
import messagesRouter from "./routes/messages.js";
import userRouter from "./routes/users.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let nextHandler;

const PORT = Number(process.env.PORT || 5000);
const CONNECTION_URL = process.env.CONNECTION_URL;
const SERVE_NEXT = process.env.SERVE_NEXT === "true";
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!CONNECTION_URL) {
  throw new Error("CONNECTION_URL is required");
}

// CORS must be registered BEFORE the /api/* catch-all so that
// preflight OPTIONS requests and all API responses include the correct
// Access-Control-Allow-Origin header even when Next.js handles the route.
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.all("/api/*", (req, res, nextMiddleware) => {
  if (!nextHandler) {
    nextMiddleware();
    return;
  }

  nextHandler(req, res);
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static("uploads"));
app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/messages", messagesRouter);

let server;

const startServer = async () => {
  try {
    if (SERVE_NEXT) {
      const nextApp = next({
        dev: process.env.NODE_ENV !== "production",
        dir: path.resolve(__dirname, "../web"),
      });
      nextHandler = nextApp.getRequestHandler();
      await nextApp.prepare();
    }

    await mongoose.connect(CONNECTION_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 20,
      minPoolSize: 2,
      maxIdleTimeMS: 300000,
    });

    if (nextHandler) {
      app.all("*", (req, res) => nextHandler(req, res));
    }

    server = app.listen(PORT, () => {
      console.log("Server is listening on port", PORT);
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: corsOrigins,
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      socket.on("setup", (userData) => {
        if (!userData?._id) {
          return;
        }
        socket.join(userData._id);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        socket.join(room);
      });

      socket.on("typing", (room) => socket.in(room).emit("typing"));
      socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

      socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;
        if (!chat?.users) {
          return;
        }

        chat.users.forEach((user) => {
          if (user._id === newMessageReceived.sender._id) {
            return;
          }
          socket.in(user._id).emit("message received", newMessageReceived);
        });
      });
    });
  } catch (err) {
    console.log("Error connecting to mongo/server", err);
  }
};

const shutdown = async () => {
  try {
    await mongoose.connection.close();
    if (server) {
      server.close(() => process.exit(0));
      return;
    }
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
