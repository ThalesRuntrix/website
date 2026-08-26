const API_URL =
  "https://carimbai-api.vercel.app/api";


// =========================================================
// ESTADO
// =========================================================

let senhaBackoffice = null;

let produtos = [];

let categorias = [];

let produtoEditando = null;


// =========================================================
// ELEMENTOS
// =========================================================

const loginBackoffice =
  document.getElementById("login-backoffice");

const backoffice =
  document.getElementById("backoffice");


// =========================================================
// LOGIN
// =========================================================

document
  .getElementById("form-login")
  .addEventListener("submit", async (e) => {

    e.preventDefault();

    const senha =
      document
        .getElementById("senha-backoffice")
        .value
        .trim();

    if (!senha) return;

    senhaBackoffice = senha;

    try {

      await carregarProdutos();

      loginBackoffice.style.display = "none";

      backoffice.classList.remove("auth-hidden");

    } catch (error) {

      senhaBackoffice = null;

      document
        .getElementById("login-erro")
        .textContent =
          "Senha inválida ou erro ao acessar o backoffice.";

      console.error(error);

    }

  });


// =========================================================
// HEADERS
// =========================================================

function getHeaders() {

  return {

    "Content-Type": "application/json",

    "X-Backoffice-Password":
      senhaBackoffice

  };

}


// =========================================================
// GET PRODUTOS
// =========================================================

async function carregarProdutos() {

  const response =
    await fetch(
      `${API_URL}/produtos?acao=backoffice`,
      {
        headers: getHeaders()
      }
    );


  if (!response.ok) {

    throw new Error(
      "Não foi possível carregar os produtos."
    );

  }


  const data =
    await response.json();


  /*
   * Mantemos flexibilidade caso o endpoint
   * retorne diretamente o array ou um objeto.
   */

  produtos =
    Array.isArray(data)
      ? data
      : data.produtos || [];


  prepararCategorias();

  renderizarProdutos();

}


// =========================================================
// CATEGORIAS
// =========================================================

function prepararCategorias() {

  const mapa = new Map();

  produtos.forEach(produto => {

    const categoriaId =
      produto.categoria_id ??
      produto.categorias?.id ??
      produto.categoria?.id;

    let categoriaNome =
      produto.categoria_nome ??
      produto.categorias?.nome ??
      produto.categoria?.nome;

    // Caso o endpoint retorne:
    // categoria: "carimbo"
    if (
      !categoriaNome &&
      typeof produto.categoria === "string"
    ) {
      categoriaNome = produto.categoria;
    }

    if (
      categoriaId !== undefined &&
      categoriaId !== null &&
      categoriaNome
    ) {

      mapa.set(
        String(categoriaId),
        String(categoriaNome)
      );

    }

  });

  categorias =
    [...mapa.entries()]
      .map(([id, nome]) => ({
        id,
        nome
      }))
      .sort((a, b) =>
        a.nome.localeCompare(
          b.nome,
          "pt-BR"
        )
      );


  // =========================================================
  // FILTRO DA TABELA
  // =========================================================

  const select =
    document.getElementById(
      "filtroCategoria"
    );

  if (select) {

    select.innerHTML = `
      <option value="">
        Todas as categorias
      </option>
    `;

    categorias.forEach(categoria => {

      select.innerHTML += `
        <option value="${categoria.id}">
          ${escapeHtml(categoria.nome)}
        </option>
      `;

    });

  }


  // =========================================================
  // SELECT DO FORMULÁRIO
  // =========================================================

  const selectForm =
    document.getElementById(
      "produtoCategoria"
    );

  if (selectForm) {

    selectForm.innerHTML = `
      <option value="">
        Selecione
      </option>
    `;

    categorias.forEach(categoria => {

      selectForm.innerHTML += `
        <option value="${categoria.id}">
          ${escapeHtml(categoria.nome)}
        </option>
      `;

    });

  }

}


// =========================================================
// FILTROS
// =========================================================

document
  .getElementById("buscaProduto")
  .addEventListener(
    "input",
    renderizarProdutos
  );


document
  .getElementById("filtroCategoria")
  .addEventListener(
    "change",
    renderizarProdutos
  );


// =========================================================
// RENDER TABELA
// =========================================================

function renderizarProdutos() {

  const busca =
    document
      .getElementById("buscaProduto")
      .value
      .trim()
      .toLowerCase();


  const categoriaFiltro =
    document
      .getElementById("filtroCategoria")
      .value;


  const filtrados =
    produtos.filter(produto => {

      const nome =
        String(
          produto.nome || ""
        ).toLowerCase();


      const correspondeBusca =
        !busca ||
        nome.includes(busca);


      const categoriaId =
        produto.categoria_id ??
        produto.categorias?.id ??
        produto.categoria?.id;


      const correspondeCategoria =
        !categoriaFiltro ||
        String(categoriaId) ===
          String(categoriaFiltro);


      return (
        correspondeBusca &&
        correspondeCategoria
      );

    });


  const estado =
    document.getElementById(
      "estadoTabela"
    );

  const wrapper =
    document.getElementById(
      "tableWrapper"
    );

  const body =
    document.getElementById(
      "produtosBody"
    );


  if (!filtrados.length) {

    estado.textContent =
      "Nenhum produto encontrado.";

    estado.style.display = "block";

    wrapper.style.display = "none";

    return;

  }


  estado.style.display = "none";

  wrapper.style.display = "block";


  body.innerHTML =
    filtrados
      .map(renderLinhaProduto)
      .join("");

}


// =========================================================
// LINHA
// =========================================================

function renderLinhaProduto(produto) {

  const categoria =
    produto.categoria ||
    produto.categoria_nome ||
    produto.categorias?.nome ||
    produto.categoria?.nome ||
    "-";

  const preco =
    Number(produto.preco ?? 0);


  return `
    <tr>

      <td>
        <strong>
          ${escapeHtml(produto.nome || "-")}
        </strong>
      </td>


      <td>
        ${escapeHtml(categoria)}
      </td>


      <td>
        R$ ${preco.toFixed(2)}
      </td>

      <td>
        <button
          type="button"
          class="btn btn-small"
          onclick="editarProduto(${produto.id})"
        >
          Editar
        </button>
      </td>

    </tr>
  `;
}


// =========================================================
// NOVO PRODUTO
// =========================================================

document
  .getElementById("btnNovoProduto")
  .addEventListener(
    "click",
    novoProduto
  );


function novoProduto() {

  produtoEditando = null;


  document
    .getElementById(
      "tituloModalProduto"
    )
    .textContent =
      "Novo produto";


  document
    .getElementById(
      "subtituloModalProduto"
    )
    .textContent =
      "Cadastre as informações do produto.";


  limparFormulario();


  abrirModal();

}


// =========================================================
// EDITAR
// =========================================================

window.editarProduto =
  async function editarProduto(id) {

    try {

      const response =
        await fetch(
          `${API_URL}/produtos?acao=backoffice&id=${id}`,
          {
            headers: getHeaders()
          }
        );

      if (!response.ok) {
        throw new Error(
          `Erro ao carregar produto (${response.status}).`
        );
      }

      const produto =
        await response.json();

      console.log(
        "Produto carregado para edição:",
        produto
      );

      produtoEditando =
        produto;

      preencherFormulario(
        produto
      );

      document
        .getElementById(
          "tituloModalProduto"
        )
        .textContent =
          "Editar produto";

      document
        .getElementById(
          "subtituloModalProduto"
        )
        .textContent =
          `Editando produto #${id}`;

      abrirModal();

    } catch (error) {

      console.error(
        "Erro ao editar produto:",
        error
      );

      alert(
        "Não foi possível carregar o produto."
      );
    }
  };


// =========================================================
// FORMULÁRIO
// =========================================================

function limparFormulario() {

  document.getElementById(
    "produtoNome"
  ).value = "";


  document.getElementById(
    "produtoCategoria"
  ).value = "";


  document.getElementById(
    "produtoPreco"
  ).value = "";


  document.getElementById(
    "detalhesProduto"
  ).innerHTML = "";


  document.getElementById(
    "variacoesContainer"
  ).innerHTML = "";


  document.getElementById(
    "skusContainer"
  ).innerHTML = "";


  document.getElementById(
    "imagensContainer"
  ).innerHTML = "";

}


// =========================================================
// CATEGORIA → DETALHES
// =========================================================

document
  .getElementById("produtoCategoria")
  .addEventListener(
    "change",
    renderDetalhes
  );


function renderDetalhes(valores = null) {

  const categoria =
    obterNomeCategoriaSelecionada();

  const container =
    document.getElementById(
      "detalhesProduto"
    );

  /*
   * Se não recebemos valores explicitamente,
   * preservamos os valores que já estão na tela.
   */
  if (valores === null) {

    valores = {};

    container
      .querySelectorAll("[data-detalhe]")
      .forEach(input => {

        valores[input.dataset.detalhe] =
          input.value;

      });

  }


  if (!categoria) {

    container.innerHTML = "";

    return;

  }


  if (categoria === "carimbo") {

    container.innerHTML = `
      <div class="form-grid">

        ${campo(
          "marca",
          "Marca"
        )}

        ${campo(
          "modelo",
          "Modelo"
        )}

        ${campo(
          "medida",
          "Medida"
        )}

        ${campo(
          "tipo_material",
          "Tipo de material"
        )}

      </div>
    `;

  }


  else if (categoria === "placa") {

    container.innerHTML = `
      <div class="form-grid">

        ${campo(
          "medida",
          "Medida"
        )}

        ${campo(
          "tipo_material",
          "Tipo de material"
        )}

        ${campo(
          "espessura",
          "Espessura"
        )}

      </div>
    `;

  }


  else if (categoria === "cracha") {

    container.innerHTML = `
      <div class="form-grid">

        ${campo(
          "medida",
          "Medida"
        )}

        ${campo(
          "tipo_material",
          "Tipo de material"
        )}

      </div>
    `;

  }


  else {

    container.innerHTML = "";

    return;

  }


  /*
   * Depois de criar os campos,
   * restauramos os valores existentes.
   */
  container
    .querySelectorAll("[data-detalhe]")
    .forEach(input => {

      const valor =
        valores[input.dataset.detalhe];

      if (valor !== undefined && valor !== null) {

        input.value = valor;

      }

    });

}


function campo(
  nome,
  label,
  valor = ""
) {

  return `
    <div class="form-group">

      <label>
        ${label}
      </label>

      <input
        type="text"
        data-detalhe="${nome}"
        value="${escapeAttr(valor ?? "")}"
      >

    </div>
  `;
}


function obterNomeCategoriaSelecionada() {

  const select =
    document.getElementById(
      "produtoCategoria"
    );


  const option =
    select.options[
      select.selectedIndex
    ];


  return option
    ?.textContent
    ?.trim()
    ?.toLowerCase() || "";

}


// =========================================================
// VARIAÇÕES
// =========================================================

document
  .getElementById(
    "btnAdicionarVariacao"
  )
  .addEventListener(
    "click",
    () => adicionarVariacao()
  );


function adicionarVariacao(
  variacao = {}
) {    

  const container =
    document.getElementById(
      "variacoesContainer"
    );


  const div =
    document.createElement("div");

    if (variacao.id) {
        div.dataset.id = variacao.id;
    }


  div.className =
    "produto-item-form";


  div.innerHTML = `

    <div class="form-grid">

      <div class="form-group">

        <label>
          Cor
        </label>

        <input
          type="text"
          data-campo="cor"
          value="${escapeAttr(
            variacao.cor || ""
          )}"
        >

      </div>


      <div class="form-group">

        <label>
          HEX
        </label>

        <input
          type="text"
          data-campo="hex"
          value="${escapeAttr(
            variacao.hex || ""
          )}"
          placeholder="#000000"
        >

      </div>


      <div class="form-group">

        <label>
          Imagem da variação
        </label>

        <input
          type="text"
          data-campo="imagem_url"
          value="${escapeAttr(
            variacao.imagem_url || ""
          )}"
        >

      </div>

    </div>


    <label class="checkbox-label">

      <input
        type="checkbox"
        data-campo="principal"
        ${variacao.principal ? "checked" : ""}
      >

      <span>
        Variação principal
      </span>

    </label>


    <button
      type="button"
      class="btn btn-small btn-danger"
      onclick="this.closest('.produto-item-form').remove()"
    >
      Remover
    </button>

  `;


  container.appendChild(div);

}


// =========================================================
// SKUS
// =========================================================

document
  .getElementById(
    "btnAdicionarSku"
  )
  .addEventListener(
    "click",
    () => adicionarSku()
  );


function adicionarSku(
  sku = {}
) {

  const container =
    document.getElementById(
      "skusContainer"
    );


  const div =
    document.createElement("div");

  if (sku.id) {
    div.dataset.id = sku.id;
    }


  div.className =
    "produto-item-form";


  div.innerHTML = `

    <div class="form-grid">

      ${campoSku(
        "sku",
        "SKU",
        sku.sku
      )}

      ${campoSku(
        "nome",
        "Nome",
        sku.nome
      )}

      ${campoSku(
        "cor",
        "Cor",
        sku.cor
      )}

      ${campoSku(
        "medida",
        "Medida",
        sku.medida
      )}

      ${campoSku(
        "material",
        "Material",
        sku.material
      )}

      ${campoSku(
        "preco",
        "Preço",
        sku.preco,
        "number"
      )}

    </div>


    <div class="form-group">

      <label>
        Descrição
      </label>

      <textarea
        data-campo="descricao"
      >${escapeHtml(
        sku.descricao || ""
      )}</textarea>

    </div>


    <label class="checkbox-label">

      <div class="sku-status">
        <span class="sku-status-label">Status:</span>

        <span class="status ${sku.ativo === true ? "status-ok" : "status-off"}">
          ${sku.ativo === true ? "Ativo" : "Inativo"}
        </span>
      </div>

    </label>


    <div class="form-group">

      <label>
        Variação vinculada
      </label>

      <select
        data-campo="produto_variacao_id"
      >

        ${renderOpcoesVariacoes(
          sku.produto_variacao_id
        )}

      </select>

    </div>


    <button
      type="button"
      class="btn btn-small btn-danger"
      onclick="this.closest('.produto-item-form').remove()"
    >
      Remover
    </button>

  `;


  container.appendChild(div);

}


function campoSku(
  nome,
  label,
  valor = "",
  tipo = "text"
) {

  return `

    <div class="form-group">

      <label>
        ${label}
      </label>

      <input
        type="${tipo}"
        data-campo="${nome}"
        value="${escapeAttr(
          valor ?? ""
        )}"
        ${tipo === "number"
          ? 'step="0.01" min="0"'
          : ""}
      >

    </div>

  `;

}


function renderOpcoesVariacoes(
  selecionada
) {

  const elementos =
    document.querySelectorAll(
      "#variacoesContainer .produto-item-form"
    );

  let html = `
    <option value="">
      Sem variação
    </option>
  `;

  elementos.forEach((el, index) => {

    const cor =
      el.querySelector(
        '[data-campo="cor"]'
      )?.value || "";

    const id =
      el.dataset.id;

    /*
     * Variação já existente no banco:
     * usamos o ID real.
     */
    if (id) {

      html += `
        <option
          value="${escapeAttr(id)}"
          ${String(selecionada) === String(id)
            ? "selected"
            : ""}
        >
          ${escapeHtml(
            cor || `Variação ${index + 1}`
          )}
        </option>
      `;

      return;
    }

    /*
     * Variação nova ainda não possui ID.
     *
     * Nesse caso não criamos aqui um falso
     * produto_variacao_id.
     */
    html += `
      <option
        value=""
        disabled
      >
        ${escapeHtml(
          cor || `Variação ${index + 1}`
        )} (nova)
      </option>
    `;

  });

  return html;

}


// =========================================================
// IMAGENS
// =========================================================

document
  .getElementById(
    "btnAdicionarImagem"
  )
  .addEventListener(
    "click",
    () => adicionarImagem()
  );


function adicionarImagem(
  imagem = {}
) {

  const container =
    document.getElementById(
      "imagensContainer"
    );


  const div =
    document.createElement("div");


  div.className =
    "produto-item-form";


  div.innerHTML = `

    <div class="form-grid">

      ${campoImagem(
        "imagem_url",
        "URL da imagem",
        imagem.imagem_url
      )}

      ${campoImagem(
        "tipo",
        "Tipo",
        imagem.tipo
      )}

      ${campoImagem(
        "ordem",
        "Ordem",
        imagem.ordem ?? 0,
        "number"
      )}

      ${campoImagem(
        "cor",
        "Cor",
        imagem.cor
      )}

    </div>


    <button
      type="button"
      class="btn btn-small btn-danger"
      onclick="this.closest('.produto-item-form').remove()"
    >
      Remover
    </button>

  `;


  container.appendChild(div);

}


function campoImagem(
  nome,
  label,
  valor = "",
  tipo = "text"
) {

  return `

    <div class="form-group">

      <label>
        ${label}
      </label>

      <input
        type="${tipo}"
        data-campo="${nome}"
        value="${escapeAttr(
          valor ?? ""
        )}"
        ${tipo === "number"
          ? 'step="1" min="0"'
          : ""}
      >

    </div>

  `;

}


// =========================================================
// SALVAR
// =========================================================

document
  .getElementById(
    "btnSalvarProduto"
  )
  .addEventListener(
    "click",
    salvarProduto
  );


async function salvarProduto() {

  const botao =
    document.getElementById(
      "btnSalvarProduto"
    );


  try {

    botao.disabled = true;

    botao.textContent =
      "Salvando...";


    const payload =
      montarPayload();


    const metodo =
      produtoEditando
        ? "PATCH"
        : "POST";


    let url =
      `${API_URL}/produtos?acao=backoffice`;


    if (produtoEditando) {

      url +=
        `&id=${produtoEditando.id}`;

    }


    const response =
      await fetch(
        url,
        {

          method: metodo,

          headers:
            getHeaders(),

          body:
            JSON.stringify(
              payload
            )

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Erro ao salvar produto."
      );

    }


    fecharModal();

    await carregarProdutos();


    alert(
      produtoEditando
        ? "Produto atualizado com sucesso."
        : "Produto cadastrado com sucesso."
    );


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Erro ao salvar produto."
    );

  } finally {

    botao.disabled = false;

    botao.textContent =
      "Salvar produto";

  }

}


// =========================================================
// MONTA PAYLOAD
// =========================================================

function montarPayload() {

  const nome =
    document
      .getElementById(
        "produtoNome"
      )
      .value
      .trim();


  const categoria_id =
    Number(
      document
        .getElementById(
          "produtoCategoria"
        )
        .value
    );


  const preco =
    Number(
      document
        .getElementById(
          "produtoPreco"
        )
        .value || 0
    );


  const detalhes = {};


  document
    .querySelectorAll(
      "#detalhesProduto [data-detalhe]"
    )
    .forEach(input => {

      detalhes[
        input.dataset.detalhe
      ] =
        input.value.trim();

    });


  const variacoes =
    [...document.querySelectorAll(
      "#variacoesContainer .produto-item-form"
    )]
    .map(el => {

      const objeto = {};


      const id =
        el.dataset.id;


      if (id) {
        objeto.id =
          Number(id);
      }


      el.querySelectorAll(
        "[data-campo]"
      )
      .forEach(input => {

        if (
          input.type ===
          "checkbox"
        ) {

          objeto[
            input.dataset.campo
          ] =
            input.checked;

        } else {

          objeto[
            input.dataset.campo
          ] =
            input.value.trim();

        }

      });


      return objeto;

    });


  const skus =
    [...document.querySelectorAll(
      "#skusContainer .produto-item-form"
    )]
    .map(el => {

      const objeto = {};


      if (el.dataset.id) {

        objeto.id =
          Number(el.dataset.id);

      }


      el.querySelectorAll(
        "[data-campo]"
      )
      .forEach(input => {

        const campo =
          input.dataset.campo;

        // O status do SKU é controlado exclusivamente
        // pela tela de estoque.
        if (campo === "ativo") {
          return;
        }


        if (
          input.type ===
          "checkbox"
        ) {

          objeto[campo] =
            input.checked;

        } else if (
          campo === "preco"
        ) {

          objeto[campo] =
            input.value === ""
              ? null
              : Number(
                  input.value
                );        

        } else if (
          campo ===
          "produto_variacao_id"
        ) {

          objeto[campo] =
            input.value === ""
              ? null
              : Number(
                  input.value
                );

        } else {

          objeto[campo] =
            input.value.trim();

        }

      });


      return objeto;

    });


  const imagens =
    [...document.querySelectorAll(
      "#imagensContainer .produto-item-form"
    )]
    .map(el => {

      const objeto = {};


      el.querySelectorAll(
        "[data-campo]"
      )
      .forEach(input => {

        const campo =
          input.dataset.campo;


        if (
          campo === "ordem"
        ) {

          objeto[campo] =
            Number(
              input.value || 0
            );

        } else {

          objeto[campo] =
            input.value.trim();

        }

      });


      return objeto;

    });


  return {

    nome,

    categoria_id,

    preco,

    detalhes,

    variacoes,

    skus,

    imagens

  };

}


// =========================================================
// PREENCHER EDIÇÃO
// =========================================================

function preencherFormulario(produto) {

  limparFormulario();

  // =========================================================
  // DADOS BÁSICOS
  // =========================================================

  document.getElementById(
    "produtoNome"
  ).value =
    produto.nome ?? "";


  const categoriaId =
    produto.categoria_id ??
    produto.categorias?.id ??
    produto.categoria?.id ??
    null;


  const selectCategoria =
    document.getElementById(
      "produtoCategoria"
    );


  if (
    categoriaId !== null &&
    categoriaId !== undefined &&
    categoriaId !== ""
  ) {

    selectCategoria.value =
      String(categoriaId);

  } else {

    selectCategoria.value = "";

  }  


  document.getElementById(
    "produtoPreco"
  ).value =
    produto.preco ?? "";


  const detalhes =
    produto.detalhes ||
    produto.carimbos?.[0] ||
    produto.placas?.[0] ||
    produto.crachas?.[0] ||
    {};


  renderDetalhes(detalhes);


  const variacoes =
    produto.produto_variacoes ||
    produto.variacoes ||
    [];

  variacoes.forEach(
    variacao =>
      adicionarVariacao(variacao)
  );


  const skus =
    produto.produto_skus ||
    produto.skus ||
    [];

  skus.forEach(
    sku =>
      adicionarSku(sku)
  );


  const imagens =
    produto.produto_imagens ||
    produto.imagens ||
    [];

  imagens.forEach(
    imagem =>
      adicionarImagem(imagem)
  );

}


// =========================================================
// MODAL
// =========================================================

function abrirModal() {

  document
    .getElementById(
      "modalProduto"
    )
    .classList.add("open");

}


function fecharModal() {

  document
    .getElementById(
      "modalProduto"
    )
    .classList.remove("open");

}


document
  .getElementById(
    "btnFecharProduto"
  )
  .addEventListener(
    "click",
    fecharModal
  );


document
  .getElementById(
    "btnCancelarProduto"
  )
  .addEventListener(
    "click",
    fecharModal
  );


// =========================================================
// UTILITÁRIOS
// =========================================================

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttr(value) {

  return escapeHtml(value);

}
