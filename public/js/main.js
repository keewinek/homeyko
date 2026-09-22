(function () {
  var navLinks = document.getElementById("nav-links");
  var openBtn = document.getElementById("nav-open");
  var closeBtn = document.getElementById("nav-close");

  function openNav() {
    navLinks.classList.add("is-open");
  }

  function closeNav() {
    navLinks.classList.remove("is-open");
  }

  if (openBtn) openBtn.addEventListener("click", openNav);
  if (closeBtn) closeBtn.addEventListener("click", closeNav);

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  /* Na telefonie zdarzenie `resize` leci przy każdym chowaniu i pokazywaniu
     paska adresu, czyli praktycznie przez cały czas przewijania. Gdyby
     przeliczać wtedy layout, przeglądarka gubiłaby pozycję scrolla. Dlatego
     przeliczamy tylko wtedy, gdy realnie zmieniła się szerokość okna
     (obrót telefonu, zmiana rozmiaru okna na desktopie). */
  var lastWidth = window.innerWidth;
  var widthCallbacks = [];
  var widthRaf = 0;

  function onWidthChange(callback) {
    widthCallbacks.push(callback);
    callback();
  }

  function runWidthCallbacks() {
    widthRaf = 0;
    widthCallbacks.forEach(function (callback) {
      callback();
    });
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    if (!widthRaf) widthRaf = requestAnimationFrame(runWidthCallbacks);
  });

  window.addEventListener("orientationchange", function () {
    lastWidth = window.innerWidth;
    if (!widthRaf) widthRaf = requestAnimationFrame(runWidthCallbacks);
  });

  var heroNav = document.querySelector(".hero__nav");
  if (heroNav) {
    var navScrolled = null;
    function syncNavBackground() {
      var scrolled = window.scrollY > 10;
      if (scrolled === navScrolled) return;
      navScrolled = scrolled;
      heroNav.classList.toggle("hero__nav--scrolled", scrolled);
    }
    window.addEventListener("scroll", syncNavBackground, { passive: true });
    syncNavBackground();
  }

  var heroBg = document.getElementById("hero-bg");
  var heroSection = document.querySelector(".hero");
  if (heroBg && heroSection) {
    var raf = 0;
    var heroVisible = true;
    function applyParallax() {
      raf = 0;
      var offset = window.scrollY * 0.35;
      heroBg.style.transform = "scale(1.12) translate3d(0, " + offset + "px, 0)";
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!heroVisible) return;
        if (!raf) raf = requestAnimationFrame(applyParallax);
      },
      { passive: true }
    );
    applyParallax();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          heroVisible = entries[0].isIntersecting;
        },
        { rootMargin: "20% 0px" }
      ).observe(heroSection);
    }
  }

  /* Szerokość przycisku CTA dopasowana do napisu w hero. Zmienia tylko
     szerokość elementu wewnątrz hero, więc nie rusza wysokości dokumentu. */
  var heroTitle = document.querySelector(".hero__title");
  var heroCta = document.querySelector(".hero__cta .btn");
  if (heroTitle && heroCta) {
    function syncCtaWidth() {
      heroCta.style.width = "";
      var targetWidth = Math.max(heroTitle.offsetWidth, heroCta.offsetWidth);
      heroCta.style.width = targetWidth + "px";
    }
    onWidthChange(syncCtaWidth);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncCtaWidth);
    }
  }

  /* ----------------------------------------------------------------- */
  /* Animacje przy przewijaniu                                          */
  /* ----------------------------------------------------------------- */

  /* Atrybuty i podział tekstu na słowa dokładamy z JS-a, więc bez JS-a
     albo przy wyłączonych animacjach strona zostaje w pełni widoczna. */
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealTargets = [
      { selector: ".program__title", mode: "" },
      { selector: ".program__item", mode: "" },
      { selector: ".program__signature", mode: "zoom" },
      { selector: ".dlaczego__title", mode: "" },
      { selector: ".dlaczego__media", mode: "zoom" },
      { selector: ".zespol__title", mode: "" },
      { selector: ".zespol__group-photo", mode: "zoom" },
      { selector: ".zespol__member", mode: "zoom" },
      { selector: ".kontakt-cta__title", mode: "" },
      { selector: ".kontakt-cta__ig", mode: "" },
      { selector: ".kontakt-cta__ask", mode: "" },
      { selector: ".hashtag-banner", mode: "zoom" }
    ];

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        var shown = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          /* Elementy wjeżdżające w tej samej klatce (np. kafelki sztabu)
             pojawiają się kaskadowo, jeden po drugim. */
          entry.target.style.setProperty("--reveal-delay", shown * 0.08 + "s");
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
          shown += 1;
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );

    revealTargets.forEach(function (target) {
      document.querySelectorAll(target.selector).forEach(function (el) {
        el.setAttribute("data-reveal", target.mode);
        revealObserver.observe(el);
      });
    });

    /* Długie akapity rozjaśniają się słowo po słowie, ale tylko raz i zaraz
       po wejściu w kadr, żeby czytanie nie zależało od przewijania. */
    function splitIntoWords(el) {
      var words = el.textContent.trim().split(/\s+/);
      var spans = [];
      el.textContent = "";
      words.forEach(function (word, index) {
        var span = document.createElement("span");
        span.className = "reveal-text__word";
        span.textContent = word;
        el.appendChild(span);
        if (index < words.length - 1) {
          el.appendChild(document.createTextNode(" "));
        }
        spans.push(span);
      });
      el.classList.add("reveal-text");
      return spans;
    }

    var textObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var words = entry.target.querySelectorAll(".reveal-text__word");
          /* Całe przejście trwa ok. 0,9 s niezależnie od długości akapitu. */
          var step = Math.min(0.03, 0.9 / Math.max(words.length, 1));
          words.forEach(function (word, index) {
            word.style.setProperty("--word-delay", (index * step).toFixed(3) + "s");
          });
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0 }
    );

    document
      .querySelectorAll(".dlaczego__text, .zespol__intro, [data-reveal-text]")
      .forEach(function (el) {
        splitIntoWords(el);
        textObserver.observe(el);
      });
  }
})();
