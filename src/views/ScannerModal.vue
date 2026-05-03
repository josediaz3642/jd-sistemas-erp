// Lógica base del componente
import { Html5QrcodeScanner } from "html5-qrcode";

const onScanSuccess = (decodedText) => {
  emit('detected', decodedText); // Enviamos el código al componente padre
  stopScanner(); // Apagamos la cámara
};

const startScanner = () => {
  const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
  scanner.render(onScanSuccess);
};