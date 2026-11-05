const CACHE_NAME = 'driftlog-local-brain-v4';
const OFFLINE_ASSETS = [
  './driftlog.html',
  './assets/local-brain.worker.js',
  './assets/vendor/transformers.min.js',
  './assets/vendor/ort.bundle.min.mjs',
  './assets/vendor/ort-wasm-simd-threaded.jsep.mjs',
  './assets/vendor/ort-wasm-simd-threaded.jsep.wasm',
  './models/Xenova/all-MiniLM-L6-v2/config.json',
  './models/Xenova/all-MiniLM-L6-v2/special_tokens_map.json',
  './models/Xenova/all-MiniLM-L6-v2/tokenizer.json',
  './models/Xenova/all-MiniLM-L6-v2/tokenizer_config.json',
  './models/Xenova/all-MiniLM-L6-v2/vocab.txt',
  './models/Xenova/all-MiniLM-L6-v2/onnx/model_int8.onnx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('driftlog-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
