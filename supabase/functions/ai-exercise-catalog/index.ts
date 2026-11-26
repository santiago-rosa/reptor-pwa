import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

interface ExerciseCatalogRow {
  id: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  muscle_groups: string[] | null;
  equipment: string;
  category: string | null;
}

const ROUTINE_ITEM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["name", "exercises"],
  properties: {
    name: {
      type: "string",
      minLength: 1,
      description: "Routine or workout name (e.g., 'Upper Body Push').",
    },
    exercises: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["exerciseId", "sets", "repsMin"],
        properties: {
          exerciseId: {
            type: "string",
            format: "uuid",
            description:
              "Exact UUID from the exercises[].id catalog returned by this endpoint.",
          },
          exerciseName: {
            type: "string",
            description:
              "Optional human-readable exercise name matching exercises[].name.",
          },
          sets: {
            type: "integer",
            minimum: 1,
            description: "Number of working sets.",
          },
          repsMin: {
            type: "integer",
            minimum: 1,
            description:
              "Target reps (for a single target like 8 reps) or minimum reps (for a range like 8-12 reps).",
          },
          repsMax: {
            type: ["integer", "null"],
            minimum: 1,
            description:
              "Optional maximum reps for a rep range (must be >= repsMin). Omit or set to null for a single rep target.",
          },
        },
      },
    },
  },
};

const WORKOUT_IMPORT_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "ReptorWorkoutImport",
  description:
    "Schema for importing a single workout routine or a list of routines into Reptor PWA.",
  oneOf: [
    ROUTINE_ITEM_SCHEMA,
    {
      type: "object",
      additionalProperties: false,
      required: ["routines"],
      properties: {
        routines: {
          type: "array",
          minItems: 1,
          items: ROUTINE_ITEM_SCHEMA,
        },
      },
    },
  ],
};

const AI_INSTRUCTIONS = [
  "Generate valid JSON for Reptor PWA using ONLY exercises from the provided `exercises` catalog.",
  "You may output either a single routine object (`{ name, exercises }`) or an object containing multiple routines (`{ routines: [...] }`).",
  "Use the exact `id` from `exercises` for `exerciseId` (and optionally include `name` as `exerciseName`).",
  "For a single rep target (e.g., 8 reps), set `repsMin: 8` and omit `repsMax` (or set `repsMax: null`).",
  "For a rep range (e.g., 8-12 reps), set `repsMin: 8` and `repsMax: 12` (where `repsMax >= repsMin`).",
  "Output raw JSON only (no markdown fences or extra commentary) when the user asks to import directly.",
].join(" ");

async function fetchAllExercises(
  supabaseUrl: string,
  supabaseKey: string,
): Promise<ExerciseCatalogRow[]> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const pageSize = 1000;
  const allRows: ExerciseCatalogRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("exercises")
      .select("id, name, name_en, name_es, muscle_groups, equipment, category")
      .order("name", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch exercises: ${error.message}`);
    }

    const batch = (data ?? []) as ExerciseCatalogRow[];
    allRows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  return allRows;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase environment configuration" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const exercises = await fetchAllExercises(supabaseUrl, supabaseKey);
    const sampleFirst = exercises[0];
    const sampleSecond = exercises[1];

    const example = {
      name: "Sample Full Body A",
      exercises: [
        ...(sampleFirst
          ? [
              {
                exerciseId: sampleFirst.id,
                exerciseName: sampleFirst.name,
                sets: 3,
                repsMin: 8,
                repsMax: 12,
              },
            ]
          : []),
        ...(sampleSecond
          ? [
              {
                exerciseId: sampleSecond.id,
                exerciseName: sampleSecond.name,
                sets: 4,
                repsMin: 6,
                repsMax: null,
              },
            ]
          : []),
      ],
    };

    const url = new URL(req.url);
    const format = url.searchParams.get("format");

    if (format === "prompt") {
      const promptText = [
        "# Reptor PWA — AI Workout Routine Generator Prompt",
        "",
        "## Instructions",
        AI_INSTRUCTIONS,
        "",
        "## JSON Schema",
        "```json",
        JSON.stringify(WORKOUT_IMPORT_JSON_SCHEMA, null, 2),
        "```",
        "",
        "## Example Output",
        "```json",
        JSON.stringify(example, null, 2),
        "```",
        "",
        `## Exercise Catalog (${exercises.length} exercises)`,
        JSON.stringify(exercises),
      ].join("\n");

      return new Response(promptText, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    const payload = {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      instructions: AI_INSTRUCTIONS,
      schema: WORKOUT_IMPORT_JSON_SCHEMA,
      example,
      exerciseCount: exercises.length,
      exercises,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
