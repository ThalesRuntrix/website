const API_URL = "https://carimbai-api.vercel.app/api";

// 🔥 pegar ID da URL
function getProdutoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 🔥 trocar cor (imagem)
function trocarCor(index) {
  const img = document.getElementById("produto-img");

  img.src = window._variacoes[index].imagem_url;

  document.querySelectorAll(".cor-option").forEach(el => {
    el.classList.remove("ativa");
  });

  document.querySelectorAll(".cor-option")[index].classList.add("ativa");
}

// 🔥 renderizar produto
function renderProduto(produto) {
  const container = document.getElementById("produto-container");

  let coresHTML = "";

  // 🔥 cores dinâmicas vindas da API
  if (produto.variacoes && produto.variacoes.length > 0) {
    coresHTML = `
      <div class="cores">
        <p>Escolha a cor:</p>
        <div class="cores-lista">
          ${produto.variacoes.map((v, i) => `
            <div 
              class="cor-option ${i === 0 ? 'ativa' : ''}"
              style="background:${v.hex}"
              onclick="trocarCor(${i})"
              title="${v.cor}">
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  const imgInicial =
    produto.variacoes?.[0]?.imagem_url || "../img/texto.jpg";

  container.innerHTML = `
    <div class="produto-content">

      <img id="produto-img" src="${imgInicial}" alt="${produto.nome}">

      <div class="produto-title">
        ${produto.nome}
      </div>

      <div class="produto-preco">
        R$ ${Number(produto.preco).toFixed(2)}
      </div>

      ${coresHTML}

      <a class="btn-primary" 
         href="https://wa.me/5511943722620?text=Olá,%20quero%20o%20produto%20${encodeURIComponent(produto.nome)}">
        📲 Comprar via WhatsApp
      </a>

    </div>
  `;

  // 🔥 salva variações globalmente
  window._variacoes = produto.variacoes || [];
}

// 🔥 carregar produto da API
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




/*const API_URL = "https://carimbai-api.vercel.app/api";

const VARIACOES = {
  1: { // ID do produto
    cores: [
      { nome: "Preto", cor: "#000", img: "../img/4911-preto.jpg" },
      { nome: "Vermelho", cor: "#ff0000", img: "../img/4911-vermelho.jpg" },
      { nome: "Azul", cor: "#0000ff", img: "../img/4911-azul.jpg" }
    ]
  }
};

// 🔥 pegar ID da URL
function getProdutoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 🔥 renderizar produto
function renderProduto(produto) {
  const container = document.getElementById("produto-container");

  let coresHTML = "";

  if (produto.variacoes?.length > 0) {
    coresHTML = `
      <div class="cores">
        <p>Escolha a cor:</p>
        <div class="cores-lista">
          ${produto.variacoes.map((v, i) => `
            <div 
              class="cor-option ${i === 0 ? 'ativa' : ''}"
              style="background:${v.hex}"
              onclick="trocarCor(${i})"
              title="${v.cor}">
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  const imgInicial = produto.variacoes?.[0]?.imagem_url || "../img/texto.jpg";

  container.innerHTML = `
    <div class="produto-content">

      <img id="produto-img" src="${imgInicial}">

      <div class="produto-title">${produto.nome}</div>

      <div class="produto-preco">
        R$ ${Number(produto.preco).toFixed(2)}
      </div>

      ${coresHTML}

      <a class="btn-primary">
        📲 Comprar via WhatsApp
      </a>

    </div>
  `;

  // salvar global (pra trocar depois)
  window._variacoes = produto.variacoes;
}

function trocarCor(index) {
  const img = document.getElementById("produto-img");

  img.src = window._variacoes[index].imagem_url;

  document.querySelectorAll(".cor-option").forEach(el => {
    el.classList.remove("ativa");
  });

  document.querySelectorAll(".cor-option")[index].classList.add("ativa");
}

*/

/* function renderProduto(produto) {
  const container = document.getElementById("produto-container");

  const variacoes = VARIACOES[produto.id];
  let coresHTML = "";

  if (variacoes && variacoes.cores) {
    coresHTML = `
      <div class="cores">
        <p>Escolha a cor:</p>
        <div class="cores-lista">
          ${variacoes.cores.map((c, i) => `
            <div 
              class="cor-option ${i === 0 ? 'ativa' : ''}" 
              style="background:${c.cor}" 
              onclick="trocarCor(${produto.id}, ${i})"
              title="${c.nome}">
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  const imgInicial = variacoes?.cores?.[0]?.img || "../img/texto.jpg";

  container.innerHTML = `
    <div class="produto-content">

      <img id="produto-img" src="${imgInicial}" alt="${produto.nome}">

      <div class="produto-title">${produto.nome}</div>

      <div class="produto-preco">
        R$ ${Number(produto.preco).toFixed(2)}
      </div>

      ${coresHTML}

      <a class="btn-primary" href="https://wa.me/5511943722620?text=Olá,%20quero%20um%20${produto.detalhes}">
        📲 Comprar via WhatsApp
      </a>

    </div>
  `;
}

// 🔥 trocar cor
function trocarCor(produtoId, index) {
  const variacoes = VARIACOES[produtoId];
  const img = document.getElementById("produto-img");

  img.src = variacoes.cores[index].img;

  // atualizar seleção visual
  document.querySelectorAll(".cor-option").forEach(el => {
    el.classList.remove("ativa");
  });

  document.querySelectorAll(".cor-option")[index].classList.add("ativa");
}
*/