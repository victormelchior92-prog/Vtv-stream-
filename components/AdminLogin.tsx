
import React, { useState } from 'react';
import { ADMIN_EMAIL, ADMIN_PIN } from '../types';
import { Lock, ShieldCheck } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && pin === ADMIN_PIN) {
      onLogin();
    } else {
      setError('Invalid Email or PIN');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#00CEC8]/10 rounded-full">
            <ShieldCheck className="w-12 h-12 text-[#00CEC8]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Admin Access</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg focus:ring-2 focus:ring-[#00CEC8] focus:border-transparent text-white"
              placeholder="admin@vtv.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Security PIN</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-lg focus:ring-2 focus:ring-[#00CEC8] focus:border-transparent text-white"
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-[#00CEC8] hover:bg-[#00b5b0] text-black font-bold rounded-lg transition-all transform active:scale-95"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
