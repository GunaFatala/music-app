"use client";

// 1. Kita hapus 'Search' dari import karena sudah tidak dipakai
import { Home, Library, Music } from 'lucide-react';

interface SidebarProps {
  currentView: 'home' | 'library';
  setCurrentView: (view: 'home' | 'library') => void;
  likedSongsCount: number;
}

export default function Sidebar({ currentView, setCurrentView, likedSongsCount }: SidebarProps) {
  return (
    <aside className="w-64 bg-black p-6 flex flex-col gap-6 hidden md:flex border-r border-gray-900 z-10">
      
      {/* LOGO */}
      <div className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Music size={18} className="text-black" />
        </div>
        Melodia
      </div>

      {/* MENU NAVIGASI */}
      <nav className="flex flex-col gap-4 text-gray-400 font-bold text-sm">
        
        {/* TOMBOL HOME */}
        <button 
          onClick={() => setCurrentView('home')} 
          className={`flex items-center gap-4 transition ${currentView === 'home' ? 'text-white' : 'hover:text-white'}`}
        >
          <Home size={24} /> Home
        </button>
        
        {/* (TOMBOL SEARCH SUDAH DIHAPUS DISINI) */}
        
        {/* TOMBOL LIBRARY */}
        <button 
          onClick={() => setCurrentView('library')} 
          className={`flex items-center gap-4 transition ${currentView === 'library' ? 'text-white' : 'hover:text-white'}`}
        >
          <Library size={24} /> Your Library
        </button>
      </nav>

      {/* STATISTIK BAWAH */}
      <div className="mt-auto bg-gray-900 p-4 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">Disimpan</p>
        <p className="text-xl font-bold text-green-500">{likedSongsCount} Lagu</p>
      </div>
    </aside>
  );
}