(function () {
  var MOTIVATION_MIN = 10;
  var MOTIVATION_MAX = 1000;

  // Ten sam filtr co na serwerze (api/recruit.js): litery, cyfry, białe
  // znaki i podstawowa interpunkcja. Reszta jest po cichu usuwana.
  var ALLOWED_CHARS_REGEX = /[^\p{L}\p{N}\s.,!?:;'"()\-/%&+]/gu;

  var form = document.getElementById("rekrutacja-form");
  var statusEl = document.getElementById("rekrutacja-status");
  var submitBtn = document.getElementById("rekrutacja-submit");
  var thanksEl = document.getElementById("rekrutacja-thanks");
  var counterEl = document.getElementById("motivation-counter");

  function setStatus(text) {
    statusEl.textContent = text;
    statusEl.className = "text-sm font-semibold text-red-700 empty:hidden";
  }

  form.motivation.addEventListener("input", function () {
    var filtered = form.motivation.value.replace(ALLOWED_CHARS_REGEX, "");
    if (filtered !== form.motivation.value) form.motivation.value = filtered;
    counterEl.textContent = filtered.length + "/" + MOTIVATION_MAX;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";

    var payload = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      className: form.className.value.trim(),
      motivation: form.motivation.value.trim(),
      website: form.website.value,
    };

    if (payload.firstName.length < 2) return setStatus("Podaj imię.");
    if (payload.lastName.length < 2) return setStatus("Podaj nazwisko.");
    if (!payload.className) return setStatus("Podaj klasę.");
    if (payload.motivation.length < MOTIVATION_MIN) {
      return setStatus("Napisz kilka słów o tym, dlaczego chcesz działać (min. " + MOTIVATION_MIN + " znaków).");
    }

    submitBtn.disabled = true;

    fetch("/api/recruit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Coś poszło nie tak");
        });
      })
      .then(function () {
        form.classList.add("hidden");
        thanksEl.classList.remove("hidden");
        thanksEl.focus();
      })
      .catch(function (err) {
        setStatus(err.message);
        submitBtn.disabled = false;
      });
  });
})();
