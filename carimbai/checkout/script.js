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
    .addEventListener("submit", function (e) {
        e.preventDefault();
         const dados = {
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

  // 🔥 mensagem formatada PROFISSIONAL
  const mensagem = `
    🛒 *NOVO PEDIDO - CARIMBAI*

    📦 *Produto:*
    ${produtoGlobal?.nome || "Produto não identificado"}

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

  // 🔥 codificação correta (resolve bug dos ???)
  const mensagemFormatada = encodeURIComponent(mensagem);

  const telefone = "5511943722620";

  const url = `https://wa.me/${telefone}?text=${mensagemFormatada}`;

  window.open(url, "_blank");
        
});
