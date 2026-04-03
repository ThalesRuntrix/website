import { state } from "../state/state.js";
import { formatar } from "../utils/format.js";

export function atualizarResumo() {
  const preco = state.precoBase;

  const entrega = document.getElementById("entrega").value;
  const pagamento = document.getElementById("pagamento").value;

  let frete = entrega === "frete" ? state.frete : 0;
  let desconto = pagamento === "pix" ? preco * 0.05 : 0;

  const total = preco + frete - desconto;
  state.total = total;

  document.getElementById("resumo-produto").textContent = formatar(preco);
  document.getElementById("resumo-frete").textContent = formatar(frete);
  document.getElementById("resumo-desconto").textContent = `- ${formatar(desconto)}`;
  document.getElementById("resumo-total").textContent = formatar(total);
}
