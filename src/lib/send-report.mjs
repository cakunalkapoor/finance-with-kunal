#!/usr/bin/env node
/**
 * Email a plain-text/markdown report via Gmail SMTP (dependency-free, uses curl).
 *
 * Credentials come from .env.local (gitignored):
 *   GMAIL_APP_PASSWORD   required — a Google "App Password" (needs 2FA enabled).
 *                        Create at https://myaccount.google.com/apppasswords
 *   REPORT_FROM          optional — sender Gmail (default kunalkapoor.jnj@gmail.com)
 *   REPORT_TO            optional — recipient   (default kapoorkunal@outlook.com)
 *
 * Usage:  node src/lib/send-report.mjs <body-file> "<subject>"
 * Exit 0 on send; non-zero (with a clear message) if creds are missing or curl fails
 * — callers should treat a non-zero exit as "email not delivered" and fall back to
 * the on-disk report rather than abort the whole run.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function loadEnv() {
  const envPath = path.join(PROJECT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const [, , bodyFile, subjectArg] = process.argv;
if (!bodyFile) {
  console.error("Usage: node src/lib/send-report.mjs <body-file> \"<subject>\"");
  process.exit(2);
}

const pass = process.env.GMAIL_APP_PASSWORD;
const from = process.env.REPORT_FROM || "kunalkapoor.jnj@gmail.com";
const to = process.env.REPORT_TO || "kapoorkunal@outlook.com";

if (!pass) {
  console.error("✗ GMAIL_APP_PASSWORD not set in .env.local — cannot send email.");
  console.error("  Create one at https://myaccount.google.com/apppasswords (2FA required),");
  console.error("  then add:  GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx   to .env.local");
  process.exit(1);
}

const body = fs.readFileSync(bodyFile, "utf-8");
const rawSubject = subjectArg || "Finance with Kunal — weekly refresh report";
// MIME-encode the subject if it contains non-ASCII (emoji etc.)
const subject = /[^\x00-\x7F]/.test(rawSubject)
  ? `=?UTF-8?B?${Buffer.from(rawSubject, "utf-8").toString("base64")}?=`
  : rawSubject;

const message = [
  `From: Finance with Kunal <${from}>`,
  `To: ${to}`,
  `Subject: ${subject}`,
  `Date: ${new Date().toUTCString()}`,
  "MIME-Version: 1.0",
  "Content-Type: text/plain; charset=UTF-8",
  "",
  body,
].join("\r\n");

const tmp = path.join(os.tmpdir(), `fwk-report-${Date.now()}.eml`);
fs.writeFileSync(tmp, message);

try {
  execFileSync(
    "curl",
    [
      "--silent", "--show-error", "--ssl-reqd",
      "--url", "smtps://smtp.gmail.com:465",
      "--user", `${from}:${pass}`,
      "--mail-from", from,
      "--mail-rcpt", to,
      "--upload-file", tmp,
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );
  console.log(`✓ report emailed to ${to} (subject: ${rawSubject})`);
} catch (e) {
  const detail = e.stderr ? e.stderr.toString().trim() : e.message;
  console.error(`✗ failed to send report via Gmail SMTP: ${detail}`);
  process.exit(1);
} finally {
  fs.rmSync(tmp, { force: true });
}
