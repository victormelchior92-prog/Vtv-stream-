import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom';
import { Heart, CheckCircle2, GraduationCap, User } from 'lucide-react';

const StudentVoteApp = () => {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedName, setVotedName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Victor est strictement en deuxième position
  const candidates = ["Lucas", "Victor", "Noah", "Ethan", "Liam"];

  useEffect(() => {
    const voteStatus = localStorage.getItem('vtv_student_vote');
    if (voteStatus) {
      setHasVoted(true);
      setVotedName(localStorage.getItem('vtv_voted_name') || '');
    }
  }, []);

  const handleVote = (name: string) => {
    setIsAnimating(true);
    localStorage.setItem('vtv_student_vote', 'true');
    localStorage.setItem('vtv_voted_name', name);
    
    setTimeout(() => {
      setVotedName(name);
      setHasVoted(true);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="vote-card w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
        
        {/* Section En-tête (Style Académique) */}
        <div className="bg-indigo-700 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <GraduationCap size={120} className="text-white rotate-12" />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm border border-white/30">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Meilleur Élève de 3ème</h1>
          <p className="text-indigo-100 mt-2 text-sm font-medium">
            Votez pour l'élève qui s'est distingué par son mérite et son travail.
          </p>
        </div>

        <div className="p-8">
          {!hasVoted ? (
            <div className="space-y-3">
              {candidates.map((name, index) => (
                <button
                  key={name}
                  onClick={() => handleVote(name)}
                  disabled={isAnimating}
                  className={`
                    w-full py-4 px-6 rounded-2xl text-left font-bold transition-all duration-300
                    flex items-center justify-between group
                    ${isAnimating ? 'bg-slate-50 text-slate-400' : 'bg-slate-50 text-slate-700 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5'}
                  `}
                >
                  <span className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${isAnimating ? 'border-slate-200' : 'border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-500'}`}>
                        {index + 1}
                    </span>
                    {name}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] uppercase tracking-widest">Voter</span>
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-lg shadow-lg rotate-12">
                        <User size={20} />
                    </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Vote enregistré ! 🏆</h2>
              <p className="text-slate-500 mb-6">
                Merci d'avoir voté pour <span className="text-indigo-600 font-bold">{votedName}</span>.
              </p>
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                 <p className="text-xs text-indigo-700 font-semibold italic">
                    "Merci, votre vote a déjà été pris en compte."
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">VTV • EXCELLENCE ACADÉMIQUE</p>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<StudentVoteApp />);