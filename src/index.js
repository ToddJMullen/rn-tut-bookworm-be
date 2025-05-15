import express from "express";
import cors from "cors";
import "dotenv/config";
import job from './lib/cron.js';

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";

job.start();
const app = express();
const PORT = process.env.PORT || 3000;

// setup json parsing of request data
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`server/running/:${PORT}`);
  connectDB();
});
