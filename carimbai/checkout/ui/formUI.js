
export function preencherEnderecoUI(data) {
  if (!data) return;

  document.getElementById("rua").value = data.rua || "";
  document.getElementById("bairro").value = data.bairro || "";
  document.getElementById("cidade").value = data.cidade || "";
  document.getElementById("estado").value = data.estado || "";

  document.getElementById("rua").readOnly = true;
  document.getElementById("bairro").readOnly = true;
  document.getElementById("cidade").readOnly = true;
  document.getElementById("estado").readOnly = true;
}

// 🔥 controla exibição do endereço
export function toggleEnderecoUI(entrega) {
  const box = document.getElementById("endereco-box");

  const campos = [
    "rua", "numero", "bairro", "cidade", "estado", "cep"
  ];

  if (entrega === "frete") {
    box.style.display = "block";

    campos.forEach(id => {
      document.getElementById(id).setAttribute("required", true);
    });

  } else {
    box.style.display = "none";

    campos.forEach(id => {
      document.getElementById(id).removeAttribute("required");
      document.getElementById(id).value = "";
    });
  }
}
