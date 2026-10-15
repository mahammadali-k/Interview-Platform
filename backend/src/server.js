import express from "express";
import path from "path";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import questionRoutes from "./routes/questionRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import translateRoutes from "./routes/translateRoutes.js";

const app = express();

const __dirname = path.resolve();

// behind a hosting proxy (Render, Railway...) the client IP comes from X-Forwarded-For
if (ENV.NODE_ENV === "production") app.set("trust proxy", 1);
app.disable("x-powered-by");

// middleware
// the CSP is off because this server also serves the built single-page app (Clerk, Stream and
// Monaco load scripts from several origins); the other helmet protections stay on
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(express.json());
// credentials:true meaning?? => server allows a browser to include cookies on request
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

// a generous per-IP ceiling for the whole API; code runs and translations have their own, tighter limits
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    limit: 600,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: (req) => req.path.startsWith("/inngest"),
    message: { message: "Too many requests. Please slow down." },
  })
);

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/translate", translateRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  const dist = path.join(__dirname, "../frontend/dist");

  // hashed build files never change, so browsers may keep them for a year
  app.use("/assets", express.static(path.join(dist, "assets"), { immutable: true, maxAge: "1y", fallthrough: false }));
  app.use(express.static(dist, { index: false }));

  app.get("/{*any}", (req, res) => {
    // index.html must always be re-checked so a new deploy is picked up
    res.set("Cache-Control", "no-cache").sendFile(path.join(dist, "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
