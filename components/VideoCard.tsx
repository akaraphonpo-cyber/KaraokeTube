
import React from 'react';
import type { YouTubeVideo } from '../types';

interface VideoCardProps {
  video: YouTubeVideo;
  onSelect: (videoId: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  return (
    <div
      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-fuchsia-500/30"
      onClick={() => onSelect(video.id.videoId)}
    >
      <div className="relative">
        <img
          src={video.snippet.thumbnails.medium.url}
          alt={video.snippet.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
          <svg className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
          </svg>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-white leading-tight truncate" title={video.snippet.title}>
          {video.snippet.title}
        </h3>
        <p className="text-sm text-gray-400 mt-1">{video.snippet.channelTitle}</p>
      </div>
    </div>
  );
};

export default VideoCard;
