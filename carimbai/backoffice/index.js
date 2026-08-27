const API_URL =
  "https://carimbai-api.vercel.app/api";


// =========================================================
// ESTADO
// =========================================================

let senhaBackoffice = null;

// =========================================================
// ELEMENTOS
// =========================================================

const loginBackoffice =
  document.getElementById("login-backoffice");

const backoffice =
  document.getElementById("backoffice");


// =========================================================
// LOGIN
// =========================================================

document
  .getElementById("form-login")
  .addEventListener("submit", async (e) => {

    e.preventDefault();

    const senha =
      document
        .getElementById("senha-backoffice")
        .value
        .trim();

    if (!senha) return;

    senhaBackoffice = senha;

    try {

      await carregarProdutos();

      loginBackoffice.style.display = "none";

      backoffice.classList.remove("auth-hidden");

    } catch (error) {

      senhaBackoffice = null;

      document
        .getElementById("login-erro")
        .textContent =
          "Senha inválida ou erro ao acessar o backoffice.";

      console.error(error);

    }

  });


// =========================================================
// HEADERS
// =========================================================

function getHeaders() {

  return {

    "Content-Type": "application/json",

    "X-Backoffice-Password":
      senhaBackoffice

  };

}