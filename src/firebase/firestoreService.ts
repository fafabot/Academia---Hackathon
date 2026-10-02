import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, isConfigured } from './config';
import {
  UserProfile,
  WeightEntry,
  Exercise,
  WorkoutSession,
  FoodItem,
  MealEntry,
} from '../types';

// ==========================================
// User Profile
// ==========================================

export async function createUserProfileDoc(profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, profile);
  } catch (error) {
    console.warn('Firestore createUserProfileDoc error (fallback to local):', error);
    localStorage.setItem(`profile_${profile.uid}`, JSON.stringify(profile));
  }
}

export async function getUserProfileDoc(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    console.warn('Firestore getUserProfileDoc error (reading local):', error);
  }
  const local = localStorage.getItem(`profile_${uid}`);
  return local ? JSON.parse(local) : null;
}

export async function updateUserProfileDoc(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Firestore updateUserProfileDoc error:', error);
  }
  // Also keep local sync
  const current = await getUserProfileDoc(uid);
  if (current) {
    localStorage.setItem(`profile_${uid}`, JSON.stringify({ ...current, ...data, updatedAt: new Date().toISOString() }));
  }
}

// ==========================================
// Weight History
// ==========================================

export async function getWeightHistory(userId: string): Promise<WeightEntry[]> {
  try {
    const colRef = collection(db, 'users', userId, 'weightHistory');
    const q = query(colRef, orderBy('date', 'asc'));
    const snap = await getDocs(q);
    const items: WeightEntry[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as WeightEntry) }));
    if (items.length > 0) return items;
  } catch (error) {
    console.warn('Firestore getWeightHistory error:', error);
  }
  const local = localStorage.getItem(`weights_${userId}`);
  return local ? JSON.parse(local) : [];
}

export async function addWeightEntry(entry: WeightEntry): Promise<WeightEntry> {
  let createdEntry = { ...entry, createdAt: new Date().toISOString() };
  try {
    const colRef = collection(db, 'users', entry.userId, 'weightHistory');
    const docRef = await addDoc(colRef, createdEntry);
    createdEntry.id = docRef.id;
  } catch (error) {
    console.warn('Firestore addWeightEntry error (fallback local):', error);
    createdEntry.id = 'w_' + Date.now();
  }
  const list = await getWeightHistory(entry.userId);
  const updated = [...list.filter((w) => w.id !== createdEntry.id), createdEntry].sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(`weights_${entry.userId}`, JSON.stringify(updated));
  return createdEntry;
}

export async function deleteWeightEntry(userId: string, entryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'weightHistory', entryId));
  } catch (error) {
    console.warn('Firestore deleteWeightEntry error:', error);
  }
  const list = await getWeightHistory(userId);
  localStorage.setItem(`weights_${userId}`, JSON.stringify(list.filter((w) => w.id !== entryId)));
}

// ==========================================
// Exercises
// ==========================================

export async function getExercises(userId: string): Promise<Exercise[]> {
  try {
    const colRef = collection(db, 'users', userId, 'exercises');
    const q = query(colRef, orderBy('name', 'asc'));
    const snap = await getDocs(q);
    const items: Exercise[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Exercise) }));
    if (items.length > 0) return items;
  } catch (error) {
    console.warn('Firestore getExercises error:', error);
  }
  const local = localStorage.getItem(`exercises_${userId}`);
  return local ? JSON.parse(local) : [];
}

export async function addExercise(exercise: Exercise): Promise<Exercise> {
  let created = { ...exercise, createdAt: new Date().toISOString() };
  try {
    const colRef = collection(db, 'users', exercise.userId, 'exercises');
    const docRef = await addDoc(colRef, created);
    created.id = docRef.id;
  } catch (error) {
    console.warn('Firestore addExercise error (fallback local):', error);
    created.id = 'ex_' + Date.now();
  }
  const list = await getExercises(exercise.userId);
  const updated = [...list.filter((e) => e.id !== created.id), created].sort((a, b) => a.name.localeCompare(b.name));
  localStorage.setItem(`exercises_${exercise.userId}`, JSON.stringify(updated));
  return created;
}

export async function deleteExercise(userId: string, exerciseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'exercises', exerciseId));
  } catch (error) {
    console.warn('Firestore deleteExercise error:', error);
  }
  const list = await getExercises(userId);
  localStorage.setItem(`exercises_${userId}`, JSON.stringify(list.filter((e) => e.id !== exerciseId)));
}

// ==========================================
// Workouts
// ==========================================

export async function getWorkouts(userId: string): Promise<WorkoutSession[]> {
  try {
    const colRef = collection(db, 'users', userId, 'workouts');
    const q = query(colRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    const items: WorkoutSession[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as WorkoutSession) }));
    if (items.length > 0) return items;
  } catch (error) {
    console.warn('Firestore getWorkouts error:', error);
  }
  const local = localStorage.getItem(`workouts_${userId}`);
  return local ? JSON.parse(local) : [];
}

export async function addWorkout(workout: WorkoutSession): Promise<WorkoutSession> {
  let created = { ...workout, createdAt: new Date().toISOString() };
  try {
    const colRef = collection(db, 'users', workout.userId, 'workouts');
    const docRef = await addDoc(colRef, created);
    created.id = docRef.id;
  } catch (error) {
    console.warn('Firestore addWorkout error (fallback local):', error);
    created.id = 'wko_' + Date.now();
  }
  const list = await getWorkouts(workout.userId);
  const updated = [created, ...list.filter((w) => w.id !== created.id)].sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(`workouts_${workout.userId}`, JSON.stringify(updated));
  return created;
}

export async function deleteWorkout(userId: string, workoutId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'workouts', workoutId));
  } catch (error) {
    console.warn('Firestore deleteWorkout error:', error);
  }
  const list = await getWorkouts(userId);
  localStorage.setItem(`workouts_${userId}`, JSON.stringify(list.filter((w) => w.id !== workoutId)));
}

// ==========================================
// Foods
// ==========================================

export async function getFoods(userId: string): Promise<FoodItem[]> {
  try {
    const colRef = collection(db, 'users', userId, 'foods');
    const q = query(colRef, orderBy('name', 'asc'));
    const snap = await getDocs(q);
    const items: FoodItem[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as FoodItem) }));
    if (items.length > 0) return items;
  } catch (error) {
    console.warn('Firestore getFoods error:', error);
  }
  const local = localStorage.getItem(`foods_${userId}`);
  return local ? JSON.parse(local) : [];
}

export async function addFood(food: FoodItem): Promise<FoodItem> {
  let created = { ...food, createdAt: new Date().toISOString() };
  try {
    const colRef = collection(db, 'users', food.userId, 'foods');
    const docRef = await addDoc(colRef, created);
    created.id = docRef.id;
  } catch (error) {
    console.warn('Firestore addFood error (fallback local):', error);
    created.id = 'food_' + Date.now();
  }
  const list = await getFoods(food.userId);
  const updated = [...list.filter((f) => f.id !== created.id), created].sort((a, b) => a.name.localeCompare(b.name));
  localStorage.setItem(`foods_${food.userId}`, JSON.stringify(updated));
  return created;
}

export async function deleteFood(userId: string, foodId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'foods', foodId));
  } catch (error) {
    console.warn('Firestore deleteFood error:', error);
  }
  const list = await getFoods(userId);
  localStorage.setItem(`foods_${userId}`, JSON.stringify(list.filter((f) => f.id !== foodId)));
}

// ==========================================
// Meals
// ==========================================

export async function getMeals(userId: string): Promise<MealEntry[]> {
  try {
    const colRef = collection(db, 'users', userId, 'meals');
    const q = query(colRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    const items: MealEntry[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as MealEntry) }));
    if (items.length > 0) return items;
  } catch (error) {
    console.warn('Firestore getMeals error:', error);
  }
  const local = localStorage.getItem(`meals_${userId}`);
  return local ? JSON.parse(local) : [];
}

export async function addMeal(meal: MealEntry): Promise<MealEntry> {
  let created = { ...meal, createdAt: new Date().toISOString() };
  try {
    const colRef = collection(db, 'users', meal.userId, 'meals');
    const docRef = await addDoc(colRef, created);
    created.id = docRef.id;
  } catch (error) {
    console.warn('Firestore addMeal error (fallback local):', error);
    created.id = 'meal_' + Date.now();
  }
  const list = await getMeals(meal.userId);
  const updated = [created, ...list.filter((m) => m.id !== created.id)].sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(`meals_${meal.userId}`, JSON.stringify(updated));
  return created;
}

export async function deleteMeal(userId: string, mealId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'meals', mealId));
  } catch (error) {
    console.warn('Firestore deleteMeal error:', error);
  }
  const list = await getMeals(userId);
  localStorage.setItem(`meals_${userId}`, JSON.stringify(list.filter((m) => m.id !== mealId)));
}
