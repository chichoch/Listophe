import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";

import cors from "cors";
import express from "express";
import { Server } from "socket.io";

import { ensureSchema } from "./db/index.js";
import listsRouter from "./routes/lists.js";
import { registerSocketHandlers } from "./socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true;

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

ensureSchema();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/lists", listsRouter);

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

registerSocketHandlers(io);

const frontendDist = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api|\/socket\.io).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const port = Number(process.env.PORT ?? 3000);
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Listophe backend listening on http://0.0.0.0:${port}`);
});
