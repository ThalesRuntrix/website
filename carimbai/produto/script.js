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
window._quantidade = 1;

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

// =========================================================
// QUANTIDADE
// =========================================================

function atualizarQuantidade(valor) {

  let quantidade = Number(valor);

  if (!Number.isInteger(quantidade)) {
    quantidade = 1;
  }

  quantidade = Math.max(1, Math.min(50, quantidade));

  window._quantidade = quantidade;

  const input = document.getElementById("input-quantidade");

  if (input) {
    input.value = quantidade;
  }
}


function diminuirQuantidade() {

  atualizarQuantidade(
    window._quantidade - 1
  );
}


function aumentarQuantidade() {

  const variacao =
    window._variacoes[window._corAtual];

  if (!variacao) {
    return;
  }

  let limite = 10;

  /*
    disponibilidade já vem da API.
    Para esta primeira implementação,
    o backend continua sendo a autoridade.
  */

  atualizarQuantidade(
    window._quantidade + 1
  );
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

      <div class="quantidade-box">

        <p>Quantidade:</p>

        <div class="quantidade-controle">

          <button
            type="button"
            class="quantidade-btn"
            onclick="diminuirQuantidade()"
            aria-label="Diminuir quantidade">
            −
          </button>

          <input
            type="number"
            id="input-quantidade"
            value="1"
            min="1"
            max="10"
            inputmode="numeric"
            aria-label="Quantidade">

          <button
            type="button"
            class="quantidade-btn"
            onclick="aumentarQuantidade()"
            aria-label="Aumentar quantidade">
            +
          </button>

        </div>

      </div>


      <div class="produto-acoes">

        <button
          id="btn-adicionar-carrinho"
          class="btn-secondary"
          onclick="adicionarAoCarrinho()">
          🛒 Adicionar ao carrinho
        </button>

        <button
          id="btn-comprar"
          class="btn-primary"
          onclick="comprarAgora()">
          📲 Comprar Agora
        </button>

      </div>

    </div>

  `;

  atualizarInterfaceCompra();

  const inputQuantidade =
  document.getElementById("input-quantidade");

  if (inputQuantidade) {

    inputQuantidade.addEventListener(
      "input",
      function () {
        atualizarQuantidade(this.value);
      }
    );

  }

}

// ATUALIZA O ESTADO DA COMPRA
function atualizarInterfaceCompra() {

  const botaoComprar =
    document.getElementById("btn-comprar");

  const botaoCarrinho =
    document.getElementById(
      "btn-adicionar-carrinho"
    );

  if (!botaoComprar && !botaoCarrinho) {
    return;
  }

  const variacao =
    window._variacoes[window._corAtual];


  // =========================================================
  // SEM VARIAÇÃO DISPONÍVEL
  // =========================================================

  if (
    !variacao ||
    !variacao.disponivel ||
    !variacao.sku_id
  ) {

    if (botaoComprar) {

      botaoComprar.disabled = true;

      botaoComprar.textContent =
        "Indisponível";

      botaoComprar.classList.add(
        "indisponivel"
      );
    }


    if (botaoCarrinho) {

      botaoCarrinho.disabled = true;

      botaoCarrinho.textContent =
        "Indisponível";

      botaoCarrinho.classList.add(
        "indisponivel"
      );
    }

    return;
  }


  // =========================================================
  // DISPONÍVEL
  // =========================================================

  if (botaoComprar) {

    botaoComprar.disabled = false;

    botaoComprar.textContent =
      "📲 Comprar Agora";

    botaoComprar.classList.remove(
      "indisponivel"
    );
  }


  if (botaoCarrinho) {

    botaoCarrinho.disabled = false;

    botaoCarrinho.textContent =
      "🛒 Adicionar ao carrinho";

    botaoCarrinho.classList.remove(
      "indisponivel"
    );
  }
}

async function adicionarAoCarrinho() {

  const variacao =
    window._variacoes[window._corAtual];

  if (!variacao) {
    return;
  }


  if (
    !variacao.sku_id ||
    !variacao.disponivel
  ) {

    alert(
      "Este produto está indisponível."
    );

    return;
  }


  const quantidade =
    Number(window._quantidade);


  if (
    !Number.isInteger(quantidade) ||
    quantidade < 1 ||
    quantidade > 50
  ) {

    alert(
      "Quantidade inválida."
    );

    return;
  }


  const botao =
    document.getElementById(
      "btn-adicionar-carrinho"
    );


  if (!botao) {
    return;
  }


  const textoOriginal =
    botao.innerHTML;


  try {

    botao.disabled = true;

    botao.innerHTML =
      "Adicionando...";


    const token =
      localStorage.getItem(
        "carimbai_cart_token"
      );


    const payload = {

      token:
        token || undefined,

      produto_id:
        Number(window._produto.id),

      produto_sku_id:
        Number(variacao.sku_id),

      quantidade,

      variacao:
        variacao.cor || null,

      configuracao: {
        cor:
          variacao.cor || null
      }
    };


    const response =
      await fetch(
        `${API_URL}/carrinho`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(payload)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Erro ao adicionar produto ao carrinho."
      );
    }


    // =======================================================
    // SALVA TOKEN
    // =======================================================

    if (data.token) {

      localStorage.setItem(
        "carimbai_cart_token",
        data.token
      );
    }


    // =======================================================
    // ATUALIZA CONTADOR
    // =======================================================

    atualizarContadorCarrinho(
      data.quantidade_itens
    );


    // =======================================================
    // FEEDBACK
    // =======================================================

    botao.innerHTML =
      "✓ Adicionado ao carrinho";


    setTimeout(() => {

      botao.innerHTML =
        textoOriginal;

      botao.disabled =
        false;

    }, 1500);


  } catch (error) {

    console.error(
      "Erro ao adicionar ao carrinho:",
      error
    );


    alert(
      error.message ||
      "Erro ao adicionar produto ao carrinho."
    );


    botao.innerHTML =
      textoOriginal;

    botao.disabled =
      false;
  }
}

function atualizarContadorCarrinho(
  quantidade
) {

  const contador =
    document.getElementById(
      "contador-carrinho"
    );

  if (!contador) {
    return;
  }


  const valor =
    Number(quantidade) || 0;


  contador.textContent =
    valor;


  if (valor > 0) {

    contador.classList.add(
      "ativo"
    );

  } else {

    contador.classList.remove(
      "ativo"
    );
  }
}

async function comprarAgora() {

  const variacao =
    window._variacoes[window._corAtual];

  if (!variacao) {
    return;
  }


  if (
    !variacao.sku_id ||
    !variacao.disponivel
  ) {

    alert(
      "Este produto está indisponível."
    );

    return;
  }


  const quantidade =
    Number(window._quantidade);


  if (
    !Number.isInteger(quantidade) ||
    quantidade < 1 ||
    quantidade > 50
  ) {

    alert(
      "Quantidade inválida."
    );

    return;
  }


  const botao =
    document.getElementById(
      "btn-comprar"
    );


  if (!botao) {
    return;
  }


  const textoOriginal =
    botao.innerHTML;


  try {

    botao.disabled = true;

    botao.innerHTML =
      "Processando...";


    const token =
      localStorage.getItem(
        "carimbai_cart_token"
      );


    const payload = {

      token:
        token || undefined,

      produto_id:
        Number(window._produto.id),

      produto_sku_id:
        Number(variacao.sku_id),

      quantidade,

      variacao:
        variacao.cor || null,

      configuracao: {
        cor:
          variacao.cor || null
      }
    };


    const response =
      await fetch(
        `${API_URL}/carrinho`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(payload)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Erro ao adicionar produto ao carrinho."
      );
    }


    if (data.token) {

      localStorage.setItem(
        "carimbai_cart_token",
        data.token
      );
    }


    // =======================================================
    // VAI PARA O CARRINHO
    // =======================================================

    window.location.href =
      "/carimbai/carrinho/index.html";


  } catch (error) {

    console.error(
      "Erro em comprarAgora:",
      error
    );


    alert(
      error.message ||
      "Erro ao processar compra."
    );


    botao.innerHTML =
      textoOriginal;

    botao.disabled =
      false;
  }
}

/*
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
*/

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
      description: "Escolha a quantidade e clique em 'Comprar Agora'"
    };
  }

  if (from.includes("placas")) {
    return {
      title: "Placa",
      description: "Escolha a quantidade e clique em 'Comprar Agora'"
    };
  }

  if (from.includes("crachas")) {
    return {
      title: "Crachá",
      description: "Escolha a quantidade e clique em 'Comprar Agora'"
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
