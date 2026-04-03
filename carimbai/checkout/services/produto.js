import {api} from "../api/api.js"

export async function getProdutobyId(id) {
  try {
    const produto = await api.getProduto(id);
    return produto;

  } catch (error) {
    console.error("Erro ao buscar produto:", error);
  }
}
