"use client";

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, ChevronDown } from 'lucide-react';

interface PlayerBarProps {
  currentSong: any;
  isPlaying: boolean;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  currentTime: number;
  duration: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  volume: number;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMuted: boolean;
  toggleMute: () => void;
  toggleLike: (song: any) => void;
  isCurrentLiked: boolean;
  onExpand: () => void; // Fungsi buat membesarkan player
}

export default function PlayerBar({
  currentSong,
  isPlaying,
  togglePlay,
  playNext,
  playPrev,
  currentTime,
  duration,
  handleSeek,
  volume,
  handleVolumeChange,
  isMuted,
  toggleMute,
  toggleLike,
  isCurrentLiked,
  onExpand
}: PlayerBarProps) {
  
  // Format Waktu Helper
  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-40 transition-all">
      
      {/* 1. INFO LAGU (Bisa diklik untuk Expand) */}
      <div 
         onClick={onExpand} 
         className="flex items-center gap-4 w-1/3 min-w-[150px] cursor-pointer group"
      >
         <div className="relative">
            <img src={currentSong.cover} className={`w-14 h-14 rounded object-cover ${isPlaying ? 'animate-pulse' : ''}`} alt="cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded transition">
               <ChevronDown size={20} className="rotate-180 text-white" /> 
            </div>
         </div>
         <div className="overflow-hidden">
           <h4 className="text-sm font-bold text-white truncate group-hover:text-green-500 transition">{currentSong.title}</h4>
           <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
         </div>
         <button onClick={(e) => {e.stopPropagation(); toggleLike(currentSong);}} className="hover:scale-110 transition ml-2">
            <Heart size={18} className={isCurrentLiked ? "fill-green-500 text-green-500" : "text-gray-400 hover:text-white"} />
         </button>
      </div>

      {/* 2. KONTROL TENGAH */}
      <div className="flex flex-col items-center justify-center gap-1 w-1/3 max-w-2xl">
         <div className="flex items-center gap-6">
            <button onClick={playPrev} className="text-gray-400 hover:text-white"><SkipBack size={20} fill="currentColor" /></button>
            <button onClick={() => togglePlay()} className="bg-white text-black rounded-full p-2 hover:scale-105 transition active:scale-95">
              {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
            </button>
            <button onClick={playNext} className="text-gray-400 hover:text-white"><SkipForward size={20} fill="currentColor" /></button>
         </div>
         <div className="w-full flex items-center gap-2 text-xs font-mono text-gray-400 mt-1">
           <span className="w-10 text-right">{formatTime(currentTime)}</span>
           <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400" />
           <span className="w-10">{formatTime(duration)}</span>
         </div>
      </div>

      {/* 3. VOLUME KANAN */}
      <div className="flex items-center justify-end gap-2 w-1/3 pr-4 hidden md:flex">
         <button onClick={toggleMute} className="text-gray-400 hover:text-white">{isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
         <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-green-500" />
      </div>
    </div>
  );
}