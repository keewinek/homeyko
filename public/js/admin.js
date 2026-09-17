(function () {
  var loginSection = document.getElementById("login-section");
  var loginCard = document.getElementById("login-card");
  var loginSpinner = document.getElementById("login-spinner");
  var dashboardSection = document.getElementById("dashboard-section");
  var loginForm = document.getElementById("login-form");
  var loginStatus = document.getElementById("login-status");
  var headerUser = document.getElementById("header-user");
  var logoutBtn = document.getElementById("logout-btn");
  var whoamiEl = document.getElementById("whoami");

  function showLoggedIn(username) {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    headerUser.classList.remove("hidden");
    headerUser.classList.add("flex");
    if (username) {
      whoamiEl.textContent = "Zalogowano jako: " + username;
    }
  }

  function showLoggedOut() {
    loginSection.classList.remove("hidden");
    loginCard.classList.remove("hidden");
    loginSpinner.classList.add("hidden");
    dashboardSection.classList.add("hidden");
    headerUser.classList.add("hidden");
    headerUser.classList.remove("flex");
  }

  function checkSession() {
    return fetch("/api/me")
      .then(function (res) {
        if (res.status === 401) {
          showLoggedOut();
          return;
        }
        if (!res.ok) throw new Error("Błąd sprawdzania sesji");
        return res.json().then(function (me) {
          showLoggedIn(me.username);
        });
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginStatus.textContent = "";
    loginCard.classList.add("hidden");
    loginSpinner.classList.remove("hidden");

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
      .then(function (data) {
        loginForm.reset();
        showLoggedIn(data.username);
      })
      .catch(function (err) {
        loginSpinner.classList.add("hidden");
        loginCard.classList.remove("hidden");
        loginStatus.textContent = err.message;
      });
  });

  logoutBtn.addEventListener("click", function () {
    fetch("/api/logout", { method: "POST" }).then(function () {
      showLoggedOut();
    });
  });

  checkSession();
})();
