import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Scale,
  Dumbbell,
  Sparkles,
  Zap,
  Target,
  Award,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import {
  getWeightHistory,
  getWorkouts,
  getMeals,
} from '../../firebase/firestoreService';
import {
  WeightEntry,
  WorkoutSession,
  MealEntry,
  IntegratedDayData,
} from '../../types';
import {
  formatDateBR,
  formatNumberBR,
  getTodayDateString,
} from '../../utils/validation';
import {
  calculateDailyTDEE,
  generateIntegratedInsights,
} from '../../utils/calculations';

interface InsightsViewProps {
  onNavigateToWorkouts: () => void;
  onNavigateToDiet: () => void;
  onNavigateToProfile: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  onNavigateToWorkouts,
  onNavigateToDiet,
  onNavigateToProfile,
}) => {
  const { user, profile } = useAuth();

  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [timeRangeDays, setTimeRangeDays] = useState<number>(14);

  const loadAllData = async () => {
    if (!user) return;
    const [wHistory, wkoList, mealList] = await Promise.all([
      getWeightHistory(user.uid),
      getWorkouts(user.uid),
      getMeals(user.uid),
    ]);
    setWeights(wHistory);
    setWorkouts(wkoList);
    setMeals(mealList);
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  // Aggregate daily integrated data
  const tdeeBase = calculateDailyTDEE(profile || {});
  const today = new Date();
  
  // Build rolling array of days
  const dailyDataMap: { [date: string]: IntegratedDayData } = {};

  for (let i = timeRangeDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyDataMap[dateStr] = {
      date: dateStr,
      weight: undefined,
      caloriesConsumed: 0,
      caloriesBurnedWorkout: 0,
      estimatedTDEE: tdeeBase,
      netCalorieBalance: -tdeeBase, // default before meals
      workoutVolume: 0,
      workoutDuration: 0,
      workoutsCount: 0,
      mealsCount: 0,
      proteinConsumed: 0,
      carbsConsumed: 0,
      fatConsumed: 0,
    };
  }

  // Populate weights
  weights.forEach((w) => {
    if (dailyDataMap[w.date]) {
      dailyDataMap[w.date].weight = w.weight;
    }
  });

  // Populate workouts
  workouts.forEach((w) => {
    if (dailyDataMap[w.date]) {
      dailyDataMap[w.date].workoutVolume += w.totalVolume || 0;
      dailyDataMap[w.date].workoutDuration += w.durationMinutes || 0;
      dailyDataMap[w.date].caloriesBurnedWorkout += w.estimatedCaloriesBurned || 0;
      dailyDataMap[w.date].workoutsCount += 1;
    }
  });

  // Populate meals
  meals.forEach((m) => {
    if (dailyDataMap[m.date]) {
      dailyDataMap[m.date].caloriesConsumed += m.totalCalories || 0;
      dailyDataMap[m.date].proteinConsumed += m.totalProtein || 0;
      dailyDataMap[m.date].carbsConsumed += m.totalCarbs || 0;
      dailyDataMap[m.date].fatConsumed += m.totalFat || 0;
      dailyDataMap[m.date].mealsCount += 1;
    }
  });

  // Calculate Net Calorie Balance per day
  const integratedDays = Object.values(dailyDataMap).map((day) => {
    const totalExp = day.estimatedTDEE + day.caloriesBurnedWorkout;
    day.netCalorieBalance = day.caloriesConsumed > 0 ? day.caloriesConsumed - totalExp : 0;
    return day;
  });

  // Period Aggregates
  const totalPeriodVolume = integratedDays.reduce((acc, d) => acc + d.workoutVolume, 0);
  const totalWorkoutsInPeriod = integratedDays.reduce((acc, d) => acc + d.workoutsCount, 0);
  
  const activeDaysWithMeals = integratedDays.filter((d) => d.caloriesConsumed > 0);
  const avgDailyCalories =
    activeDaysWithMeals.length > 0
      ? Math.round(activeDaysWithMeals.reduce((acc, d) => acc + d.caloriesConsumed, 0) / activeDaysWithMeals.length)
      : profile?.dailyCalorieGoal || 2200;

  const avgNetBalance =
    activeDaysWithMeals.length > 0
      ? Math.round(activeDaysWithMeals.reduce((acc, d) => acc + d.netCalorieBalance, 0) / activeDaysWithMeals.length)
      : 0;

  // Weight Trend calculation in period
  const weightPoints = integratedDays.filter((d) => d.weight !== undefined);
  let weightDelta = 0;
  if (weightPoints.length >= 2) {
    const firstWeight = weightPoints[0].weight!;
    const lastWeight = weightPoints[weightPoints.length - 1].weight!;
    weightDelta = Math.round((lastWeight - firstWeight) * 10) / 10;
  }

  // Dynamic Insight Generation
  const targetCalorie = profile?.dailyCalorieGoal || 2200;
  const insight = generateIntegratedInsights(
    avgDailyCalories,
    targetCalorie,
    totalPeriodVolume,
    totalWorkoutsInPeriod,
    weightDelta,
    avgNetBalance
  );

  // Formatted chart points
  const correlationChartData = integratedDays.map((d) => ({
    date: formatDateBR(d.date, { short: true }),
    'Consumo (kcal)': d.caloriesConsumed > 0 ? d.caloriesConsumed : null,
    'Gasto Treino (kcal)': d.caloriesBurnedWorkout > 0 ? d.caloriesBurnedWorkout : null,
    'Volume (kg)': d.workoutVolume > 0 ? d.workoutVolume : null,
    'Peso (kg)': d.weight || null,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Visão Geral de Desempenho Físico
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Painel de Insights Integrado
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cruzamento dinâmico entre sobrecarga de treinos, balanço nutricional e composição corporal.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setTimeRangeDays(7)}
            className={`px-3 py-1.5 rounded-xl transition ${
              timeRangeDays === 7
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setTimeRangeDays(14)}
            className={`px-3 py-1.5 rounded-xl transition ${
              timeRangeDays === 14
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            14 dias
          </button>
          <button
            onClick={() => setTimeRangeDays(30)}
            className={`px-3 py-1.5 rounded-xl transition ${
              timeRangeDays === 30
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            30 dias
          </button>
        </div>
      </div>

      {/* Dynamic AI Diagnostic Hero Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-emerald-800/60 shadow-xl shadow-emerald-950/20 text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Diagnóstico do Ciclo Atual
            </span>
            <span className="text-xs text-slate-400">
              Análise cruzada dos últimos {timeRangeDays} dias
            </span>
          </div>

          <h2 className="text-2xl font-black text-white">
            {insight.headline}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {insight.diagnosis}
          </p>

          <div className="pt-3 border-t border-slate-800/80">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
              Diretrizes Estratégicas Recomendadas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insight.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI 4-Card Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Workout Volume */}
        <div
          onClick={onNavigateToWorkouts}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Volume de Treino</span>
            <Dumbbell className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {formatNumberBR(totalPeriodVolume)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kg levantados</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {totalWorkoutsInPeriod} sessão(ões) registradas
          </p>
        </div>

        {/* Avg Caloric Intake */}
        <div
          onClick={onNavigateToDiet}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Média de Ingestão</span>
            <Flame className="w-4 h-4 text-orange-500 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {formatNumberBR(avgDailyCalories)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kcal/dia</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Meta configurada: {formatNumberBR(targetCalorie)} kcal
          </p>
        </div>

        {/* Caloric Net Balance */}
        <div
          onClick={onNavigateToDiet}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Balanço Médio</span>
            <Layers className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                avgNetBalance < 0
                  ? 'text-emerald-500'
                  : avgNetBalance > 0
                  ? 'text-amber-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {avgNetBalance > 0 ? `+${formatNumberBR(avgNetBalance)}` : formatNumberBR(avgNetBalance)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kcal/dia</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {avgNetBalance < -100 ? 'Fase de déficit calórico' : avgNetBalance > 100 ? 'Fase de superávit' : 'Fase de manutenção'}
          </p>
        </div>

        {/* Weight Delta */}
        <div
          onClick={onNavigateToProfile}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Variação Ponderal</span>
            <Scale className="w-4 h-4 text-purple-500 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {weightDelta > 0 ? `+${weightDelta}` : weightDelta}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kg no período</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            {weightDelta < 0 ? (
              <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                <TrendingDown className="w-3.5 h-3.5" /> Redução de peso consistente
              </span>
            ) : weightDelta > 0 ? (
              <span className="text-amber-500 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> Ganho de massa/peso
              </span>
            ) : (
              <span>Peso estável</span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Correlation Chart: Workouts vs Diet vs Weight */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Cruzamento: Volume de Treino x Consumo Calórico x Peso
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analise se o consumo energético diário está proporcional ao estímulo de treino e como isso reflete na balança.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Volume Treino (kg)
            </span>
            <span className="flex items-center gap-1 text-orange-500">
              <span className="w-2.5 h-0.5 bg-orange-500" /> Consumo Calórico (kcal)
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-2.5 h-0.5 bg-purple-400" /> Peso (kg)
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={correlationChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                yAxisId="volume"
                orientation="left"
                tick={{ fill: '#22c55e', fontSize: 11 }}
                unit="kg"
              />
              <YAxis
                yAxisId="calories"
                orientation="right"
                tick={{ fill: '#f97316', fontSize: 11 }}
                unit="kcal"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '11px',
                }}
              />
              {/* Bar representing workout volume */}
              <Bar
                yAxisId="volume"
                dataKey="Volume (kg)"
                fill="#22c55e"
                opacity={0.7}
                radius={[4, 4, 0, 0]}
              />
              {/* Line representing calorie intake */}
              <Line
                yAxisId="calories"
                type="monotone"
                dataKey="Consumo (kcal)"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f97316' }}
              />
              {/* Line representing weight if available */}
              <Line
                yAxisId="volume"
                type="monotone"
                dataKey="Peso (kg)"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#a855f7' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={onNavigateToWorkouts}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 cursor-pointer transition flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Registrar Novo Treino
            </h3>
            <p className="text-xs text-slate-500">
              Adicionar séries, cargas e cardio
            </p>
          </div>
          <Dumbbell className="w-6 h-6 text-emerald-500" />
        </div>

        <div
          onClick={onNavigateToDiet}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 cursor-pointer transition flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Lançar Refeição
            </h3>
            <p className="text-xs text-slate-500">
              Registrar calorias e macronutrientes
            </p>
          </div>
          <Flame className="w-6 h-6 text-orange-500" />
        </div>

        <div
          onClick={onNavigateToProfile}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 cursor-pointer transition flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Anotar Pesagem
            </h3>
            <p className="text-xs text-slate-500">
              Atualizar curva de peso na balança
            </p>
          </div>
          <Scale className="w-6 h-6 text-cyan-500" />
        </div>
      </div>
    </div>
  );
};
