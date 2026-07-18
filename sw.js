// Painel: prioriza a REDE (rede-primeiro), cai pro cache só se estiver offline.
// Assim toda atualização aparece na hora, sem ficar preso a versão antiga.
const CACHE = 'painel-v6'
const SHELL = ['./', './index.html', './zxing.js', './logo.png', './manifest.webmanifest', './icon-192.png', './icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (url.origin !== location.origin) return // dados da Supabase sempre pela rede
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copy))
        return res
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  )
})
