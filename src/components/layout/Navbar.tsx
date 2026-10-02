import React, { useState } from 'react';
import {
  Dumbbell,
  Apple,
  TrendingUp,
  User as UserIcon,
  LogOut,
  Sparkles,
  Menu,
  X,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: 'insights' | 'workouts' | 'diet' | 'profile';
  setActiveTab: (tab: 'insights' | 'workouts' | 'diet' | 'profile') => void;
  onSeedData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onSeedData }) => {
  const { user, profile, logout, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'insights' as const, label: 'Visão geral', icon: TrendingUp },
    { id: 'workouts' as const, label: 'Treinos', icon: Dumbbell },
    { id: 'diet' as const, label: 'Alimentação', icon: Apple },
    { id: 'profile' as const, label: 'Perfil', icon: UserIcon },
  ];

  const selectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bodyfit-header">
      <div className="bodyfit-header-inner">
        <button className="bodyfit-brand" onClick={() => selectTab('insights')} aria-label="Body Fit">
          <span className="bodyfit-logo-frame">
            <img
              src="https://raw.githubusercontent.com/souzaa22/Academia/main/img/bodyfit2-removebg-preview.png"
              alt="Body Fit"
              className="bodyfit-logo"
            />
          </span>
          <span className="bodyfit-brand-name">BODY<span>FIT</span></span>
        </button>

        <nav className="bodyfit-nav" aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className={`bodyfit-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button onClick={() => selectTab('insights')} className="bodyfit-nav-item">
            <Bot size={17} />
            <span>Aura IA</span>
          </button>
        </nav>

        <div className="bodyfit-user">
          <button onClick={onSeedData} className="bodyfit-demo" title="Carregar dados de exemplo">
            <Sparkles size={15} />
            <span>Dados demo</span>
          </button>

          {user && (
            <>
              <div className="bodyfit-user-info">
                <strong>{profile?.displayName || user.email?.split('@')[0] || 'Atleta'}</strong>
                <small>{isDemoMode ? 'Demonstração' : 'Conta conectada'}</small>
              </div>
              <button onClick={logout} className="bodyfit-logout" title="Sair">
                <LogOut size={17} />
              </button>
            </>
          )}

          <button
            className="bodyfit-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="bodyfit-mobile-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className={`bodyfit-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button onClick={onSeedData} className="bodyfit-nav-item">
            <Sparkles size={18} />
            <span>Carregar dados de exemplo</span>
          </button>
        </div>
      )}
    </header>
  );
};
