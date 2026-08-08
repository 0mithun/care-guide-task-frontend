import React from 'react';
import { IoCloseOutline } from 'react-icons/io5';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-xs z-50 transition-opacity duration-150">
      <div className="w-11/12 max-w-lg bg-zinc-900 border border-zinc-800 p-6 rounded-md shadow-2xl transition-transform duration-200 transform scale-100">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
          <h3 className="text-md font-semibold font-mono tracking-tight text-zinc-100">{title}</h3>
          <button 
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1" 
            onClick={onClose}
          >
            <IoCloseOutline size={22} />
          </button>
        </div>
        <div className="text-zinc-300">{children}</div>
      </div>
    </div>
  );
}
