import React, { useState, useEffect } from 'react';
import {
  Apple,
  Plus,
  Trash2,
  Flame,
  Scale,
  Calendar,
  Utensils,
  Dumbbell,
  AlertCircle,
  CheckCircle2,
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import {
  getFoods,
  addFood,
  deleteFood,
  getMeals,
  addMeal,
  deleteMeal,
  getWorkouts,
} from '../../firebase/firestoreService';
import {
  FoodItem,
  MealEntry,
  MealType,
  MealFoodItem,
  WorkoutSession,
} from '../../types';
import { DEFAULT_FOODS } from '../../data/seedData';
import {
  formatDateBR,
  formatNumberBR,
  getTodayDateString,
  isNotFutureDate,
  isStrictlyPositive,
  isNonNegative,
} from '../../utils/validation';
import { calculateDailyTDEE } from '../../utils/calculations';

export const DietView: React.FC = () => {
  const { user, profile } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'diary' | 'new-meal' | 'food-library'>('diary');
  
  // Data states
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);

  // Selected date for diary view
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  // New Meal Form
  const [newMealDate, setNewMealDate] = useState(getTodayDateString());
  const [newMealType, setNewMealType] = useState<MealType>('almoco');
  const [mealItems, setMealItems] = useState<MealFoodItem[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('100');
  const [mealNotes, setMealNotes] = useState('');
  const [mealFormError, setMealFormError] = useState<string | null>(null);
  const [mealSuccess, setMealSuccess] = useState<string | null>(null);
  const [savingMeal, setSavingMeal] = useState(false);

  // New Food Item Form
  const [foodName, setFoodName] = useState('');
  const [foodBrand, setFoodBrand] = useState('');
  const [foodServing, setFoodServing] = useState('100');
  const [foodUnit, setFoodUnit] = useState<'g' | 'ml' | 'unidade'>('g');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [foodFiber, setFoodFiber] = useState('');
  const [foodFormError, setFoodFormError] = useState<string | null>(null);
  const [savingFood, setSavingFood] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const [foodList, mealList, workoutList] = await Promise.all([
      getFoods(user.uid),
      getMeals(user.uid),
      getWorkouts(user.uid),
    ]);

    if (foodList.length === 0) {
      const defaultPromises = DEFAULT_FOODS.map((item) =>
        addFood({ ...item, userId: user.uid })
      );
      const seeded = await Promise.all(defaultPromises);
      setFoods(seeded);
    } else {
      setFoods(foodList);
    }

    setMeals(mealList);
    setWorkouts(workoutList);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Add food item to meal in construction
  const handleAddFoodToMeal = () => {
    if (!selectedFoodId) return;
    const food = foods.find((f) => f.id === selectedFoodId);
    if (!food) return;

    if (!isStrictlyPositive(selectedQuantity)) {
      setMealFormError('A quantidade do alimento deve ser maior que zero.');
      return;
    }

    const qty = parseFloat(selectedQuantity);
    const ratio = qty / (food.servingSize || 100);

    const item: MealFoodItem = {
      foodId: food.id || '',
      name: food.name,
      quantity: qty,
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
    };

    setMealItems([...mealItems, item]);
    setSelectedFoodId('');
    setSelectedQuantity('100');
    setMealFormError(null);
  };

  const handleRemoveFoodFromMeal = (index: number) => {
    setMealItems(mealItems.filter((_, i) => i !== index));
  };

  // Calculations for meal in composition
  const currentMealCalories = mealItems.reduce((acc, it) => acc + it.calories, 0);
  const currentMealProtein = mealItems.reduce((acc, it) => acc + it.protein, 0);
  const currentMealCarbs = mealItems.reduce((acc, it) => acc + it.carbs, 0);
  const currentMealFat = mealItems.reduce((acc, it) => acc + it.fat, 0);

  // Save Meal
  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setMealFormError(null);
    setMealSuccess(null);

    if (!user) return;

    if (!isNotFutureDate(newMealDate)) {
      setMealFormError('A data da refeição não pode ser futura.');
      return;
    }

    if (mealItems.length === 0) {
      setMealFormError('Adicione pelo menos um alimento à refeição.');
      return;
    }

    try {
      setSavingMeal(true);
      await addMeal({
        userId: user.uid,
        date: newMealDate,
        mealType: newMealType,
        items: mealItems,
        totalCalories: currentMealCalories,
        totalProtein: Math.round(currentMealProtein * 10) / 10,
        totalCarbs: Math.round(currentMealCarbs * 10) / 10,
        totalFat: Math.round(currentMealFat * 10) / 10,
        notes: mealNotes.trim() || undefined,
      });

      setMealSuccess('Refeição registrada com sucesso no seu diário!');
      setMealItems([]);
      setMealNotes('');
      await loadData();
      setSelectedDate(newMealDate);
      setActiveSubTab('diary');
    } catch (err: any) {
      console.error('Erro ao registrar refeição:', err);
      if (err?.code === 'permission-denied') {
        setMealFormError('O Firebase recusou a gravação. Verifique se a autenticação está ativa.');
      } else {
        setMealFormError('Não foi possível salvar a refeição. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setSavingMeal(false);
    }
  };

  const handleDeleteMeal = async (id?: string) => {
    if (!user || !id) return;
    await deleteMeal(user.uid, id);
    await loadData();
  };

  // Create new Food in Library
  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setFoodFormError(null);
    if (!user) return;

    if (!foodName.trim()) {
      setFoodFormError('O nome do alimento é obrigatório.');
      return;
    }

    if (!isStrictlyPositive(foodServing)) {
      setFoodFormError('A porção deve ser maior que zero (ex: 100g ou 1 unidade).');
      return;
    }

    if (!isNonNegative(foodCalories) || !isNonNegative(foodProtein) || !isNonNegative(foodCarbs) || !isNonNegative(foodFat)) {
      setFoodFormError('Calorias, proteínas, carboidratos e gorduras devem ser valores numéricos positivos ou zero.');
      return;
    }

    try {
      setSavingFood(true);
      await addFood({
        userId: user.uid,
        name: foodName.trim(),
        brand: foodBrand.trim() || undefined,
        servingSize: parseFloat(foodServing),
        servingUnit: foodUnit,
        calories: parseFloat(foodCalories),
        protein: parseFloat(foodProtein),
        carbs: parseFloat(foodCarbs),
        fat: parseFloat(foodFat),
        fiber: foodFiber ? parseFloat(foodFiber) : undefined,
      });

      setFoodName('');
      setFoodBrand('');
      setFoodCalories('');
      setFoodProtein('');
      setFoodCarbs('');
      setFoodFat('');
      setFoodFiber('');
      await loadData();
    } catch (err: any) {
      setFoodFormError('Erro ao cadastrar alimento.');
    } finally {
      setSavingFood(false);
    }
  };

  const handleDeleteFood = async (id?: string) => {
    if (!user || !id) return;
    await deleteFood(user.uid, id);
    await loadData();
  };

  // Diary calculations for selected date
  const mealsOnDate = meals.filter((m) => m.date === selectedDate);
  const workoutsOnDate = workouts.filter((w) => w.date === selectedDate);

  const dayCaloriesConsumed = mealsOnDate.reduce((acc, m) => acc + m.totalCalories, 0);
  const dayProtein = mealsOnDate.reduce((acc, m) => acc + m.totalProtein, 0);
  const dayCarbs = mealsOnDate.reduce((acc, m) => acc + m.totalCarbs, 0);
  const dayFat = mealsOnDate.reduce((acc, m) => acc + m.totalFat, 0);

  const workoutCaloriesBurned = workoutsOnDate.reduce((acc, w) => acc + (w.estimatedCaloriesBurned || 0), 0);
  const estimatedTDEE = calculateDailyTDEE(profile || {});
  const totalDailyExpenditure = estimatedTDEE + workoutCaloriesBurned;

  // Caloric Balance = Ingestão - (Gasto Basal/Rotina + Treino)
  const netBalance = dayCaloriesConsumed - totalDailyExpenditure;
  const targetCalories = profile?.dailyCalorieGoal || 2200;
  const calorieGoalDiff = dayCaloriesConsumed - targetCalories;

  // Macro pie chart data
  const macroChartData = [
    { name: 'Proteína', value: Math.round(dayProtein * 4), color: '#3b82f6', grams: dayProtein },
    { name: 'Carboidratos', value: Math.round(dayCarbs * 4), color: '#10b981', grams: dayCarbs },
    { name: 'Gorduras', value: Math.round(dayFat * 9), color: '#f59e0b', grams: dayFat },
  ].filter((d) => d.value > 0);

  const getMealTypeLabel = (type: MealType) => {
    switch (type) {
      case 'cafe_da_manha':
        return 'Café da Manhã';
      case 'almoco':
        return 'Almoço';
      case 'lanche':
        return 'Lanche da Tarde';
      case 'jantar':
        return 'Jantar';
      case 'ceia':
        return 'Ceia Noturna';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Apple className="w-8 h-8 text-emerald-500" />
            Módulo Dieta & Balanço Calórico
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Controle de macronutrientes, biblioteca de alimentos e balanço energético integrado aos treinos.
          </p>
        </div>

        {/* Subtabs Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('diary')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSubTab === 'diary'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Diário do Dia
          </button>
          <button
            onClick={() => setActiveSubTab('new-meal')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSubTab === 'new-meal'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Nova Refeição
          </button>
          <button
            onClick={() => setActiveSubTab('food-library')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSubTab === 'food-library'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Alimentos ({foods.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DIARY & CALORIC BALANCE GAUGE */}
      {activeSubTab === 'diary' && (
        <div className="space-y-8">
          
          {/* Date Selector Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Data do Diário:
              </span>
              <input
                type="date"
                max={getTodayDateString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => {
                setNewMealDate(selectedDate);
                setActiveSubTab('new-meal');
              }}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Refeição</span>
            </button>
          </div>

          {/* Caloric Balance KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Calories Consumed */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Calorias Consumidas
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatNumberBR(dayCaloriesConsumed)}
                </span>
                <span className="text-xs text-slate-500">kcal</span>
              </div>
              <span className="text-xs text-slate-400 mt-2 block">
                Meta do Perfil: {formatNumberBR(targetCalories)} kcal
              </span>
            </div>

            {/* Workout Burn */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Flame className="w-4 h-4" />
                Gasto dos Treinos
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-orange-500">
                  {workoutCaloriesBurned > 0 ? `-${formatNumberBR(workoutCaloriesBurned)}` : '0'}
                </span>
                <span className="text-xs text-slate-500">kcal queimadas</span>
              </div>
              <span className="text-xs text-slate-400 mt-2 block">
                {workoutsOnDate.length} treino(s) registrado(s) no dia
              </span>
            </div>

            {/* Total Daily Expenditure */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Gasto Diário Total (TDEE)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatNumberBR(totalDailyExpenditure)}
                </span>
                <span className="text-xs text-slate-500">kcal estimadas</span>
              </div>
              <span className="text-xs text-slate-400 mt-2 block">
                Basal ({estimatedTDEE} kcal) + Treinos
              </span>
            </div>

            {/* Caloric Balance */}
            <div
              className={`p-5 rounded-2xl border shadow-sm ${
                netBalance < -100
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                  : netBalance > 100
                  ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider block mb-1 flex items-center gap-1">
                {netBalance < -100 && <TrendingDown className="w-4 h-4 text-emerald-400" />}
                {netBalance > 100 && <TrendingUp className="w-4 h-4 text-amber-400" />}
                {Math.abs(netBalance) <= 100 && <Minus className="w-4 h-4 text-cyan-400" />}
                Balanço Calórico Líquido
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">
                  {netBalance > 0 ? `+${formatNumberBR(netBalance)}` : formatNumberBR(netBalance)}
                </span>
                <span className="text-xs opacity-75">kcal</span>
              </div>
              <span className="text-xs font-medium mt-2 block">
                {netBalance < -150
                  ? 'Déficit Calórico (Queima de gordura)'
                  : netBalance > 150
                  ? 'Superávit Calórico (Construção/Massa)'
                  : 'Equilíbrio / Manutenção'}
              </span>
            </div>
          </div>

          {/* Meals & Macros Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Meals of the Day (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-500" />
                Refeições Registradas em {formatDateBR(selectedDate)}
              </h2>

              {mealsOnDate.length === 0 ? (
                <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-3">
                  <Utensils className="w-8 h-8 mx-auto opacity-30 text-emerald-500" />
                  <p>Nenhuma refeição registrada para esta data.</p>
                  <button
                    onClick={() => {
                      setNewMealDate(selectedDate);
                      setActiveSubTab('new-meal');
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-sm hover:bg-emerald-600 transition"
                  >
                    Adicionar Refeição Agora
                  </button>
                </div>
              ) : (
                mealsOnDate.map((meal) => (
                  <div
                    key={meal.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase">
                          {getMealTypeLabel(meal.mealType)}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {formatNumberBR(meal.totalCalories)} kcal
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition"
                        title="Excluir refeição"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Macro pills */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>P: <strong className="text-blue-500">{meal.totalProtein}g</strong></span>
                      <span>C: <strong className="text-emerald-500">{meal.totalCarbs}g</strong></span>
                      <span>G: <strong className="text-amber-500">{meal.totalFat}g</strong></span>
                    </div>

                    {/* Food Items List */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 pt-1">
                      {meal.items.map((it, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {it.name} <span className="text-slate-400">({it.quantity}g/unid)</span>
                          </span>
                          <span className="font-semibold text-slate-500">
                            {it.calories} kcal
                          </span>
                        </div>
                      ))}
                    </div>

                    {meal.notes && (
                      <p className="text-xs text-slate-400 italic pt-1">
                        "{meal.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Macros Distribution Chart (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-500" />
                  Distribuição de Macros
                </h3>

                <div className="h-48 w-full flex items-center justify-center">
                  {macroChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={macroChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={5}
                        >
                          {macroChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: string, item: any) => [
                            `${item.payload.grams}g (${value} kcal)`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-slate-400 text-xs">
                      Sem refeições para detalhar macros.
                    </div>
                  )}
                </div>

                {/* Macro metrics summary */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Proteínas
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatNumberBR(dayProtein)} g
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Carboidratos
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatNumberBR(dayCarbs)} g
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Gorduras
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatNumberBR(dayFat)} g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: REGISTER NEW MEAL */}
      {activeSubTab === 'new-meal' && (
        <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Registrar Refeição
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monte sua refeição selecionando os alimentos e a quantidade em gramas ou unidades.
            </p>
          </div>

          {mealFormError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{mealFormError}</span>
            </div>
          )}

          {mealSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{mealSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveMeal} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data (sem datas futuras) *
                </label>
                <input
                  type="date"
                  required
                  max={getTodayDateString()}
                  value={newMealDate}
                  onChange={(e) => setNewMealDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Refeição *
                </label>
                <select
                  value={newMealType}
                  onChange={(e) => setNewMealType(e.target.value as MealType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cafe_da_manha">Café da Manhã</option>
                  <option value="almoco">Almoço</option>
                  <option value="lanche">Lanche da Tarde</option>
                  <option value="jantar">Jantar</option>
                  <option value="ceia">Ceia Noturna</option>
                </select>
              </div>
            </div>

            {/* Food Selector Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Adicionar Alimento à Refeição
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-7">
                  <select
                    value={selectedFoodId}
                    onChange={(e) => setSelectedFoodId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="">Selecione um alimento cadastrado...</option>
                    {foods.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.calories} kcal / {f.servingSize}{f.servingUnit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Qtd (g ou unid)"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddFoodToMeal}
                    disabled={!selectedFoodId}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Items List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 block">
                Itens Adicionados ({mealItems.length})
              </span>
              {mealItems.length === 0 ? (
                <div className="p-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                  Nenhum alimento selecionado. Use o seletor acima para adicionar itens.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
                  {mealItems.map((it, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {it.name}
                        </span>
                        <span className="text-slate-400 ml-2">
                          ({it.quantity}g/unid) — P: {it.protein}g | C: {it.carbs}g | G: {it.fat}g
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {it.calories} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFoodFromMeal(idx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Totals footer */}
                  <div className="pt-3 flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700">
                    <span>Total da Refeição:</span>
                    <span className="text-emerald-500 text-sm">
                      {currentMealCalories} kcal (P: {formatNumberBR(currentMealProtein)}g | C: {formatNumberBR(currentMealCarbs)}g | G: {formatNumberBR(currentMealFat)}g)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Observações (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Refeição pré-treino 1h antes da academia"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingMeal || mealItems.length === 0}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{savingMeal ? 'Gravando...' : 'Salvar Refeição no Diário'}</span>
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 3: FOOD LIBRARY */}
      {activeSubTab === 'food-library' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create new food item (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Cadastrar Novo Alimento
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Cadastre informações nutricionais de alimentos e suplementos para montar suas refeições.
              </p>

              {foodFormError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{foodFormError}</span>
                </div>
              )}

              <form onSubmit={handleCreateFood} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Alimento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Filé de Tilápia Grelhado"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Porção Referência *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={foodServing}
                      onChange={(e) => setFoodServing(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Unidade *
                    </label>
                    <select
                      value={foodUnit}
                      onChange={(e) => setFoodUnit(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <option value="g">Gramas (g)</option>
                      <option value="ml">Mililitros (ml)</option>
                      <option value="unidade">Unidade</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Calorias (kcal) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      placeholder="Ex: 120"
                      value={foodCalories}
                      onChange={(e) => setFoodCalories(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Proteínas (g) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      placeholder="Ex: 26"
                      value={foodProtein}
                      onChange={(e) => setFoodProtein(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Carboidratos (g) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      placeholder="Ex: 0"
                      value={foodCarbs}
                      onChange={(e) => setFoodCarbs(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Gorduras (g) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      placeholder="Ex: 2"
                      value={foodFat}
                      onChange={(e) => setFoodFat(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingFood}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{savingFood ? 'Cadastrando...' : 'Salvar Alimento na Tabela'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Food Catalog List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Tabela de Alimentos Cadastrados ({foods.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Valores nutricionais parametrizados por porção.
              </p>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                {foods.map((food) => (
                  <div key={food.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {food.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Porção: {food.servingSize}{food.servingUnit} • {food.calories} kcal (P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g)
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFood(food.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Excluir alimento"
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
