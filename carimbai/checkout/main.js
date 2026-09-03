import { state } from "./state/state.js";

import { formUI } from "./ui/formUI.js";

import { initEvents } from "./events/events.js";

import { carrinhoService } from "./services/carrinhoService.js";


async function init() {

  try {

    // =======================================================
    // CARREGA CARRINHO
    // =======================================================

    const carrinho =
      await carrinhoService.carregar();


    // =======================================================
    // RENDERIZA CARRINHO
    // =======================================================

    formUI.renderizarCarrinho(
      carrinho
    );


    // =======================================================
    // RESUMO INICIAL
    // =======================================================

    formUI.atualizarResumo();


    // =======================================================
    // EVENTOS
    // =======================================================

    initEvents();

  }

  catch (error) {

    console.error(
      "Erro ao iniciar checkout:",
      error
    );


    document.getElementById(
      "pedido-form"
    ).innerHTML = `
      <div class="checkout-erro">

        <h2>
          Não foi possível carregar seu carrinho
        </h2>

        <p>
          ${error.message}
        </p>

        <a
          href="/carimbai/carrinho/index.html"
          class="btn-primary">
          Voltar para o carrinho
        </a>

      </div>
    `;
  }
}


init();
/*import { getProdutoById } from "./services/produto.js";
import { state } from "./state/state.js";
import { formUI } from "./ui/formUI.js";
import { initEvents } from "./events/events.js";

async function init() {

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
  const id = getParam("id");
  const variacao = getParam("variacao");
  
  const produto = await getProdutoById(id);

  state.produto = produto;
  state.precoBase = Number(produto.preco);

  document.getElementById("produto-nome").textContent = produto.nome;
  document.getElementById("variacao").textContent =
    variacao ? ` (${variacao})` : "";

  formUI.atualizarResumo();
  initEvents();
}

init();
*/