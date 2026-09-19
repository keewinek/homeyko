const { ensureSchema } = require("../lib/db");
const { getSessionUsername, clearCookieHeader } = require("../lib/auth");
const { logAdminActivity } = require("../lib/admin-log");

module.exports = async function handler(req, res) {
  const username = getSessionUsername(req);
  if (username) {
    try {
      await ensureSchema();
      await logAdminActivity({ actorUsername: username, action: "logout" });
    } catch (err) {
      console.error(err);
    }
  }

  res.setHeader("Set-Cookie", clearCookieHeader());
  res.status(200).json({ ok: true });
};
