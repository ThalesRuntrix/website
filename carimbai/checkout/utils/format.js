export function formatar(valor) {
  return (valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function getParam(name){
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function validarCPF(cpf){  
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);  
}
