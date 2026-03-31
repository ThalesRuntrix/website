function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// 🔥 pegar produto (nome vindo da URL)
const produtoNome = getParam("produto") || "Produto";

document.getElementById("pedido-form")
  .addEventListener("submit", function(e) {
    e.preventDefault();

    const form = new FormData(e.target);

    const nome = form.get("nome");
    const email = form.get("email");
    const cpf = form.get("cpf");
    const endereco = form.get("endereco");
    const entrega = form.get("entrega");
    const pagamento = form.get("pagamento");

    // 🔥 montar mensagem
    const mensagem = `
🛒 *NOVO PEDIDO*

📦 Produto: ${produtoNome}

👤 Nome: ${nome}
📧 Email: ${email}
🪪 CPF: ${cpf}
📍 Endereço: ${endereco || "Retirada na loja"}

🚚 Entrega: ${entrega}
💳 Pagamento: ${pagamento}
    `;

    const url = `https://wa.me/5511943722620?text=${encodeURIComponent(mensagem)}`;

    window.location.href = url;
  });
