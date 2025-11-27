import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-[#181818] p-4 rounded-lg animate-pulse border border-white/5">
      {/* Kotak Gambar */}
      <div className="w-full aspect-square bg-gray-700/50 rounded-md mb-4"></div>
      
      {/* Baris Judul */}
      <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
      
      {/* Baris Artis */}
      <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
    </div>
  );
}