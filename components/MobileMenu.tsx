"use client";

import React from 'react';
import { Home, Search, Library } from 'lucide-react';

interface MobileMenuProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MobileMenu({ currentView, setCurrentView }: MobileMenuProps) {
  return (
    // Hanya muncul di layar kecil (md:hidden)
    // Fixed di bawah, di atas player bar (z-40)
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        
        <button 
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'home' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => setCurrentView('search')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'search' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Search size={24} />
          <span className="text-[10px] font-bold">Search</span>
        </button>

        <button 
          onClick={() => setCurrentView('library')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'library' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Library size={24} />
          <span className="text-[10px] font-bold">Library</span>
        </button>

      </div>
    </div>
  );
}