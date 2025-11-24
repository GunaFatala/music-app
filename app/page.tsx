"use client";

import React, { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Home, Search, Library, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Search as SearchIcon, Loader2, Heart, ChevronDown } from 'lucide-react';

export default function MelodiaApp() {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'library'>('home');

  // --- STATE DATA ---
  const [songList, setSongList] = useState<any[]>([]); 
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE PLAYER UI ---
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false); // <-- FITUR BARU: Player Besar/Kecil

  // --- STATE AUDIO ---
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // --- LOAD DATA ---
  useEffect(() => {
    const savedLikes = localStorage.getItem('melodia_liked_songs');
    if (savedLikes) setLikedSongs(JSON.parse(savedLikes));
  }, []);

  // --- LOGIC SEARCH ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setCurrentView('home');

    try {
      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${searchQuery} official audio&type=video&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        const newSongs = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          cover: item.snippet.thumbnails.high.url // Kita ambil gambar High Res biar bagus pas dibesarin
        }));
        setSongList(newSongs);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC PLAYER UTAMA ---
  const opts: YouTubeProps['opts'] = { height: '0', width: '0', playerVars: { autoplay: 1 } };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    event.target.setVolume(volume);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) { setIsPlaying(true); setDuration(event.target.getDuration()); }
    if (event.data === 2) setIsPlaying(false);
    if (event.data === 0) playNextSong();
  };

  const playSong = (song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const playNextSong = () => {
    if (!currentSong) return;
    const activeList = currentView === 'home' ? songList : likedSongs;
    const currentIndex = activeList.findIndex(s => s.id === currentSong.id);
    if (currentIndex >= 0 && currentIndex < activeList.length - 1) {
      playSong(activeList[currentIndex + 1]);
    } else {
      setIsPlaying(false); setCurrentTime(0);
    }
  };

  const playPrevSong = () => {
    if (!currentSong) return;
    const activeList = currentView === 'home' ? songList : likedSongs;
    const currentIndex = activeList.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) playSong(activeList[currentIndex - 1]);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Biar gak memicu klik expand player
    if (!player) return;
    isPlaying ? player.pauseVideo() : player.playVideo();
    setIsPlaying(!isPlaying);
  };

  // Timer Update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && player) {
      interval = setInterval(() => { setCurrentTime(player.getCurrentTime()); }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player]);

  // Controls Logic
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (player) player.seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    if (player) {
      player.setVolume(newVol);
      if (newVol > 0 && isMuted) { player.unMute(); setIsMuted(false); }
    }
  };

  const toggleMute = () => {
    if (!player) return;
    if (isMuted) { player.unMute(); setIsMuted(false); } 
    else { player.mute(); setIsMuted(true); }
  };

  const toggleLike = (song: any) => {
    const isLiked = likedSongs.some(s => s.id === song.id);
    let newLikes;
    if (isLiked) newLikes = likedSongs.filter(s => s.id !== song.id);
    else newLikes = [...likedSongs, song];
    setLikedSongs(newLikes);
    localStorage.setItem('melodia_liked_songs', JSON.stringify(newLikes));
  };

  // Helpers
  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const isCurrentLiked = currentSong ? likedSongs.some(s => s.id === currentSong.id) : false;

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden font-sans relative">
      
      {/* 1. LAYOUT UTAMA (Sidebar & Main) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-black p-6 flex flex-col gap-6 hidden md:flex border-r border-gray-900 z-10">
           <div className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
             <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"><Music size={18} className="text-black" /></div>
             Melodia
           </div>
           <nav className="flex flex-col gap-4 text-gray-400 font-bold text-sm">
             <button onClick={() => setCurrentView('home')} className={`flex items-center gap-4 transition ${currentView === 'home' ? 'text-white' : 'hover:text-white'}`}><Home size={24} /> Home</button>
             <button onClick={() => setCurrentView('home')} className="flex items-center gap-4 hover:text-white transition"><Search size={24} /> Search</button>
             <button onClick={() => setCurrentView('library')} className={`flex items-center gap-4 transition ${currentView === 'library' ? 'text-white' : 'hover:text-white'}`}><Library size={24} /> Your Library</button>
           </nav>
           <div className="mt-auto bg-gray-900 p-4 rounded-lg">
             <p className="text-xs text-gray-400 mb-1">Disimpan</p>
             <p className="text-xl font-bold text-green-500">{likedSongs.length} Lagu</p>
           </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-black p-8 overflow-y-auto z-0">
          
          {/* Header Search */}
          <header className="flex justify-between items-center mb-8 sticky top-0 z-20 bg-black/50 backdrop-blur-md py-4 -mt-4 px-2">
             <div className="flex gap-4">
                <button onClick={playPrevSong} disabled={!currentSong} className="bg-black/60 rounded-full p-2 hover:bg-black/80 disabled:opacity-50"><SkipBack size={20}/></button>
                <button onClick={playNextSong} disabled={!currentSong} className="bg-black/60 rounded-full p-2 hover:bg-black/80 disabled:opacity-50"><SkipForward size={20}/></button>
             </div>
             {currentView === 'home' && (
               <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative group">
                  <div className="absolute top-3 left-3 text-gray-400"><SearchIcon size={20} /></div>
                  <input type="text" placeholder="Cari lagu / artis..." className="w-full bg-[#2a2a2a] rounded-full py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400 transition" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
               </form>
             )}
             <div className="w-10"></div>
          </header>

          {/* Konten Home / Library */}
          {currentView === 'home' ? (
            <>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                {isLoading ? <><Loader2 className="animate-spin" /> Mencari...</> : searchQuery ? `Hasil: "${searchQuery}"` : "Selamat Datang 👋"}
              </h2>
              
              {songList.length === 0 && !isLoading && (
                 <div className="text-center text-gray-500 mt-20">
                    <Music size={64} className="mx-auto mb-4 opacity-50"/>
                    <p>Mulai cari lagu favoritmu di kolom pencarian atas.</p>
                 </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {songList.map((song) => {
                  const isLiked = likedSongs.some(s => s.id === song.id);
                  const isActive = currentSong && currentSong.id === song.id;
                  return (
                    <div key={song.id} className="group relative bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition duration-300">
                      <div onClick={() => playSong(song)} className="cursor-pointer relative mb-4 shadow-lg group-hover:scale-105 transition duration-300">
                        <img src={song.cover} alt={song.title} className="w-full aspect-square object-cover rounded-md shadow-lg" />
                        <button className={`absolute bottom-2 right-2 bg-green-500 rounded-full p-3 text-black shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 ${(isActive && isPlaying) ? 'opacity-100 translate-y-0' : ''}`}>
                          {(isActive && isPlaying) ? <Pause fill="black" size={20}/> : <Play fill="black" size={20}/>}
                        </button>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleLike(song); }} className="absolute top-6 right-6 p-2 rounded-full bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition">
                        <Heart size={18} className={isLiked ? "fill-green-500 text-green-500" : "text-white"} />
                      </button>
                      <h3 className={`font-bold truncate text-base mb-1 ${isActive ? 'text-green-500' : 'text-white'}`}>{song.title.replace(/&quot;/g, '"')}</h3>
                      <p className="text-sm text-gray-400 line-clamp-1">{song.artist}</p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* LIBRARY */}
              <div className="flex items-end gap-6 mb-8 bg-gradient-to-b from-purple-800 to-transparent p-6 -mx-8 -mt-8 pt-20">
                 <div className="w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl flex items-center justify-center rounded-md"><Heart size={64} fill="white" /></div>
                 <div><p className="text-sm font-bold mb-2">PLAYLIST</p><h1 className="text-6xl font-black mb-4">Lagu Favorit</h1><p className="text-gray-300">{likedSongs.length} lagu disimpan</p></div>
              </div>
              <div className="flex flex-col gap-2">
                   {likedSongs.map((song, index) => (
                      <div key={song.id} className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-md group">
                         <div className="w-8 text-center text-gray-400">{isPlaying && currentSong?.id === song.id ? <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="h-4 w-4 mx-auto" /> : index + 1}</div>
                         <img src={song.cover} className="w-10 h-10 rounded" />
                         <div className="flex-1"><h4 className={`font-bold ${currentSong?.id === song.id ? 'text-green-500' : 'text-white'}`}>{song.title}</h4><p className="text-sm text-gray-400">{song.artist}</p></div>
                         <button onClick={() => toggleLike(song)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white mr-4"><Heart size={18} fill="#1db954" className="text-[#1db954]" /></button>
                         <button onClick={() => playSong(song)} className="text-white hover:text-green-500"><Play size={20} /></button>
                      </div>
                   ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* 2. FULL SCREEN PLAYER OVERLAY (FITUR BARU) */}
      {/* Muncul kalau isPlayerExpanded = true */}
      <div className={`fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-black to-black text-white flex flex-col transition-transform duration-500 ease-in-out ${isPlayerExpanded ? 'translate-y-0' : 'translate-y-[110%]'}`}>
         
         {/* Tombol Tutup (Chevron Down) */}
         <div className="p-6 flex justify-between items-center">
            <button onClick={() => setIsPlayerExpanded(false)} className="hover:bg-white/10 p-2 rounded-full transition">
              <ChevronDown size={32} />
            </button>
            <span className="text-xs font-bold tracking-widest text-gray-400">NOW PLAYING</span>
            <div className="w-8"></div> {/* Spacer */}
         </div>

         {/* Konten Full Screen */}
         <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full">
            {/* Cover Album Besar */}
            <div className="w-full max-w-md aspect-square bg-gray-800 rounded-xl shadow-2xl mb-10 overflow-hidden relative">
               <img src={currentSong?.cover} className="w-full h-full object-cover" />
            </div>

            {/* Judul & Artis */}
            <div className="w-full flex justify-between items-end mb-6">
               <div>
                  <h1 className="text-3xl font-bold mb-2 line-clamp-1">{currentSong?.title}</h1>
                  <p className="text-xl text-gray-400">{currentSong?.artist}</p>
               </div>
               <button onClick={() => currentSong && toggleLike(currentSong)}>
                  <Heart size={32} className={isCurrentLiked ? "fill-green-500 text-green-500" : "text-gray-400"} />
               </button>
            </div>

            {/* Slider Progress Besar */}
            <div className="w-full mb-8">
               <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400" />
               <div className="flex justify-between text-xs font-mono text-gray-400 mt-2">
                 <span>{formatTime(currentTime)}</span>
                 <span>{formatTime(duration)}</span>
               </div>
            </div>

            {/* Kontrol Utama Besar */}
            <div className="flex items-center justify-center gap-10">
               <button onClick={playPrevSong} className="text-gray-400 hover:text-white transition transform active:scale-90"><SkipBack size={40} /></button>
               <button onClick={() => togglePlay()} className="bg-green-500 text-black rounded-full p-6 hover:scale-110 transition shadow-xl active:scale-95">
                  {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" />}
               </button>
               <button onClick={playNextSong} className="text-gray-400 hover:text-white transition transform active:scale-90"><SkipForward size={40} /></button>
            </div>
         </div>
      </div>

      {/* 3. MINI PLAYER BAR (BAWAH) */}
      {/* Player Bar akan hilang kalau Full Screen sedang aktif */}
      {currentSong && !isPlayerExpanded && (
        <div className="h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-40 transition-all">
          
          {/* AREA KLIK UNTUK EXPAND */}
          <div 
             onClick={() => setIsPlayerExpanded(true)} 
             className="flex items-center gap-4 w-1/3 min-w-[150px] cursor-pointer group"
          >
             <div className="relative">
                <img src={currentSong.cover} className={`w-14 h-14 rounded object-cover ${isPlaying ? 'animate-pulse' : ''}`} alt="cover" />
                {/* Ikon panah atas saat hover biar user tau bisa diklik */}
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

          {/* Kontrol Tengah */}
          <div className="flex flex-col items-center justify-center gap-1 w-1/3 max-w-2xl">
             <div className="flex items-center gap-6">
                <button onClick={playPrevSong} className="text-gray-400 hover:text-white"><SkipBack size={20} fill="currentColor" /></button>
                <button onClick={() => togglePlay()} className="bg-white text-black rounded-full p-2 hover:scale-105 transition active:scale-95">
                  {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
                </button>
                <button onClick={playNextSong} className="text-gray-400 hover:text-white"><SkipForward size={20} fill="currentColor" /></button>
             </div>
             <div className="w-full flex items-center gap-2 text-xs font-mono text-gray-400 mt-1">
               <span className="w-10 text-right">{formatTime(currentTime)}</span>
               <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400" />
               <span className="w-10">{formatTime(duration)}</span>
             </div>
          </div>

          <div className="flex items-center justify-end gap-2 w-1/3 pr-4 hidden md:flex">
             <button onClick={toggleMute} className="text-gray-400 hover:text-white">{isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
             <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-green-500" />
          </div>
        </div>
      )}

      {/* Hidden Player Engine */}
      <div className="fixed bottom-0 right-0 opacity-0 pointer-events-none">
        {currentSong && <YouTube videoId={currentSong.id} opts={opts} onReady={onPlayerReady} onStateChange={onStateChange} />}
      </div>
    </div>
  );
}