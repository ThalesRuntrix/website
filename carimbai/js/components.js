async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  const res = await fetch(file);
  const html = await res.text();
  el.innerHTML = html;
}

// HEADER
async function loadHeader(config = {}) {
  await loadComponent("header", "/carimbai/components/header.html");

  atualizarContadorCarrinhoGlobal();

  if (config.title) {
    document.getElementById("header-title").textContent =
      config.title;
  }

  if (config.description) {
    document.getElementById("header-desc").textContent =
      config.description;
  }

  if (config.extra) {
    document.getElementById("header-extra").innerHTML =
      config.extra;
  }
}

async function atualizarContadorCarrinhoGlobal() {

    const contador =
        document.getElementById(
            "contador-carrinho"
        );


    if (!contador) {
        return;
    }


    const token =
        localStorage.getItem(
            "carimbai_cart_token"
        );


    // --------------------------------------------------------
    // NÃO EXISTE CARRINHO
    // --------------------------------------------------------

    if (!token) {

        contador.textContent = "0";

        contador.classList.remove(
            "ativo"
        );

        return;
    }


    try {

        const response =
            await fetch(
                "https://carimbai-api.vercel.app/api/carrinho" +
                `?token=${encodeURIComponent(token)}`
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error ||
                "Erro ao carregar carrinho"
            );
        }


        const quantidade =
            Number(
                data.quantidade_itens
            ) || 0;


        contador.textContent =
            quantidade;


        if (quantidade > 0) {

            contador.classList.add(
                "ativo"
            );

        } else {

            contador.classList.remove(
                "ativo"
            );
        }

    }

    catch (error) {

        console.error(
            "Erro ao atualizar contador do carrinho:",
            error
        );

        /*
         * Em caso de erro de rede,
         * não quebramos o header.
         */

        contador.textContent = "0";

        contador.classList.remove(
            "ativo"
        );
    }
}

// componentes automáticos
loadComponent("benefits", "/carimbai/components/benefits.html");
loadComponent("proof", "/carimbai/components/proof.html");
loadComponent("cta", "/carimbai/components/cta.html");
loadComponent("footer", "/carimbai/components/footer.html");
