import { api } from "../api/api.js";


const mp = new MercadoPago(
  "APP_USR-b669d1f5-d7ce-43d5-a672-f2cb1043ead6",
  {
    locale: "pt-BR"
  }
);

const form = document.getElementById("pedido-form");

let brickController = null;


export const pagamentoService = {

  async pagarPix(pedido, pedidoId) {

    let pixInterval = null;

    try {

      ui.loading(true);

      const data = await api.pagarPix(pedidoId);

      const box = ui.getPaymentBox();

      if (!data.qr_code_base64) {
        throw new Error("PIX não retornou QR");
      }

      box.innerHTML = `
        <div class="payment-card pix-card">

          <h2>Pagamento via PIX</h2>

          <button id="copiarPix" class="btn-pix">
            📋 Copiar código PIX
          </button>

          <p class="pix-info">
            Abra o app do banco e cole no PIX Copia e Cola.
          </p>

          <details class="pix-details">
            <summary>Mostrar QR Code</summary>

            <img
              src="data:image/png;base64,${data.qr_code_base64}"
              class="pix-qr"
            >
          </details>

          <p class="pix-ok">
            Após o pagamento a confirmação costuma ser automática.
          </p>

        </div>
      `;

      
      // DEV-APPROVE
      /*
      <button id="pix-paid-test" class="btn-success">
            Aprovar Pagamento (modo teste)
      </button>
      document
        .getElementById("pix-paid-test")
        .addEventListener("click", async () => {

          const btn = document.getElementById("pix-paid-test");

          btn.disabled = true;
          btn.innerText = "Confirmando...";

          try {

            const res = await fetch(
              `https://carimbai-api.vercel.app/api/payment?action=dev-approve-pix`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  pedido_id: pedidoId
                })
              }
            );

            const json = await res.json();
            

          } catch(e){
            alert("Erro no teste");
          }

        }); */
      
      // ==========================
      // COPIAR PIX
      // ==========================
      document
        .getElementById("copiarPix")
        .addEventListener("click", async () => {

          await navigator.clipboard.writeText(
            data.qr_code
          );

          const btn =
            document.getElementById("copiarPix");

          btn.innerText =
            "✅ Código copiado!";
        });

      // ==========================
      // POLLING AUTOMÁTICO
      // ==========================
      pixInterval = setInterval(
        verificarStatusPix,
        5000
      );

      // encerra após 15 min
      setTimeout(() => {
        clearInterval(pixInterval);
      }, 900000);

      async function verificarStatusPix() {

        try {

          const res = await fetch(
            `https://carimbai-api.vercel.app/api/payment?action=status&pedido_id=${pedidoId}`
          );

          const json =
            await res.json();

          if (
            json.status_pagamento ===
            "approved"
          ) {

            clearInterval(
              pixInterval
            );

            localStorage.setItem(
              "pedido_sucesso",
              JSON.stringify({
                nome_cliente: pedido?.nome_cliente,
                pedido_codigo: pedido?.pedido_codigo
              })                    
            );  
            
            window.location.href =
              "/carimbai/pagamento/sucesso.html";
          }

          if (
            json.status_pagamento ===
              "rejected" ||
            json.status_pagamento ===
              "cancelled"
          ) {

            clearInterval(
              pixInterval
            );            

            window.location.href =
              "/carimbai/pagamento/erro.html";
          }

        } catch (e) {
          console.error(
            "Erro status PIX",
            e
          );
        }
      }

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
                ui.scroll();
            },

            onSubmit: async (formData) => {             

                try {

                console.log("MP onSubmit:", {
                    tokenExists: Boolean(formData?.token),
                    tokenLength: formData?.token?.length,
                    paymentMethodId: formData?.payment_method_id,
                    installments: formData?.installments,
                    issuerId: formData?.issuer_id
                });  

                const pagamento = await api.pagarCartao(
                    pedido.pedido_id,
                    formData
                );
                
                if (pagamento.status === "approved") { 

                  localStorage.setItem(
                    "pedido_sucesso",
                    JSON.stringify({
                      nome_cliente: pedido?.nome_cliente,
                      pedido_codigo: pedido?.pedido_codigo
                    })                    
                  );      
                                    
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
                  console.error("ERRO:", err);

                  alert(
                    "ERRO:\n\n" +
                    err.message
                  );
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
