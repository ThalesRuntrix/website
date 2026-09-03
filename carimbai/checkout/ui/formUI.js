import { state } from "../state/state.js";

import { formatar } from "../utils/format.js";

import { freteService } from "../services/freteService.js";


export const formUI = {


  // =========================================================
  // RENDERIZA CARRINHO
  // =========================================================

  renderizarCarrinho(carrinho) {

    const container =
      document.getElementById(
        "checkout-itens"
      );


    if (!container) {
      return;
    }


    container.innerHTML = "";


    for (
      const item of carrinho.itens
    ) {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "checkout-item";


      div.innerHTML = `

        <div class="checkout-item-imagem">

          ${
            item.imagem_url
              ? `
                <img
                  src="${item.imagem_url}"
                  alt="${item.produto_nome}"
                >
              `
              : `
                <div class="checkout-item-placeholder">
                  🛒
                </div>
              `
          }

        </div>


        <div class="checkout-item-info">

          <strong>
            ${item.produto_nome}
          </strong>

          ${
            item.variacao
              ? `
                <span>
                  ${item.variacao}
                </span>
              `
              : ""
          }


          <span>
            Quantidade: ${item.quantidade}
          </span>


          <span>
            ${formatar(
              Number(item.preco_unitario)
            )} cada
          </span>

        </div>


        <div class="checkout-item-total">

          ${formatar(
            Number(item.subtotal)
          )}

        </div>

      `;


      container.appendChild(
        div
      );
    }
  },


  // =========================================================
  // CONTROLE DO ENDEREÇO
  // =========================================================

  toggleEndereco() {

    const entrega =
      document.getElementById(
        "entrega"
      ).value;


    const box =
      document.getElementById(
        "endereco-box"
      );


    const campos = [
      "rua",
      "numero",
      "bairro",
      "cidade",
      "estado",
      "cep"
    ];


    if (
      entrega === "frete"
    ) {

      box.style.display =
        "block";


      campos.forEach(
        id => {

          document
            .getElementById(id)
            .setAttribute(
              "required",
              true
            );
        }
      );

    }

    else {

      box.style.display =
        "none";


      campos.forEach(
        id => {

          document
            .getElementById(id)
            .removeAttribute(
              "required"
            );
        }
      );


      campos.forEach(
        id => {

          document
            .getElementById(id)
            .value = "";
        }
      );
    }
  },


  // =========================================================
  // FRETE
  // =========================================================

  toggleFrete() {

    const entrega =
      document.getElementById(
        "entrega"
      ).value;


    const freteBox =
      document.getElementById(
        "frete-info"
      );


    const freteContainer =
      document.getElementById(
        "frete-opcoes"
      );


    if (
      entrega === "frete"
    ) {

      freteBox.style.display =
        "block";


      freteService
        .tentarCalcularFrete();

    }

    else {

      freteBox.style.display =
        "none";


      if (
        freteContainer
      ) {

        freteContainer.replaceChildren();

        freteContainer.innerHTML =
          "";
      }


      state.frete =
        0;

      state.prazo =
        0;

      state.freteNome =
        "";


      formUI.atualizarResumo();
    }
  },


  // =========================================================
  // RESUMO
  // =========================================================

  atualizarResumo() {

    const preco =
      Number(
        state.subtotalProdutos
      ) || 0;


    const entrega =
      document.getElementById(
        "entrega"
      ).value;


    const pagamento =
      document.getElementById(
        "pagamento"
      ).value;


    const frete =
      entrega === "frete"
        ? Number(state.frete) || 0
        : 0;


    const desconto =
      pagamento === "pix"
        ? preco * 0.05
        : 0;


    const total =
      preco +
      frete -
      desconto;


    state.total =
      total;


    document.getElementById(
      "resumo-produto"
    ).textContent =
      formatar(preco);


    document.getElementById(
      "resumo-frete"
    ).textContent =
      formatar(frete);


    document.getElementById(
      "resumo-desconto"
    ).textContent =
      `- ${formatar(desconto)}`;


    document.getElementById(
      "resumo-total"
    ).textContent =
      formatar(total);
  },


  // =========================================================
  // ERRO
  // =========================================================

  setErro(
    inputId,
    mensagem
  ) {

    const input =
      document.getElementById(
        inputId
      );


    const msg =
      document.getElementById(
        `${inputId}-erro`
      );


    input.classList.add(
      "input-erro"
    );


    input.classList.remove(
      "input-ok"
    );


    msg.style.display =
      "block";


    msg.textContent =
      mensagem;
  },


  limparErro(inputId) {

    const input =
      document.getElementById(
        inputId
      );


    const msg =
      document.getElementById(
        `${inputId}-erro`
      );


    input.classList.remove(
      "input-erro"
    );


    input.classList.add(
      "input-ok"
    );


    msg.style.display =
      "none";


    msg.textContent =
      "";
  }

};

/*import { state } from "../state/state.js";
import { formatar } from "../utils/format.js"
import { freteService } from "../services/freteService.js";

export const formUI =  {

  // controla form (UI + required)
  toggleEndereco() {
    const entrega = document.getElementById("entrega").value;
    const box = document.getElementById("endereco-box");

    const campos = [
      "rua", "numero", "bairro", "cidade", "estado", "cep"
    ];

    if (entrega === "frete") {
      box.style.display = "block";

      // torna obrigatório
      campos.forEach(id => {
        document.getElementById(id).setAttribute("required", true);
      });

    } else {
      box.style.display = "none";

      // remove obrigatoriedade
      campos.forEach(id => {
        document.getElementById(id).removeAttribute("required");
      });

      // limpa valores
      campos.forEach(id => {
        document.getElementById(id).value = "";
      });
    }
  },

  // controla lógica de frete (estado + opções + cálculo)
  toggleFrete() {
    const entrega = document.getElementById("entrega").value;

    const freteBox = document.getElementById("frete-info");
    const freteContainer = document.getElementById("frete-opcoes");

    if (entrega === "frete") {
      freteBox.style.display = "block";
      
      freteService.tentarCalcularFrete();

    } else {
      freteBox.style.display = "none";    
      if (freteContainer) {
      freteContainer.replaceChildren();
      freteContainer.innerHTML = "";
      }

      state.frete = 0;
      state.prazo = 0;
      state.freteNome = "";
      
      formUI.atualizarResumo();
    }
  },

  // atualizar resumo
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

  setErro(inputId, mensagem){
    const input = document.getElementById(inputId);
    const msg = document.getElementById(`${inputId}-erro`);

    input.classList.add("input-erro");
    input.classList.remove("input-ok");
    msg.style.display = "block";

    msg.textContent = mensagem;
  },

  limparErro(inputId){
    const input = document.getElementById(inputId);
    const msg = document.getElementById(`${inputId}-erro`);

    input.classList.remove("input-erro");
    input.classList.add("input-ok");
    msg.style.display = "none";

    msg.textContent = "";
  }
 
}
*/