from http.server import SimpleHTTPRequestHandler
import socketserver

PORTAS = [8000, 8080, 5000, 5500, 3000, 3500, 4000, 4500, 7000, 6000, 6500]  # lista de portas possíveis

class MeuHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[Servidor] {self.address_string()} - {format % args}")

# tenta iniciar em uma das portas da lista
for porta in PORTAS:
    try:
        with socketserver.TCPServer(("localhost", porta), MeuHandler) as servidor:
            print("🟢 Servidor iniciado com sucesso!")
            print(f"Acesse: http://localhost:{porta}")
            print("Pressione CTRL+C para encerrar.")
            servidor.serve_forever()
    except OSError as e:
        print(f"⚠ Porta {porta} ocupada, tentando próxima...")
        continue
    break
