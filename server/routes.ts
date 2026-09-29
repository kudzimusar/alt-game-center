import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

interface WordHuntPuzzle {
  category: string;
  image: string;
  words: Array<{
    word: string;
    hint: string;
    emoji: string;
  }>;
  gridSize: number;
  grid: string[][];
  wordPositions: Array<{
    word: string;
    positions: Array<[number, number]>;
    direction: "horizontal" | "vertical" | "diagonal";
  }>;
  grade: string;
  date: string;
}

// Cache for daily puzzles
const puzzleCache = new Map<string, WordHuntPuzzle>();

async function generateWordHuntPuzzle(
  grade: string,
  category?: string
): Promise<WordHuntPuzzle> {
  const today = new Date().toISOString().split("T")[0];
  const cacheKey = `wordhunt-${grade}-${today}`;

  // Check cache first
  if (puzzleCache.has(cacheKey)) {
    return puzzleCache.get(cacheKey)!;
  }

  const gradeContext = {
    "1": {
      curriculum: "MEXT JHS Grade 1 (New Horizon, Sunshine, etc.)",
      grammar: ["Be-verbs", "General verbs (Present)", "Can (Ability)", "Wh-questions", "Like/Want/Play"],
      vocabulary: "Animals, Food, Sports, Family, Classroom, Daily Life",
      logic: "Simple descriptions and direct statements. Use the most common JHS 1 vocabulary and sentence patterns."
    },
    "2": {
      curriculum: "MEXT JHS Grade 2 (New Horizon, Sunshine, etc.)",
      grammar: ["Past Tense (Regular/Irregular)", "Future (will/be going to)", "There is/are", "Must / Have to", "Comparatives/Superlatives"],
      vocabulary: "My Town, Travel, Jobs, Nature, Health, Rules",
      logic: "Contextual descriptions using time-references (past/future) and comparative analysis of familiar objects."
    },
    "3": {
      curriculum: "MEXT JHS Grade 3 (New Horizon, Sunshine, etc.)",
      grammar: ["Present Perfect (Experience, Continuation, Completion)", "Indirect Questions", "Passive Voice", "Relative Pronouns", "Causative (let/help)", "Conditionals"],
      vocabulary: "Global issues, Environment, Technology, Culture, History, Career",
      logic: "Complex relationships between subjects. Use contextual clues that imply completion or ongoing states. Focus on descriptive relative clauses."
    }
  };

  const prompt = `Generate a Word Hunt puzzle for Japanese JHS students aligned with ${gradeContext[grade as keyof typeof gradeContext].curriculum}.

CRITICAL REQUIREMENT:
The vocabulary MUST be relevant to JHS students and the hints MUST apply the target grammar (${gradeContext[grade as keyof typeof gradeContext].grammar.join(", ")}) in a natural context.
${gradeContext[grade as keyof typeof gradeContext].logic}

Example for Grade 3 (Present Perfect): 
- Word: PARIS. Hint: "I have been to this city twice. It is in France."

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "category": "Category Name with emoji",
  "image": "appropriate emoji",
  "words": [
    {"word": "UPPERCASE_WORD", "hint": "English hint applying grade-specific grammar naturally", "emoji": "emoji"},
    ...4 more words
  ],
  "gridSize": 8,
  "grid": [
    ["A", "B", "C", "D", "E", "F", "G", "H"],
    ...7 more rows
  ],
  "wordPositions": [
    {
      "word": "WORD1",
      "positions": [[0,0], [0,1], [0,2], [0,3], [0,4]],
      "direction": "horizontal"
    },
    ...positions for remaining words
  ]
}

Requirements:
- 5 words total, all uppercase
- Grid size is 8x8
- Fill remaining grid cells with random letters`;

  try {
    if (!genAI) throw new Error("GEMINI_API_KEY is not configured");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const puzzle = JSON.parse(jsonMatch[0]) as WordHuntPuzzle;
    puzzle.grade = grade;
    puzzle.date = today;

    // Cache the puzzle
    puzzleCache.set(cacheKey, puzzle);

    return puzzle;
  } catch (error) {
    console.error("Error generating puzzle:", error);
    // Fallback puzzle if generation fails
    return generateFallbackPuzzle(grade);
  }
}

function generateFallbackPuzzle(grade: string): WordHuntPuzzle {
  const fallbacks: Record<string, WordHuntPuzzle> = {
    "1": {
      category: "🎓 Classroom",
      image: "🏫",
      words: [
        { word: "DESK", hint: "Where you sit", emoji: "📚" },
        { word: "BOOK", hint: "You read this", emoji: "📖" },
        { word: "PEN", hint: "Writing tool", emoji: "🖊️" },
        { word: "APPLE", hint: "Fruit", emoji: "🍎" },
        { word: "TEACHER", hint: "Your instructor", emoji: "👨‍🏫" },
      ],
      gridSize: 8,
      grid: [
        ["D", "E", "S", "K", "Q", "W", "E", "R"],
        ["B", "O", "O", "K", "T", "Y", "U", "I"],
        ["P", "E", "N", "A", "B", "C", "D", "E"],
        ["A", "P", "P", "L", "E", "F", "G", "H"],
        ["T", "E", "A", "C", "H", "E", "R", "I"],
        ["J", "K", "L", "M", "N", "O", "P", "Q"],
        ["R", "S", "T", "U", "V", "W", "X", "Y"],
        ["Z", "A", "B", "C", "D", "E", "F", "G"],
      ],
      wordPositions: [
        { word: "DESK", positions: [[0, 0], [0, 1], [0, 2], [0, 3]], direction: "horizontal" },
        { word: "BOOK", positions: [[1, 0], [1, 1], [1, 2], [1, 3]], direction: "horizontal" },
        { word: "PEN", positions: [[2, 0], [2, 1], [2, 2]], direction: "horizontal" },
        { word: "APPLE", positions: [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4]], direction: "horizontal" },
        { word: "TEACHER", positions: [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6]], direction: "horizontal" },
      ],
      grade,
      date: new Date().toISOString().split("T")[0],
    },
    "2": {
      category: "⚽ Sports",
      image: "🎮",
      words: [
        { word: "SOCCER", hint: "Football sport", emoji: "⚽" },
        { word: "TENNIS", hint: "Racket sport", emoji: "🎾" },
        { word: "SWIMMING", hint: "In water", emoji: "🏊" },
        { word: "BASKETBALL", hint: "Hoop sport", emoji: "🏀" },
        { word: "BADMINTON", hint: "Shuttlecock game", emoji: "🏸" },
      ],
      gridSize: 10,
      grid: [
        ["S", "O", "C", "C", "E", "R", "A", "B", "C", "D"],
        ["T", "E", "N", "N", "I", "S", "E", "F", "G", "H"],
        ["S", "W", "I", "M", "M", "I", "N", "G", "I", "J"],
        ["B", "A", "S", "K", "E", "T", "B", "A", "L", "L"],
        ["B", "A", "D", "M", "I", "N", "T", "O", "N", "K"],
        ["L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"],
        ["V", "W", "X", "Y", "Z", "A", "B", "C", "D", "E"],
        ["F", "G", "H", "I", "J", "K", "L", "M", "N", "O"],
        ["P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"],
        ["Z", "A", "B", "C", "D", "E", "F", "G", "H", "I"],
      ],
      wordPositions: [
        { word: "SOCCER", positions: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]], direction: "horizontal" },
        { word: "TENNIS", positions: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]], direction: "horizontal" },
        { word: "SWIMMING", positions: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7]], direction: "horizontal" },
        { word: "BASKETBALL", positions: [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [3, 9]], direction: "horizontal" },
        { word: "BADMINTON", positions: [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8]], direction: "horizontal" },
      ],
      grade,
      date: new Date().toISOString().split("T")[0],
    },
    "3": {
      category: "🌍 Environment",
      image: "♻️",
      words: [
        { word: "CLIMATE", hint: "Global weather pattern", emoji: "🌡️" },
        { word: "FOREST", hint: "Many trees", emoji: "🌲" },
        { word: "OCEAN", hint: "Salt water", emoji: "🌊" },
        { word: "RECYCLE", hint: "Reuse materials", emoji: "♻️" },
        { word: "POLLUTION", hint: "Environmental damage", emoji: "💨" },
      ],
      gridSize: 10,
      grid: [
        ["C", "L", "I", "M", "A", "T", "E", "A", "B", "C"],
        ["F", "O", "R", "E", "S", "T", "D", "E", "F", "G"],
        ["O", "C", "E", "A", "N", "H", "I", "J", "K", "L"],
        ["R", "E", "C", "Y", "C", "L", "E", "M", "N", "O"],
        ["P", "O", "L", "L", "U", "T", "I", "O", "N", "P"],
        ["Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
        ["U", "V", "W", "X", "Y", "Z", "A", "B", "C", "D"],
        ["E", "F", "G", "H", "I", "J", "K", "L", "M", "N"],
      ],
      wordPositions: [
        { word: "CLIMATE", positions: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]], direction: "horizontal" },
        { word: "FOREST", positions: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]], direction: "horizontal" },
        { word: "OCEAN", positions: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], direction: "horizontal" },
        { word: "RECYCLE", positions: [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6]], direction: "horizontal" },
        { word: "POLLUTION", positions: [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8]], direction: "horizontal" },
      ],
      grade,
      date: new Date().toISOString().split("T")[0],
    },
  };

  return fallbacks[grade] || fallbacks["1"];
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Word Hunt API endpoint - generate daily puzzle
  app.get("/api/games/word-hunt/:grade", async (req, res) => {
    try {
      const { grade } = req.params;

      if (!["1", "2", "3"].includes(grade)) {
        return res.status(400).json({ error: "Invalid grade" });
      }

      const puzzle = await generateWordHuntPuzzle(grade);
      res.json(puzzle);
    } catch (error) {
      console.error("Word Hunt API error:", error);
      res.status(500).json({ error: "Failed to generate puzzle" });
    }
  });

  // 3-Hint Quiz API endpoint
  app.get("/api/games/three-hint-quiz/:grade", async (req, res) => {
    try {
      const { grade } = req.params;
  const gradeContext = {
    "1": {
      curriculum: "MEXT JHS Grade 1 (New Horizon, Sunshine, etc.)",
      grammar: ["Be-verbs", "General verbs (Present)", "Can (Ability)", "Wh-questions", "Like/Want/Play"],
      vocabulary: "Animals, Food, Sports, Family, Classroom, Daily Life",
      logic: "Simple descriptions and direct statements. Use the most common JHS 1 vocabulary and sentence patterns."
    },
    "2": {
      curriculum: "MEXT JHS Grade 2 (New Horizon, Sunshine, etc.)",
      grammar: ["Past Tense (Regular/Irregular)", "Future (will/be going to)", "There is/are", "Must / Have to", "Comparatives/Superlatives"],
      vocabulary: "My Town, Travel, Jobs, Nature, Health, Rules",
      logic: "Contextual descriptions using time-references (past/future) and comparative analysis of familiar objects."
    },
    "3": {
      curriculum: "MEXT JHS Grade 3 (New Horizon, Sunshine, etc.)",
      grammar: ["Present Perfect (Experience, Continuation, Completion)", "Indirect Questions", "Passive Voice", "Relative Pronouns", "Causative (let/help)", "Conditionals"],
      vocabulary: "Global issues, Environment, Technology, Culture, History, Career",
      logic: "Complex relationships between subjects. Use contextual clues that imply completion or ongoing states. Focus on descriptive relative clauses."
    }
  };

  const prompt = `Generate 5 "3-Hint Quiz" questions for Japanese JHS students aligned with ${gradeContext[grade as keyof typeof gradeContext].curriculum}.

CRITICAL REQUIREMENT:
The hints MUST apply the target grammar (${gradeContext[grade as keyof typeof gradeContext].grammar.join(", ")}) in a natural context.
${gradeContext[grade as keyof typeof gradeContext].logic}

Example for Grade 3 (Present Perfect): 
- Hint 1: "I have lived in this place for a long time."
- Hint 2: "I have seen many famous buildings here."
- Hint 3: "I have visited the Sky Tree twice."
- Ans: "Tokyo"

Return ONLY a valid JSON array of objects (no markdown):
[
  {
    "hint1": "Hint applying grade-specific grammar naturally",
    "hint2": "Hint applying grade-specific grammar naturally",
    "hint3": "Hint applying grade-specific grammar naturally",
    "ans": "The Word"
  }
]`;

      if (!genAI) throw new Error("GEMINI_API_KEY is not configured");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) throw new Error("No JSON found");
      const quiz = JSON.parse(jsonMatch[0]);
      res.json(quiz);
    } catch (error) {
      console.error("3-Hint Quiz API error:", error);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  // Jeopardy API endpoint
  app.get("/api/games/jeopardy/:grade", async (req, res) => {
    try {
      const { grade } = req.params;
      const { topic } = req.query;
      const selectedTopic = topic || "randomly chosen from (Weather, Sports, Music, Countries, Nature, Animals, Technology, Food)";

      const gradeContext = {
        "1": {
          curriculum: "MEXT JHS Grade 1 (New Horizon, Sunshine, etc.)",
          grammar: ["Be-verbs", "General verbs (Present)", "Can (Ability)", "Wh-questions", "Like/Want/Play"],
          vocabulary: "Animals, Food, Sports, Family, Classroom, Daily Life",
          logic: "Simple descriptions and direct statements. Use the most common JHS 1 vocabulary and sentence patterns."
        },
        "2": {
          curriculum: "MEXT JHS Grade 2 (New Horizon, Sunshine, etc.)",
          grammar: ["Past Tense (Regular/Irregular)", "Future (will/be going to)", "There is/are", "Must / Have to", "Comparatives/Superlatives"],
          vocabulary: "My Town, Travel, Jobs, Nature, Health, Rules",
          logic: "Contextual descriptions using time-references (past/future) and comparative analysis of familiar objects."
        },
        "3": {
          curriculum: "MEXT JHS Grade 3 (New Horizon, Sunshine, etc.)",
          grammar: ["Present Perfect (Experience, Continuation, Completion)", "Indirect Questions", "Passive Voice", "Relative Pronouns", "Causative (let/help)", "Conditionals"],
          vocabulary: "Global issues, Environment, Technology, Culture, History, Career",
          logic: "Complex relationships between subjects. Use contextual clues that imply completion or ongoing states. Focus on descriptive relative clauses."
        }
      };

      const prompt = `Generate a Jeopardy game for Japanese JHS students aligned with ${gradeContext[grade as keyof typeof gradeContext].curriculum}.
      Target Grammar Points: ${gradeContext[grade as keyof typeof gradeContext].grammar.join(", ")}
      Typical Vocabulary: ${gradeContext[grade as keyof typeof gradeContext].vocabulary}
      Topic: ${selectedTopic}
      
      CRITICAL APPLICATION LOGIC:
      ${gradeContext[grade as keyof typeof gradeContext].logic}
      
      Questions must apply the grammar naturally to the topic. 
      Example for Grade 2 (Future): Topic: Travel. Clue: "Next summer, I am going to visit this city in Hokkaido. It is famous for snow." Answer: "Sapporo"
      Example for Grade 3 (Passive): Topic: Technology. Clue: "This phone was made by a famous company in the USA. It is used by many people." Answer: "iPhone"
      
      Create 5 categories with 5 questions each (Values: 100, 200, 300, 400, 500).
      
Return ONLY a valid JSON object (no markdown):
{
  "categories": [
    {
      "title": "Category Name (Grammar Point + Topic)",
      "questions": [
        {"value": 100, "question": "Simple clue applying grammar", "answer": "Answer"},
        {"value": 200, "question": "Medium clue applying grammar", "answer": "Answer"},
        {"value": 300, "question": "Harder clue applying grammar", "answer": "Answer"},
        {"value": 400, "question": "Advanced clue applying grammar", "answer": "Answer"},
        {"value": 500, "question": "Expert clue applying grammar", "answer": "Answer"}
      ]
    }
  ]
}`;

      if (!genAI) throw new Error("GEMINI_API_KEY is not configured");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("No JSON found");
      const jeopardy = JSON.parse(jsonMatch[0]);
      res.json(jeopardy);
    } catch (error) {
      console.error("Jeopardy API error:", error);
      // Fallback data if AI fails
      const fallback = {
        categories: [
          {
            title: "Basics",
            questions: [
              { value: 100, question: "How do you say 'Hello' in Japanese?", answer: "Konnichiwa" },
              { value: 200, question: "What is the past tense of 'run'?", answer: "ran" },
              { value: 300, question: "Count to 10 in English.", answer: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10" },
              { value: 400, question: "How do you say 'Arigato' in English?", answer: "Thank you" },
              { value: 500, question: "What is the capital of the USA?", answer: "Washington D.C." }
            ]
          },
          {
            title: "School",
            questions: [
              { value: 100, question: "Where do you eat lunch?", answer: "The classroom/cafeteria" },
              { value: 200, question: "What is 'teacher' in Japanese?", answer: "Sensei" },
              { value: 300, question: "Name 3 school subjects.", answer: "English, Math, Science (etc.)" },
              { value: 400, question: "What do you use to draw a straight line?", answer: "A ruler" },
              { value: 500, question: "What is the name of your principal?", answer: "Principal (varies)" }
            ]
          },
          {
            title: "Food",
            questions: [
              { value: 100, question: "What is 'Ringo' in English?", answer: "Apple" },
              { value: 200, question: "Name a yellow fruit.", answer: "Banana / Lemon" },
              { value: 300, question: "What do you say before eating?", answer: "Itadakimasu" },
              { value: 400, question: "Which fruit is often red and sweet?", answer: "Strawberry" },
              { value: 500, question: "What is a traditional Japanese soup?", answer: "Miso soup" }
            ]
          }
        ]
      };
      res.json(fallback);
    }
  });

  // Quiz Show API endpoint
  app.get("/api/games/quiz-show/:grade", async (req, res) => {
    try {
      const { grade } = req.params;
      const gradeContext = {
        "1": {
          curriculum: "MEXT JHS Grade 1 (New Horizon, Sunshine, etc.)",
          grammar: ["Be-verbs", "General verbs (Present)", "Can (Ability)", "Wh-questions", "Like/Want/Play"],
          logic: "Focus on basic sentence completion and identifying correct verb forms in simple contexts."
        },
        "2": {
          curriculum: "MEXT JHS Grade 2 (New Horizon, Sunshine, etc.)",
          grammar: ["Past Tense (Regular/Irregular)", "Future (will/be going to)", "There is/are", "Must / Have to", "Comparatives/Superlatives"],
          logic: "Focus on choosing the correct tense or modal verb based on time-based context clues."
        },
        "3": {
          curriculum: "MEXT JHS Grade 3 (New Horizon, Sunshine, etc.)",
          grammar: ["Present Perfect", "Indirect Questions", "Passive Voice", "Relative Pronouns", "Conditionals"],
          logic: "Focus on complex structures like relative clauses and the relationship between 'have' and past participles."
        }
      };

      const prompt = `Generate 5 multiple-choice quiz questions for Japanese JHS students aligned with ${gradeContext[grade as keyof typeof gradeContext].curriculum}.
      Target Grammar: ${gradeContext[grade as keyof typeof gradeContext].grammar.join(", ")}
      Logic: ${gradeContext[grade as keyof typeof gradeContext].logic}

      Return ONLY a valid JSON array of objects (no markdown):
      [
        {
          "question": "The question sentence with a ___ blank",
          "options": ["Correct", "Wrong1", "Wrong2", "Wrong3"],
          "answer": "Correct",
          "explanation": "A simple bilingual (English/Japanese) explanation of why this answer is correct."
        }
      ]`;

      if (!genAI) throw new Error("GEMINI_API_KEY is not configured");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) throw new Error("No JSON found");
      const quiz = JSON.parse(jsonMatch[0]);
      res.json(quiz);
    } catch (error) {
      console.error("Quiz Show API error:", error);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  // Small Talk API endpoint
  app.get("/api/games/small-talk/:grade/:grammarIndex", async (req, res) => {
    try {
      const { grade, grammarIndex } = req.params;
      
      const gradeGrammar: Record<string, { topic: string; grammar: string }[]> = {
        "1": [
          { topic: "I'm lost", grammar: "Be verb" },
          { topic: "Do you like spring?", grammar: "Simple Present" },
          { topic: "I can & I can't", grammar: "Can and Can't" },
          { topic: "Are you?", grammar: "Be verb" },
          { topic: "Do you play an instrument?", grammar: "Simple Present" },
          { topic: "Can you read it?", grammar: "Can and Can't" },
          { topic: "I like dancing", grammar: "Gerunds" },
          { topic: "I want to try it", grammar: "Want to" },
          { topic: "This is, That is", grammar: "Pronouns" },
          { topic: "Who's that?", grammar: "This-That" },
          { topic: "Turn on your camera", grammar: "Imperative" },
          { topic: "Where's your school?", grammar: "Where" },
          { topic: "When's your next match?", grammar: "Wh words" },
          { topic: "She likes singing", grammar: "Plural Verb" },
          { topic: "Does she have a cold?", grammar: "Plural Verb" },
          { topic: "I watched TV", grammar: "Past Simple" },
          { topic: "What a big lantern!", grammar: "What" },
          { topic: "It was fun", grammar: "Was and Were" },
          { topic: "I'm baking a cake", grammar: "Present Continuous" },
          { topic: "What were you doing?", grammar: "Past Continuous" }
        ],
        "2": [
          { topic: "My Summer Vacation", grammar: "Past Simple" },
          { topic: "Travel Plans", grammar: "Future (going to)" },
          { topic: "Making a Reservation", grammar: "Future (will)" },
          { topic: "Life in my Town", grammar: "There is/are" },
          { topic: "Rules and Obligations", grammar: "Must / Have to" },
          { topic: "Comparing Things", grammar: "Comparatives" },
          { topic: "The Best in the World", grammar: "Superlatives" },
          { topic: "Giving Reasons", grammar: "Why and Because" },
          { topic: "Things to do", grammar: "Infinitive (Adjectival)" },
          { topic: "Experience in Japan", grammar: "Passive Voice" }
        ],
        "3": [
          { topic: "Overseas Experiences", grammar: "Present Perfect (Experience)" },
          { topic: "Current Status", grammar: "Present Perfect (Completion)" },
          { topic: "Long-term Hobbies", grammar: "Present Perfect (Duration)" },
          { topic: "Asking for Information", grammar: "Indirect Questions" },
          { topic: "Objects and People", grammar: "Relative Pronouns" },
          { topic: "Things that Change", grammar: "Passive Voice (Review)" },
          { topic: "Helping Others", grammar: "Causative (let/help)" },
          { topic: "Global Issues", grammar: "Relative Pronouns" },
          { topic: "Wishes and Dreams", grammar: "Wish Conditional" },
          { topic: "Hypothetical Situations", grammar: "Second Conditional" }
        ]
      };

      const selected = gradeGrammar[grade]?.[parseInt(grammarIndex)] || gradeGrammar[grade]?.[0];

      const prompt = `Generate an English opening question for a Japanese JHS class (Grade ${grade}).
      Context: ${selected.topic}
      Target Grammar: ${selected.grammar}

      CRITICAL REQUIREMENTS:
      1. NO JAPANESE. 
      2. Strictly follow the grammar: ${selected.grammar}.
      3. Provide a sentence starter and an example answer.
      4. Provide 3 simple follow-up questions.

      Return ONLY JSON:
      {
        "grammarPoint": "${selected.grammar}",
        "topic": "${selected.topic}",
        "question": "The question",
        "sentenceStarter": "The starter",
        "exampleAnswer": "Example",
        "followUpQuestions": ["Q1", "Q2", "Q3"]
      }`;

      if (!genAI) throw new Error("GEMINI_API_KEY is not configured");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("No JSON found");
      res.json(JSON.parse(jsonMatch[0]));
    } catch (error) {
      console.error("Small Talk API error:", error);
      res.status(500).json({ error: "Failed" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
