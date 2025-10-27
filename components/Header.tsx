
import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { LogoutIcon, UserGroupIcon, MicIcon } from './icons';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  navigate: (page: 'home' | 'profile') => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, navigate }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-40 shadow-lg">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('home')}
        >
            <MicIcon className="h-8 w-8 text-fuchsia-500"/>
            <span className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400">
                KaraokeTube
            </span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3">
            <span className="font-semibold text-white hidden sm:block">{user.displayName}</span>
            <img src={user.avatarUrl} alt="User Avatar" className="h-10 w-10 rounded-full border-2 border-fuchsia-500" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-xl py-1 z-50">
              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('profile'); setDropdownOpen(false); }}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                View Profile
              </a>
              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); onLogout(); }}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
              >
                <LogoutIcon />
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
