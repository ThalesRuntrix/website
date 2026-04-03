import { calcularFrete } from "../api/api.js"

export async function getFrete(cep) {
  try {
    const opcoes = await calcularFrete(cep);
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
}

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

export function escolherRecomendado(opcoes) {
  return opcoes.reduce((melhor, atual) => {
    return (atual.valor * atual.prazo) < (melhor.valor * melhor.prazo)
      ? atual
      : melhor;
  });
}