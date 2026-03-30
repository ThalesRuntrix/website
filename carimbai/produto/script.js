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

function getParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function getContextFromParam() {
  const from = getParam("from");

  if (!from) return null;

  if (from.includes("carimbos")) {
    return {
      title: "Carimbos",
      description: "Escolha o modelo ideal para seu uso profissional"
    };
  }

  if (from.includes("placas")) {
    return {
      title: "Placas",
      description: "Escolha o material ideal para sua placa"
    };
  }

  if (from.includes("cartoes")) {
    return {
      title: "Cartões",
      description: "Escolha o tipo ideal"
    };
  }

  return null;
}

async function loadHeader(config = {}) {
  // 🔥 carrega HTML do header
  await loadComponent("header", "/carimbai/components/header.html");

  // 🔥 pega elementos
  const titleEl = document.getElementById("header-title");
  const descEl = document.getElementById("header-desc");
  const extraEl = document.getElementById("header-extra");

  // 🔥 título
  if (titleEl) {
    titleEl.textContent = config.title || "Carimbai";
  }

  // 🔥 descrição
  if (descEl) {
    descEl.textContent = config.description || "";
  }

  // 🔥 conteúdo extra (botão, etc)
  if (extraEl) {
    extraEl.innerHTML = config.extra || "";
  }
}

function configurarBotaoVoltar() {
  const origem = getParam("from");
  const btn = document.getElementById("btn-voltar");

  if (!btn) return;

  if (origem) {
    btn.href = "/carimbai/" + origem.replace("-", "/") + "/index.html";
  } else {
    btn.href = "#"; // evita comportamento estranho
    btn.onclick = (e) => {
      e.preventDefault();
      history.back();
    };
  }
}

carregarProduto();
configurarBotaoVoltar();
