const crypto = require("crypto");

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dni

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET env var");
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function createSessionToken() {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

function isValidSessionToken(token) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  return Number(payload) > Date.now();
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  return isValidSessionToken(cookies[COOKIE_NAME]);
}

function sessionCookieHeader(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`;
}

function clearCookieHeader() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

module.exports = {
  COOKIE_NAME,
  createSessionToken,
  isAuthenticated,
  sessionCookieHeader,
  clearCookieHeader,
};
