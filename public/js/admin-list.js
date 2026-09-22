(function () {
  var PAGE_SIZE = 50;
  var SKELETON_COUNT = 6;

  var listSection = document.getElementById("list-section");
  var headerUser = document.getElementById("header-user");
  var logoutBtn = document.getElementById("logout-btn");
  var whoamiEl = document.getElementById("whoami");
  var listEl = document.getElementById("submissions-list");
  var skeletonEl = document.getElementById("submissions-skeleton");
  var emptyStateEl = document.getElementById("empty-state");
  var countEl = document.getElementById("submissions-count");
  var loadMoreBtn = document.getElementById("load-more-btn");

  var type = listSection.getAttribute("data-type");
  var loadedItems = [];
  var total = 0;
  var loadingMore = false;

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

  function buildSkeleton() {
    skeletonEl.innerHTML = "";
    for (var i = 0; i < SKELETON_COUNT; i++) {
      var card = document.createElement("div");
      card.className =
        "animate-pulse rounded-xl border border-gray-100 border-l-4 border-l-gray-200 bg-white p-4 shadow-sm";
      card.innerHTML =
        '<div class="mb-2 h-3 w-28 rounded bg-gray-200"></div>' +
        '<div class="mb-1.5 h-4 w-full rounded bg-gray-200"></div>' +
        '<div class="h-4 w-2/3 rounded bg-gray-200"></div>';
      skeletonEl.appendChild(card);
    }
  }

  function render() {
    countEl.textContent = total ? "(" + total + ")" : "";
    emptyStateEl.classList.toggle("hidden", total > 0);
    listEl.innerHTML = "";

    loadedItems.forEach(function (item) {
      var card = document.createElement("article");
      card.className =
        "flex flex-col gap-2 rounded-xl border border-gray-100 border-l-4 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-4 " +
        (item.is_spam ? "border-l-gray-300 opacity-60" : "border-l-[color:var(--brand-coral)]");
      card.innerHTML =
        '<div class="min-w-0 flex-1">' +
        '<div class="mb-1.5 flex items-center gap-2 text-xs text-gray-400">' +
        "<span>" + escapeHtml(formatDate(item.created_at)) + "</span>" +
        (item.is_spam
          ? '<span class="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">Wykryto spam</span>'
          : "") +
        "</div>" +
        '<p class="whitespace-pre-wrap break-words text-gray-900">' + escapeHtml(item.message) + "</p>" +
        (item.contact
          ? '<p class="mt-1.5 text-sm text-gray-500">Kontakt: ' + escapeHtml(item.contact) + "</p>"
          : "") +
        "</div>" +
        '<button type="button" data-id="' + item.id + '" data-spam="' + (item.is_spam ? "1" : "0") + '" class="delete-btn shrink-0 self-start rounded-md border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600">Usuń</button>';
      listEl.appendChild(card);
    });

    listEl.querySelectorAll(".delete-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = Number(btn.getAttribute("data-id"));
        var isSpamItem = btn.getAttribute("data-spam") === "1";
        if (!isSpamItem && !window.confirm("Usunąć to zgłoszenie?")) return;
        fetch("/api/submissions?id=" + encodeURIComponent(id), { method: "DELETE" })
          .then(function (res) {
            if (!res.ok) throw new Error("Nie udało się usunąć");
            loadedItems = loadedItems.filter(function (item) {
              return item.id !== id;
            });
            total = Math.max(total - 1, 0);
            render();
            updateLoadMoreButton();
          })
          .catch(function (err) {
            window.alert(err.message);
          });
      });
    });
  }

  function updateLoadMoreButton() {
    var remaining = total - loadedItems.length;
    if (remaining > 0) {
      loadMoreBtn.textContent = "Załaduj więcej (" + remaining + ")";
      loadMoreBtn.classList.remove("hidden");
      loadMoreBtn.disabled = false;
    } else {
      loadMoreBtn.classList.add("hidden");
    }
  }

  function fetchPage(offset) {
    return fetch(
      "/api/submissions?type=" + encodeURIComponent(type) + "&limit=" + PAGE_SIZE + "&offset=" + offset
    ).then(function (res) {
      if (!res.ok) throw new Error("Błąd pobierania zgłoszeń");
      return res.json();
    });
  }

  function loadInitial() {
    buildSkeleton();
    listEl.classList.add("hidden");
    listEl.classList.remove("flex");
    emptyStateEl.classList.add("hidden");
    loadMoreBtn.classList.add("hidden");
    skeletonEl.classList.remove("hidden");
    skeletonEl.classList.add("flex");

    return fetchPage(0)
      .then(function (data) {
        loadedItems = data.submissions || [];
        total = data.total || 0;
        skeletonEl.classList.add("hidden");
        skeletonEl.classList.remove("flex");
        listEl.classList.remove("hidden");
        listEl.classList.add("flex");
        render();
        updateLoadMoreButton();
      })
      .catch(function (err) {
        skeletonEl.classList.add("hidden");
        skeletonEl.classList.remove("flex");
        console.error(err);
      });
  }

  loadMoreBtn.addEventListener("click", function () {
    if (loadingMore) return;
    loadingMore = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = "Ładowanie...";

    fetchPage(loadedItems.length)
      .then(function (data) {
        var existingIds = loadedItems.map(function (item) {
          return item.id;
        });
        var newItems = (data.submissions || []).filter(function (item) {
          return existingIds.indexOf(item.id) === -1;
        });
        loadedItems = loadedItems.concat(newItems);
        total = data.total || 0;
        render();
        updateLoadMoreButton();
      })
      .catch(function (err) {
        window.alert(err.message);
      })
      .then(function () {
        loadingMore = false;
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
        headerUser.classList.remove("hidden");
        headerUser.classList.add("flex");
        whoamiEl.textContent = "Zalogowano jako: " + me.username;
        return loadInitial();
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
