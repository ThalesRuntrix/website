const API_URL = "https://carimbai-api.vercel.app/api";

async function carregarProdutos(config = {}) {

  const {
    containerId = "produtos",
    categoria,
    filtros = {},
    from = ""
  } = config;

  const container =
    document.getElementById(containerId);

  if (!container) {
    console.error(
      `Container #${containerId} não encontrado`
    );
    return;
  }

  try {

    // ==========================================
    // MONTA URL
    // ==========================================

    const params = new URLSearchParams();

    if (categoria) {
      params.set("categoria", categoria);
    }

    Object.entries(filtros).forEach(
      ([chave, valor]) => {

        if (
          valor !== undefined &&
          valor !== null &&
          valor !== ""
        ) {
          params.set(chave, valor);
        }

      }
    );

    const url =
      `${API_URL}/produtos?${params.toString()}`;

    // ==========================================
    // BUSCA PRODUTOS
    // ==========================================

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Erro HTTP ${response.status}`
      );
    }

    const produtos = await response.json();

    container.innerHTML = "";

    // ==========================================
    // NENHUM PRODUTO
    // ==========================================

    if (!Array.isArray(produtos) || !produtos.length) {

      container.innerHTML =
        "<p>Produtos indisponíveis no momento</p>";

      return;
    }

    // ==========================================
    // RENDERIZA
    // ==========================================

    produtos.forEach(produto => {

      const imagens =
        produto.imagens?.length
          ? produto.imagens
          : produto.imagem_url
            ? [produto.imagem_url]
            : [];

      const slides =
        imagens.map((img, index) => `
          <img
            src="${img}"
            class="carousel-image ${index === 0 ? "active" : ""}"
            alt="${produto.nome}"
          >
        `).join("");

      const div =
        document.createElement("div");

      div.classList.add("product-card");

      if (!produtoDisponivel) {
        div.classList.add("produto-indisponivel");
      }

      // ========================================
      // LINK
      // ========================================

      const query =
        new URLSearchParams();

      query.set("id", produto.id);

      if (from) {
        query.set("from", from);
      }


      const produtoDisponivel =
        produto.disponivel === true;

      // ========================================
      // HTML
      // ========================================

      div.innerHTML = `

        <div class="carousel">
          ${
            !produtoDisponivel
              ? `
                <span class="produto-badge-indisponivel">
                  Indisponível
                </span>
              `
              : ""
          }

          ${slides}

        </div>

        <div class="product-info">

          <h3>
            ${produto.nome}
          </h3>

          ${
            produto.detalhes?.medida
              ? `
                <p>
                  Medida:
                  ${produto.detalhes.medida}
                </p>
              `
              : ""
          }

          <div class="price">
            R$ ${Number(produto.preco).toFixed(2)}
          </div>

          ${
            produtoDisponivel
              ? `
                <a
                  href="../../produto/index.html?${query.toString()}"
                  class="btn-primary"
                >
                  Ver detalhes
                </a>
              `
              : `
                <button
                  type="button"
                  class="btn-primary btn-indisponivel"
                  disabled
                >
                  Indisponível
                </button>
              `
          }

        </div>

      `;

      // ========================================
      // CARROSSEL
      // ========================================

      const imagensCard =
        div.querySelectorAll(
          ".carousel-image"
        );

      if (imagensCard.length > 1) {

        let atual = 0;

        setInterval(() => {

          imagensCard[atual]
            .classList
            .remove("active");

          atual =
            (atual + 1) %
            imagensCard.length;

          imagensCard[atual]
            .classList
            .add("active");

        }, 3000);

      }

      container.appendChild(div);

    });

  } catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );

    container.innerHTML =
      "<p>Erro ao carregar produtos</p>";
  }
}
