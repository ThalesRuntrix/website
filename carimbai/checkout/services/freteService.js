import { api } from "../api/api.js";
import { state } from "../state/state.js";
import { formatar, getParam } from "../utils/format.js";

export const freteService =  {
  
  // buscar produto
  async getProdutoById() {
    const produtoId = getParam("id");

    try {

      const res = api.getProduto(produtoId);
      const produto = await res.json();

      produtoGlobal = produto;

      // 🔥 render nome
      document.getElementById("produto-nome").textContent = produto.nome;

      // 🔥 salva preço base
      state.precoBase = Number(produto.preco);

      freteService.atualizarResumo();

    } catch (error) {
      console.error("Erro ao buscar produto:", error);
    }
  },

  setDeliveryData(entrega) {
    if (entrega !== "frete") {
      state.frete = 0;
      state.prazo = 0;
      state.freteNome = "";
    }
  },

  // tentar calcular frete
  tentarCalcularFrete() {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");
    const entrega = document.getElementById("entrega").value;

    if (cep.length === 8 && entrega === "frete") {
      freteService.calcularFrete(cep);
    }
  },

  // calcular frete
  async calcularFrete(cep) {
    try {

      const res = api.calcularFrete(cep);

      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) throw new Error();

      freteService.mostrarFrete(data);

    } catch (err) {
      console.error("Erro no serviço de cálculo de frete: ", err);

      // 🔥 FALLBACK
      const fallback = [
        {
          id: 1,
          nome: "Entrega Econômica",
          empresa: "Carimbai",
          valor: 15,
          prazo: 5
        },
        {
          id: 2,
          nome: "Entrega Rápida",
          empresa: "Carimbai",
          valor: 25,
          prazo: 3
        }
      ];

    freteService.mostrarFrete(fallback);    
    }

   freteService.atualizarResumo();
  },

  // selecionar frete
  selecionarFrete() {
    const selecionado = document.querySelector('input[name="frete"]:checked');

    if (!selecionado) return;

    state.frete = Number(selecionado.value);
    state.prazo = Number(selecionado.dataset.prazo);
    state.freteNome = selecionado.dataset.nome;

    freteService.atualizarResumo();
  },

  atualizarResumo() {
  
    const preco = state.precoBase; 

    const entrega = document.getElementById("entrega").value;
    const pagamento = document.getElementById("pagamento").value;

    let frete = entrega === "frete" ? state.frete : 0;
    let desconto = pagamento === "pix" ? preco * 0.05 : 0;
    
    const totalResumo = preco + frete - desconto;

    state.total = totalResumo;

    document.getElementById("resumo-produto").textContent = formatar(preco);
    document.getElementById("resumo-frete").textContent = formatar(frete);
    document.getElementById("resumo-desconto").textContent = `- ${formatar(desconto)}`;
    document.getElementById("resumo-total").textContent = formatar(totalResumo);
        
  },

  // mostrar opões de frete
  mostrarFrete(opcoes) {
    const container = document.getElementById("frete-opcoes");
    const box = document.getElementById("frete-info");

    container.innerHTML = "";

    const maisBarato = opcoes.reduce((a, b) => a.valor < b.valor ? a : b);
    const maisRapido = opcoes.reduce((a, b) => a.prazo < b.prazo ? a : b);

    const recomendada = opcoes.reduce((melhor, atual) => {
      return (atual.valor * atual.prazo) < (melhor.valor * melhor.prazo)
        ? atual
        : melhor;
    });

    opcoes.forEach((opcao) => {
      const div = document.createElement("label");
      div.classList.add("frete-card");

      let badge = "";
      if (opcao.id === maisBarato.id) badge += `<span class="frete-badge">Mais barato</span>`;
      if (opcao.id === maisRapido.id) badge += `<span class="frete-badge">Mais rápido</span>`;
      if (opcao.id === recomendada.id) badge += `<span class="frete-badge destaque">Recomendado</span>`;

      div.innerHTML = `
        <input 
          type="radio" 
          name="frete" 
          value="${opcao.valor}" 
          data-prazo="${opcao.prazo}" 
          data-nome="${opcao.nome}"
          data-empresa="${opcao.empresa}"
          ${opcao.id === recomendada.id ? "checked" : ""}
        >

        <div class="frete-header">
          <span>${opcao.nome} ${badge}</span>
          <span>${formatar(opcao.valor)}</span>
        </div>

        <div class="frete-empresa">
          ${opcao.empresa} • ${opcao.prazo} dias
        </div>
      `;

      div.addEventListener("click", () => {
        freteService.selecionarFrete();
        freteService.mostrarFreteSelecionado(opcao); // 🔥 AGORA SIM
      });

      container.appendChild(div);
    });

    // 🔥 salva recomendada como default
    state.frete = recomendada.valor;
    state.prazo = recomendada.prazo;
    state.freteNome = recomendada.nome;

    freteService.atualizarResumo();
    box.style.display = "block";
  },

  // mostrar frete selecionado
  mostrarFreteSelecionado(opcao) {
    const container = document.getElementById("frete-opcoes");

    container.innerHTML = `
      <div class="frete-selecionado">
        
        <div class="frete-selecionado-header">
          🚚 Frete selecionado
        </div>

        <div class="frete-selecionado-content">
          
          <div class="frete-selecionado-info">
            <span class="frete-selecionado-nome">${opcao.nome}</span>
            <span class="frete-selecionado-empresa">${opcao.empresa}</span>
          </div>

          <div style="text-align:right;">
            <div class="frete-selecionado-preco">${formatar(opcao.valor)}</div>
            <div class="frete-selecionado-prazo">${opcao.prazo} dias</div>
          </div>

        </div>

        <button type="button" class="btn-trocar-frete" id="trocar-frete">
          Alterar opção
        </button>

      </div>
    `;

    // 🔥 atualiza global
    state.frete = opcao.valor;
    state.prazo = opcao.prazo;
    state.freteNome = opcao.nome;

    freteService.atualizarResumo();

    document.getElementById("trocar-frete").addEventListener("click", () => {
      const cep = document.getElementById("cep").value.replace(/\D/g, "");
      if (cep.length === 8) {
        freteService.calcularFrete(cep);
      }
    });
  }   

}
