function gerarQR() {
    let qr;
    const url = document.getElementById("url").value;

    document.getElementById("qrcode").innerHTML = "";

    qr = new QRCode(document.getElementById("qrcode"), {
        text: url,
        width: 200,
        height: 200
    });
}

function baixarQR() {
    const img = document.querySelector("#qrcode img");
    if (!img) {
        alert("Gere um QR Code primeiro!");
        return;
    }

    const link = document.createElement("a");
    link.href = img.src;
    link.download = "qrcode.png";
    link.click();
}