import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Profile, UserRole } from './types';

// Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/Dashboard';
import SurveyView from './components/SurveyView';
import StrategyView from './components/StrategyView';
import ObservationView from './components/ObservationView';
import SessionsView from './components/SessionsView';
import ResourcesView from './components/ResourcesView';
import ReportsView from './components/ReportsView';
import AuthView from './components/AuthView';

type View = 'dashboard' | 'surveys' | 'strategy' | 'observation' | 'sessions' | 'resources' | 'reports';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // If operator is on restricted view, move them to surveys
      if (data.role === 'operator' && !['surveys', 'resources'].includes(currentView)) {
        setCurrentView('surveys');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // User details from profile
  const user = {
    name: profile?.full_name || session?.user?.email?.split('@')[0] || 'Usuário',
    role: profile?.role === 'supervisor' ? 'Supervisor' : 'Operador',
    avatar: `https://ui-avatars.com/api/?name=${profile?.full_name || session?.user?.email || 'User'}&background=0D8ABC&color=fff`
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderView = () => {
    // Role based protection
    const isOperator = profile?.role === 'operator';
    const allowedViews = isOperator ? ['dashboard', 'surveys', 'resources'] : ['dashboard', 'reports', 'surveys', 'strategy', 'observation', 'sessions', 'resources'];

    if (!allowedViews.includes(currentView)) {
      return <SurveyView />;
    }

    switch (currentView) {
      case 'dashboard': return <Dashboard role={profile?.role || 'operator'} userId={session?.user?.id} />;
      case 'reports': return <ReportsView userId={session?.user?.id} />;
      case 'surveys': return <SurveyView userId={session?.user?.id} role={profile?.role} />;
      case 'strategy': return <StrategyView userId={session?.user?.id} />;
      case 'observation': return <ObservationView userId={session?.user?.id} />;
      case 'sessions': return <SessionsView userId={session?.user?.id} />;
      case 'resources': return <ResourcesView role={profile?.role || 'operator'} userId={session?.user?.id} />;
      default: return <Dashboard role={profile?.role || 'operator'} userId={session?.user?.id} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => setCurrentView(view as View)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
        role={profile?.role || 'operator'}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
