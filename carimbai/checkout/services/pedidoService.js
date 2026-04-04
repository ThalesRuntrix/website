import { api } from "../api/api"

export const pedidoService = {

    async salvarPedido(dados){
        try {
            return await api.postPedido(dados);
        } catch(err){
            console.error("Erro ao salvar pedido:", error);
        }
    }
}