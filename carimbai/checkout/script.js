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

    // 🔥 atualiza resumo após carregar
    atualizarResumo();

  } catch (error) {
    console.error("Erro ao buscar produto:", error);
  }
}

// 🔥 formatar moeda
function formatar(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// 🔥 atualizar resumo do pedido
function atualizarResumo() {
  const preco = window.precoBase || 0;

  const entregaEl = document.getElementById("entrega");
  const pagamentoEl = document.getElementById("pagamento");

  const entrega = entregaEl ? entregaEl.value : "";
  const pagamento = pagamentoEl ? pagamentoEl.value : "";

  let frete = 0;
  let desconto = 0;

  // 🔥 frete (placeholder por enquanto)
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

  // 🔥 salva global (vamos usar no WhatsApp e backend)
  window.totalPedido = total;
}

// 🔥 eventos de mudança
document.getElementById("entrega").addEventListener("change", atualizarResumo);
document.getElementById("pagamento").addEventListener("change", atualizarResumo);

// 🔥 carregar produto ao iniciar
getProdutoById();

// 🔥 submit do formulário
document.getElementById("pedido-form")
.addEventListener("submit", async function (e) {
  e.preventDefault();

  // 🔥 proteção (produto ainda não carregou)
  if (!produtoGlobal) {
    alert("Produto ainda está carregando. Tente novamente.");
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
    pagamento: document.getElementById("pagamento").value
  };

  try {
    // 🔥 1. criar pedido no backend
    const res = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error("Erro ao criar pedido");
    }

    const pedidoId = result.pedido_codigo;

    // 🔥 2. montar mensagem
    const mensagem = `
        🛒 *NOVO PEDIDO - CARIMBAI*

        🆔 Pedido: *${pedidoId}*

        📦 *Produto:*
        ${dados.produto_nome}

        💰 *Total:*
        ${formatar(window.totalPedido)}

        👤 *Cliente:*
        Nome: ${dados.nome}
        Email: ${dados.email}
        CPF: ${dados.cpf}

        📍 *Endereço:*
        ${dados.rua}, ${dados.numero}
        ${dados.complemento ? "Comp: " + dados.complemento : ""}
        Bairro: ${dados.bairro}
        ${dados.cidade} - ${dados.estado}
        CEP: ${dados.cep}

        🚚 *Entrega:*
        ${dados.entrega}

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