// Offline reading: the page is revalidated with the server when online and served from cache when not.
const CACHE = 'swcc-4668a8a03e';
const CORE = ["./", "index.html", "about.html", "manifest.webmanifest", "icon.svg", "icon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "fonts/shippori-mincho-400.woff2", "fonts/shippori-mincho-500.woff2", "fonts/zen-kaku-gothic-new-400.woff2", "fonts/zen-kaku-gothic-new-500.woff2", "fonts/ibm-plex-mono-400.woff2"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => (k.startsWith('swcc-') && k !== CACHE) || k.startsWith('adcc-')).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, {cache: 'no-cache'})
      .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
