"use client";

import React, { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { SkipBack, SkipForward, Search as SearchIcon, Loader2, Music, Sparkles, ListMusic, Trash2, CheckCircle, Plus, Heart, ChevronRight, ChevronLeft } from 'lucide-react';

import Sidebar from '../components/Sidebar';
import PlayerBar from '../components/PlayerBar';
import FullScreenPlayer from '../components/FullScreenPlayer';
import SongGrid from '../components/SongGrid';
import PlaylistModal from '../components/PlaylistModal';
import MobileMenu from '../components/MobileMenu';

export default function MelodiaApp() {
  const [currentView, setCurrentView] = useState<string>('home');

  // --- DATA ---
  const [searchSongs, setSearchSongs] = useState<any[]>([]); 
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]); 
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  
  const [collectionSongs, setCollectionSongs] = useState<any[]>([]);
  const [collectionInfo, setCollectionInfo] = useState<any>(null);
  const [filterType, setFilterType] = useState<'video' | 'playlist' | 'channel'>('video');

  const [currentSong, setCurrentSong] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<any>(null);

  // --- PLAYER STATE ---
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50); // Default 50, nanti ditimpa useEffect
  const [isMuted, setIsMuted] = useState(false);

  // Features
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<0 | 1 | 2>(0);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); 
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // --- LOAD DATA & SETTINGS ---
  useEffect(() => {
    // Load Data
    const savedLikes = localStorage.getItem('melodia_liked_songs');
    if (savedLikes) setLikedSongs(JSON.parse(savedLikes));
    const savedPlaylists = localStorage.getItem('melodia_playlists');
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
    const savedRecents = localStorage.getItem('melodia_recent_songs');
    if (savedRecents) setRecentSongs(JSON.parse(savedRecents));
    
    // Load Volume Terakhir (FITUR BARU)
    const savedVolume = localStorage.getItem('melodia_volume');
    if (savedVolume) {
      setVolume(parseInt(savedVolume));
    }
  }, []);

  const addToRecent = (song: any) => {
    const filtered = recentSongs.filter(s => s.id !== song.id);
    const updated = [song, ...filtered].slice(0, 8);
    setRecentSongs(updated);
    localStorage.setItem('melodia_recent_songs', JSON.stringify(updated));
  };

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  // --- STYLE HELPER ---
  const getMainBackground = () => {
    if (currentView === 'liked_songs') return 'bg-gradient-to-b from-purple-900 via-[#121212] to-black';
    if (currentView.startsWith('playlist-')) return 'bg-gradient-to-b from-blue-900 via-[#121212] to-black';
    if (currentView.startsWith('yt-playlist-') || currentView.startsWith('artist-')) return 'bg-gradient-to-b from-red-900 via-[#121212] to-black';
    return 'bg-gradient-to-b from-[#1e1e1e] to-black';
  };

  // --- LOGIC FUNCTIONS ---
  const toggleSleepTimer = () => { let n=null; if(sleepTimer===null)n=15; else if(sleepTimer===15)n=30; else if(sleepTimer===30)n=60; if(timerId)clearTimeout(timerId); if(n){setSleepTimer(n);showToast(`Stop ${n}m`);const id=setTimeout(()=>{if(player)player.pauseVideo();setIsPlaying(false);setSleepTimer(null);showToast("Timer: Stop");},n*60000);setTimerId(id);}else{setSleepTimer(null);showToast("Timer Mati");}};
  const handleCreatePlaylist = () => { const name = prompt("Nama Playlist:"); if(name){ const up=[...playlists,{id:Date.now().toString(),name,songs:[]}]; setPlaylists(up); localStorage.setItem('melodia_playlists', JSON.stringify(up)); showToast("Playlist dibuat"); }};
  const openAddToPlaylistModal = (song: any) => { setSongToAddToPlaylist(song); setIsModalOpen(true); };
  const handleAddToPlaylist = (pid: string) => { if(!songToAddToPlaylist)return; const up=playlists.map(pl=>{if(pl.id===pid){if(pl.songs.find((s:any)=>s.id===songToAddToPlaylist.id)){alert("Sudah ada!");return pl;}return{...pl,songs:[...pl.songs,songToAddToPlaylist]};}return pl;}); setPlaylists(up); localStorage.setItem('melodia_playlists', JSON.stringify(up)); setIsModalOpen(false); setSongToAddToPlaylist(null); showToast("Ditambahkan"); };
  const handleDeletePlaylist = (id: string) => { if(confirm("Hapus?")){ const up=playlists.filter(p=>p.id!==id); setPlaylists(up); localStorage.setItem('melodia_playlists', JSON.stringify(up)); setCurrentView('library'); showToast("Dihapus"); }};
  const handleRemoveSongFromPlaylist = (song: any) => { if(!currentView.startsWith('playlist-'))return; const pid=currentView.split('-')[1]; if(confirm("Hapus lagu?")){ const up=playlists.map(p=>{if(p.id===pid)return{...p,songs:p.songs.filter((s:any)=>s.id!==song.id)};return p;}); setPlaylists(up); localStorage.setItem('melodia_playlists', JSON.stringify(up)); showToast("Lagu dihapus"); }};
  const handleCardClick = async (item: any) => { if (!item.type || item.type === 'video') { playSong(item); return; } setIsLoading(true); setCollectionSongs([]); setCollectionInfo(item); const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY; try { if (item.type === 'playlist') { setCurrentView(`yt-playlist-${item.id}`); const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=${item.id}&key=${API_KEY}`); const data = await res.json(); if (data.items) { setCollectionSongs(data.items.map((i:any)=>({id:i.snippet.resourceId.videoId, title:i.snippet.title, artist:i.snippet.videoOwnerChannelTitle||item.artist, cover:i.snippet.thumbnails?.medium?.url||item.cover, type:'video'})).filter((s:any)=>s.title!=='Private video')); } } else if (item.type === 'channel') { setCurrentView(`artist-${item.id}`); const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${item.id}&maxResults=20&order=viewCount&type=video&key=${API_KEY}`); const data = await res.json(); if (data.items) { setCollectionSongs(data.items.map((i:any)=>({id:i.id.videoId, title:i.snippet.title, artist:i.snippet.channelTitle, cover:i.snippet.thumbnails?.high?.url, type:'video'}))); } } } catch (e) { console.error(e); showToast("Gagal memuat"); } finally { setIsLoading(false); } };
  const handleSearch = async (e?: React.FormEvent) => { if(e)e.preventDefault(); if(!searchQuery.trim())return; setIsLoading(true); setSearchSongs([]); try { const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY; const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${searchQuery}&type=${filterType}&key=${API_KEY}`); const data = await res.json(); if(data.items){ setSearchSongs(data.items.map((i:any)=>{let id=i.id.videoId;if(filterType==='playlist')id=i.id.playlistId;if(filterType==='channel')id=i.id.channelId;return{id,title:i.snippet.title,artist:i.snippet.channelTitle,cover:i.snippet.thumbnails.high?.url,type:filterType};})); } } catch(e){console.error(e);} finally{setIsLoading(false);} };
  useEffect(() => { if(searchQuery && currentView==='search') handleSearch(); }, [filterType]);
  
  const opts: YouTubeProps['opts'] = { height: '0', width: '0', playerVars: { autoplay: 1 } };
  const onPlayerReady: YouTubeProps['onReady'] = (e) => { setPlayer(e.target); setDuration(e.target.getDuration()); e.target.setVolume(volume); };
  const onStateChange: YouTubeProps['onStateChange'] = (e) => { if(e.data===1){setIsPlaying(true);setDuration(e.target.getDuration());} if(e.data===2)setIsPlaying(false); if(e.data===0) { if(repeatMode===2)e.target.playVideo(); else playNextSong(); } };
  const playSong = (song: any) => { setCurrentSong(song); setIsPlaying(true); setCurrentTime(0); addToRecent(song); };
  const getActivePlaylistSongs = () => { if(currentView==='search')return searchSongs.filter(s=>s.type==='video'); if(currentView==='liked_songs')return likedSongs; if(currentView==='home')return recentSongs; if(currentView.startsWith('playlist-')){const pl=playlists.find(p=>p.id===currentView.split('-')[1]);return pl?pl.songs:[];} if(currentView.startsWith('yt')||currentView.startsWith('artist'))return collectionSongs; return []; };
  const playNextSong = () => { if(!currentSong)return; const l=getActivePlaylistSongs(); const use=l.length>0?l:searchSongs.filter(s=>s.type==='video'); if(!use.length)return; if(isShuffle){ playSong(use[Math.floor(Math.random()*use.length)]); return; } const i=use.findIndex(s=>s.id===currentSong.id); if(i>=0&&i<use.length-1)playSong(use[i+1]); else if(repeatMode===1)playSong(use[0]); else {setIsPlaying(false);setCurrentTime(0);} };
  const playPrevSong = () => { if(!currentSong)return; if(player&&player.getCurrentTime()>3){player.seekTo(0);return;} const l=getActivePlaylistSongs(); const use=l.length>0?l:searchSongs.filter(s=>s.type==='video'); if(isShuffle){playSong(use[Math.floor(Math.random()*use.length)]);return;} const i=use.findIndex(s=>s.id===currentSong.id); if(i>0)playSong(use[i-1]); else if(repeatMode===1)playSong(use[use.length-1]); };
  const togglePlay = () => { if(player) isPlaying ? player.pauseVideo() : player.playVideo(); setIsPlaying(!isPlaying); };
  useEffect(() => { let i:NodeJS.Timeout; if(isPlaying && player) i = setInterval(() => setCurrentTime(player.getCurrentTime()), 1000); return () => clearInterval(i); }, [isPlaying, player]);
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => { const t = parseFloat(e.target.value); setCurrentTime(t); if(player) player.seekTo(t); };
  
  // --- UPDATED VOLUME HANDLER (Simpan ke LocalStorage) ---
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const v = parseInt(e.target.value); 
    setVolume(v); 
    localStorage.setItem('melodia_volume', v.toString()); // SIMPAN DISINI
    if(player) { 
      player.setVolume(v); 
      if(v > 0 && isMuted) { player.unMute(); setIsMuted(false); } 
    } 
  };

  const toggleMute = () => { if(player) { if(isMuted) { player.unMute(); setIsMuted(false); } else { player.mute(); setIsMuted(true); } } };
  const toggleLike = (song: any) => { const isLiked = likedSongs.some(s => s.id === song.id); const newLikes = isLiked ? likedSongs.filter(s => s.id !== song.id) : [...likedSongs, song]; setLikedSongs(newLikes); localStorage.setItem('melodia_liked_songs', JSON.stringify(newLikes)); if(!isLiked) showToast("Masuk Liked Songs"); else showToast("Dihapus Liked Songs"); };
  const isCurrentLiked = currentSong ? likedSongs.some(s => s.id === currentSong.id) : false;

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden font-sans relative">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} likedSongsCount={likedSongs.length} playlists={playlists} onCreatePlaylist={handleCreatePlaylist} onSelectPlaylist={(id) => setCurrentView(`playlist-${id}`)} />

        <main className={`flex-1 overflow-y-auto z-0 pb-32 transition-colors duration-500 ${getMainBackground()}`}>
          
          <header className="flex flex-col gap-4 mb-6 pt-4 px-4 md:px-8 sticky top-0 z-40">
             <div className="flex justify-between items-center w-full">
                {currentView === 'search' ? (
                  <form onSubmit={handleSearch} className="flex-1 max-w-md mr-4 relative group animate-in fade-in zoom-in duration-300">
                      <div className="absolute top-3 left-3 text-gray-400"><SearchIcon size={20} /></div>
                      <input type="text" placeholder={`Cari ${filterType === 'video' ? 'lagu' : filterType === 'channel' ? 'artis' : 'playlist'}...`} className="w-full bg-[#2a2a2a] rounded-full py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400 transition" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                  </form>
                ) : ( <div className="flex-1"></div> )}
                <button className="bg-white text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition shadow-lg">Log in</button>
             </div>
             {currentView === 'search' && (
                <div className="flex gap-3 animate-in slide-in-from-top-2">
                   <button onClick={() => setFilterType('video')} className={`px-4 py-1 rounded-full text-sm font-bold transition ${filterType === 'video' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'}`}>Lagu</button>
                   <button onClick={() => setFilterType('channel')} className={`px-4 py-1 rounded-full text-sm font-bold transition ${filterType === 'channel' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'}`}>Artis</button>
                   <button onClick={() => setFilterType('playlist')} className={`px-4 py-1 rounded-full text-sm font-bold transition ${filterType === 'playlist' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'}`}>Playlist</button>
                </div>
             )}
          </header>

          <div className="px-4 md:px-8">
            {currentView === 'home' && (
              <>
                <h2 className="text-2xl font-bold mb-6">🕒 Baru Saja Diputar</h2>
                {recentSongs.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10"><p>Belum ada riwayat lagu.</p><button onClick={() => setCurrentView('search')} className="text-green-500 hover:underline mt-2">Cari lagu sekarang</button></div>
                ) : (
                  <SongGrid songs={recentSongs} isLoading={false} currentSong={currentSong} isPlaying={isPlaying} onPlay={playSong} toggleLike={toggleLike} likedSongs={likedSongs} onAddToPlaylistClick={openAddToPlaylistModal} />
                )}
              </>
            )}

            {currentView === 'search' && (
              <SongGrid songs={searchSongs} isLoading={isLoading} currentSong={currentSong} isPlaying={isPlaying} onPlay={handleCardClick} toggleLike={toggleLike} likedSongs={likedSongs} onAddToPlaylistClick={openAddToPlaylistModal} />
            )}

            {currentView === 'library' && (
              <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-3xl font-bold mb-6">Koleksi Kamu</h2>
                <button onClick={handleCreatePlaylist} className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-lg flex items-center gap-4 mb-6 transition group">
                  <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center group-hover:bg-white group-hover:text-black transition"><Plus size={24} /></div>
                  <div className="text-left flex-1"><h3 className="font-bold">Buat Playlist Baru</h3><p className="text-sm text-gray-400">Tambahkan daftar putar sendiri</p></div>
                </button>
                <div className="space-y-2">
                    <button onClick={() => setCurrentView('liked_songs')} className="w-full bg-[#181818] hover:bg-[#282828] p-4 rounded-lg flex items-center gap-4 transition">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-md flex items-center justify-center"><Heart size={24} fill="white" className="text-white" /></div>
                        <div className="text-left flex-1"><h3 className="font-bold text-white">Liked Songs</h3><p className="text-sm text-gray-500">{likedSongs.length} lagu disukai</p></div><ChevronRight className="text-gray-400" />
                    </button>
                    {playlists.map(pl => ( <button key={pl.id} onClick={() => setCurrentView(`playlist-${pl.id}`)} className="w-full bg-[#181818] hover:bg-[#282828] p-4 rounded-lg flex items-center gap-4 transition"><div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-md flex items-center justify-center"><ListMusic size={24} className="text-white" /></div><div className="text-left flex-1"><h3 className="font-bold text-white">{pl.name}</h3><p className="text-sm text-gray-500">{pl.songs.length} lagu</p></div><ChevronRight className="text-gray-400" /></button> ))}
                </div>
              </div>
            )}
          </div>

          {currentView === 'liked_songs' && (
            <>
              <div className="relative flex items-end gap-6 p-8 pt-20 -mt-24"> 
                 <button onClick={() => setCurrentView('library')} className="md:hidden absolute top-24 left-4 bg-black/40 p-2 rounded-full hover:bg-black/60 z-30"><ChevronLeft size={24} color="white" /></button>
                 <div className="w-32 h-32 md:w-52 md:h-52 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl flex items-center justify-center rounded-md"><Heart size={64} fill="white" className="text-white" /></div>
                 <div><p className="text-sm font-bold mb-2">PLAYLIST</p><h1 className="text-3xl md:text-6xl font-black mb-4">Liked Songs</h1><p className="text-gray-300">{likedSongs.length} lagu</p></div>
              </div>
              <div className="px-4 md:px-8">
                <SongGrid songs={likedSongs} isLoading={false} currentSong={currentSong} isPlaying={isPlaying} onPlay={playSong} toggleLike={toggleLike} likedSongs={likedSongs} onAddToPlaylistClick={openAddToPlaylistModal}/>
              </div>
            </>
          )}

          {currentView.startsWith('playlist-') && (
            (() => {
              const plId = currentView.split('-')[1];
              const pl = playlists.find(p => p.id === plId);
              if (!pl) return <div className="p-8">Playlist tidak ditemukan</div>;
              return (
                <>
                  <div className="relative flex items-end gap-6 p-8 pt-20 -mt-24 group">
                    <button onClick={() => setCurrentView('library')} className="md:hidden absolute top-24 left-4 bg-black/40 p-2 rounded-full hover:bg-black/60 z-30"><ChevronLeft size={24} color="white" /></button>
                    <div className="w-32 h-32 md:w-52 md:h-52 bg-gradient-to-br from-cyan-500 to-blue-500 shadow-2xl flex items-center justify-center rounded-md"><ListMusic size={64} className="text-white" /></div>
                    <div className="flex-1"><p className="text-sm font-bold mb-2">CUSTOM PLAYLIST</p><h1 className="text-3xl md:text-6xl font-black mb-4">{pl.name}</h1><p className="text-gray-300">{pl.songs.length} lagu</p></div>
                    <button onClick={() => handleDeletePlaylist(pl.id)} className="bg-red-500/20 hover:bg-red-500 p-3 rounded-full transition"><Trash2 size={24} /></button>
                  </div>
                  <div className="px-4 md:px-8">
                    <SongGrid songs={pl.songs} isLoading={false} currentSong={currentSong} isPlaying={isPlaying} onPlay={playSong} toggleLike={toggleLike} likedSongs={likedSongs} onRemoveFromPlaylist={handleRemoveSongFromPlaylist} />
                  </div>
                </>
              );
            })()
          )}

          {(currentView.startsWith('yt-playlist-') || currentView.startsWith('artist-')) && collectionInfo && (
             <>
               <div className="relative flex items-end gap-6 p-8 pt-20 -mt-24">
                  <button onClick={() => setCurrentView('search')} className="absolute top-24 left-4 bg-black/40 p-2 rounded-full hover:bg-black/60 z-30"><ChevronLeft size={24} color="white" /></button>
                  <div className="w-32 h-32 md:w-52 md:h-52 bg-gray-800 shadow-2xl flex items-center justify-center rounded-md overflow-hidden">{collectionInfo.cover ? <img src={collectionInfo.cover} className="w-full h-full object-cover" /> : <Music size={64} className="text-white" />}</div>
                  <div className="flex-1"><p className="text-sm font-bold mb-2 uppercase">{collectionInfo.type === 'channel' ? 'ARTIS' : 'YOUTUBE PLAYLIST'}</p><h1 className="text-2xl md:text-5xl font-black mb-4 line-clamp-2">{collectionInfo.title}</h1><p className="text-gray-300">{collectionInfo.artist}</p></div>
               </div>
               <div className="px-4 md:px-8">
                 <SongGrid songs={collectionSongs} isLoading={isLoading} currentSong={currentSong} isPlaying={isPlaying} onPlay={handleCardClick} toggleLike={toggleLike} likedSongs={likedSongs} onAddToPlaylistClick={openAddToPlaylistModal} />
               </div>
             </>
          )}

        </main>
      </div>

      <FullScreenPlayer isExpanded={isPlayerExpanded} onClose={() => setIsPlayerExpanded(false)} currentSong={currentSong} isPlaying={isPlaying} togglePlay={togglePlay} playNext={playNextSong} playPrev={playPrevSong} currentTime={currentTime} duration={duration} handleSeek={handleSeek} toggleLike={toggleLike} isCurrentLiked={isCurrentLiked} isShuffle={isShuffle} toggleShuffle={() => setIsShuffle(!isShuffle)} repeatMode={repeatMode} toggleRepeat={() => setRepeatMode((prev) => (prev + 1) % 3 as 0 | 1 | 2)} sleepTimer={sleepTimer} toggleSleepTimer={toggleSleepTimer} />
      {currentSong && !isPlayerExpanded && ( <PlayerBar currentSong={currentSong} isPlaying={isPlaying} togglePlay={togglePlay} playNext={playNextSong} playPrev={playPrevSong} currentTime={currentTime} duration={duration} handleSeek={handleSeek} volume={volume} handleVolumeChange={handleVolumeChange} isMuted={isMuted} toggleMute={toggleMute} toggleLike={toggleLike} isCurrentLiked={isCurrentLiked} onExpand={() => setIsPlayerExpanded(true)} isShuffle={isShuffle} toggleShuffle={() => setIsShuffle(!isShuffle)} repeatMode={repeatMode} toggleRepeat={() => setRepeatMode((prev) => (prev + 1) % 3 as 0 | 1 | 2)} sleepTimer={sleepTimer} toggleSleepTimer={toggleSleepTimer} /> )}
      <div className="fixed bottom-0 right-0 opacity-0 pointer-events-none">{currentSong && <YouTube videoId={currentSong.id} opts={opts} onReady={onPlayerReady} onStateChange={onStateChange} />}</div>
      <PlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} playlists={playlists} onAddToPlaylist={handleAddToPlaylist} songToAdd={songToAddToPlaylist} />
      <MobileMenu currentView={currentView} setCurrentView={setCurrentView} />
      {toastMessage && ( <div className="fixed bottom-28 md:bottom-28 left-1/2 transform -translate-x-1/2 bg-[#1db954] text-black px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in z-[70]"><CheckCircle size={20} />{toastMessage}</div> )}
    </div>
  );
}