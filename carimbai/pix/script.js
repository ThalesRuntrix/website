function copyPix() {
    const text = document.getElementById("pixKey").innerText;
    navigator.clipboard.writeText(text);
    alert("Chave PIX copiada!");
}
