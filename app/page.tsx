"use client";

import React, { useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Home, Search, Library, Play, Pause, SkipBack, SkipForward, Volume2, Music, Search as SearchIcon, Loader2 } from 'lucide-react';

export default function MelodiaApp() {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // --- STATE DATA ---
  // Kita mulai dengan list kosong atau satu lagu default biar gak sepi
  const [songList, setSongList] = useState<any[]>([
    { id: 'M7lc1UVf-VE', title: 'Separuh Aku', artist: 'Noah', cover: 'https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg' }
  ]);
  
  const [currentSong, setCurrentSong] = useState(songList[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Indikator loading saat mencari

  // --- LOGIC SEARCH API ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah reload halaman saat Enter ditekan
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      // URL API YouTube Search
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${searchQuery} official audio&type=video&key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        // Format data dari YouTube biar cocok sama aplikasi kita
        const newSongs = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle, // Kita pakai nama Channel sebagai Artis
          cover: item.snippet.thumbnails.medium.url
        }));

        setSongList(newSongs); // Update daftar lagu
      } else {
        console.error("Gagal mengambil data:", data);
        alert("Kuota API habis atau Key salah seting.");
      }
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC PLAYER ---
  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: { autoplay: 1 },
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
    if (event.data === 0) setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!player) return;
    isPlaying ? player.pauseVideo() : player.playVideo();
    setIsPlaying(!isPlaying);
  };

  const playSong = (song: any) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden font-sans">
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-black p-6 flex flex-col gap-6 hidden md:flex border-r border-gray-900">
           <div className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
             <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Music size={18} className="text-black" />
             </div>
             Melodia
           </div>

           <nav className="flex flex-col gap-4 text-gray-400 font-bold text-sm">
             <a href="#" className="flex items-center gap-4 text-white hover:text-white transition"><Home size={24} /> Home</a>
             <a href="#" className="flex items-center gap-4 hover:text-white transition"><Search size={24} /> Search</a>
             <a href="#" className="flex items-center gap-4 hover:text-white transition"><Library size={24} /> Your Library</a>
           </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-black p-8 overflow-y-auto">
          
          {/* SEARCH BAR HEADER */}
          <header className="flex justify-between items-center mb-8 sticky top-0 z-20 bg-black/50 backdrop-blur-md py-4 -mt-4 px-2">
             <div className="flex gap-4">
                <button className="bg-black/60 rounded-full p-2 hover:bg-black/80"><SkipBack size={20}/></button>
                <button className="bg-black/60 rounded-full p-2 hover:bg-black/80"><SkipForward size={20}/></button>
             </div>
             
             {/* FORM PENCARIAN ASLI */}
             <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative group">
                <div className="absolute top-3 left-3 text-gray-400">
                  <SearchIcon size={20} />
                </div>
                <input 
                  type="text"
                  placeholder="Cari lagu, artis, atau podcast..."
                  className="w-full bg-[#2a2a2a] rounded-full py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400 transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </form>

             <div className="flex gap-4">
                <button className="bg-white text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition">Log in</button>
             </div>
          </header>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            {isLoading ? (
              <>Mencari... <Loader2 className="animate-spin" /></>
            ) : (
              searchQuery ? `Hasil Pencarian: "${searchQuery}"` : "Rekomendasi Hari Ini"
            )}
          </h2>
          
          {/* GRID DATA DARI API */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            
            {songList.map((song) => (
              <div 
                key={song.id}
                onClick={() => playSong(song)}
                className={`bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition duration-300 group cursor-pointer ${currentSong.id === song.id ? 'bg-[#282828] ring-1 ring-green-500' : ''}`}
              >
                <div className="relative mb-4 shadow-lg group-hover:scale-105 transition duration-300">
                  <img src={song.cover} alt={song.title} className="w-full aspect-square object-cover rounded-md shadow-lg" />
                  
                  <button 
                    className={`absolute bottom-2 right-2 bg-green-500 rounded-full p-3 text-black shadow-xl 
                      transition-all duration-300 transform translate-y-2 opacity-0 
                      group-hover:opacity-100 group-hover:translate-y-0
                      ${(currentSong.id === song.id && isPlaying) ? 'opacity-100 translate-y-0' : ''} 
                    `}
                  >
                    {(currentSong.id === song.id && isPlaying) ? <Pause fill="black" size={20}/> : <Play fill="black" size={20}/>}
                  </button>
                </div>
                {/* Decode judul biar karakter aneh hilang (opsional simple) */}
                <h3 className={`font-bold truncate text-base mb-1 ${currentSong.id === song.id ? 'text-green-500' : 'text-white'}`}>
                  {song.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-1">{song.artist}</p>
              </div>
            ))}
          </div>

          {songList.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 mt-10">Tidak ada lagu ditemukan. Coba kata kunci lain.</div>
          )}
        </main>
      </div>

      {/* PLAYER BAR */}
      <div className="h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4 w-1/3 min-w-[150px]">
           <img src={currentSong.cover} className={`w-14 h-14 rounded object-cover ${isPlaying ? 'animate-pulse' : ''}`} alt="cover" />
           <div className="overflow-hidden">
             <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
             <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
           </div>
        </div>

        <div className="flex flex-col items-center gap-2 w-1/3">
           <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-white"><SkipBack size={20} fill="currentColor" /></button>
              <button onClick={togglePlay} className="bg-white text-black rounded-full p-2 hover:scale-105 transition active:scale-95">
                {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
              </button>
              <button className="text-gray-400 hover:text-white"><SkipForward size={20} fill="currentColor" /></button>
           </div>
           <div className="w-full max-w-md h-1 bg-gray-600 rounded-full mt-2 relative">
             <div className="absolute top-0 left-0 h-full bg-white rounded-full w-1/2"></div>
           </div>
        </div>

        <div className="flex items-center justify-end gap-2 w-1/3 pr-4 hidden md:flex">
           <Volume2 size={20} className="text-gray-400" />
           <div className="w-24 h-1 bg-gray-600 rounded-full"><div className="w-1/2 h-full bg-gray-400 rounded-full"></div></div>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 opacity-0 pointer-events-none">
        <YouTube videoId={currentSong.id} opts={opts} onReady={onPlayerReady} onStateChange={onStateChange} />
      </div>
    </div>
  );
}