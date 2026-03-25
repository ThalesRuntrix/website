const API_URL = "https://carimbai-api.vercel.app/api";

// 🔥 pegar ID da URL
function getProdutoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 🔥 renderizar produto
function renderProduto(produto) {
  const container = document.getElementById("produto-container");

  let detalhesHTML = "";

  if (produto.detalhes) {
    for (const key in produto.detalhes) {
      if (["id", "produto_id", "categoria_id"].includes(key)) continue;

      detalhesHTML += `
        <p><strong>${key.replace("_", " ")}:</strong> ${produto.detalhes[key]}</p>
      `;
    }
  }

  container.innerHTML = `
    <div class="produto-content">
      
      <img src="../img/texto.jpg" alt="${produto.nome}">

      <div class="produto-title">
        ${produto.nome}
      </div>

      <div class="produto-preco">
        R$ ${Number(produto.preco).toFixed(2)}
      </div>

      <div class="produto-detalhes">
        ${detalhesHTML}
      </div>

      <a class="btn-primary" href="https://wa.me/5511943722620?text=Olá,%20quero%20este%20produto">
        📲 Comprar via WhatsApp
      </a>

    </div>
  `;
}

// 🔥 carregar produto
async function carregarProduto() {
  const id = getProdutoId();

  if (!id) {
    document.getElementById("produto-container").innerHTML = "Produto não encontrado";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/produto/${id}`);
    const produto = await response.json();

    renderProduto(produto);

  } catch (error) {
    console.error(error);
    document.getElementById("produto-container").innerHTML = "Erro ao carregar produto";
  }
}

carregarProduto();