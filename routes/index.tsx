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
            <a href="#program">Program</a>
            <a href="#zespol">Zespół</a>
            <a href="#galeria">Galeria</a>
            <a href="#kontakt">Kontakt</a>
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
    </>
  );
});
