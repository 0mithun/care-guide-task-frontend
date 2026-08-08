import React from 'react';

export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = size === 'sm' ? 'w-4 h-4 border-2' : size === 'lg' ? 'w-10 h-10 border-3' : 'w-6 h-6 border-2';
  
  return (
    <div className="flex items-center justify-center p-2">
      <div
        className={`${sizeClasses} border-zinc-800 border-t-zinc-300 rounded-full animate-spin`}
      />
    </div>
  );
}
