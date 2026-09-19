const { sql } = require("./db");

const PERMISSION_MODERATOR = 1;
const PERMISSION_ADMINISTRATOR = 2;

async function getPermissionLevel(username) {
  const rows = await sql`
    SELECT permission_level FROM sztab_users WHERE username = ${username}
  `;
  return rows[0] ? rows[0].permission_level : null;
}

async function isAdministrator(username) {
  const level = await getPermissionLevel(username);
  return level !== null && level >= PERMISSION_ADMINISTRATOR;
}

module.exports = {
  PERMISSION_MODERATOR,
  PERMISSION_ADMINISTRATOR,
  getPermissionLevel,
  isAdministrator,
};
