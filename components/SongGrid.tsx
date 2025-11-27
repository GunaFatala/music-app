"use client";

import React from 'react';
import { Play, Pause, Heart, Music, ListPlus, Trash2 } from 'lucide-react';
import SkeletonCard from './SkeletonCard'; // Import komponen baru

interface SongGridProps {
  songs: any[];
  isLoading: boolean;
  currentSong: any;
  isPlaying: boolean;
  onPlay: (song: any) => void;
  toggleLike: (song: any) => void;
  likedSongs: any[];
  onAddToPlaylistClick?: (song: any) => void;
  onRemoveFromPlaylist?: (song: any) => void;
}

export default function SongGrid({
  songs, isLoading, currentSong, isPlaying, onPlay, toggleLike, likedSongs, 
  onAddToPlaylistClick, onRemoveFromPlaylist
}: SongGridProps) {

  // 1. TAMPILKAN SKELETON SAAT LOADING
  // Kita tampilkan 10 kotak dummy biar layar terlihat penuh
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // 2. KONDISI KOSONG (Setelah loading selesai tapi gak ada data)
  if (songs.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
        <Music size={64} className="mx-auto mb-4 opacity-50"/>
        <p>Tidak ada lagu untuk ditampilkan.</p>
      </div>
    );
  }

  // 3. TAMPILAN DATA ASLI
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {songs.map((song, index) => {
        const isLiked = likedSongs.some(s => s.id === song.id);
        const isActive = currentSong && currentSong.id === song.id;

        return (
          <div key={`${song.id}-${index}`} className="group relative bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition duration-300 border border-transparent hover:border-white/10">
            
            <div onClick={() => onPlay(song)} className="cursor-pointer relative mb-4 shadow-lg group-hover:scale-105 transition duration-300">
              <img 
                src={song.cover || "https://via.placeholder.com/300?text=No+Image"} 
                alt={song.title} 
                className="w-full aspect-square object-cover rounded-md shadow-lg" 
              />
              <button className={`absolute bottom-2 right-2 bg-green-500 rounded-full p-3 text-black shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 ${(isActive && isPlaying) ? 'opacity-100 translate-y-0' : ''}`}>
                {(isActive && isPlaying) ? <Pause fill="black" size={20}/> : <Play fill="black" size={20}/>}
              </button>
            </div>
            
            <button onClick={(e) => { e.stopPropagation(); toggleLike(song); }} className="absolute top-6 right-6 p-2 rounded-full bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition z-10">
              <Heart size={18} className={isLiked ? "fill-green-500 text-green-500" : "text-white"} />
            </button>

            {onRemoveFromPlaylist ? (
              <button onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist(song); }} className="absolute top-6 left-6 p-2 rounded-full bg-black/50 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition z-10 text-white" title="Hapus">
                <Trash2 size={18} />
              </button>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); if(onAddToPlaylistClick) onAddToPlaylistClick(song); }} className="absolute top-6 left-6 p-2 rounded-full bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition z-10" title="Tambahkan">
                <ListPlus size={18} className="text-white" />
              </button>
            )}

            <h3 className={`font-bold truncate text-base mb-1 ${isActive ? 'text-green-500' : 'text-white'}`}>
              {song.title ? song.title.replace(/&quot;/g, '"') : "Judul Tidak Diketahui"}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-1">{song.artist || "Artis Tidak Diketahui"}</p>
          </div>
        );
      })}
    </div>
  );
}