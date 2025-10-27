
import React from 'react';
import { GoogleIcon, AppleIcon, FacebookIcon, EmailIcon, MicIcon } from './icons';

interface LoginScreenProps {
  onLogin: () => void;
}

const SocialButton: React.FC<{ icon: React.ReactNode, text: string, onClick: () => void }> = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-semibold"
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center bg-gray-800 p-8 rounded-2xl shadow-2xl shadow-fuchsia-500/20">
        <MicIcon className="mx-auto h-16 w-16 text-fuchsia-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome to KaraokeTube</h1>
        <p className="text-gray-400 mb-8">Join the community and sing your heart out.</p>
        
        <div className="space-y-3">
          <SocialButton icon={<GoogleIcon />} text="Continue with Google" onClick={onLogin} />
          <SocialButton icon={<AppleIcon />} text="Continue with Apple" onClick={onLogin} />
          <SocialButton icon={<FacebookIcon />} text="Continue with Facebook" onClick={onLogin} />
          <SocialButton icon={<EmailIcon />} text="Sign up with Email" onClick={onLogin} />
        </div>

        <p className="text-xs text-gray-500 mt-8">
          By continuing, you agree to KaraokeTube's <a href="#" className="underline hover:text-white">Terms of Service</a> and <a href="#" className="underline hover:text-white">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
