"use client";

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown } from 'lucide-react';

interface FullScreenPlayerProps {
  isExpanded: boolean;
  onClose: () => void;
  currentSong: any;
  isPlaying: boolean;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  currentTime: number;
  duration: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleLike: (song: any) => void;
  isCurrentLiked: boolean;
}

export default function FullScreenPlayer({
  isExpanded,
  onClose,
  currentSong,
  isPlaying,
  togglePlay,
  playNext,
  playPrev,
  currentTime,
  duration,
  handleSeek,
  toggleLike,
  isCurrentLiked
}: FullScreenPlayerProps) {

  // Helper Format Waktu
  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-black to-black text-white flex flex-col transition-transform duration-500 ease-in-out ${isExpanded ? 'translate-y-0' : 'translate-y-[110%]'}`}>
       
       {/* Header: Tombol Tutup */}
       <div className="p-6 flex justify-between items-center">
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
            <ChevronDown size={32} />
          </button>
          <span className="text-xs font-bold tracking-widest text-gray-400">NOW PLAYING</span>
          <div className="w-8"></div> {/* Spacer biar teks di tengah */}
       </div>

       {/* Konten Utama */}
       <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full">
          
          {/* Cover Album Besar */}
          <div className="w-full max-w-md aspect-square bg-gray-800 rounded-xl shadow-2xl mb-10 overflow-hidden relative">
             {currentSong && <img src={currentSong.cover} className="w-full h-full object-cover" alt={currentSong.title} />}
          </div>

          {/* Judul & Artis & Like */}
          <div className="w-full flex justify-between items-end mb-6">
             <div className="overflow-hidden pr-4">
                <h1 className="text-3xl font-bold mb-2 line-clamp-1">{currentSong?.title}</h1>
                <p className="text-xl text-gray-400 truncate">{currentSong?.artist}</p>
             </div>
             <button onClick={() => currentSong && toggleLike(currentSong)}>
                <Heart size={32} className={isCurrentLiked ? "fill-green-500 text-green-500" : "text-gray-400"} />
             </button>
          </div>

          {/* Slider Progress Besar */}
          <div className="w-full mb-8">
             <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek} 
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400" 
             />
             <div className="flex justify-between text-xs font-mono text-gray-400 mt-2">
               <span>{formatTime(currentTime)}</span>
               <span>{formatTime(duration)}</span>
             </div>
          </div>

          {/* Kontrol Utama Besar */}
          <div className="flex items-center justify-center gap-10">
             <button onClick={playPrev} className="text-gray-400 hover:text-white transition transform active:scale-90">
                <SkipBack size={40} />
             </button>
             
             <button onClick={() => togglePlay()} className="bg-green-500 text-black rounded-full p-6 hover:scale-110 transition shadow-xl active:scale-95">
                {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" />}
             </button>
             
             <button onClick={playNext} className="text-gray-400 hover:text-white transition transform active:scale-90">
                <SkipForward size={40} />
             </button>
          </div>
       </div>
    </div>
  );
}