/**
 * Loạn 12 Sứ Quân — Static Hosting Data Updater
 * Cơ chế cập nhật dữ liệu tự động từ hosting tĩnh của người dùng (không phụ thuộc Google)
 *
 * Tiêu chí:
 * 1. Đọc version.json từ hosting tĩnh: version, build, tag, và danh sách dataFiles (url, hash, size).
 * 2. Khi có mạng: kiểm tra ngầm. Nếu có bản mới, tải từng gói về bộ nhớ tạm (Staging).
 * 3. Tải xong 100% tất cả các gói mới áp dụng thay thế bản cũ (Atomic Commit).
 * 4. Nếu mất mạng hoặc lỗi giữa chừng: giữ nguyên bản dữ liệu cũ, lưu vị trí đã tải để tiếp tục lần sau.
 * 5. Không có mạng hoặc máy chủ lỗi: ứng dụng hoạt động 100% bình thường, không treo, không gián đoạn.
 */

import { offlineStorage } from './offlineStorage';

export interface DataFileInfo {
  path: string;
  hash?: string;
  size?: number;
}

export interface VersionManifest {
  version: string;
  build: number;
  tag: string;
  dataFiles?: DataFileInfo[];
  releaseNotes?: string;
}

export interface UpdateProgress {
  isUpdating: boolean;
  totalFiles: number;
  completedFiles: number;
  percent: number;
  currentFileName: string;
  error?: string;
}

class DataUpdaterService {
  private progressListeners: Array<(progress: UpdateProgress) => void> = [];
  private currentProgress: UpdateProgress = {
    isUpdating: false,
    totalFiles: 0,
    completedFiles: 0,
    percent: 0,
    currentFileName: '',
  };

  /**
   * Đăng ký lắng nghe tiến trình cập nhật để hiển thị giao diện tinh gọn nếu cần
   */
  onProgress(callback: (progress: UpdateProgress) => void): () => void {
    this.progressListeners.push(callback);
    callback(this.currentProgress);
    return () => {
      this.progressListeners = this.progressListeners.filter((cb) => cb !== callback);
    };
  }

  private notify(progress: UpdateProgress) {
    this.currentProgress = progress;
    this.progressListeners.forEach((cb) => {
      try {
        cb(progress);
      } catch {}
    });
  }

  /**
   * Kiểm tra và thực hiện cập nhật gói dữ liệu từ máy chủ hosting tĩnh
   */
  async checkAndDownloadUpdates(baseUrl: string = ''): Promise<{ hasUpdate: boolean; applied: boolean }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { hasUpdate: false, applied: false };
    }

    try {
      const manifestUrl = `${baseUrl}/version.json?_t=${Date.now()}`;
      const response = await fetch(manifestUrl, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        return { hasUpdate: false, applied: false };
      }

      const remoteManifest: VersionManifest = await response.json();
      const currentVersion = localStorage.getItem('loan12sq_data_version') || '1.0.0';

      // So sánh số phiên bản hoặc mã tag
      if (remoteManifest.version === currentVersion && !remoteManifest.dataFiles?.length) {
        return { hasUpdate: false, applied: false };
      }

      const filesToDownload = remoteManifest.dataFiles || [];
      if (filesToDownload.length === 0) {
        localStorage.setItem('loan12sq_data_version', remoteManifest.version);
        return { hasUpdate: true, applied: true };
      }

      // Bắt đầu tải từng gói vào Staging trong IndexedDB
      this.notify({
        isUpdating: true,
        totalFiles: filesToDownload.length,
        completedFiles: 0,
        percent: 0,
        currentFileName: 'Đang chuẩn bị gói cập nhật...',
      });

      const stagedFiles: Record<string, any> = {};
      let completed = 0;

      for (const file of filesToDownload) {
        // Kiểm tra xem gói này đã được tải dở trước đó chưa (Resume capability)
        const cachedStage = await offlineStorage.getItem(`stage_${file.path}`);
        if (cachedStage) {
          stagedFiles[file.path] = cachedStage;
          completed++;
          this.notify({
            isUpdating: true,
            totalFiles: filesToDownload.length,
            completedFiles: completed,
            percent: Math.round((completed / filesToDownload.length) * 100),
            currentFileName: file.path,
          });
          continue;
        }

        try {
          const fileRes = await fetch(`${baseUrl}/${file.path}?_v=${remoteManifest.build}`, {
            cache: 'no-store',
          });
          if (!fileRes.ok) {
            throw new Error(`Lỗi tải tệp: ${file.path}`);
          }

          const fileData = await fileRes.json().catch(() => fileRes.blob());
          stagedFiles[file.path] = fileData;

          // Lưu ngay vào staging để nếu rớt mạng vẫn không bị mất
          await offlineStorage.setItem(`stage_${file.path}`, fileData);

          completed++;
          this.notify({
            isUpdating: true,
            totalFiles: filesToDownload.length,
            completedFiles: completed,
            percent: Math.round((completed / filesToDownload.length) * 100),
            currentFileName: file.path,
          });
        } catch (fetchErr) {
          console.warn('[DataUpdater] Mạng gián đoạn khi đang tải gói:', file.path);
          this.notify({
            ...this.currentProgress,
            isUpdating: false,
            error: 'Mạng gián đoạn. Bản cũ được giữ nguyên an toàn.',
          });
          return { hasUpdate: true, applied: false };
        }
      }

      // KHI ĐÃ TẢI XONG 100% TẤT CẢ CÁC FILE:
      // Thực hiện Atomic Commit chuyển từ Staging sang Active Store
      for (const [filePath, content] of Object.entries(stagedFiles)) {
        await offlineStorage.setItem(`data_${filePath}`, content);
        // Dọn dẹp staging sau khi commit thành công
        await offlineStorage.setItem(`stage_${filePath}`, null);
      }

      localStorage.setItem('loan12sq_data_version', remoteManifest.version);
      localStorage.setItem('loan12sq_data_build', String(remoteManifest.build));

      this.notify({
        isUpdating: false,
        totalFiles: filesToDownload.length,
        completedFiles: completed,
        percent: 100,
        currentFileName: 'Đã cập nhật dữ liệu hoàn tất!',
      });

      return { hasUpdate: true, applied: true };
    } catch (e) {
      // Khi không có mạng hoặc máy chủ hosting tạm thời lỗi:
      // Không báo lỗi gián đoạn, giữ nguyên trải nghiệm offline mượt mà
      return { hasUpdate: false, applied: false };
    }
  }
}

export const dataUpdater = new DataUpdaterService();
