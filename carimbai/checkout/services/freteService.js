import { api } from "../api/api.js";
import { state } from "../state/state.js";
import { formUI } from "../ui/formUI.js";
import { renderFrete } from "../ui/freteUI.js";

export const freteService =  {

  tentarCalcularFrete() {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");
    const entrega = document.getElementById("entrega").value;

    if (cep.length === 8 && entrega === "frete") {
      calcularFrete(cep);
    }
  },

  // calcular frete
  async calcularFrete(cep) {
    try {
      const data = api.calcularFrete(cep);
      renderFrete(data);

    } catch (err) {
      console.warn("Frete real falhou, usando fallback");
      // 🔥 FALLBACK
      const fallback = [
        {
          id: 1,
          nome: "Entrega Econômica",
          empresa: "Carimbai",
          valor: 15,
          prazo: 5
        },
        {
          id: 2,
          nome: "Entrega Rápida",
          empresa: "Carimbai",
          valor: 25,
          prazo: 3
        }
      ];

    renderFrete(fallback);    
    }

    atualizarResumo();
  },

  selecionarFrete() {
    const selecionado = document.querySelector('input[name="frete"]:checked');

    if (!selecionado) return;

    state.frete = Number(selecionado.value);
    state.prazo = Number(selecionado.dataset.prazo);
    state.freteNome = selecionado.dataset.nome;

    formUI.atualizarResumo();
  },

  async getFrete(cep) {
    try {
      
      const opcoes = await api.calcularFrete(cep);
      // aqui você pode:
      // filtrar
      // ordenar
      // limitar

      return tratarOpcoesFrete(opcoes);

    } catch (err) {
      console.warn("Erro ao buscar frete, usando fallback");

      return tratarOpcoesFrete([
        {
          id: 1,
          nome: "Entrega Econômica",
          empresa: "Carimbai",
          valor: 15,
          prazo: 5
        },
        {
          id: 2,
          nome: "Entrega Rápida",
          empresa: "Carimbai",
          valor: 25,
          prazo: 3
        }
      ]);
    }
  },

  escolherRecomendado(opcoes) {
    return opcoes.reduce((melhor, atual) => {
      return (atual.valor * atual.prazo) < (melhor.valor * melhor.prazo)
        ? atual
        : melhor;
    });
  }


 };

function tratarOpcoesFrete(opcoes) {

  // 🔥 ordenar por preço
  const ordenadas = [...opcoes].sort((a, b) => a.valor - b.valor);

  const maisBarato = ordenadas[0];
  const segundoMaisBarato = ordenadas[1];
  const maisRapido = opcoes.reduce((a, b) => a.prazo < b.prazo ? a : b);

  // evitar duplicados
  const unicos = [maisBarato, segundoMaisBarato, maisRapido]
    .filter(Boolean)
    .filter((item, index, arr) =>
      index === arr.findIndex(i => i.id === item.id)
    );

  return unicos;
}


