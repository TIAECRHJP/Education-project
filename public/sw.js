const SHELL_CACHE = 'gurukul-shell-v2';
const CHAPTER_CACHE = 'gurukul-chapters-v1';
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.json', '/bodhi_vriksh_transparent.webp'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => ![SHELL_CACHE, CHAPTER_CACHE].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/chapters/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CHAPTER_CACHE);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return (await cache.match(request)) || new Response(JSON.stringify({ success: false, error: 'This chapter is not saved on this device yet.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
      }
    })());
    return;
  }
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ success: false, error: 'The server is offline. Reconnect and try again.' }), { status: 503, headers: { 'Content-Type': 'application/json' } })));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match('/offline.html')) || new Response('Gurukul is offline. Start the local server and refresh this page.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })));
    return;
  }
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.webp')) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(SHELL_CACHE).then(cache => cache.put(request, copy)); } return response; })));
  }
});
