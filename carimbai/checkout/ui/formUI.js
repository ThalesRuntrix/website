import { formatar } from "../utils/format.js"

// controla form (UI + required)
export const formUI =  {
  
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

  toggleFrete() {
    const entrega = document.getElementById("entrega").value;

    const freteBox = document.getElementById("frete-info");
    const freteContainer = document.getElementById("frete-opcoes");

    if (entrega === "frete") {
      freteBox.style.display = "block";
      
      tentarCalcularFrete();

    } else {
      freteBox.style.display = "none";    
      if (freteContainer) {
      freteContainer.replaceChildren();
      freteContainer.innerHTML = "";
      }

      window.frete = 0;
      window.prazo = 0;
      window.freteNome = "";
      
      atualizarResumo();
    }
  },

  atualizarResumo() {
    const preco = window.precoBase || 0;

    const entrega = document.getElementById("entrega").value;
    const pagamento = document.getElementById("pagamento").value;

    let frete = 0;
    let desconto = 0;

    // 🔥 frete
    if (entrega === "frete") {
      frete = window.frete || 0;
    }

    // 🔥 desconto PIX
    if (pagamento === "pix") {
      desconto = preco * 0.05;
    }

    const total = preco + frete - desconto;

    // 🔥 render
    document.getElementById("resumo-produto").textContent = formatar(preco);
    document.getElementById("resumo-frete").textContent = formatar(frete);
    document.getElementById("resumo-desconto").textContent = `- ${formatar(desconto)}`;
    document.getElementById("resumo-total").textContent = formatar(total);

    // 🔥 salvar global
    window.totalPedido = total;
  }
}
