export type ThemeMode = 'dark' | 'light';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  targetWeight: number; // kg
  dailyCalorieGoal: number; // kcal
  currentWeight: number; // kg
  height: number; // cm
  activityLevel: ActivityLevel;
  themePreference: ThemeMode;
  createdAt: string;
  updatedAt: string;
}

export interface WeightEntry {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  notes?: string;
  createdAt?: string;
}

export type ExerciseCategory = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
export type EquipmentType = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'cardio_machine' | 'other';

export interface Exercise {
  id?: string;
  userId: string;
  name: string;
  category: ExerciseCategory;
  equipment: EquipmentType;
  defaultRestSeconds?: number;
  notes?: string;
  createdAt?: string;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weight: number; // kg
  rpe?: number; // 1-10
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  isCardio: boolean;
  sets: WorkoutSet[];
  cardioMinutes?: number;
  cardioDistanceKm?: number;
  cardioIntensity?: 'low' | 'moderate' | 'high';
  notes?: string;
}

export type ProgressionStatus = 'evoluindo' | 'estagnado' | 'regredindo';

export interface WorkoutSession {
  id?: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  exercises: WorkoutExercise[];
  totalVolume: number; // sum of reps * weight across sets
  estimatedCaloriesBurned: number;
  progressionStatus?: ProgressionStatus;
  progressionDiffPercent?: number;
  notes?: string;
  createdAt?: string;
}

export interface FoodItem {
  id?: string;
  userId: string;
  name: string;
  brand?: string;
  servingSize: number; // in g or ml
  servingUnit: 'g' | 'ml' | 'unidade';
  calories: number; // kcal per serving
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number;
  createdAt?: string;
}

export type MealType = 'cafe_da_manha' | 'almoco' | 'lanche' | 'jantar' | 'ceia';

export interface MealFoodItem {
  foodId: string;
  name: string;
  quantity: number; // grams or units
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  items: MealFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  createdAt?: string;
}

export interface IntegratedDayData {
  date: string; // YYYY-MM-DD
  weight?: number;
  caloriesConsumed: number;
  caloriesBurnedWorkout: number;
  estimatedTDEE: number;
  netCalorieBalance: number;
  workoutVolume: number;
  workoutDuration: number;
  workoutsCount: number;
  mealsCount: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
}
