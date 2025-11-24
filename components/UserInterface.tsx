
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { Content, Category, User, UserStatus, PLANS, PlanType, PAYMENT_NUMBER, Suggestion } from '../types';
import { Play, Info, Lock, X, LogOut, CreditCard, Smartphone, User as UserIcon, KeyRound, ShieldAlert, MessageSquarePlus, ChevronRight, ChevronLeft, Bell, FileText, Download, Camera, Inbox, TrendingUp, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, Search, Laptop, Users } from 'lucide-react';

interface UserInterfaceProps {
  user: User;
  onLogout: () => void;
}

// --- COMPOSANT LECTEUR VIDÉO STYLE "EXOPLAYER" OPTIMISÉ ---
const CustomVideoPlayer: React.FC<{ src: string; title?: string; poster?: string; autoPlay?: boolean }> = ({ src, title, poster, autoPlay = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gestion AutoPlay robuste
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay prevented by browser", err);
          setIsPlaying(false);
        });
      }
    }
  }, [autoPlay, src]);

  // Nettoyage du timeout
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Toggle Play basé uniquement sur l'état réel de la vidéo
  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Empêche le clic de remonter si déclenché depuis un bouton interne
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      if (dur > 0) {
        setProgress((current / dur) * 100);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
      const seekTime = (val / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
    }
  };

  const skip = (seconds: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Gestion de l'affichage des contrôles
  const showUI = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    // Masquer après 3s seulement si la vidéo joue
    if (isPlaying) {
        controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
        }, 3000);
    }
  };

  const handleMouseMove = () => {
    showUI();
  };

  const handleControlsMouseEnter = () => {
    // Garder les contrôles visibles si la souris est dessus
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    setShowControls(true);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group overflow-hidden select-none flex flex-col justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay} // Le clic sur le conteneur lance/pause
      onDoubleClick={toggleFullscreen}
    >
      {/* VIDEO ELEMENT */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        // Pas de onClick sur la vidéo elle-même, c'est le container qui gère
        onError={(e) => {
          console.error("Video Error Event:", e);
          setError("Lecture impossible. Le format n'est peut-être pas supporté par votre navigateur.");
        }}
      />

      {/* ERROR OVERLAY */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="text-center p-6 bg-neutral-900 rounded-xl border border-red-500/50 max-w-md mx-4">
            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4"/>
            <h3 className="text-xl font-bold text-white mb-2">Erreur de lecture</h3>
            <p className="text-neutral-400 mb-4 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-neutral-800 hover:bg-white hover:text-black rounded text-sm font-bold">
               Recharger la page
            </button>
          </div>
        </div>
      )}

      {/* CENTER PLAY PAUSE OVERLAY (Animation Icon) */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isPlaying && !showControls ? 'opacity-0' : 'opacity-100'}`}>
         {!isPlaying && !error && (
           <div className="w-16 h-16 md:w-20 md:h-20 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-2xl scale-100 group-hover:scale-110 transition-transform duration-300">
              <Play className="fill-white text-white ml-1" size={32} />
           </div>
         )}
      </div>

      {/* CONTROLS OVERLAY */}
      {/* stopPropagation sur onClick pour éviter que cliquer sur les contrôles mette en pause */}
      <div 
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()} 
        onMouseEnter={handleControlsMouseEnter}
        onMouseLeave={handleMouseMove}
      >
        
        {/* PROGRESS BAR */}
        <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/progress">
          <div 
             className="absolute top-0 left-0 h-full bg-[#00CEC8] rounded-full" 
             style={{ width: `${progress}%` }} 
          />
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="0.1"
            value={progress} 
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
          />
          {/* Scrubber Knob */}
          <div 
             className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
             style={{ left: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-[#00CEC8] transition-colors">
              {isPlaying ? <Pause className="fill-current" size={24}/> : <Play className="fill-current" size={24}/>}
            </button>
            
            <div className="hidden md:flex items-center gap-2">
               <button onClick={(e) => skip(-10, e)} className="hover:text-[#00CEC8] transition-colors p-1"><SkipBack size={20}/></button>
               <button onClick={(e) => skip(10, e)} className="hover:text-[#00CEC8] transition-colors p-1"><SkipForward size={20}/></button>
            </div>

            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="hover:text-[#00CEC8]">
                {isMuted || volume === 0 ? <VolumeX size={20}/> : <Volume2 size={20}/>}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-lg accent-[#00CEC8] cursor-pointer ml-2"
                />
              </div>
            </div>

            <span className="text-xs font-mono text-neutral-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
             {title && <span className="text-sm font-medium text-neutral-300 hidden md:inline truncate max-w-[200px]">{title}</span>}
             <button className="hover:text-[#00CEC8] transition-colors"><Settings size={20}/></button>
             <button onClick={toggleFullscreen} className="hover:text-[#00CEC8] transition-colors">
               {isFullscreen ? <Minimize size={20}/> : <Maximize size={20}/>}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const UserInterface: React.FC<UserInterfaceProps> = ({ user, onLogout }) => {
  const [content, setContent] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  
  // Hero Slider State
  const [heroIndex, setHeroIndex] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [paymentProof, setPaymentProof] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Account Dashboard State
  const [showAccountDashboard, setShowAccountDashboard] = useState(false);
  const [activeAccountTab, setActiveAccountTab] = useState<'PROFILE' | 'SETTINGS' | 'PLAN' | 'BILLING' | 'NOTIFICATIONS'>('PROFILE');
  
  // Profile Form State
  const [profileName, setProfileName] = useState(user.name);
  const [profilePassword, setProfilePassword] = useState(user.password || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Request/Suggestion Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMovieName, setRequestMovieName] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  
  // Series Player State
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState<string>('');
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState<string>('');

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Community Link
  const [communityLink, setCommunityLink] = useState('');

  const isAdminPreview = user.id === 'admin-preview';
  const unreadNotificationsCount = user.notifications?.filter(n => !n.read).length || 0;

  // Get Top 10 (Latest added content reversed)
  const top10Content = [...content].reverse().slice(0, 10);

  // Search Logic
  const searchResults = searchQuery.length > 0 
    ? content.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    setContent(storageService.getContent());
    setCategories(storageService.getCategories());
    setCommunityLink(storageService.getCommunityLink());

    // PWA Install Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // Auto-scroll hero slider
  useEffect(() => {
    if (content.length <= 1 || searchQuery.length > 0) return; // Stop slider when searching
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % content.length);
    }, 8000); // Switch every 8 seconds
    return () => clearInterval(interval);
  }, [content, searchQuery]);

  // Update selected series video when opening modal
  useEffect(() => {
    if (selectedContent) {
      if (selectedContent.type === 'SERIES' && selectedContent.episodes && selectedContent.episodes.length > 0) {
        setCurrentEpisodeUrl(selectedContent.episodes[0].videoUrl);
        setCurrentEpisodeTitle(selectedContent.episodes[0].title);
      } else {
        setCurrentEpisodeUrl(selectedContent.videoUrl || '');
        setCurrentEpisodeTitle(selectedContent.title);
      }
    }
  }, [selectedContent]);

  const handleSubscribe = () => {
    if (!selectedPlan || !paymentProof) return;
    
    const updatedUser: User = {
      ...user,
      status: UserStatus.PENDING,
      plan: selectedPlan,
      paymentProof: paymentProof
    };
    storageService.updateUser(updatedUser);
    setHasSubmitted(true);
    setTimeout(() => {
      window.location.reload(); 
    }, 2000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminPreview) {
      setProfileMessage('Profile changes are disabled in Admin Preview Mode.');
      setTimeout(() => setProfileMessage(''), 3000);
      return;
    }

    const updatedUser: User = {
      ...user,
      name: profileName,
      password: profilePassword
    };
    storageService.updateUser(updatedUser);
    localStorage.setItem('vtv_current_user', JSON.stringify(updatedUser));
    setProfileMessage('Modifications enregistrées.');
    setTimeout(() => setProfileMessage(''), 3000);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (isAdminPreview) return;
     const file = e.target.files?.[0];
     if (file) {
        const imageUrl = URL.createObjectURL(file);
        const updatedUser: User = {
           ...user,
           profileImage: imageUrl
        };
        storageService.updateUser(updatedUser);
        localStorage.setItem('vtv_current_user', JSON.stringify(updatedUser));
        // Force update local state for immediate reflection
        window.location.reload(); 
     }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestMovieName) return;

    const newSuggestion: Suggestion = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      movieName: requestMovieName,
      date: new Date().toISOString(),
      status: 'PENDING'
    };
    storageService.addSuggestion(newSuggestion);
    setRequestSent(true);
    setTimeout(() => {
       setShowRequestModal(false);
       setRequestSent(false);
       setRequestMovieName('');
    }, 2000);
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("Pour installer l'application : \n1. Cliquez sur le menu du navigateur (3 points) \n2. Sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.");
    }
  };

  // 1. Pending State View
  if (user.status === UserStatus.PENDING) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-neutral-900 p-8 rounded-2xl max-w-lg w-full text-center space-y-6 border border-neutral-800">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold">Activation Pending</h2>
          <p className="text-neutral-400">
            Thank you for your payment. The administrator is currently reviewing your subscription request. 
            Access will be granted shortly.
          </p>
          <div className="p-4 bg-black rounded-lg text-sm">
            <p className="text-neutral-500 mb-1">Your Plan</p>
            <p className="font-bold text-white">{user.plan ? PLANS[user.plan].name : 'Unknown'}</p>
          </div>
          <button onClick={onLogout} className="text-[#00CEC8] hover:underline text-sm">Log Out</button>
        </div>
      </div>
    );
  }

  // 2. Guest/Unpaid State View (Show Plans)
  if (user.status === UserStatus.GUEST || (user.status as any) === 'BANNED') {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-black tracking-tighter logo-shine">VTV</h1>
          <div className="flex items-center space-x-4">
            <button onClick={handleInstallApp} className="flex items-center gap-2 px-4 py-2 bg-[#00CEC8]/20 text-[#00CEC8] rounded-lg font-bold hover:bg-[#00CEC8] hover:text-black transition-colors text-sm">
                <Laptop size={16} /> <span className="hidden md:inline">Installer App</span>
            </button>
            <button onClick={() => setShowAccountDashboard(true)} className="text-sm font-semibold hover:text-[#00CEC8]">Mon Compte</button>
            <button onClick={onLogout} className="text-sm font-semibold text-neutral-500 hover:text-white">Sign Out</button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto w-full">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Premium Content Awaits</h2>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl">
            Subscribe now to access our exclusive library of movies, series, and documentaries. 
            Validation is manual to ensure exclusive access.
          </p>

          {!showPaymentModal ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {(Object.keys(PLANS) as PlanType[]).map((planKey) => (
                <div key={planKey} className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 hover:border-[#00CEC8] transition-colors flex flex-col group">
                  <h3 className="text-xl font-bold text-neutral-200 mb-2">{PLANS[planKey].name}</h3>
                  <div className="text-3xl font-black text-[#00CEC8] mb-6">{PLANS[planKey].price}</div>
                  <ul className="text-left text-sm text-neutral-400 space-y-3 mb-8 flex-1">
                    <li className="flex items-center"><span className="w-2 h-2 bg-[#00CEC8] rounded-full mr-2"></span> HD Quality</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-[#00CEC8] rounded-full mr-2"></span> Unlimited Access</li>
                    {planKey === PlanType.PREMIUM && <li className="flex items-center"><span className="w-2 h-2 bg-[#00CEC8] rounded-full mr-2"></span> 4K Ultra HD</li>}
                    {planKey !== PlanType.BASIC && <li className="flex items-center"><span className="w-2 h-2 bg-[#00CEC8] rounded-full mr-2"></span> Multi-Device</li>}
                  </ul>
                  <button 
                    onClick={() => { setSelectedPlan(planKey); setShowPaymentModal(true); }}
                    className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 max-w-md w-full relative">
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
                <X size={24} />
              </button>
              
              {!hasSubmitted ? (
                <>
                   <h3 className="text-2xl font-bold mb-6 text-left">Complete Payment</h3>
                   <div className="space-y-4 text-left">
                     <div className="bg-black p-4 rounded-lg flex items-center justify-between">
                       <span className="text-neutral-400">Amount Due</span>
                       <span className="text-xl font-bold text-white">{selectedPlan ? PLANS[selectedPlan].price : ''}</span>
                     </div>
                     
                     <div>
                       <label className="block text-xs text-neutral-500 uppercase font-bold mb-2">Payment Method</label>
                       <div className="flex items-center space-x-3 bg-blue-900/20 p-4 rounded-lg border border-blue-900/50">
                         <Smartphone className="text-blue-500" />
                         <div>
                           <p className="font-bold text-blue-400">Mobile Money</p>
                           <p className="text-sm text-blue-300/70">{PAYMENT_NUMBER}</p>
                         </div>
                       </div>
                     </div>

                     <div>
                        <label className="block text-sm text-neutral-400 mb-1">Transaction ID / Phone Used</label>
                        <input 
                          value={paymentProof}
                          onChange={(e) => setPaymentProof(e.target.value)}
                          placeholder="e.g. 07 XX XX XX or Trans ID"
                          className="w-full bg-black border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-[#00CEC8]"
                        />
                        <p className="text-xs text-neutral-600 mt-1">Used for admin validation.</p>
                     </div>

                     <button 
                        onClick={handleSubscribe}
                        disabled={!paymentProof}
                        className="w-full py-4 bg-[#00CEC8] hover:bg-[#00b5b0] text-black font-bold rounded-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        Confirm Payment
                     </button>
                   </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Request Sent!</h3>
                  <p className="text-neutral-400 text-sm">Reloading...</p>
                </div>
              )}
            </div>
          )}
        </main>
        
        {/* Reuse Account Dashboard Modal for Guests too */}
        {showAccountDashboard && (
          <AccountDashboard 
            user={user}
            onClose={() => setShowAccountDashboard(false)}
            onLogout={onLogout}
            activeTab={activeAccountTab}
            setActiveTab={setActiveAccountTab}
            onUpdateProfile={handleUpdateProfile}
            profileName={profileName}
            setProfileName={setProfileName}
            profilePassword={profilePassword}
            setProfilePassword={setProfilePassword}
            profileMessage={profileMessage}
            isAdminPreview={isAdminPreview}
            onImageUpload={handleProfileImageUpload}
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            unreadCount={unreadNotificationsCount}
          />
        )}
      </div>
    );
  }

  // 3. Active Subscriber View
  return (
    <div className="min-h-screen pb-20">
      {isAdminPreview && (
        <div className="bg-[#00CEC8] text-black px-6 py-3 flex items-center justify-center space-x-2 sticky top-0 z-[60] font-medium shadow-lg">
          <ShieldAlert size={20} />
          <span>ADMIN PREVIEW MODE — You are viewing the client interface as a Premium User.</span>
          <button onClick={onLogout} className="bg-black/30 text-white px-3 py-1 rounded ml-4 hover:bg-black/50 text-sm">
            Exit Preview
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed ${isAdminPreview ? 'top-12' : 'top-0'} w-full z-50 bg-gradient-to-b from-black/90 to-transparent px-6 py-4 flex justify-between items-center`}>
        <div className="flex items-center gap-8">
           <div className="text-3xl font-black tracking-tighter drop-shadow-lg logo-shine cursor-pointer" onClick={() => setSearchQuery('')}>VTV</div>
           
           {/* SEARCH BAR */}
           <div className="hidden md:flex items-center bg-black/40 border border-neutral-700 rounded-full px-3 py-1.5 backdrop-blur-md focus-within:border-[#00CEC8] focus-within:bg-black/80 transition-all">
              <Search size={16} className="text-neutral-400" />
              <input 
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Rechercher un film, une série..."
                 className="bg-transparent border-none outline-none text-white text-sm ml-2 w-48 placeholder-neutral-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={14} className="text-neutral-400 hover:text-white"/>
                </button>
              )}
           </div>
        </div>

        {/* MOBILE SEARCH (Visible only on small screens) */}
        <div className="md:hidden flex items-center bg-black/40 border border-neutral-700 rounded-full px-3 py-1.5 mr-auto ml-4">
              <Search size={16} className="text-neutral-400" />
              <input 
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Rechercher..."
                 className="bg-transparent border-none outline-none text-white text-sm ml-2 w-24 placeholder-neutral-500"
              />
        </div>

        <div className="flex items-center space-x-4">
           {/* Community Link Button */}
           {communityLink && (
             <a 
               href={communityLink} 
               target="_blank" 
               rel="noreferrer"
               className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-full font-bold text-xs hover:bg-blue-500 transition-colors shadow-lg animate-pulse"
             >
               <Users size={14} />
               <span className="hidden md:inline">Communauté</span>
             </a>
           )}

           <button onClick={handleInstallApp} className="flex items-center space-x-2 px-3 py-1 bg-[#00CEC8] text-black rounded font-bold text-xs hover:bg-white transition-colors shadow-lg">
             <Download size={14} />
             <span className="hidden md:inline">Installer App</span>
           </button>

           <button onClick={() => setShowRequestModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold backdrop-blur-md transition-colors hidden md:flex">
             <MessageSquarePlus size={16} />
             <span>Request</span>
           </button>
           <button onClick={() => setShowAccountDashboard(true)} className="text-sm font-medium flex items-center space-x-3 hover:text-[#00CEC8] transition-colors group">
             <div className="relative">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-neutral-700 group-hover:border-[#00CEC8]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 group-hover:border-[#00CEC8]">
                    <UserIcon size={16} />
                  </div>
                )}
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#00CEC8] text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
             </div>
             <span className="hidden md:inline">{user.name}</span>
           </button>
        </div>
      </nav>

      {/* CONTENT AREA */}
      {searchQuery.length > 0 ? (
         /* SEARCH RESULTS VIEW */
         <div className="pt-32 px-6 md:px-12 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Search className="text-[#00CEC8]" />
              Résultats pour "{searchQuery}"
            </h2>
            {searchResults.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fade-in">
                  {searchResults.map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => setSelectedContent(item)}
                        className="aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:ring-2 ring-[#00CEC8] group relative"
                    >
                      <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col text-center p-2">
                          <Play className="fill-white text-white w-12 h-12 mb-2" />
                          <span className="text-xs font-bold">{item.title}</span>
                      </div>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="text-center py-20 text-neutral-500">
                  <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Search size={40} className="opacity-50"/>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Aucun résultat</h3>
                  <p>Essayez un autre titre ou genre.</p>
               </div>
            )}
         </div>
      ) : (
        /* STANDARD HOME VIEW */
        <>
          {/* Hero Carousel Slider */}
          {content.length > 0 ? (
            <header className="relative h-[70vh] flex items-end pb-24 px-6 md:px-12 overflow-hidden">
                {/* Background Items */}
                {content.map((item, index) => (
                   <div 
                      key={item.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                   >
                      {/* If current item has trailer, show muted video background, else poster */}
                      {index === heroIndex && item.trailerUrl ? (
                         <video 
                           src={item.trailerUrl} 
                           autoPlay muted loop playsInline 
                           className="w-full h-full object-cover opacity-60"
                         />
                      ) : (
                         <img 
                            src={item.posterUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover opacity-60" 
                         />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
                   </div>
                ))}

                {/* Foreground Info */}
                <div className="relative z-20 max-w-3xl transition-all duration-500 transform translate-y-0">
                   <span className="px-3 py-1 bg-[#00CEC8] text-black text-xs font-bold rounded mb-4 inline-block">
                     FEATURED
                   </span>
                   <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">{content[heroIndex].title}</h1>
                   <p className="text-lg text-neutral-300 line-clamp-3 mb-8 max-w-2xl">{content[heroIndex].description}</p>
                   <div className="flex space-x-4">
                     <button 
                        onClick={() => setSelectedContent(content[heroIndex])}
                        className="px-8 py-3 bg-white text-black font-bold rounded flex items-center hover:bg-neutral-200 transition-colors"
                     >
                        <Play className="fill-black mr-2" size={20} /> Watch Now
                     </button>
                     <button 
                        onClick={() => setSelectedContent(content[heroIndex])}
                        className="px-8 py-3 bg-neutral-600/50 backdrop-blur-md text-white font-bold rounded flex items-center hover:bg-neutral-600/70 transition-colors"
                     >
                        <Info className="mr-2" size={20} /> More Info
                     </button>
                   </div>
                </div>

                {/* Slider Indicators */}
                <div className="absolute bottom-8 right-8 z-20 flex space-x-2">
                   {content.map((_, idx) => (
                      <button 
                         key={idx}
                         onClick={() => setHeroIndex(idx)}
                         className={`h-1 rounded-full transition-all ${idx === heroIndex ? 'w-8 bg-[#00CEC8]' : 'w-4 bg-neutral-600 hover:bg-white'}`}
                      />
                   ))}
                </div>
            </header>
          ) : (
            <div className="h-screen flex items-center justify-center">
               <div className="text-center space-y-4">
                 <div className="text-6xl">📺</div>
                 <h2 className="text-2xl font-bold text-neutral-500">No Content Available</h2>
                 <p className="text-neutral-600">The administrator has not added any content yet.</p>
               </div>
            </div>
          )}

          {/* TOP 10 RANKING ROW */}
          {top10Content.length > 0 && (
             <div className="px-6 md:px-12 -mt-10 relative z-20 mb-12">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                   <TrendingUp className="text-[#00CEC8]" />
                   Top 10 des films et séries aujourd'hui
                </h3>
                <div className="flex overflow-x-auto pb-6 scrollbar-hide pl-4">
                   {top10Content.map((item, index) => (
                      <div 
                         key={item.id} 
                         onClick={() => setSelectedContent(item)}
                         className="relative flex-none flex items-end group cursor-pointer mr-2"
                      >
                         {/* Rank Number SVG */}
                         <svg 
                           width="160" 
                           height="220" 
                           viewBox="0 0 160 220" 
                           className="flex-none -mr-8 z-0 pointer-events-none"
                         >
                           <text 
                             x="50%" 
                             y="180" 
                             fontSize="220" 
                             fontWeight="900" 
                             textAnchor="middle" 
                             fill="#0a0a0a" 
                             stroke="#444" 
                             strokeWidth="4"
                             style={{ fontFamily: 'Inter, sans-serif' }}
                           >
                             {index + 1}
                           </text>
                         </svg>
                         
                         {/* Poster */}
                         <div className="w-[140px] h-[210px] rounded-lg overflow-hidden shadow-2xl z-10 transition-transform group-hover:scale-110 group-hover:z-20 border border-neutral-800">
                            <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="fill-white text-white w-10 h-10" />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* Categories Rows */}
          <div className="px-6 md:px-12 space-y-12 relative z-20">
            
            {/* If no categories, show generic "All Content" */}
            {categories.length === 0 && content.length > 0 && (
               <div>
                 <h3 className="text-xl font-bold mb-4 text-white">All Movies & Series</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                   {content.map(item => (
                     <div 
                        key={item.id} 
                        onClick={() => setSelectedContent(item)}
                        className="aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:ring-2 ring-[#00CEC8] group relative"
                     >
                       <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="fill-white text-white w-12 h-12" />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {/* Categorized Content */}
            {categories.map(cat => {
               const catContent = content.filter(c => c.categoryId === cat.id);
               if (catContent.length === 0) return null;
               
               return (
                 <div key={cat.id}>
                    <h3 className="text-xl font-bold mb-4 text-white">{cat.name}</h3>
                    <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                      {catContent.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedContent(item)}
                            className="flex-none w-[160px] md:w-[200px] aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:ring-2 ring-[#00CEC8] group relative"
                        >
                          <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="fill-white text-white w-12 h-12" />
                          </div>
                          {item.type === 'SERIES' && (
                             <div className="absolute top-2 left-2 bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">SERIES</div>
                          )}
                        </div>
                      ))}
                    </div>
                 </div>
               );
            })}
          </div>
        </>
      )}

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-neutral-900 rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-neutral-800 shadow-2xl relative flex flex-col">
              <button onClick={() => setSelectedContent(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full hover:bg-white hover:text-black transition-colors">
                <X size={24} />
              </button>

              {/* CUSTOM PLAYER INTEGRATION */}
              <div className="relative aspect-video bg-black w-full shrink-0">
                 {currentEpisodeUrl ? (
                    <CustomVideoPlayer 
                      key={currentEpisodeUrl}
                      src={currentEpisodeUrl} 
                      title={currentEpisodeTitle || selectedContent.title}
                      autoPlay={true}
                      poster={selectedContent.posterUrl}
                    />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                      <div className="text-center text-neutral-500">
                         <Play size={48} className="mx-auto mb-2 opacity-50"/>
                         <p>Source vidéo indisponible.</p>
                      </div>
                   </div>
                 )}
              </div>
              
              {/* Series Episode Selector */}
              {selectedContent.type === 'SERIES' && selectedContent.episodes && (
                 <div className="bg-neutral-800 p-4 border-b border-neutral-700">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase mb-2">Episodes</h3>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                       {selectedContent.episodes.map((ep, idx) => (
                          <button 
                             key={ep.id}
                             onClick={() => {
                                setCurrentEpisodeUrl(ep.videoUrl);
                                setCurrentEpisodeTitle(ep.title);
                             }}
                             className={`flex-none px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${currentEpisodeUrl === ep.videoUrl ? 'bg-[#00CEC8] text-black' : 'bg-black text-neutral-400 hover:bg-neutral-700'}`}
                          >
                             <Play size={14} className={currentEpisodeUrl === ep.videoUrl ? 'fill-black' : 'fill-current'}/>
                             <span className="opacity-50">{idx + 1}.</span> {ep.title}
                          </button>
                       ))}
                       {selectedContent.episodes.length === 0 && <p className="text-sm text-neutral-500">No episodes uploaded yet.</p>}
                    </div>
                    {currentEpisodeTitle && <p className="mt-2 text-sm text-white font-semibold flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> Lecture : {currentEpisodeTitle}</p>}
                 </div>
              )}

              <div className="p-8">
                 <div className="flex items-center space-x-4 mb-4">
                    <h2 className="text-4xl font-bold">{selectedContent.title}</h2>
                    <span className="px-3 py-1 bg-neutral-800 rounded text-sm font-bold text-green-400">{selectedContent.rating} Match</span>
                    <span className="text-neutral-400">{selectedContent.releaseYear}</span>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                       <p className="text-lg text-neutral-300 leading-relaxed mb-6">{selectedContent.description}</p>
                       
                       {/* Cast Section with Photos */}
                       <div className="mb-6">
                         <h4 className="font-bold text-white mb-3">Cast</h4>
                         <div className="flex flex-wrap gap-4">
                           {selectedContent.cast.map((actor, idx) => {
                             // Check if actor is a string (legacy data) or object
                             const actorName = typeof actor === 'string' ? actor : actor.name;
                             const actorImage = typeof actor === 'string' 
                                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(actor)}&background=random` 
                                : actor.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=random`;

                             return (
                               <div key={idx} className="flex flex-col items-center space-y-2 w-20 text-center">
                                  <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700">
                                    <img src={actorImage} alt={actorName} className="w-full h-full object-cover" />
                                  </div>
                                  <span className="text-xs text-neutral-400 line-clamp-2">{actorName}</span>
                               </div>
                             );
                           })}
                           {selectedContent.cast.length === 0 && <span className="text-neutral-500 text-sm">No cast info available.</span>}
                         </div>
                       </div>
                    </div>
                    <div className="space-y-4 text-sm text-neutral-400">
                       <div>
                          <span className="block text-neutral-600 font-bold mb-1">Genres:</span>
                          <span className="text-white">{selectedContent.genres.join(', ')}</span>
                       </div>
                       <div>
                          <span className="block text-neutral-600 font-bold mb-1">Category:</span>
                          <span className="text-white">
                             {categories.find(c => c.id === selectedContent.categoryId)?.name || 'Uncategorized'}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Request Content Modal */}
      {showRequestModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 p-8 rounded-2xl max-w-md w-full border border-neutral-800 relative">
               <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
                 <X size={24} />
               </button>
               
               <h3 className="text-2xl font-bold mb-2">Request Content</h3>
               <p className="text-neutral-400 mb-6 text-sm">Suggest a movie or series you'd like to see on VTV.</p>

               {!requestSent ? (
                 <form onSubmit={handleSubmitRequest}>
                    <label className="block text-sm text-neutral-400 mb-1">Movie / Series Name</label>
                    <input 
                       value={requestMovieName}
                       onChange={(e) => setRequestMovieName(e.target.value)}
                       placeholder="e.g. Avengers: Secret Wars"
                       className="w-full bg-black border border-neutral-700 rounded p-3 focus:border-[#00CEC8] mb-4"
                       autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={!requestMovieName}
                      className="w-full py-3 bg-[#00CEC8] hover:bg-[#00b5b0] text-black font-bold rounded disabled:opacity-50"
                    >
                       Submit Request
                    </button>
                 </form>
               ) : (
                 <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                       <MessageSquarePlus size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-white">Request Received!</h4>
                    <p className="text-neutral-400 text-sm mt-2">We'll do our best to add it.</p>
                 </div>
               )}
            </div>
         </div>
      )}

      {/* NEW Account Dashboard Modal */}
       {showAccountDashboard && (
          <AccountDashboard 
            user={user}
            onClose={() => setShowAccountDashboard(false)}
            onLogout={onLogout}
            activeTab={activeAccountTab}
            setActiveTab={setActiveAccountTab}
            onUpdateProfile={handleUpdateProfile}
            profileName={profileName}
            setProfileName={setProfileName}
            profilePassword={profilePassword}
            setProfilePassword={setProfilePassword}
            profileMessage={profileMessage}
            isAdminPreview={isAdminPreview}
            onImageUpload={handleProfileImageUpload}
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            unreadCount={unreadNotificationsCount}
          />
        )}
    </div>
  );
};

// Helper component for the User Account Dashboard
const AccountDashboard: React.FC<{
   user: User, 
   onClose: () => void,
   onLogout: () => void,
   activeTab: 'PROFILE' | 'SETTINGS' | 'PLAN' | 'BILLING' | 'NOTIFICATIONS',
   setActiveTab: (t: 'PROFILE' | 'SETTINGS' | 'PLAN' | 'BILLING' | 'NOTIFICATIONS') => void,
   onUpdateProfile: (e: React.FormEvent) => void,
   profileName: string,
   setProfileName: (s: string) => void,
   profilePassword: string,
   setProfilePassword: (s: string) => void,
   profileMessage: string,
   isAdminPreview: boolean,
   onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
   notificationsEnabled: boolean,
   setNotificationsEnabled: (b: boolean) => void,
   unreadCount: number
}> = ({ 
   user, onClose, onLogout, activeTab, setActiveTab, onUpdateProfile, 
   profileName, setProfileName, profilePassword, setProfilePassword, 
   profileMessage, isAdminPreview, onImageUpload, notificationsEnabled, setNotificationsEnabled, unreadCount
}) => {
   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
       <div className="bg-neutral-900 w-full max-w-4xl h-[600px] rounded-2xl border border-neutral-800 flex overflow-hidden relative shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white z-10">
            <X size={24} />
          </button>

          {/* Sidebar */}
          <div className="w-64 bg-black border-r border-neutral-800 p-6 flex flex-col">
             <div className="mb-8 text-center">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-neutral-800 border-2 border-neutral-700 mb-3">
                   {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center"><UserIcon size={32} className="text-neutral-600"/></div>
                   )}
                </div>
                <h3 className="font-bold truncate">{user.name}</h3>
                <p className="text-xs text-neutral-500">{user.email}</p>
             </div>

             <nav className="space-y-2 flex-1">
                <button onClick={() => setActiveTab('PROFILE')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'PROFILE' ? 'bg-[#00CEC8] text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                   <UserIcon size={18} /> <span>Profil / Mon compte</span>
                </button>
                 <button onClick={() => setActiveTab('NOTIFICATIONS')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'NOTIFICATIONS' ? 'bg-[#00CEC8] text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                   <div className="relative">
                      <Bell size={18} />
                      {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></span>}
                   </div>
                   <span>Notifications</span>
                </button>
                <button onClick={() => setActiveTab('SETTINGS')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'SETTINGS' ? 'bg-[#00CEC8] text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                   <KeyRound size={18} /> <span>Paramètres / Réglages</span>
                </button>
                <button onClick={() => setActiveTab('PLAN')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'PLAN' ? 'bg-[#00CEC8] text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                   <CreditCard size={18} /> <span>Abonnement / Plan</span>
                </button>
                <button onClick={() => setActiveTab('BILLING')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'BILLING' ? 'bg-[#00CEC8] text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                   <FileText size={18} /> <span>Paiement / Facturation</span>
                </button>
             </nav>

             <div className="pt-4 border-t border-neutral-800 mt-2">
                <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-900/10 transition-colors">
                   <LogOut size={18} /> <span>Déconnexion</span>
                </button>
             </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
             {profileMessage && <div className="mb-6 p-3 bg-green-500/20 text-green-500 rounded text-sm">{profileMessage}</div>}

             {/* PROFILE TAB */}
             {activeTab === 'PROFILE' && (
                <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Informations personnelles</h2>
                   <div className="flex items-center gap-6 pb-6 border-b border-neutral-800">
                      <div className="relative group cursor-pointer">
                         <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-800">
                            {user.profileImage ? (
                               <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center"><UserIcon size={40} className="text-neutral-600"/></div>
                            )}
                         </div>
                         <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={24} className="text-white"/>
                         </div>
                         <input type="file" accept="image/*" onChange={onImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <div>
                         <h3 className="font-bold">Photo de profil</h3>
                         <p className="text-sm text-neutral-500">PNG ou JPG. Max 5MB.</p>
                      </div>
                   </div>

                   <form onSubmit={onUpdateProfile} className="space-y-4 max-w-md">
                      <div>
                         <label className="block text-sm text-neutral-400 mb-1">Nom complet</label>
                         <input 
                           value={profileName} 
                           onChange={(e) => setProfileName(e.target.value)}
                           className="w-full bg-black border border-neutral-700 rounded p-3 focus:border-[#00CEC8]"
                         />
                      </div>
                      <div>
                         <label className="block text-sm text-neutral-400 mb-1">Email</label>
                         <input value={user.email} disabled className="w-full bg-neutral-800 border border-neutral-800 rounded p-3 text-neutral-500 cursor-not-allowed" />
                      </div>
                      <button type="submit" className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-neutral-200">Enregistrer</button>
                   </form>
                </div>
             )}

             {/* NOTIFICATIONS TAB */}
             {activeTab === 'NOTIFICATIONS' && (
               <div className="space-y-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2"><Bell /> Notifications</h2>
                  <div className="space-y-3">
                     {user.notifications && user.notifications.length > 0 ? (
                        [...user.notifications].reverse().map((note) => (
                           <div key={note.id} className={`p-4 rounded-lg border flex gap-3 ${
                             note.type === 'SUCCESS' ? 'bg-green-900/10 border-green-900' : 
                             note.type === 'WARNING' ? 'bg-orange-900/10 border-orange-900' : 
                             'bg-neutral-800 border-neutral-700'
                           }`}>
                              <div className={`mt-1 ${
                                 note.type === 'SUCCESS' ? 'text-green-500' : 
                                 note.type === 'WARNING' ? 'text-orange-500' : 'text-blue-500'
                              }`}>
                                 {note.type === 'SUCCESS' ? <ShieldAlert size={20}/> : <Info size={20}/>}
                              </div>
                              <div>
                                 <h4 className="font-bold text-sm text-white">{note.title}</h4>
                                 <p className="text-neutral-400 text-sm mt-1">{note.message}</p>
                                 <p className="text-xs text-neutral-600 mt-2">{new Date(note.date).toLocaleDateString()} à {new Date(note.date).toLocaleTimeString()}</p>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="text-center py-12 text-neutral-500">
                           <Inbox size={48} className="mx-auto mb-3 opacity-50"/>
                           <p>Aucune notification.</p>
                        </div>
                     )}
                  </div>
               </div>
             )}

             {/* SETTINGS TAB */}
             {activeTab === 'SETTINGS' && (
                <div className="space-y-8">
                   <h2 className="text-2xl font-bold">Paramètres du compte</h2>
                   
                   <div className="space-y-4 max-w-md">
                      <h3 className="text-lg font-semibold flex items-center gap-2"><KeyRound size={18} /> Sécurité</h3>
                      <div>
                         <label className="block text-sm text-neutral-400 mb-1">Nouveau mot de passe</label>
                         <input 
                            type="password"
                            value={profilePassword} 
                            onChange={(e) => setProfilePassword(e.target.value)}
                            className="w-full bg-black border border-neutral-700 rounded p-3 focus:border-[#00CEC8]"
                         />
                      </div>
                      <button onClick={onUpdateProfile} className="bg-[#00CEC8] text-black font-bold px-6 py-2 rounded hover:bg-[#00b5b0] text-sm">Mettre à jour le mot de passe</button>
                   </div>

                   <div className="border-t border-neutral-800 pt-6 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2"><Bell size={18} /> Notifications</h3>
                      <div className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg">
                         <div>
                            <p className="font-medium">Notifications par email</p>
                            <p className="text-xs text-neutral-500">Recevoir des nouvelles sorties et offres.</p>
                         </div>
                         <div 
                           onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                           className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-neutral-600'}`}
                         >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                         </div>
                      </div>
                   </div>

                   <div className="border-t border-neutral-800 pt-6 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-red-500"><LogOut size={18} /> Zone de danger</h3>
                      <div className="bg-neutral-800 p-4 rounded-lg flex items-center justify-between">
                         <div>
                            <p className="font-medium">Se déconnecter</p>
                            <p className="text-xs text-neutral-500">Terminer la session actuelle sur cet appareil.</p>
                         </div>
                         <button onClick={onLogout} className="px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20 rounded text-sm font-bold transition-colors">
                            Déconnexion
                         </button>
                      </div>
                   </div>
                </div>
             )}

             {/* PLAN TAB */}
             {activeTab === 'PLAN' && (
                <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Mon Abonnement</h2>
                   
                   <div className="bg-gradient-to-r from-[#00CEC8]/40 to-black border border-[#00CEC8] p-6 rounded-xl">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="text-neutral-400 text-sm uppercase font-bold mb-1">Plan Actuel</p>
                            <h3 className="text-3xl font-black text-white mb-2">{user.plan ? PLANS[user.plan].name : 'Aucun'}</h3>
                            <p className="text-green-500 font-medium flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Actif</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-bold">{user.plan ? PLANS[user.plan].price : '0 FCA'}</p>
                            <p className="text-neutral-500 text-xs">/ mois</p>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-800 p-4 rounded-lg">
                         <p className="text-neutral-500 text-xs mb-1">Date de début</p>
                         <p className="font-medium">{user.subscriptionStart ? new Date(user.subscriptionStart).toLocaleDateString() : new Date(user.dateJoined).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-neutral-800 p-4 rounded-lg">
                         <p className="text-neutral-500 text-xs mb-1">Expiration</p>
                         <p className="font-medium text-red-400">
                           {user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString() : "N/A"}
                         </p>
                      </div>
                   </div>

                   <button className="w-full py-3 border border-neutral-700 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                      Changer de plan
                   </button>
                </div>
             )}

             {/* BILLING TAB */}
             {activeTab === 'BILLING' && (
                <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Facturation</h2>
                   
                   <div className="space-y-4">
                      <h3 className="font-semibold text-neutral-400 text-sm uppercase">Moyen de paiement</h3>
                      <div className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                         <div className="flex items-center gap-3">
                            <div className="bg-blue-900/30 p-2 rounded text-blue-400"><Smartphone size={24} /></div>
                            <div>
                               <p className="font-bold">Mobile Money</p>
                               <p className="text-xs text-neutral-500">{PAYMENT_NUMBER}</p>
                            </div>
                         </div>
                         <button className="text-sm text-[#00CEC8] font-medium hover:underline">Modifier</button>
                      </div>
                   </div>

                   <div className="space-y-4 pt-4">
                      <h3 className="font-semibold text-neutral-400 text-sm uppercase">Historique des factures</h3>
                      {/* Mock Invoice Data */}
                      <div className="space-y-2">
                         {[1].map((_, i) => (
                            <div key={i} className="flex items-center justify-between bg-black p-4 rounded hover:bg-neutral-900 transition-colors">
                               <div>
                                  <p className="font-medium text-sm">Renouvellement Mensuel - {user.plan || 'Premium'}</p>
                                  <p className="text-xs text-neutral-500">{new Date().toLocaleDateString()}</p>
                               </div>
                               <div className="flex items-center gap-4">
                                  <span className="font-bold">{user.plan ? PLANS[user.plan].price : '0 FCA'}</span>
                                  <button className="p-2 text-neutral-400 hover:text-white" title="Télécharger PDF">
                                     <Download size={18} />
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
   );
};

export default UserInterface;
