const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

window.addEventListener("scroll", () => {
  if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 24);
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
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

function observeNewReveals() {
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
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

function handleSubscribe() {
  const input = document.getElementById("emailInput");
  const msg = document.getElementById("subscribeMsg");
  const email = input.value.trim();

  if (!email || !email.includes("@") || !email.includes(".")) {
    msg.textContent = "Por favor ingresa un correo valido.";
    msg.style.color = "#b91c1c";
    return;
  }

  msg.textContent = "Gracias. Te contactaremos para la proxima edicion.";
  msg.style.color = "#0f766e";
  input.value = "";
}

window.handleSubscribe = handleSubscribe;

renderEditions(getBaseContent());
