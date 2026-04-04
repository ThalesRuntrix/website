import { state } from "../state/state.js";
import { getParam } from "../utils/format.js";
import { validarCPF } from "../utils/format.js";

export const formService = {

    getFormAddress() {
        let address={};
        return address = {
            rua: document.getElementById("rua").value,
            numero: document.getElementById("numero").value,
            complemento: document.getElementById("complemento").value,
            bairro: document.getElementById("bairro").value,
            cidade: document.getElementById("cidade").value,
            estado: document.getElementById("estado").value,
            cep: document.getElementById("cep").value
        };            
    
    },

    getFormData() {

        const endereco = formService.getFormAddress();
        const entrega = document.getElementById("entrega").value; 
        let dados={}; 
        return dados = {
            produto_id: getParam("id"),
            produto_nome: state.produto.nome,
            total: state.totalPedido,
    
            nome: document.getElementById("nome").value,
            email: document.getElementById("email").value,
            cpf: document.getElementById("cpf").value,
    
            ...endereco,    
    
            entrega: entrega,
            frete_valor: state.frete ?? 0,
            frete_prazo: state.prazo ?? 0,
            frete_nome: state.freteNome ?? "",
            pagamento: document.getElementById("pagamento").value
        };
    },

    validateField(cpf, entrega) {

        if (!state.produto) {
            alert("Produto ainda está carregando.");
            return;
        }

        if (!validarCPF(cpf)) {
            alert("CPF inválido");
            return;
        }

        if (entrega === "frete" && !state.frete) {
            alert("⚠️ Selecione uma opção de frete antes de continuar");
            return;
        }
        return;

    }

}
