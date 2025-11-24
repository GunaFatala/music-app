"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown, Shuffle, Repeat, Clock, Mic2, Loader2 } from 'lucide-react';

interface FullScreenPlayerProps {
  isExpanded: boolean; onClose: () => void; currentSong: any; isPlaying: boolean; togglePlay: () => void; playNext: () => void; playPrev: () => void; currentTime: number; duration: number; handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void; toggleLike: (song: any) => void; isCurrentLiked: boolean;
  isShuffle: boolean; toggleShuffle: () => void; repeatMode: 0 | 1 | 2; toggleRepeat: () => void;
  sleepTimer: number | null; toggleSleepTimer: () => void;
}

export default function FullScreenPlayer({
  isExpanded, onClose, currentSong, isPlaying, togglePlay, playNext, playPrev,
  currentTime, duration, handleSeek, toggleLike, isCurrentLiked,
  isShuffle, toggleShuffle, repeatMode, toggleRepeat,
  sleepTimer, toggleSleepTimer
}: FullScreenPlayerProps) {

  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string>("");
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

  // --- LOGIC AMBIL LIRIK ---
  useEffect(() => {
    if (isExpanded && currentSong && showLyrics) {
      fetchLyrics();
    }
  }, [currentSong, showLyrics, isExpanded]);

  const fetchLyrics = async () => {
    setIsLoadingLyrics(true);
    setLyrics("");

    try {
      // 1. Bersihkan Judul (Hapus: Official Video, ft., Lyrics, kurung-kurung)
      const cleanTitle = currentSong.title
        .replace(/(\(.*\)|\[.*\])/g, "") // Hapus teks dalam kurung () atau []
        .replace(/official\s*video|audio|lyrics|lyric|hd|hq|4k|mv/gi, "") // Hapus kata-kata sampah
        .replace(/ft\.|feat\./gi, "") // Hapus feat
        .trim();
      
      // 2. Cari Lirik ke LrcLib (Gratis)
      const res = await fetch(`https://lrclib.net/api/search?q=${cleanTitle} ${currentSong.artist}`);
      const data = await res.json();

      if (data && data.length > 0) {
        // Ambil hasil pertama yg plain lyrics-nya ada
        const found = data[0]; 
        setLyrics(found.plainLyrics || found.syncedLyrics || "Lirik tidak tersedia dalam format teks.");
      } else {
        setLyrics("Maaf, lirik tidak ditemukan untuk lagu ini.");
      }
    } catch (error) {
      console.error("Gagal ambil lirik", error);
      setLyrics("Gagal memuat lirik. Cek koneksi internet.");
    } finally {
      setIsLoadingLyrics(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 via-black to-black text-white flex flex-col transition-transform duration-500 ease-in-out ${isExpanded ? 'translate-y-0' : 'translate-y-[110%]'}`}>
       
       {/* Header */}
       <div className="p-6 flex justify-between items-center mt-4 md:mt-0">
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><ChevronDown size={32} /></button>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold tracking-widest text-gray-400">NOW PLAYING</span>
            {sleepTimer && <span className="text-[10px] text-green-500 flex items-center gap-1"><Clock size={10}/> {sleepTimer}m</span>}
          </div>

          <button onClick={toggleSleepTimer} className={`p-2 rounded-full transition ${sleepTimer ? 'text-green-500 bg-white/10' : 'text-gray-400 hover:text-white'}`}>
            <Clock size={24} />
          </button>
       </div>

       {/* Konten Utama */}
       <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full pb-20">
          
          {/* AREA TENGAH: BISA GAMBAR ATAU LIRIK */}
          <div className="w-full max-w-md aspect-square bg-gray-800 rounded-xl shadow-2xl mb-10 overflow-hidden relative group">
             
             {showLyrics ? (
               // TAMPILAN LIRIK
               <div className="w-full h-full bg-black/50 backdrop-blur-md p-6 overflow-y-auto scrollbar-hide text-center">
                  {isLoadingLyrics ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-green-500" size={40} />
                      <p className="text-sm text-gray-400">Mencari lirik...</p>
                    </div>
                  ) : (
                    <p className="text-lg leading-loose text-gray-200 whitespace-pre-line font-medium">
                      {lyrics}
                    </p>
                  )}
               </div>
             ) : (
               // TAMPILAN GAMBAR
               currentSong && <img src={currentSong.cover} className="w-full h-full object-cover" alt={currentSong.title} />
             )}

             {/* TOMBOL TOGGLE LIRIK (Melayang di pojok kanan bawah gambar) */}
             <button 
                onClick={() => setShowLyrics(!showLyrics)}
                className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${showLyrics ? 'bg-green-500 text-black' : 'bg-black/60 text-white backdrop-blur-sm'}`}
                title="Tampilkan Lirik"
             >
               <Mic2 size={24} />
             </button>
          </div>

          {/* Judul & Artis */}
          <div className="w-full flex justify-between items-end mb-6">
             <div className="overflow-hidden pr-4">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-1">{currentSong?.title}</h1>
                <p className="text-lg md:text-xl text-gray-400 truncate">{currentSong?.artist}</p>
             </div>
             <button onClick={() => currentSong && toggleLike(currentSong)}>
                <Heart size={32} className={isCurrentLiked ? "fill-green-500 text-green-500" : "text-gray-400"} />
             </button>
          </div>

          {/* Slider Progress */}
          <div className="w-full mb-8">
             <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400" />
             <div className="flex justify-between text-xs font-mono text-gray-400 mt-2"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
          </div>

          {/* Kontrol Tombol */}
          <div className="flex items-center justify-center gap-6 md:gap-10">
             <button onClick={toggleShuffle} className={`hover:text-white transition ${isShuffle ? 'text-green-500' : 'text-gray-400'}`}><Shuffle size={28} /></button>
             <button onClick={playPrev} className="text-gray-400 hover:text-white transition transform active:scale-90"><SkipBack className="w-9 h-9 md:w-10 md:h-10" /></button>
             <button onClick={() => togglePlay()} className="bg-green-500 text-black rounded-full p-5 md:p-6 hover:scale-110 transition shadow-xl active:scale-95">
                {isPlaying ? <Pause fill="black" className="w-8 h-8 md:w-10 md:h-10" /> : <Play fill="black" className="w-8 h-8 md:w-10 md:h-10" />}
             </button>
             <button onClick={playNext} className="text-gray-400 hover:text-white transition transform active:scale-90"><SkipForward className="w-9 h-9 md:w-10 md:h-10" /></button>
             <button onClick={toggleRepeat} className={`hover:text-white transition ${repeatMode > 0 ? 'text-green-500' : 'text-gray-400'} relative`}>
                <Repeat size={28} />
                {repeatMode === 2 && <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-green-500 text-black rounded-full w-4 h-4 flex items-center justify-center">1</span>}
             </button>
          </div>
       </div>
    </div>
  );
}