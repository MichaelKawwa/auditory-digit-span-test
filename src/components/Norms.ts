// Norms for WAIS-IV Digit Span (mean=10, SD=3), by age group
// Only total score norms are available

export type AgeGroup =
  | '16-17' | '18-19' | '20-24' | '25-29' | '30-34' | '35-44' | '45-54'
  | '55-64' | '65-69' | '70-74' | '75-79' | '80-84' | '85-89';

export const ageGroups: { min: number; max: number; label: AgeGroup }[] = [
  { min: 16, max: 17, label: '16-17' },
  { min: 18, max: 19, label: '18-19' },
  { min: 20, max: 24, label: '20-24' },
  { min: 25, max: 29, label: '25-29' },
  { min: 30, max: 34, label: '30-34' },
  { min: 35, max: 44, label: '35-44' },
  { min: 45, max: 54, label: '45-54' },
  { min: 55, max: 64, label: '55-64' },
  { min: 65, max: 69, label: '65-69' },
  { min: 70, max: 74, label: '70-74' },
  { min: 75, max: 79, label: '75-79' },
  { min: 80, max: 84, label: '80-84' },
  { min: 85, max: 89, label: '85-89' },
];

// Norms: mean and SD for total Digit Span score by age group
export const digitSpanNorms: Record<AgeGroup, { mean: number; sd: number }> = {
  '16-17': { mean: 28.5, sd: 5.8 },
  '18-19': { mean: 28.5, sd: 5.5 },
  '20-24': { mean: 28.5, sd: 6.0 },
  '25-29': { mean: 28.5, sd: 6.0 },
  '30-34': { mean: 28.5, sd: 6.0 },
  '35-44': { mean: 28.5, sd: 5.8 },
  '45-54': { mean: 27.5, sd: 5.8 },
  '55-64': { mean: 26.5, sd: 6.0 },
  '65-69': { mean: 25.5, sd: 6.0 },
  '70-74': { mean: 24.5, sd: 6.0 },
  '75-79': { mean: 23.5, sd: 5.8 },
  '80-84': { mean: 22.5, sd: 5.8 },
  '85-89': { mean: 21.5, sd: 5.8 },
};

export function getAgeGroup(age: number): AgeGroup {
  for (const group of ageGroups) {
    if (age >= group.min && age <= group.max) return group.label;
  }
  // Default to closest
  if (age < 16) return '16-17';
  return '85-89';
}

// Convert raw score to scaled score (mean=10, SD=3)
export function rawToScaledScore(raw: number, age: number): number {
  const group = getAgeGroup(age);
  const { mean, sd } = digitSpanNorms[group];
  // Scaled score: 10 + (raw - mean) / SD * 3
  const scaled = 10 + ((raw - mean) / sd) * 3;
  return Math.round(scaled);
}
