import { api } from "../api/api.js";
import { state } from "../state/state.js";

const CART_TOKEN_KEY =
  "carimbai_cart_token";


export const carrinhoService = {

  // =========================================================
  // TOKEN
  // =========================================================

  getToken() {

    return localStorage.getItem(
      CART_TOKEN_KEY
    );
  },


  // =========================================================
  // CARREGAR CARRINHO
  // =========================================================

  async carregar() {

    const token =
      this.getToken();


    if (!token) {

      throw new Error(
        "Carrinho não encontrado."
      );
    }


    const carrinho =
      await api.getCarrinho(token);


    if (
      !carrinho ||
      carrinho.status !== "ativo"
    ) {

      throw new Error(
        "Seu carrinho não está mais disponível."
      );
    }


    if (
      !Array.isArray(carrinho.itens) ||
      carrinho.itens.length === 0
    ) {

      throw new Error(
        "Seu carrinho está vazio."
      );
    }


    // -------------------------------------------------------
    // ESTADO
    // -------------------------------------------------------

    state.carrinho =
      carrinho;

    state.itens =
      carrinho.itens;

    state.subtotalProdutos =
      Number(
        carrinho.subtotal
      ) || 0;


    return carrinho;
  },


  // =========================================================
  // SUBTOTAL
  // =========================================================

  getSubtotal() {

    return Number(
      state.subtotalProdutos
    ) || 0;
  }
};
