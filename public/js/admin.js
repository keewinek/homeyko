(function () {
  var loginSection = document.getElementById("login-section");
  var submissionsSection = document.getElementById("submissions-section");
  var loginForm = document.getElementById("login-form");
  var loginStatus = document.getElementById("login-status");
  var headerUser = document.getElementById("header-user");
  var logoutBtn = document.getElementById("logout-btn");
  var whoamiEl = document.getElementById("whoami");
  var listEl = document.getElementById("submissions-list");
  var emptyStateEl = document.getElementById("empty-state");
  var countEl = document.getElementById("submissions-count");
  var filterTabs = document.querySelectorAll(".filter-tab");

  var TYPE_LABELS = { pomysl: "Pomysł", pytanie: "Pytanie" };
  var TYPE_STYLES = {
    pomysl: { border: "border-l-[color:var(--brand-coral)]", badge: "bg-[color:var(--brand-coral)]/15 text-[color:var(--brand-maroon-dark)]" },
    pytanie: { border: "border-l-[color:var(--brand-maroon)]", badge: "bg-[color:var(--brand-maroon)]/10 text-[color:var(--brand-maroon-dark)]" },
  };

  var allSubmissions = [];
  var activeFilter = "all";

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

  function setActiveFilter(filter) {
    activeFilter = filter;
    filterTabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-filter") === filter;
      tab.classList.toggle("bg-white", isActive);
      tab.classList.toggle("shadow-sm", isActive);
      tab.classList.toggle("text-[color:var(--brand-maroon-dark)]", isActive);
      tab.classList.toggle("text-gray-500", !isActive);
    });
    render();
  }

  function render() {
    var items =
      activeFilter === "all"
        ? allSubmissions
        : allSubmissions.filter(function (item) {
            return item.type === activeFilter;
          });

    countEl.textContent = allSubmissions.length ? "(" + allSubmissions.length + ")" : "";
    emptyStateEl.classList.toggle("hidden", items.length > 0);
    listEl.innerHTML = "";

    items.forEach(function (item) {
      var style = TYPE_STYLES[item.type] || TYPE_STYLES.pomysl;
      var card = document.createElement("article");
      card.className =
        "flex flex-col gap-2 rounded-xl border border-gray-100 border-l-4 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-4 " +
        style.border;
      card.innerHTML =
        '<div class="min-w-0 flex-1">' +
        '<div class="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">' +
        '<span class="rounded-full px-2 py-0.5 text-xs font-semibold ' + style.badge + '">' +
        escapeHtml(TYPE_LABELS[item.type] || item.type) +
        "</span>" +
        "<span>" + escapeHtml(formatDate(item.created_at)) + "</span>" +
        "</div>" +
        '<p class="whitespace-pre-wrap break-words text-gray-900">' + escapeHtml(item.message) + "</p>" +
        (item.contact
          ? '<p class="mt-1.5 text-sm text-gray-500">Kontakt: ' + escapeHtml(item.contact) + "</p>"
          : "") +
        "</div>" +
        '<button type="button" data-id="' + item.id + '" class="delete-btn shrink-0 self-start rounded-md border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600">Usuń</button>';
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
    headerUser.classList.remove("hidden");
    headerUser.classList.add("flex");
    if (username) {
      whoamiEl.textContent = "Zalogowano jako: " + username;
    }
  }

  function showLoggedOut() {
    loginSection.classList.remove("hidden");
    submissionsSection.classList.add("hidden");
    headerUser.classList.add("hidden");
    headerUser.classList.remove("flex");
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
        allSubmissions = result.data.submissions || [];
        setActiveFilter(activeFilter);
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  filterTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setActiveFilter(tab.getAttribute("data-filter"));
    });
  });

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

  setActiveFilter("all");
  loadSubmissions();
})();
