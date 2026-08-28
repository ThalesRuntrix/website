const API_URL =
  "https://carimbai-api.vercel.app/api";


// =========================================================
// ESTADO
// =========================================================

let senhaBackoffice = null;

let pedidos = [];

let pedidoEmEdicao = null;


// =========================================================
// ELEMENTOS
// =========================================================

const loginBackoffice =
  document.getElementById(
    "login-backoffice"
  );

const backoffice =
  document.getElementById(
    "backoffice"
  );

const formLogin =
  document.getElementById(
    "form-login"
  );

const loginErro =
  document.getElementById(
    "login-erro"
  );

const pedidosBody =
  document.getElementById(
    "pedidos-body"
  );

const pedidosLoading =
  document.getElementById(
    "pedidos-loading"
  );

const pedidosErro =
  document.getElementById(
    "pedidos-erro"
  );

const pedidosWrapper =
  document.getElementById(
    "pedidos-wrapper"
  );


// =========================================================
// HEADERS
// =========================================================

function getHeaders() {

  return {

    "Content-Type":
      "application/json",

    "X-Backoffice-Password":
      senhaBackoffice

  };

}


// =========================================================
// FORMATAÇÃO
// =========================================================

function formatarMoeda(valor) {

  const numero =
    Number(valor);

  if (!Number.isFinite(numero)) {
    return "R$ 0,00";
  }

  return numero.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );
}


function formatarData(valor) {

  if (!valor) {
    return "—";
  }

  const data =
    new Date(valor);

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return valor;
  }

  return data.toLocaleString(
    "pt-BR"
  );
}


function escapeHTML(valor) {

  return String(
    valor ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =========================================================
// LOGIN
// =========================================================

formLogin.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    loginErro.textContent = "";

    const senha =
      document
        .getElementById(
          "senha-backoffice"
        )
        .value
        .trim();

    if (!senha) {
      return;
    }

    senhaBackoffice =
      senha;

    try {

      await carregarPedidos();

      loginBackoffice.style.display =
        "none";

      backoffice.classList.remove(
        "auth-hidden"
      );

    } catch (error) {

      senhaBackoffice =
        null;

      loginErro.textContent =
        "Senha inválida ou erro ao acessar o backoffice.";

      console.error(error);
    }
  }
);


// =========================================================
// CARREGAR PEDIDOS
// =========================================================

async function carregarPedidos() {

  pedidosLoading.style.display =
    "block";

  pedidosErro.textContent = "";

  pedidosWrapper.style.display =
    "none";


  const params =
    new URLSearchParams();


  const busca =
    document
      .getElementById(
        "busca-pedido"
      )
      .value
      .trim();


  const statusPedido =
    document
      .getElementById(
        "filtro-status-pedido"
      )
      .value;


  const statusPagamento =
    document
      .getElementById(
        "filtro-status-pagamento"
      )
      .value;


  if (busca) {

    params.set(
      "busca",
      busca
    );
  }


  if (statusPedido) {

    params.set(
      "status_pedido",
      statusPedido
    );
  }


  if (statusPagamento) {

    params.set(
      "status_pagamento",
      statusPagamento
    );
  }


  const queryString =
    params.toString();


  const url =
    queryString
      ? `${API_URL}/pedidos?${queryString}`
      : `${API_URL}/pedidos`;


  try {

    const response =
      await fetch(
        url,
        {
          method: "GET",
          headers: getHeaders()
        }
      );


    if (!response.ok) {

      let mensagem =
        "Erro ao carregar pedidos.";

      try {

        const erro =
          await response.json();

        if (erro?.error) {
          mensagem =
            erro.error;
        }

      } catch {}

      throw new Error(
        mensagem
      );
    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        "Resposta inválida da API."
      );
    }


    pedidos =
      data;


    renderizarPedidos();


  } finally {

    pedidosLoading.style.display =
      "none";
  }
}


// =========================================================
// RENDERIZAR PEDIDOS
// =========================================================

function renderizarPedidos() {

  pedidosBody.innerHTML =
    "";


  if (!pedidos.length) {

    pedidosWrapper.style.display =
      "none";

    pedidosErro.textContent =
      "Nenhum pedido encontrado.";

    return;
  }


  pedidosErro.textContent = "";

  pedidosWrapper.style.display =
    "block";


  pedidos.forEach(
    (pedido) => {

      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <td>
          <strong>
            ${escapeHTML(
              pedido.pedido_codigo
            )}
          </strong>
        </td>


        <td>
          ${escapeHTML(
            pedido.nome_cliente
          )}
          <br>
          <small>
            ${escapeHTML(
              pedido.email_cliente
            )}
          </small>
        </td>


        <td>
          ${escapeHTML(
            pedido.whatsapp
          )}
        </td>


        <td>
          ${escapeHTML(
            pedido.entrega
          )}
        </td>


        <td>
          ${escapeHTML(
            pedido.pagamento
          )}
        </td>


        <td>
          ${formatarMoeda(
            pedido.total
          )}
        </td>


        <td>
          ${formatarMoeda(
            pedido.frete
          )}
        </td>


        <td>
          ${escapeHTML(
            pedido.prazo
          )}
        </td>


        <td>
          ${escapeHTML(
            pedido.transportadora
          )}
        </td>


        <td>
          ${escapeHTML(
            pedido.status_pagamento
          )}
        </td>


        <td>
          ${escapeHTML(
            pedido.status_pedido
          )}
        </td>


        <td>
          ${formatarData(
            pedido.mp_date_approved
          )}
        </td>


        <td>
          ${formatarData(
            pedido.shipped_at
          )}
        </td>


        <td>
          ${formatarData(
            pedido.delivered_at
          )}
        </td>


        <td>
          ${formatarData(
            pedido.cancelled_at
          )}
        </td>


        <td>

          <div class="acoes">

            <button
              type="button"
              class="btn-ver"
              data-pedido-codigo="${escapeHTML(
                pedido.pedido_codigo
              )}"
            >
              Ver
            </button>


            <button
              type="button"
              class="btn-editar"
              data-pedido-codigo="${escapeHTML(
                pedido.pedido_codigo
              )}"
            >
              Editar
            </button>

          </div>

        </td>

      `;


      pedidosBody.appendChild(
        tr
      );
    }
  );
}


// =========================================================
// EVENTOS — FILTROS
// =========================================================

document
  .getElementById(
    "btn-filtrar"
  )
  .addEventListener(
    "click",
    () => {

      carregarPedidos()
        .catch(
          tratarErroCarregamento
        );
    }
  );


document
  .getElementById(
    "btn-limpar-filtros"
  )
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "busca-pedido"
        )
        .value = "";

      document
        .getElementById(
          "filtro-status-pedido"
        )
        .value = "";

      document
        .getElementById(
          "filtro-status-pagamento"
        )
        .value = "";


      carregarPedidos()
        .catch(
          tratarErroCarregamento
        );
    }
  );


// =========================================================
// EVENTOS — TABELA
// =========================================================

pedidosBody.addEventListener(
  "click",
  async (e) => {

    const btnVer =
      e.target.closest(
        ".btn-ver"
      );

    const btnEditar =
      e.target.closest(
        ".btn-editar"
      );


    if (btnVer) {

      await abrirModalVer(
        btnVer.dataset.pedidoCodigo
      );

      return;
    }


    if (btnEditar) {

      await abrirModalEditar(
        btnEditar.dataset.pedidoCodigo
      );

      return;
    }
  }
);


// =========================================================
// VER — PEDIDO_ITENS
// =========================================================

async function abrirModalVer(
  pedidoCodigo
) {

  const modal =
    document.getElementById(
      "modal-ver"
    );

  const conteudo =
    document.getElementById(
      "ver-pedido-conteudo"
    );


  abrirModal(
    modal
  );


  conteudo.innerHTML =
    "<p>Carregando itens...</p>";


  try {

    const params =
      new URLSearchParams();

    params.set(
      "tipo",
      "itens"
    );

    params.set(
      "pedido_codigo",
      pedidoCodigo
    );


    const response =
      await fetch(
        `${API_URL}/pedidos?${params.toString()}`,
        {
          method: "GET",
          headers: getHeaders()
        }
      );


    if (!response.ok) {

      const erro =
        await response.json()
          .catch(
            () => ({})
          );

      throw new Error(
        erro.error ||
        "Erro ao carregar itens."
      );
    }


    const itens =
      await response.json();


    renderizarItensVisualizacao(
      itens,
      conteudo
    );


  } catch (error) {

    console.error(
      error
    );

    conteudo.innerHTML = `
      <div class="erro">
        ${escapeHTML(
          error.message
        )}
      </div>
    `;
  }
}


// =========================================================
// RENDER — VER
// =========================================================

function renderizarItensVisualizacao(
  itens,
  container
) {

  if (
    !Array.isArray(itens) ||
    !itens.length
  ) {

    container.innerHTML =
      "<p>Este pedido não possui itens.</p>";

    return;
  }


  container.innerHTML =
    itens
      .map(
        (item, index) => `

          <section class="pedido-item">

            <h3>
              Item ${index + 1}
            </h3>


            <div class="dados-grid">

              <div>
                <strong>Pedido ID</strong>
                <span>
                  ${escapeHTML(
                    item.pedido_id
                  )}
                </span>
              </div>
              
              <div>
                <strong>Produto</strong>
                <span>
                  ${
                    escapeHTML(
                      item.produto_nome
                    ) || "—"
                  }
                </span>
              </div>

              <div>
                <strong>Produto ID</strong>
                <span>
                  ${escapeHTML(
                    item.produto_id
                  )}
                </span>
              </div>


              <div>
                <strong>SKU</strong>
                <span>
                  ${escapeHTML(
                    item.produto_sku_id
                  )}
                </span>
              </div>


              <div>
                <strong>Variação</strong>
                <span>
                  ${escapeHTML(
                    item.variacao
                  )}
                </span>
              </div>


              <div>
                <strong>Quantidade</strong>
                <span>
                  ${escapeHTML(
                    item.quantidade
                  )}
                </span>
              </div>


              <div>
                <strong>Preço unitário</strong>
                <span>
                  ${formatarMoeda(
                    item.preco_unitario
                  )}
                </span>
              </div>


              <div>
                <strong>Subtotal</strong>
                <span>
                  ${formatarMoeda(
                    item.subtotal
                  )}
                </span>
              </div>


              <div>
                <strong>Personalização texto</strong>
                <span>
                  ${
                    escapeHTML(
                      item.personalizacao_txt
                    ) || "—"
                  }
                </span>
              </div>


              <div>
                <strong>Personalização imagem</strong>
                <span>
                  ${
                    escapeHTML(
                      item.personalizacao_img
                    ) || "—"
                  }
                </span>
              </div>

            </div>

          </section>

        `
      )
      .join("");
}


// =========================================================
// EDITAR
// =========================================================

async function abrirModalEditar(
  pedidoCodigo
) {

  const modal =
    document.getElementById(
      "modal-editar"
    );

  const conteudo =
    document.getElementById(
      "editar-pedido-conteudo"
    );


  pedidoEmEdicao =
    pedidos.find(
      pedido =>
        pedido.pedido_codigo ===
        pedidoCodigo
    );


  abrirModal(
    modal
  );


  conteudo.innerHTML =
    "<p>Carregando pedido...</p>";


  if (!pedidoEmEdicao) {

    conteudo.innerHTML =
      "<p>Pedido não encontrado.</p>";

    return;
  }


  try {

    const params =
      new URLSearchParams();

    params.set(
      "tipo",
      "itens"
    );

    params.set(
      "pedido_codigo",
      pedidoCodigo
    );


    const response =
      await fetch(
        `${API_URL}/pedidos?${params.toString()}`,
        {
          method: "GET",
          headers: getHeaders()
        }
      );


    if (!response.ok) {

      const erro =
        await response.json()
          .catch(
            () => ({})
          );

      throw new Error(
        erro.error ||
        "Erro ao carregar itens."
      );
    }


    const itens =
      await response.json();


    pedidoEmEdicao = {

      ...pedidoEmEdicao,

      itens

    };


    renderizarFormularioEdicao(
      pedidoEmEdicao,
      conteudo
    );


  } catch (error) {

    console.error(
      error
    );

    conteudo.innerHTML = `
      <div class="erro">
        ${escapeHTML(
          error.message
        )}
      </div>
    `;
  }
}


// =========================================================
// RENDER — FORMULÁRIO DE EDIÇÃO
// =========================================================

function renderizarFormularioEdicao(
  pedido,
  container
) {

  container.innerHTML = `

    <form id="form-editar-pedido">

      <h3>
        Dados do pedido
      </h3>


      <div class="dados-grid">

        <div>
          <label>Pedido</label>

          <input
            type="text"
            value="${escapeHTML(
              pedido.pedido_codigo
            )}"
            readonly
          >
        </div>


        <div>
          <label>Cliente</label>

          <input
            type="text"
            value="${escapeHTML(
              pedido.nome_cliente
            )}"
            readonly
          >
        </div>


        <div>
          <label>E-mail</label>

          <input
            type="text"
            value="${escapeHTML(
              pedido.email_cliente
            )}"
            readonly
          >
        </div>


        <div>
          <label>CPF</label>

          <input
            type="text"
            value="${escapeHTML(
              pedido.cpf_cliente
            )}"
            readonly
          >
        </div>


        <div>
          <label>WhatsApp</label>

          <input
            type="text"
            value="${escapeHTML(
              pedido.whatsapp
            )}"
            readonly
          >
        </div>


        <div>
          <label>Total</label>

          <input
            type="text"
            value="${formatarMoeda(
              pedido.total
            )}"
            readonly
          >
        </div>


        <div>
          <label>Frete</label>

          <input
            type="text"
            value="${formatarMoeda(
              pedido.frete
            )}"
            readonly
          >
        </div>


        <div>
          <label>Pagamento</label>

          <input
            type="text"
            value="${escapeHTML(
              pedido.pagamento
            )}"
            readonly
          >
        </div>


        <div>
          <label>Status pagamento</label>

          <input
            type="text"
            value="${escapeHTML(
              pedido.status_pagamento
            )}"
            readonly
          >
        </div>


        <div>
          <label>Data pagamento</label>

          <input
            type="text"
            value="${formatarData(
              pedido.paid_at
            )}"
            readonly
          >
        </div>


        <div>
          <label>Endereço</label>

          <input
            type="text"
            value="${escapeHTML(
              [
                pedido.rua,
                pedido.numero,
                pedido.complemento,
                pedido.bairro,
                pedido.cidade,
                pedido.estado,
                pedido.cep
              ]
                .filter(Boolean)
                .join(", ")
            )}"
            readonly
          >
        </div>


        <div>
          <label>Entrega</label>

          <input
            type="text"
            value="${escapeHTML(
              pedido.entrega
            )}"
            readonly
          >
        </div>

      </div>



      <h3>
        Alterações do pedido
      </h3>


      <div class="dados-grid">

        <div>

          <label for="edit-status-pedido">
            Status do pedido
          </label>

          <select
            id="edit-status-pedido"
          >

            <option value="novo">
              Novo
            </option>

            <option value="aguardando_pagamento">
              Aguardando pagamento
            </option>

            <option value="producao">
              Produção
            </option>

            <option value="pronto">
              Pronto
            </option>

            <option value="enviado">
              Enviado
            </option>

            <option value="entregue">
              Entregue
            </option>

            <option value="cancelado">
              Cancelado
            </option>

          </select>

        </div>


        <div>

          <label for="edit-shipped-at">
            Enviado em
          </label>

          <input
            type="datetime-local"
            id="edit-shipped-at"
          >

        </div>


        <div>

          <label for="edit-delivered-at">
            Entregue em
          </label>

          <input
            type="datetime-local"
            id="edit-delivered-at"
          >

        </div>


        <div>

          <label for="edit-observacoes">
            Observações
          </label>

          <textarea
            id="edit-observacoes"
            rows="4"
          ></textarea>

        </div>

      </div>



      <h3>
        Itens do pedido
      </h3>


      <div id="editar-itens">

        ${
          renderizarItensEdicao(
            pedido.itens
          )
        }

      </div>

    </form>
  `;


  document
    .getElementById(
      "edit-status-pedido"
    )
    .value =
      pedido.status_pedido || "";


  document
    .getElementById(
      "edit-shipped-at"
    )
    .value =
      converterParaDatetimeLocal(
        pedido.shipped_at
      );


  document
    .getElementById(
      "edit-delivered-at"
    )
    .value =
      converterParaDatetimeLocal(
        pedido.delivered_at
      );


  document
    .getElementById(
      "edit-observacoes"
    )
    .value =
      pedido.observacoes || "";
}


// =========================================================
// RENDER — ITENS EDITÁVEIS
//
// MANTIDO EXATAMENTE COMO ESTAVA
// =========================================================

function renderizarItensEdicao(
  itens
) {

  if (
    !Array.isArray(itens) ||
    !itens.length
  ) {

    return `
      <p>
        Este pedido não possui itens.
      </p>
    `;
  }


  return itens
    .map(
      (item, index) => `

        <section
          class="pedido-item"
          data-pedido-item-id="${item.pedido_item_id}"
        >

          <h4>
            Item ${index + 1}
          </h4>


          <div class="dados-grid">
          
            <label>
              Produto
            </label>

            <input
              type="text"
              value="${escapeHTML(
                item.produto_nome
              )}"
              readonly
            >
          </div>

            <div>
              <label>
                Produto ID
              </label>

              <input
                type="text"
                value="${escapeHTML(
                  item.produto_id
                )}"
                readonly
              >
            </div>


            <div>
              <label>
                SKU
              </label>

              <input
                type="text"
                value="${escapeHTML(
                  item.produto_sku_id
                )}"
                readonly
              >
            </div>


            <div>
              <label>
                Variação
              </label>

              <input
                type="text"
                value="${escapeHTML(
                  item.variacao
                )}"
                readonly
              >
            </div>


            <div>
              <label>
                Quantidade
              </label>

              <input
                type="text"
                value="${escapeHTML(
                  item.quantidade
                )}"
                readonly
              >
            </div>


            <div>
              <label>
                Preço unitário
              </label>

              <input
                type="text"
                value="${formatarMoeda(
                  item.preco_unitario
                )}"
                readonly
              >
            </div>


            <div>
              <label>
                Subtotal
              </label>

              <input
                type="text"
                value="${formatarMoeda(
                  item.subtotal
                )}"
                readonly
              >
            </div>


            <div>

              <label>
                Personalização — texto
              </label>

              <textarea
                class="edit-personalizacao-txt"
                data-item-id="${item.pedido_item_id}"
                rows="3"
              >${escapeHTML(
                item.personalizacao_txt
              )}</textarea>

            </div>


            <div>

              <label>
                Personalização — imagem
              </label>

              <input
                type="text"
                class="edit-personalizacao-img"
                data-item-id="${item.pedido_item_id}"
                value="${escapeHTML(
                  item.personalizacao_img
                )}"
              >

            </div>

          </div>

        </section>
      `
    )
    .join("");
}


// =========================================================
// DATETIME LOCAL
// =========================================================

function converterParaDatetimeLocal(
  valor
) {

  if (!valor) {
    return "";
  }


  const data =
    new Date(valor);


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return "";
  }


  const ano =
    data.getFullYear();

  const mes =
    String(
      data.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      data.getDate()
    ).padStart(2, "0");

  const hora =
    String(
      data.getHours()
    ).padStart(2, "0");

  const minuto =
    String(
      data.getMinutes()
    ).padStart(2, "0");


  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}


// =========================================================
// SALVAR
// =========================================================

document
  .getElementById(
    "btn-salvar-pedido"
  )
  .addEventListener(
    "click",
    salvarPedido
  );


async function salvarPedido() {

  if (!pedidoEmEdicao) {
    return;
  }


  const botao =
    document.getElementById(
      "btn-salvar-pedido"
    );


  botao.disabled =
    true;

  botao.textContent =
    "Salvando...";


  try {

    const statusPedido =
      document
        .getElementById(
          "edit-status-pedido"
        )
        .value;


    const shippedAt =
      document
        .getElementById(
          "edit-shipped-at"
        )
        .value;


    const deliveredAt =
      document
        .getElementById(
          "edit-delivered-at"
        )
        .value;


    const observacoes =
      document
        .getElementById(
          "edit-observacoes"
        )
        .value;


    const itens =
      pedidoEmEdicao.itens
        .map(
          (item) => {

            const txt =
              document.querySelector(
                `.edit-personalizacao-txt[data-item-id="${item.pedido_item_id}"]`
              );


            const img =
              document.querySelector(
                `.edit-personalizacao-img[data-item-id="${item.pedido_item_id}"]`
              );


            return {

              pedido_item_id:
                item.pedido_item_id,

              personalizacao_txt:
                txt
                  ? txt.value
                  : item.personalizacao_txt,

              personalizacao_img:
                img
                  ? img.value
                  : item.personalizacao_img
            };
          }
        );


    const payload = {

      pedido_codigo:
        pedidoEmEdicao.pedido_codigo,

      pedido: {

        status_pedido:
          statusPedido,

        shipped_at:
          shippedAt
            ? new Date(
                shippedAt
              ).toISOString()
            : null,

        delivered_at:
          deliveredAt
            ? new Date(
                deliveredAt
              ).toISOString()
            : null,

        observacoes:
          observacoes || null
      },

      itens

    };


    const response =
      await fetch(
        `${API_URL}/pedidos`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body:
            JSON.stringify(
              payload
            )
        }
      );


    const data =
      await response.json()
        .catch(
          () => ({})
        );


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Erro ao salvar alterações."
      );
    }


    // ======================================================
    // ATUALIZA ESTADO LOCAL
    // ======================================================

    const index =
      pedidos.findIndex(
        pedido =>
          pedido.pedido_codigo ===
          pedidoEmEdicao.pedido_codigo
      );


    if (index !== -1) {

      pedidos[index] =
        data.pedido ||
        {
          ...pedidos[index],

          status_pedido:
            statusPedido,

          shipped_at:
            payload.pedido.shipped_at,

          delivered_at:
            payload.pedido.delivered_at,

          observacoes:
            payload.pedido.observacoes
        };
    }


    // ======================================================
    // FECHA MODAL
    // ======================================================

    fecharModal(
      "modal-editar"
    );


    pedidoEmEdicao =
      null;


    // ======================================================
    // RENDERIZA NOVAMENTE
    // ======================================================

    renderizarPedidos();


  } catch (error) {

    console.error(
      "Erro salvar pedido:",
      error
    );


    alert(
      error.message ||
      "Erro ao salvar alterações."
    );

  } finally {

    botao.disabled =
      false;

    botao.textContent =
      "Salvar alterações";
  }
}


// =========================================================
// MODAIS
// =========================================================

function abrirModal(
  modal
) {

  if (!modal) {
    return;
  }


  modal.classList.add(
    "modal-aberto"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "modal-aberto"
  );
}


function fecharModal(
  id
) {

  const modal =
    document.getElementById(
      id
    );

  if (!modal) {
    return;
  }


  modal.classList.remove(
    "modal-aberto"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  // Só libera o scroll da página
  // quando não houver outro modal aberto.

  const existeOutroModalAberto =
    document.querySelector(
      ".modal-overlay.modal-aberto"
    );


  if (!existeOutroModalAberto) {

    document.body.classList.remove(
      "modal-aberto"
    );
  }


  if (
    id === "modal-editar"
  ) {

    pedidoEmEdicao =
      null;
  }
}


// =========================================================
// BOTÕES DE FECHAMENTO
// =========================================================

document
  .querySelectorAll(
    "[data-fechar-modal]"
  )
  .forEach(
    (botao) => {

      botao.addEventListener(
        "click",
        () => {

          fecharModal(
            botao.dataset.fecharModal
          );

        }
      );
    }
  );


// =========================================================
// CLIQUE NO FUNDO
// =========================================================

document
  .querySelectorAll(
    ".modal-overlay"
  )
  .forEach(
    (modal) => {

      modal.addEventListener(
        "click",
        (e) => {

          if (
            e.target === modal
          ) {

            fecharModal(
              modal.id
            );
          }
        }
      );
    }
  );


// =========================================================
// ESC
// =========================================================

document.addEventListener(
  "keydown",
  (e) => {

    if (
      e.key !== "Escape"
    ) {
      return;
    }


    const modalAberto =
      document.querySelector(
        ".modal-overlay.modal-aberto"
      );


    if (modalAberto) {

      fecharModal(
        modalAberto.id
      );
    }
  }
);


// =========================================================
// ERROS
// =========================================================

function tratarErroCarregamento(
  error
) {

  console.error(
    error
  );

  pedidosLoading.style.display =
    "none";

  pedidosWrapper.style.display =
    "none";

  pedidosErro.textContent =
    error.message ||
    "Erro ao carregar pedidos.";
}
