/**
 * Loạn 12 Sứ Quân — Universal Mobile Clipboard & Sharing Utility
 * Thiết kế đặc biệt cho iOS Safari, iPhone PWA (Home Screen standalone),
 * iPad, Android WebAPK, và WebKit Iframe.
 * 
 * Khắc phục triệt để các hạn chế:
 * 1. navigator.clipboard.writeText bị từ chối quyền (NotAllowedError) trong iframe hoặc PWA độc lập.
 * 2. document.execCommand('copy') bị vô hiệu hóa trên WebKit nếu phần tử ở ngoài màn hình (-9999px).
 * 3. Hỗ trợ song song API Native Share (Trình đơn chia sẻ gốc của iPhone/Android) khi clipboard bị chặn.
 */

export const CURRENT_CANONICAL_APP_URL =
  'https://ais-pre-s44nqpuehsdi6vvl5dctbh-830645281651.asia-east1.run.app/';

/**
 * Lấy URL hoạt động chính xác của ứng dụng tại thời điểm thực tế
 * Luôn đảm bảo liên kết chia sẻ là link chính thức đang hoạt động, không bao giờ dùng domain tạm thời gây lỗi.
 */
export function getActiveGameUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin || '';
    const pathname = window.location.pathname || '/';

    // Nếu người dùng đang duyệt trực tiếp trên domain công khai đã được xác minh:
    if (origin.includes('s44nqpuehsdi6vvl5dctbh')) {
      const cleanPath = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
      return `${origin}${cleanPath}/`;
    }

    // Nếu chạy trên tên miền web thật khác (không phải localhost hay preview dev container)
    if (
      origin.startsWith('http') &&
      !origin.includes('localhost') &&
      !origin.includes('127.0.0.1') &&
      !origin.includes('0.0.0.0') &&
      !origin.includes('ais-dev-') &&
      !origin.includes('autizinxglookdgamc63or')
    ) {
      const cleanPath = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
      return `${origin}${cleanPath}/`;
    }
  }

  // Mặc định luôn trả về liên kết công khai chính thức chuẩn xác của ứng dụng:
  return CURRENT_CANONICAL_APP_URL;
}

/**
 * Sao chép văn bản vào bộ nhớ tạm với đa cơ chế dự phòng tối ưu cho iPhone/Safari/Android
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Chiến lược 1: Thử nghiệm Clipboard API hiện đại
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Tiếp tục xuống cơ chế WebKit fallback bên dưới
    }
  }

  // Chiến lược 2: WebKit DOM Selection Fallback (chuyên biệt cho Safari iOS & Mobile WebKit)
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // WebKit trên iPhone bắt buộc phần tử phải nằm trong viewport hiển thị và có thể focus được
      // Không được để left: -9999px hoặc display: none vì Safari sẽ bỏ qua việc chọn chữ
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.top = '50%';
      textArea.style.left = '50%';
      textArea.style.width = '200px';
      textArea.style.height = '40px';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.color = 'transparent';
      textArea.style.fontSize = '16px'; // Tránh Safari tự động phóng to màn hình
      textArea.style.opacity = '0.01'; // Phải có độ mờ nhẹ thay vì display:none
      textArea.style.pointerEvents = 'none';
      textArea.style.zIndex = '999999';

      document.body.appendChild(textArea);

      // Thao tác chọn toàn bộ văn bản tối ưu cho iOS
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        return true;
      }
    } catch {
      // Tiếp tục cơ chế tiếp theo
    }
  }

  return false;
}

/**
 * Kích hoạt bảng chia sẻ gốc của iPhone / Android (Safari Share Sheet)
 * Cho phép người dùng trực tiếp chọn "Sao chép", "AirDrop", "Zalo", "Tin nhắn", hoặc "Thêm vào MH chính"
 */
export async function shareLinkViaNativeSheet(data: {
  title?: string;
  text?: string;
  url: string;
}): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  ) {
    try {
      if (navigator.canShare && !navigator.canShare(data)) {
        return false;
      }
      await navigator.share(data);
      return true;
    } catch (err: any) {
      // Người dùng bấm Hủy (AbortError) không tính là lỗi hỏng
      if (err?.name === 'AbortError') {
        return true;
      }
      return false;
    }
  }
  return false;
}
