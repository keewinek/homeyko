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
})();
