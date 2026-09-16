(function () {
  var loginSection = document.getElementById("login-section");
  var submissionsSection = document.getElementById("submissions-section");
  var loginForm = document.getElementById("login-form");
  var loginStatus = document.getElementById("login-status");
  var logoutBtn = document.getElementById("logout-btn");
  var whoamiEl = document.getElementById("whoami");
  var listEl = document.getElementById("submissions-list");
  var emptyStateEl = document.getElementById("empty-state");

  var TYPE_LABELS = { pomysl: "Pomysł", pytanie: "Pytanie" };

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString("pl-PL");
    } catch (e) {
      return iso;
    }
  }

  function renderSubmissions(items) {
    listEl.innerHTML = "";
    emptyStateEl.classList.toggle("hidden", items.length > 0);

    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "rounded-lg border border-gray-200 bg-white p-4 shadow-sm";
      card.innerHTML =
        '<div class="mb-2 flex items-center justify-between text-xs text-gray-500">' +
        '<span class="rounded bg-gray-100 px-2 py-0.5 font-semibold uppercase">' +
        escapeHtml(TYPE_LABELS[item.type] || item.type) +
        "</span>" +
        "<span>" + escapeHtml(formatDate(item.created_at)) + "</span>" +
        "</div>" +
        '<p class="mb-2 whitespace-pre-wrap text-gray-900">' + escapeHtml(item.message) + "</p>" +
        (item.contact
          ? '<p class="mb-2 text-sm text-gray-600">Kontakt: ' + escapeHtml(item.contact) + "</p>"
          : "") +
        '<button type="button" data-id="' + item.id + '" class="delete-btn text-sm font-semibold text-red-600 underline">Usuń</button>';
      listEl.appendChild(card);
    });

    listEl.querySelectorAll(".delete-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        if (!window.confirm("Usunąć to zgłoszenie?")) return;
        fetch("/api/submissions?id=" + encodeURIComponent(id), { method: "DELETE" })
          .then(function (res) {
            if (!res.ok) throw new Error("Nie udało się usunąć");
            return loadSubmissions();
          })
          .catch(function (err) {
            window.alert(err.message);
          });
      });
    });
  }

  function showLoggedIn(username) {
    loginSection.classList.add("hidden");
    submissionsSection.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    if (username) {
      whoamiEl.textContent = "Zalogowano jako: " + username;
      whoamiEl.classList.remove("hidden");
    }
  }

  function showLoggedOut() {
    loginSection.classList.remove("hidden");
    submissionsSection.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    whoamiEl.classList.add("hidden");
  }

  function loadSubmissions() {
    return fetch("/api/me")
      .then(function (res) {
        if (res.status === 401) {
          showLoggedOut();
          return null;
        }
        if (!res.ok) throw new Error("Błąd sprawdzania sesji");
        return res.json();
      })
      .then(function (me) {
        if (!me) return null;
        return fetch("/api/submissions").then(function (res) {
          if (!res.ok) throw new Error("Błąd pobierania zgłoszeń");
          return res.json().then(function (data) {
            return { me: me, data: data };
          });
        });
      })
      .then(function (result) {
        if (!result) return;
        showLoggedIn(result.me.username);
        renderSubmissions(result.data.submissions || []);
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginStatus.textContent = "";

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: loginForm.username.value,
        password: loginForm.password.value,
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Błąd logowania");
          return data;
        });
      })
      .then(function () {
        loginForm.reset();
        loadSubmissions();
      })
      .catch(function (err) {
        loginStatus.textContent = err.message;
      });
  });

  logoutBtn.addEventListener("click", function () {
    fetch("/api/logout", { method: "POST" }).then(function () {
      showLoggedOut();
    });
  });

  loadSubmissions();
})();
