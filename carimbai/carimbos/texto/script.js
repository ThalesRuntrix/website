const API_URL = "https://carimbai-api.vercel.app/api";

async function carregarProdutos() {
  try {
    const response = await fetch(`${API_URL}/produtos`);
    const produtos = await response.json();

    const container = document.getElementById("carimbos");
    container.innerHTML = "";

    produtos.forEach(produto => {
      const div = document.createElement("div");

      div.innerHTML = `
        <h3>${produto.nome}</h3>
        <p>Categoria: ${produto.categoria}</p>
        <p>Preço: R$ ${Number(produto.preco).toFixed(2)}</p>
      `;

      container.appendChild(div);
    });

  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

carregarProdutos();