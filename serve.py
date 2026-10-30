from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

os.chdir(Path(__file__).resolve().parent/'dist')
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.glb':'model/gltf-binary','.json':'application/json','.woff2':'font/woff2'}
print('Local: http://127.0.0.1:4174',flush=True)
ThreadingHTTPServer(('127.0.0.1',4174),Handler).serve_forever()
