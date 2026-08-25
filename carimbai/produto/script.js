const API_URL = "https://carimbai-api.vercel.app/api";

// 🔥 pegar ID da URL
function getProdutoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ESTADO GLOBAL
window._produto = null;
window._variacoes = [];
window._corAtual = 0;
window._imagemAtual = 0;
window._temEscolhaCor = false;

// ATUALIZA IMAGEM
function atualizarImagem() {

  const img = document.getElementById("produto-img");
  if (!img) return;

  const variacao = window._variacoes[window._corAtual];
  if (!variacao) return;

  const imagem = variacao.imagens?.[window._imagemAtual];
  if (!imagem) return;

  img.src = imagem.imagem_url;

}

// PRÓXIMA IMAGEM
function proximaImagem() {

  const imagens =
    window._variacoes[window._corAtual].imagens;

  if (!imagens || imagens.length <= 1) return;

  window._imagemAtual++;

  if (window._imagemAtual >= imagens.length) {
    window._imagemAtual = 0;
  }

  atualizarImagem();

}

// IMAGEM ANTERIOR
function imagemAnterior() {

  const imagens =
    window._variacoes[window._corAtual].imagens;

  if (!imagens || imagens.length <= 1) return;

  window._imagemAtual--;

  if (window._imagemAtual < 0) {
    window._imagemAtual = imagens.length - 1;
  }

  atualizarImagem();

}

// TROCAR COR
function trocarCor(index) {

  const variacao = window._variacoes[index];

  if (!variacao) return;

  // Não permite selecionar variação indisponível
  if (!variacao.disponivel) {
    return;
  }

  window._corAtual = index;
  window._imagemAtual = 0;

  atualizarImagem();

  document.querySelectorAll(".cor-option").forEach(el => {
    el.classList.remove("ativa");
  });

  const opcao = document.querySelectorAll(".cor-option")[index];

  if (opcao) {
    opcao.classList.add("ativa");
  }

  atualizarInterfaceCompra();

}


// BUSCA PREÇO DO PRODUTO
function obterPrecoProduto(produto) {
  const variacaoComPreco = produto.variacoes?.find(
    v => v.preco !== null && v.preco !== undefined
  );

  if (variacaoComPreco) {
    return Number(variacaoComPreco.preco);
  }

  return Number(produto.preco || 0);
}

// RENDERIZA PRODUTO
function renderProduto(produto) {

   const container =
    document.getElementById("produto-container");

  // =========================================================
  // SALVA ESTADO
  // =========================================================

  window._produto = produto;
  window._variacoes = produto.variacoes || [];
  window._imagemAtual = 0;

  window._temEscolhaCor =
    window._variacoes.length > 1;

  // =========================================================
  // DEFINE A VARIAÇÃO INICIAL
  // =========================================================

  const primeiroIndiceDisponivel =
    window._variacoes.findIndex(
      v => v.disponivel === true
    );

  window._corAtual =
    primeiroIndiceDisponivel >= 0
      ? primeiroIndiceDisponivel
      : 0;

  let coresHTML = "";

  // cores
  if (produto.variacoes && produto.variacoes.length > 1) {

    coresHTML = `
      <div class="cores">
        <p>Escolha a cor:</p>

        <div class="cores-lista">

          ${produto.variacoes.map((v, i) => `

            <div
              class="
                cor-option
                ${i === window._corAtual ? "ativa" : ""}
                ${!v.disponivel ? "indisponivel" : ""}
              "
              style="background:${v.hex || "#ccc"}"
              onclick="trocarCor(${i})"
              title="${v.cor}${!v.disponivel ? " - Indisponível" : ""}">
            </div>

          `).join("")}

        </div>

      </div>
    `;

  }

  // primeira imagem da primeira cor
  const imgInicial =
  window._variacoes[window._corAtual]
    ?.imagens?.[0]
    ?.imagem_url || "";

  const totalImagens =
  window._variacoes[window._corAtual]
    ?.imagens?.length || 0;

  container.innerHTML = `

    <div class="produto-content">

      <div class="produto-galeria">

        ${totalImagens > 1 ? `
          <button
            class="galeria-btn esquerda"
            onclick="imagemAnterior()">
            ❮
          </button>
        ` : ""}

        <img
          id="produto-img"
          src="${imgInicial}"
          alt="${produto.nome}">

        ${totalImagens > 1 ? `
          <button
            class="galeria-btn direita"
            onclick="proximaImagem()">
            ❯
          </button>
        ` : ""}

      </div>

      <div class="produto-title">
        ${produto.nome}
      </div>

      <div class="produto-preco">
        R$ ${obterPrecoProduto(produto).toFixed(2)}
      </div>

      ${coresHTML}

      <button
        id="btn-comprar"
        class="btn-primary"
        onclick="irCheckout()">
        📲 Comprar Agora
      </button>

    </div>

  `;

  atualizarInterfaceCompra();

}

// ATUALIZA O ESTADO DA COMPRA
function atualizarInterfaceCompra() {

  const botao = document.getElementById("btn-comprar");

  if (!botao) return;

  const variacao =
    window._variacoes[window._corAtual];

  if (!variacao || !variacao.disponivel) {

    botao.disabled = true;
    botao.textContent = "Indisponível";
    botao.classList.add("indisponivel");

    return;
  }

  botao.disabled = false;
  botao.textContent = "📲 Comprar Agora";
  botao.classList.remove("indisponivel");

}

function irCheckout() {

  const variacao =
    window._variacoes[window._corAtual];

  if (!variacao) {
    return;
  }

  // Não permite compra sem SKU disponível
  if (
    !variacao.sku_id ||
    !variacao.disponivel
  ) {
    return;
  }

  let url =
    `/carimbai/checkout/index.html` +
    `?id=${window._produto.id}`;

  // Envia o SKU
  url += `&sku_id=${encodeURIComponent(variacao.sku_id)}`;

  // Mantém a cor por compatibilidade com o checkout atual
  if (variacao.cor) {

    url +=
      `&variacao=${encodeURIComponent(variacao.cor)}`;

  }

  window.location.href = url;

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
      title: "Carimbo",
      description: "Confira se o carimbo abaixo é o que procura e clique no Botão: Comprar Agora"
    };
  }

  if (from.includes("placas")) {
    return {
      title: "Placa",
      description: "Confira se a placa abaixo é o que procura e clique no Botão: Comprar Agora"
    };
  }

  if (from.includes("crachas")) {
    return {
      title: "Crachá",
      description: "Confira se o crachá abaixo é o que procura e clique no Botão: Comprar Agora"
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
