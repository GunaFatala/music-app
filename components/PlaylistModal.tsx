"use client";

import React from 'react';
import { X, Plus, Music } from 'lucide-react';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: any[];
  onAddToPlaylist: (playlistId: string) => void;
  songToAdd: any;
}

export default function PlaylistModal({ 
  isOpen, onClose, playlists, onAddToPlaylist, songToAdd 
}: PlaylistModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#282828] w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Tambahkan ke...</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Info Lagu Singkat */}
        {songToAdd && (
           <div className="flex items-center gap-3 mb-6 bg-black/20 p-3 rounded-lg">
              <img src={songToAdd.cover} className="w-10 h-10 rounded" alt="cover"/>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-white truncate">{songToAdd.title}</p>
                 <p className="text-xs text-gray-400 truncate">{songToAdd.artist}</p>
              </div>
           </div>
        )}

        {/* Daftar Playlist */}
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {playlists.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Belum ada playlist.</p>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => onAddToPlaylist(pl.id)}
                className="flex items-center gap-4 p-3 rounded-md hover:bg-white/10 transition text-left group"
              >
                <div className="w-10 h-10 bg-gray-700 flex items-center justify-center rounded text-gray-400 group-hover:text-white">
                  <Music size={20} />
                </div>
                <span className="font-bold text-white">{pl.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{pl.songs.length} lagu</span>
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
}