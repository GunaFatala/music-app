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
    <aside className="w-64 bg-black p-6 flex flex-col gap-6 hidden md:flex border-r border-gray-900 z-10">
      
      <div className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Music size={18} className="text-black" />
        </div>
        Melodia
      </div>

      <nav className="flex flex-col gap-4 text-gray-400 font-bold text-sm">
        <button onClick={() => setCurrentView('home')} className={`flex items-center gap-4 transition ${currentView === 'home' ? 'text-white' : 'hover:text-white'}`}>
          <Home size={24} /> Home
        </button>
        <button onClick={() => setCurrentView('search')} className={`flex items-center gap-4 transition ${currentView === 'search' ? 'text-white' : 'hover:text-white'}`}>
          <Search size={24} /> Search
        </button>
        
        {/* PERUBAHAN DI SINI: Tombol ini khusus ke Liked Songs */}
        <button onClick={() => setCurrentView('liked_songs')} className={`flex items-center gap-4 transition ${currentView === 'liked_songs' ? 'text-white' : 'hover:text-white'}`}>
          <Library size={24} /> Liked Songs
        </button>
      </nav>

      <div className="mt-6 pt-6 border-t border-gray-800 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 px-1">
           <p className="text-xs text-gray-500 font-bold tracking-widest">PLAYLISTS</p>
           <button onClick={onCreatePlaylist} className="text-gray-400 hover:text-white" title="Buat Playlist Baru">
             <PlusSquare size={20} />
           </button>
        </div>

        <ul className="flex flex-col gap-3">
          {playlists.map((pl) => (
            <li key={pl.id}>
              <button 
                onClick={() => onSelectPlaylist(pl.id)}
                className={`text-sm truncate w-full text-left transition flex items-center gap-2 ${currentView === `playlist-${pl.id}` ? 'text-green-500 font-bold' : 'text-gray-400 hover:text-white'}`}
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

      <div className="mt-auto bg-gray-900 p-4 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">Disimpan</p>
        <p className="text-xl font-bold text-green-500">{likedSongsCount} Lagu</p>
      </div>
    </aside>
  );
}