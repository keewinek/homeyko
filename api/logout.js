const { clearCookieHeader } = require("../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Set-Cookie", clearCookieHeader());
  res.status(200).json({ ok: true });
};
