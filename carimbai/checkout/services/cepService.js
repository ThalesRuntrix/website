import { api } from "../api/api.js";


export const cepService =  {

  // Buscar endereço pelo campo de cep
  async obterEndereco(cep) {
    try {
      const isCepFormatValid = cepService.validarFormato(cep);
      console.warn("IS CEP FORMAT VALID: ", isCepFormatValid);
      if(isCepFormatValid){
        const data = await api.buscarCEP(cep); 
        cepService.setAddressFields(data);
        cepService.blockAddressFieldsEdition(); 
      } else {
        console.error("FORMATO DE CEP INVÁLIDO");
      }           

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
  validarFormato(cep) {
    return /^\d{8}$/.test(cep);
  },

  async validarCEP(cep) {
    try{
      const data = await this.obterEndereco(cep);

      if(!data || !data.cidade) return false;

      return data;     

    } catch(error) {
      console.error("Erro ao validar CEP: ", error);
      return false;

    }
  }

}
