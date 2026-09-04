const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

// Keep scroll work cheap: schedule a single update per animation frame.
let pendingNavUpdate = false;
function updateNavbarScrolled() {
  pendingNavUpdate = false;
  if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 24);
}

window.addEventListener(
  "scroll",
  () => {
    if (pendingNavUpdate) return;
    pendingNavUpdate = true;
    requestAnimationFrame(updateNavbarScrolled);
  },
  { passive: true }
);

// Initialize state on load.
updateNavbarScrolled();

let activeScrollAnimation = null;

function getAnchorTarget(hash) {
  if (!hash || hash === "#") return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return document.getElementById(hash.slice(1));
  }
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

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      // Once visible, we don't need to keep observing this node.
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

function observeNewReveals() {
  document.querySelectorAll(".reveal").forEach((item) => {
    // Prevent repeatedly observing the same node (can add overhead on re-renders).
    if (item.dataset.observed === "1") return;
    item.dataset.observed = "1";
    observer.observe(item);
  });
}

observeNewReveals();

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
        description: "Vida estudiantil, proyectos y Sociedad Cientifica de Ingenieria Industrial.",
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
      </article>
    `;
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
        </article>
      `;
    })
    .join("");

  observeNewReveals();
}

renderEditions(getBaseContent());

/* ==========================================================================
   VISOR INTERACTIVO DE CÓMIC (PDF.js)
   ========================================================================== */
function initComicViewer() {
  const pdfUrl = "revistas/entrevista-scind.pdf";
  const canvas = document.getElementById("pdfCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const loadingEl = document.getElementById("comicLoading");
  const singleViewEl = document.getElementById("comicSingleView");
  const stripViewEl = document.getElementById("comicStripView");
  const currentPageEl = document.getElementById("currentPageNum");
  const totalPagesEl = document.getElementById("totalPagesNum");
  const zoomStatusEl = document.getElementById("zoomStatus");
  const btnPrev = document.getElementById("btnPrevPage");
  const btnNext = document.getElementById("btnNextPage");
  const btnZoomIn = document.getElementById("btnZoomIn");
  const btnZoomOut = document.getElementById("btnZoomOut");
  const btnToggleMode = document.getElementById("btnToggleMode");
  const thumbButtons = document.querySelectorAll(".thumb-btn");

  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  let scale = 1.25;
  let isStripMode = false;

  if (typeof window.pdfjsLib === "undefined") {
    if (loadingEl) {
      loadingEl.innerHTML = `<p>Para ver el comic completo, puedes <a href="${pdfUrl}" target="_blank" style="color:var(--comic-yellow); text-decoration:underline;">abrir el PDF aqui</a>.</p>`;
    }
    return;
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  function updateThumbUI(num) {
    thumbButtons.forEach((btn) => {
      const p = parseInt(btn.dataset.page, 10);
      btn.classList.toggle("active", p === num);
    });
  }

  function renderPage(num) {
    pageRendering = true;
    if (loadingEl) loadingEl.style.display = "none";
    if (singleViewEl) singleViewEl.style.display = "flex";

    pdfDoc.getPage(num).then((page) => {
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale });

      canvas.height = viewport.height * dpr;
      canvas.width = viewport.width * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const renderContext = {
        canvasContext: ctx,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    if (currentPageEl) currentPageEl.textContent = num;
    if (zoomStatusEl) zoomStatusEl.textContent = `${Math.round((scale / 1.25) * 100)}%`;
    updateThumbUI(num);
  }

  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  function prevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
  }

  function nextPage() {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
  }

  function renderStripView() {
    if (!stripViewEl || !pdfDoc) return;
    stripViewEl.innerHTML = "";
    if (loadingEl) loadingEl.style.display = "none";

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const pageNumLocal = i;
      const pageCanvas = document.createElement("canvas");
      pageCanvas.className = "comic-strip-page";
      pageCanvas.id = `stripPage-${pageNumLocal}`;
      stripViewEl.appendChild(pageCanvas);

      pdfDoc.getPage(pageNumLocal).then((page) => {
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale });
        const pctx = pageCanvas.getContext("2d");

        pageCanvas.height = viewport.height * dpr;
        pageCanvas.width = viewport.width * dpr;
        pageCanvas.style.width = `${viewport.width}px`;
        pageCanvas.style.height = `${viewport.height}px`;

        const renderContext = {
          canvasContext: pctx,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
          viewport: viewport
        };
        page.render(renderContext);
      });
    }
  }

  btnPrev?.addEventListener("click", () => {
    if (isStripMode) toggleMode();
    prevPage();
  });

  btnNext?.addEventListener("click", () => {
    if (isStripMode) toggleMode();
    nextPage();
  });

  btnZoomIn?.addEventListener("click", () => {
    scale = Math.min(2.5, scale + 0.2);
    if (isStripMode) {
      renderStripView();
    } else {
      queueRenderPage(pageNum);
    }
  });

  btnZoomOut?.addEventListener("click", () => {
    scale = Math.max(0.7, scale - 0.2);
    if (isStripMode) {
      renderStripView();
    } else {
      queueRenderPage(pageNum);
    }
  });

  function toggleMode() {
    isStripMode = !isStripMode;
    if (isStripMode) {
      if (singleViewEl) singleViewEl.style.display = "none";
      if (stripViewEl) stripViewEl.style.display = "flex";
      if (btnToggleMode) btnToggleMode.textContent = "📄 Modo Pagina";
      renderStripView();
    } else {
      if (stripViewEl) stripViewEl.style.display = "none";
      if (singleViewEl) singleViewEl.style.display = "flex";
      if (btnToggleMode) btnToggleMode.textContent = "📜 Modo Tira";
      queueRenderPage(pageNum);
    }
  }

  btnToggleMode?.addEventListener("click", toggleMode);

  thumbButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetPage = parseInt(btn.dataset.page, 10);
      if (isNaN(targetPage)) return;
      if (isStripMode) toggleMode();
      pageNum = targetPage;
      queueRenderPage(pageNum);
    });
  });

  // Carga inicial del documento
  window.pdfjsLib.getDocument(pdfUrl).promise.then(
    (doc) => {
      pdfDoc = doc;
      if (totalPagesEl) totalPagesEl.textContent = pdfDoc.numPages;
      renderPage(pageNum);
    },
    () => {
      if (loadingEl) {
        loadingEl.innerHTML = `<p>No se pudo inicializar el visor automatico. Puedes <a href="${pdfUrl}" target="_blank" style="color:var(--comic-yellow); text-decoration:underline;">abrir el PDF directamente aqui</a>.</p>`;
      }
    }
  );
}

// Inicializar visor de cómic tras la carga
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initComicViewer);
} else {
  initComicViewer();
}
