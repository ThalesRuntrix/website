import { state } from "../state/state.js";
import { formatar } from "../utils/format.js";

export const mensagemService = {

    setMessageData(dados, pedido) {

        console.warn("DADOS: ", dados);
        console.warn("PEDIDO: ", pedido);

        const pedidoId = pedido.pedido_codigo;

        const enderecoTexto = dados.entrega === "frete"
        ? `
  📍 *Endereço de Entrega:*
  ${dados.rua}, ${dados.numero}
  ${dados.complemento ? "Comp: " + dados.complemento : ""}
  ${dados.bairro}
  ${dados.cidade} - ${dados.estado}
  CEP: ${dados.cep}
  `
  : "";

      const freteTexto = dados.entrega === "frete"
        ? `🚚 *Transportadora:*
  ${state.freteNome} - ${formatar(state.frete)} (${state.prazo} dias)`
    : "";

      // 🔥 mensagem WhatsApp
      const mensagem = `🛒 *PEDIDO N°: ${pedidoId}*

  👤 *Comprador:*
  ${dados.nome}

  📦 *Produto:*
  ${dados.produto_nome}

  💰 *Valor Total:*
  ${formatar(state.total)}

  💳 *Forma de Pagamento:*
  ${dados.pagamento}

  🚚 *Forma de Entrega:*
  ${dados.entrega}

  ${enderecoTexto}

  ${freteTexto}
  `;

      const url = `https://wa.me/5511943722620?text=${encodeURIComponent(mensagem)}`;

      window.open(url, "_blank");
    


    }     

}