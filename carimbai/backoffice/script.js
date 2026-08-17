const API_URL = "https://carimbai-api.vercel.app/api/estoque";

  let estoqueData = [];
  let skuSelecionado = null;

  const $ = (id) => document.getElementById(id);


  // =====================================================
  // CARREGAR ESTOQUE
  // =====================================================

  async function carregarEstoque() {

    $("estadoTabela").style.display = "block";
    $("estadoTabela").className = "state";
    $("estadoTabela").textContent = "Carregando estoque...";

    $("tableWrapper").style.display = "none";

    try {

      const response = await fetch(API_URL);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Erro ao buscar estoque"
        );
      }

      estoqueData = Array.isArray(data)
        ? data
        : [];

      atualizarResumo();

      renderizarTabela();

    } catch (error) {

      console.error(error);

      $("estadoTabela").className =
        "state error";

      $("estadoTabela").textContent =
        error.message || "Erro ao carregar estoque";

      $("tableWrapper").style.display = "none";
    }
  }


  // =====================================================
  // RESUMO
  // =====================================================

  function atualizarResumo() {

    const total = estoqueData.length;

    const comEstoque =
      estoqueData.filter(
        item => Number(item.estoque) > 0
      ).length;

    const semEstoque =
      estoqueData.filter(
        item => Number(item.estoque) === 0
      ).length;

    const baixoEstoque =
      estoqueData.filter(
        item =>
          Number(item.estoque) > 0 &&
          Number(item.estoque_minimo) > 0 &&
          Number(item.estoque) <= Number(item.estoque_minimo)
      ).length;

    $("totalSkus").textContent = total;
    $("skusComEstoque").textContent = comEstoque;
    $("skusSemEstoque").textContent = semEstoque;
    $("skusEstoqueBaixo").textContent = baixoEstoque;
  }


  // =====================================================
  // FILTRAR
  // =====================================================

  function getDadosFiltrados() {

    const busca =
      $("busca").value
        .trim()
        .toLowerCase();

    const status =
      $("filtroStatus").value;

    return estoqueData.filter(item => {

      const textoBusca = [

        item.produto,
        item.sku,
        item.cor

      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (
        busca &&
        !textoBusca.includes(busca)
      ) {
        return false;
      }

      const estoque =
        Number(item.estoque);

      const minimo =
        Number(item.estoque_minimo);

      if (status === "estoque" && estoque <= 0) {
        return false;
      }

      if (status === "zero" && estoque !== 0) {
        return false;
      }

      if (
        status === "baixo" &&
        !(
          estoque > 0 &&
          minimo > 0 &&
          estoque <= minimo
        )
      ) {
        return false;
      }

      if (
        status === "inativo" &&
        item.ativo !== false
      ) {
        return false;
      }

      return true;
    });
  }


  // =====================================================
  // STATUS
  // =====================================================

  function getStatus(item) {

    if (item.ativo === false) {

      return {
        texto: "Inativo",
        classe: "status-off"
      };
    }

    const estoque =
      Number(item.estoque);

    const minimo =
      Number(item.estoque_minimo);

    if (estoque === 0) {

      return {
        texto: "Sem estoque",
        classe: "status-zero"
      };
    }

    if (
      minimo > 0 &&
      estoque <= minimo
    ) {

      return {
        texto: "Estoque baixo",
        classe: "status-low"
      };
    }

    return {
      texto: "Disponível",
      classe: "status-ok"
    };
  }


  // =====================================================
  // RENDER TABELA
  // =====================================================

  function renderizarTabela() {

    const dados =
      getDadosFiltrados();

    const body =
      $("estoqueBody");

    body.innerHTML = "";

    if (dados.length === 0) {

      $("estadoTabela").style.display =
        "block";

      $("estadoTabela").className =
        "state";

      $("estadoTabela").textContent =
        "Nenhum SKU encontrado.";

      $("tableWrapper").style.display =
        "none";

      return;
    }

    $("estadoTabela").style.display =
      "none";

    $("tableWrapper").style.display =
      "block";


    for (const item of dados) {

      const status =
        getStatus(item);

      const tr =
        document.createElement("tr");


      tr.innerHTML = `

        <td>

          <strong>
            ${escapeHtml(item.produto || "-")}
          </strong>

        </td>

        <td>

          <strong>
            ${escapeHtml(item.sku || "-")}
          </strong>

          <div class="sku">
            ID ${item.id}
          </div>

        </td>

        <td>
          ${escapeHtml(item.cor || "-")}
        </td>

        <td>

          <div class="stock">
            ${Number(item.estoque)}
          </div>

          <div class="sku">
            Mínimo: ${Number(item.estoque_minimo)}
          </div>

        </td>

        <td>

          <span
            class="status ${status.classe}"
          >
            ${status.texto}
          </span>

        </td>

        <td>

          <div class="actions">

            <button
              class="btn btn-small btn-secondary"
              data-action="movimentar"
              data-id="${item.id}"
            >
              Movimentar
            </button>

            <button
              class="btn btn-small btn-secondary"
              data-action="historico"
              data-id="${item.id}"
            >
              Histórico
            </button>

          </div>

        </td>

      `;

      body.appendChild(tr);
    }
  }


  // =====================================================
  // EVENTOS DA TABELA
  // =====================================================

  $("estoqueBody").addEventListener(
    "click",
    async (event) => {

      const button =
        event.target.closest("button");

      if (!button) {
        return;
      }

      const id =
        Number(button.dataset.id);

      const item =
        estoqueData.find(
          x => Number(x.id) === id
        );

      if (!item) {
        return;
      }

      if (
        button.dataset.action ===
        "movimentar"
      ) {

        abrirModalMovimentacao(item);
      }

      if (
        button.dataset.action ===
        "historico"
      ) {

        await abrirHistorico(item);
      }
    }
  );


  // =====================================================
  // MODAL MOVIMENTAÇÃO
  // =====================================================

  function abrirModalMovimentacao(item) {

    skuSelecionado = item;

    $("modalSkuNome").textContent =
      `${item.produto} • ${item.sku}`;

    $("modalEstoqueAtual").textContent =
      Number(item.estoque);

    $("tipoMovimentacao").value =
      "entrada";

    $("quantidade").value =
      "";

    $("estoqueFinal").value =
      Number(item.estoque);

    $("motivo").value =
      "";

    $("observacao").value =
      "";

    atualizarCamposMovimentacao();

    $("modalMovimentacao")
      .classList.add("open");
  }


  function fecharModalMovimentacao() {

    $("modalMovimentacao")
      .classList.remove("open");

    skuSelecionado = null;
  }


  function atualizarCamposMovimentacao() {

    const tipo =
      $("tipoMovimentacao").value;

    if (tipo === "ajuste") {

      $("grupoQuantidade").style.display =
        "none";

      $("grupoEstoqueFinal").style.display =
        "block";

    } else {

      $("grupoQuantidade").style.display =
        "block";

      $("grupoEstoqueFinal").style.display =
        "none";
    }
  }


  // =====================================================
  // SALVAR MOVIMENTAÇÃO
  // =====================================================

  async function salvarMovimentacao() {

    if (!skuSelecionado) {
      return;
    }

    const tipo =
      $("tipoMovimentacao").value;

    const payload = {

      produto_sku_id:
        Number(skuSelecionado.id),

      tipo,

      motivo:
        $("motivo").value.trim() || null,

      observacao:
        $("observacao").value.trim() || null
    };


    if (
      tipo === "entrada" ||
      tipo === "saida"
    ) {

      const quantidade =
        Number($("quantidade").value);

      if (
        !Number.isInteger(quantidade) ||
        quantidade <= 0
      ) {

        alert(
          "Informe uma quantidade válida."
        );

        return;
      }

      payload.quantidade =
        quantidade;
    }


    if (tipo === "ajuste") {

      const estoqueFinal =
        Number($("estoqueFinal").value);

      if (
        !Number.isInteger(estoqueFinal) ||
        estoqueFinal < 0
      ) {

        alert(
          "Informe um estoque final válido."
        );

        return;
      }

      payload.estoque_final =
        estoqueFinal;
    }


    const button =
      $("btnSalvarMovimentacao");

    button.disabled = true;
    button.textContent =
      "Salvando...";


    try {

      const response =
        await fetch(API_URL, {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(payload)
        });


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.error ||
          "Erro ao registrar movimentação"
        );
      }


      fecharModalMovimentacao();

      await carregarEstoque();

      alert(
        `Movimentação registrada.\n\n` +
        `Estoque: ` +
        `${data.estoque_anterior} → ` +
        `${data.estoque_posterior}`
      );


    } catch (error) {

      console.error(error);

      alert(
        error.message ||
        "Erro ao registrar movimentação."
      );

    } finally {

      button.disabled = false;
      button.textContent =
        "Registrar";
    }
  }


  // =====================================================
  // HISTÓRICO
  // =====================================================

  async function abrirHistorico(item) {

    $("historicoSkuNome").textContent =
      `${item.produto} • ${item.sku}`;

    $("historicoConteudo").innerHTML =
      `<div class="state">Carregando...</div>`;

    $("modalHistorico")
      .classList.add("open");


    try {

      const response =
        await fetch(
          `${API_URL}?id=${item.id}&historico=true`
        );

      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.error ||
          "Erro ao buscar histórico"
        );
      }


      if (!Array.isArray(data) ||
          data.length === 0) {

        $("historicoConteudo").innerHTML =
          `<div class="state">
             Nenhuma movimentação registrada.
           </div>`;

        return;
      }


      $("historicoConteudo").innerHTML =
        "";


      for (const mov of data) {

        const dataFormatada =
          formatarData(mov.created_at);

        const div =
          document.createElement("div");

        div.className =
          "history-item";


        const sinal =
          mov.tipo === "saida"
            ? "-"
            : mov.tipo === "entrada"
              ? "+"
              : "";


        div.innerHTML = `

          <div class="history-top">

            <div>

              <div
                class="history-type ${escapeHtml(mov.tipo)}"
              >
                ${escapeHtml(mov.tipo)}
              </div>

              <div class="history-meta">
                ${escapeHtml(
                  mov.motivo || "Sem motivo informado"
                )}
              </div>

            </div>

            <strong>
              ${sinal}${Number(mov.quantidade)}
            </strong>

          </div>

          <div class="history-meta">
            Estoque:
            ${Number(mov.estoque_anterior)}
            →
            ${Number(mov.estoque_posterior)}
          </div>

          <div class="history-meta">
            ${escapeHtml(
              dataFormatada
            )}
          </div>

          ${
            mov.pedido_codigo
              ? `
                <div class="history-meta">
                  Pedido:
                  ${escapeHtml(mov.pedido_codigo)}
                </div>
              `
              : ""
          }

          ${
            mov.observacao
              ? `
                <div class="history-meta">
                  ${escapeHtml(mov.observacao)}
                </div>
              `
              : ""
          }

        `;


        $("historicoConteudo")
          .appendChild(div);
      }


    } catch (error) {

      console.error(error);

      $("historicoConteudo").innerHTML =
        `<div class="state error">
          ${escapeHtml(
            error.message ||
            "Erro ao carregar histórico"
          )}
        </div>`;
    }
  }


  function fecharHistorico() {

    $("modalHistorico")
      .classList.remove("open");
  }


  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function formatarData(value) {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short"
      }
    );
  }


  // =====================================================
  // EVENTOS
  // =====================================================

  $("btnAtualizar")
    .addEventListener(
      "click",
      carregarEstoque
    );


  $("busca")
    .addEventListener(
      "input",
      renderizarTabela
    );


  $("filtroStatus")
    .addEventListener(
      "change",
      renderizarTabela
    );


  $("tipoMovimentacao")
    .addEventListener(
      "change",
      atualizarCamposMovimentacao
    );


  $("btnSalvarMovimentacao")
    .addEventListener(
      "click",
      salvarMovimentacao
    );


  $("btnCancelar")
    .addEventListener(
      "click",
      fecharModalMovimentacao
    );


  $("btnFecharModal")
    .addEventListener(
      "click",
      fecharModalMovimentacao
    );


  $("btnFecharHistorico")
    .addEventListener(
      "click",
      fecharHistorico
    );


  $("modalMovimentacao")
    .addEventListener(
      "click",
      (event) => {

        if (
          event.target ===
          $("modalMovimentacao")
        ) {

          fecharModalMovimentacao();
        }
      }
    );


  $("modalHistorico")
    .addEventListener(
      "click",
      (event) => {

        if (
          event.target ===
          $("modalHistorico")
        ) {

          fecharHistorico();
        }
      }
    );


  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") {
        return;
      }

      fecharModalMovimentacao();
      fecharHistorico();
    }
  );


  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  carregarEstoque();
  