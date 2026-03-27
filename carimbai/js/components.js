async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  const res = await fetch(file);
  const html = await res.text();
  el.innerHTML = html;
}

// 🔥 carregar header e depois configurar
async function loadHeader(config) {
  await loadComponent("header", "/carimbai/components/header.html");

  // título
  if (config.title) {
    document.getElementById("header-title").textContent = config.title;
  }

  // descrição
  if (config.description) {
    document.getElementById("header-desc").textContent = config.description;
  }

  // conteúdo extra (botão, etc)
  if (config.extra) {
    document.getElementById("header-extra").innerHTML = config.extra;
  }
}

// carregar componentes
loadComponent("benefits", "/carimbai/components/benefits.html");
loadComponent("proof", "/carimbai/components/proof.html");
loadComponent("cta", "/carimbai/components/cta.html");
loadComponent("footer", "/carimbai/components/footer.html");
