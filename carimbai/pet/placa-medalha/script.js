const API_URL = "https://carimbai-api.vercel.app/api";

async function carregarProdutos() {
  try {    
    // 🔥 FILTRO
    const response = await fetch(
      `${API_URL}/produtos?categoria=pet&formato=medalha`
    );

    const produtos = await response.json();

    const container = document.getElementById("placas-pet");
    container.innerHTML = "";

    if (!produtos.length) {
      container.innerHTML = "<p>Nenhum produto encontrado</p>";
      return;
    }

    produtos.forEach(produto => {
      const div = document.createElement("div");
      div.classList.add("product-card");

      const imagem = "../img/texto1.jpg";

      div.innerHTML = `
        <img src="${imagem}" alt="${produto.nome}">
        
        <div class="product-info">
          <h3>${produto.nome}</h3>
          <p>${produto.detalhes?.modelo || ""}</p>

          <div class="price">
            R$ ${Number(produto.preco).toFixed(2)}
          </div>

          <a href="../../produto/index.html?id=${produto.id}&from=placas-pet-medalha" class="btn-primary">
            Ver detalhes
          </a>
        </div>
      `;

      container.appendChild(div);
    });

  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

carregarProdutos();
