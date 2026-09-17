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

function createSessionToken(username) {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${username}|${expires}`;
  return `${payload}.${sign(payload)}`;
}

// Zwraca username z ważnego tokenu, albo null.
function verifySessionToken(token) {
  if (!token) return null;
  // Nie dzielimy przez split(".") na całym tokenie: username (payload) może
  // sam zawierać kropki (login w formacie imię.nazwisko), a sygnatura hex
  // nigdy ich nie ma, więc ostatnia kropka w tokenie jest jedynym poprawnym
  // separatorem payload/sygnatura.
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  const usernameSeparatorIndex = payload.lastIndexOf("|");
  if (usernameSeparatorIndex === -1) return null;
  const username = payload.slice(0, usernameSeparatorIndex);
  const expiresAt = Number(payload.slice(usernameSeparatorIndex + 1));

  if (!username || !(expiresAt > Date.now())) return null;
  return username;
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

// Zwraca zalogowany username albo null.
function getSessionUsername(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies[COOKIE_NAME]);
}

function isAuthenticated(req) {
  return getSessionUsername(req) !== null;
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
  getSessionUsername,
  isAuthenticated,
  sessionCookieHeader,
  clearCookieHeader,
};
