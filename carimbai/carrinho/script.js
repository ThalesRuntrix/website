const API_URL =
    "https://carimbai-api.vercel.app/api";


const CART_TOKEN_KEY =
    "carimbai_cart_token";


/* ============================================================
   ESTADO
============================================================ */

let carrinho = null;


/* ============================================================
   ELEMENTOS
============================================================ */

const loadingEl =
    document.getElementById(
        "carrinho-loading"
    );


const vazioEl =
    document.getElementById(
        "carrinho-vazio"
    );


const conteudoEl =
    document.getElementById(
        "carrinho-conteudo"
    );


const itensEl =
    document.getElementById(
        "carrinho-itens"
    );


const subtotalEl =
    document.getElementById(
        "carrinho-subtotal"
    );


const totalEl =
    document.getElementById(
        "carrinho-total"
    );


const checkoutBtn =
    document.getElementById(
        "btn-checkout"
    );


/* ============================================================
   FORMATA MOEDA
============================================================ */

function formatarMoeda(valor) {

    const numero =
        Number(valor) || 0;


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


/* ============================================================
   OBTER TOKEN
============================================================ */

function getCartToken() {

    return localStorage.getItem(
        CART_TOKEN_KEY
    );
}


/* ============================================================
   SALVAR TOKEN
============================================================ */

function setCartToken(token) {

    if (!token) {
        return;
    }

    localStorage.setItem(
        CART_TOKEN_KEY,
        token
    );
}


/* ============================================================
   REMOVER TOKEN
============================================================ */

function removeCartToken() {

    localStorage.removeItem(
        CART_TOKEN_KEY
    );
}


/* ============================================================
   ATUALIZA ESTADO DA TELA
============================================================ */

function mostrarLoading() {

    loadingEl.style.display =
        "block";

    vazioEl.style.display =
        "none";

    conteudoEl.style.display =
        "none";
}


function mostrarVazio() {

    loadingEl.style.display =
        "none";

    vazioEl.style.display =
        "flex";

    conteudoEl.style.display =
        "none";
}


function mostrarConteudo() {

    loadingEl.style.display =
        "none";

    vazioEl.style.display =
        "none";

    conteudoEl.style.display =
        "block";
}


/* ============================================================
   CARREGAR CARRINHO
============================================================ */

async function carregarCarrinho() {

    mostrarLoading();


    const token =
        getCartToken();


    try {

        let url =
            `${API_URL}/carrinho`;


        if (token) {

            url +=
                `?token=${encodeURIComponent(token)}`;
        }


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Erro ao carregar carrinho."
            );
        }


        // ----------------------------------------------------
        // SALVAR TOKEN
        // ----------------------------------------------------

        if (data.token) {

            setCartToken(
                data.token
            );
        }


        carrinho =
            data;


        // ----------------------------------------------------
        // VAZIO
        // ----------------------------------------------------

        if (
            !Array.isArray(data.itens) ||
            data.itens.length === 0
        ) {

            mostrarVazio();

            atualizarContadorCarrinho(0);

            return;
        }


        // ----------------------------------------------------
        // RENDER
        // ----------------------------------------------------

        renderCarrinho(
            data
        );


        mostrarConteudo();


        atualizarContadorCarrinho(
            data.quantidade_itens
        );

    }


    catch (error) {

        console.error(
            "Erro carregarCarrinho:",
            error
        );


        mostrarErro(
            error.message
        );
    }
}


/* ============================================================
   RENDERIZAR CARRINHO
============================================================ */

function renderCarrinho(data) {

    itensEl.innerHTML = "";


    for (const item of data.itens) {

        const itemEl =
            criarItemCarrinho(
                item
            );


        itensEl.appendChild(
            itemEl
        );
    }


    subtotalEl.textContent =
        formatarMoeda(
            data.subtotal
        );


    totalEl.textContent =
        formatarMoeda(
            data.subtotal
        );
}


/* ============================================================
   CRIAR ITEM
============================================================ */

function criarItemCarrinho(item) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "carrinho-item";


    article.dataset.itemId =
        item.id;


    // --------------------------------------------------------
    // IMAGEM
    // --------------------------------------------------------

    const imagemWrapper =
        document.createElement(
            "div"
        );


    imagemWrapper.className =
        "carrinho-item-imagem";


    /*
     * Primeiro tenta obter uma imagem do produto.
     *
     * Como carrinho_itens ainda não guarda imagem_url,
     * usamos a API do produto para descobrir a imagem.
     *
     * Por isso fazemos carregamento posterior.
     */

    imagemWrapper.innerHTML =
        `
        <div class="imagem-placeholder">
            🛒
        </div>
        `;


    // --------------------------------------------------------
    // INFORMAÇÕES
    // --------------------------------------------------------

    const info =
        document.createElement(
            "div"
        );


    info.className =
        "carrinho-item-info";


    const nome =
        document.createElement(
            "h2"
        );


    nome.textContent =
        item.produto_nome;


    info.appendChild(
        nome
    );


    // --------------------------------------------------------
    // VARIAÇÃO
    // --------------------------------------------------------

    if (item.variacao) {

        const variacao =
            document.createElement(
                "p"
            );


        variacao.className =
            "carrinho-item-variacao";


        variacao.textContent =
            `Variação: ${item.variacao}`;


        info.appendChild(
            variacao
        );
    }


    // --------------------------------------------------------
    // SKU
    // --------------------------------------------------------

    /*
    if (item.sku) {

        const sku =
            document.createElement(
                "p"
            );

        sku.className =
            "carrinho-item-sku";

        sku.textContent =
            `SKU: ${item.sku}`;

        info.appendChild(
            sku
        );
    }
    */


    // --------------------------------------------------------
    // PREÇO
    // --------------------------------------------------------

    const preco =
        document.createElement(
            "p"
        );


    preco.className =
        "carrinho-item-preco";


    preco.textContent =
        formatarMoeda(
            item.preco_unitario
        );


    info.appendChild(
        preco
    );


    // --------------------------------------------------------
    // CONTROLES
    // --------------------------------------------------------

    const controles =
        document.createElement(
            "div"
        );


    controles.className =
        "carrinho-item-controles";


    const menos =
        document.createElement(
            "button"
        );


    menos.type =
        "button";


    menos.className =
        "quantidade-btn";


    menos.textContent =
        "−";


    menos.title =
        "Diminuir quantidade";


    menos.addEventListener(
        "click",
        () => {

            alterarQuantidade(
                item.id,
                Number(item.quantidade) - 1
            );
        }
    );


    const quantidade =
        document.createElement(
            "span"
        );


    quantidade.className =
        "quantidade-valor";


    quantidade.textContent =
        item.quantidade;


    const mais =
        document.createElement(
            "button"
        );


    mais.type =
        "button";


    mais.className =
        "quantidade-btn";


    mais.textContent =
        "+";


    mais.title =
        "Aumentar quantidade";


    mais.addEventListener(
        "click",
        () => {

            alterarQuantidade(
                item.id,
                Number(item.quantidade) + 1
            );
        }
    );


    controles.appendChild(
        menos
    );

    controles.appendChild(
        quantidade
    );

    controles.appendChild(
        mais
    );


    info.appendChild(
        controles
    );


    // --------------------------------------------------------
    // REMOVER
    // --------------------------------------------------------

    const remover =
        document.createElement(
            "button"
        );


    remover.type =
        "button";


    remover.className =
        "carrinho-item-remover";


    remover.textContent =
        "Remover";


    remover.addEventListener(
        "click",
        () => {

            removerItem(
                item.id
            );
        }
    );


    info.appendChild(
        remover
    );


    // --------------------------------------------------------
    // SUBTOTAL DO ITEM
    // --------------------------------------------------------

    const totalWrapper =
        document.createElement(
            "div"
        );


    totalWrapper.className =
        "carrinho-item-total";


    const total =
        Number(
            item.subtotal
        ) || 0;


    totalWrapper.textContent =
        formatarMoeda(
            total
        );


    // --------------------------------------------------------
    // MONTAR
    // --------------------------------------------------------

    article.appendChild(
        imagemWrapper
    );


    article.appendChild(
        info
    );


    article.appendChild(
        totalWrapper
    );


    return article;
}


/* ============================================================
   ALTERAR QUANTIDADE
============================================================ */

async function alterarQuantidade(
    itemId,
    quantidade
) {

    if (
        quantidade < 1
    ) {

        await removerItem(
            itemId
        );

        return;
    }


    if (
        quantidade > 50
    ) {

        alert(
            "Quantidade máxima por item: 50."
        );

        return;
    }


    const token =
        getCartToken();


    if (!token) {

        return;
    }


    try {

        bloquearCarrinho(
            true
        );


        const response =
            await fetch(
                `${API_URL}/carrinho`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            token,

                            item_id:
                                itemId,

                            quantidade
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Não foi possível alterar a quantidade."
            );
        }


        carrinho =
            data;


        renderCarrinho(
            data
        );


        atualizarContadorCarrinho(
            data.quantidade_itens
        );

    }


    catch (error) {

        console.error(
            "Erro alterarQuantidade:",
            error
        );


        alert(
            error.message ||
            "Erro ao alterar quantidade."
        );

    }


    finally {

        bloquearCarrinho(
            false
        );
    }
}


/* ============================================================
   REMOVER ITEM
============================================================ */

async function removerItem(
    itemId
) {

    const token =
        getCartToken();


    if (!token) {
        return;
    }


    try {

        bloquearCarrinho(
            true
        );


        const response =
            await fetch(
                `${API_URL}/carrinho` +
                `?token=${encodeURIComponent(token)}` +
                `&item_id=${encodeURIComponent(itemId)}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Não foi possível remover o item."
            );
        }


        carrinho =
            data;


        if (
            !data.itens ||
            data.itens.length === 0
        ) {

            mostrarVazio();

            atualizarContadorCarrinho(0);

            return;
        }


        renderCarrinho(
            data
        );


        atualizarContadorCarrinho(
            data.quantidade_itens
        );

    }


    catch (error) {

        console.error(
            "Erro removerItem:",
            error
        );


        alert(
            error.message ||
            "Erro ao remover item."
        );

    }


    finally {

        bloquearCarrinho(
            false
        );
    }
}


/* ============================================================
   BLOQUEAR INTERFACE
============================================================ */

function bloquearCarrinho(
    bloquear
) {

    const botoes =
        document.querySelectorAll(
            ".carrinho-item button"
        );


    botoes.forEach(
        botao => {

            botao.disabled =
                bloquear;
        }
    );


    checkoutBtn.disabled =
        bloquear;
}


/* ============================================================
   CONTADOR
============================================================ */

function atualizarContadorCarrinho(
    quantidade
) {

    const contador =
        document.getElementById(
            "contador-carrinho"
        );


    if (!contador) {
        return;
    }


    const valor =
        Number(quantidade) || 0;


    contador.textContent =
        valor;


    if (
        valor > 0
    ) {

        contador.classList.add(
            "ativo"
        );

    } else {

        contador.classList.remove(
            "ativo"
        );
    }
}


/* ============================================================
   ERRO
============================================================ */

function mostrarErro(
    mensagem
) {

    loadingEl.style.display =
        "none";


    vazioEl.style.display =
        "none";


    conteudoEl.style.display =
        "flex";


    conteudoEl.innerHTML =
        `
        <div class="carrinho-erro">

            <h2>
                Não foi possível carregar o carrinho
            </h2>

            <p>
                ${mensagem || "Tente novamente."}
            </p>

            <button
                type="button"
                class="btn-primary"
                onclick="carregarCarrinho()">
                Tentar novamente
            </button>

        </div>
        `;
}


/* ============================================================
   CHECKOUT
============================================================ */

checkoutBtn.addEventListener(
    "click",
    () => {

        const token =
            getCartToken();


        if (!token) {

            alert(
                "Seu carrinho está vazio."
            );

            return;
        }


        if (
            !carrinho ||
            !Array.isArray(
                carrinho.itens
            ) ||
            carrinho.itens.length === 0
        ) {

            alert(
                "Seu carrinho está vazio."
            );

            return;
        }


        window.location.href =
            "/carimbai/checkout/index.html";
    }
);


/* ============================================================
   INICIAR
============================================================ */

carregarCarrinho();