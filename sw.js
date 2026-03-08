const CACHE_NAME='tai-test-final-v1';
const ASSETS=['./','./index.html','./app.js','./questions.json','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
