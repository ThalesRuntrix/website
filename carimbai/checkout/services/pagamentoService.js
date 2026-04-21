import { api } from "../api/api.js";

export const pagamentoService = {

    async pagarPix(pedido) {
        try {
            return await api.pagarPix(pedido);        
        } catch (error) {
        console.error("Erro ao gerar pagamento para PIX:", error);
        }        
    },

    async pagarCartao(pedido) {
        try {
            return await api.pagarCartao(pedido);        
        } catch (error) {
        console.error("Erro ao gerar pagamento para cartão:", error);
        }  
    }

}

