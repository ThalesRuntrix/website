import { api } from "../api/api.js";

export const cepService =  {

  // Buscar endereço pelo campo de cep
  async obterEndereco(cep) {
    try {
      const res = await fetch(`${API_URL}/cep`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cep })
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      document.getElementById("rua").value = data.rua || "";
      document.getElementById("bairro").value = data.bairro || "";
      document.getElementById("cidade").value = data.cidade || "";
      document.getElementById("estado").value = data.estado || "";

      document.getElementById("rua").readOnly = true;
      document.getElementById("bairro").readOnly = true;
      document.getElementById("cidade").readOnly = true;
      document.getElementById("estado").readOnly = true;

    } catch (err) {
      console.warn("CEP não encontrado ou erro inesperado.");
    }
  },

  // validação de cep
  validarCEP(cep) {
    return /^\d{5}-?\d{3}$/.test(cep);
  }

};