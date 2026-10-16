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

  // running code: "judge0" (default, the public CE instance) or "piston"
  CODE_RUNNER: process.env.CODE_RUNNER || "judge0",
  JUDGE0_URL: process.env.JUDGE0_URL || "https://ce.judge0.com",
  JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
  JUDGE0_API_HOST: process.env.JUDGE0_API_HOST, // only needed for RapidAPI-hosted Judge0
  PISTON_URL: process.env.PISTON_URL || "https://emkc.org/api/v2/piston",
  PISTON_API_KEY: process.env.PISTON_API_KEY,

  // live call translation: "mymemory" (default, free), "deepl" or "google" (those two need an API key)
  TRANSLATE_PROVIDER: process.env.TRANSLATE_PROVIDER || "mymemory",
  MYMEMORY_EMAIL: process.env.MYMEMORY_EMAIL, // optional: gives you a bigger free daily quota
  DEEPL_API_KEY: process.env.DEEPL_API_KEY,
  GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY,

  // feedback emails (any SMTP provider); switched off while SMTP_HOST is empty
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
};
