function copyPix() {
    const text = document.getElementById("pixKey").innerText;
    navigator.clipboard.writeText(text);

    const btn = document.querySelector(".btn-copy");
    btn.innerText = "✅ Copiado!";
}