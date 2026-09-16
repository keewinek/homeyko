(function () {
  var SLUG_TO_TYPE = { pomysl: "pomysl", pytania: "pytanie" };
  var pathSegments = window.location.pathname.split("/").filter(Boolean);
  var slug = pathSegments[1] || "";
  var params = new URLSearchParams(window.location.search);

  var type =
    SLUG_TO_TYPE[slug] ||
    (params.get("typ") === "pytanie" ? "pytanie" : "pomysl");

  var titles = {
    pomysl: "Zgłoś pomysł",
    pytanie: "Zadaj pytanie",
  };

  var titleEl = document.getElementById("kontakt-title");
  var typeInput = document.getElementById("kontakt-type");
  var form = document.getElementById("kontakt-form");
  var statusEl = document.getElementById("kontakt-status");

  titleEl.textContent = titles[type];
  typeInput.value = type;
  document.title = "Homeyko — " + titles[type];

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "text-center text-sm";

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    var payload = {
      type: typeInput.value,
      message: form.message.value,
      contact: form.contact.value,
      website: form.website.value,
    };

    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw new Error(data.error || "Coś poszło nie tak");
          return data;
        });
      })
      .then(function () {
        statusEl.textContent = "Dziękujemy! Otrzymaliśmy Twoją wiadomość.";
        statusEl.className = "text-center text-sm text-green-700";
        form.reset();
        typeInput.value = type;
      })
      .catch(function (err) {
        statusEl.textContent = err.message;
        statusEl.className = "text-center text-sm text-red-600";
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
