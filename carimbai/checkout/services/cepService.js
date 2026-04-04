import { api } from "../api/api.js";

export const cepService =  {

  // Buscar endereço pelo campo de cep
  async obterEndereco(cep) {
    try {

      const res = await api.buscarCEP(cep);
      const data = await res.json();

      if (!res.ok) throw new Error();

      cepService.setAddressFields(data);
      cepService.blockAddressFieldsEdition();      

    } catch (err) {
      console.error("Erro no serviço de busca por CEP: ", err);
    }
  },

  setAddressFields(data) {
    document.getElementById("rua").value = data.rua || "";
    document.getElementById("bairro").value = data.bairro || "";
    document.getElementById("cidade").value = data.cidade || "";
    document.getElementById("estado").value = data.estado || "";
  },

  blockAddressFieldsEdition(){
    document.getElementById("rua").readOnly = true;
    document.getElementById("bairro").readOnly = true;
    document.getElementById("cidade").readOnly = true;
    document.getElementById("estado").readOnly = true;
  },

  // validação de cep
  validarCEP(cep) {
    return /^\d{5}-?\d{3}$/.test(cep);
  }

}
