import { getFrete } from "../services/freteService.js";
import { renderFrete } from "../ui/freteUI.js";

export function initEvents() {

  document.getElementById("entrega").addEventListener("change", function () {
    const entrega = this.value;

    const enderecoBox = document.getElementById("endereco-box");
    const freteBox = document.getElementById("frete-info");

    if (entrega === "frete") {
      enderecoBox.style.display = "block";
      freteBox.style.display = "block";

    } else {
      enderecoBox.style.display = "none";
      freteBox.style.display = "none";

      // limpa frete
      const container = document.getElementById("frete-opcoes");
      if (container) container.innerHTML = "";

      // reset state
      state.frete = 0;
      state.prazo = 0;
      state.freteNome = "";
    }
  });

  document.getElementById("entrega").addEventListener("change", async function () {
    const entrega = this.value;

    if (entrega === "frete") {
      const cep = document.getElementById("cep").value.replace(/\D/g, "");

      if (cep.length === 8) {
        const opcoes = await getFrete(cep);
        renderFrete(opcoes);
      }
    } else {
      document.getElementById("frete-opcoes").innerHTML = "";
    }
  });

  document.getElementById("cep").addEventListener("input", async function () {
    const cep = this.value.replace(/\D/g, "");

    if (cep.length === 8) {
      const opcoes = await getFrete(cep);
      renderFrete(opcoes);
    }
  });

  document.addEventListener("reabrirFrete", async () => {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");

    if (cep.length === 8) {
      const opcoes = await getFrete(cep);
      renderFrete(opcoes);
    }
  });

}