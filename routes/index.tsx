import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import logo from "../assets/logotyp-bialy.png";
import flagBg from "../assets/flaga-polski.jpg";
import filipHero from "../assets/filip-impreza-transparent.png";

export default define.page(function Home() {
  return (
    <>
      <Head>
        <title>Homeyko — Filip Gałązka na przewodniczącego</title>
      </Head>
      <section class="hero">
        <div class="hero__bg" style={{ backgroundImage: `url(${flagBg})` }} />
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
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4.6.24 1.03.52 1.48.97.45.45.73.88.97 1.48.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43-.24.6-.52 1.03-.97 1.48-.45.45-.88.73-1.48.97-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.02 4.02 0 0 1-1.48-.97 4.02 4.02 0 0 1-.97-1.48c-.16-.46-.35-1.26-.4-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43.24-.6.52-1.03.97-1.48.45-.45.88-.73 1.48-.97.46-.16 1.26-.35 2.43-.4C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.5.01-4.73.07-.96.04-1.48.2-1.83.34-.46.18-.79.39-1.13.74-.35.34-.56.67-.74 1.13-.13.35-.3.87-.34 1.83C3.17 8.5 3.16 8.85 3.16 12s.01 3.5.07 4.73c.04.96.21 1.48.34 1.83.18.46.39.79.74 1.13.34.35.67.56 1.13.74.35.13.87.3 1.83.34 1.23.06 1.58.07 4.73.07s3.5-.01 4.73-.07c.96-.04 1.48-.21 1.83-.34.46-.18.79-.39 1.13-.74.35-.34.56-.67.74-1.13.13-.35.3-.87.34-1.83.06-1.23.07-1.58.07-4.73s-.01-3.5-.07-4.73c-.04-.96-.21-1.48-.34-1.83a3 3 0 0 0-.74-1.13 3 3 0 0 0-1.13-.74c-.35-.13-.87-.3-1.83-.34-1.23-.06-1.58-.07-4.73-.07Zm0 3.7a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6Zm0 1.8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm4.48-1.98a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
                  />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.46c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.9v2.18H7.99v2.96h2.47V21h3.04Z"
                  />
                </svg>
              </a>
            </div>

            <label for="nav-toggle" class="nav-toggle-btn" aria-label="Otwórz menu">
              <span></span>
              <span></span>
              <span></span>
            </label>
          </div>
        </header>

        <div class="hero__body">
          <div class="hero__image">
            <img src={filipHero} alt="Filip Gałązka" />
          </div>

          <div class="hero__content">
            <p class="hero__eyebrow">Wybory samorządowe 2026/2027</p>
            <h1 class="hero__title">
              <span>FILIP</span>
              <span class="hero__title-sub">na</span>
              <span class="hero__title-accent">PRZEWODNICZĄCEGO</span>
            </h1>
            <p class="hero__text">
              Kandydat partii Homeyko w wyborach na przewodniczącego samorządu
              uczniowskiego CXXII LO im. Ignacego Domeyki w Warszawie.
            </p>
            <div class="hero__cta">
              <a href="#program" class="btn btn--primary">Poznaj program</a>
              <a href="#kontakt" class="btn btn--ghost">Skontaktuj się</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});
