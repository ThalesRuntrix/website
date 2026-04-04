import { state } from "../state/state.js";
import { freteService } from "../services/freteService.js";
import { cepService } from "../services/cepService.js";
import { pedidoService } from "../services/pedidoService.js";
import { formUI } from "../ui/formUI.js"
import { formatar } from "../utils/format.js";
import { formService } from "../services/formService.js";

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
  document.getElementById("pagamento").addEventListener("change", () => {formUI.atualizarResumo()});

  // busca cep e recalcula frete
  document.getElementById("cep").addEventListener("input", function () {
    const cep = this.value.replace(/\D/g, "");

    if (cep.length === 8) {
      cepService.obterEndereco(cep);
      freteService.tentarCalcularFrete();
    }
  });

  //validação de cep
  document.getElementById("cep").addEventListener("blur", function () {
    const input = this;

    if (cepService.validarCEP(input.value)) {
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

    if (freteService.validarCPF(input.value)) {
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

 
  // 🔥 SUBMIT -> Enviar Pedido | Enviar Mensagem WP
  document.getElementById("pedido-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const dados = formService.getFormData();    
    
    formService.validateFields(dados.cpf, dados.entrega);

    freteService.setDeliveryData(dados.entrega);

    try {

      // salvar pedido
      const result = await pedidoService.salvarPedido(dados);
      
      const pedidoId = result.pedido_codigo;

      const enderecoTexto = dados.entrega === "frete"
        ? `
  📍 *Endereço de Entrega:*
  ${dados.rua}, ${dados.numero}
  ${dados.complemento ? "Comp: " + dados.complemento : ""}
  ${dados.bairro}
  ${dados.cidade} - ${dados.estado}
  CEP: ${dados.cep}
  `
  : "";

      const freteTexto = dados.entrega === "frete"
        ? `🚚 *Transportadora:*
  ${state.freteNome} - ${formatar(state.frete)} (${state.prazo} dias)`
    : "";

      // 🔥 mensagem WhatsApp
      const mensagem = `🛒 *PEDIDO N°: ${pedidoId}*

  👤 *Comprador:*
  ${dados.nome}

  📦 *Produto:*
  ${dados.produto_nome}

  💰 *Valor Total:*
  ${formatar(state.total)}

  💳 *Forma de Pagamento:*
  ${dados.pagamento}

  🚚 *Forma de Entrega:*
  ${dados.entrega}

  ${enderecoTexto}

  ${freteTexto}
  `;

      const url = `https://wa.me/5511943722620?text=${encodeURIComponent(mensagem)}`;

      window.open(url, "_blank");

    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao enviar pedido");
    }
  });  

}