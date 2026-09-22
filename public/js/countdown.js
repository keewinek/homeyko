(function () {
  // Start kampanii: 23 września 2026, północ czasu polskiego (CEST = UTC+2).
  // Jawna strefa w ISO, żeby nie liczyć "lokalnej północy" w strefie
  // przeglądarki odwiedzającego zamiast polskiej.
  var LAUNCH_AT_DEFAULT = "2026-09-23T00:00:00+02:00";

  function getLaunchTime() {
    // Do testów: ?launch=2026-09-18T12:00:00%2B02:00 w URL nadpisuje cel,
    // bez ruszania tej stałej w kodzie (żeby nikt nie zapomniał jej cofnąć).
    var override = new URLSearchParams(window.location.search).get("launch");
    var parsed = new Date(override || LAUNCH_AT_DEFAULT);
    return isNaN(parsed.getTime()) ? new Date(LAUNCH_AT_DEFAULT) : parsed;
  }

  var launchAt = getLaunchTime();
  var liveEl = document.getElementById("cd-live");
  var doneEl = document.getElementById("cd-done");
  var els = {
    hours: document.getElementById("cd-hours"),
    minutes: document.getElementById("cd-minutes"),
    seconds: document.getElementById("cd-seconds"),
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  var timer = null;
  var reloadKey = "homeyko-countdown-reloaded";

  function showDone() {
    if (liveEl) liveEl.hidden = true;
    if (doneEl) doneEl.hidden = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    // Jednorazowe odświeżenie: jeśli w międzyczasie strona została już
    // podmieniona na właściwą treść kampanii, pokaże ją bez ręcznego F5.
    // Flaga w sessionStorage chroni przed pętlą odświeżeń, gdyby strona
    // wciąż była tym samym licznikiem.
    try {
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, "1");
        setTimeout(function () {
          window.location.reload();
        }, 3000);
      }
    } catch (e) {
      // sessionStorage niedostępny (np. tryb prywatny) - trudno, zostaje
      // statyczny komunikat, użytkownik odświeży sam.
    }
  }

  function render() {
    var diff = launchAt.getTime() - Date.now();
    if (diff <= 0) {
      showDone();
      return;
    }
    var totalSeconds = Math.floor(diff / 1000);
    // Bez jednostki "dni": godziny liczone od całości, żeby przy odliczaniu
    // dłuższym niż doba nie zawijały się do zera co 24 godziny.
    if (els.hours) els.hours.textContent = pad(Math.floor(totalSeconds / 3600));
    if (els.minutes) els.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    if (els.seconds) els.seconds.textContent = pad(totalSeconds % 60);
  }

  // Przeliczenie od razu przy powrocie karty na pierwszy plan: interval w
  // tle bywa dławiony przez przeglądarkę, więc bez tego licznik mógłby
  // "zawiesić się" na starej wartości aż do kolejnego naturalnego ticka.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") render();
  });
  window.addEventListener("focus", render);
  window.addEventListener("pageshow", render);

  render();
  timer = setInterval(render, 1000);
})();
