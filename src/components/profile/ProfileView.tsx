import React, { useState, useEffect } from 'react';
import {
  Scale,
  Target,
  Flame,
  Ruler,
  Activity,
  Calendar,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getWeightHistory,
  addWeightEntry,
  deleteWeightEntry,
} from '../../firebase/firestoreService';
import { WeightEntry, ActivityLevel, ThemeMode } from '../../types';
import {
  formatDateBR,
  formatNumberBR,
  getTodayDateString,
  isNotFutureDate,
  isStrictlyPositive,
} from '../../utils/validation';
import { calculateBMR, calculateDailyTDEE } from '../../utils/calculations';

export const ProfileView: React.FC = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { theme, setTheme, availableThemes } = useTheme();

  // Profile Form state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [targetWeight, setTargetWeight] = useState(String(profile?.targetWeight || '75'));
  const [currentWeight, setCurrentWeight] = useState(String(profile?.currentWeight || '80'));
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(String(profile?.dailyCalorieGoal || '2200'));
  const [height, setHeight] = useState(String(profile?.height || '175'));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel || 'moderate');
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(profile?.themePreference || theme);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Weight History state
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [newWeightDate, setNewWeightDate] = useState(getTodayDateString());
  const [newWeightVal, setNewWeightVal] = useState('');
  const [newWeightNotes, setNewWeightNotes] = useState('');
  const [weightError, setWeightError] = useState<string | null>(null);
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setTargetWeight(String(profile.targetWeight || '75'));
      setCurrentWeight(String(profile.currentWeight || '80'));
      setDailyCalorieGoal(String(profile.dailyCalorieGoal || '2200'));
      setHeight(String(profile.height || '175'));
      setActivityLevel(profile.activityLevel || 'moderate');
      setSelectedTheme(profile.themePreference || theme);
    }
  }, [profile, theme]);

  const loadWeights = async () => {
    if (!user) return;
    const history = await getWeightHistory(user.uid);
    setWeights(history);
  };

  useEffect(() => {
    loadWeights();
  }, [user]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!isStrictlyPositive(targetWeight) || !isStrictlyPositive(currentWeight)) {
      setProfileError('Os valores de peso devem ser números positivos maiores que zero.');
      return;
    }
    if (!isStrictlyPositive(dailyCalorieGoal)) {
      setProfileError('A meta calórica diária deve ser um valor positivo maior que zero.');
      return;
    }
    if (!isStrictlyPositive(height)) {
      setProfileError('A altura deve ser informada em centímetros (ex: 175).');
      return;
    }

    try {
      setSavingProfile(true);
      const parsedCurrentWeight = parseFloat(currentWeight);
      await updateProfileData({
        displayName: displayName.trim(),
        targetWeight: parseFloat(targetWeight),
        currentWeight: parsedCurrentWeight,
        dailyCalorieGoal: parseFloat(dailyCalorieGoal),
        height: parseFloat(height),
        activityLevel,
        themePreference: selectedTheme,
      });

      // Update theme context immediately
      setTheme(selectedTheme);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError('Não foi possível salvar as alterações no perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Add Weight Entry
  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    setWeightError(null);

    if (!user) return;

    if (!isNotFutureDate(newWeightDate)) {
      setWeightError('A data da pesagem não pode ser uma data futura.');
      return;
    }

    if (!isStrictlyPositive(newWeightVal)) {
      setWeightError('Informe um peso válido maior que zero (ex: 82.5).');
      return;
    }

    const weightNum = parseFloat(newWeightVal);

    try {
      setSavingWeight(true);
      await addWeightEntry({
        userId: user.uid,
        date: newWeightDate,
        weight: weightNum,
        notes: newWeightNotes.trim() || undefined,
      });

      // Also automatically update current weight in profile
      await updateProfileData({ currentWeight: weightNum });
      setCurrentWeight(String(weightNum));

      setNewWeightVal('');
      setNewWeightNotes('');
      await loadWeights();
    } catch (err: any) {
      setWeightError('Erro ao registrar nova pesagem.');
    } finally {
      setSavingWeight(false);
    }
  };

  const handleDeleteWeight = async (id?: string) => {
    if (!user || !id) return;
    await deleteWeightEntry(user.uid, id);
    await loadWeights();
  };

  // Metrics calculations
  const currWeightNum = parseFloat(currentWeight) || 75;
  const targetWeightNum = parseFloat(targetWeight) || 70;
  const heightMeters = (parseFloat(height) || 175) / 100;
  const bmi = heightMeters > 0 ? (currWeightNum / (heightMeters * heightMeters)).toFixed(1) : '24.0';
  const weightDeltaToGoal = (currWeightNum - targetWeightNum).toFixed(1);
  const estimatedTDEE = calculateDailyTDEE({
    currentWeight: currWeightNum,
    height: parseFloat(height) || 175,
    activityLevel,
  });

  // Chart data sorted by date
  const chartData = [...weights]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => ({
      date: formatDateBR(w.date, { short: true }),
      peso: w.weight,
      meta: targetWeightNum,
      rawDate: w.date,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Perfil & Metas Físicas
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Acompanhe suas metas de composição corporal, balanço energético e personalize seu ambiente visual.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Weight Current vs Goal */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Peso Atual vs Meta</span>
            <Scale className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {formatNumberBR(currWeightNum)}
            </span>
            <span className="text-sm font-semibold text-slate-500">kg</span>
            <span className="text-xs text-slate-400 ml-auto">
              Meta: {formatNumberBR(targetWeightNum)} kg
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {parseFloat(weightDeltaToGoal) > 0 ? (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Faltam {Math.abs(parseFloat(weightDeltaToGoal))} kg para a meta</span>
              </>
            ) : parseFloat(weightDeltaToGoal) < 0 ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+ {Math.abs(parseFloat(weightDeltaToGoal))} kg acima da meta</span>
              </>
            ) : (
              <>
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Meta atingida exatamente! Parabéns!</span>
              </>
            )}
          </div>
        </div>

        {/* Daily Calorie Goal */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Meta Diária de Calorias</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {formatNumberBR(parseFloat(dailyCalorieGoal))}
            </span>
            <span className="text-sm font-semibold text-slate-500">kcal/dia</span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Gasto estimado basal + rotina (TDEE): <strong>~{estimatedTDEE} kcal</strong>
          </p>
        </div>

        {/* Height & BMI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>IMC Estimado</span>
            <Ruler className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {bmi}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              {parseFloat(bmi) < 18.5
                ? 'Abaixo do peso'
                : parseFloat(bmi) < 25
                ? 'Peso Normal'
                : parseFloat(bmi) < 30
                ? 'Sobrepeso / Muscular'
                : 'Obesidade'}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Altura cadastrada: <strong>{height} cm</strong>
          </p>
        </div>

        {/* Activity Level */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Nível de Atividade</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
            {activityLevel === 'sedentary' && 'Sedentário (Pouco mov.)'}
            {activityLevel === 'light' && 'Leve (1-2x/semana)'}
            {activityLevel === 'moderate' && 'Moderado (3-5x/semana)'}
            {activityLevel === 'very_active' && 'Muito Ativo (6-7x/semana)'}
            {activityLevel === 'extra_active' && 'Atleta Intenso'}
          </p>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Fator metabólico de atividade física ativo.
          </p>
        </div>
      </div>

      {/* Main Grid: Chart & Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Weight History Chart & Logs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-500" />
                  Evolução do Peso Corporal
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acompanhe a curva de pesagens e a linha de meta ao longo do tempo.
                </p>
              </div>
            </div>

            {/* Interactive Recharts Chart */}
            <div className="h-72 w-full pt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      unit="kg"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      formatter={(value: any, name: string) => [
                        `${value} kg`,
                        name === 'peso' ? 'Peso Registrado' : 'Meta',
                      ]}
                    />
                    <ReferenceLine
                      y={targetWeightNum}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{ value: `Meta: ${targetWeightNum}kg`, fill: '#10b981', fontSize: 11, position: 'insideBottomRight' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#22c55e' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Scale className="w-10 h-10 mb-2 opacity-30 text-emerald-500" />
                  <span>Nenhuma pesagem registrada ainda. Adicione sua primeira pesagem abaixo!</span>
                </div>
              )}
            </div>

            {/* Form: Register New Weight */}
            <form onSubmit={handleAddWeight} className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-500" />
                Registrar Nova Pesagem
              </h3>

              {weightError && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{weightError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Data (sem datas futuras) *
                  </label>
                  <input
                    type="date"
                    required
                    max={getTodayDateString()}
                    value={newWeightDate}
                    onChange={(e) => setNewWeightDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Peso em kg (positivo) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    placeholder="Ex: 82.5"
                    value={newWeightVal}
                    onChange={(e) => setNewWeightVal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Observação (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Em jejum pós treino"
                    value={newWeightNotes}
                    onChange={(e) => setNewWeightNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingWeight}
                className="mt-3 w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{savingWeight ? 'Registrando...' : 'Salvar Pesagem'}</span>
              </button>
            </form>

            {/* Recent Weight Table */}
            {weights.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                  Histórico Detalhado ({weights.length} registros)
                </p>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {[...weights]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatDateBR(item.date)}
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatNumberBR(item.weight)} kg
                          </span>
                          {item.notes && (
                            <span className="text-slate-400 italic">"{item.notes}"</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteWeight(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition"
                          title="Excluir registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Profile & Goals Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Editar Metas & Configurações
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Ajuste suas metas a qualquer momento. Os cálculos integrados de treino e dieta serão adaptados dinamicamente.
            </p>

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Perfil e metas atualizados com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome ou Apelido
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Meta de Peso (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Peso Atual (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Meta Diária (kcal) *
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="500"
                    required
                    value={dailyCalorieGoal}
                    onChange={(e) => setDailyCalorieGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Altura (cm) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nível de Atividade Física
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="sedentary">Sedentário (Trabalho sentado, pouco treino)</option>
                  <option value="light">Leve (Treino 1 a 2x por semana)</option>
                  <option value="moderate">Moderado (Treino 3 a 5x por semana)</option>
                  <option value="very_active">Muito Ativo (Treino pesado 6x por semana)</option>
                  <option value="extra_active">Extremamente Ativo (Atleta de alto rendimento)</option>
                </select>
              </div>

              {/* Theme Preference Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tema Visual Preferido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableThemes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTheme(t.id)}
                      className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-between transition ${
                        selectedTheme === t.id
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span>{t.icon} {t.name.split(' ')[0]}</span>
                      <div className={`w-4 h-4 rounded-md border ${t.previewClass}`} />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {savingProfile ? (
                  <span>Salvando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Configurações</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
