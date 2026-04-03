import { getProduto } from "../api/api.js";

export async function getProdutobyId(id) {
  try {
    const produto = await getProduto(id);
    return produto;

  } catch (error) {
    console.error("Erro ao buscar produto:", error);
  }
}
