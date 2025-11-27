"use client";

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, ChevronDown, Shuffle, Repeat, Clock } from 'lucide-react';

interface PlayerBarProps {
  currentSong: any; isPlaying: boolean; togglePlay: () => void; playNext: () => void; playPrev: () => void; currentTime: number; duration: number; handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void; volume: number; handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void; isMuted: boolean; toggleMute: () => void; toggleLike: (song: any) => void; isCurrentLiked: boolean; onExpand: () => void;
  isShuffle: boolean; toggleShuffle: () => void; repeatMode: 0 | 1 | 2; toggleRepeat: () => void;
  sleepTimer: number | null; toggleSleepTimer: () => void;
}

export default function PlayerBar({
  currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, handleSeek,
  volume, handleVolumeChange, isMuted, toggleMute, toggleLike, isCurrentLiked, onExpand,
  isShuffle, toggleShuffle, repeatMode, toggleRepeat,
  sleepTimer, toggleSleepTimer
}: PlayerBarProps) {
  
  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="fixed bottom-[64px] md:bottom-4 left-0 md:left-4 right-0 md:right-4 h-20 md:h-24 bg-black/80 backdrop-blur-xl border border-white/10 md:rounded-2xl px-4 flex items-center justify-between z-40 transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      
      {/* 1. INFO LAGU */}
      <div onClick={onExpand} className="flex items-center gap-3 w-2/3 md:w-1/3 min-w-[150px] cursor-pointer group z-20">
         <div className="relative">
            <img src={currentSong.cover} className={`w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover shadow-lg ${isPlaying ? 'animate-pulse' : ''}`} alt="cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition hidden md:flex"><ChevronDown size={20} className="rotate-180 text-white" /></div>
         </div>
         <div className="overflow-hidden flex-1">
           <h4 className="text-sm font-bold text-white truncate group-hover:text-green-400 transition">{currentSong.title}</h4>
           <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
         </div>
         <button onClick={(e) => {e.stopPropagation(); toggleLike(currentSong);}} className="hover:scale-110 transition ml-2 hidden md:block relative z-30">
            <Heart size={18} className={isCurrentLiked ? "fill-green-500 text-green-500" : "text-gray-400 hover:text-white"} />
         </button>
      </div>

      {/* 2. KONTROL TENGAH */}
      <div className="flex flex-col items-center justify-center gap-1 w-auto md:w-1/3 max-w-2xl z-20">
         <div className="flex items-center gap-4 md:gap-6">
            <button onClick={toggleShuffle} className={`hidden md:block hover:text-white transition ${isShuffle ? 'text-green-500' : 'text-gray-400'}`}><Shuffle size={18} /></button>
            <button onClick={playPrev} className="text-gray-400 hover:text-white hidden md:block hover:scale-110 transition"><SkipBack size={20} fill="currentColor" /></button>
            
            {/* Tombol Play Utama */}
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
              className="bg-white text-black rounded-full p-2 hover:scale-110 transition shadow-lg hover:shadow-green-500/50 active:scale-95 z-30"
            >
              {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
            </button>
            
            <button onClick={playNext} className="text-gray-400 hover:text-white hidden md:block hover:scale-110 transition"><SkipForward size={20} fill="currentColor" /></button>
            <button onClick={toggleRepeat} className={`hidden md:block hover:text-white transition ${repeatMode > 0 ? 'text-green-500' : 'text-gray-400'} relative`}>
               <Repeat size={18} />
               {repeatMode === 2 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-green-500 text-black rounded-full w-3 h-3 flex items-center justify-center">1</span>}
            </button>
         </div>
         
         {/* Progress Bar Wrapper - KUNCI PERBAIKAN ADA DI 'relative' */}
         <div className="w-full hidden md:flex items-center gap-2 text-xs font-mono text-gray-400 mt-1">
           <span className="w-10 text-right">{formatTime(currentTime)}</span>
           
           {/* Slider Container */}
           <div className="relative w-full h-1 bg-white/10 rounded-lg cursor-pointer group flex items-center">
              {/* Visual Colored Bar */}
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-green-400 rounded-lg" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
              {/* Input Range (Invisible but clickable) */}
              <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" 
              />
           </div>
           
           <span className="w-10">{formatTime(duration)}</span>
         </div>
      </div>

      {/* 3. VOLUME - KUNCI PERBAIKAN DI 'relative' */}
      <div className="flex items-center justify-end gap-2 w-1/3 pr-4 hidden md:flex z-20">
         <button onClick={toggleSleepTimer} className={`flex items-center gap-1 text-xs font-bold border border-white/20 rounded-full px-2 py-1 mr-2 hover:border-white transition ${sleepTimer ? 'text-green-500 border-green-500' : 'text-gray-400'}`}>
            <Clock size={14} /> {sleepTimer ? `${sleepTimer}m` : ''}
         </button>

         <button onClick={toggleMute} className="text-gray-400 hover:text-white">{isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
         
         {/* Volume Slider Container */}
         <div className="relative w-24 h-1 bg-white/10 rounded-lg cursor-pointer group flex items-center">
            <div className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 transition rounded-lg" style={{ width: `${isMuted ? 0 : volume}%` }}></div>
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={isMuted ? 0 : volume} 
              onChange={handleVolumeChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" 
            />
         </div>
      </div>
    </div>
  );
}