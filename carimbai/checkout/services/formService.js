import { state } from "../state/state.js";
import { formUI } from "../ui/formUI.js";
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

    validateFields(dados) {
        let isValid = true;
        console.warn("DATA: ", dados);
        cpf = String(dados.cpf).replace(/\D/g, "");        

        // CPF
        if (!dados.cpf || typeof dados.cpf !== "string" || !validarCPF(dados.cpf)) {
            formUI.setErro("cpf", "CPF inválido");
            isValid =  false;
        } else {
            formUI.limparErro("cpf");
        }

        // FRETE
        if (dados.entrega === "frete" && !state.frete) {
            formUI.setErro("cep", "Selecione um frete válido");
            isValid = false;
        } else {
            formUI.limparErro("cep");
        }

        return isValid;

    }

}
