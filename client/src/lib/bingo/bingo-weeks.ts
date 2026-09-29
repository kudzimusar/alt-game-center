export interface BingoCell {
  id: number;
  label: string;
  question: string;
  emoji: string;
}

export interface BingoWeek {
  week: number;
  grade: string;
  theme: string;
  grammar: string;
  description: string;
  cells: BingoCell[];
}

export const bingoWeeks: BingoWeek[] = [
  {
    week: 1,
    grade: "1",
    theme: "Daily Life",
    grammar: "Do you...? — Yes, I do. / No, I don't.",
    description: "Ask friends about their everyday habits and preferences.",
    cells: [
      { id: 1,  label: "Likes cats",        question: "Do you like cats?",                emoji: "🐱" },
      { id: 2,  label: "Eats breakfast",    question: "Do you eat breakfast every day?",  emoji: "🍳" },
      { id: 3,  label: "Has a pet",         question: "Do you have a pet?",               emoji: "🐶" },
      { id: 4,  label: "Likes sports",      question: "Do you like sports?",              emoji: "⚽" },
      { id: 5,  label: "Watches TV daily",  question: "Do you watch TV every day?",       emoji: "📺" },
      { id: 6,  label: "Likes reading",     question: "Do you like reading?",             emoji: "📚" },
      { id: 7,  label: "Likes summer",      question: "Do you like summer?",              emoji: "☀️" },
      { id: 8,  label: "Plays games",       question: "Do you play video games?",         emoji: "🎮" },
      { id: 9,  label: "Has a sibling",     question: "Do you have a brother or sister?", emoji: "👫" },
      { id: 10, label: "Likes pizza",       question: "Do you like pizza?",               emoji: "🍕" },
      { id: 11, label: "Has a bike",        question: "Do you have a bicycle?",           emoji: "🚲" },
      { id: 12, label: "Likes music",       question: "Do you like music?",               emoji: "🎵" },
      { id: 13, label: "Drinks milk daily", question: "Do you drink milk every day?",     emoji: "🥛" },
      { id: 14, label: "Likes Japanese food", question: "Do you like Japanese food?",     emoji: "🍱" },
      { id: 15, label: "Wakes up early",    question: "Do you wake up before 7am?",       emoji: "⏰" },
      { id: 16, label: "Likes English",     question: "Do you like English?",             emoji: "🌏" },
    ],
  },
  {
    week: 2,
    grade: "1",
    theme: "Abilities",
    grammar: "Can you...? — Yes, I can. / No, I can't.",
    description: "Find classmates who can do these things!",
    cells: [
      { id: 1,  label: "Can swim",          question: "Can you swim?",                        emoji: "🏊" },
      { id: 2,  label: "Can cook",          question: "Can you cook?",                        emoji: "🍳" },
      { id: 3,  label: "Can sing",          question: "Can you sing well?",                   emoji: "🎤" },
      { id: 4,  label: "Can draw well",     question: "Can you draw well?",                   emoji: "🎨" },
      { id: 5,  label: "Can ride a bike",   question: "Can you ride a bike?",                 emoji: "🚲" },
      { id: 6,  label: "Can play soccer",   question: "Can you play soccer?",                 emoji: "⚽" },
      { id: 7,  label: "Can whistle",       question: "Can you whistle?",                     emoji: "😗" },
      { id: 8,  label: "Can run fast",      question: "Can you run 100m fast?",               emoji: "🏃" },
      { id: 9,  label: "Can play piano",    question: "Can you play the piano?",              emoji: "🎹" },
      { id: 10, label: "Counts to 100",     question: "Can you count to 100 in English?",     emoji: "🔢" },
      { id: 11, label: "Can juggle",        question: "Can you juggle?",                      emoji: "🤹" },
      { id: 12, label: "Can make sushi",    question: "Can you make sushi?",                  emoji: "🍣" },
      { id: 13, label: "Speaks Chinese",    question: "Can you speak Chinese?",               emoji: "🇨🇳" },
      { id: 14, label: "Folds origami",     question: "Can you fold origami?",                emoji: "🦢" },
      { id: 15, label: "Skips rope",        question: "Can you skip rope well?",              emoji: "🪢" },
      { id: 16, label: "Plays guitar",      question: "Can you play the guitar?",             emoji: "🎸" },
    ],
  },
  {
    week: 3,
    grade: "1",
    theme: "Family & Home",
    grammar: "Do you have...? / Are you...? / Is your...?",
    description: "Learn about your classmates' families and home life.",
    cells: [
      { id: 1,  label: "Has a dog",           question: "Do you have a dog?",                    emoji: "🐕" },
      { id: 2,  label: "Has a cat",           question: "Do you have a cat?",                    emoji: "🐈" },
      { id: 3,  label: "Is the oldest child", question: "Are you the oldest child?",             emoji: "👑" },
      { id: 4,  label: "Is an only child",    question: "Are you an only child?",                emoji: "🧒" },
      { id: 5,  label: "Has a big room",      question: "Is your bedroom big?",                  emoji: "🛏️" },
      { id: 6,  label: "Helps at home",       question: "Do you help at home?",                  emoji: "🧹" },
      { id: 7,  label: "Cooks at home",       question: "Do you cook at home sometimes?",        emoji: "🍳" },
      { id: 8,  label: "Lives near school",   question: "Do you live near school?",              emoji: "🏫" },
      { id: 9,  label: "Has 3+ siblings",     question: "Do you have three or more siblings?",   emoji: "👨‍👩‍👧‍👦" },
      { id: 10, label: "Grandparents nearby", question: "Do your grandparents live near you?",   emoji: "👴" },
      { id: 11, label: "Has a bookshelf",     question: "Do you have a bookshelf in your room?", emoji: "📚" },
      { id: 12, label: "Has a fish",          question: "Do you have a fish at home?",           emoji: "🐟" },
      { id: 13, label: "Has a garden",        question: "Does your house have a garden?",        emoji: "🌷" },
      { id: 14, label: "Walks to school",     question: "Do you walk to school?",                emoji: "🚶" },
      { id: 15, label: "Shares a room",       question: "Do you share a room with a sibling?",   emoji: "🛏️" },
      { id: 16, label: "Shops with family",   question: "Do you go shopping with your family?",  emoji: "🛒" },
    ],
  },
];
