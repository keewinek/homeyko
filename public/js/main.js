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

  var heroBg = document.getElementById("hero-bg");
  if (heroBg) {
    var raf = 0;
    function applyParallax() {
      raf = 0;
      var offset = window.scrollY * 0.35;
      heroBg.style.transform = "scale(1.12) translate3d(0, " + offset + "px, 0)";
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!raf) raf = requestAnimationFrame(applyParallax);
      },
      { passive: true }
    );
    applyParallax();
  }

  var heroTitle = document.querySelector(".hero__title");
  var heroCta = document.querySelector(".hero__cta .btn");
  // The icon is positioned absolutely (so the label can be truly
  // centered), which removes it from the button's natural flow width.
  // Reserve extra room for it so centered text never overlaps it.
  var ICON_RESERVE_PX = 44;
  if (heroTitle && heroCta) {
    function syncCtaWidth() {
      heroCta.style.width = "";
      var naturalWidth = heroCta.offsetWidth + ICON_RESERVE_PX;
      var targetWidth = Math.max(heroTitle.offsetWidth, naturalWidth);
      heroCta.style.width = targetWidth + "px";
    }
    syncCtaWidth();
    window.addEventListener("resize", syncCtaWidth);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncCtaWidth);
    }
  }
})();
