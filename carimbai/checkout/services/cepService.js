import { buscarCEP } from "../api/api.js"

export async function obterEndereco(cep) {
  try {
    const data = await buscarCEP(cep);

    return {
      rua: data.rua || "",
      bairro: data.bairro || "",
      cidade: data.cidade || "",
      estado: data.estado || ""
    };

  } catch (err) {
    console.warn("Erro ao buscar CEP:", err);

    return {
      rua: "",
      bairro: "",
      cidade: "",
      estado: ""
    };
  }
}

