/*!
 * SmartGrain — Leitor de Artigos
 * sw.js — deixa o aplicativo disponível offline (a tradução, essa, precisa de rede).
 */
var CACHE = 'sg-leitor-v1';
var ARQUIVOS = [
  './',
  './index.html',
  './app.js',
  './extract.js',
  './texto.js',
  './traducao.js',
  './manifest.webmanifest',
  './vendor/pdfjs/pdf.min.js',
  './vendor/pdfjs/pdf.worker.min.js',
  '../favicon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (chaves) {
      return Promise.all(chaves.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // tradução e fontes externas sempre pela rede
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(function (achado) {
      if (achado) return achado;
      return fetch(req).then(function (resp) {
        if (resp && resp.ok && resp.type === 'basic') {
          var copia = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copia); });
        }
        return resp;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
