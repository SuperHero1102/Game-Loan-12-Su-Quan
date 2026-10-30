import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { deviceOptimizer } from './services/deviceOptimizer';

// Khởi chạy tự động nhận diện dòng điện thoại Android/iOS & tối ưu hiển thị ngầm
deviceOptimizer.initSilentOptimization();

const ACTIVE_CACHE_NAME = 'loan-12-su-quan-v9.2';

/**
 * Tự động quét và nạp ngầm toàn bộ tài nguyên (JS/TSX modules, CSS, Ảnh 13 Sứ Quân, HTML, Fonts)
 * vào CacheStorage ngay sau khi menu chính đã mở, giúp người dùng vào game tức thì và dùng 100% Offline.
 */
async function warmOfflineCache() {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  if (!navigator.onLine) return;

  try {
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

    const perfEntries =
      typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function'
        ? performance
            .getEntriesByType('resource')
            .map((entry) => entry.name)
            .filter(
              (url) =>
                url.startsWith(window.location.origin) &&
                !url.includes('__vite_ping') &&
                !url.includes('node_modules/.vite/deps_temp')
            )
        : [];

    const origin = window.location.origin;
    const coreUrls = [
      origin + '/',
      origin + '/index.html',
      origin + '/legacy-bundle.css',
      origin + '/legacy-bundle.js',
      origin + '/manifest.webmanifest',
      origin + '/apple-touch-icon.png',
      origin + '/app-logo.png',
      origin + '/campaign_map.png',
      origin + '/campaign_map.jpeg',
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

    // Nạp theo lô nhỏ (batch) 3 tài nguyên cùng lúc để không làm nghẽn kết nối WebKit trên iOS
    const batchSize = 3;
    for (let i = 0; i < allUrls.length; i += batchSize) {
      const batch = allUrls.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (url) => {
          try {
            const existing = await cache.match(url);
            if (!existing) {
              const response = await fetch(url, { credentials: 'same-origin' });
              if (response && response.status === 200) {
                await cache.put(url, response.clone());
              }
            }
          } catch {
            // Bỏ qua lỗi từng tài nguyên nếu mạng chậm
          }
        })
      );
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls: allUrls,
      });
    }

    window.dispatchEvent(new CustomEvent('pwa-cache-ready'));
  } catch (err) {
    console.warn('[PWA] Pre-warm cache skipped:', err);
  }
}

function scheduleBackgroundWarmup() {
  const run = () => {
    void warmOfflineCache();
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 600);
  }
}

const rootElement = document.getElementById('root');
if (rootElement && !(window as any).__APP_MOUNTED__) {
  if (!(window as any).__LEGACY_MODE__) {
    (window as any).__APP_MOUNTED__ = true;
    createRoot(rootElement).render(<App />);
  }
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js?v=9.2.0', { scope: '/' })
      .then((reg) => {
        if (reg.waiting && !navigator.serviceWorker.controller) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        scheduleBackgroundWarmup();
        setTimeout(warmOfflineCache, 3000);
      })
      .catch(() => {
        scheduleBackgroundWarmup();
      });
  });
}

