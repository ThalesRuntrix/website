import { api } from "../api/api.js";

export const pagamentoService = {

    async pagarPix(pedidoId) {        
        try {
            return await api.pagarPix(pedidoId);
        } catch (error) {
        console.error("Erro ao gerar pagamento para PIX:", error);
        }        
    },

    async pagarCartao(pedidoId) {        
        try {
            
            return await api.pagarCartao(pedidoId);        
        } catch (error) {
        console.error("Erro ao gerar pagamento para cartão:", error);
        }  
    }

}

