import { api } from "../api/api.js";
import { formService } from "./formService.js";

export const pedidoService = {

    async salvarPedido(dados){
        try {
            return api.postPedido(dados);
        } catch(error){
            console.error("Erro ao salvar pedido:", error);
        }
    }   

    
}