(function () {
  var ADMINISTRATOR_LEVEL = 2;
  var LOGS_PAGE_SIZE = 50;

  var headerUser = document.getElementById("header-user");
  var logoutBtn = document.getElementById("logout-btn");
  var whoamiEl = document.getElementById("whoami");

  var usersTableBody = document.getElementById("users-table-body");
  var usersEmptyState = document.getElementById("users-empty-state");

  var logsListEl = document.getElementById("logs-list");
  var logsEmptyState = document.getElementById("logs-empty-state");
  var logsCountEl = document.getElementById("logs-count");
  var logsLoadMoreBtn = document.getElementById("logs-load-more-btn");

  var loadedLogs = [];
  var logsTotal = 0;
  var loadingMoreLogs = false;
  var currentUsername = null;

  var ACTION_LABELS = {
    login: "Zalogowanie",
    logout: "Wylogowanie",
    submission_delete: "Usunięcie zgłoszenia",
    user_delete: "Usunięcie konta",
    user_password_reset: "Reset hasła",
    user_permission_grant: "Nadanie uprawnień administratora",
    user_permission_revoke: "Odebranie uprawnień administratora",
  };

  var tabButtons = document.querySelectorAll(".tab-btn");
  var tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-tab");
      tabButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("border-[color:var(--brand-maroon)]", active);
        b.classList.toggle("text-gray-900", active);
        b.classList.toggle("border-transparent", !active);
        b.classList.toggle("text-gray-500", !active);
      });
      tabPanels.forEach(function (panel) {
        panel.classList.toggle("hidden", panel.id !== "tab-" + target);
      });
    });
  });

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function closeAllMenus() {
    usersTableBody.querySelectorAll(".user-menu").forEach(function (menu) {
      menu.classList.add("hidden");
    });
  }

  function renderUsers(users) {
    usersEmptyState.classList.toggle("hidden", users.length > 0);
    usersTableBody.innerHTML = users
      .map(function (user) {
        var isAdmin = user.permission_level >= ADMINISTRATOR_LEVEL;
        var levelLabel = isAdmin ? "Administrator" : "Moderator";
        var passwordLabel = user.password_set
          ? '<span class="text-green-700">Ustawione</span>'
          : '<span class="text-amber-600">Oczekuje na pierwsze logowanie</span>';
        var lastLogin = user.last_login_at ? escapeHtml(formatDate(user.last_login_at)) : "Nigdy";
        var isSelf = user.username === currentUsername;
        var menuHtml = isSelf
          ? ""
          : '<div class="relative inline-block text-left">' +
            '<button type="button" class="menu-toggle-btn rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" data-username="' +
            escapeHtml(user.username) +
            '" aria-label="Akcje dla ' + escapeHtml(user.username) + '">' +
            '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true"><circle cx="12" cy="6" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="18" r="1.6" /></svg>' +
            "</button>" +
            '<div class="user-menu hidden absolute right-0 z-20 mt-1 w-64 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">' +
            '<button type="button" class="reset-password-btn block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" data-username="' +
            escapeHtml(user.username) +
            '">Zresetuj hasło</button>' +
            '<button type="button" class="toggle-admin-btn block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" data-username="' +
            escapeHtml(user.username) +
            '" data-action="' + (isAdmin ? "revoke_admin" : "grant_admin") + '">' +
            (isAdmin ? "Zabierz uprawnienia administratora" : "Przyznaj uprawnienia administratora") +
            "</button>" +
            '<button type="button" class="delete-account-btn block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50" data-username="' +
            escapeHtml(user.username) +
            '">Usuń konto</button>' +
            "</div>" +
            "</div>";
        return (
          '<tr class="border-b border-gray-50 last:border-0">' +
          '<td class="px-4 py-3 font-medium text-gray-900">' + escapeHtml(user.username) + "</td>" +
          '<td class="px-4 py-3 text-gray-600">' + levelLabel + "</td>" +
          '<td class="px-4 py-3">' + passwordLabel + "</td>" +
          '<td class="px-4 py-3 text-gray-500">' + lastLogin + "</td>" +
          '<td class="px-4 py-3 text-right">' + menuHtml + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function loadUsers() {
    return fetch("/api/admin/users")
      .then(function (res) {
        if (!res.ok) throw new Error("Błąd pobierania użytkowników");
        return res.json();
      })
      .then(function (data) {
        renderUsers(data.users || []);
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  function patchUser(targetUsername, action) {
    return fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: targetUsername, action: action }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Błąd");
          return data;
        });
      })
      .then(function () {
        return loadUsers();
      })
      .catch(function (err) {
        window.alert(err.message);
      });
  }

  function deleteUser(targetUsername) {
    return fetch("/api/admin/users?username=" + encodeURIComponent(targetUsername), { method: "DELETE" })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Błąd");
          return data;
        });
      })
      .then(function () {
        return loadUsers();
      })
      .catch(function (err) {
        window.alert(err.message);
      });
  }

  usersTableBody.addEventListener("click", function (e) {
    var toggleBtn = e.target.closest(".menu-toggle-btn");
    if (toggleBtn) {
      var menu = toggleBtn.nextElementSibling;
      var wasHidden = menu.classList.contains("hidden");
      closeAllMenus();
      if (wasHidden) menu.classList.remove("hidden");
      e.stopPropagation();
      return;
    }

    var resetBtn = e.target.closest(".reset-password-btn");
    if (resetBtn) {
      closeAllMenus();
      var resetUsername = resetBtn.getAttribute("data-username");
      if (!window.confirm("Zresetować hasło dla " + resetUsername + "? Będzie mógł/mogła ustawić nowe przy następnym logowaniu.")) return;
      patchUser(resetUsername, "reset_password");
      return;
    }

    var toggleAdminBtn = e.target.closest(".toggle-admin-btn");
    if (toggleAdminBtn) {
      closeAllMenus();
      var toggleUsername = toggleAdminBtn.getAttribute("data-username");
      var action = toggleAdminBtn.getAttribute("data-action");
      var confirmMsg =
        action === "grant_admin"
          ? "Przyznać uprawnienia administratora dla " + toggleUsername + "?"
          : "Zabrać uprawnienia administratora dla " + toggleUsername + "?";
      if (!window.confirm(confirmMsg)) return;
      patchUser(toggleUsername, action);
      return;
    }

    var deleteBtn = e.target.closest(".delete-account-btn");
    if (deleteBtn) {
      closeAllMenus();
      var deleteUsername = deleteBtn.getAttribute("data-username");
      if (!window.confirm("Usunąć konto " + deleteUsername + "? Tej operacji nie można cofnąć.")) return;
      deleteUser(deleteUsername);
      return;
    }
  });

  document.addEventListener("click", function () {
    closeAllMenus();
  });

  function renderLogs() {
    logsCountEl.textContent = logsTotal ? "(" + logsTotal + ")" : "";
    logsEmptyState.classList.toggle("hidden", logsTotal > 0);
    logsListEl.classList.toggle("hidden", loadedLogs.length === 0);
    logsListEl.classList.toggle("flex", loadedLogs.length > 0);

    logsListEl.innerHTML = loadedLogs
      .map(function (entry) {
        var label = ACTION_LABELS[entry.action] || entry.action;
        var extra = [entry.target, entry.details].filter(Boolean).map(escapeHtml).join(" &middot; ");
        return (
          '<article class="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">' +
          '<div class="flex flex-wrap items-center gap-2 text-sm">' +
          '<span class="font-semibold text-gray-900">' + escapeHtml(entry.actor_username) + "</span>" +
          '<span class="text-gray-500">' + escapeHtml(label) + "</span>" +
          '<span class="ml-auto text-xs text-gray-400">' + escapeHtml(formatDate(entry.created_at)) + "</span>" +
          "</div>" +
          (extra ? '<p class="mt-1 text-xs text-gray-500">' + extra + "</p>" : "") +
          "</article>"
        );
      })
      .join("");
  }

  function updateLogsLoadMoreButton() {
    var remaining = logsTotal - loadedLogs.length;
    if (remaining > 0) {
      logsLoadMoreBtn.textContent = "Załaduj więcej (" + remaining + ")";
      logsLoadMoreBtn.classList.remove("hidden");
      logsLoadMoreBtn.disabled = false;
    } else {
      logsLoadMoreBtn.classList.add("hidden");
    }
  }

  function fetchLogsPage(offset) {
    return fetch("/api/admin/logs?limit=" + LOGS_PAGE_SIZE + "&offset=" + offset).then(function (res) {
      if (!res.ok) throw new Error("Błąd pobierania logów");
      return res.json();
    });
  }

  function loadInitialLogs() {
    return fetchLogsPage(0)
      .then(function (data) {
        loadedLogs = data.logs || [];
        logsTotal = data.total || 0;
        renderLogs();
        updateLogsLoadMoreButton();
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  logsLoadMoreBtn.addEventListener("click", function () {
    if (loadingMoreLogs) return;
    loadingMoreLogs = true;
    logsLoadMoreBtn.disabled = true;
    logsLoadMoreBtn.textContent = "Ładowanie...";

    fetchLogsPage(loadedLogs.length)
      .then(function (data) {
        loadedLogs = loadedLogs.concat(data.logs || []);
        logsTotal = data.total || 0;
        renderLogs();
        updateLogsLoadMoreButton();
      })
      .catch(function (err) {
        window.alert(err.message);
      })
      .then(function () {
        loadingMoreLogs = false;
      });
  });

  function checkSessionAndLoad() {
    return fetch("/api/me")
      .then(function (res) {
        if (res.status === 401) {
          window.location.href = "/admin";
          return null;
        }
        if (!res.ok) throw new Error("Błąd sprawdzania sesji");
        return res.json();
      })
      .then(function (me) {
        if (!me) return;
        if (me.permission_level < ADMINISTRATOR_LEVEL) {
          window.location.href = "/admin";
          return;
        }
        currentUsername = me.username;
        headerUser.classList.remove("hidden");
        headerUser.classList.add("flex");
        whoamiEl.textContent = "Zalogowano jako: " + me.username;
        return Promise.all([loadUsers(), loadInitialLogs()]);
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  logoutBtn.addEventListener("click", function () {
    fetch("/api/logout", { method: "POST" }).then(function () {
      window.location.href = "/admin";
    });
  });

  checkSessionAndLoad();
})();
