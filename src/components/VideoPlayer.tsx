import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward } from 'lucide-react';
interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  isLocked?: boolean;
}
export function VideoPlayer({
  src,
  poster,
  title,
  isLocked = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = videoRef.current.currentTime / videoRef.current.duration * 100;
      setProgress(progress);
    }
  };
  if (isLocked) {
    return <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-white rounded-full" />
          </div>
          <h3 className="text-xl font-serif font-bold mb-2">Content Locked</h3>
          <p className="text-gray-300">
            Purchase this course to access full content
          </p>
        </div>
      </div>;
  }
  return <div className="relative group bg-black aspect-video shadow-2xl">
      <video ref={videoRef} src={src} poster={poster} className="w-full h-full object-cover" onTimeUpdate={handleTimeUpdate} onClick={togglePlay} />

      {/* Overlay Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-600 mb-4 rounded-full overflow-hidden cursor-pointer">
          <div className="h-full bg-[#ff8a80]" style={{
          width: `${progress}%`
        }} />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <button onClick={togglePlay} className="hover:text-[#ff8a80] transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className="hover:text-[#ff8a80] transition-colors">
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <span className="text-sm font-medium">{title}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button className="hover:text-[#ff8a80] transition-colors">
              <SkipForward className="w-6 h-6" />
            </button>
            <button className="hover:text-[#ff8a80] transition-colors">
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button (Initial) */}
      {!isPlaying && <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
          <div className="w-20 h-20 bg-[#ff8a80]/90 rounded-full flex items-center justify-center pl-2 hover:scale-110 transition-transform duration-300 shadow-lg">
            <Play className="w-8 h-8 text-[#2d2d2d] fill-current" />
          </div>
        </div>}
    </div>;
}