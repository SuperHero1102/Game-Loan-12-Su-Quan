/**
 * Loạn 12 Sứ Quân — Silent Android & Mobile Device Detection & Display Optimizer
 * Tự động nhận diện dòng điện thoại (Samsung, Xiaomi/Redmi, OPPO/Realme, Vivo, Pixel, iOS...)
 * để đồng bộ khung nhìn thực tế (visualViewport), vùng khuyết màn hình, hỗ trợ cài đặt APK/WebAPK Android
 * và tối ưu hiệu năng GPU/RAM hoàn toàn ngầm dưới hệ thống (Zero UI / Zero Layout Change).
 */

export type DeviceOS = 'android' | 'ios' | 'desktop';
export type AndroidBrand =
  | 'samsung'
  | 'xiaomi'
  | 'oppo_realme'
  | 'vivo'
  | 'pixel'
  | 'huawei_honor'
  | 'generic_android'
  | 'none';

export type ScreenAspectProfile = 'compact' | 'standard' | 'tall_20_9' | 'ultra_tall';
export type PerformanceTier = 'low' | 'mid' | 'high';

export interface DeviceProfile {
  os: DeviceOS;
  androidBrand: AndroidBrand;
  androidVersion: number | null;
  isSamsungInternet: boolean;
  isInAppWebView: boolean;
  aspectProfile: ScreenAspectProfile;
  performanceTier: PerformanceTier;
  devicePixelRatio: number;
  ramGb: number;
  cpuCores: number;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

class DeviceOptimizerService {
  public profile: DeviceProfile;
  private initialized = false;
  private rafId: number | null = null;
  public deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

  constructor() {
    this.profile = this.detectDeviceProfile();
  }

  private detectDeviceProfile(): DeviceProfile {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        os: 'desktop',
        androidBrand: 'none',
        androidVersion: null,
        isSamsungInternet: false,
        isInAppWebView: false,
        aspectProfile: 'standard',
        performanceTier: 'high',
        devicePixelRatio: 1,
        ramGb: 8,
        cpuCores: 8,
      };
    }

    const ua = navigator.userAgent.toLowerCase();
    const navAny = navigator as any;
    const uaPlatform = (navAny.userAgentData?.platform || '').toLowerCase();

    const isIOS =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Nhận diện đầy đủ mọi dòng điện thoại Android (kể cả khi bật chế độ xem máy tính trên Chrome Android)
    const isAndroid =
      !isIOS &&
      (ua.includes('android') ||
        uaPlatform === 'android' ||
        ua.includes('samsungbrowser') ||
        ua.includes('miui') ||
        (ua.includes('linux') && navigator.maxTouchPoints > 1));

    const os: DeviceOS = isAndroid ? 'android' : isIOS ? 'ios' : 'desktop';

    let androidBrand: AndroidBrand = 'none';
    let androidVersion: number | null = null;

    if (isAndroid) {
      const verMatch = ua.match(/android\s+([0-9.]+)/);
      if (verMatch && verMatch[1]) {
        androidVersion = parseFloat(verMatch[1]);
      }

      if (ua.includes('sm-') || ua.includes('samsung') || ua.includes('gt-')) {
        androidBrand = 'samsung';
      } else if (
        ua.includes('xiaomi') ||
        ua.includes('redmi') ||
        ua.includes('poco') ||
        ua.includes('mi ') ||
        ua.includes('miui')
      ) {
        androidBrand = 'xiaomi';
      } else if (
        ua.includes('oppo') ||
        ua.includes('cph') ||
        ua.includes('rmx') ||
        ua.includes('realme') ||
        ua.includes('oneplus')
      ) {
        androidBrand = 'oppo_realme';
      } else if (ua.includes('vivo') || ua.includes('v2')) {
        androidBrand = 'vivo';
      } else if (ua.includes('pixel')) {
        androidBrand = 'pixel';
      } else if (ua.includes('huawei') || ua.includes('honor')) {
        androidBrand = 'huawei_honor';
      } else {
        androidBrand = 'generic_android';
      }
    }

    const isSamsungInternet = ua.includes('samsungbrowser');
    const isInAppWebView =
      ua.includes('wv') ||
      ua.includes('fban') ||
      ua.includes('fbav') ||
      ua.includes('zalo') ||
      ua.includes('tiktok') ||
      ua.includes('instagram');

    const w = Math.min(window.innerWidth || 390, window.innerHeight || 844);
    const h = Math.max(window.innerWidth || 390, window.innerHeight || 844);
    const ratio = w > 0 ? h / w : 2.0;

    let aspectProfile: ScreenAspectProfile = 'standard';
    if (ratio < 1.82) {
      aspectProfile = 'compact';
    } else if (ratio >= 2.15) {
      aspectProfile = 'ultra_tall';
    } else if (ratio >= 1.98) {
      aspectProfile = 'tall_20_9';
    }

    const ramGb: number = typeof navAny.deviceMemory === 'number' ? navAny.deviceMemory : 4;
    const cpuCores: number =
      typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 4;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    // Nhận diện đặc biệt cho dòng máy Samsung Galaxy J-series (J710, J5, J7 Prime, J2, J3...) hoặc Android < 9
    const isLegacySamsungJSeries =
      ua.includes('sm-j') ||
      ua.includes('sm-g5') ||
      ua.includes('sm-g6') ||
      ua.includes('gt-');

    let performanceTier: PerformanceTier = 'high';
    if (
      ramGb <= 3 ||
      cpuCores <= 4 ||
      isLegacySamsungJSeries ||
      (isAndroid && androidVersion !== null && androidVersion < 10)
    ) {
      performanceTier = 'low';
    } else if (ramGb <= 4 || cpuCores <= 6) {
      performanceTier = 'mid';
    }

    return {
      os,
      androidBrand,
      androidVersion,
      isSamsungInternet,
      isInAppWebView,
      aspectProfile,
      performanceTier,
      devicePixelRatio: dpr,
      ramGb,
      cpuCores,
    };
  }

  /**
   * Kiểm tra thiết bị hiện tại có phải điện thoại / máy tính bảng Android hay không
   */
  public isAndroid(): boolean {
    return this.profile.os === 'android';
  }

  /**
   * Kích hoạt tải file APK kết hợp cài đặt nhanh WebAPK trên Android
   */
  public async downloadAndInstallAndroidApk(): Promise<'installed' | 'downloaded'> {
    // 1. Thử gọi WebAPK prompt nếu có sẵn trên trình duyệt Android
    if (this.deferredInstallPrompt) {
      try {
        await this.deferredInstallPrompt.prompt();
        const choice = await this.deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          this.deferredInstallPrompt = null;
          return 'installed';
        }
      } catch {
        // Bỏ qua nếu người dùng hủy
      }
    }

    // 2. Kích hoạt tải trực tiếp file Loan_12_Su_Quan.apk chuẩn Android
    if (typeof document !== 'undefined') {
      try {
        const res = await fetch('/Loan_12_Su_Quan.apk');
        if (res.ok) {
          const blob = await res.blob();
          const apkBlob = new Blob([blob], { type: 'application/vnd.android.package-archive' });
          const blobUrl = URL.createObjectURL(apkBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', 'Loan_12_Su_Quan.apk');
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            try {
              document.body.removeChild(link);
              URL.revokeObjectURL(blobUrl);
            } catch {}
          }, 3000);
          return 'downloaded';
        }
      } catch {
        // Fallback tải trực tiếp qua liên kết tĩnh
        const link = document.createElement('a');
        link.href = '/Loan_12_Su_Quan.apk';
        link.setAttribute('download', 'Loan_12_Su_Quan.apk');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try {
            document.body.removeChild(link);
          } catch {}
        }, 800);
      }
    }

    return 'downloaded';
  }

  /**
   * Khởi chạy đồng bộ khung nhìn thực tế (visualViewport) và thuộc tính phần cứng ngầm
   */
  public initSilentOptimization() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    const root = document.documentElement;
    root.dataset.deviceOs = this.profile.os;
    root.dataset.androidBrand = this.profile.androidBrand;
    root.dataset.aspectProfile = this.profile.aspectProfile;
    root.dataset.perfTier = this.profile.performanceTier;

    const ua = navigator.userAgent.toLowerCase();
    if (
      this.profile.performanceTier === 'low' ||
      ua.includes('sm-j') ||
      (this.profile.androidVersion !== null && this.profile.androidVersion <= 9)
    ) {
      root.dataset.legacyGpu = 'true';
    }

    // Lắng nghe sự kiện cài đặt ứng dụng chuẩn Android (beforeinstallprompt)
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredInstallPrompt = e as BeforeInstallPromptEvent;
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
    });

    const applyDimensionsNow = () => {
      const vv = window.visualViewport;
      const width = Math.round(
        (vv && vv.width) || window.innerWidth || document.documentElement.clientWidth || 360
      );
      const height = Math.round(
        (vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 640
      );

      if (width > 0 && height > 0) {
        root.style.setProperty('--app-width', `${width}px`);
        root.style.setProperty('--app-height', `${height}px`);
      }

      const minDim = Math.min(width, height);
      const maxDim = Math.max(width, height);
      const ratio = minDim > 0 ? maxDim / minDim : 2.0;
      if (ratio < 1.82) {
        root.dataset.aspectProfile = 'compact';
      } else if (ratio >= 2.15) {
        root.dataset.aspectProfile = 'ultra_tall';
      } else if (ratio >= 1.98) {
        root.dataset.aspectProfile = 'tall_20_9';
      } else {
        root.dataset.aspectProfile = 'standard';
      }
    };

    const updateViewportMetrics = () => {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = requestAnimationFrame(applyDimensionsNow);
    };

    // Thực thi ngay lập tức không chờ frame để tránh khung trắng 0px trên trình duyệt đời cũ
    applyDimensionsNow();

    try {
      window.addEventListener('resize', updateViewportMetrics, { passive: true });
    } catch {
      window.addEventListener('resize', updateViewportMetrics);
    }

    window.addEventListener('orientationchange', () => {
      setTimeout(updateViewportMetrics, 120);
      setTimeout(updateViewportMetrics, 350);
    });

    if (window.visualViewport) {
      try {
        window.visualViewport.addEventListener('resize', updateViewportMetrics, { passive: true });
        window.visualViewport.addEventListener('scroll', updateViewportMetrics, { passive: true });
      } catch {
        window.visualViewport.addEventListener('resize', updateViewportMetrics);
      }
    }

    // Chặn menu ngữ cảnh khi chạm giữ trên màn hình cảm ứng Android
    try {
      window.addEventListener(
        'contextmenu',
        (e) => {
          const target = e.target as HTMLElement | null;
          if (target && target.tagName !== 'INPUT' && target.tagName !== 'SELECT') {
            e.preventDefault();
          }
        },
        { passive: false }
      );
    } catch {}
  }

  public getOptimalParticleCount(baseCount: number): number {
    if (this.profile.performanceTier === 'low') {
      return Math.max(20, Math.round(baseCount * 0.35));
    }
    if (this.profile.performanceTier === 'mid') {
      return Math.max(35, Math.round(baseCount * 0.65));
    }
    return baseCount;
  }
}

export const deviceOptimizer = new DeviceOptimizerService();
