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
  console.warn("VALIDAR CPF - CPF: ", cpf);
  if (!cpf) return false;  

  if (cpf.length !== 11) return false;

  // elimina CPFs inválidos conhecidos
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  // primeiro dígito
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  if (resto !== parseInt(cpf[9])) return false;

  // segundo dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  if (resto !== parseInt(cpf[10])) return false;

  return true;
      
}
