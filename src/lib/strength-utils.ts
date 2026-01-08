export function calculateE1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  // Epley formula: weight * (1 + reps / 30)
  return weight * (1 + reps / 30);
}

export function calculateE10RM(weight: number, reps: number): number {
  // e10RM is approx 75% of 1RM
  const e1RM = calculateE1RM(weight, reps);
  return e1RM * 0.75;
}

export function calculateSessionVolume(sets: { weight: number; reps: number; completed: boolean }[]): number {
  return sets.reduce((total, set) => {
    if (!set.completed) return total;
    return total + (set.weight * set.reps);
  }, 0);
}

export type ImprovementStatus = "improved" | "maintained" | "decreased" | "gaming";

export function getImprovementStatus(
  currentSet: { weight: number; reps: number },
  prevSet: { weight: number; reps: number } | undefined
): ImprovementStatus {
  if (!prevSet) return "improved"; // First time is always an improvement

  const currentE10RM = calculateE10RM(currentSet.weight, currentSet.reps);
  const prevE10RM = calculateE10RM(prevSet.weight, prevSet.reps);

  const currentStimulus = currentSet.weight * currentSet.reps;
  const prevStimulus = prevSet.weight * prevSet.reps;

  // Real improvement: e10RM increased
  if (currentE10RM > prevE10RM) {
    return "improved";
  }

  // Gaming check: Higher weight but significantly lower stimulus (e.g. 50kg x 2 vs 40kg x 10)
  // If weight is higher but e10RM is NOT higher, and stimulus dropped > 10%
  if (currentSet.weight > prevSet.weight && currentStimulus < prevStimulus * 0.9) {
    return "gaming";
  }

  if (currentE10RM < prevE10RM) {
    return "decreased";
  }

  return "maintained";
}
