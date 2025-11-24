
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { User, UserStatus } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, AlertCircle, Download, Smartphone } from 'lucide-react';

interface AuthOverlayProps {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      alert("Pour installer VTV :\n\nAndroid (Chrome) : Cliquez sur les 3 points ⋮ > 'Installer l'application'.\n\niOS (Safari) : Cliquez sur Partager ⎋ > 'Sur l'écran d'accueil'.");
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
    setError('');
    setMessage('');
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (mode === 'LOGIN') {
      const user = storageService.getUserByEmail(formData.email);
      if (user && user.password === formData.password) {
        onLoginSuccess(user);
      } else {
        setError('Invalid email or password.');
      }
    } else if (mode === 'REGISTER') {
      if (storageService.getUserByEmail(formData.email)) {
        setError('An account with this email already exists.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        email: formData.email,
        name: formData.name,
        password: formData.password,
        status: UserStatus.GUEST,
        dateJoined: new Date().toISOString(),
      };
      storageService.addUser(newUser);
      onLoginSuccess(newUser);
    } else if (mode === 'FORGOT_PASSWORD') {
      const user = storageService.getUserByEmail(formData.email);
      if (user) {
        // In a real app, this would send an email. Here we just move to reset step.
        setMessage('Account found. Please enter your new password below.');
        setMode('RESET_PASSWORD');
      } else {
        setError('No account found with this email address.');
      }
    } else if (mode === 'RESET_PASSWORD') {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const user = storageService.getUserByEmail(formData.email);
      if (user) {
        storageService.updateUser({ ...user, password: formData.password });
        setMessage('Password updated successfully. Please log in.');
        setTimeout(() => setMode('LOGIN'), 1500);
      }
    }
  };

  return (
    <div className="z-10 w-full max-w-md flex flex-col gap-4">
      <div className="bg-neutral-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-neutral-800">
        <div className="text-center mb-8">
           <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'LOGIN' && 'Welcome Back'}
            {mode === 'REGISTER' && 'Create Account'}
            {(mode === 'FORGOT_PASSWORD' || mode === 'RESET_PASSWORD') && 'Recovery'}
           </h2>
           <p className="text-neutral-400 text-sm">
             {mode === 'LOGIN' && 'Enter your credentials to access VTV.'}
             {mode === 'REGISTER' && 'Join the premium streaming experience.'}
             {mode === 'FORGOT_PASSWORD' && 'Enter your email to reset password.'}
             {mode === 'RESET_PASSWORD' && 'Set a new secure password.'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500/10 border border-green-500/50 p-3 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <AlertCircle size={16} />
              {message}
            </div>
          )}

          {mode === 'REGISTER' && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-lg focus:ring-2 focus:ring-[#00CEC8] text-white placeholder-neutral-600"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-neutral-500" />
            <input
              type="email"
              placeholder="Email Address"
              required
              disabled={mode === 'RESET_PASSWORD'}
              className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-lg focus:ring-2 focus:ring-[#00CEC8] text-white placeholder-neutral-600 disabled:opacity-50"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {mode !== 'FORGOT_PASSWORD' && (
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neutral-500" />
              <input
                type="password"
                placeholder={mode === 'RESET_PASSWORD' ? "New Password" : "Password"}
                required
                className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-lg focus:ring-2 focus:ring-[#00CEC8] text-white placeholder-neutral-600"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          )}

          {mode === 'RESET_PASSWORD' && (
             <div className="relative">
               <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neutral-500" />
               <input
                 type="password"
                 placeholder="Confirm New Password"
                 required
                 className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-lg focus:ring-2 focus:ring-[#00CEC8] text-white placeholder-neutral-600"
                 value={formData.confirmPassword}
                 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
               />
             </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3 bg-[#00CEC8] hover:bg-[#00b5b0] text-black font-bold rounded-lg transition-all transform active:scale-95 flex items-center justify-center"
          >
            {mode === 'LOGIN' && 'Sign In'}
            {mode === 'REGISTER' && 'Create Account'}
            {mode === 'FORGOT_PASSWORD' && 'Find Account'}
            {mode === 'RESET_PASSWORD' && 'Update Password'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'LOGIN' && (
            <>
              <p className="text-neutral-500 text-sm">
                New to VTV? <button onClick={() => handleSwitchMode('REGISTER')} className="text-[#00CEC8] font-semibold hover:underline">Sign Up</button>
              </p>
              <button onClick={() => handleSwitchMode('FORGOT_PASSWORD')} className="text-[#00CEC8] text-xs hover:underline">Forgot Password?</button>
            </>
          )}
          
          {mode === 'REGISTER' && (
            <p className="text-neutral-500 text-sm">
              Already have an account? <button onClick={() => handleSwitchMode('LOGIN')} className="text-[#00CEC8] font-semibold hover:underline">Log In</button>
            </p>
          )}

          {(mode === 'FORGOT_PASSWORD' || mode === 'RESET_PASSWORD') && (
             <button onClick={() => handleSwitchMode('LOGIN')} className="text-neutral-400 text-sm hover:text-white flex items-center justify-center w-full">
               <ArrowLeft className="mr-1 w-4 h-4" /> Back to Login
             </button>
          )}
        </div>
      </div>
      
      {/* Bouton d'Installation App */}
      <button 
        onClick={handleInstallClick}
        className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white font-bold flex items-center justify-center transition-colors shadow-lg"
      >
        <Smartphone className="mr-2" size={20} />
        {installPrompt ? "Installer l'Application VTV" : "Télécharger l'Application"}
      </button>
    </div>
  );
};

export default AuthOverlay;
