import React, { useState, useEffect } from 'react';
import ThemeWrapper from './components/ThemeWrapper';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserInterface from './components/UserInterface';
import AuthOverlay from './components/AuthOverlay';
import { storageService } from './services/storage';
import { User, UserStatus, PlanType } from './types';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState('DEFAULT');

  useEffect(() => {
    // Load theme from storage
    const savedTheme = storageService.getTheme();
    setTheme(savedTheme);

    // Check for existing user session (Mock logic)
    const savedUser = localStorage.getItem('vtv_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Refresh user status from source of truth
      const users = storageService.getUsers();
      const refreshedUser = users.find(u => u.id === user.id);
      if (refreshedUser) {
        setCurrentUser(refreshedUser);
      }
    }
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setCurrentUser(null);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };
  
  const handleExitAdmin = () => {
    // Create a temporary session for the admin to test the app without registering
    const adminTestUser: User = {
      id: 'admin-preview',
      email: 'admin@vtv.com',
      name: 'Administrator (Preview)',
      status: UserStatus.ACTIVE,
      plan: PlanType.PREMIUM, // Give full access
      dateJoined: new Date().toISOString(),
      password: '',
      paymentProof: 'ADMIN_TEST_MODE'
    };
    setCurrentUser(adminTestUser);
    setIsAdmin(false);
  };

  const handleUserLogin = (user: User) => {
    localStorage.setItem('vtv_current_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleUserLogout = () => {
    // If exiting preview mode, go back to Admin Dashboard immediately
    if (currentUser?.id === 'admin-preview') {
       setIsAdmin(true);
       setCurrentUser(null);
       return;
    }

    localStorage.removeItem('vtv_current_user');
    setCurrentUser(null);
  };

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    storageService.setTheme(newTheme);
  };

  // Simple Landing / Auth Screen for Users
  if (!isAdmin && !currentUser) {
    return (
      <ThemeWrapper theme={theme}>
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
          
          {/* Admin Link Secret Area */}
          <button 
            onClick={() => setIsAdmin(true)} 
            className="absolute top-4 right-4 text-neutral-700 hover:text-red-600 text-xs uppercase tracking-widest font-bold z-50"
          >
            Admin Access
          </button>

          <div className="z-10 w-full max-w-md space-y-8 flex flex-col items-center">
            <div className="text-center">
               <h1 className="text-6xl font-black text-red-600 tracking-tighter mb-2">VTV</h1>
               <p className="text-xl font-light text-gray-300">Premium Streaming Experience</p>
            </div>

            <AuthOverlay onLoginSuccess={handleUserLogin} />
          </div>
          
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')] bg-cover opacity-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent pointer-events-none"></div>
        </div>
      </ThemeWrapper>
    );
  }

  if (isAdmin) {
    return (
      <ThemeWrapper theme={theme}>
         <AdminLoginWrapper 
           onLogout={handleAdminLogout} 
           theme={theme} 
           setTheme={updateTheme} 
           onExit={handleExitAdmin}
         />
      </ThemeWrapper>
    );
  }

  if (currentUser) {
    return (
      <ThemeWrapper theme={theme}>
        <UserInterface user={currentUser} onLogout={handleUserLogout} />
      </ThemeWrapper>
    );
  }

  return null;
};

// Helper to handle Admin PIN state locally
const AdminLoginWrapper: React.FC<{onLogout: () => void, theme: string, setTheme: (t: string) => void, onExit: () => void}> = ({ onLogout, theme, setTheme, onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="relative">
        <button onClick={onLogout} className="absolute top-4 left-4 text-white z-50">Back to Home</button>
        <AdminLogin onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return <AdminDashboard onLogout={onLogout} currentTheme={theme} onUpdateTheme={setTheme} onExit={onExit} />;
};

export default App;