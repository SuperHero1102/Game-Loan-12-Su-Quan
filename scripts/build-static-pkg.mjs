/**
 * Script đóng gói xuất bản bản Tĩnh (Static Hosting & Capacitor APK)
 * Hoàn toàn độc lập với Google Cloud, AI Studio, Firebase hay bất kỳ server ngoài nào.
 */

import fs from 'fs';
import path from 'path';

function verifyStaticBuild() {
  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    console.log('[build-static] Chưa tìm thấy thư mục dist. Vui lòng chạy `npm run build` trước.');
    return;
  }

  // 1. Kiểm tra index.html trong dist
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    console.log('[build-static] Đã xác nhận dist/index.html đã sẵn sàng cho mọi Static Hosting (Cloudflare, Netlify, Vercel, GitHub Pages).');
  }

  // 2. Tạo file _headers cho Cloudflare Pages để cache tối ưu offline
  const headersPath = path.join(distDir, '_headers');
  const headersContent = `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

/version.json
  Cache-Control: no-cache, no-store, must-revalidate
`;
  fs.writeFileSync(headersPath, headersContent, 'utf8');

  // 3. Tạo file _redirects cho Netlify/Cloudflare Pages SPA routing
  const redirectsPath = path.join(distDir, '_redirects');
  fs.writeFileSync(redirectsPath, '/* /index.html 200\n', 'utf8');

  console.log('[build-static] Đã tạo thành công cấu hình _headers và _redirects cho Cloudflare / Netlify / Vercel.');
}

verifyStaticBuild();
