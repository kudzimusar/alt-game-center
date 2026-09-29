// Kimi Moonshot AI — OpenAI-compatible API
// API key: KIMI_API_KEY (add to Secrets when ready)
// Models: moonshot-v1-8k | moonshot-v1-32k | moonshot-v1-128k

const KIMI_BASE_URL = "https://api.moonshot.cn/v1";

interface KimiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function kimiChat(messages: KimiMessage[], model = "moonshot-v1-8k"): Promise<string> {
  const key = process.env.KIMI_API_KEY;
  if (!key) throw new Error("KIMI_API_KEY not configured");

  const res = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kimi API error ${res.status}: ${err}`);
  }

  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content || "";
}

// ─── Grade/topic context ──────────────────────────────────────────────────────

const GRADE_CONTEXT: Record<string, { curriculum: string; grammar: string[]; vocab: string }> = {
  "1": {
    curriculum: "MEXT JHS Grade 1 (中1) — New Horizon / Sunshine",
    grammar: ["Be-verbs (am/is/are)", "General verbs present tense", "Can (ability)", "Wh-questions (What/Who/Where)", "Like/Want/Play", "Plural nouns"],
    vocab: "Animals, Food, Sports, Family, Classroom, Colors, Numbers, Daily Life, School subjects",
  },
  "2": {
    curriculum: "MEXT JHS Grade 2 (中2) — New Horizon / Sunshine",
    grammar: ["Past tense (regular/irregular)", "Future (will/be going to)", "There is/are", "Must / Have to", "Comparatives & Superlatives", "Present continuous"],
    vocab: "My Town, Travel, Jobs & Careers, Nature, Health, Rules, Opinions",
  },
  "3": {
    curriculum: "MEXT JHS Grade 3 (中3) — New Horizon / Sunshine",
    grammar: ["Present perfect (experience/continuation)", "Passive voice", "Relative pronouns (who/which/that)", "Indirect questions", "Conditionals (if/when)", "Reported speech"],
    vocab: "Global issues, Environment, Technology, Culture, History, Career, Society",
  },
};

// ─── Question generation ──────────────────────────────────────────────────────

export interface GeneratedQuestion {
  content: string;
  options: string[];
  correctAnswer: string;
  grammarPoint: string;
  unit: string;
  questionType: "multiple_choice" | "fill_blank" | "true_false";
  timeLimit: number;
}

export async function generateClassBattleQuestions(opts: {
  grade: string;
  topic: string;
  count?: number;
  questionType?: "multiple_choice" | "fill_blank" | "true_false" | "mixed";
}): Promise<GeneratedQuestion[]> {
  const { grade, topic, count = 10, questionType = "mixed" } = opts;
  const ctx = GRADE_CONTEXT[grade] || GRADE_CONTEXT["1"];

  const typeInstruction =
    questionType === "mixed"
      ? "Mix the question types: use multiple_choice (4 options), fill_blank (short answer to fill in a blank), and true_false."
      : questionType === "multiple_choice"
      ? "All questions must be multiple_choice with exactly 4 options (A, B, C, D)."
      : questionType === "fill_blank"
      ? "All questions must be fill_blank — show a sentence with ___ to fill in."
      : "All questions must be true_false with options [\"True\", \"False\"].";

  const prompt = `You are an expert English teacher creating a classroom quiz for Japanese junior high school students.

Curriculum: ${ctx.curriculum}
Topic/Theme: ${topic}
Grammar focus areas: ${ctx.grammar.join(", ")}
Vocabulary focus: ${ctx.vocab}

Create exactly ${count} quiz questions. ${typeInstruction}

Rules:
- Questions must be appropriate for the grade level and topic
- Correct answers must be unambiguous
- Distractors (wrong MC options) must be plausible but clearly wrong to a careful student
- Keep language simple and classroom-appropriate
- For fill_blank: use ___ in the sentence
- Each question needs a grammarPoint label (e.g. "Past tense - irregular verbs")

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "content": "question text or sentence with ___",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "the correct answer",
      "grammarPoint": "Grammar Point Label",
      "unit": "${topic}",
      "questionType": "multiple_choice|fill_blank|true_false",
      "timeLimit": 20
    }
  ]
}`;

  const text = await kimiChat([
    { role: "system", content: "You are a curriculum-aligned English quiz generator for Japanese JHS classrooms. Always respond with valid JSON only." },
    { role: "user", content: prompt },
  ]);

  // Parse JSON (strip markdown if present)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON");

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed.questions)) throw new Error("Invalid response structure");

  return parsed.questions.slice(0, count);
}

// Fallback questions if AI is unavailable
export function getFallbackQuestions(grade: string, topic: string, count = 10): GeneratedQuestion[] {
  const banks: Record<string, GeneratedQuestion[]> = {
    "1": [
      { content: "What ___ your name?", options: ["is", "are", "am", "be"], correctAnswer: "is", grammarPoint: "Be-verbs", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "I ___ a student.", options: ["am", "is", "are", "be"], correctAnswer: "am", grammarPoint: "Be-verbs", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "She ___ play tennis.", options: ["can", "cans", "is", "are"], correctAnswer: "can", grammarPoint: "Can (ability)", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "They ___ students.", options: ["are", "is", "am", "be"], correctAnswer: "are", grammarPoint: "Be-verbs plural", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "I ___ soccer every day.", options: ["play", "plays", "playing", "played"], correctAnswer: "play", grammarPoint: "General verbs present", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "English is spoken in the USA.", options: ["True", "False"], correctAnswer: "True", grammarPoint: "Vocabulary", unit: topic, questionType: "true_false", timeLimit: 15 },
      { content: "What ___ this? It's a pencil.", options: ["is", "are", "am", "be"], correctAnswer: "is", grammarPoint: "Wh-questions", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "He ___ a dog.", options: ["has", "have", "haves", "having"], correctAnswer: "has", grammarPoint: "Have/Has", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "I like ___.", options: ["apple", "apples", "an apple", "the apple"], correctAnswer: "apples", grammarPoint: "Plural nouns", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "Where ___ you from?", options: ["are", "is", "am", "do"], correctAnswer: "are", grammarPoint: "Wh-questions", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
    ],
    "2": [
      { content: "She ___ to school yesterday.", options: ["went", "go", "goes", "going"], correctAnswer: "went", grammarPoint: "Past tense irregular", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "I ___ going to study tomorrow.", options: ["am", "is", "are", "be"], correctAnswer: "am", grammarPoint: "Be going to", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "There ___ a cat in the garden.", options: ["is", "are", "am", "be"], correctAnswer: "is", grammarPoint: "There is/are", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "You must ___ your homework.", options: ["do", "does", "did", "doing"], correctAnswer: "do", grammarPoint: "Must + bare infinitive", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "He is ___ than his brother.", options: ["taller", "tall", "tallest", "more tall"], correctAnswer: "taller", grammarPoint: "Comparatives", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "They ___ playing soccer now.", options: ["are", "is", "am", "be"], correctAnswer: "are", grammarPoint: "Present continuous", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "She ___ her keys last night.", options: ["lost", "lose", "loses", "losing"], correctAnswer: "lost", grammarPoint: "Past tense irregular", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "I will ___ you tomorrow.", options: ["call", "calls", "called", "calling"], correctAnswer: "call", grammarPoint: "Will future", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "Mount Fuji is ___ mountain in Japan.", options: ["the highest", "higher", "high", "highest"], correctAnswer: "the highest", grammarPoint: "Superlatives", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "There ___ many students in the gym.", options: ["are", "is", "am", "be"], correctAnswer: "are", grammarPoint: "There is/are plural", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
    ],
    "3": [
      { content: "I have ___ to Kyoto three times.", options: ["been", "be", "being", "went"], correctAnswer: "been", grammarPoint: "Present perfect - experience", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "English ___ around the world.", options: ["is spoken", "speaks", "spoke", "speaking"], correctAnswer: "is spoken", grammarPoint: "Passive voice", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "The girl ___ is standing there is my sister.", options: ["who", "which", "what", "where"], correctAnswer: "who", grammarPoint: "Relative pronouns", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "If I study hard, I ___ pass the test.", options: ["will", "would", "can", "could"], correctAnswer: "will", grammarPoint: "Conditionals", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "She asked me ___ I was from.", options: ["where", "what", "who", "which"], correctAnswer: "where", grammarPoint: "Indirect questions", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "He has ___ for ten years.", options: ["lived here", "living here", "live here", "lives here"], correctAnswer: "lived here", grammarPoint: "Present perfect - duration", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "The book ___ I bought is interesting.", options: ["that", "who", "what", "whom"], correctAnswer: "that", grammarPoint: "Relative pronouns - objects", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "Can you tell me ___ the station is?", options: ["where", "what", "who", "which"], correctAnswer: "where", grammarPoint: "Indirect questions", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "The window was ___ by the wind.", options: ["broken", "broke", "breaking", "breaks"], correctAnswer: "broken", grammarPoint: "Passive voice", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
      { content: "I have ___ finished my homework.", options: ["already", "yet", "never", "ever"], correctAnswer: "already", grammarPoint: "Present perfect - completion", unit: topic, questionType: "multiple_choice", timeLimit: 20 },
    ],
  };

  const bank = banks[grade] || banks["1"];
  return bank.slice(0, count);
}
