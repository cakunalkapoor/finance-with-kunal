// GitHub Pages serves static files and ignores next.config response headers.
// Hash the actual exported inline scripts; never use a reusable static nonce or
// allow arbitrary inline/eval JavaScript. HTTP-only protections still need the host.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const OWN_POLICY = /<meta\b(?=[^>]*\bid=["']site-csp["'])[^>]*>/gi;

export function inlineScriptHashes(html) {
  return [...new Set([...html.matchAll(SCRIPT)].filter(match => !/\bsrc\s*=/i.test(match[1]))
    .map(match => `'sha256-${createHash("sha256").update(match[2].replace(/\r\n?/g, "\n")).digest("base64")}'`))];
}

export function contentSecurityPolicy(html) {
  return [
    "default-src 'self'",
    `script-src 'self' ${inlineScriptHashes(html).join(" ")}`.trim(),
    "script-src-attr 'none'",
    // Existing React/ECharts components use inline style attributes. Script
    // execution remains hash-restricted; this is not an unsafe-inline script policy.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ") + ";";
}

export function secureHtml(input) {
  const html = input.replace(OWN_POLICY, "");
  if (/<meta\b[^>]*http-equiv=["']Content-Security-Policy["']/i.test(html)) {
    throw new Error("Unexpected additional CSP; review the export policy");
  }
  const head = /<head\b[^>]*>/i.exec(html);
  if (!head) throw new Error("Exported HTML has no head");
  const charset = /<meta\b[^>]*\bcharset\s*=\s*["']?utf-8["']?[^>]*>/i.exec(html);
  const offset = charset ? charset.index + charset[0].length : head.index + head[0].length;
  // Keep charset within the first 1024 bytes and the policy before any scripts,
  // preloads or styles. A misplaced meta policy cannot protect earlier content.
  if (/<(?:script|link|style)\b/i.test(html.slice(0, offset))) throw new Error("CSP would follow active content");
  for (const match of html.matchAll(SCRIPT)) {
    const source = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(match[1]);
    if (source && (!source[1].startsWith("/") || source[1].startsWith("//") || source[1].includes("\\"))) {
      throw new Error("Unexpected external executable script in the static export");
    }
  }
  const meta = `${charset ? "" : '<meta charset="utf-8"/>'}<meta id="site-csp" http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(html)}"/>`;
  return html.slice(0, offset) + meta + html.slice(offset);
}

export function hardenExport(directory) {
  let count = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) count += hardenExport(path);
    else if (entry.isFile() && entry.name.endsWith(".html")) {
      const html = readFileSync(path, "utf8");
      // Google's ownership-verification endpoint is intentionally a fixed text
      // response, not a document. Keep the exact public challenge intact.
      if (entry.name === "googlebcea7e1eb15ca04f.html" && html.trim() === `google-site-verification: ${entry.name}`) continue;
      writeFileSync(path, secureHtml(html));
      count++;
    }
  }
  return count;
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const count = hardenExport(join(process.cwd(), "out"));
  if (count === 0) throw new Error("No exported HTML was protected");
  console.log(`[postbuild-security] protected ${count} HTML documents with script hashes`);
}
