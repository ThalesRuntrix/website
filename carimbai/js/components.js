async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  const res = await fetch(file);
  const html = await res.text();
  el.innerHTML = html;
}

// HEADER
async function loadHeader(config = {}) {
  await loadComponent("header", "/carimbai/components/header.html");

  if (config.title) {
    document.getElementById("header-title").textContent =
      config.title;
  }

  if (config.description) {
    document.getElementById("header-desc").textContent =
      config.description;
  }

  if (config.extra) {
    document.getElementById("header-extra").innerHTML =
      config.extra;
  }
}

// componentes automáticos
loadComponent("benefits", "/carimbai/components/benefits.html");
loadComponent("proof", "/carimbai/components/proof.html");
loadComponent("cta", "/carimbai/components/cta.html");
loadComponent("footer", "/carimbai/components/footer.html");
