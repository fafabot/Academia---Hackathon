import { Exercise, FoodItem, MealEntry, WeightEntry, WorkoutSession } from '../types';

export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'userId'>[] = [
  { name: 'Supino Reto com Barra', category: 'chest', equipment: 'barbell', defaultRestSeconds: 90, notes: 'Peito, deltoide anterior e tríceps' },
  { name: 'Supino Inclinado com Halteres', category: 'chest', equipment: 'dumbbell', defaultRestSeconds: 90, notes: 'Foco em porção clavicular' },
  { name: 'Crucifixo na Polia', category: 'chest', equipment: 'cable', defaultRestSeconds: 60, notes: 'Isolamento peitoral' },
  { name: 'Puxada Alta (Lat Pulldown)', category: 'back', equipment: 'cable', defaultRestSeconds: 90, notes: 'Grande dorsal' },
  { name: 'Remada Curvada com Barra', category: 'back', equipment: 'barbell', defaultRestSeconds: 90, notes: 'Espessura de costas' },
  { name: 'Remada Baixa Triângulo', category: 'back', equipment: 'cable', defaultRestSeconds: 60, notes: 'Meio das costas e dorsais' },
  { name: 'Agachamento Livre', category: 'legs', equipment: 'barbell', defaultRestSeconds: 120, notes: 'Quadríceps, glúteos e core' },
  { name: 'Leg Press 45º', category: 'legs', equipment: 'machine', defaultRestSeconds: 90, notes: 'Volume alto de membros inferiores' },
  { name: 'Cadeira Extensora', category: 'legs', equipment: 'machine', defaultRestSeconds: 60, notes: 'Isolamento de quadríceps' },
  { name: 'Mesa Flexora', category: 'legs', equipment: 'machine', defaultRestSeconds: 60, notes: 'Isquiotibiais' },
  { name: 'Desenvolvimento Militar com Barra', category: 'shoulders', equipment: 'barbell', defaultRestSeconds: 90, notes: 'Ombros e estabilização de tronco' },
  { name: 'Elevação Lateral com Halteres', category: 'shoulders', equipment: 'dumbbell', defaultRestSeconds: 60, notes: 'Deltoide lateral' },
  { name: 'Rosca Direta com Barra W', category: 'arms', equipment: 'barbell', defaultRestSeconds: 60, notes: 'Bíceps braquial' },
  { name: 'Tríceps Polia Corda', category: 'arms', equipment: 'cable', defaultRestSeconds: 60, notes: 'Tríceps' },
  { name: 'Prancha Abdominal', category: 'core', equipment: 'bodyweight', defaultRestSeconds: 60, notes: 'Estabilidade do core' },
  { name: 'Esteira Corrida Intervalada', category: 'cardio', equipment: 'cardio_machine', defaultRestSeconds: 0, notes: 'Gasto calórico e condicionamento' },
  { name: 'Bike Ergométrica', category: 'cardio', equipment: 'cardio_machine', defaultRestSeconds: 0, notes: 'Cardio de baixo impacto articular' },
];

export const DEFAULT_FOODS: Omit<FoodItem, 'id' | 'userId'>[] = [
  { name: 'Peito de Frango Grelhado', servingSize: 100, servingUnit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { name: 'Arroz Branco Cozido', servingSize: 100, servingUnit: 'g', calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  { name: 'Ovo de Galinha Inteiro Cozido', servingSize: 1, servingUnit: 'unidade', calories: 74, protein: 6.3, carbs: 0.4, fat: 5.0, fiber: 0 },
  { name: 'Aveia em Flocos Finos', servingSize: 30, servingUnit: 'g', calories: 106, protein: 4.2, carbs: 17.0, fat: 2.2, fiber: 3.0 },
  { name: 'Whey Protein Concentrado 80%', servingSize: 30, servingUnit: 'g', calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
  { name: 'Banana Prata', servingSize: 1, servingUnit: 'unidade', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  { name: 'Pasta de Amendoim Integral', servingSize: 15, servingUnit: 'g', calories: 90, protein: 4.0, carbs: 3.0, fat: 7.5, fiber: 1.2 },
  { name: 'Batata Doce Cozida', servingSize: 100, servingUnit: 'g', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0 },
  { name: 'Azeite de Oliva Extra Virgem', servingSize: 10, servingUnit: 'ml', calories: 88, protein: 0, carbs: 0, fat: 10.0, fiber: 0 },
  { name: 'Patinho Moído Grelhado', servingSize: 100, servingUnit: 'g', calories: 219, protein: 35.9, carbs: 0, fat: 7.3, fiber: 0 },
  { name: 'Iogurte Natural Desnatado', servingSize: 170, servingUnit: 'g', calories: 75, protein: 7.0, carbs: 9.0, fat: 0.5, fiber: 0 },
];

export function getSampleHistoryData(userId: string) {
  const weightLogs: WeightEntry[] = [
    { userId, date: '2026-09-08', weight: 83.5, notes: 'Início do ciclo' },
    { userId, date: '2026-09-15', weight: 83.0, notes: 'Primeira semana consistente' },
    { userId, date: '2026-09-22', weight: 82.7, notes: 'Boa definição muscular' },
    { userId, date: '2026-09-29', weight: 82.4, notes: 'Pesagem semanal em jejum' },
    { userId, date: '2026-10-02', weight: 82.1, notes: 'Meta de recomposição avançando' },
  ];

  const workouts: WorkoutSession[] = [
    {
      userId,
      title: 'Treino A - Peitoral, Ombros e Tríceps',
      date: '2026-09-27',
      durationMinutes: 65,
      totalVolume: 7420,
      estimatedCaloriesBurned: 430,
      progressionStatus: 'evoluindo',
      progressionDiffPercent: 4.8,
      notes: 'Subi 2kg no supino reto mantendo boa técnica.',
      exercises: [
        {
          exerciseId: 'ex_1',
          exerciseName: 'Supino Reto com Barra',
          category: 'chest',
          isCardio: false,
          sets: [
            { setNumber: 1, reps: 10, weight: 80, completed: true },
            { setNumber: 2, reps: 8, weight: 84, completed: true },
            { setNumber: 3, reps: 8, weight: 84, completed: true },
          ],
        },
        {
          exerciseId: 'ex_2',
          exerciseName: 'Desenvolvimento Militar com Barra',
          category: 'shoulders',
          isCardio: false,
          sets: [
            { setNumber: 1, reps: 10, weight: 40, completed: true },
            { setNumber: 2, reps: 8, weight: 44, completed: true },
            { setNumber: 3, reps: 8, weight: 44, completed: true },
          ],
        },
      ],
    },
    {
      userId,
      title: 'Treino B - Dorsais, Trapézio e Bíceps',
      date: '2026-09-29',
      durationMinutes: 60,
      totalVolume: 8250,
      estimatedCaloriesBurned: 410,
      progressionStatus: 'evoluindo',
      progressionDiffPercent: 3.2,
      notes: 'Execução cadenciada na remada.',
      exercises: [
        {
          exerciseId: 'ex_3',
          exerciseName: 'Puxada Alta (Lat Pulldown)',
          category: 'back',
          isCardio: false,
          sets: [
            { setNumber: 1, reps: 12, weight: 65, completed: true },
            { setNumber: 2, reps: 10, weight: 70, completed: true },
            { setNumber: 3, reps: 8, weight: 75, completed: true },
          ],
        },
      ],
    },
    {
      userId,
      title: 'Treino C - Membros Inferiores e Cardio',
      date: '2026-10-01',
      durationMinutes: 75,
      totalVolume: 9800,
      estimatedCaloriesBurned: 580,
      progressionStatus: 'evoluindo',
      progressionDiffPercent: 5.1,
      notes: 'Agachamento com amplitude completa + 20min esteira.',
      exercises: [
        {
          exerciseId: 'ex_4',
          exerciseName: 'Agachamento Livre',
          category: 'legs',
          isCardio: false,
          sets: [
            { setNumber: 1, reps: 10, weight: 100, completed: true },
            { setNumber: 2, reps: 8, weight: 110, completed: true },
            { setNumber: 3, reps: 6, weight: 120, completed: true },
          ],
        },
        {
          exerciseId: 'ex_cardio',
          exerciseName: 'Esteira Corrida Intervalada',
          category: 'cardio',
          isCardio: true,
          sets: [],
          cardioMinutes: 20,
          cardioIntensity: 'high',
          cardioDistanceKm: 3.2,
        },
      ],
    },
  ];

  const meals: MealEntry[] = [
    {
      userId,
      date: '2026-10-01',
      mealType: 'cafe_da_manha',
      totalCalories: 480,
      totalProtein: 32,
      totalCarbs: 58,
      totalFat: 12,
      items: [
        { foodId: 'f_aveia', name: 'Aveia em Flocos Finos', quantity: 45, calories: 159, protein: 6.3, carbs: 25.5, fat: 3.3 },
        { foodId: 'f_whey', name: 'Whey Protein Concentrado 80%', quantity: 30, calories: 120, protein: 24, carbs: 3, fat: 1.5 },
        { foodId: 'f_banana', name: 'Banana Prata', quantity: 1, calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
        { foodId: 'f_amendoim', name: 'Pasta de Amendoim Integral', quantity: 18, calories: 108, protein: 4.8, carbs: 3.6, fat: 9.0 },
      ],
    },
    {
      userId,
      date: '2026-10-01',
      mealType: 'almoco',
      totalCalories: 690,
      totalProtein: 55,
      totalCarbs: 72,
      totalFat: 16,
      items: [
        { foodId: 'f_frango', name: 'Peito de Frango Grelhado', quantity: 160, calories: 264, protein: 49.6, carbs: 0, fat: 5.7 },
        { foodId: 'f_arroz', name: 'Arroz Branco Cozido', quantity: 220, calories: 286, protein: 5.9, carbs: 62.0, fat: 0.7 },
        { foodId: 'f_azeite', name: 'Azeite de Oliva Extra Virgem', quantity: 12, calories: 105, protein: 0, carbs: 0, fat: 12.0 },
      ],
    },
    {
      userId,
      date: '2026-10-01',
      mealType: 'jantar',
      totalCalories: 620,
      totalProtein: 48,
      totalCarbs: 65,
      totalFat: 14,
      items: [
        { foodId: 'f_patinho', name: 'Patinho Moído Grelhado', quantity: 140, calories: 306, protein: 50.2, carbs: 0, fat: 10.2 },
        { foodId: 'f_batata', name: 'Batata Doce Cozida', quantity: 250, calories: 215, protein: 4.0, carbs: 50.2, fat: 0.2 },
      ],
    },
  ];

  return { weightLogs, workouts, meals };
}
