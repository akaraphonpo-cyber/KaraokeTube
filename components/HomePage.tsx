import React, { useState, useCallback, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import VideoCard from './VideoCard';
import EnhancementControls from './EnhancementControls';
import { LoadingSpinner, MicIcon, KeyIcon, BackArrowIcon, RecordIcon, StopIcon } from './icons';
import { searchVideos } from '../services/youtubeService';
import type { YouTubeVideo } from '../types';

type ViewMode = 'search' | 'studio';

const HomePage: React.FC = () => {
  // Global State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('search');

  // Search View State
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Studio View State
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Refs for Web Audio API and MediaRecorder
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const pitchFilterRef = useRef<BiquadFilterNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load API key from local storage on initial render
  useEffect(() => {
    const savedKey = localStorage.getItem('youtubeApiKey');
    if (savedKey) {
      setApiKey(savedKey);
      setTempApiKey(savedKey);
    }
  }, []);
  
  // Cleanup audio resources on component unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        // Fix: The reported error "Expected 1 arguments, but got 0" for .close() is inconsistent with the Web Audio API. As a best practice, adding .catch() to handle any potential promise rejection from the async close operation.
        audioContextRef.current.close().catch(console.error);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Audio visualization logic
  const draw = useCallback((_time?: number) => {
    if (!analyserRef.current || !canvasRef.current) return;
    try {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        const { width, height } = canvas;
        context.clearRect(0, 0, width, height);

        const barWidth = (width / dataArray.length) * 2.5;
        let x = 0;
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#a855f7'); // fuchsia-500
        gradient.addColorStop(0.5, '#ec4899'); // pink-500
        gradient.addColorStop(1, '#f59e0b'); // amber-500

        context.fillStyle = gradient;

        for (const byte of dataArray) {
            const barHeight = (byte / 255) * height;
            context.fillRect(x, height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
        animationFrameRef.current = requestAnimationFrame(draw);
    } catch (e) {
        console.error("Error in audio visualization draw loop:", e);
    }
  }, []);

  // API Key Management
  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempApiKey.trim()) {
      const trimmedKey = tempApiKey.trim();
      setApiKey(trimmedKey);
      localStorage.setItem('youtubeApiKey', trimmedKey);
    }
  };
  
  const handleClearKey = () => {
    setApiKey(null);
    setTempApiKey('');
    localStorage.removeItem('youtubeApiKey');
    setVideos([]);
    setError(null);
    setHasSearched(false);
  }

  // Search Logic
  const handleSearch = useCallback(async (query: string) => {
    if (!apiKey) {
      setError('Please provide a valid YouTube API key to begin searching.');
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setVideos([]);
    try {
      const results = await searchVideos(query, apiKey);
      setVideos(results);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('api key not valid')) {
          setError('The YouTube API Key is invalid. Please check your key in the Google Cloud Console and ensure it is correct and enabled. You can try setting a new key.');
        } else {
          setError(`An error occurred: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred while fetching videos.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  // View Transition Logic
  const handleSelectVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setViewMode('studio');
  };

  const handleReturnToSearch = () => {
      // Cleanup audio resources before returning to search
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(console.error);
          audioContextRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
      }
      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
      }
      // Reset state for studio view
      setIsMicEnabled(false);
      setIsRecording(false);
      setRecordedAudioUrl(null);
      analyserRef.current = null;
      pitchFilterRef.current = null;
      
      // Transition back to search view
      setSelectedVideo(null);
      setViewMode('search');
  };

  // Studio Logic: Mic & Recording
  const handleEnableMic = async () => {
    if (isMicEnabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContext();
      audioContextRef.current = context;
      
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Create the pitch correction filter
      const pitchFilter = context.createBiquadFilter();
      pitchFilter.type = 'bandpass';
      pitchFilter.frequency.value = 880; // A frequency in the vocal range
      pitchFilter.Q.value = 0; // Start with no effect
      pitchFilterRef.current = pitchFilter;

      // Connect the audio graph: source -> analyser (for visualization)
      // and source -> pitchFilter -> destination (for hearing the output)
      source.connect(analyser);
      source.connect(pitchFilter);
      pitchFilter.connect(context.destination);

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      setIsMicEnabled(true);
      draw();
    } catch (err) {
      console.error('Error enabling microphone:', err);
      alert('Could not start audio source. Please check your browser permissions and ensure the microphone is not in use by another application.');
    }
  };

  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordedAudioUrl(null);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Studio Logic: Audio Effects
  const handlePitchCorrectionChange = useCallback((intensity: number) => {
    if (!pitchFilterRef.current || !audioContextRef.current) return;

    // A true auto-tune effect is complex. We simulate it by adjusting the Q factor
    // of a bandpass filter, which creates a resonant, focused, "robotic" sound at high values.
    const maxQ = 25; // Determines the maximum "sharpness" of the effect.
    const newQ = (intensity / 100) * maxQ;

    // Use setValueAtTime for smooth transitions.
    pitchFilterRef.current.Q.setValueAtTime(newQ, audioContextRef.current.currentTime);
  }, []);

  // Main Render Logic
  if (!apiKey) {
    return (
      <div className="min-h-[calc(100vh-80px)] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center bg-gray-800 p-8 rounded-2xl shadow-2xl shadow-fuchsia-500/20">
          <KeyIcon className="mx-auto h-16 w-16 text-fuchsia-500 mb-4" />
          <h2 className="text-3xl font-bold mb-2">YouTube API Key Required</h2>
          <p className="text-gray-400 mb-6">
            Please provide your YouTube Data API v3 key to search for videos. This key will be saved in your browser's local storage for convenience.
          </p>
          <form onSubmit={handleKeySubmit} className="space-y-4">
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Paste your API key here"
              className="w-full py-3 px-4 text-lg text-white bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors"
            />
            <button
              type="submit"
              className="w-full py-3 text-lg font-bold text-white bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700 disabled:bg-gray-600 transition-colors"
              disabled={!tempApiKey.trim()}
            >
              Save and Start Singing
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (viewMode === 'studio') {
    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-900 text-white p-4 flex flex-col">
            <div className="flex-shrink-0 mb-4">
                <button onClick={handleReturnToSearch} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                    <BackArrowIcon />
                    <span>Back to Search</span>
                </button>
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-black rounded-lg overflow-hidden">
                    {selectedVideo && (
                        <iframe
                            src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}?autoplay=1`}
                            title={selectedVideo.snippet.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full aspect-video"
                        ></iframe>
                    )}
                </div>

                <div className="bg-gray-800 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold truncate">{selectedVideo?.snippet.title}</h2>
                        <p className="text-sm text-gray-400">{selectedVideo?.snippet.channelTitle}</p>
                    </div>

                    <div className="flex flex-col items-center gap-4 my-6">
                        {!isMicEnabled ? (
                            <button onClick={handleEnableMic} className="w-full flex items-center justify-center gap-2 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg font-semibold transition-colors">
                                <MicIcon className="h-6 w-6" />
                                Enable Microphone
                            </button>
                        ) : (
                            <>
                                <canvas ref={canvasRef} width="300" height="80" className="rounded-lg"></canvas>
                                {isRecording ? (
                                    <button onClick={handleStopRecording} className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
                                        <StopIcon className="h-6 w-6" />
                                        Stop Recording
                                    </button>
                                ) : (
                                    <button onClick={handleStartRecording} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors">
                                        <RecordIcon className="h-6 w-6" />
                                        Start Recording
                                    </button>
                                )}
                            </>
                        )}
                        {recordedAudioUrl && (
                            <div className="w-full mt-4">
                                <p className="text-center mb-2">Your Performance:</p>
                                <audio controls src={recordedAudioUrl} className="w-full"></audio>
                            </div>
                        )}
                    </div>

                    <EnhancementControls onPitchCorrectionChange={handlePitchCorrectionChange} />
                </div>
            </div>
        </div>
    );
  }

  // Default: Search View
  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="sticky top-24 z-10 mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
        <div className="text-center mb-6">
          <button onClick={handleClearKey} className="text-sm text-gray-400 hover:text-fuchsia-400 transition-colors">
            Use a different API Key
          </button>
        </div>
        
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-center text-red-400 mt-8 text-lg bg-red-500/10 p-4 rounded-lg">{error}</p>}
        {!isLoading && !error && (
            <>
                {!hasSearched && (
                    <div className="text-center text-gray-400 mt-16">
                        <MicIcon className="mx-auto h-16 w-16 text-gray-600" />
                        <h2 className="mt-4 text-2xl font-semibold">Find Your Favorite Karaoke Song</h2>
                        <p className="mt-2 text-lg">Use the search bar above to get started.</p>
                    </div>
                )}
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {videos.map((video) => (
                            <VideoCard key={video.id.videoId} video={video} onSelect={() => handleSelectVideo(video)} />
                        ))}
                    </div>
                ) : (
                    hasSearched && <p className="text-center text-gray-400 mt-8 text-lg">No results found. Try a different song!</p>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
