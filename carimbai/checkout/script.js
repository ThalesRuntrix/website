const API_URL = "https://carimbai-api.vercel.app/api";
let produtoGlobal = null;

// 🔥 pegar produto
async function getProdutoById() {
    const produtoId = getParam("id");
    try {
        const res = await fetch(`${API_URL}/produto/${produtoId}`);    
        const produto = await res.json();

        produtoGlobal = produto;
        
        document.getElementById("produto-nome").textContent = produto.nome;

    } catch (error) {
        console.error(error);    
    }
}

function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// 🔥 inicia carregamento
getProdutoById();

// 🔥 submit
document.getElementById("pedido-form")
.addEventListener("submit", async function (e) {
  e.preventDefault();

  const dados = {
    produto_id: getParam("id"),
    produto_nome: produtoGlobal?.nome,

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
    // 🔥 1. cria pedido no backend
    const res = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    const result = await res.json();

    const pedidoId = result.pedido_codigo;

    // 🔥 2. monta mensagem
    const mensagem = `
🛒 *NOVO PEDIDO - CARIMBAI*

🆔 Pedido: *${pedidoId}*

📦 Produto:
${dados.produto_nome}

👤 Cliente:
${dados.nome}
${dados.email}
${dados.cpf}

📍 Endereço:
${dados.rua}, ${dados.numero}
${dados.complemento ? "Comp: " + dados.complemento : ""}
${dados.bairro}
${dados.cidade} - ${dados.estado}
${dados.cep}

🚚 Entrega:
${dados.entrega}

💳 Pagamento:
${dados.pagamento}
    `;

    const url = `https://wa.me/5511943722620?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");

  } catch (error) {
    console.error(error);
    alert("Erro ao enviar pedido");
  }
});
