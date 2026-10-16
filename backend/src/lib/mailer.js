import nodemailer from "nodemailer";
import { ENV } from "./env.js";

let transporter;

// a host with a username but no password would only fail at send time, so we treat that as "disabled"
export const isMailConfigured = () => Boolean(ENV.SMTP_HOST && (!ENV.SMTP_USER || ENV.SMTP_PASS));

function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_SECURE, // true for port 465, false for 587 (STARTTLS)
    auth: ENV.SMTP_USER ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS } : undefined,
  });

  return transporter;
}

/** @throws when SMTP is not configured or the provider rejects the message */
export async function sendMail({ to, cc, subject, text, attachments }) {
  if (!isMailConfigured()) throw new Error("Email is not configured on the server");

  return getTransporter().sendMail({
    from: ENV.MAIL_FROM || ENV.SMTP_USER,
    to,
    cc,
    subject,
    text,
    attachments,
  });
}
