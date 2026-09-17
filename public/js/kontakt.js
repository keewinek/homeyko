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
  var thanksMessages = {
    pomysl: "Dziękujemy za pomysł!",
    pytanie: "Dziękujemy za pytanie!",
  };
  var LIMIT_MESSAGE = "Co za dużo, to niezdrowo! Zwolnij trochę.";

  var titleEl = document.getElementById("kontakt-title");
  var typeInput = document.getElementById("kontakt-type");
  var form = document.getElementById("kontakt-form");
  var statusEl = document.getElementById("kontakt-status");
  var card = document.getElementById("kontakt-card");
  var mailbox = document.getElementById("mailbox");
  var mailboxBody = mailbox.querySelector(".mailbox__body");
  var mailboxMessage = document.getElementById("mailbox-message");
  var submitBtn = form.querySelector('button[type="submit"]');

  titleEl.textContent = titles[type];
  typeInput.value = type;
  document.title = "Homeyko - " + titles[type];

  // Skrzynka (position: fixed) w spoczynku musi zawsze zaczynać się
  // poniżej przycisku Wyślij, na każdej wysokości ekranu. Jeśli się nie
  // mieści, ma spokojnie wystawać poza dół ekranu (to tylko dekoracja) -
  // nigdy nie zmniejszamy jej po to, żeby się zmieściła, i nigdy nie
  // pozwalamy jej wejść nad przycisk. `position: fixed` samo w sobie nie
  // dokłada scrolla, więc wystawanie poza viewport jest bezpieczne.
  var MAILBOX_GAP_ABOVE = 16;

  function syncMailboxPosition() {
    // Nad grafiką skrzynki w tym samym kontenerze (position: fixed) jest
    // jeszcze serce/X i komunikat, więc mierzymy realny odstęp między
    // górą kontenera a górą samej grafiki, żeby to grafika, nie kontener,
    // lądowała dokładnie pod przyciskiem.
    var containerTop = mailbox.getBoundingClientRect().top;
    var bodyTop = mailboxBody.getBoundingClientRect().top;
    var extraAbove = bodyTop - containerTop;
    var btnBottom = submitBtn.getBoundingClientRect().bottom;
    var desiredTop = btnBottom + MAILBOX_GAP_ABOVE - extraAbove;
    mailbox.style.setProperty("--mailbox-top", desiredTop + "px");
  }

  syncMailboxPosition();
  window.addEventListener("resize", syncMailboxPosition);
  window.addEventListener("orientationchange", syncMailboxPosition);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncMailboxPosition);
  }

  // Klonuje wygląd karteczki z wiadomością i animuje jej "lot" do szczeliny
  // skrzynki (Web Animations API, bo start/koniec liczymy z rzeczywistych
  // pozycji na ekranie, więc czystym CSS się nie da).
  function flyCardIntoMailbox() {
    var startRect = card.getBoundingClientRect();
    var bodyRect = mailboxBody.getBoundingClientRect();
    var targetX = bodyRect.left + bodyRect.width / 2;
    var targetY = bodyRect.top + bodyRect.height * 0.4;
    var startCenterX = startRect.left + startRect.width / 2;
    var startCenterY = startRect.top + startRect.height / 2;
    var dx = targetX - startCenterX;
    var dy = targetY - startCenterY;

    var flying = document.createElement("div");
    flying.className = "kontakt-flying-card";
    flying.textContent = form.message.value;
    flying.style.left = startRect.left + "px";
    flying.style.top = startRect.top + "px";
    flying.style.width = startRect.width + "px";
    flying.style.height = startRect.height + "px";
    document.body.appendChild(flying);

    var animation = flying.animate(
      [
        { transform: "translate(0, 0) rotate(0deg) scale(1)", opacity: 1, offset: 0 },
        {
          transform:
            "translate(" + dx * 0.55 + "px, " + dy * 0.35 + "px) rotate(-6deg) scale(0.55)",
          opacity: 1,
          offset: 0.6,
        },
        {
          transform:
            "translate(" + dx + "px, " + dy + "px) rotate(-16deg) scale(0.1)",
          opacity: 0,
          offset: 1,
        },
      ],
      { duration: 650, easing: "cubic-bezier(0.55, 0, 0.85, 0.35)", fill: "forwards" }
    );

    return animation.finished.then(function () {
      flying.remove();
    });
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  // kind: "success" (serce) albo "limited" (X, przekroczony limit).
  function playResultAnimation(kind) {
    var isLimited = kind === "limited";
    var text = isLimited ? LIMIT_MESSAGE : thanksMessages[type] || "Dziękujemy!";

    form.classList.add("is-sending");
    mailbox.classList.toggle("is-limited", isLimited);

    return flyCardIntoMailbox()
      .then(function () {
        mailbox.classList.add("is-bounce");
        wait(500).then(function () {
          mailbox.classList.remove("is-bounce");
        });
        return wait(150);
      })
      .then(function () {
        mailbox.classList.add("is-centered");
        return wait(500);
      })
      .then(function () {
        mailboxMessage.textContent = text;
        statusEl.textContent = text;
        statusEl.className = isLimited
          ? "kontakt-status kontakt-status--error"
          : "kontakt-status";
        mailbox.classList.add("is-done");
        return wait(2400);
      })
      .then(function () {
        mailbox.classList.remove("is-done", "is-centered", "is-limited");
        mailboxMessage.textContent = "";
        return wait(400);
      })
      .then(function () {
        form.classList.remove("is-sending");
        if (!isLimited) {
          form.reset();
          typeInput.value = type;
        }
        syncMailboxPosition();
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "kontakt-status";
    submitBtn.disabled = true;
    submitBtn.textContent = "Wysyłanie...";

    var payload = {
      type: typeInput.value,
      message: form.message.value,
      website: form.website.value,
    };

    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, rateLimited: !!data.rateLimited, data: data };
        });
      })
      .then(function (result) {
        submitBtn.textContent = "Wyślij";
        submitBtn.disabled = false;
        if (result.ok) return playResultAnimation("success");
        if (result.rateLimited) return playResultAnimation("limited");
        throw new Error(result.data.error || "Coś poszło nie tak");
      })
      .catch(function (err) {
        statusEl.textContent = err.message;
        statusEl.className = "kontakt-status kontakt-status--error";
        submitBtn.disabled = false;
        submitBtn.textContent = "Wyślij";
      });
  });
})();
