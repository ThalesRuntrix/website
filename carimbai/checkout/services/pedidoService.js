import { api } from "../api/api.js";
import { state } from "../state/state.js";
import { getParam } from "../utils/format.js";
import { formService } from "./formService.js";

export const pedidoService = {

    async salvarPedido(dados){
        try {
            return api.postPedido(dados);
        } catch(error){
            console.error("Erro ao salvar pedido:", error);
        }
    },    

    populatePedidoData() {
                
        return pedidoData = formService.getFormData(); 
                
    }

    
}