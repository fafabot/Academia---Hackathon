import React, { useEffect, useMemo, useState } from 'react';
import { Scale, TrendingDown, TrendingUp, Dumbbell, Calendar, Plus, Trash2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getWeightHistory, addWeightEntry, deleteWeightEntry, getWorkouts } from '../../firebase/firestoreService';
import { WeightEntry, WorkoutSession } from '../../types';
import { formatDateBR, getTodayDateString, isNotFutureDate, isStrictlyPositive } from '../../utils/validation';

export const EvolutionView: React.FC = () => {
  const { user, profile, updateProfileData } = useAuth();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(getTodayDateString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    const [weightData, workoutData] = await Promise.all([getWeightHistory(user.uid), getWorkouts(user.uid)]);
    setWeights(weightData);
    setWorkouts(workoutData);
  };

  useEffect(() => { loadData(); }, [user]);

  const orderedWeights = useMemo(() => [...weights].sort((a, b) => a.date.localeCompare(b.date)), [weights]);
  const latestWeight = orderedWeights.length ? orderedWeights[orderedWeights.length - 1].weight : profile?.currentWeight || 0;
  const previousWeight = orderedWeights.length > 1 ? orderedWeights[orderedWeights.length - 2].weight : latestWeight;
  const variation = latestWeight - previousWeight;
  const targetWeight = profile?.targetWeight || 0;

  const chartData = orderedWeights.map((item) => ({
    date: formatDateBR(item.date, { short: true }),
    peso: item.weight,
  }));

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!isNotFutureDate(newDate)) { setError('A data da pesagem não pode ser futura.'); return; }
    if (!isStrictlyPositive(newWeight)) { setError('Informe um peso válido maior que zero.'); return; }

    try {
      setSaving(true);
      const value = parseFloat(newWeight);
      await addWeightEntry({ userId: user.uid, date: newDate, weight: value });
      await updateProfileData({ currentWeight: value });
      setNewWeight('');
      await loadData();
    } catch {
      setError('Não foi possível registrar a pesagem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!user || !id) return;
    await deleteWeightEntry(user.uid, id);
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Evolução</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pequenas medições mostram tendências que o dia a dia esconde.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2"><span>Peso mais recente</span><Scale className="w-4 h-4 text-emerald-500" /></div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{latestWeight ? latestWeight.toFixed(1) : '—'} <small className="text-sm">kg</small></div>
          <p className="mt-2 text-xs text-slate-500">Última medição registrada</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2"><span>Meta de peso</span><Scale className="w-4 h-4 text-cyan-500" /></div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{targetWeight ? targetWeight.toFixed(1) : '—'} <small className="text-sm">kg</small></div>
          <p className="mt-2 text-xs text-slate-500">Definida no seu perfil</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2"><span>Variação</span>{variation <= 0 ? <TrendingDown className="w-4 h-4 text-emerald-500" /> : <TrendingUp className="w-4 h-4 text-orange-500" />}</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{variation > 0 ? '+' : ''}{variation.toFixed(1)} <small className="text-sm">kg</small></div>
          <p className="mt-2 text-xs text-slate-500">Entre as duas últimas medições</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2"><span>Sessões de treino</span><Dumbbell className="w-4 h-4 text-purple-400" /></div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{workouts.length}</div>
          <p className="mt-2 text-xs text-slate-500">Registros no seu histórico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <section className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-4"><h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Scale className="w-5 h-5 text-emerald-500" />Peso corporal</h2><p className="text-xs text-slate-500 dark:text-slate-400">Medições registradas ao longo do tempo.</p></div>
          <div className="h-72">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} unit="kg" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} formatter={(value: number) => [`${value} kg`, 'Peso']} />
                  {targetWeight > 0 && <ReferenceLine y={targetWeight} stroke="#72e5ff" strokeDasharray="4 4" label={{ value: `Meta ${targetWeight}kg`, fill: '#72e5ff', fontSize: 10 }} />}
                  <Line type="monotone" dataKey="peso" stroke="#72e5ff" strokeWidth={3} dot={{ r: 4, fill: '#72e5ff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center"><Scale className="w-10 h-10 mb-2 opacity-30" /><span>Registre pelo menos duas pesagens para visualizar a evolução.</span></div>
            )}
          </div>
        </section>

        <section className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-500" />Registrar peso</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">Adicione uma nova medição ao seu histórico.</p>
          {error && <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">{error}</div>}
          <form onSubmit={handleAddWeight} className="space-y-4">
            <div><label className="block text-xs font-medium text-slate-300 mb-1">Peso (kg)</label><input type="number" min="1" step="0.1" required value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Ex: 72.4" className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-medium text-slate-300 mb-1">Data</label><input type="date" max={getTodayDateString()} required value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm" /></div>
            <button type="submit" disabled={saving} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"><Plus className="w-4 h-4" />{saving ? 'Salvando...' : 'Salvar medição'}</button>
          </form>
        </section>
      </div>

      <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-500" />Histórico de peso</h2>
        <div className="space-y-1">
          {orderedWeights.length ? orderedWeights.slice().reverse().map((entry) => (
            <div key={entry.id || entry.date} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
              <div><div className="text-sm font-semibold text-slate-200">{formatDateBR(entry.date)}</div><div className="text-xs text-slate-500">Registrado no Body Fit</div></div>
              <div className="flex items-center gap-4"><strong className="text-sm text-cyan-300">{entry.weight.toFixed(1)} kg</strong>{entry.id && <button onClick={() => handleDelete(entry.id)} className="text-slate-500 hover:text-rose-400" title="Excluir"><Trash2 className="w-4 h-4" /></button>}</div>
            </div>
          )) : <div className="text-xs text-slate-500 py-6 text-center">Nenhuma pesagem registrada ainda.</div>}
        </div>
      </section>
    </div>
  );
};
