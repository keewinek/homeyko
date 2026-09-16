import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import ParallaxBg from "../islands/ParallaxBg.tsx";
import logo from "../assets/logotyp-bialy.png";
import flagBg from "../assets/tlo-czerwone.jpg";
import filipHero from "../assets/filip-impreza-transparent.png";

export default define.page(function Home() {
  return (
    <>
      <Head>
        <title>Homeyko — Filip Gałązka na przewodniczącego</title>
      </Head>
      <section class="hero">
        <ParallaxBg src={flagBg} class="hero__bg" />
        <div class="hero__overlay" />

        <input type="checkbox" id="nav-toggle" class="nav-toggle" hidden />

        <header class="hero__nav">
          <a href="#" class="hero__brand">
            <img src={logo} alt="Homeyko" class="hero__brand-logo" />
          </a>

          <nav class="hero__links" aria-label="Menu główne">
            <div class="hero__links-top">
              <img src={logo} alt="Homeyko" class="hero__links-logo" />
              <label
                for="nav-toggle"
                class="nav-close-btn"
                aria-label="Zamknij menu"
              >
                <svg
                  viewBox="0 0 320 512"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M310.6 361.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L160 301.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L114.7 256 9.4 150.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 210.7 265.4 105.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L205.3 256 310.6 361.4z"
                  />
                </svg>
              </label>
            </div>
            <a href="#program">Program</a>
            <a href="#zespol">Zespół</a>
            <a href="#galeria">Galeria</a>
            <a href="#kontakt">Kontakt</a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              class="hero__links-instagram"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                aria-hidden="true"
              >
                <rect
                  x="2.2"
                  y="2.2"
                  width="19.6"
                  height="19.6"
                  rx="6.2"
                  fill="none"
                  stroke="#fff"
                  stroke-width="2.3"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="5.1"
                  fill="none"
                  stroke="#fff"
                  stroke-width="2.3"
                />
                <circle cx="17.6" cy="6.4" r="1.5" fill="#fff" />
              </svg>
            </a>
          </nav>

          <div class="hero__nav-right">
            <div class="hero__socials">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  aria-hidden="true"
                >
                  <rect
                    x="2.2"
                    y="2.2"
                    width="19.6"
                    height="19.6"
                    rx="6.2"
                    fill="none"
                    stroke="#fff"
                    stroke-width="2.3"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="5.1"
                    fill="none"
                    stroke="#fff"
                    stroke-width="2.3"
                  />
                  <circle cx="17.6" cy="6.4" r="1.5" fill="#fff" />
                </svg>
              </a>
            </div>

            <label
              for="nav-toggle"
              class="nav-toggle-btn"
              aria-label="Otwórz menu"
            >
              <svg
                viewBox="0 0 448 512"
                width="20"
                height="20"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"
                />
              </svg>
            </label>
          </div>
        </header>

        <div class="hero__image">
          <img src={filipHero} alt="Filip Gałązka" />
        </div>
        <div class="hero__scrim" />

        <div class="hero__body">
          <div class="hero__content">
            <h1 class="hero__title">
              <span class="hero__title-sub">Filip</span>
              <span class="hero__title-main">
                <svg
                  class="hero__checkbox"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <path d="M19 13 Q10 14 10 23 L8 76 Q8 87 19 88 L79 90 Q90 90 91 79 L93 22 Q93 11 82 12 Z" />
                  <path d="M26 27 Q50 53 74 76" />
                  <path d="M75 26 Q49 52 25 75" />
                </svg>
                Gałązka
              </span>
            </h1>
            <p class="hero__text">Twój kandydat na przewodniczącego</p>
          </div>
        </div>
      </section>

      <section class="program" id="program">
        <div class="program__inner">
          <p class="program__eyebrow">Nasz plan działania</p>
          <h2 class="program__title">Postanowienia sztabu</h2>

          <div class="program__grid">
            <article class="program__card">
              <span class="program__number">01</span>
              <svg
                class="program__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="2.5" y="4" width="15" height="16" rx="1.5" />
                <rect x="5" y="7" width="9" height="8" rx="0.5" />
                <circle cx="19" cy="9" r="0.9" fill="currentColor" stroke="none" />
                <circle cx="19" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
                <line x1="16.5" y1="17" x2="16.5" y2="20" />
              </svg>
              <h3 class="program__card-title">Mikrofalówka w klubiku</h3>
            </article>

            <article class="program__card">
              <span class="program__number">02</span>
              <svg
                class="program__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="3" y="4.5" width="18" height="16" rx="1.5" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="7.5" y1="2.5" x2="7.5" y2="6.5" />
                <line x1="16.5" y1="2.5" x2="16.5" y2="6.5" />
                <path d="M8 14.5c1-1.2 2-1.2 3 0s2 1.2 3 0 2-1.2 3 0" />
                <path d="M8 18c1-1.2 2-1.2 3 0s2 1.2 3 0 2-1.2 3 0" />
              </svg>
              <h3 class="program__card-title">
                Dwie imprezy w ciągu roku szkolnego
              </h3>
            </article>

            <article class="program__card">
              <span class="program__number">03</span>
              <svg
                class="program__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 13a8 8 0 0 1 16 0" />
                <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
                <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
              </svg>
              <h3 class="program__card-title">Silent disco</h3>
            </article>

            <article class="program__card">
              <span class="program__number">04</span>
              <svg
                class="program__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 3c3 3.6 5 6.8 5 9.5a5 5 0 0 1-10 0C7 9.8 9 6.6 12 3Z" />
                <path d="M9.3 13.8c0 1.3 1 2.4 2.3 2.5" />
              </svg>
              <h3 class="program__card-title">Dystrybutor wody pitnej</h3>
            </article>
          </div>
        </div>
      </section>
    </>
  );
});
