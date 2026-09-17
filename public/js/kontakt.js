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
  var MIN_MESSAGE_LENGTH = 5;
  var MAX_MESSAGE_LENGTH = 500;
  var TOO_SHORT_MESSAGE =
    "Wiadomość musi mieć co najmniej " + MIN_MESSAGE_LENGTH + " znaków.";

  // Dozwolone: litery (także polskie znaki), cyfry, białe znaki i
  // podstawowa interpunkcja. Reszta (emoji, symbole, znaki sterujące)
  // jest po cichu usuwana, żeby zgłoszenia nie zaśmiecały bazy.
  var ALLOWED_CHARS_REGEX = /[^\p{L}\p{N}\s.,!?:;'"()\-/%&+]/gu;

  var titleEl = document.getElementById("kontakt-title");
  var typeInput = document.getElementById("kontakt-type");
  var form = document.getElementById("kontakt-form");
  var statusEl = document.getElementById("kontakt-status");
  var card = document.getElementById("kontakt-card");
  var textarea = document.getElementById("message");
  var counterEl = document.getElementById("kontakt-counter");
  var mailbox = document.getElementById("mailbox");
  var mailboxBody = mailbox.querySelector(".mailbox__body");
  var mailboxResult = document.getElementById("mailbox-result");
  var mailboxMessage = document.getElementById("mailbox-message");
  var submitBtn = form.querySelector('button[type="submit"]');

  function filterAllowedChars(value) {
    return value.replace(ALLOWED_CHARS_REGEX, "");
  }

  function updateSendState() {
    var value = textarea.value;
    var trimmedLength = value.trim().length;
    if (counterEl) {
      counterEl.textContent = value.length + "/" + MAX_MESSAGE_LENGTH;
      counterEl.classList.toggle(
        "is-near-limit",
        value.length >= MAX_MESSAGE_LENGTH - 40
      );
    }
    submitBtn.disabled = trimmedLength < MIN_MESSAGE_LENGTH;
  }

  textarea.addEventListener("input", function () {
    var start = textarea.selectionStart;
    var before = textarea.value;
    var filtered = filterAllowedChars(before);
    if (filtered !== before) {
      var removedBefore =
        before.slice(0, start).length -
        filterAllowedChars(before.slice(0, start)).length;
      textarea.value = filtered;
      var newPos = Math.max(0, start - removedBefore);
      textarea.setSelectionRange(newPos, newPos);
    }
    updateSendState();
  });

  updateSendState();
  textarea.focus();

  titleEl.textContent = titles[type];
  typeInput.value = type;
  document.title = "Homeyko - " + titles[type];

  // Skrzynka (position: fixed) w spoczynku musi zawsze zaczynać się
  // poniżej karty z wiadomością, na każdej wysokości ekranu. Jeśli się
  // nie mieści, ma spokojnie wystawać poza dół ekranu (to tylko dekoracja)
  // - nigdy nie zmniejszamy jej po to, żeby się zmieściła, i nigdy nie
  // pozwalamy jej wejść nad kartę. `position: fixed` samo w sobie nie
  // dokłada scrolla, więc wystawanie poza viewport jest bezpieczne.
  var MAILBOX_GAP_ABOVE = 48;

  function syncMailboxPosition() {
    // Nad grafiką skrzynki w tym samym kontenerze (position: fixed) jest
    // jeszcze serce/X i komunikat, więc mierzymy realny odstęp między
    // górą kontenera a górą samej grafiki, żeby to grafika, nie kontener,
    // lądowała dokładnie pod kartą.
    var containerTop = mailbox.getBoundingClientRect().top;
    var bodyTop = mailboxBody.getBoundingClientRect().top;
    var extraAbove = bodyTop - containerTop;
    var cardBottom = card.getBoundingClientRect().bottom;
    var desiredTop = cardBottom + MAILBOX_GAP_ABOVE - extraAbove;
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
    mailboxResult.classList.toggle("is-limited", isLimited);

    var sequence = flyCardIntoMailbox()
      .then(function () {
        mailbox.classList.add("is-bounce");
        wait(500).then(function () {
          mailbox.classList.remove("is-bounce");
        });
        return wait(150);
      })
      .then(function () {
        // Skrzynka spełniła swoją rolę - odjeżdża w dół i znika, żeby nie
        // zostawać na ekranie z podziękowaniem.
        mailbox.classList.add("is-leaving");
        return wait(300);
      })
      .then(function () {
        mailboxMessage.textContent = text;
        statusEl.textContent = text;
        statusEl.className = isLimited
          ? "kontakt-status kontakt-status--error"
          : "kontakt-status";
        mailboxResult.classList.add("is-done");
      });

    // Po udanym wysłaniu ekran z serduszkiem zostaje już na stałe (nie
    // wraca do formularza) - nie ma po co wysyłać kolejnego pomysłu z tej
    // samej wizyty na stronie. Po przekroczeniu limitu wraca do formularza,
    // żeby dać spróbować ponownie później.
    if (isLimited) {
      sequence = sequence
        .then(function () {
          return wait(2400);
        })
        .then(function () {
          mailboxResult.classList.remove("is-done", "is-limited");
          mailbox.classList.remove("is-leaving");
          mailboxMessage.textContent = "";
          return wait(400);
        })
        .then(function () {
          form.classList.remove("is-sending");
          syncMailboxPosition();
        });
    }

    return sequence;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "kontakt-status";

    if (form.message.value.trim().length < MIN_MESSAGE_LENGTH) {
      statusEl.textContent = TOO_SHORT_MESSAGE;
      statusEl.className = "kontakt-status kontakt-status--error";
      return;
    }

    submitBtn.disabled = true;

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
        updateSendState();
        if (result.ok) return playResultAnimation("success");
        if (result.rateLimited) return playResultAnimation("limited");
        throw new Error(result.data.error || "Coś poszło nie tak");
      })
      .catch(function (err) {
        statusEl.textContent = err.message;
        statusEl.className = "kontakt-status kontakt-status--error";
        updateSendState();
      });
  });
})();
