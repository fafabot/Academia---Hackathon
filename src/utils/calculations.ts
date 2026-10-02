import { ActivityLevel, ProgressionStatus, UserProfile, WorkoutExercise, WorkoutSession } from '../types';

/**
 * Calculates total volume (Load x Reps) for a list of workout exercises
 */
export function calculateWorkoutVolume(exercises: WorkoutExercise[]): number {
  let volume = 0;
  for (const ex of exercises) {
    if (!ex.isCardio && ex.sets) {
      for (const set of ex.sets) {
        if (set.completed && set.weight > 0 && set.reps > 0) {
          volume += set.weight * set.reps;
        }
      }
    }
  }
  return volume;
}

/**
 * Estimates workout calories burned based on duration, body weight, and cardio
 */
export function estimateWorkoutCalories(
  durationMinutes: number,
  userWeightKg: number,
  exercises: WorkoutExercise[]
): number {
  if (durationMinutes <= 0) return 0;
  const weight = userWeightKg > 0 ? userWeightKg : 75; // fallback 75kg

  let totalCardioMinutes = 0;
  let cardioCalories = 0;

  for (const ex of exercises) {
    if (ex.isCardio && ex.cardioMinutes && ex.cardioMinutes > 0) {
      totalCardioMinutes += ex.cardioMinutes;
      const intensity = ex.cardioIntensity || 'moderate';
      const met = intensity === 'high' ? 10 : intensity === 'moderate' ? 7 : 4.5;
      cardioCalories += (met * 3.5 * weight / 200) * ex.cardioMinutes;
    }
  }

  const resistanceMinutes = Math.max(0, durationMinutes - totalCardioMinutes);
  // Resistance training MET ~ 5.5
  const resistanceCalories = (5.5 * 3.5 * weight / 200) * resistanceMinutes;

  return Math.round(cardioCalories + resistanceCalories);
}

/**
 * Determines progression status by comparing current workout session with previous session(s)
 */
export function evaluateProgression(
  currentVolume: number,
  previousVolume?: number
): { status: ProgressionStatus; diffPercent: number; description: string } {
  if (previousVolume === undefined || previousVolume === null || previousVolume === 0) {
    return {
      status: 'estagnado',
      diffPercent: 0,
      description: 'Primeiro registro nesta categoria para comparação de volume.',
    };
  }

  const diff = currentVolume - previousVolume;
  const diffPercent = Math.round((diff / previousVolume) * 1000) / 10; // 1 decimal

  if (diffPercent >= 2) {
    return {
      status: 'evoluindo',
      diffPercent,
      description: `Evolução de +${diffPercent}% de tonelagem/volume em relação ao treino anterior! Excelente sobrecarga progressiva.`,
    };
  } else if (diffPercent <= -2) {
    return {
      status: 'regredindo',
      diffPercent,
      description: `Redução de ${Math.abs(diffPercent)}% de volume em relação ao treino anterior. Avalie fadiga ou ajuste de intensidade.`,
    };
  } else {
    return {
      status: 'estagnado',
      diffPercent,
      description: `Volume mantido estável (${diffPercent >= 0 ? '+' : ''}${diffPercent}%). Ideal para consolidação de carga.`,
    };
  }
}

/**
 * Calculates estimated Basal Metabolic Rate (BMR) and Maintenance TDEE
 */
export function calculateBMR(weightKg: number, heightCm: number, age = 28): number {
  if (weightKg <= 0 || heightCm <= 0) return 1800;
  // Mifflin-St Jeor (standard median approximation)
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

export function getActivityMultiplier(level?: ActivityLevel): number {
  switch (level) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'very_active':
      return 1.725;
    case 'extra_active':
      return 1.9;
    default:
      return 1.4;
  }
}

export function calculateDailyTDEE(user: Partial<UserProfile>): number {
  const weight = user.currentWeight || user.targetWeight || 75;
  const height = user.height || 175;
  const bmr = calculateBMR(weight, height);
  const multiplier = getActivityMultiplier(user.activityLevel);
  return Math.round(bmr * multiplier);
}

/**
 * Correlates workout and diet metrics to generate actionable behavioral insights
 */
export function generateIntegratedInsights(
  avgDailyCalories: number,
  targetCalories: number,
  totalWorkoutVolume: number,
  workoutsCount: number,
  weightDelta: number,
  avgNetBalance: number
): {
  headline: string;
  badge: 'success' | 'warning' | 'info' | 'purple';
  diagnosis: string;
  recommendations: string[];
} {
  const isCalorieDeficit = avgNetBalance < -150;
  const isCalorieSurplus = avgNetBalance > 150;
  const isWeightDown = weightDelta < -0.3;
  const isWeightUp = weightDelta > 0.3;

  if (isCalorieDeficit && isWeightDown && totalWorkoutVolume > 0) {
    return {
      headline: 'Definição e Preservação de Massa Magra',
      badge: 'success',
      diagnosis: 'Você está em déficit calórico consistente enquanto mantém estímulo de treino. Isso otimiza a perda de gordura minimizando perda muscular.',
      recommendations: [
        'Mantenha ingestão de proteínas alta (1.8g a 2.2g por kg).',
        'Priorize a manutenção das cargas nos exercícios compostos mesmo em restrição calórica.',
        'Garanta pelo menos 7 a 8 horas de sono para reparação muscular.',
      ],
    };
  }

  if (isCalorieSurplus && isWeightUp && totalWorkoutVolume > 0) {
    return {
      headline: 'Hipertrofia Ativa (Superávit Controlado)',
      badge: 'purple',
      diagnosis: 'O balanço calórico positivo está sustentando treinos com alto volume e estimulando ganho ponderal.',
      recommendations: [
        'Monitore a progressão contínua de carga para que o ganho seja prioritariamente massa muscular.',
        'Mantenha o superávit entre 250 e 400 kcal/dia para evitar acúmulo excessivo de gordura.',
        'Distribua carboidratos perto do horário de treino para maximizar o rendimento.',
      ],
    };
  }

  if (isCalorieDeficit && !isWeightDown && totalWorkoutVolume > 5000) {
    return {
      headline: 'Possível Recomposição Corporal ou Retenção Hídrica',
      badge: 'info',
      diagnosis: 'O peso na balança oscilou pouco apesar do déficit estimado, o que frequentemente ocorre devido à inflamação muscular temporária ou ganho concomitante de tônus muscular.',
      recommendations: [
        'Avalie fotos comparativas e medidas corporais além da balança isolada.',
        'Mantenha a hidratação diária adequada (35ml a 40ml de água por kg).',
        'Permaneça firme no plano por mais 2 semanas para observar a média móvel.',
      ],
    };
  }

  if (workoutsCount === 0 && isCalorieSurplus) {
    return {
      headline: 'Atenção ao Balanço Calórico sem Estímulo Físico',
      badge: 'warning',
      diagnosis: 'Houve consumo calórico acima do gasto diário sem registros de treinos no período analisado.',
      recommendations: [
        'Procure incluir pelo menos 2 a 3 sessões de treino ou caminhadas ativas na rotina semanal.',
        'Ajuste as porções das refeições mais densas para convergir com sua meta diária.',
      ],
    };
  }

  return {
    headline: 'Equilíbrio e Manutenção Metabólica',
    badge: 'info',
    diagnosis: 'Consumo calórico e gasto energético estão próximos do ponto de equilíbrio, ideal para sustentabilidade e consistência a longo prazo.',
    recommendations: [
      'Continue registrando treinos e refeições com regularidade para refinar as métricas.',
      'Defina se o próximo objetivo será focar em ganhos de força ou queima calórica.',
    ],
  };
}
