const API_URL =
  "https://carimbai-api.vercel.app/api";


// =========================================================
// ESTADO
// =========================================================

let senhaBackoffice = null;

let pedidos = [];


// =========================================================
// ELEMENTOS
// =========================================================

const loginBackoffice =
  document.getElementById("login-backoffice");

const backoffice =
  document.getElementById("backoffice");

const formLogin =
  document.getElementById("form-login");


// =========================================================
// LOGIN
// =========================================================

formLogin.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const senha =
      document
        .getElementById("senha-backoffice")
        .value
        .trim();

    if (!senha) return;

    senhaBackoffice = senha;

    try {

      await carregarPedidos();

      loginBackoffice.style.display =
        "none";

      backoffice.classList.remove(
        "auth-hidden"
      );

    } catch (error) {

      senhaBackoffice = null;

      document
        .getElementById("login-erro")
        .textContent =
          "Senha inválida ou erro ao acessar o backoffice.";

      console.error(error);

    }

  }
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
// GET PEDIDOS
// =========================================================

async function carregarPedidos() {

  const response =
    await fetch(
      `${API_URL}/pedidos`,
      {
        method: "GET",
        headers: getHeaders()
      }
    );


  if (!response.ok) {

    throw new Error(
      `Erro ao carregar pedidos: ${response.status}`
    );

  }


  const data =
    await response.json();


  if (!Array.isArray(data)) {

    throw new Error(
      "Resposta inválida da API."
    );

  }


  pedidos = data;

  renderizarPedidos();

}


// =========================================================
// RENDERIZAÇÃO
// =========================================================

function renderizarPedidos() {

  const busca =
    document
      .getElementById("buscaPedido")
      .value
      .trim()
      .toLowerCase();


  const statusPedido =
    document
      .getElementById(
        "filtroStatusPedido"
      )
      .value;


  const statusPagamento =
    document
      .getElementById(
        "filtroPagamento"
      )
      .value;


  const filtrados =
    pedidos.filter(
      pedido => {

        const textoBusca = [

          pedido.pedido_codigo,

          pedido.nome_cliente,

          pedido.cpf_cliente,

          pedido.whatsapp,

          pedido.email_cliente

        ]
          .map(valor =>
            String(valor || "")
              .toLowerCase()
          )
          .join(" ");


        const correspondeBusca =
          !busca ||
          textoBusca.includes(busca);


        const correspondeStatusPedido =
          !statusPedido ||
          pedido.status_pedido ===
            statusPedido;


        const correspondeStatusPagamento =
          !statusPagamento ||
          pedido.status_pagamento ===
            statusPagamento;


        return (
          correspondeBusca &&
          correspondeStatusPedido &&
          correspondeStatusPagamento
        );

      }
    );


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
      "pedidosBody"
    );


  if (!filtrados.length) {

    estado.textContent =
      "Nenhum pedido encontrado.";

    estado.style.display =
      "block";

    wrapper.style.display =
      "none";

    return;

  }


  estado.style.display =
    "none";

  wrapper.style.display =
    "block";


  body.innerHTML =
    filtrados
      .map(renderLinhaPedido)
      .join("");

}


// =========================================================
// LINHA DO PEDIDO
// =========================================================

function renderLinhaPedido(pedido) {

  return `

    <tr>

      <td>
        ${escapeHTML(pedido.pedido_codigo)}
      </td>

      <td>
        ${escapeHTML(pedido.nome_cliente)}
      </td>

      <td>
        ${escapeHTML(pedido.cpf_cliente)}
      </td>

      <td>
        ${escapeHTML(pedido.whatsapp)}
      </td>

      <td>
        ${escapeHTML(pedido.email_cliente)}
      </td>

      <td>
        ${escapeHTML(pedido.rua)}
      </td>

      <td>
        ${escapeHTML(pedido.numero)}
      </td>

      <td>
        ${escapeHTML(pedido.complemento)}
      </td>

      <td>
        ${escapeHTML(pedido.bairro)}
      </td>

      <td>
        ${escapeHTML(pedido.cidade)}
      </td>

      <td>
        ${escapeHTML(pedido.estado)}
      </td>

      <td>
        ${escapeHTML(pedido.cep)}
      </td>

      <td>
        ${escapeHTML(pedido.entrega)}
      </td>

      <td>
        ${escapeHTML(pedido.pagamento)}
      </td>

      <td>
        ${formatarMoeda(pedido.total)}
      </td>

      <td>
        ${formatarMoeda(pedido.frete)}
      </td>

      <td>
        ${pedido.prazo ?? ""}
      </td>

      <td>
        ${escapeHTML(pedido.transportadora)}
      </td>

      <td>
        ${formatarStatusPagamento(
          pedido.status_pagamento
        )}
      </td>

      <td>
        ${formatarStatusPedido(
          pedido.status_pedido
        )}
      </td>

      <td>
        ${escapeHTML(pedido.mp_payment_id)}
      </td>

      <td>
        ${formatarData(pedido.paid_at)}
      </td>

      <td>
        ${formatarData(pedido.shipped_at)}
      </td>

      <td>
        ${formatarData(pedido.delivered_at)}
      </td>

      <td>
        ${formatarData(pedido.cancelled_at)}
      </td>

      <td>
        ${escapeHTML(pedido.observacoes)}
      </td>

      <td>
        ${escapeHTML(pedido.mp_status)}
      </td>

      <td>
        ${formatarData(
          pedido.mp_date_approved
        )}
      </td>

      <td>
        ${formatarMoeda(
          pedido.mp_transaction_amount
        )}
      </td>

      <td>
        ${escapeHTML(
          pedido.mp_authorization_code
        )}
      </td>

      <td>
        ${escapeHTML(
          pedido.mp_payer_email
        )}
      </td>

      <td class="acoes">

        <button
          type="button"
          class="btn-ver"
          onclick="verPedido(${pedido.id})"
        >
          Ver
        </button>

        <button
          type="button"
          class="btn-editar"
          onclick="editarPedido(${pedido.id})"
        >
          Editar
        </button>

      </td>

    </tr>

  `;

}


// =========================================================
// FORMATADORES
// =========================================================

function formatarMoeda(valor) {

  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "—";
  }

  const numero =
    Number(valor);

  if (!Number.isFinite(numero)) {
    return "—";
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
    return "—";
  }

  return data.toLocaleString(
    "pt-BR"
  );

}


function formatarStatusPedido(status) {

  const nomes = {

    novo:
      "Novo",

    aguardando_pagamento:
      "Aguardando pagamento",

    producao:
      "Produção",

    pronto:
      "Pronto",

    enviado:
      "Enviado",

    entregue:
      "Entregue",

    cancelado:
      "Cancelado"

  };

  return escapeHTML(
    nomes[status] || status || "—"
  );

}


function formatarStatusPagamento(status) {

  const nomes = {

    pending:
      "Pendente",

    approved:
      "Aprovado",

    authorized:
      "Autorizado",

    in_process:
      "Em processamento",

    in_mediation:
      "Em mediação",

    rejected:
      "Rejeitado",

    cancelled:
      "Cancelado",

    refunded:
      "Reembolsado",

    charged_back:
      "Chargeback"

  };

  return escapeHTML(
    nomes[status] || status || "—"
  );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {
    return "—";
  }

  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// =========================================================
// FILTROS
// =========================================================

document
  .getElementById("buscaPedido")
  .addEventListener(
    "input",
    renderizarPedidos
  );


document
  .getElementById(
    "filtroStatusPedido"
  )
  .addEventListener(
    "change",
    renderizarPedidos
  );


document
  .getElementById(
    "filtroPagamento"
  )
  .addEventListener(
    "change",
    renderizarPedidos
  );


document
  .getElementById(
    "btnLimparFiltros"
  )
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "buscaPedido"
        )
        .value = "";

      document
        .getElementById(
          "filtroStatusPedido"
        )
        .value = "";

      document
        .getElementById(
          "filtroPagamento"
        )
        .value = "";

      renderizarPedidos();

    }
  );


// =========================================================
// MODAL
// =========================================================

function fecharModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {
    modal.style.display =
      "none";
  }

}
