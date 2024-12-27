import http.server
import socketserver
from urllib.parse import urlparse
import os

class LanguageHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse l'URL demandée
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        print(f"Requête reçue pour : {path}")  # Debug

        # Redirection de la racine
        if path == "/" or path == "/index.html":
            print("Redirection racine vers /lang/fr/")  # Debug
            self.send_response(302)
            self.send_header('Location', '/lang/fr/')
            self.end_headers()
            return

        # Si le chemin se termine par un slash, ajouter index.html
        if path.endswith('/'):
            original_path = path
            path = path + 'index.html'
            print(f"Conversion du chemin {original_path} vers {path}")  # Debug

        # Construire le chemin du fichier
        # Supprimer le slash initial pour le chemin relatif
        relative_path = path.lstrip('/')
        file_path = os.path.join(os.getcwd(), relative_path)
        
        print(f"Recherche du fichier : {file_path}")  # Debug

        # Vérifier si le fichier existe
        if os.path.exists(file_path) and os.path.isfile(file_path):
            print(f"Fichier trouvé : {file_path}")  # Debug
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        
        print(f"Fichier non trouvé : {file_path}")  # Debug
        self.send_error(404, f"File not found: {path}")

    def end_headers(self):
        # Ajouter les headers CORS et de cache pour le développement
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

PORT = 8000
Handler = LanguageHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serveur démarré sur le port {PORT}")
    print(f"Dossier racine : {os.getcwd()}")
    print("URL de base : http://localhost:8000")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServeur arrêté")