import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Film,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Play,
  Coffee,
  Layers,
  Maximize2,
  Tv,
  Smartphone,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface VeoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultImage?: string;
}

const SAMPLE_COFFEE_PHOTOS = [
  {
    id: 'sample-latte',
    name: 'Latte Art Rosette',
    url: 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=1000&q=80',
    prompt: 'Silky warm milk swirling into rich golden crema, creating a blooming tulip latte art rosette with gentle rising steam.',
  },
  {
    id: 'sample-pourover',
    name: 'Pour-Over Coffee',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    prompt: 'A steady stream of hot water pouring slowly from a goose-neck kettle over fresh coffee grounds, blooming with rich aroma and gentle steam.',
  },
  {
    id: 'sample-croissant',
    name: 'Fresh Butter Croissant',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80',
    prompt: 'Slow cinematic camera pan around a golden flaky croissant fresh out of the oven, with tiny buttery crumbs flaking softly in warm morning sunlight.',
  },
  {
    id: 'sample-patio',
    name: 'Sunny Garden Patio',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
    prompt: 'A peaceful café scene with gentle breeze rustling garden patio greenery, warm dappled sunlight dancing on wooden tables, and soft distant café chatter.',
  },
];

const PROMPT_SUGGESTIONS = [
  'Gentle steam rising into soft golden morning light with smooth slow-motion camera drift.',
  'Silky milk pouring slowly into rich dark espresso with swirling microfoam patterns.',
  'A warm cinematic pan highlighting steam, reflections on ceramic cup, and cozy ambience.',
  'A soothing breeze fluttering cozy curtains with gentle sunbeams across the coffee cup.',
];

const PROGRESS_STAGES = [
  'Initializing Google Veo (veo-3.1-fast-generate-preview)...',
  'Analyzing photo depth, lighting, and composition...',
  'Simulating fluid motion, steam dynamics, and camera trajectory...',
  'Synthesizing temporal coherence across video frames...',
  'Rendering final video with high-definition clarity...',
  'Finalizing and preparing video for preview...',
];

export const VeoVideoModal: React.FC<VeoVideoModalProps> = ({
  isOpen,
  onClose,
  defaultImage,
}) => {
  // Setup inputs
  const [selectedImage, setSelectedImage] = useState<string | null>(defaultImage || null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [prompt, setPrompt] = useState<string>(
    'A warm, cinematic coffee shop scene bringing this photo to life with gentle rising steam and atmospheric café lighting.'
  );

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [operationName, setOperationName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set default image when opened
  useEffect(() => {
    if (isOpen && defaultImage && !selectedImage) {
      setSelectedImage(defaultImage);
      // Fetch and convert image to base64
      fetchImageAsBase64(defaultImage);
    }
  }, [isOpen, defaultImage]);

  // Elapsed timer during generation
  useEffect(() => {
    if (isGenerating) {
      setElapsedSeconds(0);
      setGenerationStage(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Progress message updates every ~12 seconds
          const stageIndex = Math.min(Math.floor(next / 12), PROGRESS_STAGES.length - 1);
          setGenerationStage(stageIndex);
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating]);

  // Clean up polling interval and blob url on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    };
  }, [videoBlobUrl]);

  if (!isOpen) return null;

  // Helper to convert remote URL to base64
  const fetchImageAsBase64 = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setSelectedImage(base64data);
        setSelectedMimeType(blob.type || 'image/jpeg');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Could not fetch sample as base64, using direct url', err);
      setSelectedImage(url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image size is too large. Please upload an image under 15MB.');
      return;
    }

    setErrorMessage(null);
    setSelectedMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_COFFEE_PHOTOS[0]) => {
    setErrorMessage(null);
    setPrompt(sample.prompt);
    fetchImageAsBase64(sample.url);
  };

  const handleStartGeneration = async () => {
    if (!selectedImage) {
      setErrorMessage('Please upload or select a coffee or café photo first.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setVideoBlobUrl(null);
    setOperationName(null);

    try {
      // 1. Send generation request to server
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          mimeType: selectedMimeType,
          prompt,
          aspectRatio,
          resolution,
        }),
      });

      const startData = await startRes.json();

      if (!startRes.ok || !startData.operationName) {
        throw new Error(startData.error || 'Failed to start video generation.');
      }

      const opName = startData.operationName;
      setOperationName(opName);

      // 2. Poll for completion every 5 seconds
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName }),
          });

          const statusData = await statusRes.json();

          if (statusData.error) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            throw new Error(statusData.error.message || 'Video generation failed.');
          }

          if (statusData.done) {
            // Completed! Stop polling and download
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

            // 3. Download the video binary
            const downloadRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName: opName }),
            });

            if (!downloadRes.ok) {
              throw new Error('Failed to retrieve the generated video file.');
            }

            const videoBlob = await downloadRes.blob();
            const blobUrl = URL.createObjectURL(videoBlob);

            setVideoBlobUrl(blobUrl);
            setIsGenerating(false);
          }
        } catch (pollErr: any) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsGenerating(false);
          setErrorMessage(pollErr.message || 'Error occurred while checking video progress.');
        }
      }, 5000);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err.message || 'Failed to initiate Veo video generation.');
    }
  };

  const handleDownloadVideo = () => {
    if (!videoBlobUrl) return;
    const a = document.createElement('a');
    a.href = videoBlobUrl;
    a.download = `brew-bloom-veo-${aspectRatio.replace(':', 'x')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setIsGenerating(false);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    setVideoBlobUrl(null);
    setErrorMessage(null);
    setElapsedSeconds(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFF8EE] rounded-3xl max-w-3xl w-full border border-[#3B241A]/15 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#3B241A] text-[#FFF8EE] p-5 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C96F4A] text-white flex items-center justify-center shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                  Animate Photos with Google Veo
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#87986A]/30 text-[#A3B882] border border-[#87986A]/40">
                  <Sparkles className="w-3 h-3" />
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-[#FFF8EE]/70 mt-0.5">
                Turn your coffee & café photos into cinematic living videos with atmospheric motion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#FFF8EE]/60 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Veo animation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Generation Notice</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ACTIVE GENERATION LOADING SCREEN */}
          {isGenerating && (
            <div className="py-12 px-6 rounded-3xl bg-white border border-[#3B241A]/10 text-center shadow-sm space-y-6 animate-fadeIn">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-[#3B241A]/10" />
                <div className="absolute inset-0 rounded-full border-4 border-[#C96F4A] border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Coffee className="w-8 h-8 text-[#3B241A] animate-pulse" />
                </div>
              </div>

              <div>
                <span className="text-xs font-mono font-semibold text-[#87986A] bg-[#87986A]/10 px-3 py-1 rounded-full">
                  Time elapsed: {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')}
                </span>
                <h4 className="font-serif text-lg font-bold text-[#3B241A] mt-3">
                  Generating Your Café Video
                </h4>
                <p className="text-xs text-[#3B241A]/80 max-w-md mx-auto mt-1 leading-relaxed">
                  {PROGRESS_STAGES[generationStage]}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto bg-[#FFF8EE] rounded-full h-2 overflow-hidden border border-[#3B241A]/10">
                <div
                  className="bg-gradient-to-r from-[#C96F4A] to-[#87986A] h-full transition-all duration-1000"
                  style={{ width: `${Math.min(15 + elapsedSeconds * 2.2, 95)}%` }}
                />
              </div>

              <div className="p-3 bg-[#FFF8EE] rounded-xl max-w-sm mx-auto text-[11px] text-[#3B241A]/70 flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C96F4A]" />
                <span>Generating at <strong>{aspectRatio}</strong> aspect ratio using Veo 3.1 Fast</span>
              </div>
            </div>
          )}

          {/* VIDEO RESULT SCREEN */}
          {!isGenerating && videoBlobUrl && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-white rounded-3xl p-5 border border-[#3B241A]/12 shadow-sm text-center">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#3B241A]/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-serif text-sm font-bold text-[#3B241A]">
                      Your Video is Ready!
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-[#FFF8EE] border border-[#3B241A]/10 px-2.5 py-0.5 rounded-lg text-[#3B241A]">
                    {aspectRatio === '16:9' ? '16:9 Landscape' : '9:16 Portrait'} · {resolution}
                  </span>
                </div>

                {/* Video Player */}
                <div
                  className={`mx-auto rounded-2xl overflow-hidden bg-black shadow-lg flex items-center justify-center ${
                    aspectRatio === '9:16'
                      ? 'max-w-[280px] aspect-[9/16]'
                      : 'max-w-full aspect-[16/9]'
                  }`}
                >
                  <video
                    ref={videoRef}
                    src={videoBlobUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-5 pt-3 border-t border-[#3B241A]/10">
                  <button
                    type="button"
                    onClick={handleDownloadVideo}
                    className="px-5 py-2.5 bg-[#3B241A] hover:bg-[#2A1810] text-[#FFF8EE] text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#87986A]" />
                    <span>Download Video (MP4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 bg-[#FFF8EE] hover:bg-[#F5ECD9] text-[#3B241A] border border-[#3B241A]/20 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 text-[#C96F4A]" />
                    <span>Animate Another Photo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SETUP SCREEN (When not generating and no active result) */}
          {!isGenerating && !videoBlobUrl && (
            <div className="space-y-6">
              
              {/* STEP 1: Upload or Select Coffee Photo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-serif text-sm font-bold text-[#3B241A] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3B241A] text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Upload or Pick a Photo to Animate</span>
                  </label>
                  <span className="text-[11px] text-[#3B241A]/60">Supports JPG, PNG, WEBP</span>
                </div>

                {/* Upload Drag/Drop Box */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="md:col-span-6 border-2 border-dashed border-[#3B241A]/20 hover:border-[#C96F4A] bg-white hover:bg-[#FAF4EA] rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF8EE] text-[#C96F4A] flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#3B241A] block">
                      Click to Upload Photo
                    </span>
                    <span className="text-[11px] text-[#3B241A]/60 mt-0.5">
                      Upload from phone or computer
                    </span>
                  </div>

                  {/* Preview of chosen photo */}
                  <div className="md:col-span-6 bg-white rounded-2xl p-3 border border-[#3B241A]/10 flex flex-col items-center justify-center min-h-[160px]">
                    {selectedImage ? (
                      <div className="relative w-full h-full max-h-[160px] rounded-xl overflow-hidden group">
                        <img
                          src={selectedImage}
                          alt="Selected photo for animation"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 text-[11px] font-semibold bg-white text-[#3B241A] rounded-lg shadow-sm cursor-pointer"
                          >
                            Change Photo
                          </button>
                        </div>
                        <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                          Ready to animate
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Coffee className="w-8 h-8 text-[#3B241A]/20 mx-auto mb-2" />
                        <p className="text-xs text-[#3B241A]/60">
                          No photo selected yet. Upload one or pick from sample café moments below.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sample Coffee & Café Photos */}
                <div>
                  <span className="text-xs font-semibold text-[#3B241A]/80 block mb-2">
                    Or select a sample café moment:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_COFFEE_PHOTOS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className="group relative rounded-xl overflow-hidden border border-[#3B241A]/10 hover:border-[#C96F4A] transition-all text-left bg-white cursor-pointer"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden">
                          <img
                            src={sample.url}
                            alt={sample.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-[11px] font-bold text-[#3B241A] truncate">
                            {sample.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* STEP 2: Aspect Ratio (MUST be 16:9 or 9:16) */}
              <div className="space-y-3">
                <label className="font-serif text-sm font-bold text-[#3B241A] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3B241A] text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Select Aspect Ratio</span>
                  </div>
                  <span className="text-[11px] text-[#87986A] font-semibold">Veo Supported Ratios</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 16:9 Landscape */}
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      aspectRatio === '16:9'
                        ? 'border-[#C96F4A] bg-white ring-2 ring-[#C96F4A]/20 shadow-xs'
                        : 'border-[#3B241A]/15 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      aspectRatio === '16:9' ? 'bg-[#C96F4A] text-white' : 'bg-[#3B241A]/10 text-[#3B241A]'
                    }`}>
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#3B241A]">16:9 Landscape</span>
                        {aspectRatio === '16:9' && (
                          <span className="w-2 h-2 rounded-full bg-[#C96F4A]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#3B241A]/60 mt-0.5">
                        Cinematic widescreen for YouTube & desktop
                      </p>
                    </div>
                  </button>

                  {/* 9:16 Portrait */}
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      aspectRatio === '9:16'
                        ? 'border-[#C96F4A] bg-white ring-2 ring-[#C96F4A]/20 shadow-xs'
                        : 'border-[#3B241A]/15 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      aspectRatio === '9:16' ? 'bg-[#C96F4A] text-white' : 'bg-[#3B241A]/10 text-[#3B241A]'
                    }`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#3B241A]">9:16 Portrait</span>
                        {aspectRatio === '9:16' && (
                          <span className="w-2 h-2 rounded-full bg-[#C96F4A]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#3B241A]/60 mt-0.5">
                        Vertical format for Instagram Reels & Stories
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* STEP 3: Motion Prompt */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-serif text-sm font-bold text-[#3B241A] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3B241A] text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Motion & Atmosphere Prompt</span>
                  </label>
                  <span className="text-[11px] text-[#3B241A]/60">Customize or pick suggestion</span>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  placeholder="Describe the movement, steam, lighting, or camera action..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-[#3B241A]/15 text-[#3B241A] placeholder-[#3B241A]/40 focus:outline-hidden focus:border-[#C96F4A] focus:ring-1 focus:ring-[#C96F4A]"
                />

                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sug)}
                      className="px-2.5 py-1 text-[11px] bg-white border border-[#3B241A]/10 hover:border-[#C96F4A] text-[#3B241A]/80 hover:text-[#3B241A] rounded-lg transition-colors cursor-pointer"
                    >
                      "{sug.slice(0, 38)}..."
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={!selectedImage}
                  className={`w-full py-3.5 px-6 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-md ${
                    selectedImage
                      ? 'bg-[#3B241A] hover:bg-[#2A1810] text-[#FFF8EE] cursor-pointer'
                      : 'bg-[#3B241A]/40 text-[#FFF8EE]/60 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#C96F4A]" />
                  <span>Generate Video with Veo 3.1 Fast ({aspectRatio})</span>
                </button>
                <p className="text-[11px] text-center text-[#3B241A]/60 mt-2">
                  Powered by Google DeepMind's Veo video generation model
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
