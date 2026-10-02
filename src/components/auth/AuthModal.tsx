import React, { useState } from 'react';
import { Mail, Lock, User, Target, Scale, Ruler, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../firebase/authService';
import { isStrictlyPositive } from '../../utils/validation';

export const AuthModal: React.FC = () => {
  const { login, signup, resetPassword, loginAsDemoAthlete } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetWeight, setTargetWeight] = useState('75');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState('2300');
  const [currentWeight, setCurrentWeight] = useState('80');
  const [height, setHeight] = useState('175');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (mode === 'reset') {
      try {
        setLoading(true);
        await resetPassword(email);
        setSuccessMessage('E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
      } catch (err: any) {
        setError(getAuthErrorMessage(err.code || ''));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Por favor, informe seu nome ou apelido.');
        return;
      }
      if (!isStrictlyPositive(targetWeight) || !isStrictlyPositive(currentWeight)) {
        setError('Os pesos informados devem ser números positivos maiores que zero.');
        return;
      }
      if (!isStrictlyPositive(dailyCalorieGoal)) {
        setError('A meta de calorias diárias deve ser maior que zero.');
        return;
      }
      if (!isStrictlyPositive(height)) {
        setError('A altura deve ser informada em centímetros (ex: 175).');
        return;
      }

      try {
        setLoading(true);
        await signup(email, password, name.trim(), {
          targetWeight: parseFloat(targetWeight),
          currentWeight: parseFloat(currentWeight),
          dailyCalorieGoal: parseFloat(dailyCalorieGoal),
          height: parseFloat(height),
          activityLevel: 'moderate',
          themePreference: 'dark',
        });
      } catch (err: any) {
        setError(getAuthErrorMessage(err.code || ''));
      } finally {
        setLoading(false);
      }
    } else {
      // login
      try {
        setLoading(true);
        await login(email, password);
      } catch (err: any) {
        setError(getAuthErrorMessage(err.code || ''));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-6 relative">
          <div className="bodyfit-auth-logo"><img src="https://raw.githubusercontent.com/souzaa22/Academia/main/img/bodyfit2-removebg-preview.png" alt="Body Fit" /></div>
          <h1 className="bodyfit-auth-title">BODY<span>FIT</span></h1>
          <p className="text-xs text-slate-400 mt-1">
            Plataforma Integrada de Treino, Alimentação & Evolução
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Acesso Rápido
            </p>
            <p className="text-[11px] text-slate-400">
              Explore treinos, dieta e gráficos pré-carregados
            </p>
          </div>
          <button
            type="button"
            onClick={loginAsDemoAthlete}
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md shadow-emerald-600/30 whitespace-nowrap"
          >
            Entrar
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 mb-6 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 pb-3 font-semibold transition border-b-2 text-center ${
              mode === 'login'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 pb-3 font-semibold transition border-b-2 text-center ${
              mode === 'signup'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome Completo ou Apelido *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              E-mail *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Senha *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setError(null);
                    }}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Additional onboarding metrics for sign up */}
          {mode === 'signup' && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Suas Metas e Parâmetros Iniciais
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Peso Atual (kg) *
                  </label>
                  <div className="relative">
                    <Scale className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-500" />
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      required
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Meta de Peso (kg) *
                  </label>
                  <div className="relative">
                    <Target className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-500" />
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      required
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Meta Diária (kcal) *
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="500"
                    required
                    value={dailyCalorieGoal}
                    onChange={(e) => setDailyCalorieGoal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Altura (cm) *
                  </label>
                  <div className="relative">
                    <Ruler className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-500" />
                    <input
                      type="number"
                      min="50"
                      max="250"
                      required
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? 'Acessar Plataforma'
                    : mode === 'signup'
                    ? 'Concluir Cadastro & Começar'
                    : 'Enviar Instruções'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 mt-2"
            >
              Voltar para o login
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
