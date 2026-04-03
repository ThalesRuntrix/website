import { state } from "../state/state.js";
import { freteService } from "../services/freteService.js";
import { cepService } from "../services/cepService.js";
import { formUI } from "../ui/formUI.js"


const API_URL = "https://carimbai-api.vercel.app/api";

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

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // 🔥 SUBMIT
  document.getElementById("pedido-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!state.produto) {
      alert("Produto ainda está carregando.");
      return;
    }

    const entrega = document.getElementById("entrega").value;
    const isFrete = entrega === "frete";
    
    const endereco = isFrete
      ? {
          rua: document.getElementById("rua").value,
          numero: document.getElementById("numero").value,
          complemento: document.getElementById("complemento").value,
          bairro: document.getElementById("bairro").value,
          cidade: document.getElementById("cidade").value,
          estado: document.getElementById("estado").value,
          cep: document.getElementById("cep").value
        }
      : {
          rua: null,
          numero: null,
          complemento: null,
          bairro: null,
          cidade: null,
          estado: null,
          cep: null
        };

    const dados = {
      produto_id: getParam("id"),
      produto_nome: state.produto.nome,
      total: state.totalPedido,

      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      cpf: document.getElementById("cpf").value,

      ...endereco,    

      entrega: entrega,
      frete_valor: state.frete ?? 0,
      frete_prazo: state.prazo ?? 0,
      frete_nome: state.freteNome ?? "",
      pagamento: document.getElementById("pagamento").value
    };

    

    if (!freteService.validarCPF(dados.cpf)) {
      alert("CPF inválido");
      return;
    }
    
    if (dados.entrega === "frete" && !state.frete) {
      alert("⚠️ Selecione uma opção de frete antes de continuar");
      return;
    }

    if (dados.entrega !== "frete") {
      state.frete = 0;
      state.prazo = 0;
      state.freteNome = "";
    }

    try {
      // 🔥 salvar pedido no backend
      const res = await fetch(`${API_URL}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

      const result = await res.json();

      if (!res.ok) throw new Error();

      const pedidoId = result.pedido_codigo;

      const enderecoTexto = isFrete
        ? `
  📍 *Endereço de Entrega:*
  ${dados.rua}, ${dados.numero}
  ${dados.complemento ? "Comp: " + dados.complemento : ""}
  ${dados.bairro}
  ${dados.cidade} - ${dados.estado}
  CEP: ${dados.cep}
  `
  : "";

      const freteTexto = isFrete
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