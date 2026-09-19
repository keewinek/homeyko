const { sql } = require("./db");

async function logAdminActivity({ actorUsername, action, target, details }) {
  await sql`
    INSERT INTO admin_activity_log (actor_username, action, target, details)
    VALUES (${actorUsername}, ${action}, ${target || null}, ${details || null})
  `;
}

module.exports = { logAdminActivity };
