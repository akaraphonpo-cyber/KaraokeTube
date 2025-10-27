
import React from 'react';
import type { User } from '../types';
import { EditIcon } from './icons';

interface ProfilePageProps {
  user: User;
}

const Stat: React.FC<{ value: number, label: string }> = ({ value, label }) => (
    <div className="text-center">
        <p className="text-xl font-bold text-white">{(value / 1000).toFixed(value > 10000 ? 0 : 1)}k</p>
        <p className="text-sm text-gray-400">{label}</p>
    </div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover Photo */}
      <div
        className="h-48 md:h-64 bg-cover bg-center rounded-t-2xl"
        style={{ backgroundImage: `url(${user.coverUrl})` }}
      ></div>

      <div className="bg-gray-800 p-6 rounded-b-2xl">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-16">
          <div className="relative">
            <img 
              src={user.avatarUrl} 
              alt="User Avatar" 
              className="h-32 w-32 rounded-full border-4 border-gray-800"
            />
            {user.badges.includes('VIP') && <span className="absolute bottom-2 right-2 text-xs bg-yellow-400 text-black font-bold px-2 py-1 rounded-full">VIP</span>}
          </div>
          <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              {user.displayName}
              {user.badges.includes('Verified') && <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM12 14a1 1 0 100-2 1 1 0 000 2zM8.293 8.293a1 1 0 011.414 0L12 10.586l2.293-2.293a1 1 0 111.414 1.414L13.414 12l2.293 2.293a1 1 0 01-1.414 1.414L12 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.586 12 8.293 9.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>}
            </h1>
            <p className="text-gray-400">@{user.username}</p>
          </div>
          <div className="flex-grow"></div>
          <div className="mt-4 sm:mt-0">
            <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              <EditIcon />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-6 text-gray-300 max-w-2xl">{user.bio}</p>

        {/* Stats */}
        <div className="mt-6 flex gap-8">
            <Stat value={user.stats.followers} label="Followers" />
            <Stat value={user.stats.following} label="Following" />
            <Stat value={user.stats.likes} label="Likes" />
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="mt-8">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <a href="#" className="border-fuchsia-500 text-fuchsia-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Works
            </a>
            <a href="#" className="border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Moments
            </a>
          </nav>
        </div>
        <div className="py-8 text-center text-gray-500">
          <p>No works recorded yet. Time to sing!</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
