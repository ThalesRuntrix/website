const API_URL = "https://carimbai-api.vercel.app/api";

async function carregarProdutos() {
  try {    
    // 🔥 FILTRO
    const response = await fetch(
      `${API_URL}/produtos?categoria=carimbo&tipo_material=automatico`
    );

    const produtos = await response.json();

    const container = document.getElementById("carimbos");
    container.innerHTML = "";

    if (!produtos.length) {
      container.innerHTML = "<p>Produtos Indisponíveis no momento</p>";
      return;
    }

    produtos.forEach(produto => {

      const imagens = produto.imagens?.length?produto.imagens:[produto.imagem_url];

      const slides = imagens.map((img, index) => `
        <img
          src="${img}"
          class="carousel-image ${index === 0 ? 'active' : ''}"
          alt="${produto.nome}"
        >
      `).join("");

      const div = document.createElement("div");
      div.classList.add("product-card");

      div.innerHTML = `
        <div class="carousel">
          ${slides}
        </div>

        <div class="product-info">
          <h3>${produto.nome}</h3>
          <p>Medida: ${produto.detalhes?.medida || ""}</p>

          <div class="price">
            R$ ${Number(produto.preco).toFixed(2)}
          </div>

          <a href="../../produto/index.html?id=${produto.id}&from=carimbos-texto" class="btn-primary">
            Ver detalhes
          </a>
        </div>
      `;

      const imagensCard = div.querySelectorAll(".carousel-image");
      if (imagensCard.length > 1) {
        let atual = 0;

        setInterval(() => {
          imagensCard[atual].classList.remove("active");

          atual = (atual + 1) % imagensCard.length;

          imagensCard[atual].classList.add("active");
        }, 3000);
      }
      
      /*const imagem = produto.imagem_url;

      div.innerHTML = `
        <img src="${imagem}" alt="${produto.nome}">
        
        <div class="product-info">
          <h3>${produto.nome}</h3>
          <p>Medida: ${produto.detalhes?.medida || ""}</p>

          <div class="price">
            R$ ${Number(produto.preco).toFixed(2)}
          </div>
          
          <a href="../../produto/index.html?id=${produto.id}&from=carimbos-texto" class="btn-primary">
            Ver detalhes
          </a>
        </div>
      `; */

      container.appendChild(div);
    });

  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

carregarProdutos();
