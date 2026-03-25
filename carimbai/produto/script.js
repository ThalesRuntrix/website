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
      detalhesHTML += `<p><strong>${key.replace("_", " ")}:</strong> ${produto.detalhes[key]}</p>`;
    }
  }

  container.innerHTML = `
    <div class="produto-img">
      <img src="../../img/texto1.jpg" alt="${produto.nome}">
    </div>

    <div class="produto-info">
      <h1>${produto.nome}</h1>
      <p>Categoria: ${produto.categoria}</p>

      <div class="preco">
        R$ ${Number(produto.preco).toFixed(2)}
      </div>

      <div class="detalhes">
        <h3>Detalhes</h3>
        ${detalhesHTML}
      </div>

      <a href="#" class="btn-comprar">
        Comprar via PIX
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