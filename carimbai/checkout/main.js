import { getProdutobyId } from "./services/produto.js";
import { state } from "./state/state.js";
import { atualizarResumo } from "./ui/ui.js";
import { initEvents } from "./events/events.js";

async function init() {
  const id = new URLSearchParams(window.location.search).get("id");

  const produto = await getProdutobyId(id);

  state.produto = produto;
  state.precoBase = Number(produto.preco);

  document.getElementById("produto-nome").textContent = produto.nome;

  atualizarResumo();
  initEvents();
}

init();
