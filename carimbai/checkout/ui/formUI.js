import { state } from "../state/state.js";
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
      
      this.atualizarResumo();
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
 
}
