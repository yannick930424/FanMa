import http.server
import socketserver
from urllib.parse import urlparse
import os

class LanguageHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse l'URL demandée
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Redirection de la racine vers /fr/
        if path == "/" or path == "/index.html":
            self.send_response(302)
            self.send_header('Location', '/fr/')
            self.end_headers()
            return

        # Gestion des chemins /fr/ et /en/
        if path.endswith('/'):
            path += 'index.html'
        
        # Vérifie si le fichier existe
        file_path = os.path.join(os.getcwd(), path.lstrip('/'))
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        
        # Si le fichier n'existe pas, renvoie une 404
        self.send_error(404, "File not found")

    def end_headers(self):
        # Ajoute les headers CORS pour le développement
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

PORT = 8000
Handler = LanguageHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serveur démarré sur le port {PORT}")
    print("Accédez au site via : http://localhost:8000")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServeur arrêté")