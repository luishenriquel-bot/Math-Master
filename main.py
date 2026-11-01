from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HOST = "0.0.0.0"
PORT = 5000

class MeuHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[Servidor] {self.address_string()} - {format % args}")


if __name__ == "__main__":
    with ThreadingHTTPServer((HOST, PORT), MeuHandler) as servidor:
        print(f"Servidor iniciado em {HOST}:{PORT}. Abra o Preview do Replit.", flush=True)
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")
