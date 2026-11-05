/**
 * Loạn 12 Sứ Quân — Mobile Game Remaster
 * Offline Storage & Self-Healing Service (IndexedDB + Storage Persistence)
 *
 * Ràng buộc:
 * 1. Tiến độ và cài đặt người chơi giữ nguyên cách lưu hiện tại trong localStorage,
 *    không bị ghi đè hay xóa bỏ khi cập nhật.
 * 2. Lưu trữ dữ liệu nội dung, bản sao tài nguyên vào IndexedDB.
 * 3. Kích hoạt navigator.storage.persist() để bảo vệ dữ liệu vĩnh viễn không bị hệ điều hành xóa.
 * 4. Tự phục hồi dữ liệu: kiểm tra tính toàn vẹn khi khởi động, tải bù ngầm khi có mạng.
 */

const DB_NAME = 'loan12sq_offline_db';
const DB_VERSION = 1;
const STORE_CONTENT = 'content_store';
const STORE_META = 'meta_store';

export interface StorageStatus {
  isPersisted: boolean;
  quotaBytes?: number;
  usageBytes?: number;
  availableMb?: number;
  isLowSpace: boolean;
}

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Khởi tạo kết nối IndexedDB an toàn
   */
  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB không được hỗ trợ trên thiết bị này'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_CONTENT)) {
          db.createObjectStore(STORE_CONTENT, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  /**
   * Lưu dữ liệu nội dung vào IndexedDB
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CONTENT, 'readwrite');
        const store = tx.objectStore(STORE_CONTENT);
        const req = store.put({ key, value, timestamp: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[OfflineStorage] Không thể ghi IndexedDB:', e);
    }
  }

  /**
   * Lấy dữ liệu nội dung từ IndexedDB
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_CONTENT, 'readonly');
        const store = tx.objectStore(STORE_CONTENT);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result ? (req.result.value as T) : null);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Yêu cầu hệ điều hành bảo vệ bộ nhớ không bị thu hồi (Storage Persistence)
   * và kiểm tra dung lượng còn lại (Storage Estimate)
   */
  async initStoragePersistence(): Promise<StorageStatus> {
    const status: StorageStatus = {
      isPersisted: false,
      isLowSpace: false,
    };

    if (typeof navigator === 'undefined' || !navigator.storage) {
      return status;
    }

    try {
      // 1. Kiểm tra và yêu cầu persist
      if (navigator.storage.persisted) {
        status.isPersisted = await navigator.storage.persisted();
      }
      if (!status.isPersisted && navigator.storage.persist) {
        status.isPersisted = await navigator.storage.persist();
      }

      // 2. Kiểm tra dung lượng lưu trữ
      if (navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        status.quotaBytes = estimate.quota;
        status.usageBytes = estimate.usage;

        if (estimate.quota !== undefined && estimate.usage !== undefined) {
          const remainingBytes = estimate.quota - estimate.usage;
          status.availableMb = Math.round(remainingBytes / (1024 * 1024));
          // Cảnh báo nếu dung lượng còn lại dưới 15MB
          if (status.availableMb < 15) {
            status.isLowSpace = true;
          }
        }
      }
    } catch (err) {
      console.warn('[OfflineStorage] Không thể kiểm tra Storage Persistence:', err);
    }

    return status;
  }

  /**
   * Tự phục hồi: Kiểm tra tính toàn vẹn của cache và dữ liệu game khi mở app
   */
  async verifyAndHeal(
    criticalUrls: string[],
    onHealComplete?: (success: boolean) => void
  ): Promise<{ complete: boolean; missingCount: number }> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return { complete: true, missingCount: 0 };
    }

    try {
      const cacheKeys = await window.caches.keys();
      const activeKey = cacheKeys.find((k) => k.startsWith('loan-12-su-quan')) || cacheKeys[0];

      if (!activeKey) {
        return { complete: false, missingCount: criticalUrls.length };
      }

      const cache = await window.caches.open(activeKey);
      const missing: string[] = [];

      for (const url of criticalUrls) {
        const match = await cache.match(url);
        if (!match) {
          missing.push(url);
        }
      }

      // Nếu thiếu tài nguyên và thiết bị ĐANG CÓ MẠNG: tự động tải lại âm thầm
      if (missing.length > 0 && navigator.onLine) {
        console.log(`[OfflineStorage] Phát hiện ${missing.length} tệp thiếu. Đang tự phục hồi âm thầm...`);
        const healPromises = missing.map(async (url) => {
          try {
            const res = await fetch(url, { credentials: 'same-origin' });
            if (res && (res.status === 200 || res.type === 'opaque')) {
              await cache.put(url, res);
            }
          } catch {
            // Tiếp tục cho các tệp khác
          }
        });

        await Promise.allSettled(healPromises);
        onHealComplete?.(true);
      }

      return {
        complete: missing.length === 0,
        missingCount: missing.length,
      };
    } catch (e) {
      console.warn('[OfflineStorage] Lỗi kiểm tra tính toàn vẹn:', e);
      return { complete: true, missingCount: 0 };
    }
  }
}

export const offlineStorage = new OfflineStorageService();
