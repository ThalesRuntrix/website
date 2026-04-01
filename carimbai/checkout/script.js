const API_URL = "https://carimbai-api.vercel.app/api";

let produtoGlobal = null;

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

    if (!res.ok) throw new Error();

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
  const box = document.getElementById("frete-info");
  const container = document.getElementById("frete-opcoes");

  container.innerHTML = "";

  opcoes.forEach((opcao, index) => {
    const div = document.createElement("label");
    
    div.style.display = "block";
    div.style.marginBottom = "10px";
    div.style.cursor = "pointer";

    div.innerHTML = `
      <input type="radio" name="frete" 
        value="${opcao.valor}" 
        data-prazo="${opcao.prazo}" 
        data-nome="${opcao.nome}"
        ${index === 0 ? "checked" : ""}
      >
      🚚 ${opcao.empresa} - ${opcao.nome}  
      (${formatar(opcao.valor)} • ${opcao.prazo} dias)
    `;

    container.appendChild(div);
  });

  box.style.display = "block";

  // 🔥 selecionar automaticamente o primeiro
  selecionarFrete();
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
  const entrega = this.value;

  if (entrega === "frete") {
    tentarCalcularFrete();
  } else {
    document.getElementById("frete-info").style.display = "none";
    
    window.frete = 0;
    window.prazo = 0;
    window.freteNome = "";    
    
    atualizarResumo();
  }
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
    tentarCalcularFrete();
  }
});

// pagamento
document.getElementById("pagamento").addEventListener("change", atualizarResumo);


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

  const dados = {
    produto_id: getParam("id"),
    produto_nome: produtoGlobal.nome,
    total: window.totalPedido,

    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    cpf: document.getElementById("cpf").value,

    rua: document.getElementById("rua").value,
    numero: document.getElementById("numero").value,
    complemento: document.getElementById("complemento").value,
    bairro: document.getElementById("bairro").value,
    cidade: document.getElementById("cidade").value,
    estado: document.getElementById("estado").value,
    cep: document.getElementById("cep").value,

    entrega: document.getElementById("entrega").value,
    frete_valor: window.frete ?? 0,
    frete_prazo: window.prazo ?? 0,
    frete_nome: window.freteNome ?? "",
    pagamento: document.getElementById("pagamento").value
  };

  // bloquear envio sem frete
  if (dados.entrega === "frete" && !window.frete) {
    window.frete = 15; // valor fixo provisório
    window.prazo = 3;
    //alert("⚠️ Calcule o frete antes de enviar o pedido");
    //return;
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

    // 🔥 mensagem WhatsApp
    const mensagem = `🛒 *NOVO PEDIDO - CARIMBAI*

🆔 Pedido: *${pedidoId}*

📦 *Produto:*
${dados.produto_nome}

💰 *Total:*
${formatar(window.totalPedido)}

👤 *Cliente:*
${dados.nome}
${dados.email}
${dados.cpf}

📍 *Endereço:*
${dados.rua}, ${dados.numero}
${dados.complemento ? "Comp: " + dados.complemento : ""}
${dados.bairro}
${dados.cidade} - ${dados.estado}
CEP: ${dados.cep}

🚚 *Entrega:*
${dados.entrega}

🚚 *Frete:*
${window.freteNome} - ${formatar(window.frete)} (${window.prazo} dias)

💳 *Pagamento:*
${dados.pagamento}
`;

    const url = `https://wa.me/5511943722620?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao enviar pedido");
  }
});
