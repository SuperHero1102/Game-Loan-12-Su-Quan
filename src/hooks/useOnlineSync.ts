/**
 * Loạn 12 Sứ Quân — Mobile Game Remaster
 * Hook quản lý trạng thái mạng, bộ nhớ Offline và tự động kiểm tra/nạp gói cập nhật
 * Đảm bảo:
 * 1. Tự động cập nhật ngầm lên bản mới nhất khi có mạng ổn định.
 * 2. Nếu đang trong trận đấu ('BATTLE'): chờ kết thúc trận mới tự động làm mới để không làm gián đoạn ván chơi.
 * 3. Khi bấm "Kiểm tra bản cập nhật mới": lập tức kết nối máy chủ, dọn sạch cache cũ và cập nhật phiên bản mới ngay (1 chạm).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameScreen } from '../types/game';

export interface OnlineSyncState {
  isOnline: boolean;
  updateAvailable: boolean;
  isCheckingUpdate: boolean;
  lastCheckedTime: number | null;
  cacheReady: boolean;
  checkForUpdate: (isUserInitiated?: boolean) => Promise<boolean>;
  applyUpdate: () => void;
  forceCleanUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

const CURRENT_CLIENT_TAG = 'v9.3.0';

export function useOnlineSync(currentScreen?: GameScreen): OnlineSyncState {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<number | null>(() => Date.now());
  const [cacheReady, setCacheReady] = useState<boolean>(false);

  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const userRequestedReloadRef = useRef<boolean>(false);
  const pendingUpdateRef = useRef<boolean>(false);
  const currentScreenRef = useRef<GameScreen | undefined>(currentScreen);

  useEffect(() => {
    currentScreenRef.current = currentScreen;
    // Nếu có bản cập nhật đang chờ và người chơi vừa thoát khỏi màn trận BATTLE:
    if (pendingUpdateRef.current && currentScreen !== 'BATTLE') {
      pendingUpdateRef.current = false;
      void forceCleanUpdate();
    }
  }, [currentScreen]);

  // 1. Hàm làm sạch toàn diện bộ nhớ đệm và tải phiên bản mới nhất ngay tức thì
  const forceCleanUpdate = useCallback(async () => {
    userRequestedReloadRef.current = true;
    setIsCheckingUpdate(true);

    try {
      // Xóa sạch 100% các kho dữ liệu CacheStorage
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
      }

      // Thông báo Service Worker dọn sạch và nạp mới
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          if (registration.active) {
            registration.active.postMessage({ type: 'FORCE_CLEAN_RELOAD' });
          }
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await registration.update().catch(() => {});
        }
      }

      try {
        localStorage.setItem('loan12sq_app_tag', CURRENT_CLIENT_TAG);
      } catch {}
    } catch (e) {
      console.warn('[PWA] Force clean error:', e);
    }

    // Tải mới tức thì kèm tham số chống lưu đệm HTTP trên WebKit Safari của iPhone
    setTimeout(() => {
      const cleanUrl = `${window.location.origin}${window.location.pathname}?_v=${Date.now()}`;
      window.location.replace(cleanUrl);
    }, 250);
  }, []);

  // 2. Kiểm tra cập nhật gói tin
  const checkForUpdate = useCallback(
    async (isUserInitiated: boolean = false): Promise<boolean> => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return false;
      }

      setIsCheckingUpdate(true);
      setLastCheckedTime(Date.now());

      // Nếu do người dùng bấm trực tiếp vào nút: LẬP TỨC cập nhật bản mới và làm mới trang ngay (1 chạm)
      if (isUserInitiated) {
        await forceCleanUpdate();
        return true;
      }

      try {
        // Kiểm tra phiên bản mới từ server qua tệp version.json
        const res = await fetch(`/version.json?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (res.ok) {
          const remoteVersion = await res.json();
          const storedTag = localStorage.getItem('loan12sq_app_tag');

          // Nếu máy chủ có bản mới khác với máy hiện tại:
          if (
            remoteVersion?.tag &&
            remoteVersion.tag !== storedTag &&
            remoteVersion.tag !== CURRENT_CLIENT_TAG
          ) {
            if (currentScreenRef.current === 'BATTLE') {
              // Đang trong trận: Chờ trận đấu kết thúc mới tự động làm mới
              pendingUpdateRef.current = true;
              setUpdateAvailable(true);
            } else {
              // Ngoài trận: Tự động cập nhật ngay lập tức
              await forceCleanUpdate();
              return true;
            }
          }
        }

        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();

            if (registration.waiting) {
              waitingWorkerRef.current = registration.waiting;
              if (currentScreenRef.current === 'BATTLE') {
                pendingUpdateRef.current = true;
                setUpdateAvailable(true);
              } else {
                await forceCleanUpdate();
                return true;
              }
            }
          }
        }

        if ('caches' in window) {
          const hasCache = await window.caches.has('loan-12-su-quan-v9.3');
          if (hasCache) setCacheReady(true);
        }
      } catch {
        // Bỏ qua lỗi mạng
      } finally {
        setTimeout(() => {
          setIsCheckingUpdate(false);
        }, 800);
      }

      return false;
    },
    [forceCleanUpdate]
  );

  // 3. Tự động kiểm tra khi có mạng ổn định và khi mở app
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        void checkForUpdate(false);
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleLocalCacheReady = () => {
      setCacheReady(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-cache-ready', handleLocalCacheReady);

    // Tự động kiểm tra ngầm sau khi mở app 2.5s
    const timer = setTimeout(() => {
      if (navigator.onLine) {
        void checkForUpdate(false);
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-cache-ready', handleLocalCacheReady);
    };
  }, [checkForUpdate]);

  // 4. Lắng nghe Service Worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('caches' in window) {
      window.caches.has('loan-12-su-quan-v9.2').then((hasCache) => {
        if (hasCache) setCacheReady(true);
      });
    }

    if (!('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;
    const handleControllerChange = () => {
      if (!userRequestedReloadRef.current || refreshing) return;
      refreshing = true;
      const cleanUrl = `${window.location.origin}${window.location.pathname}?_v=${Date.now()}`;
      window.location.replace(cleanUrl);
    };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'NEW_UPDATE_READY') {
        if (currentScreenRef.current === 'BATTLE') {
          pendingUpdateRef.current = true;
          setUpdateAvailable(true);
        } else {
          void forceCleanUpdate();
        }
      }
      if (event.data.type === 'CACHE_READY') {
        setCacheReady(true);
      }
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        waitingWorkerRef.current = registration.waiting;
        if (currentScreenRef.current === 'BATTLE') {
          pendingUpdateRef.current = true;
          setUpdateAvailable(true);
        } else {
          void forceCleanUpdate();
        }
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker;
              if (currentScreenRef.current === 'BATTLE') {
                pendingUpdateRef.current = true;
                setUpdateAvailable(true);
              } else {
                void forceCleanUpdate();
              }
            } else {
              setCacheReady(true);
            }
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [forceCleanUpdate]);

  const applyUpdate = useCallback(() => {
    void forceCleanUpdate();
  }, [forceCleanUpdate]);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    isOnline,
    updateAvailable,
    isCheckingUpdate,
    lastCheckedTime,
    cacheReady,
    checkForUpdate,
    applyUpdate,
    forceCleanUpdate,
    dismissUpdate,
  };
}
