import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import {
  getExercises,
  addExercise,
  deleteExercise,
  getWorkouts,
  addWorkout,
  deleteWorkout,
} from '../../firebase/firestoreService';
import {
  Exercise,
  ExerciseCategory,
  EquipmentType,
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  ProgressionStatus,
} from '../../types';
import { DEFAULT_EXERCISES } from '../../data/seedData';
import {
  formatDateBR,
  formatNumberBR,
  getTodayDateString,
  isNotFutureDate,
  isStrictlyPositive,
} from '../../utils/validation';
import {
  calculateWorkoutVolume,
  estimateWorkoutCalories,
  evaluateProgression,
} from '../../utils/calculations';

export const WorkoutsView: React.FC = () => {
  const { user, profile } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'log' | 'history' | 'analytics' | 'exercises'>('log');
  
  // Data states
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);

  // New Workout Session Form
  const [workoutTitle, setWorkoutTitle] = useState('Treino A - Superiores / Peito & Tríceps');
  const [workoutDate, setWorkoutDate] = useState(getTodayDateString());
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [sessionExercises, setSessionExercises] = useState<WorkoutExercise[]>([]);
  const [selectedExId, setSelectedExId] = useState('');

  // Form error/success
  const [logError, setLogError] = useState<string | null>(null);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);
  const [savingWorkout, setSavingWorkout] = useState(false);

  // New Exercise Form
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<ExerciseCategory>('chest');
  const [newExEquipment, setNewExEquipment] = useState<EquipmentType>('barbell');
  const [newExRest, setNewExRest] = useState('60');
  const [newExNotes, setNewExNotes] = useState('');
  const [exFormError, setExFormError] = useState<string | null>(null);
  const [savingExercise, setSavingExercise] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const [exList, wkoList] = await Promise.all([
      getExercises(user.uid),
      getWorkouts(user.uid),
    ]);

    if (exList.length === 0) {
      // Seed default exercises for this user
      const defaultPromises = DEFAULT_EXERCISES.map((item) =>
        addExercise({ ...item, userId: user.uid })
      );
      const seeded = await Promise.all(defaultPromises);
      setExercises(seeded);
    } else {
      setExercises(exList);
    }

    setWorkouts(wkoList);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Add exercise to currently composing workout
  const handleAddExerciseToSession = (exId: string) => {
    if (!exId) return;
    const found = exercises.find((e) => e.id === exId);
    if (!found) return;

    const isCardio = found.category === 'cardio';

    const newEx: WorkoutExercise = {
      exerciseId: found.id || '',
      exerciseName: found.name,
      category: found.category,
      isCardio,
      sets: isCardio
        ? []
        : [
            { setNumber: 1, reps: 10, weight: 60, completed: true },
            { setNumber: 2, reps: 10, weight: 60, completed: true },
            { setNumber: 3, reps: 8, weight: 65, completed: true },
          ],
      cardioMinutes: isCardio ? 20 : undefined,
      cardioIntensity: isCardio ? 'moderate' : undefined,
      cardioDistanceKm: isCardio ? 2.5 : undefined,
    };

    setSessionExercises([...sessionExercises, newEx]);
    setSelectedExId('');
  };

  const handleRemoveExerciseFromSession = (index: number) => {
    setSessionExercises(sessionExercises.filter((_, i) => i !== index));
  };

  const handleAddSet = (exIndex: number) => {
    const updated = [...sessionExercises];
    const currentSets = updated[exIndex].sets;
    const lastSet = currentSets[currentSets.length - 1] || { reps: 10, weight: 50 };
    currentSets.push({
      setNumber: currentSets.length + 1,
      reps: lastSet.reps,
      weight: lastSet.weight,
      completed: true,
    });
    setSessionExercises(updated);
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    const updated = [...sessionExercises];
    updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIndex);
    // re-index
    updated[exIndex].sets.forEach((s, idx) => (s.setNumber = idx + 1));
    setSessionExercises(updated);
  };

  const handleUpdateSet = (exIndex: number, setIndex: number, field: keyof WorkoutSet, val: any) => {
    const updated = [...sessionExercises];
    updated[exIndex].sets[setIndex] = {
      ...updated[exIndex].sets[setIndex],
      [field]: val,
    };
    setSessionExercises(updated);
  };

  // Real-time calculations for current workout in editor
  const currentTotalVolume = calculateWorkoutVolume(sessionExercises);
  const currentEstimatedCalories = estimateWorkoutCalories(
    parseFloat(durationMinutes) || 0,
    profile?.currentWeight || 75,
    sessionExercises
  );

  // Compare with last recorded workout to determine progression preview
  const previousSameWorkout = workouts.find((w) => w.title.toLowerCase().trim() === workoutTitle.toLowerCase().trim());
  const previousWorkout = previousSameWorkout || workouts[0];
  const progressionEvaluation = evaluateProgression(currentTotalVolume, previousWorkout?.totalVolume);

  // Save Workout Session
  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogError(null);
    setLogSuccess(null);

    if (!user) return;

    if (!workoutTitle.trim()) {
      setLogError('Por favor, defina um título ou identificador para este treino.');
      return;
    }

    if (!isNotFutureDate(workoutDate)) {
      setLogError('A data do treino não pode ser futura.');
      return;
    }

    if (!isStrictlyPositive(durationMinutes)) {
      setLogError('Informe a duração do treino em minutos maior que zero.');
      return;
    }

    if (sessionExercises.length === 0) {
      setLogError('Adicione pelo menos um exercício ou atividade cardio à sessão de treino.');
      return;
    }

    // Validate sets have positive numbers
    for (const ex of sessionExercises) {
      if (!ex.isCardio) {
        for (const s of ex.sets) {
          if (!isStrictlyPositive(s.reps)) {
            setLogError(`Em ${ex.exerciseName}, as repetições de cada série devem ser maiores que zero.`);
            return;
          }
          if (s.weight < 0) {
            setLogError(`Em ${ex.exerciseName}, a carga não pode ser negativa.`);
            return;
          }
        }
      } else {
        if (!isStrictlyPositive(ex.cardioMinutes)) {
          setLogError(`No cardio ${ex.exerciseName}, a duração deve ser maior que zero minutos.`);
          return;
        }
      }
    }

    try {
      setSavingWorkout(true);
      await addWorkout({
        userId: user.uid,
        title: workoutTitle.trim(),
        date: workoutDate,
        durationMinutes: parseFloat(durationMinutes),
        exercises: sessionExercises,
        totalVolume: currentTotalVolume,
        estimatedCaloriesBurned: currentEstimatedCalories,
        progressionStatus: progressionEvaluation.status,
        progressionDiffPercent: progressionEvaluation.diffPercent,
        notes: workoutNotes.trim() || undefined,
      });

      setLogSuccess(`Treino registrado com sucesso! Carga de volume: ${formatNumberBR(currentTotalVolume)} kg (${progressionEvaluation.status.toUpperCase()}).`);
      setSessionExercises([]);
      setWorkoutNotes('');
      await loadData();
    } catch (err: any) {
      setLogError('Erro ao salvar treino no banco de dados.');
    } finally {
      setSavingWorkout(false);
    }
  };

  const handleDeleteWorkout = async (id?: string) => {
    if (!user || !id) return;
    await deleteWorkout(user.uid, id);
    await loadData();
  };

  // Create new exercise definition
  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setExFormError(null);
    if (!user) return;

    if (!newExName.trim()) {
      setExFormError('O nome do exercício é obrigatório.');
      return;
    }

    try {
      setSavingExercise(true);
      await addExercise({
        userId: user.uid,
        name: newExName.trim(),
        category: newExCategory,
        equipment: newExEquipment,
        defaultRestSeconds: parseInt(newExRest, 10) || 60,
        notes: newExNotes.trim() || undefined,
      });
      setNewExName('');
      setNewExNotes('');
      await loadData();
    } catch (err: any) {
      setExFormError('Erro ao cadastrar novo exercício.');
    } finally {
      setSavingExercise(false);
    }
  };

  const handleDeleteExercise = async (id?: string) => {
    if (!user || !id) return;
    await deleteExercise(user.uid, id);
    await loadData();
  };

  // Performance chart data
  const volumeChartData = [...workouts]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => ({
      date: formatDateBR(w.date, { short: true }),
      volume: w.totalVolume,
      calorias: w.estimatedCaloriesBurned,
      title: w.title,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-emerald-500" />
            Módulo Treino & Sobrecarga
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registro detalhado de cargas, cálculo automático de volume tonelagem e diagnóstico de progressão.
          </p>
        </div>

        {/* Subtabs Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('log')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSubTab === 'log'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Registrar Sessão
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSubTab === 'history'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Histórico ({workouts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSubTab === 'analytics'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gráficos
          </button>
          <button
            onClick={() => setActiveSubTab('exercises')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSubTab === 'exercises'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Exercícios ({exercises.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: LOG WORKOUT SESSION */}
      {activeSubTab === 'log' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Workout Editor (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Montagem da Sessão de Treino
              </h2>

              {logError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{logError}</span>
                </div>
              )}

              {logSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{logSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveWorkout} className="space-y-6">
                
                {/* General Session Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Título do Treino *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Treino A - Peitoral e Deltoide"
                      value={workoutTitle}
                      onChange={(e) => setWorkoutTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Data (sem datas futuras) *
                    </label>
                    <input
                      type="date"
                      required
                      max={getTodayDateString()}
                      value={workoutDate}
                      onChange={(e) => setWorkoutDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Duração Total (minutos) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Notas da Sessão (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Descanso de 90s, boa conexão mente-músculo"
                      value={workoutNotes}
                      onChange={(e) => setWorkoutNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Add Exercise Selector Bar */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:flex-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Adicionar Exercício ao Treino
                    </label>
                    <select
                      value={selectedExId}
                      onChange={(e) => setSelectedExId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Selecione um exercício do banco...</option>
                      {exercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.category.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={!selectedExId}
                    onClick={() => handleAddExerciseToSession(selectedExId)}
                    className="w-full sm:w-auto px-4 py-2 mt-4 sm:mt-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Incluir</span>
                  </button>
                </div>

                {/* Exercises & Sets Table */}
                <div className="space-y-4">
                  {sessionExercises.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                      Nenhum exercício adicionado a este treino ainda. Selecione um exercício acima para começar a registrar cargas e repetições!
                    </div>
                  ) : (
                    sessionExercises.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 font-extrabold text-xs flex items-center justify-center">
                              {exIdx + 1}
                            </span>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {ex.exerciseName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                              {ex.category}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExerciseFromSession(exIdx)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Remover exercício"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Cardio specific inputs */}
                        {ex.isCardio ? (
                          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Duração (min)</label>
                              <input
                                type="number"
                                min="1"
                                value={ex.cardioMinutes || 20}
                                onChange={(e) => {
                                  const updated = [...sessionExercises];
                                  updated[exIdx].cardioMinutes = parseFloat(e.target.value) || 0;
                                  setSessionExercises(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Intensidade</label>
                              <select
                                value={ex.cardioIntensity || 'moderate'}
                                onChange={(e) => {
                                  const updated = [...sessionExercises];
                                  updated[exIdx].cardioIntensity = e.target.value as any;
                                  setSessionExercises(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border rounded-lg"
                              >
                                <option value="low">Baixa (Leve)</option>
                                <option value="moderate">Moderada</option>
                                <option value="high">Alta (Intensa)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Distância (km)</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={ex.cardioDistanceKm || 0}
                                onChange={(e) => {
                                  const updated = [...sessionExercises];
                                  updated[exIdx].cardioDistanceKm = parseFloat(e.target.value) || 0;
                                  setSessionExercises(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border rounded-lg"
                              />
                            </div>
                          </div>
                        ) : (
                          /* Resistance sets inputs */
                          <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                              <span className="col-span-2">Série</span>
                              <span className="col-span-4">Carga (kg)</span>
                              <span className="col-span-4">Repetições</span>
                              <span className="col-span-2 text-right">Ação</span>
                            </div>

                            {ex.sets.map((set, setIdx) => (
                              <div
                                key={setIdx}
                                className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl text-xs"
                              >
                                <span className="col-span-2 font-bold text-slate-700 dark:text-slate-300 pl-1">
                                  #{set.setNumber}
                                </span>
                                <div className="col-span-4">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={set.weight}
                                    onChange={(e) =>
                                      handleUpdateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)
                                    }
                                    className="w-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                                  />
                                </div>
                                <div className="col-span-4">
                                  <input
                                    type="number"
                                    min="1"
                                    value={set.reps}
                                    onChange={(e) =>
                                      handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)
                                    }
                                    className="w-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                                  />
                                </div>
                                <div className="col-span-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSet(exIdx, setIdx)}
                                    className="text-slate-400 hover:text-rose-500 p-1"
                                    title="Remover série"
                                  >
                                    <Minus className="w-3.5 h-3.5 inline" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddSet(exIdx)}
                              className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 flex items-center gap-1 pt-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Adicionar Série</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={savingWorkout || sessionExercises.length === 0}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{savingWorkout ? 'Gravando treino...' : 'Concluir & Salvar Sessão'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Live Diagnosis Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Volume & Calories Box */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Resumo em Tempo Real
              </h3>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                  Volume Total (Carga x Reps)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {formatNumberBR(currentTotalVolume)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">kg acumulados</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-500/20">
                <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 block mb-1">
                  Gasto Calórico Estimado
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    ~{currentEstimatedCalories}
                  </span>
                  <span className="text-xs font-bold text-slate-500">kcal queimadas</span>
                </div>
              </div>

              {/* Automatic Progression Diagnostic */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Diagnóstico de Sobrecarga
                </span>
                <div
                  className={`p-3.5 rounded-2xl text-xs border ${
                    progressionEvaluation.status === 'evoluindo'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                      : progressionEvaluation.status === 'regredindo'
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : 'bg-amber-950/40 border-amber-800 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {progressionEvaluation.status === 'evoluindo' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                    {progressionEvaluation.status === 'regredindo' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                    {progressionEvaluation.status === 'estagnado' && <Minus className="w-4 h-4 text-amber-400" />}
                    <span className="capitalize">{progressionEvaluation.status.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {progressionEvaluation.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Como a progressão é calculada?
              </p>
              <p>
                O sistema compara a tonelagem total (reps × carga) com treinos anteriores do mesmo perfil. Variações acima de +2% indicam sobrecarga progressiva efetiva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: WORKOUT HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
              Nenhuma sessão de treino gravada ainda. Clique em "Registrar Sessão" para adicionar o seu primeiro treino!
            </div>
          ) : (
            workouts.map((w) => (
              <div
                key={w.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {w.title}
                    </h3>
                    {w.progressionStatus && (
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          w.progressionStatus === 'evoluindo'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : w.progressionStatus === 'regredindo'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {w.progressionStatus}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      {formatDateBR(w.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      {w.durationMinutes} minutos
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      ~{w.estimatedCaloriesBurned} kcal
                    </span>
                  </div>

                  {w.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{w.notes}"
                    </p>
                  )}

                  {/* Exercises mini preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {w.exercises?.map((ex, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {ex.exerciseName} ({ex.sets?.length || 0} séries)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Volume Total
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatNumberBR(w.totalVolume)} kg
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteWorkout(w.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Excluir treino"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBTAB 3: ANALYTICS & CHARTS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Evolução da Carga de Volume (Tonelagem)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Gráfico histórico mostrando a tonelagem total levantada por sessão ao longo do tempo.
            </p>

            <div className="h-72 w-full">
              {volumeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="kg" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${formatNumberBR(val)} kg`, 'Volume']}
                    />
                    <Bar dataKey="volume" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Sem dados para gerar o gráfico de tonelagem.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: EXERCISE CATALOG */}
      {activeSubTab === 'exercises' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create new exercise (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Cadastrar Novo Exercício
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Adicione exercícios personalizados à sua biblioteca de treinos.
              </p>

              {exFormError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{exFormError}</span>
                </div>
              )}

              <form onSubmit={handleCreateExercise} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Exercício *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Supino Inclinado com Halteres"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Grupo Muscular
                    </label>
                    <select
                      value={newExCategory}
                      onChange={(e) => setNewExCategory(e.target.value as ExerciseCategory)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="chest">Peito</option>
                      <option value="back">Costas</option>
                      <option value="legs">Pernas</option>
                      <option value="shoulders">Ombros</option>
                      <option value="arms">Braços</option>
                      <option value="core">Abdômen / Core</option>
                      <option value="cardio">Cardio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Equipamento
                    </label>
                    <select
                      value={newExEquipment}
                      onChange={(e) => setNewExEquipment(e.target.value as EquipmentType)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="barbell">Barra</option>
                      <option value="dumbbell">Halteres</option>
                      <option value="cable">Polia / Cabo</option>
                      <option value="machine">Máquina</option>
                      <option value="bodyweight">Peso Corporal</option>
                      <option value="cardio_machine">Aparelho Cardio</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tempo de Descanso Padrão (segundos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={newExRest}
                    onChange={(e) => setNewExRest(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Observações Técnicas (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Escápulas retraídas, cadência controlada"
                    value={newExNotes}
                    onChange={(e) => setNewExNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingExercise}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{savingExercise ? 'Cadastrando...' : 'Cadastrar Exercício'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* List of registered exercises (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Biblioteca de Exercícios ({exercises.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Exercícios disponíveis para composição de treinos.
              </p>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                {exercises.map((ex) => (
                  <div key={ex.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {ex.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="capitalize">{ex.category}</span>
                        <span>•</span>
                        <span className="capitalize">{ex.equipment}</span>
                        {ex.notes && (
                          <>
                            <span>•</span>
                            <span className="italic">"{ex.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteExercise(ex.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Excluir exercício"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
