const CACHE = 'sbp-app-v7';
const BASE = '/skincare-pollyhtml/app';

self.addEventListener('install', function(e) {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  // Nunca cachear nada - sempre buscar do servidor
  // Isso garante que sempre pegamos a versão mais recente
  if (e.request.method !== 'GET') return;
  
  var url = e.request.url;
  
  // Passar direto para o servidor sem cache
  if (url.includes('onboarding2.html') || 
      url.includes('protocolo.html') ||
      url.includes('api.anthropic.com') ||
      url.includes('googleapis.com')) {
    return;
  }
  
  // Para outros recursos (icons, manifest) usar cache
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return response;
      });
    })
  );
});
