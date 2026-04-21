import api from "../api/api.js";

export const pagamentoService = {

    async pagarPix() {
        try {
            return await api.pagarPix();        
        } catch (error) {
        console.error("Erro ao gerar pagamento para PIX:", error);
        }        
    },

    async pagarCartao() {
        try {
            return await api.pagarCartao();        
        } catch (error) {
        console.error("Erro ao gerar pagamento para cartão:", error);
        }  
    }

}

