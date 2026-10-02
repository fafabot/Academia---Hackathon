import React from 'react';
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
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: 'insights' | 'workouts' | 'diet' | 'profile';
  setActiveTab: (tab: 'insights' | 'workouts' | 'diet' | 'profile') => void;
  onSeedData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onSeedData }) => {
  const { user, profile, logout, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  const userName = profile?.displayName || user?.email?.split('@')[0] || 'Atleta';

  return (
    <>
      <aside className="bodyfit-sidebar">
        <button className="bodyfit-sidebar-brand" onClick={() => selectTab('insights')} aria-label="Body Fit">
          <span className="bodyfit-sidebar-logo">
            <img src="https://raw.githubusercontent.com/souzaa22/Academia/main/img/bodyfit2-removebg-preview.png" alt="Body Fit" />
          </span>
        </button>

        <div className="bodyfit-side-label">Sua rotina</div>

        <nav className="bodyfit-side-nav" aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => selectTab(item.id)} className={'bodyfit-side-item ' + (activeTab === item.id ? 'active' : '')}>
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button onClick={() => document.querySelector('.bodyfit-chat-launcher')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} className="bodyfit-side-item">
            <Bot size={17} />
            <span>IA</span>
          </button>

          <button onClick={onSeedData} className="bodyfit-side-item">
            <Sparkles size={17} />
            <span>Dados demo</span>
          </button>
        </nav>

        <div className="bodyfit-sidebar-bottom">
          <div className="bodyfit-mini-user">
            <div className="bodyfit-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div className="bodyfit-mini-user-copy">
              <strong>{userName}</strong>
              <small>{isDemoMode ? 'Modo demonstração' : 'Conta conectada'}</small>
            </div>
          </div>

          <button onClick={logout} className="bodyfit-side-item bodyfit-logout-item">
            <LogOut size={17} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <header className="bodyfit-topbar">
        <div className="bodyfit-topbar-date">
          <Activity size={14} />
          <span>Plataforma Integrada de Treino e Alimentação</span>
        </div>

        <div className="bodyfit-topbar-right">
          <span className="bodyfit-sync"><i />Dados sincronizados</span>
          <button onClick={onSeedData} className="bodyfit-topbar-demo">
            <Sparkles size={14} />
            Dados demo
          </button>
          <button onClick={logout} className="bodyfit-topbar-exit">Sair</button>
          <button className="bodyfit-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Abrir menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <nav className="bodyfit-mobile-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => selectTab(item.id)} className={'bodyfit-side-item ' + (activeTab === item.id ? 'active' : '')}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button onClick={onSeedData} className="bodyfit-side-item">
            <Sparkles size={18} />
            <span>Dados demo</span>
          </button>
          <button onClick={logout} className="bodyfit-side-item">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </nav>
      )}
    </>
  );
};
