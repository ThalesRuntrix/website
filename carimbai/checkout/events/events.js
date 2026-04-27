import { freteService } from "../services/freteService.js";
import { cepService } from "../services/cepService.js";
import { pedidoService } from "../services/pedidoService.js";
import { formUI } from "../ui/formUI.js"
import { formService } from "../services/formService.js";
import { mensagemService } from "../services/mensagemService.js";
import { validarCPF } from "../utils/format.js";
import { pagamentoService } from "../services/pagamentoService.js";

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

  //validação e busca de cep. Calcula Frete
  document.getElementById("cep").addEventListener("input", async function () {
    const input = this;
    const cep = input.value.replace(/\D/g, "");
    const erroMsg = document.getElementById("cep-erro");    
    
    const address = await cepService.obterEndereco(cep);
    if(address){
      input.classList.remove("input-erro");
      input.classList.add("input-ok");
      erroMsg.style.display = "none";

      freteService.tentarCalcularFrete();
    } else {
      input.classList.add("input-erro");
      input.classList.remove("input-ok");
      erroMsg.style.display = "block";

      cepService.blockAddressFieldsEdition

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
    const erroMsg = document.getElementById("cpf-erro");

    if (validarCPF(input.value)) {
      input.classList.remove("input-erro");
      input.classList.add("input-ok");
      erroMsg.style.display = "none";
    } else {
      input.classList.add("input-erro");
      input.classList.remove("input-ok");
      erroMsg.style.display = "block";
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

  // máscara de whats app
  document.getElementById("whatsapp").addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "");

    v = v.slice(0,11);

    if (v.length > 10) {
      v = v.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3"
      );
    } else if (v.length > 6) {
      v = v.replace(
        /(\d{2})(\d{4,5})(\d+)/,
        "($1) $2-$3"
      );
    } else if (v.length > 2) {
      v = v.replace(
        /(\d{2})(\d+)/,
        "($1) $2"
      );
    } else {
      v = v.replace(
        /(\d*)/,
        "($1"
      );
    }

    e.target.value = v;
  });

 
  // 🔥 SUBMIT -> Enviar Pedido | Enviar Mensagem WP
  document.getElementById("pedido-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const dados = formService.getFormData();  
    
    const isValid = formService.validateFields(dados);

    if (!isValid) return;
    
    freteService.setDeliveryData(dados.entrega);

    let pedido = {};

    try {
      // salvar pedido
      pedido = await pedidoService.salvarPedido(dados);   

    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar pedido");
    }

    try {
      loading(true);
      // chamar pagamento
      if(dados.pagamento === "pix") {
        await pagamentoService.pagarPix(pedido.pedido_id);
        //window.location.href=`/carimbai/pagamento/pix.html?pedido_id=${pedido.pedido_id}`;
         
      } else {
        await pagamentoService.pagarCartao(pedido.pedido_id);
      }
      
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao porcessar pedido");
    } finally {
      loading(false);
    }

    /*
    try {
      //Enviar mensagem  de pedido para WP
      mensagemService.setMessageData(dados, pedido);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao enviar mensagem com pedido");      
    }
    */

  });  

}

function loading(status) {
  const form = document.getElementById("pedido-form");
  const btn = form.querySelector("button[type='submit']");

  if (!btn) return;

  btn.disabled = status;

  btn.innerText = status
    ? "Processando..."
    : "🚀 Enviar Pedido Agora";
}
