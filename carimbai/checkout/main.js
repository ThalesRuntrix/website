import { getProdutoById } from "./services/produto.js";
import { state } from "./state/state.js";
import { atualizarResumo } from "./ui/ui.js";
import { initEvents } from "./events/events.js";

async function init() {

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
  const id = getParam("id");
  
  const produto = await getProdutoById(id);

  state.produto = produto;
  state.precoBase = Number(produto.preco);

  document.getElementById("produto-nome").textContent = produto.nome;

  atualizarResumo();
  initEvents();
}

init();
