const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

const STORAGE_KEY = "revista_contenido_local_v1";
const fallbackContent = {
  editions: [
    {
      current: true,
      title: "Vol. 6 - 2026",
      description: "Vida estudiantil, proyectos y Sociedad Cientifica de Ingenieria Industrial.",
      pdf: "vol6-2026.pdf",
    },
    {
      current: false,
      title: "Vol. 5 - 2025",
      description: "Logistica, operaciones y experiencias de campo en industria boliviana.",
      pdf: "vol5-2025.pdf",
    },
    {
      current: false,
      title: "Vol. 4 - 2024",
      description: "Investigacion aplicada y articulos de innovacion estudiantil.",
      pdf: "vol4-2024.pdf",
    },
  ],
  videos: [
    {
      title: "Visita tecnica a planta",
      description: "Resumen de aprendizaje en procesos productivos.",
      file: "demo-visita.mp4",
    },
    {
      title: "Feria de proyectos",
      description: "Presentaciones de equipos de Ingenieria Industrial.",
      file: "demo-feria.mp4",
    },
  ],
};

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 24);
});

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

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  }
);

reveals.forEach((item) => observer.observe(item));

function observeNewReveals() {
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getBaseContent() {
  if (window.REVISTA_CONTENIDO && typeof window.REVISTA_CONTENIDO === "object") {
    return deepClone(window.REVISTA_CONTENIDO);
  }
  return deepClone(fallbackContent);
}

function getStoredContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveContent(content) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content, null, 2));
}

function getContent() {
  const stored = getStoredContent();
  if (stored) return stored;
  return getBaseContent();
}

function resolveVideoSrc(file) {
  if (!file) return "";
  if (file.startsWith("http://") || file.startsWith("https://") || file.startsWith("/")) {
    return file;
  }
  return `revistas/videos/${file}`;
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
        <p>Agrega items en revistas/contenido.js o desde el gestor local.</p>
      </article>
    `;
    observeNewReveals();
    return;
  }

  container.innerHTML = editions
    .map((edition, index) => {
      const delayClass = index % 3 === 1 ? " reveal-delay" : index % 3 === 2 ? " reveal-delay-2" : "";
      const pill = edition.current ? "Edicion actual" : "Archivo";
      const pdf = edition.pdf || "#";
      return `
        <article class="edition-card reveal${delayClass}">
          <p class="edition-pill">${esc(pill)}</p>
          <h3>${esc(edition.title || "Sin titulo")}</h3>
          <p>${esc(edition.description || "Sin descripcion")}</p>
          <a href="revistas/${esc(pdf)}" target="_blank" rel="noopener">Abrir PDF</a>
        </article>
      `;
    })
    .join("");

  observeNewReveals();
}

function renderVideos(content) {
  const container = document.getElementById("videosContainer");
  if (!container) return;

  const videos = Array.isArray(content.videos) ? content.videos : [];
  if (!videos.length) {
    container.innerHTML = `
      <article class="video-card reveal">
        <h3>No hay videos cargados</h3>
        <p>Usa el gestor para agregar videos publicados.</p>
      </article>
    `;
    observeNewReveals();
    return;
  }

  container.innerHTML = videos
    .map((video, index) => {
      const delayClass = index % 3 === 1 ? " reveal-delay" : index % 3 === 2 ? " reveal-delay-2" : "";
      const src = resolveVideoSrc(video.file || "");
      return `
        <article class="video-card reveal${delayClass}">
          <video controls preload="metadata">
            <source src="${esc(src)}" type="video/mp4" />
            Tu navegador no soporta video HTML5.
          </video>
          <h3>${esc(video.title || "Sin titulo")}</h3>
          <p>${esc(video.description || "Sin descripcion")}</p>
        </article>
      `;
    })
    .join("");

  observeNewReveals();
}

function showManagerMsg(message, ok = true) {
  const msg = document.getElementById("videoManagerMsg");
  if (!msg) return;
  msg.textContent = message;
  msg.style.color = ok ? "#0f766e" : "#b91c1c";
}

function downloadContentFile(content) {
  const payload = `window.REVISTA_CONTENIDO = ${JSON.stringify(content, null, 2)};\n`;
  const blob = new Blob([payload], { type: "text/javascript" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "contenido.js";
  link.click();
  URL.revokeObjectURL(link.href);
}

function wireVideoManager() {
  const addBtn = document.getElementById("addVideoBtn");
  const downloadBtn = document.getElementById("downloadContentBtn");
  const resetBtn = document.getElementById("resetContentBtn");

  if (!addBtn || !downloadBtn || !resetBtn) return;

  addBtn.addEventListener("click", () => {
    const titleInput = document.getElementById("videoTitleInput");
    const descInput = document.getElementById("videoDescInput");
    const fileInput = document.getElementById("videoFileInput");

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const file = fileInput.value.trim();

    if (!title || !description || !file) {
      showManagerMsg("Completa titulo, descripcion y archivo de video.", false);
      return;
    }

    const content = getContent();
    if (!Array.isArray(content.videos)) content.videos = [];

    content.videos.unshift({
      title,
      description,
      file,
    });

    saveContent(content);
    renderVideos(content);

    titleInput.value = "";
    descInput.value = "";
    fileInput.value = "";

    showManagerMsg("Video agregado. No olvides copiar el archivo en revistas/videos/", true);
  });

  downloadBtn.addEventListener("click", () => {
    const content = getContent();
    downloadContentFile(content);
    showManagerMsg("Se descargo contenido.js. Reemplazalo en revistas/contenido.js", true);
  });

  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    const baseContent = getBaseContent();
    renderEditions(baseContent);
    renderVideos(baseContent);
    showManagerMsg("Contenido restablecido a la version base.", true);
  });
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

const content = getContent();
renderEditions(content);
renderVideos(content);
wireVideoManager();
