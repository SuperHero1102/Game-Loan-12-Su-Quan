/**
 * Loạn 12 Sứ Quân — Service Worker Offline Engine (PWA v6)
 * Hỗ trợ chơi game 100% offline hoàn chỉnh: tải 1 lần và dùng mãi mãi không cần mạng internet / 4G / WiFi.
 * Toàn bộ mã nguồn, dữ liệu 13 Sứ Quân, hình ảnh, sa bàn chiến dịch và font chữ được lưu vĩnh viễn trong CacheStorage.
 */

const CACHE_NAME = 'loan-12-su-quan-v8';

// Danh sách toàn bộ tài nguyên cốt lõi cần nạp vào bộ nhớ đệm
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/legacy-bundle.css',
  '/legacy-bundle.js',
  '/manifest.webmanifest',
  '/apple-touch-icon.png',
  '/app-logo.png',
  '/campaign_map.png',
  '/campaign_map.jpeg',
  // Tất cả 13 ảnh thẻ tướng & linh thú + tài nguyên nghệ thuật
  '/assets/aistudio/IMG_2706_d13bfa83.jpeg',
  '/assets/aistudio/IMG_2711_a7aea1e8.png',
  '/assets/aistudio/IMG_2712_34b6309d.png',
  '/assets/aistudio/IMG_2713_a4589fa9.png',
  '/assets/aistudio/IMG_2714_0b96c8eb.png',
  '/assets/aistudio/IMG_2715_e22f2946.png',
  '/assets/aistudio/IMG_2716_ea79d901.png',
  '/assets/aistudio/IMG_2717_4ec5da0d.png',
  '/assets/aistudio/IMG_2718_5f4dccd8.png',
  '/assets/aistudio/image_16246c8b.png',
  '/assets/aistudio/image_53c4514a.png',
  '/assets/aistudio/image_598e8894.png',
  '/assets/aistudio/image_5e1bdba7.png',
  '/assets/aistudio/image_64c9aaab.png',
  '/assets/aistudio/image_6a312610.png',
  '/assets/aistudio/image_711ab021.png',
  '/assets/aistudio/image_805b66e6.png',
  '/assets/aistudio/image_b4dad4bb.png',
  '/assets/aistudio/image_ce7ec614.png',
  '/assets/aistudio/image_da41c035.png',
  '/assets/aistudio/image_db1edde4.png',
  '/assets/aistudio/image_e32a7cc1.png',
  '/assets/aistudio/image_e4fa36be.png',
  '/assets/aistudio/image_f02fa1cb.png',
  '/assets/aistudio/screenshot_1_1ecd9f01.png',
];

async function notifyClients(message) {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage(message);
    }
  } catch {
    // Ignore client notification errors
  }
}

// Cài đặt Service Worker và nạp trước toàn bộ tài nguyên vào cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      );
      await notifyClients({ type: 'CACHE_READY' });
    })
  );
});

// Kích hoạt Service Worker và dọn dẹp các cache phiên bản cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
      .then(() => notifyClients({ type: 'CACHE_READY' }))
  );
});

// Nhận danh sách toàn bộ script / module / style đang chạy từ trang chính để lưu cache ngay lập tức
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        await Promise.all(
          urls.map(async (url) => {
            try {
              const matched = await cache.match(url);
              if (!matched) {
                const res = await fetch(url, { credentials: 'same-origin' });
                if (res && (res.status === 200 || res.type === 'opaque')) {
                  await cache.put(url, res);
                }
              }
            } catch {
              // Bỏ qua nếu đang offline
            }
          })
        );
        await notifyClients({ type: 'CACHE_READY' });
      })
    );
  }
});

// Xử lý chặn và phản hồi mọi yêu cầu mạng (Fetch)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Bỏ qua các request không phải GET hoặc giao thức khác http/https
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Bỏ qua Vite HMR ping/websocket và các file tải xuống dung lượng lớn (.apk, .zip)
  if (
    request.url.includes('__vite_ping') ||
    request.url.includes('?html-proxy') ||
    request.url.endsWith('.apk') ||
    request.url.endsWith('.zip')
  ) {
    return;
  }

  const url = new URL(request.url);

  // 1. Lưu trữ và phục vụ Google Fonts (fonts.googleapis.com & fonts.gstatic.com) - Cache First
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const res = await fetch(request);
          if (res && (res.status === 200 || res.type === 'opaque')) {
            cache.put(request, res.clone());
          }
          return res;
        } catch {
          return cached || new Response('', { status: 404 });
        }
      })
    );
    return;
  }

  // 2. Đối với yêu cầu điều hướng trang web (Navigation: mở app, tải lại trang)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            try {
              const clone = networkResponse.clone();
              const text = await clone.text();

              // Nếu mạng trả về trang chờ của Cloud Run / AI Studio container, không lưu vào cache!
              if (
                text.includes('Please wait while your application starts') ||
                text.includes('accounts.google.com')
              ) {
                const cache = await caches.open(CACHE_NAME);
                const cachedGame =
                  (await cache.match('/index.html')) || (await cache.match('/'));
                if (cachedGame) {
                  return cachedGame;
                }
                return networkResponse;
              }

              // Chỉ lưu cache khi là trang game thật
              if (text.includes('Loạn 12 Sứ Quân') || text.includes('id="root"')) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, networkResponse.clone());
                cache.put('/', networkResponse.clone());
                cache.put('/index.html', networkResponse.clone());
              }
            } catch {
              // Bỏ qua lỗi clone
            }
          }
          return networkResponse;
        })
        .catch(async () => {
          // Khi tắt mạng (Offline) hoặc server đang khởi động lại
          const cache = await caches.open(CACHE_NAME);
          const matchedExact = await cache.match(request);
          if (matchedExact) return matchedExact;

          const matchedRoot = await cache.match('/');
          if (matchedRoot) return matchedRoot;

          const matchedIndex = await cache.match('/index.html');
          if (matchedIndex) return matchedIndex;

          const matchedAny = await cache.match(request, { ignoreSearch: true });
          if (matchedAny) return matchedAny;

          return new Response(
            '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Loạn 12 Sứ Quân</title></head><body style="background:#0c0a09;color:#fbbf24;font-family:sans-serif;text-align:center;padding:40px;"><h2>Loạn 12 Sứ Quân</h2><p>Đang tải ứng dụng...</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 3. Đối với mã nguồn JS/TSX, CSS, Hình ảnh:
  // Cache First đối với hình ảnh và tài nguyên tĩnh để mở tức thì cả online và offline
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse =
        (await cache.match(request)) ||
        (await cache.match(request, { ignoreSearch: true }));

      // Nếu là hình ảnh hoặc font đã có trong cache: trả về ngay lập tức
      if (
        cachedResponse &&
        (request.destination === 'image' || request.destination === 'font')
      ) {
        // Tự động kiểm tra cập nhật nền nếu có mạng
        fetch(request)
          .then((netRes) => {
            if (netRes && (netRes.status === 200 || netRes.type === 'opaque')) {
              cache.put(request, netRes.clone());
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Đối với script / style / module: thử lấy mạng trước, nếu offline trả về bản cache ngay
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response('Offline resource unavailable', {
          status: 503,
          statusText: 'Offline',
        });
      }
    })
  );
});
