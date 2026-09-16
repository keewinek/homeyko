#!/usr/bin/env node
// Zarządzanie loginami sztabu. Wymaga zmiennej DATABASE_URL w środowisku.
//
// Użycie:
//   DATABASE_URL="..." node scripts/manage-users.js add kasia piotr ...
//   DATABASE_URL="..." node scripts/manage-users.js list
//   DATABASE_URL="..." node scripts/manage-users.js reset kasia
//   DATABASE_URL="..." node scripts/manage-users.js remove kasia

const path = require("path");
const { sql, ensureSchema } = require(path.join(__dirname, "..", "lib", "db"));

const USERNAME_RE = /^[a-z0-9_-]{2,32}$/;

async function main() {
  const [, , command, ...args] = process.argv;

  if (!process.env.DATABASE_URL) {
    console.error("Brak DATABASE_URL w zmiennych środowiskowych.");
    process.exit(1);
  }

  await ensureSchema();

  if (command === "add") {
    if (args.length === 0) {
      console.error("Użycie: node scripts/manage-users.js add login1 login2 ...");
      process.exit(1);
    }
    for (const raw of args) {
      const username = raw.trim().toLowerCase();
      if (!USERNAME_RE.test(username)) {
        console.error(
          `Pomijam "${raw}" — dozwolone tylko litery a-z, cyfry, - i _, 2-32 znaki.`
        );
        continue;
      }
      await sql`
        INSERT INTO sztab_users (username) VALUES (${username})
        ON CONFLICT (username) DO NOTHING
      `;
      console.log(`Dodano login: ${username} (bez hasła — ustawi je przy pierwszym logowaniu)`);
    }
  } else if (command === "reset") {
    const username = (args[0] || "").trim().toLowerCase();
    if (!username) {
      console.error("Użycie: node scripts/manage-users.js reset login");
      process.exit(1);
    }
    await sql`
      UPDATE sztab_users SET password_hash = NULL, password_set_at = NULL
      WHERE username = ${username}
    `;
    console.log(`Zresetowano hasło dla: ${username} — przy następnym logowaniu ustawi nowe.`);
  } else if (command === "remove") {
    const username = (args[0] || "").trim().toLowerCase();
    if (!username) {
      console.error("Użycie: node scripts/manage-users.js remove login");
      process.exit(1);
    }
    await sql`DELETE FROM sztab_users WHERE username = ${username}`;
    console.log(`Usunięto login: ${username}`);
  } else if (command === "list") {
    const rows = await sql`
      SELECT username, (password_hash IS NOT NULL) AS claimed, created_at
      FROM sztab_users
      ORDER BY username
    `;
    if (rows.length === 0) {
      console.log("Brak loginów.");
    } else {
      rows.forEach((r) => {
        console.log(
          `${r.username}  —  ${r.claimed ? "hasło ustawione" : "czeka na pierwsze logowanie"}`
        );
      });
    }
  } else {
    console.log("Dostępne komendy:");
    console.log("  node scripts/manage-users.js add login1 login2 ...");
    console.log("  node scripts/manage-users.js list");
    console.log("  node scripts/manage-users.js reset login   (kasuje hasło, można ustawić nowe)");
    console.log("  node scripts/manage-users.js remove login  (usuwa login całkowicie)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
