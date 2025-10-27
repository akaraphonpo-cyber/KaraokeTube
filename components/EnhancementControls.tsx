
import React, { useState } from 'react';
import { StudioIcon, HallIcon, ConcertIcon, FilterIcon, BeautyIcon, StickerIcon, TuneIcon } from './icons';

type AudioEffect = 'none' | 'studio' | 'hall' | 'concert';
type VideoEffect = 'none' | 'vintage' | 'bw';

interface EnhancementControlsProps {
  onPitchCorrectionChange: (intensity: number) => void;
}

const EnhancementButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg transition-all duration-200 w-20 h-20 text-xs
        ${isActive ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const EnhancementControls: React.FC<EnhancementControlsProps> = ({ onPitchCorrectionChange }) => {
  const [activeAudioEffect, setActiveAudioEffect] = useState<AudioEffect>('none');
  const [activeVideoEffect, setActiveVideoEffect] = useState<VideoEffect>('none');
  const [pitchIntensity, setPitchIntensity] = useState(0);

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIntensity = parseInt(e.target.value, 10);
    setPitchIntensity(newIntensity);
    onPitchCorrectionChange(newIntensity);
  };


  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">AUDIO EFFECTS</h3>
        <div className="flex gap-2 justify-around">
          <EnhancementButton
            icon={<StudioIcon className="h-6 w-6" />}
            label="Studio"
            isActive={activeAudioEffect === 'studio'}
            onClick={() => setActiveAudioEffect('studio')}
          />
          <EnhancementButton
            icon={<HallIcon className="h-6 w-6" />}
            label="Hall"
            isActive={activeAudioEffect === 'hall'}
            onClick={() => setActiveAudioEffect('hall')}
          />
          <EnhancementButton
            icon={<ConcertIcon className="h-6 w-6" />}
            label="Concert"
            isActive={activeAudioEffect === 'concert'}
            onClick={() => setActiveAudioEffect('concert')}
          />
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">STUDIO FX</h3>
        <div className="bg-gray-700 p-3 rounded-lg">
            <label htmlFor="pitch-correction" className="flex items-center justify-between text-sm font-medium text-gray-200">
                <span className="flex items-center gap-2"><TuneIcon /> Pitch Correction</span>
                <span>{pitchIntensity}%</span>
            </label>
            <input
                id="pitch-correction"
                type="range"
                min="0"
                max="100"
                value={pitchIntensity}
                onChange={handlePitchChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2 accent-fuchsia-500"
            />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">VIDEO EFFECTS</h3>
        <div className="flex gap-2 justify-around">
          <EnhancementButton
            icon={<FilterIcon className="h-6 w-6" />}
            label="Filters"
            isActive={activeVideoEffect === 'vintage'}
            onClick={() => setActiveVideoEffect('vintage')}
          />
          <EnhancementButton
            icon={<BeautyIcon className="h-6 w-6" />}
            label="Beauty"
            isActive={false}
            onClick={() => alert('Beauty filter coming soon!')}
          />
           <EnhancementButton
            icon={<StickerIcon className="h-6 w-6" />}
            label="Stickers"
            isActive={false}
            onClick={() => alert('AR Stickers coming soon!')}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancementControls;
