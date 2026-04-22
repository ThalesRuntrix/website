import { pagamentoService } from "../checkout/services/pagamentoService.js";

const API_URL = "https://carimbai-api.vercel.app/api";

const params = new URLSearchParams(window.location.search);
const pedidoId = params.get("pedido_id");

if (!pedidoId) {
  alert("Pedido inválido.");
  window.location.href = "/carimbai/";
}

try {
  const data = await pagamentoService.pagarPix(pedidoId);
  montarTela(data);
  iniciarConsulta();
} catch (err) {
  console.error(err);

  document.getElementById("loading").innerHTML =
    "Erro ao gerar pagamento PIX.";
}

function montarTela(data) {

  document.getElementById("loading").style.display = "none";
  document.getElementById("conteudoPix").style.display = "block";

  // copia e cola
  document.getElementById("pixCode").value =
    data.qr_code;

  // qr image
  document.getElementById("qrImg").src =
    "data:image/png;base64," +
    data.qr_code_base64;

  // botão copiar
  document.getElementById("btnCopiar")
    .onclick = async () => {

      await navigator.clipboard.writeText(
        data.qr_code
      );

      const btn =
        document.getElementById("btnCopiar");

      btn.innerText = "PIX copiado ✔";

      setTimeout(() => {
        btn.innerText = "Copiar código PIX";
      }, 2500);
    };

  // botão qr
  document.getElementById("btnQr")
    .onclick = () => {

      const qr =
        document.getElementById("qrBox");

      qr.style.display =
        qr.style.display === "block"
        ? "none"
        : "block";
    };
}

// consulta status pagamento
function iniciarConsulta() {

  const interval = setInterval(async () => {

    try {

      const res = await fetch(
        `${API_URL}/pedido/status?id=${pedidoId}`
      );

      const data = await res.json();

      if (
        data.status_pagamento === "approved"
      ) {

        clearInterval(interval);

        document.getElementById("status")
          .innerHTML =
          "Pagamento aprovado ✔";

        setTimeout(() => {
          window.location.href =
            "/carimbai/pagamento/sucesso.html";
        }, 1500);
      }

    } catch(err) {
      console.error(err);
    }

  }, 5000);
}