import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,

  // server-side code execution: "judge0" (default, public CE instance) or "piston"
  CODE_RUNNER: process.env.CODE_RUNNER || "judge0",
  JUDGE0_URL: process.env.JUDGE0_URL || "https://ce.judge0.com",
  JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
  JUDGE0_API_HOST: process.env.JUDGE0_API_HOST, // only for RapidAPI-hosted Judge0
  PISTON_URL: process.env.PISTON_URL || "https://emkc.org/api/v2/piston",
  PISTON_API_KEY: process.env.PISTON_API_KEY,

  // feedback emails (any SMTP provider); disabled when SMTP_HOST is empty
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
};
