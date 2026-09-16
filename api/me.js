const { getSessionUsername } = require("../lib/auth");

module.exports = async function handler(req, res) {
  const username = getSessionUsername(req);
  if (!username) {
    res.status(401).json({ error: "Wymagane logowanie" });
    return;
  }
  res.status(200).json({ username });
};
