import { io, server, app } from "./server.js";
import cors from "cors";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import express from "express";
import recordRouter from "./routes/record.js";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Correct capitalization
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/auth", authRouter);
app.use("/api/records", recordRouter);

server.listen(4000, () => {
  console.log("Server running on port 4000");
});
