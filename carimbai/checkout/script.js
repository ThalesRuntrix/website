const API_URL = "https://carimbai-api.vercel.app/api";

let produtoGlobal = null;
window.modoTrocaFrete = false;

// 🔥 pegar parâmetro da URL
function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// 🔥 buscar produto
async function getProdutoById() {
  const produtoId = getParam("id");

  try {
    const res = await fetch(`${API_URL}/produto/${produtoId}`);
    const produto = await res.json();

    produtoGlobal = produto;

    // 🔥 render nome
    document.getElementById("produto-nome").textContent = produto.nome;

    // 🔥 salva preço base
    window.precoBase = Number(produto.preco);

    atualizarResumo();

  } catch (error) {
    console.error("Erro ao buscar produto:", error);
  }
}

// 🔥 formatar moeda
function formatar(valor) {
  return (valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// 🔥 tentar calcular frete
function tentarCalcularFrete() {
  const cep = document.getElementById("cep").value.replace(/\D/g, "");
  const entrega = document.getElementById("entrega").value;

  if (cep.length === 8 && entrega === "frete") {
    calcularFrete(cep);
  }
}

// 🔥 calcular frete
async function calcularFrete(cep) {
  try {
    const res = await fetch(`${API_URL}/frete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cep })
    });

    const data = await res.json();

    if (!res.ok || !Array.isArray(data)) throw new Error();

    mostrarFrete(data);

  } catch (err) {
    console.warn("Frete real falhou, usando fallback");

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

  mostrarFrete(fallback);    
  }

  atualizarResumo();
}

// 🔥 selecionar frete
function selecionarFrete() {
  const selecionado = document.querySelector('input[name="frete"]:checked');

  if (!selecionado) return;

  window.frete = Number(selecionado.value);
  window.prazo = Number(selecionado.dataset.prazo);
  window.freteNome = selecionado.dataset.nome;

  atualizarResumo();
}

// 🔥 mostrar opões de frete
function mostrarFrete(opcoes) {
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
      selecionarFrete();
      mostrarFreteSelecionado(opcao); // 🔥 AGORA SIM
    });

    container.appendChild(div);
  });

  // 🔥 salva recomendada como default
  window.frete = recomendada.valor;
  window.prazo = recomendada.prazo;
  window.freteNome = recomendada.nome;

  atualizarResumo();
  box.style.display = "block";
}

function mostrarFreteSelecionado(opcao) {
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
  window.frete = opcao.valor;
  window.prazo = opcao.prazo;
  window.freteNome = opcao.nome;

  atualizarResumo();

  document.getElementById("trocar-frete").addEventListener("click", () => {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");
    if (cep.length === 8) {
      calcularFrete(cep);
    }
  });
}


// Buscar endereço pelo campo de cep
async function buscarEnderecoPorCEP(cep) {
  try {
    const res = await fetch(`${API_URL}/cep`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cep })
    });

    const data = await res.json();

    if (!res.ok) throw new Error();

    document.getElementById("rua").value = data.rua || "";
    document.getElementById("bairro").value = data.bairro || "";
    document.getElementById("cidade").value = data.cidade || "";
    document.getElementById("estado").value = data.estado || "";

    document.getElementById("rua").readOnly = true;
    document.getElementById("bairro").readOnly = true;
    document.getElementById("cidade").readOnly = true;
    document.getElementById("estado").readOnly = true;

  } catch (err) {
    console.warn("CEP não encontrado ou erro inesperado.");
  }
}

// validação de cep
function validarCEP(cep) {
  return /^\d{5}-?\d{3}$/.test(cep);
}

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

// validação de cpf
function validarCPF(cpf) {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
}

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

// controla form (UI + required)
function toggleEndereco() {
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
}

// controla lógica de frete (estado + opções + cálculo)
function toggleFrete() {
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
}

// 🔥 atualizar resumo
function atualizarResumo() {
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


// 🔥 EVENTOS

// entrega
document.getElementById("entrega").addEventListener("change", function () {
  toggleEndereco();
  toggleFrete();
  atualizarResumo();
});

// selecionar opção de frete
document.addEventListener("change", function (e) {
  if (e.target.name === "frete") {
    selecionarFrete();
  }
});

// CEP
document.getElementById("cep").addEventListener("input", function () {
  const cep = this.value.replace(/\D/g, "");

  if (cep.length === 8) {
    buscarEnderecoPorCEP(cep);
    tentarCalcularFrete();
  }
});

// pagamento
document.getElementById("pagamento").addEventListener("change", atualizarResumo);

// máscara de cep
document.getElementById("cep").addEventListener("input", function (e) {
  let v = e.target.value.replace(/\D/g, "");

  if (v.length > 5) {
    v = v.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
  }

  e.target.value = v;
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


// 🔥 INIT
getProdutoById();

// 🔥 SUBMIT
document.getElementById("pedido-form")
.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!produtoGlobal) {
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
    produto_nome: produtoGlobal.nome,
    total: window.totalPedido,

    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    cpf: document.getElementById("cpf").value,

    ...endereco,    

    entrega: entrega,
    frete_valor: window.frete ?? 0,
    frete_prazo: window.prazo ?? 0,
    frete_nome: window.freteNome ?? "",
    pagamento: document.getElementById("pagamento").value
  };

  

  if (!validarCPF(dados.cpf)) {
    alert("CPF inválido");
    return;
  }
  
  if (dados.entrega === "frete" && !window.frete) {
    alert("⚠️ Selecione uma opção de frete antes de continuar");
    return;
  }

  if (dados.entrega !== "frete") {
    window.frete = 0;
    window.prazo = 0;
    window.freteNome = "";
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
${window.freteNome} - ${formatar(window.frete)} (${window.prazo} dias)`
  : "";

    // 🔥 mensagem WhatsApp
    const mensagem = `🛒 *PEDIDO N°: ${pedidoId}*

👤 *Comprador:*
${dados.nome}

📦 *Produto:*
${dados.produto_nome}

💰 *Valor Total:*
${formatar(window.totalPedido)}

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
