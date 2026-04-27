const API_URL = "https://carimbai-api.vercel.app/api";

export const api = {

  async getProduto(id) {
    const res = await fetch(`${API_URL}/produto/${id}`);
    return res.json();
  },

  async calcularFrete(cep) {
    const res = await fetch(`${API_URL}/frete`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ cep })
    });

    const data = await res.json();

    if (!res.ok || !Array.isArray(data)) {
      throw new Error("Erro ao calcular frete");
    }

    return data;
  },

  async buscarCEP(cep) {
    const res = await fetch(`${API_URL}/cep`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ cep })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error("Erro na API de busca por CEP:");      
    }
    return data;
  },

  async postPedido(dados) {
    const res = await fetch(`${API_URL}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

    const data = await res.json();

    if (!res.ok) {
      throw new Error("Erro ao salvar pedido.");
    }

    return data;
      
  },

  async pagarPix(id) {
    const res = await fetch(`${API_URL}/payment/pix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    return await res.json();
     
  },

  async pagarCartao(pedido_id, dadosCartao) {

    console.log("ENVIANDO:", {
      pedido_id,
      ...dadosCartao
    });

    const res = await fetch(`${API_URL}/payment/card-bricks`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        pedido_id,
        ...dadosCartao
      })
    });

    return await res.json();
},

  async iniciarConsultaPagamento() {
    const interval = setInterval(async () => {

      const res = await fetch(
        `${API_URL}/pedido/status?id=${pedido_id}`
      );

      const data = await res.json();

      if (data.status_pagamento === "approved") {

        clearInterval(interval);

        document.getElementById("pixStatus")
          .innerHTML = "Pagamento aprovado ✔";

        window.location.href =
          "/sucesso.html";
      }

    }, 5000);
  }

};
