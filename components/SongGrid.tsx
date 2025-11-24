"use client";

import React from 'react';
import { Play, Pause, Heart, Music } from 'lucide-react';

interface SongGridProps {
  songs: any[];
  isLoading: boolean;
  currentSong: any;
  isPlaying: boolean;
  onPlay: (song: any) => void;
  toggleLike: (song: any) => void;
  likedSongs: any[];
}

export default function SongGrid({
  songs,
  isLoading,
  currentSong,
  isPlaying,
  onPlay,
  toggleLike,
  likedSongs
}: SongGridProps) {

  // 1. TAMPILAN JIKA KOSONG (Belum cari / Tidak ketemu)
  if (songs.length === 0 && !isLoading) {
    return (
      <div className="text-center text-gray-500 mt-20">
        <Music size={64} className="mx-auto mb-4 opacity-50"/>
        <p>Mulai cari lagu favoritmu di kolom pencarian atas.</p>
      </div>
    );
  }

  // 2. TAMPILAN GRID LAGU
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {songs.map((song) => {
        const isLiked = likedSongs.some(s => s.id === song.id);
        // Cek apakah ini lagu yang sedang aktif
        const isActive = currentSong && currentSong.id === song.id;

        return (
          <div key={song.id} className="group relative bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition duration-300">
            
            {/* Cover Image & Play Button */}
            <div onClick={() => onPlay(song)} className="cursor-pointer relative mb-4 shadow-lg group-hover:scale-105 transition duration-300">
              <img src={song.cover} alt={song.title} className="w-full aspect-square object-cover rounded-md shadow-lg" />
              
              {/* Tombol Play Hijau (Muncul saat Hover atau saat Lagu Aktif) */}
              <button className={`absolute bottom-2 right-2 bg-green-500 rounded-full p-3 text-black shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 ${(isActive && isPlaying) ? 'opacity-100 translate-y-0' : ''}`}>
                {(isActive && isPlaying) ? <Pause fill="black" size={20}/> : <Play fill="black" size={20}/>}
              </button>
            </div>
            
            {/* Tombol Like (Pojok Kanan Atas) */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLike(song); }} 
              className="absolute top-6 right-6 p-2 rounded-full bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition"
            >
              <Heart size={18} className={isLiked ? "fill-green-500 text-green-500" : "text-white"} />
            </button>

            {/* Judul & Artis */}
            <h3 className={`font-bold truncate text-base mb-1 ${isActive ? 'text-green-500' : 'text-white'}`}>
              {song.title.replace(/&quot;/g, '"')}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-1">{song.artist}</p>
          </div>
        );
      })}
    </div>
  );
}