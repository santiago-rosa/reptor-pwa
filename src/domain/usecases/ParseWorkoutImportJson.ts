import type { Exercise } from '../entities/Exercise'

export type ExerciseMatchKind = 'exact_id' | 'exact_name' | 'fuzzy_name'

export interface ParsedImportExercise {
  exerciseId: string
  exerciseName: string
  requestedName?: string
  requestedId?: string
  matchKind: ExerciseMatchKind
  sets: number
  repsMin: number
  repsMax: number | null
}

export interface ParsedImportRoutine {
  name: string
  exercises: ParsedImportExercise[]
}

export interface WorkoutImportParseResult {
  routines: ParsedImportRoutine[]
  errors: string[]
  warnings: string[]
}

function stripMarkdownCodeFence(raw: string): string {
  const trimmed = raw.trim()
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i)
  return fenceMatch?.[1] ? fenceMatch[1].trim() : trimmed
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const prev = Array.from({ length: n + 1 }, (_, j) => j)
  const curr = new Array<number>(n + 1).fill(0)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (curr[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      )
    }
    for (let j = 0; j <= n; j++) {
      prev[j] = curr[j] ?? 0
    }
  }

  return prev[n] ?? 0
}

function computeSimilarity(queryNorm: string, candidateNorm: string): number {
  if (!queryNorm || !candidateNorm) return 0
  if (queryNorm === candidateNorm) return 1

  const maxLen = Math.max(queryNorm.length, candidateNorm.length)
  const levScore = 1 - levenshteinDistance(queryNorm, candidateNorm) / maxLen

  const queryTokens = new Set(queryNorm.split(' ').filter(Boolean))
  const candTokens = new Set(candidateNorm.split(' ').filter(Boolean))
  let intersection = 0
  for (const token of queryTokens) {
    if (candTokens.has(token)) intersection++
  }
  const union = new Set([...queryTokens, ...candTokens]).size
  const tokenScore = union > 0 ? intersection / union : 0

  const containmentBonus =
    candidateNorm.includes(queryNorm) || queryNorm.includes(candidateNorm) ? 0.15 : 0

  return Math.min(1, Math.max(levScore, tokenScore) + containmentBonus * 0.5)
}

function matchExercise(
  requestedId: string | undefined,
  requestedName: string | undefined,
  catalog: Exercise[],
): { exercise: Exercise; matchKind: ExerciseMatchKind } | null {
  if (requestedId) {
    const byId = catalog.find((ex) => ex.id === requestedId)
    if (byId) {
      return { exercise: byId, matchKind: 'exact_id' }
    }
  }

  if (requestedName) {
    const targetLower = requestedName.trim().toLowerCase()
    const byExactName = catalog.find(
      (ex) =>
        ex.name.trim().toLowerCase() === targetLower ||
        ex.nameEn?.trim().toLowerCase() === targetLower ||
        ex.nameEs?.trim().toLowerCase() === targetLower,
    )
    if (byExactName) {
      return { exercise: byExactName, matchKind: 'exact_name' }
    }

    const queryNorm = normalizeText(requestedName)
    if (!queryNorm) return null

    let bestExercise: Exercise | null = null
    let bestScore = 0

    for (const ex of catalog) {
      const candidates = [ex.name, ex.nameEn, ex.nameEs].filter(
        (c): c is string => Boolean(c && c.trim()),
      )
      for (const candidate of candidates) {
        const score = computeSimilarity(queryNorm, normalizeText(candidate))
        if (score > bestScore) {
          bestScore = score
          bestExercise = ex
        }
      }
    }

    if (bestExercise && bestScore >= 0.58) {
      return { exercise: bestExercise, matchKind: 'fuzzy_name' }
    }
  }

  return null
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export class ParseWorkoutImportJson {
  execute(rawJson: string, catalog: Exercise[]): WorkoutImportParseResult {
    const errors: string[] = []
    const warnings: string[] = []
    const routines: ParsedImportRoutine[] = []

    const cleaned = stripMarkdownCodeFence(rawJson)
    if (!cleaned) {
      return {
        routines: [],
        errors: ['Please paste JSON or upload a .json file.'],
        warnings: [],
      }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Syntax error'
      return {
        routines: [],
        errors: [`Invalid JSON syntax: ${detail}`],
        warnings: [],
      }
    }

    if (!isPlainObject(parsed)) {
      return {
        routines: [],
        errors: ['Root JSON value must be an object ({ name, exercises } or { routines: [...] }).'],
        warnings: [],
      }
    }

    let rawRoutines: unknown[]
    if ('routines' in parsed) {
      if (!Array.isArray(parsed.routines) || parsed.routines.length === 0) {
        return {
          routines: [],
          errors: ['"routines" must be a non-empty array of routine objects.'],
          warnings: [],
        }
      }
      rawRoutines = parsed.routines
    } else {
      rawRoutines = [parsed]
    }

    rawRoutines.forEach((rawRoutine, routineIdx) => {
      const routineLabel = rawRoutines.length > 1 ? `Routine #${routineIdx + 1}` : 'Routine'

      if (!isPlainObject(rawRoutine)) {
        errors.push(`${routineLabel}: Must be an object with "name" and "exercises".`)
        return
      }

      const rawName = rawRoutine.name
      if (typeof rawName !== 'string' || rawName.trim().length === 0) {
        errors.push(`${routineLabel}: "name" must be a non-empty string.`)
      }
      const routineName = typeof rawName === 'string' && rawName.trim() ? rawName.trim() : routineLabel

      const rawExercises = rawRoutine.exercises
      if (!Array.isArray(rawExercises) || rawExercises.length === 0) {
        errors.push(`${routineName}: "exercises" must be a non-empty array.`)
        return
      }

      const parsedExercises: ParsedImportExercise[] = []

      rawExercises.forEach((rawEx, exIdx) => {
        const exLabel = `${routineName} → Exercise #${exIdx + 1}`

        if (!isPlainObject(rawEx)) {
          errors.push(`${exLabel}: Must be an object.`)
          return
        }

        const requestedId =
          typeof rawEx.exerciseId === 'string' && rawEx.exerciseId.trim()
            ? rawEx.exerciseId.trim()
            : undefined
        const requestedName =
          typeof rawEx.exerciseName === 'string' && rawEx.exerciseName.trim()
            ? rawEx.exerciseName.trim()
            : typeof rawEx.name === 'string' && rawEx.name.trim()
              ? rawEx.name.trim()
              : undefined

        if (!requestedId && !requestedName) {
          errors.push(`${exLabel}: Must provide "exerciseId" or "exerciseName".`)
          return
        }

        const sets = rawEx.sets
        if (typeof sets !== 'number' || !Number.isInteger(sets) || sets < 1) {
          errors.push(`${exLabel}: "sets" must be an integer >= 1.`)
          return
        }

        const repsMin = rawEx.repsMin
        if (typeof repsMin !== 'number' || !Number.isInteger(repsMin) || repsMin < 1) {
          errors.push(`${exLabel}: "repsMin" must be an integer >= 1.`)
          return
        }

        const rawRepsMax = rawEx.repsMax
        let repsMax: number | null = null
        if (rawRepsMax !== undefined && rawRepsMax !== null) {
          if (typeof rawRepsMax !== 'number' || !Number.isInteger(rawRepsMax) || rawRepsMax < 1) {
            errors.push(`${exLabel}: "repsMax" must be an integer >= 1 or null.`)
            return
          }
          if (rawRepsMax < repsMin) {
            errors.push(`${exLabel}: "repsMax" (${rawRepsMax}) cannot be less than "repsMin" (${repsMin}).`)
            return
          }
          repsMax = rawRepsMax === repsMin ? null : rawRepsMax
        }

        const matched = matchExercise(requestedId, requestedName, catalog)
        if (!matched) {
          const ref = requestedName ?? requestedId ?? 'unknown'
          errors.push(
            `${exLabel}: Unknown exercise "${ref}". Verify the exercise ID or name against the catalog.`,
          )
          return
        }

        if (matched.matchKind === 'fuzzy_name') {
          warnings.push(
            `${exLabel}: Matched "${requestedName}" to "${matched.exercise.name}" (fuzzy match).`,
          )
        } else if (requestedId && matched.matchKind === 'exact_name') {
          warnings.push(
            `${exLabel}: Unknown exerciseId "${requestedId}", matched by name to "${matched.exercise.name}".`,
          )
        }

        parsedExercises.push({
          exerciseId: matched.exercise.id,
          exerciseName: matched.exercise.name,
          requestedId,
          requestedName,
          matchKind: matched.matchKind,
          sets,
          repsMin,
          repsMax,
        })
      })

      if (parsedExercises.length > 0 && errors.length === 0) {
        routines.push({
          name: routineName,
          exercises: parsedExercises,
        })
      }
    })

    return {
      routines: errors.length === 0 ? routines : [],
      errors,
      warnings,
    }
  }
}
