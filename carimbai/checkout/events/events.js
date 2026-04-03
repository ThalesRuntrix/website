import { formUI } from "../ui/formUI.js";
import { freteService } from "../services/freteService.js";
import { state } from "../state/state.js";

export function initEvents() {

// entrega
document.getElementById("entrega").addEventListener("change", function () {
  formUI.toggleEndereco();
  formUI.toggleFrete();
  formUI.atualizarResumo();
});

// seleciona opção de frete
document.addEventListener("change", function (e) {
  if (e.target.name === "frete") {
    freteService.selecionarFrete();
  }
});

// atualiza pagamento (resumo)
document.getElementById("pagamento").addEventListener("change", formUI.atualizarResumo());

// busca cep e recalcula frete
document.getElementById("cep").addEventListener("input", function () {
  const cep = this.value.replace(/\D/g, "");

  if (cep.length === 8) {
    buscarEnderecoPorCEP(cep);
    tentarCalcularFrete();
  }
});

//validação de cep
document.getElementById("cep").addEventListener("blur", function () {
  const input = this;

  if (validarCEP(input.value)) {
    input.classList.remove("input-erro");
    input.classList.add("input-ok");
  } else {
    input.classList.add("input-erro");
    input.classList.remove("input-ok");
  }
});

// máscara de cep
document.getElementById("cep").addEventListener("input", function (e) {
  let v = e.target.value.replace(/\D/g, "");

  if (v.length > 5) {
    v = v.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
  }

  e.target.value = v;
});

// validação de cpf
document.getElementById("cpf").addEventListener("blur", function () {
  const input = this;

  if (validarCPF(input.value)) {
    input.classList.remove("input-erro");
    input.classList.add("input-ok");
  } else {
    input.classList.add("input-erro");
    input.classList.remove("input-ok");
  }
});

// máscara de cpf
document.getElementById("cpf").addEventListener("input", function (e) {
  let v = e.target.value.replace(/\D/g, "");

  v = v
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");

  e.target.value = v;
});
  

}