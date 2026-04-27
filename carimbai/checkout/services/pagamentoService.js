import { api } from "../api/api.js";

const mp = new MercadoPago("TEST-e6b63ae7-a61b-47e4-b4c4-2f974134bb41", {
  locale: "pt-BR"
});

let brickController = null;


export const pagamentoService = {

    async pagarPix(pedidoId) {        
        try {
            const data =  await api.pagarPix(pedidoId);
            const box = pagamentoService.getPaymentBox();
            
            box.innerHTML = `
                <div class="payment-card">
                <h2>Pagamento via PIX</h2>

                <img
                    src="data:image/png;base64,${data.qr_code_base64}"
                    style="max-width:280px;width:100%;margin:20px auto;display:block;"
                >

                <textarea style="width:100%;height:120px;">${data.qr_code}</textarea>

                <p style="margin-top:15px;">
                    Após pagamento a confirmação é automática.
                </p>
                </div>
            `;

            pagamentoService.scrollPagamento();

        } catch (error) {
        console.error("Erro ao gerar pagamento para PIX:", error);
        }        
    },

    async pagarCartao(pedidoId) {        
        try {
            const box = pagamentoService.getPaymentBox();

            box.innerHTML = `
                <div class="payment-card">
                <h2>Pagar com Cartão</h2>
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
                    bankTransfer: false,
                    ticket: false
                    }
                },

                callbacks: {

                    onReady: () => {
                    console.log("Brick pronto");
                    },

                    onSubmit: async (cardFormData) => {

                    try {
                        const res =  await api.pagarCartao(pedidoId, cardFormData);                        

                        const pagamento = await res.json();

                        if (
                        pagamento.status === "approved" ||
                        pagamento.status === "in_process"
                        ) {
                        window.location.href =
                            "/carimbai/pagamento/sucesso";
                        } else {
                        alert("Pagamento não aprovado.");
                        }

                    } catch (error) {
                        console.error(error);
                        alert("Erro ao pagar.");
                    }
                    },

                    onError: (error) => {
                    console.error(error);
                    }
                }
                }
            );

            pagamentoService.scrollPagamento();
                    
        } catch (error) {
        console.error("Erro ao gerar pagamento para cartão:", error);
        }  
    }

}

export function scrollPagamento() {
  document
    .getElementById("payment-box")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}

export function getPaymentBox() {

  let el = document.getElementById("payment-box");

  if (!el) {
    el = document.createElement("div");
    el.id = "payment-box";
    el.style.marginTop = "30px";

    form.appendChild(el);
  }

  return el;
}

