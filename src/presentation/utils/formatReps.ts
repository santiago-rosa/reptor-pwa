/**
 * Formats rep targets cleanly:
 *  - single: formatReps(8)        → "8 reps"
 *  - range:  formatReps(8, 10)    → "8–10 reps"
 *  - same:   formatReps(8, 8)     → "8 reps"  (collapsed)
 */
export function formatReps(repsMin: number, repsMax?: number | null): string {
  if (repsMax != null && repsMax !== repsMin) {
    return `${repsMin}–${repsMax} reps`
  }
  return `${repsMin} reps`
}

/**
 * Returns true if the exercise has a true rep range (min ≠ max and max is set).
 */
export function isRepRange(repsMin: number, repsMax?: number | null): boolean {
  return repsMax != null && repsMax !== repsMin
}
