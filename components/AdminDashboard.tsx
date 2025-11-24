
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { generateContentMetadata } from '../services/gemini';
import { downloadProjectZip } from '../services/codeExport';
import { Content, Category, User, UserStatus, PlanType, Actor, Episode, Suggestion, DesignAsset, Notification } from '../types';
import { 
  LayoutDashboard, Film, Users, Layers, Settings, Plus, 
  Trash2, CheckCircle, XCircle, RefreshCw, Upload, Sparkles, LogOut, ExternalLink, Clapperboard, User as UserIcon, X, MessageSquare, Phone, Power, Image as ImageIcon, Calendar, Clock, BellRing, Ban, Share2, Copy, Check, Globe, FileCode, Search, CloudLightning, ShieldCheck, Download, Link as LinkIcon, AlertCircle, MonitorPlay
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  currentTheme: string;
  onUpdateTheme: (t: string) => void;
  onExit: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentTheme, onUpdateTheme, onExit }) => {
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'USERS' | 'CATEGORIES' | 'DESIGN' | 'THEME' | 'REQUESTS'>('CONTENT');
  const [content, setContent] = useState<Content[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [designAssets, setDesignAssets] = useState<DesignAsset[]>([]);
  
  // Content Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState<Partial<Content>>({
    type: 'MOVIE',
    cast: [],
    genres: [],
    episodes: []
  });
  
  // Series Episode Management
  const [showEpisodeManager, setShowEpisodeManager] = useState(false);
  const [currentEpisodes, setCurrentEpisodes] = useState<Episode[]>([]);
  const [newEpisode, setNewEpisode] = useState<Partial<Episode>>({});

  // Cast Management State
  const [castInput, setCastInput] = useState('');
  const [castImageInput, setCastImageInput] = useState('');

  // Category Form State
  const [newCategory, setNewCategory] = useState('');

  // Design Asset Form State
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState<'BACKGROUND' | 'LOGO'>('BACKGROUND');

  // Community Link
  const [communityLink, setCommunityLink] = useState('');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  
  // SEO / Share Modal
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setContent(storageService.getContent());
    setUsers(storageService.getUsers());
    setCategories(storageService.getCategories());
    setSuggestions(storageService.getSuggestions());
    setDesignAssets(storageService.getDesignAssets());
    setCommunityLink(storageService.getCommunityLink());
  };

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContent.title && newContent.posterUrl) {
      const contentItem: Content = {
        id: crypto.randomUUID(),
        title: newContent.title,
        description: newContent.description || '',
        posterUrl: newContent.posterUrl,
        videoUrl: newContent.videoUrl || '',
        trailerUrl: newContent.trailerUrl || '',
        cast: newContent.cast || [],
        genres: newContent.genres || [],
        rating: newContent.rating || 'N/A',
        releaseYear: newContent.releaseYear || new Date().getFullYear().toString(),
        type: newContent.type || 'MOVIE',
        categoryId: newContent.categoryId,
        episodes: newContent.type === 'SERIES' ? currentEpisodes : undefined
      };
      
      storageService.addContent(contentItem);
      setShowAddModal(false);
      setNewContent({ type: 'MOVIE', cast: [], genres: [], episodes: [] });
      setCurrentEpisodes([]);
      loadData();
    }
  };

  const handleAddEpisode = () => {
    if (newEpisode.title && newEpisode.videoUrl) {
      const episode: Episode = {
        id: crypto.randomUUID(),
        title: newEpisode.title,
        videoUrl: newEpisode.videoUrl,
        duration: newEpisode.duration
      };
      setCurrentEpisodes([...currentEpisodes, episode]);
      setNewEpisode({});
    }
  };

  const handleRemoveEpisode = (id: string) => {
    setCurrentEpisodes(currentEpisodes.filter(ep => ep.id !== id));
  };

  const handleDeleteContent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      storageService.deleteContent(id);
      loadData();
    }
  };

  const handleValidateUser = (user: User) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // +30 Jours

    const updatedUser: User = { 
      ...user, 
      status: UserStatus.ACTIVE,
      plan: user.plan || PlanType.PREMIUM, // Default to Premium if not set
      subscriptionStart: startDate.toISOString(),
      subscriptionEnd: endDate.toISOString(),
      notifications: [
        ...(user.notifications || []),
        {
          id: crypto.randomUUID(),
          title: 'Abonnement Activé ✅',
          message: 'Votre abonnement est maintenant actif pour 30 jours. Profitez de VTV !',
          date: new Date().toISOString(),
          read: false,
          type: 'SUCCESS'
        }
      ]
    };
    storageService.updateUser(updatedUser);
    loadData();
  };

  const handleDeactivateUser = (user: User) => {
     if(confirm("Voulez-vous vraiment désactiver cet utilisateur immédiatement ?")) {
        const updatedUser: User = {
           ...user,
           status: UserStatus.BANNED,
           notifications: [
              ...(user.notifications || []),
              {
                 id: crypto.randomUUID(),
                 title: 'Abonnement Suspendu 🛑',
                 message: "L'administrateur a suspendu votre accès. Contactez le support.",
                 date: new Date().toISOString(),
                 read: false,
                 type: 'WARNING'
              }
           ]
        };
        storageService.updateUser(updatedUser);
        loadData();
     }
  };

  const handleSendReminder = (user: User) => {
     const updatedUser: User = {
        ...user,
        notifications: [
           ...(user.notifications || []),
           {
              id: crypto.randomUUID(),
              title: 'Expiration Imminente ⏳',
              message: "Votre abonnement expire dans moins de 3 jours. Pensez à renouveler !",
              date: new Date().toISOString(),
              read: false,
              type: 'WARNING'
           }
        ]
     };
     storageService.updateUser(updatedUser);
     alert("Rappel envoyé à " + user.name);
     loadData();
  };

  const handleDeleteSuggestion = (id: string) => {
     storageService.deleteSuggestion(id);
     loadData();
  };

  const handleGenerateAI = async () => {
    if (!newContent.title || !newContent.type) return;
    setIsGenerating(true);
    const metadata = await generateContentMetadata(newContent.title, newContent.type);
    if (metadata) {
      setNewContent(prev => ({
        ...prev,
        description: metadata.synopsis,
        cast: metadata.cast.map((name: string) => ({ name })), // Convert string array to object array
        genres: metadata.genres,
        rating: metadata.rating,
        releaseYear: metadata.releaseYear
      }));
    }
    setIsGenerating(false);
  };

  const handleAddCastMember = () => {
    if (castInput) {
      const newActor: Actor = {
        name: castInput,
        imageUrl: castImageInput || undefined
      };
      setNewContent(prev => ({
        ...prev,
        cast: [...(prev.cast || []), newActor]
      }));
      setCastInput('');
      setCastImageInput('');
    }
  };

  const handleRemoveCastMember = (index: number) => {
    setNewContent(prev => ({
      ...prev,
      cast: (prev.cast || []).filter((_, i) => i !== index)
    }));
  };

  // Helper to check for expiring subscriptions (less than 3 days)
  const isExpiringSoon = (dateStr?: string) => {
     if (!dateStr) return false;
     const end = new Date(dateStr).getTime();
     const now = new Date().getTime();
     const diffDays = (end - now) / (1000 * 3600 * 24);
     return diffDays > 0 && diffDays <= 3;
  };

  const handleSaveCommunityLink = () => {
    storageService.setCommunityLink(communityLink);
    alert('Lien de communauté mis à jour !');
  };

  const handleDownloadZip = async () => {
    if (confirm("Voulez-vous télécharger le code source complet du site (HTML/CSS/JS) prêt à l'emploi ?")) {
       await downloadProjectZip();
    }
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-neutral-800 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="text-2xl font-black text-[#00CEC8] tracking-tighter logo-shine">VTV</div>
             <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">ADMIN</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('CONTENT')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'CONTENT' ? 'bg-[#00CEC8] text-black shadow-[0_0_15px_rgba(0,206,200,0.3)]' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <Film size={20} />
            <span>Contenu</span>
          </button>
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'USERS' ? 'bg-[#00CEC8] text-black shadow-[0_0_15px_rgba(0,206,200,0.3)]' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <Users size={20} />
            <span>Abonnés</span>
            {users.some(u => u.status === UserStatus.PENDING) && (
              <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('REQUESTS')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'REQUESTS' ? 'bg-[#00CEC8] text-black shadow-[0_0_15px_rgba(0,206,200,0.3)]' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <MessageSquare size={20} />
            <span>Demandes</span>
            {suggestions.length > 0 && (
               <span className="ml-auto bg-neutral-700 text-white text-[10px] px-1.5 rounded-full">{suggestions.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('CATEGORIES')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'CATEGORIES' ? 'bg-[#00CEC8] text-black shadow-[0_0_15px_rgba(0,206,200,0.3)]' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <Layers size={20} />
            <span>Catégories</span>
          </button>
          <button 
            onClick={() => setActiveTab('DESIGN')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'DESIGN' ? 'bg-[#00CEC8] text-black shadow-[0_0_15px_rgba(0,206,200,0.3)]' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <ImageIcon size={20} />
            <span>Design</span>
          </button>
          <button 
            onClick={() => setActiveTab('THEME')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'THEME' ? 'bg-[#00CEC8] text-black shadow-[0_0_15px_rgba(0,206,200,0.3)]' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <Settings size={20} />
            <span>Customisation</span>
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-2">
          <button 
            onClick={onExit}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold text-white hover:bg-neutral-800 transition-all border border-neutral-700 hover:border-[#00CEC8]"
          >
             <MonitorPlay size={20} className="text-[#00CEC8]" />
             <span>Voir le Site (Client)</span>
          </button>

          <button 
            onClick={handleDownloadZip}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold text-white hover:bg-neutral-800 transition-all border border-neutral-700 hover:bg-[#00CEC8] hover:text-black"
          >
            <Download size={20} />
            <span>Télécharger Code (ZIP)</span>
          </button>

          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold text-red-500 hover:bg-red-900/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-neutral-900 relative">
        <div className="p-8 max-w-7xl mx-auto">
          
          {/* CONTENT TAB */}
          {activeTab === 'CONTENT' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-neutral-800 backdrop-blur-sm sticky top-0 z-10">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">Bibliothèque</h2>
                  <p className="text-neutral-400 text-sm">Gérez vos films et séries.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#00CEC8] hover:bg-[#00b5b0] text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,206,200,0.2)]"
                >
                  <Plus size={20} /> Ajouter Contenu
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.map(item => (
                  <div key={item.id} className="group bg-black rounded-xl overflow-hidden border border-neutral-800 hover:border-[#00CEC8] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,206,200,0.1)]">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60"></div>
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.type === 'MOVIE' ? 'bg-blue-600' : 'bg-purple-600'} text-white`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm gap-2">
                         <button onClick={() => handleDeleteContent(item.id)} className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 transform hover:scale-110 transition-all">
                           <Trash2 size={20} />
                         </button>
                         <button className="p-3 bg-white rounded-full text-black hover:bg-neutral-200 transform hover:scale-110 transition-all">
                           <Settings size={20} />
                         </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg truncate text-white group-hover:text-[#00CEC8] transition-colors">{item.title}</h3>
                      <div className="flex justify-between items-center mt-2 text-sm text-neutral-500">
                         <span>{item.releaseYear}</span>
                         <span>{item.rating} ★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'USERS' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-neutral-800">
                <div>
                   <h2 className="text-3xl font-black text-white mb-1">Abonnements</h2>
                   <p className="text-neutral-400 text-sm">Validez les paiements et gérez les accès.</p>
                </div>
                <div className="flex gap-4">
                   <div className="text-right">
                      <p className="text-2xl font-black text-[#00CEC8]">{users.filter(u => u.status === UserStatus.ACTIVE).length}</p>
                      <p className="text-xs text-neutral-500 font-bold uppercase">Actifs</p>
                   </div>
                   <div className="text-right border-l border-neutral-800 pl-4">
                      <p className="text-2xl font-black text-yellow-500">{users.filter(u => u.status === UserStatus.PENDING).length}</p>
                      <p className="text-xs text-neutral-500 font-bold uppercase">En Attente</p>
                   </div>
                </div>
              </div>

              <div className="bg-black rounded-xl border border-neutral-800 overflow-hidden shadow-xl">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-neutral-900/50 text-xs uppercase text-neutral-500 font-bold">
                          <tr>
                             <th className="p-5">Client</th>
                             <th className="p-5">Formule</th>
                             <th className="p-5">Paiement / Info</th>
                             <th className="p-5">Expiration</th>
                             <th className="p-5 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-neutral-800">
                          {users.map(u => (
                             <tr key={u.id} className="hover:bg-neutral-900/50 transition-colors group">
                                <td className="p-5">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-[#00CEC8] font-bold">
                                         {u.name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="font-bold text-white group-hover:text-[#00CEC8] transition-colors">{u.name}</p>
                                         <p className="text-xs text-neutral-500">{u.email}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-5">
                                   {u.plan ? (
                                     <span className="px-2 py-1 bg-[#00CEC8]/10 text-[#00CEC8] border border-[#00CEC8]/20 rounded text-xs font-bold">
                                       {u.plan}
                                     </span>
                                   ) : (
                                     <span className="text-neutral-600 text-xs">Aucun</span>
                                   )}
                                </td>
                                <td className="p-5">
                                   {u.paymentProof ? (
                                      <div className="flex items-center gap-2 text-green-400 bg-green-900/10 px-2 py-1 rounded max-w-fit">
                                         <Phone size={14} />
                                         <span className="font-mono font-bold text-sm">{u.paymentProof}</span>
                                      </div>
                                   ) : (
                                      <span className="text-neutral-600 text-xs">En attente</span>
                                   )}
                                </td>
                                <td className="p-5">
                                   {u.subscriptionEnd ? (
                                      <div className={`text-sm font-bold flex items-center gap-2 ${isExpiringSoon(u.subscriptionEnd) ? 'text-orange-500' : 'text-neutral-400'}`}>
                                         {isExpiringSoon(u.subscriptionEnd) && <AlertCircle size={14} />}
                                         {new Date(u.subscriptionEnd).toLocaleDateString()}
                                      </div>
                                   ) : (
                                      <span className="text-neutral-600">-</span>
                                   )}
                                </td>
                                <td className="p-5 text-right">
                                   <div className="flex justify-end items-center gap-2">
                                      {u.status !== UserStatus.ACTIVE ? (
                                         <button 
                                            onClick={() => handleValidateUser(u)}
                                            className="px-4 py-2 bg-[#00CEC8] hover:bg-[#00b5b0] text-black font-bold rounded flex items-center gap-2 shadow-[0_0_10px_rgba(0,206,200,0.3)] transition-all transform hover:scale-105"
                                         >
                                            <CheckCircle size={16} /> VALIDER
                                         </button>
                                      ) : (
                                         <div className="flex gap-2">
                                            {isExpiringSoon(u.subscriptionEnd) && (
                                               <button onClick={() => handleSendReminder(u)} className="p-2 bg-orange-500/10 text-orange-500 rounded hover:bg-orange-500 hover:text-white" title="Envoyer Rappel">
                                                  <BellRing size={18} />
                                               </button>
                                            )}
                                            <button 
                                               onClick={() => handleDeactivateUser(u)}
                                               className="px-3 py-2 bg-neutral-800 text-red-500 font-bold text-xs rounded border border-red-900/30 hover:bg-red-900/20 hover:border-red-500 transition-colors"
                                            >
                                               DÉSACTIVER
                                            </button>
                                         </div>
                                      )}
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'REQUESTS' && (
             <div className="space-y-6 animate-fade-in">
               <h2 className="text-3xl font-black text-white mb-6">Suggestions Clients</h2>
               <div className="grid gap-4">
                  {suggestions.length > 0 ? (
                     suggestions.map(s => (
                        <div key={s.id} className="bg-black border border-neutral-800 p-6 rounded-xl flex items-center justify-between group hover:border-[#00CEC8] transition-colors">
                           <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-[#00CEC8] transition-colors">{s.movieName}</h3>
                              <p className="text-neutral-400 text-sm mt-1">Demandé par <span className="text-white font-bold">{s.userName}</span> le {new Date(s.date).toLocaleDateString()}</p>
                           </div>
                           <div className="flex gap-3">
                              <button className="p-3 bg-neutral-800 rounded-lg text-white hover:bg-[#00CEC8] hover:text-black transition-colors" title="Marquer comme Ajouté">
                                 <Check size={20} />
                              </button>
                              <button onClick={() => handleDeleteSuggestion(s.id)} className="p-3 bg-neutral-800 rounded-lg text-white hover:bg-red-600 transition-colors" title="Supprimer">
                                 <Trash2 size={20} />
                              </button>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-20 bg-black rounded-xl border border-neutral-800 border-dashed">
                        <MessageSquare size={48} className="mx-auto text-neutral-600 mb-4" />
                        <p className="text-neutral-500">Aucune suggestion pour le moment.</p>
                     </div>
                  )}
               </div>
             </div>
          )}

          {/* THEME TAB (Customization) */}
          {activeTab === 'THEME' && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-3xl font-black text-white">Customisation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {['DEFAULT', 'CHRISTMAS', 'HALLOWEEN', 'NEW_YEAR', 'VALENTINE'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => onUpdateTheme(theme)}
                      className={`relative aspect-video rounded-xl overflow-hidden border-4 transition-all ${currentTheme === theme ? 'border-[#00CEC8] scale-105 shadow-[0_0_20px_rgba(0,206,200,0.3)]' : 'border-neutral-800 hover:border-neutral-600'}`}
                    >
                       <div className={`absolute inset-0 ${
                          theme === 'CHRISTMAS' ? 'bg-gradient-to-br from-green-900 to-red-900' :
                          theme === 'HALLOWEEN' ? 'bg-gradient-to-br from-orange-900 to-purple-900' :
                          theme === 'NEW_YEAR' ? 'bg-gradient-to-br from-slate-900 to-yellow-900' :
                          theme === 'VALENTINE' ? 'bg-gradient-to-br from-pink-900 to-red-900' :
                          'bg-neutral-900'
                       }`}></div>
                       <div className="absolute inset-0 flex items-center justify-center font-bold text-lg drop-shadow-md">
                          {theme}
                       </div>
                    </button>
                 ))}
              </div>

              {/* Community Link Section */}
              <div className="mt-12 p-6 bg-black border border-neutral-800 rounded-xl">
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <LinkIcon className="text-[#00CEC8]" /> Lien Communauté (WhatsApp/Telegram)
                 </h3>
                 <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={communityLink}
                      onChange={(e) => setCommunityLink(e.target.value)}
                      placeholder="https://t.me/votre_chaine ou https://chat.whatsapp.com/..."
                      className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00CEC8] outline-none"
                    />
                    <button 
                      onClick={handleSaveCommunityLink}
                      className="bg-[#00CEC8] text-black font-bold px-6 rounded-lg hover:bg-[#00b5b0]"
                    >
                       Sauvegarder
                    </button>
                 </div>
                 <p className="text-xs text-neutral-500 mt-2">Si ce champ est rempli, un bouton "Rejoindre la Communauté" apparaîtra sur l'interface client.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-neutral-800 shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-neutral-900 z-10">
              <h3 className="text-2xl font-bold text-white">Ajouter du Contenu</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddContent} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-400 mb-2">Titre</label>
                    <div className="flex gap-2">
                      <input 
                        value={newContent.title || ''}
                        onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                        className="flex-1 bg-black border border-neutral-700 rounded-lg p-3 focus:border-[#00CEC8] outline-none transition-colors"
                        placeholder="Ex: Inception"
                      />
                      <button 
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={isGenerating || !newContent.title}
                        className="bg-purple-600/20 text-purple-400 border border-purple-600/50 px-4 rounded-lg font-bold hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                      </button>
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-neutral-400 mb-2">Type</label>
                     <div className="flex bg-black rounded-lg p-1 border border-neutral-700">
                        {['MOVIE', 'SERIES', 'ANIME'].map(t => (
                           <button
                             key={t}
                             type="button"
                             onClick={() => setNewContent({...newContent, type: t as any})}
                             className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${newContent.type === t ? 'bg-[#00CEC8] text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                           >
                              {t}
                           </button>
                        ))}
                     </div>
                  </div>

                  {newContent.type === 'SERIES' ? (
                     <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                        <div className="flex justify-between items-center mb-4">
                           <label className="text-sm font-bold text-[#00CEC8] flex items-center gap-2">
                              <Layers size={16} /> Épisodes ({currentEpisodes.length})
                           </label>
                           <button 
                             type="button" 
                             onClick={() => setShowEpisodeManager(true)}
                             className="text-xs bg-neutral-800 px-3 py-1.5 rounded border border-neutral-600 hover:border-white transition-colors"
                           >
                              Gérer les épisodes
                           </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                           {currentEpisodes.map((ep, idx) => (
                              <div key={ep.id} className="flex justify-between items-center bg-black p-2 rounded text-sm">
                                 <span className="truncate flex-1 text-neutral-300">{idx + 1}. {ep.title}</span>
                                 <button type="button" onClick={() => handleRemoveEpisode(ep.id)} className="text-red-500 hover:text-white ml-2"><X size={14}/></button>
                              </div>
                           ))}
                           {currentEpisodes.length === 0 && <p className="text-xs text-neutral-500 italic">Aucun épisode ajouté.</p>}
                        </div>
                     </div>
                  ) : (
                     <div>
                       <label className="block text-sm font-bold text-neutral-400 mb-2">URL Vidéo (MP4/WebM/MKV)</label>
                       <div className="relative">
                         <input 
                           value={newContent.videoUrl || ''}
                           onChange={(e) => setNewContent({...newContent, videoUrl: e.target.value})}
                           className="w-full bg-black border border-neutral-700 rounded-lg p-3 pl-10 focus:border-[#00CEC8] outline-none"
                           placeholder="https://..."
                         />
                         <Film className="absolute left-3 top-3.5 text-neutral-600" size={18} />
                       </div>
                       <div className="flex justify-end mt-2">
                          <label className="cursor-pointer text-xs flex items-center gap-1 text-[#00CEC8] hover:underline">
                             <Upload size={12} /> Upload Fichier Local
                             <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file) setNewContent({...newContent, videoUrl: URL.createObjectURL(file)});
                             }}/>
                          </label>
                       </div>
                     </div>
                  )}

                  <div>
                     <label className="block text-sm font-bold text-neutral-400 mb-2">Cast (Acteurs)</label>
                     <div className="flex gap-2 mb-2">
                        <input 
                           value={castInput}
                           onChange={(e) => setCastInput(e.target.value)}
                           className="flex-1 bg-black border border-neutral-700 rounded p-2 text-sm"
                           placeholder="Nom de l'acteur"
                        />
                        <button 
                           type="button" 
                           onClick={() => document.getElementById('cast-img-upload')?.click()}
                           className="bg-neutral-800 p-2 rounded border border-neutral-700 hover:border-white"
                           title="Upload Photo"
                        >
                           <ImageIcon size={18} />
                        </button>
                        <input 
                           id="cast-img-upload" 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={(e) => {
                              const file = e.target.files?.[0];
                              if(file) setCastImageInput(URL.createObjectURL(file));
                           }}
                        />
                        <button type="button" onClick={handleAddCastMember} className="bg-[#00CEC8] text-black px-3 rounded font-bold"><Plus size={18}/></button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {newContent.cast?.map((actor, idx) => (
                           <span key={idx} className="bg-neutral-800 text-xs px-2 py-1 rounded-full flex items-center gap-2 border border-neutral-700">
                              <img src={actor.imageUrl || `https://ui-avatars.com/api/?name=${actor.name}`} className="w-4 h-4 rounded-full"/>
                              {actor.name}
                              <button type="button" onClick={() => handleRemoveCastMember(idx)} className="hover:text-red-500"><X size={12}/></button>
                           </span>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div>
                    <label className="block text-sm font-bold text-neutral-400 mb-2">Affiche (Poster)</label>
                    <div className="relative aspect-[2/3] bg-black rounded-xl border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center overflow-hidden group hover:border-[#00CEC8] transition-colors">
                       {newContent.posterUrl ? (
                          <img src={newContent.posterUrl} className="w-full h-full object-cover" />
                       ) : (
                          <div className="text-center text-neutral-500">
                             <ImageIcon size={48} className="mx-auto mb-2" />
                             <p className="text-xs">Drag & Drop ou Clic pour Upload</p>
                          </div>
                       )}
                       <input 
                         type="file" 
                         accept="image/*"
                         className="absolute inset-0 opacity-0 cursor-pointer"
                         onChange={(e) => {
                            const file = e.target.files?.[0];
                            if(file) setNewContent({...newContent, posterUrl: URL.createObjectURL(file)});
                         }}
                       />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-neutral-400 mb-2">Description</label>
                    <textarea 
                       value={newContent.description || ''}
                       onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                       className="w-full bg-black border border-neutral-700 rounded-lg p-3 h-32 focus:border-[#00CEC8] outline-none resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-1">Année</label>
                        <input 
                           type="number"
                           value={newContent.releaseYear || ''}
                           onChange={(e) => setNewContent({...newContent, releaseYear: e.target.value})}
                           className="w-full bg-black border border-neutral-700 rounded p-2"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-1">Note (0-10)</label>
                        <input 
                           type="text"
                           value={newContent.rating || ''}
                           onChange={(e) => setNewContent({...newContent, rating: e.target.value})}
                           className="w-full bg-black border border-neutral-700 rounded p-2"
                        />
                     </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800 flex justify-end gap-4">
                 <button 
                   type="button" 
                   onClick={() => setShowAddModal(false)}
                   className="px-6 py-3 rounded-lg font-bold text-neutral-400 hover:text-white"
                 >
                    Annuler
                 </button>
                 <button 
                   type="submit"
                   className="px-8 py-3 bg-[#00CEC8] text-black font-bold rounded-lg hover:bg-[#00b5b0] shadow-lg transform active:scale-95 transition-all"
                 >
                    Publier Contenu
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Episode Manager Modal */}
      {showEpisodeManager && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-neutral-900 rounded-xl w-full max-w-2xl border border-neutral-800 p-6">
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Layers /> Gestionnaire d'épisodes</h3>
               
               <div className="flex gap-2 mb-6">
                  <input 
                     value={newEpisode.title || ''}
                     onChange={(e) => setNewEpisode({...newEpisode, title: e.target.value})}
                     className="flex-1 bg-black border border-neutral-700 rounded p-2"
                     placeholder="Titre épisode (ex: Pilot)"
                  />
                  <input 
                     value={newEpisode.videoUrl || ''}
                     onChange={(e) => setNewEpisode({...newEpisode, videoUrl: e.target.value})}
                     className="flex-1 bg-black border border-neutral-700 rounded p-2"
                     placeholder="URL Vidéo"
                  />
                   <label className="bg-neutral-800 p-2 rounded border border-neutral-700 cursor-pointer hover:border-white">
                      <Upload size={20} />
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if(file) setNewEpisode({...newEpisode, videoUrl: URL.createObjectURL(file)});
                      }}/>
                   </label>
                  <button onClick={handleAddEpisode} className="bg-[#00CEC8] text-black px-4 rounded font-bold">Ajouter</button>
               </div>

               <div className="space-y-2 max-h-60 overflow-y-auto">
                  {currentEpisodes.map((ep, idx) => (
                     <div key={ep.id} className="flex justify-between items-center bg-black p-3 rounded border border-neutral-800">
                        <span className="font-bold text-neutral-400 mr-4">#{idx + 1}</span>
                        <div className="flex-1">
                           <p className="font-bold text-white">{ep.title}</p>
                           <p className="text-xs text-neutral-500 truncate max-w-[300px]">{ep.videoUrl}</p>
                        </div>
                        <button onClick={() => handleRemoveEpisode(ep.id)} className="text-red-500 hover:text-white"><Trash2 size={18} /></button>
                     </div>
                  ))}
               </div>

               <button onClick={() => setShowEpisodeManager(false)} className="w-full mt-6 py-3 bg-neutral-800 rounded font-bold hover:bg-white hover:text-black transition-colors">
                  Terminer
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;
