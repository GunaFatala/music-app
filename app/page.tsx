"use client";

import React, { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Search as SearchIcon, Loader2, Heart } from 'lucide-react';
import Sidebar from '../components/sidebar';
import PlayerBar from '../components/PlayerBar';
import FullScreenPlayer from '../components/FullScreenPlayer';
import SongGrid from '../components/SongGrid';

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

        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          likedSongsCount={likedSongs.length} 
        />

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
              
              <SongGrid 
                songs={songList}
                isLoading={isLoading}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlay={playSong}
                toggleLike={toggleLike}
                likedSongs={likedSongs}
              />
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

     {/* 2. FULL SCREEN PLAYER OVERLAY */}
      <FullScreenPlayer 
        isExpanded={isPlayerExpanded}
        onClose={() => setIsPlayerExpanded(false)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        playNext={playNextSong}
        playPrev={playPrevSong}
        currentTime={currentTime}
        duration={duration}
        handleSeek={handleSeek}
        toggleLike={toggleLike}
        isCurrentLiked={isCurrentLiked}
      />

      {/* 3. MINI PLAYER BAR (BAWAH) */}
      {/* Player Bar akan hilang kalau Full Screen sedang aktif */}
      {currentSong && !isPlayerExpanded && (
        <PlayerBar 
          currentSong={currentSong}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          playNext={playNextSong}
          playPrev={playPrevSong}
          currentTime={currentTime}
          duration={duration}
          handleSeek={handleSeek}
          volume={volume}
          handleVolumeChange={handleVolumeChange}
          isMuted={isMuted}
          toggleMute={toggleMute}
          toggleLike={toggleLike}
          isCurrentLiked={isCurrentLiked}
          onExpand={() => setIsPlayerExpanded(true)}
        />
      )}

      {/* Hidden Player Engine */}
      <div className="fixed bottom-0 right-0 opacity-0 pointer-events-none">
        {currentSong && <YouTube videoId={currentSong.id} opts={opts} onReady={onPlayerReady} onStateChange={onStateChange} />}
      </div>
    </div>
  );
}