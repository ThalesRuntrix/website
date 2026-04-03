const API_URL = "https://carimbai-api.vercel.app/api";

export default api = {
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
      throw new Error("Erro frete");
    }

    return data;
  },

  async buscarCEP(cep) {
    const res = await fetch(`${API_URL}/cep`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ cep })
    });

    return res.json();
  }
};
