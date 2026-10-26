/**
 * Loạn 12 Sứ Quân — Biểu Tượng Logo Ứng Dụng 3D ("12 SỨ QUÂN")
 * Sử dụng hình ảnh nguyên bản Trống Đồng Đông Sơn 3D, Rồng Vàng Đại Việt uốn lượn,
 * Song Cổ Kiếm và dải băng đồng khắc chữ nổi 3D "12 SỨ QUÂN".
 */

import React from 'react';

interface AppLogo3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AppLogo3D: React.FC<AppLogo3DProps> = ({
  size = 'lg',
  className = '',
}) => {
  const dimensions = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32 sm:w-36 sm:h-36',
    xl: 'w-44 h-44 sm:w-48 sm:h-48',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${dimensions} ${className}`}
      style={{ perspective: '800px' }}
    >
      {/* Hào quang lửa chiến trường & ánh kim hoàng tộc phía sau icon */}
      <div className="absolute -inset-2.5 rounded-[28%] bg-gradient-to-tr from-amber-600/40 via-red-600/30 to-yellow-400/45 blur-lg pointer-events-none animate-pulse" />

      {/* Khung viền kim loại đồng cổ nổi khối 3D */}
      <div className="relative w-full h-full rounded-[24%] p-[3px] bg-gradient-to-br from-amber-300 via-yellow-600 to-amber-950 shadow-[0_12px_28px_rgba(0,0,0,0.85)] border border-yellow-200/50 overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <img
          src="/assets/aistudio/image_53c4514a.png"
          alt="Loạn 12 Sứ Quân Logo 3D"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-[22%] filter contrast-105 saturate-110"
        />
        {/* Lớp phản chiếu ánh sáng vát chéo nhẹ */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

