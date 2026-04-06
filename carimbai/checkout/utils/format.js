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
  const normalizedCPF = String(cpf).replace(/\D/g, ""); 
  if (!normalizedCPF) return false;  

  if (normalizedCPF.length !== 11) return false;

  // elimina CPFs inválidos conhecidos
  if (/^(\d)\1+$/.test(normalizedCPF)) return false;

  let soma = 0;
  let resto;

  // primeiro dígito
  for (let i = 0; i < 9; i++) {
    soma += parseInt(normalizedCPF[i]) * (10 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  if (resto !== parseInt(normalizedCPF[9])) return false;

  // segundo dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(normalizedCPF[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  if (resto !== parseInt(normalizedCPF[10])) return false;

  return true;
      
}
