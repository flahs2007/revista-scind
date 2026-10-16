document.addEventListener("DOMContentLoaded", function () {

  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  /* ---- Navbar scroll ---- */
  let pendingNavUpdate = false;
  function updateNavbarScrolled() {
    pendingNavUpdate = false;
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", () => {
    if (pendingNavUpdate) return;
    pendingNavUpdate = true;
    requestAnimationFrame(updateNavbarScrolled);
  }, { passive: true });
  updateNavbarScrolled();

  /* ---- Smooth scroll ---- */
  let activeScrollAnimation = null;

  function getAnchorTarget(hash) {
    if (!hash || hash === "#") return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return document.getElementById(hash.slice(1)); }
  }

  function scrollToSection(target) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headerOffset = navbar ? navbar.offsetHeight + 10 : 0;
    const startY = window.scrollY;
    const targetY = Math.max(0, target.getBoundingClientRect().top + startY - headerOffset);
    const distance = targetY - startY;
    if (activeScrollAnimation) cancelAnimationFrame(activeScrollAnimation);
    if (reduceMotion || Math.abs(distance) < 12) {
      window.scrollTo(0, targetY);
      updateNavbarScrolled();
      return;
    }
    const duration = Math.min(340, Math.max(180, Math.abs(distance) * 0.18));
    const startedAt = performance.now();
    function step(now) {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      window.scrollTo(0, startY + distance * eased);
      if (elapsed < 1) {
        activeScrollAnimation = requestAnimationFrame(step);
      } else {
        activeScrollAnimation = null;
        updateNavbarScrolled();
      }
    }
    activeScrollAnimation = requestAnimationFrame(step);
  }

  function cancelProgrammaticScroll() {
    if (!activeScrollAnimation) return;
    cancelAnimationFrame(activeScrollAnimation);
    activeScrollAnimation = null;
  }
  window.addEventListener("wheel", cancelProgrammaticScroll, { passive: true });
  window.addEventListener("touchstart", cancelProgrammaticScroll, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = getAnchorTarget(link.hash);
      if (!target) return;
      event.preventDefault();
      mobileMenu?.classList.remove("open");
      hamburger?.setAttribute("aria-expanded", "false");
      history.pushState(null, "", link.hash);
      scrollToSection(target);
    });
  });

  /* ---- Hamburger menu ---- */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Article filters ---- */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const articleCards = document.querySelectorAll(".article-card");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      articleCards.forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.cat === filter;
        card.style.display = shouldShow ? "block" : "none";
      });
    });
  });

  /* ---- Reveal on scroll ---- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
  );

  function observeNewReveals() {
    document.querySelectorAll(".reveal").forEach((item) => {
      if (item.dataset.observed === "1") return;
      item.dataset.observed = "1";
      observer.observe(item);
    });
  }
  observeNewReveals();

  /* ---- Biblioteca de cómics: un solo PDF activo para carga rápida ---- */
  const comicReader = document.getElementById("comicPdfReader");
  const comicReaderTitle = document.getElementById("comic-reader-title");
  const comicReaderStatus = document.getElementById("comicReaderStatus");
  const comicPdfOpen = document.getElementById("comicPdfOpen");
  const comicViewer = document.querySelector(".comic-viewer-box");
  const comicButtons = document.querySelectorAll(".comic-select-btn");

  function selectComic(button, shouldScroll) {
    if (!comicReader || !button) return;
    const pdf = button.dataset.comicPdf;
    const title = button.dataset.comicTitle;
    if (!pdf || !title) return;

    comicButtons.forEach((item) => {
      const selected = item === button;
      item.setAttribute("aria-pressed", String(selected));
      item.closest(".comic-library-card")?.classList.toggle("is-selected", selected);
    });

    comicReaderTitle.textContent = title;
    comicReader.title = `Cómic ${title}`;
    comicPdfOpen.href = pdf;

    if (comicReader.dataset.pdf !== pdf) {
      comicReaderStatus.textContent = "Cargando cómic...";
      comicReader.dataset.pdf = pdf;
      comicReader.src = `${pdf}#view=FitH`;
    } else {
      comicReaderStatus.textContent = "4 páginas";
    }

    if (shouldScroll && comicViewer) scrollToSection(comicViewer);
  }

  if (comicReader) {
    comicReader.dataset.pdf = "revistas/entrevista-paola-alvarez.pdf";
    comicReader.addEventListener("load", () => {
      comicReaderStatus.textContent = "4 páginas";
    });
  }

  comicButtons.forEach((button) => {
    button.addEventListener("click", () => selectComic(button, true));
  });

  /* ---- Editions renderer ---- */
  function esc(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getBaseContent() {
    if (window.REVISTA_CONTENIDO && typeof window.REVISTA_CONTENIDO === "object") {
      return window.REVISTA_CONTENIDO;
    }
    return {
      editions: [
        {
          current: true,
          title: "Vol. 6 - 2026",
          description: "Vida estudiantil, proyectos y Sociedad Científica de Ingeniería Industrial.",
          pdf: "vol6-2026.pdf"
        }
      ]
    };
  }

  function renderEditions(content) {
    const container = document.getElementById("editionsContainer");
    if (!container) return;
    const editions = Array.isArray(content.editions) ? content.editions : [];
    if (!editions.length) {
      container.innerHTML = `
        <article class="edition-card reveal">
          <p class="edition-pill">Sin datos</p>
          <h3>No hay ediciones cargadas</h3>
          <p>Agrega items en revistas/contenido.js.</p>
        </article>`;
      observeNewReveals();
      return;
    }
    container.innerHTML = editions
      .map((edition, index) => {
        const delayClass = index % 3 === 1 ? " reveal-delay" : index % 3 === 2 ? " reveal-delay-2" : "";
        const pill = edition.current ? "Edicion actual" : "Archivo";
        return `
          <article class="edition-card reveal${delayClass}">
            <p class="edition-pill">${esc(pill)}</p>
            <h3>${esc(edition.title || "Sin titulo")}</h3>
            <p>${esc(edition.description || "Sin descripcion")}</p>
            <a href="revistas/${esc(edition.pdf || "#")}" target="_blank" rel="noopener">Abrir PDF</a>
          </article>`;
      })
      .join("");
    observeNewReveals();
  }

  renderEditions(getBaseContent());

}); // fin DOMContentLoaded
