/**
 * Loạn 12 Sứ Quân — Mobile Game Remaster
 * Hook quản lý trạng thái mạng, bộ nhớ Offline và tự động kiểm tra/nạp gói cập nhật
 * Đảm bảo KHÔNG BAO GIỜ tự ý reload làm văng màn chơi khi người dùng đang đánh trận.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface OnlineSyncState {
  isOnline: boolean;
  updateAvailable: boolean;
  isCheckingUpdate: boolean;
  lastCheckedTime: number | null;
  cacheReady: boolean;
  checkForUpdate: () => Promise<boolean>;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

export function useOnlineSync(): OnlineSyncState {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<number | null>(() => Date.now());
  const [cacheReady, setCacheReady] = useState<boolean>(false);

  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const userRequestedReloadRef = useRef<boolean>(false);

  // 1. Kiểm tra cập nhật gói tin
  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }

    setIsCheckingUpdate(true);
    setLastCheckedTime(Date.now());

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();

          if (registration.waiting) {
            waitingWorkerRef.current = registration.waiting;
            setUpdateAvailable(true);
            setIsCheckingUpdate(false);
            return true;
          }
        }
      }
      if ('caches' in window) {
        const hasCache = await window.caches.has('loan-12-su-quan-v8');
        if (hasCache) setCacheReady(true);
      }
    } catch {
      // Bỏ qua lỗi mạng
    } finally {
      setTimeout(() => {
        setIsCheckingUpdate(false);
      }, 900);
    }

    return false;
  }, []);

  // 2. Kiểm tra trạng thái mạng trình duyệt
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        void checkForUpdate();
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

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-cache-ready', handleLocalCacheReady);
    };
  }, [checkForUpdate]);

  // 3. Lắng nghe Service Worker và phát hiện khi có bản cập nhật mới
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('caches' in window) {
      window.caches.has('loan-12-su-quan-v8').then((hasCache) => {
        if (hasCache) setCacheReady(true);
      });
    }

    if (!('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;
    const handleControllerChange = () => {
      // CHỈ tải lại trang khi chính người chơi đã bấm nút "Cập nhật"
      // Tuyệt đối không tự ý reload giữa chừng làm văng màn chơi!
      if (!userRequestedReloadRef.current || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'NEW_UPDATE_READY') {
        setUpdateAvailable(true);
      }
      if (event.data.type === 'CACHE_READY') {
        setCacheReady(true);
      }
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        waitingWorkerRef.current = registration.waiting;
        setUpdateAvailable(true);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker;
              setUpdateAvailable(true);
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
  }, []);

  // 4. Hàm áp dụng bản cập nhật khi người chơi chủ động bấm nút
  const applyUpdate = useCallback(() => {
    userRequestedReloadRef.current = true;
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
    } else if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }

    setTimeout(() => {
      window.location.reload();
    }, 450);
  }, []);

  // 5. Tạm ẩn thông báo cập nhật (để người chơi đánh nốt ván)
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
    dismissUpdate,
  };
}
