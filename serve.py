#!/usr/bin/env python3
"""Локальный сервер с теми же короткими адресами, что на Apache."""
from __future__ import annotations

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 43127


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write('%s - %s\n' % (self.address_string(), fmt % args))

    def _redirect(self, location: str, code: int = 301) -> None:
        parsed = urlparse(self.path)
        if parsed.query:
            location = f'{location}?{parsed.query}'
        self.send_response(code)
        self.send_header('Location', location)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path or '/'

        if path in ('/index', '/index.html', '/index/'):
            return self._redirect('/')
        if path != '/' and path.endswith('/'):
            return self._redirect(path.rstrip('/') or '/')
        if path.endswith('.html') and path != '/404.html':
            return self._redirect(path[:-5] or '/')

        if path != '/' and '.' not in os.path.basename(path):
            candidate = path.lstrip('/') + '.html'
            if os.path.isfile(os.path.join(ROOT, candidate)):
                self.path = '/' + candidate
                if parsed.query:
                    self.path += '?' + parsed.query
                return SimpleHTTPRequestHandler.do_GET(self)

        return SimpleHTTPRequestHandler.do_GET(self)


if __name__ == '__main__':
    httpd = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    print(f'http://127.0.0.1:{PORT}')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print()
        httpd.server_close()
