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

  async pagarPix(pedido) {
    const res = await fetch(`${API_URL}/payment/pix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido)
    });

    const data = await res.json();

    const qr = document.getElementById("qr");
    if (qr) {
      qr.src = "data:image/png;base64," + data.qr_code_base64;
      qr.style.display = "block";
    }
  },

  async pagarCartao(pedido) {
    const res = await fetch(`${API_URL}/payment/card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
    });

    const data = await res.json();

    window.location.href = data.init_point;
  }

};
