"use client";

import { Home, Search, Library, Music, PlusSquare, ListMusic } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  likedSongsCount: number;
  playlists: any[];
  onCreatePlaylist: () => void;
  onSelectPlaylist: (id: string) => void;
}

export default function Sidebar({ 
  currentView, setCurrentView, likedSongsCount, playlists, onCreatePlaylist, onSelectPlaylist 
}: SidebarProps) {
  return (
    // PERUBAHAN: bg-black/60 (transparan) + backdrop-blur-xl (efek kaca)
    <aside className="w-64 bg-black/60 backdrop-blur-xl p-6 flex flex-col gap-6 hidden md:flex border-r border-white/10 z-10">
      
      <div className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)]">
          <Music size={18} className="text-black" />
        </div>
        <span className="tracking-tight">Melodia</span>
      </div>

      <nav className="flex flex-col gap-4 text-gray-400 font-bold text-sm">
        <button onClick={() => setCurrentView('home')} className={`flex items-center gap-4 transition-all duration-200 hover:scale-105 ${currentView === 'home' ? 'text-white' : 'hover:text-white'}`}>
          <Home size={24} /> Home
        </button>
        <button onClick={() => setCurrentView('search')} className={`flex items-center gap-4 transition-all duration-200 hover:scale-105 ${currentView === 'search' ? 'text-white' : 'hover:text-white'}`}>
          <Search size={24} /> Search
        </button>
        <button onClick={() => setCurrentView('liked_songs')} className={`flex items-center gap-4 transition-all duration-200 hover:scale-105 ${currentView === 'liked_songs' ? 'text-white' : 'hover:text-white'}`}>
          <Library size={24} /> Liked Songs
        </button>
      </nav>

      <div className="mt-6 pt-6 border-t border-white/10 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-4 px-1">
           <p className="text-xs text-gray-500 font-bold tracking-widest">PLAYLISTS</p>
           <button onClick={onCreatePlaylist} className="text-gray-400 hover:text-white hover:scale-110 transition" title="Buat Playlist Baru">
             <PlusSquare size={20} />
           </button>
        </div>

        <ul className="flex flex-col gap-3">
          {playlists.map((pl) => (
            <li key={pl.id}>
              <button 
                onClick={() => onSelectPlaylist(pl.id)}
                className={`text-sm truncate w-full text-left transition hover:translate-x-1 flex items-center gap-2 ${currentView === `playlist-${pl.id}` ? 'text-green-500 font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                <ListMusic size={16} />
                {pl.name}
              </button>
            </li>
          ))}
          {playlists.length === 0 && (
            <li className="text-xs text-gray-600 italic">Belum ada playlist.</li>
          )}
        </ul>
      </div>

      <div className="mt-auto bg-white/5 p-4 rounded-xl backdrop-blur-md border border-white/5">
        <p className="text-xs text-gray-400 mb-1">Koleksi Kamu</p>
        <p className="text-xl font-bold text-green-500 drop-shadow-md">{likedSongsCount} Lagu</p>
      </div>
    </aside>
  );
}