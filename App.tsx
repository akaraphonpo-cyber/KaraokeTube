
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from './types';
import LoginScreen from './components/LoginScreen';
import HomePage from './components/HomePage';
import Header from './components/Header';
import ProfilePage from './components/ProfilePage';

// Mock user data for simulation purposes
const MOCK_USER: User = {
  id: 'u1',
  username: 'thongchai_mc',
  displayName: 'Thongchai McIntyre',
  bio: 'นักร้องและนักแสดงชาวไทย เจ้าของฉายา "ซุปเปอร์สตาร์ตลอดกาล" 🎤✨',
  avatarUrl: 'https://i.pravatar.cc/150?u=thongchai',
  coverUrl: 'https://picsum.photos/seed/thongchai-cover/1200/400',
  profileFrameUrl: 'https://example.com/vip-frame.png',
  badges: ['VIP', 'Verified'],
  stats: {
    followers: 1250000,
    following: 5,
    likes: 3400000,
  },
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'profile'>('home');

  useEffect(() => {
    // Check local storage for a saved user session
    const savedUserJson = localStorage.getItem('karaokeUser');
    if (savedUserJson) {
      setCurrentUser(JSON.parse(savedUserJson));
    }
  }, []);

  const handleLogin = useCallback(() => {
    // Simulate logging in
    localStorage.setItem('karaokeUser', JSON.stringify(MOCK_USER));
    setCurrentUser(MOCK_USER);
    setCurrentPage('home');
  }, []);

  const handleLogout = useCallback(() => {
    // Simulate logging out
    localStorage.removeItem('karaokeUser');
    setCurrentUser(null);
  }, []);

  const navigate = useCallback((page: 'home' | 'profile') => {
    setCurrentPage(page);
  }, []);

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header user={currentUser} onLogout={handleLogout} navigate={navigate} />
      
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'profile' && <ProfilePage user={currentUser} />}
      </main>
    </div>
  );
};

export default App;
