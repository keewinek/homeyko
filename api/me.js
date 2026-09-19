const { ensureSchema } = require("../lib/db");
const { getSessionUsername } = require("../lib/auth");
const { getPermissionLevel } = require("../lib/permissions");

module.exports = async function handler(req, res) {
  const username = getSessionUsername(req);
  if (!username) {
    res.status(401).json({ error: "Wymagane logowanie" });
    return;
  }

  try {
    await ensureSchema();
    const permissionLevel = await getPermissionLevel(username);
    res.status(200).json({ username, permission_level: permissionLevel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
