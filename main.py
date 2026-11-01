from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit

HOST = "0.0.0.0"
PORT = 5000


class MeuHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        requested_path = unquote(urlsplit(self.path).path)
        normalized_path = "/" + "/".join(
            part for part in requested_path.split("/") if part not in ("", ".", "..")
        )
        if normalized_path == "/attached_assets" or normalized_path.startswith("/attached_assets/"):
            self.send_error(404)
            return

        if normalized_path == "/":
            self.path = "/index.html"
        super().do_GET()

    def log_message(self, format, *args):
        print(f"[Servidor] {self.address_string()} - {format % args}")


if __name__ == "__main__":
    with ThreadingHTTPServer((HOST, PORT), MeuHandler) as servidor:
        print(f"Servidor iniciado em {HOST}:{PORT}. Abra o Preview do Replit.", flush=True)
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")
