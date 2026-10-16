import { ENV } from "./env.js";

// Imported first in server.js. Some libraries (the Stream clients) crash with an unreadable stack
// trace at import time when a key is missing, so we print which variables are missing instead.

const REQUIRED = [
  "DB_URL",
  "CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "STREAM_API_KEY",
  "STREAM_API_SECRET",
];

// the server starts without these, but a feature stops working
const RECOMMENDED = {
  INNGEST_EVENT_KEY: "user sync with Clerk (Inngest)",
  INNGEST_SIGNING_KEY: "user sync with Clerk (Inngest)",
  CLIENT_URL: "CORS for a separate frontend origin",
};

const missing = REQUIRED.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(
    [
      "",
      "Cannot start: required environment variables are missing:",
      ...missing.map((name) => `  - ${name}`),
      "",
      "Set them as Fly secrets (Fly dashboard > Secrets, or `fly secrets set NAME=value`),",
      "or in backend/.env for local development. Values are never printed.",
      "",
    ].join("\n")
  );
  process.exit(1);
}

if (ENV.NODE_ENV === "production") {
  Object.entries(RECOMMENDED)
    .filter(([name]) => !process.env[name])
    .forEach(([name, usedFor]) => console.warn(`Warning: ${name} is not set (${usedFor}).`));
}
