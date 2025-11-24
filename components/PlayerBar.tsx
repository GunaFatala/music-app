"use client";

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, ChevronDown, Shuffle, Repeat, Clock } from 'lucide-react';

interface PlayerBarProps {
  currentSong: any; isPlaying: boolean; togglePlay: () => void; playNext: () => void; playPrev: () => void; currentTime: number; duration: number; handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void; volume: number; handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void; isMuted: boolean; toggleMute: () => void; toggleLike: (song: any) => void; isCurrentLiked: boolean; onExpand: () => void;
  isShuffle: boolean; toggleShuffle: () => void; repeatMode: 0 | 1 | 2; toggleRepeat: () => void;
  // PROPS BARU
  sleepTimer: number | null;
  toggleSleepTimer: () => void;
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
    <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 h-20 md:h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-40 transition-all shadow-2xl">
      
      <div onClick={onExpand} className="flex items-center gap-3 w-2/3 md:w-1/3 min-w-[150px] cursor-pointer group">
         <div className="relative">
            <img src={currentSong.cover} className={`w-12 h-12 md:w-14 md:h-14 rounded object-cover ${isPlaying ? 'animate-pulse' : ''}`} alt="cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded transition hidden md:flex"><ChevronDown size={20} className="rotate-180 text-white" /></div>
         </div>
         <div className="overflow-hidden flex-1">
           <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
           <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
         </div>
         <button onClick={(e) => {e.stopPropagation(); toggleLike(currentSong);}} className="hover:scale-110 transition ml-2 hidden md:block">
            <Heart size={18} className={isCurrentLiked ? "fill-green-500 text-green-500" : "text-gray-400 hover:text-white"} />
         </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 w-auto md:w-1/3 max-w-2xl">
         <div className="flex items-center gap-4 md:gap-6">
            <button onClick={toggleShuffle} className={`hidden md:block hover:text-white ${isShuffle ? 'text-green-500' : 'text-gray-400'}`}><Shuffle size={18} /></button>
            <button onClick={playPrev} className="text-gray-400 hover:text-white hidden md:block"><SkipBack size={20} fill="currentColor" /></button>
            <button onClick={() => togglePlay()} className="bg-white text-black rounded-full p-2 hover:scale-105 transition active:scale-95">
              {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
            </button>
            <button onClick={playNext} className="text-gray-400 hover:text-white hidden md:block"><SkipForward size={20} fill="currentColor" /></button>
            <button onClick={toggleRepeat} className={`hidden md:block hover:text-white ${repeatMode > 0 ? 'text-green-500' : 'text-gray-400'} relative`}>
               <Repeat size={18} />
               {repeatMode === 2 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-green-500 text-black rounded-full w-3 h-3 flex items-center justify-center">1</span>}
            </button>
         </div>
         <div className="w-full hidden md:flex items-center gap-2 text-xs font-mono text-gray-400 mt-1">
           <span className="w-10 text-right">{formatTime(currentTime)}</span>
           <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400" />
           <span className="w-10">{formatTime(duration)}</span>
         </div>
      </div>

      <div className="flex items-center justify-end gap-2 w-1/3 pr-4 hidden md:flex">
         {/* TOMBOL SLEEP TIMER */}
         <button 
            onClick={toggleSleepTimer} 
            className={`flex items-center gap-1 text-xs font-bold border border-gray-600 rounded-full px-2 py-1 mr-2 hover:border-white transition ${sleepTimer ? 'text-green-500 border-green-500' : 'text-gray-400'}`}
            title="Sleep Timer"
         >
            <Clock size={14} /> {sleepTimer ? `${sleepTimer}m` : ''}
         </button>

         <button onClick={toggleMute} className="text-gray-400 hover:text-white">{isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
         <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-green-500" />
      </div>
    </div>
  );
}