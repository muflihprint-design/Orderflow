// NAMA CACHE DIBUAT UNIK AGAR TIDAK BENTROK DENGAN APLIKASI LAIN
const CACHE_NAME = 'orderflow-pro-cache-v1.0.3'; 

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Install Service Worker & Simpan Cache Baru
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      }).catch(err => console.log('Gagal menyimpan cache:', err))
  );
});

// Activate Service Worker & Hapus Cache Lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // LOGIKA PENTING: Hanya hapus cache yang berawalan 'orderflow-pro-cache-'
          // Ini mencegah Service Worker menghapus cache dari aplikasi Kasir atau aplikasi Anda yang lain
          if (cache.startsWith('orderflow-pro-cache-') && cache !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch/Load Web (Metode Network First)
self.addEventListener('fetch', event => {
  // Abaikan request ke Google Script & Telegram API agar tidak terjadi error CORS di Cache
  if (event.request.url.includes('script.google.com') || event.request.url.includes('api.telegram.org')) {
    return;
  }

  event.respondWith(
    // Coba ambil dari internet dulu agar selalu dapat versi terbaru HTML
    fetch(event.request)
      .catch(() => {
        // Jika offline atau koneksi putus, baru ambil dari cache
        return caches.match(event.request);
      })
  );
});
