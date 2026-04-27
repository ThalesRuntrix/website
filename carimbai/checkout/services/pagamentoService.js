import { api } from "../api/api.js";


const mp = new MercadoPago(
  "TEST-e6b63ae7-a61b-47e4-b4c4-2f974134bb41",
  {
    locale: "pt-BR"
  }
);

const form = document.getElementById("pedido-form");

let brickController = null;


export const pagamentoService = {

  async pagarPix(pedidoId) {

    try {

      ui.loading(true);

      const data = await api.pagarPix(pedidoId);

      const box = ui.getPaymentBox();

      if (!data.qr_code_base64) {
        throw new Error("PIX não retornou QR");
      }

      box.innerHTML = `
        <div class="payment-card">

          <h2>Pagamento via PIX</h2>

          <img
            src="data:image/png;base64,${data.qr_code_base64}"
            class="pix-qrcode"
          >

          <textarea
            readonly
            class="pix-code"
          >${data.qr_code}</textarea>

          <button
            type="button"
            class="btn-secondary copiar-pix"
          >
            Copiar código PIX
          </button>

          <p class="payment-msg">
            Após o pagamento, a confirmação é automática.
          </p>

        </div>
      `;

      document
        .querySelector(".copiar-pix")
        ?.addEventListener("click", async () => {

          await navigator.clipboard.writeText(
            data.qr_code
          );

          alert("Código PIX copiado.");
        });

      ui.scroll();

    } catch (error) {

      console.error(error);

      ui.error(
        "Erro ao gerar PIX."
      );

    } finally {
      ui.loading(false);
    }
  },

  
  async pagarCartao(pedido) {
    try {
        const box = ui.getPaymentBox();

        box.innerHTML = `
        <div class="payment-card">
            <h2>Pagamento com Cartão</h2>
            <div id="paymentBrick_container"></div>
        </div>
        `;

        if (brickController) {
        await brickController.unmount();
        }

        const bricksBuilder = mp.bricks();

        brickController = await bricksBuilder.create(
        "payment",
        "paymentBrick_container",
        {
            initialization: {
            amount: Number(pedido.total)
            },

            customization: {
            paymentMethods: {
                creditCard: "all",
                debitCard: "all",
                ticket: false,
                bankTransfer: false
            }
            },

            callbacks: {

            onReady: () => {
                console.log("Brick carregado");
                ui.scroll();
            },

            onSubmit: async (formData) => {
              console.log(formData);

                try {

                const pagamento = await api.pagarCartao(
                    pedido.pedido_id,
                    formData
                );

                if (
                    pagamento.status === "approved"
                ) {
                    window.location.href =
                    "/carimbai/pagamento/sucesso.html";

                } else if (
                    pagamento.status === "in_process"
                ) {
                    window.location.href =
                    "/carimbai/pagamento/pendente.html";

                } else {
                    window.location.href =
                    "/carimbai/pagamento/erro.html";
                }

                } catch (err) {
                console.error(err);
                alert("Erro ao processar pagamento.");
                }

            },

            onError: (err) => {
                console.error("Brick error:", err);
            }
            }
        }
        );

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar pagamento.");
    }
    }
};

// ========================================
// UI HELPERS
// ========================================
const ui = {

  getPaymentBox() {

    let el =
      document.getElementById(
        "payment-box"
      );

    if (!el) {

      el =
        document.createElement(
          "div"
        );

      el.id =
        "payment-box";

      el.style.marginTop =
        "30px";

      form.appendChild(el);
    }

    return el;
  },

  scroll() {

    document
      .getElementById(
        "payment-box"
      )
      ?.scrollIntoView({
        behavior:
          "smooth",
        block:
          "start"
      });
  },

  loading(
    active,
    text =
      "🚀 Enviar Pedido Agora"
  ) {

    const btn =
      form.querySelector(
        "button[type='submit']"
      );

    if (!btn) return;

    btn.disabled =
      active;

    btn.innerText =
      active
        ? text
        : "🚀 Enviar Pedido Agora";
  },

  error(msg) {

    alert(msg);
  }
};
