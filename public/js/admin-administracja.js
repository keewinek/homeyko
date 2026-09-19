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

  var ACTION_LABELS = {
    login: "Zalogowanie",
    logout: "Wylogowanie",
    submission_delete: "Usunięcie zgłoszenia",
  };

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

  function renderUsers(users) {
    usersEmptyState.classList.toggle("hidden", users.length > 0);
    usersTableBody.innerHTML = users
      .map(function (user) {
        var levelLabel = user.permission_level >= ADMINISTRATOR_LEVEL ? "Administrator" : "Moderator";
        var passwordLabel = user.password_set
          ? '<span class="text-green-700">Ustawione</span>'
          : '<span class="text-amber-600">Oczekuje na pierwsze logowanie</span>';
        var lastLogin = user.last_login_at ? escapeHtml(formatDate(user.last_login_at)) : "Nigdy";
        return (
          '<tr class="border-b border-gray-50 last:border-0">' +
          '<td class="px-4 py-3 font-medium text-gray-900">' + escapeHtml(user.username) + "</td>" +
          '<td class="px-4 py-3 text-gray-600">' + levelLabel + "</td>" +
          '<td class="px-4 py-3">' + passwordLabel + "</td>" +
          '<td class="px-4 py-3 text-gray-500">' + lastLogin + "</td>" +
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
