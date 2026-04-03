import { state } from "../state/state.js";
import { formatar } from "../utils/format.js";
import { freteService } from "../services/freteService.js";
import { atualizarResumo } from "./ui.js";

export function renderFrete(opcoes) {
  const container = document.getElementById("frete-opcoes");
  container.innerHTML = "";

  const recomendada = freteService.escolherRecomendado(opcoes);

  opcoes.forEach(opcao => {
    const div = document.createElement("div");
    div.classList.add("frete-card");

    div.innerHTML = `
      <div class="frete-header">
        <span>${opcao.nome}</span>
        <span>${formatar(opcao.valor)}</span>
      </div>
      <div class="frete-empresa">
        ${opcao.empresa} • ${opcao.prazo} dias
      </div>
    `;

    div.addEventListener("click", () => {
      selecionarFrete(opcao);
    });

    container.appendChild(div);
  });

  selecionarFrete(recomendada);
}

export function selecionarFrete(opcao) {
  state.frete = opcao.valor;
  state.prazo = opcao.prazo;
  state.freteNome = opcao.nome;

  mostrarSelecionado(opcao);
  atualizarResumo();
}

function mostrarSelecionado(opcao) {
  const container = document.getElementById("frete-opcoes");

  container.innerHTML = `
    <div class="frete-selecionado">
      <div class="frete-selecionado-content">
        <div>
          <strong>${opcao.nome}</strong><br>
          ${opcao.empresa}
        </div>
        <div>
          ${formatar(opcao.valor)}<br>
          ${opcao.prazo} dias
        </div>
      </div>

      <button id="trocar-frete">Alterar opção</button>
    </div>
  `;

  document.getElementById("trocar-frete").addEventListener("click", () => {
    document.dispatchEvent(new Event("reabrirFrete"));
  });
}
