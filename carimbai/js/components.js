async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  const res = await fetch(file);
  const html = await res.text();
  el.innerHTML = html;
}

// carregar componentes
loadComponent("header", "/carimbai/components/header.html");
loadComponent("footer", "/carimbai/components/footer.html");
