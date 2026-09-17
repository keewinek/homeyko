(function () {
  var listSection = document.getElementById("list-section");
  var headerUser = document.getElementById("header-user");
  var logoutBtn = document.getElementById("logout-btn");
  var whoamiEl = document.getElementById("whoami");
  var listEl = document.getElementById("submissions-list");
  var emptyStateEl = document.getElementById("empty-state");
  var countEl = document.getElementById("submissions-count");

  var type = listSection.getAttribute("data-type");

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

  function render(items) {
    countEl.textContent = items.length ? "(" + items.length + ")" : "";
    emptyStateEl.classList.toggle("hidden", items.length > 0);
    listEl.innerHTML = "";

    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className =
        "flex flex-col gap-2 rounded-xl border border-gray-100 border-l-4 border-l-[color:var(--brand-coral)] bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-4";
      card.innerHTML =
        '<div class="min-w-0 flex-1">' +
        '<div class="mb-1.5 text-xs text-gray-400">' +
        escapeHtml(formatDate(item.created_at)) +
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

  function loadSubmissions() {
    return fetch("/api/submissions?type=" + encodeURIComponent(type)).then(function (res) {
      if (!res.ok) throw new Error("Błąd pobierania zgłoszeń");
      return res.json().then(function (data) {
        render(data.submissions || []);
      });
    });
  }

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
        headerUser.classList.remove("hidden");
        headerUser.classList.add("flex");
        whoamiEl.textContent = "Zalogowano jako: " + me.username;
        return loadSubmissions();
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
