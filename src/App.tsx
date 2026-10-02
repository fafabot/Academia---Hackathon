import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { Navbar } from './components/layout/Navbar';
import { InsightsView } from './components/insights/InsightsView';
import { WorkoutsView } from './components/workouts/WorkoutsView';
import { DietView } from './components/diet/DietView';
import { ProfileView } from './components/profile/ProfileView';
import { EvolutionView } from './components/evolution/EvolutionView';
import { Chatbot } from './components/ai/Chatbot';
import { getSampleHistoryData } from './data/seedData';
import { addWeightEntry, addWorkout, addMeal } from './firebase/firestoreService';
import { Flame, TrendingUp, Dumbbell, Apple, User, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'insights' | 'workouts' | 'diet' | 'evolution' | 'profile'>('insights');
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const handleSeedData = async () => {
    if (!user) return;
    try {
      setSeeding(true);
      const { weightLogs, workouts, meals } = getSampleHistoryData(user.uid);

      for (const w of weightLogs) {
        await addWeightEntry(w);
      }
      for (const wko of workouts) {
        await addWorkout(wko);
      }
      for (const m of meals) {
        await addMeal(m);
      }

      setSeedNotice('Dados realistas de treino, dieta e peso carregados com sucesso! Os gráficos foram atualizados.');
      setTimeout(() => setSeedNotice(null), 5000);
      // force reload view if needed or trigger tab
      setActiveTab('insights');
    } catch (e) {
      console.error('Failed to seed sample data:', e);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce mb-4">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <p className="font-extrabold text-xl tracking-tight">
          BODY<span className="text-cyan-300">FIT</span>
        </p>
        <span className="text-xs text-slate-500 mt-1">Carregando Body Fit...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="bodyfit-app-shell">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSeedData={handleSeedData}
      />

      {/* Global Seed Notification Banner */}
      {seedNotice && (
        <div className="bg-emerald-500 text-white text-xs font-semibold py-2.5 px-4 text-center shadow-md animate-fadeIn flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{seedNotice}</span>
        </div>
      )}

      {/* Main Single Page Content Area (No reload) */}
      <main className="flex-1">
        {activeTab === 'insights' && (
          <InsightsView
            onNavigateToWorkouts={() => setActiveTab('workouts')}
            onNavigateToDiet={() => setActiveTab('diet')}
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        )}
        {activeTab === 'workouts' && <WorkoutsView />}
        {activeTab === 'diet' && <DietView />}
        {activeTab === 'evolution' && <EvolutionView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      <Chatbot />
    </div>
  );
};
