import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const ACTIVE_CACHE_NAME = 'loan-12-su-quan-v5';

/**
 * Tự động quét và nạp toàn bộ tài nguyên (JS/TSX modules, CSS, Ảnh 13 Sứ Quân, HTML, Fonts)
 * vào CacheStorage ngay từ lần mở đầu tiên, giúp người dùng tải 1 lần và dùng mãi mãi 100% Offline.
 */
async function warmOfflineCache() {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  if (!navigator.onLine) return;

  try {
    // Xóa các cache cũ để tránh xung đột phiên bản module Vite
    const existingKeys = await window.caches.keys();
    await Promise.all(
      existingKeys.map((key) => {
        if (key !== ACTIVE_CACHE_NAME) {
          return window.caches.delete(key);
        }
        return Promise.resolve();
      })
    );

    const cache = await window.caches.open(ACTIVE_CACHE_NAME);

    // Thu thập toàn bộ URL script, module, style, font, ảnh vừa tải trên trang
    const perfEntries = performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter(
        (url) =>
          url.startsWith(window.location.origin) &&
          !url.includes('__vite_ping') &&
          !url.includes('node_modules/.vite/deps_temp')
      );

    const origin = window.location.origin;
    const coreUrls = [
      origin + '/',
      origin + '/index.html',
      origin + '/manifest.webmanifest',
      origin + '/apple-touch-icon.png',
      origin + '/app-logo.png',
      origin + '/campaign_map.png',
      origin + '/campaign_map.jpeg',
      // Tất cả 13 thẻ tướng & nhân vật
      origin + '/assets/aistudio/IMG_2711_a7aea1e8.png',
      origin + '/assets/aistudio/image_e32a7cc1.png',
      origin + '/assets/aistudio/IMG_2715_e22f2946.png',
      origin + '/assets/aistudio/image_16246c8b.png',
      origin + '/assets/aistudio/IMG_2714_0b96c8eb.png',
      origin + '/assets/aistudio/image_ce7ec614.png',
      origin + '/assets/aistudio/IMG_2713_a4589fa9.png',
      origin + '/assets/aistudio/image_f02fa1cb.png',
      origin + '/assets/aistudio/IMG_2712_34b6309d.png',
      origin + '/assets/aistudio/image_b4dad4bb.png',
      origin + '/assets/aistudio/IMG_2716_ea79d901.png',
      origin + '/assets/aistudio/image_711ab021.png',
      origin + '/assets/aistudio/image_805b66e6.png',
      origin + '/assets/aistudio/image_53c4514a.png',
      origin + '/assets/aistudio/image_598e8894.png',
      origin + '/assets/aistudio/image_da41c035.png',
      origin + '/assets/aistudio/image_db1edde4.png',
      origin + '/assets/aistudio/image_64c9aaab.png',
      origin + '/assets/aistudio/image_6a312610.png',
      origin + '/assets/aistudio/IMG_2706_d13bfa83.jpeg',
    ];

    const allUrls = Array.from(new Set([...coreUrls, ...perfEntries]));

    // Lưu vào CacheStorage trực tiếp
    await Promise.allSettled(
      allUrls.map(async (url) => {
        const existing = await cache.match(url);
        if (!existing) {
          const response = await fetch(url, { credentials: 'same-origin' });
          if (response && response.status === 200) {
            await cache.put(url, response.clone());
          }
        }
      })
    );

    // Gửi danh sách cho Service Worker đồng bộ
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls: allUrls,
      });
    }
  } catch (err) {
    console.warn('[PWA] Pre-warm cache skipped:', err);
  }
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        // Quét và lưu toàn bộ tài nguyên sau khi trang tải xong
        setTimeout(warmOfflineCache, 500);
        setTimeout(warmOfflineCache, 2500);
      })
      .catch(() => {
        // Vẫn lưu vào CacheStorage kể cả khi SW đang khởi tạo
        setTimeout(warmOfflineCache, 800);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
