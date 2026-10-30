/**
 * Loạn 12 Sứ Quân — Device Detection & Identity Provider
 * Nhận diện chính xác thiết bị thực tế (iPhone XS Max, iPhone 13 Pro Max, Android, iPad, v.v.)
 * và quản lý định danh duy nhất cho từng máy khi kết nối đối kháng P2P/Bluetooth/Mạng.
 */

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  model: string;
  platform: 'ios' | 'android' | 'web';
  isIPhone: boolean;
  isAndroid: boolean;
  screenSummary: string;
}

const DEVICE_ID_KEY = 'loan12sq_device_id';
const DEVICE_NAME_KEY = 'loan12sq_device_nickname';

/**
 * Phân tích độ phân giải và User-Agent để nhận dạng model iPhone cụ thể
 */
function detectIPhoneModel(): string {
  if (typeof window === 'undefined') return 'iPhone';
  const width = Math.min(window.screen.width, window.screen.height);
  const height = Math.max(window.screen.width, window.screen.height);
  const dpr = window.devicePixelRatio || 1;

  // iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus (430 x 932 @ 3x)
  if (width === 430 && height === 932) return 'iPhone 14/15/16 Pro Max';

  // iPhone 12 Pro Max / 13 Pro Max / 14 Plus (428 x 926 @ 3x)
  if (width === 428 && height === 926) return 'iPhone 13 Pro Max';

  // iPhone 14 Pro / 15 / 15 Pro / 16 (393 x 852 @ 3x)
  if (width === 393 && height === 852) return 'iPhone 14/15 Pro';

  // iPhone 12 / 12 Pro / 13 / 13 Pro / 14 (390 x 844 @ 3x)
  if (width === 390 && height === 844) return 'iPhone 12/13';

  // iPhone XS Max / 11 Pro Max (414 x 896 @ 3x)
  if (width === 414 && height === 896 && dpr >= 3) return 'iPhone XS Max';

  // iPhone XR / 11 (414 x 896 @ 2x)
  if (width === 414 && height === 896 && dpr < 3) return 'iPhone 11/XR';

  // iPhone X / XS / 11 Pro / 12 mini / 13 mini (375 x 812 @ 3x)
  if (width === 375 && height === 812) return 'iPhone XS / 12-13 mini';

  // iPhone 6+/7+/8+ (414 x 736 @ 3x)
  if (width === 414 && height === 736) return 'iPhone 7+/8+';

  // iPhone 6/7/8/SE (375 x 667 @ 2x)
  if (width === 375 && height === 667) return 'iPhone SE / 8';

  return 'iPhone';
}

/**
 * Phân tích model Android từ User-Agent
 */
function detectAndroidModel(): string {
  if (typeof navigator === 'undefined') return 'Android Phone';
  const ua = navigator.userAgent;
  const match = ua.match(/;\s*([A-Za-z0-9\-\s_]+)\s+Build\//i);
  if (match && match[1]) {
    const rawModel = match[1].trim();
    if (rawModel.includes('SM-') || rawModel.includes('SAMSUNG')) return `Samsung ${rawModel}`;
    if (rawModel.includes('Pixel')) return rawModel;
    if (rawModel.includes('Xiaomi') || rawModel.includes('Redmi')) return rawModel;
    if (rawModel.includes('OPPO') || rawModel.includes('CPH')) return `Oppo ${rawModel}`;
    return rawModel;
  }
  return 'Điện thoại Android';
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceId: 'server_dev',
      deviceName: 'Thiết bị Máy chủ',
      model: 'Server',
      platform: 'web',
      isIPhone: false,
      isAndroid: false,
      screenSummary: '0x0',
    };
  }

  // Khởi tạo hoặc lấy lại deviceId cố định
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    const randomHex = Math.random().toString(36).substring(2, 8);
    deviceId = `dev_${Date.now().toString(36)}_${randomHex}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  const ua = navigator.userAgent || '';
  const isIPhone = /iPhone/i.test(ua);
  const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);

  let platform: 'ios' | 'android' | 'web' = 'web';
  let model = 'Thiết bị Web';

  if (isIPhone) {
    platform = 'ios';
    model = detectIPhoneModel();
  } else if (isIPad) {
    platform = 'ios';
    model = 'iPad';
  } else if (isAndroid) {
    platform = 'android';
    model = detectAndroidModel();
  }

  const savedName = localStorage.getItem(DEVICE_NAME_KEY);
  const defaultName = savedName || `${model} (${deviceId.substring(deviceId.length - 4).toUpperCase()})`;

  const screenSummary = `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}x`;

  return {
    deviceId,
    deviceName: defaultName,
    model,
    platform,
    isIPhone,
    isAndroid,
    screenSummary,
  };
}

export function setCustomDeviceNickname(newName: string): void {
  if (typeof window !== 'undefined' && newName.trim()) {
    localStorage.setItem(DEVICE_NAME_KEY, newName.trim());
  }
}
