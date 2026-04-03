import { api } from "../api/api.js";

export async function getProdutoById(id) {
  try {
    return await api.getProduto(id);

  } catch (error) {
    console.error("Erro ao buscar produto:", error);
  }
}
