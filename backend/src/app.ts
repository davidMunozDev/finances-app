import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";

import { errorMiddleware } from "./middleware/error.middleware";
import { validateBody } from "./middleware/validate-body.middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(validateBody);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
});

app.use("/auth", authRoutes);

app.use(errorMiddleware);
