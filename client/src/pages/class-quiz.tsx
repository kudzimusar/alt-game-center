import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock, Trophy, CheckCircle2, XCircle, Users, Zap, Crown, BookOpen, RotateCcw, Sparkles, Loader2, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { revisionQuizData } from "@/lib/quiz/class-quiz-revision";

// Question bank structured by grade and grammar
const quizData: Record<string, any[]> = {
  "1-can": [
    { id: 1, question: "I ___ swim very well.", options: ["can", "cans", "could", "canning"], answer: 0, explanation: "Use 'can' for ability. No 's' is needed after can.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 2, question: "She ___ speak English.", options: ["can", "can to", "cans", "could to"], answer: 0, explanation: "'Can' is followed by the base form of the verb without 'to'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "___ you play the piano?", options: ["Can", "Do can", "Are can", "Could"], answer: 0, explanation: "Start a yes/no question with 'Can' to ask about ability.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 4, question: "Which sentence is CORRECT?", options: ["I can to swim.", "I can swim.", "I can swimming.", "I cans swim."], answer: 1, explanation: "Subject + can + base verb is the correct pattern.", type: "Best Answer", difficulty: "Medium" },
    { id: 5, question: "Find the mistake: 'She cans play guitar.'", options: ["She → He", "cans → can", "play → plays", "guitar → the guitar"], answer: 1, explanation: "Modal verbs like 'can' never add -s for third person singular.", type: "Error Correction", difficulty: "Medium" },
    { id: 6, question: "He ___ not run fast.", options: ["can", "cans", "do", "does"], answer: 0, explanation: "Negative form is 'cannot / can't'. Use 'can' before 'not'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 7, question: "Which question is CORRECT?", options: ["Can she sings?", "Does she can sing?", "Can she sing?", "She can sing?"], answer: 2, explanation: "Can + subject + base verb → 'Can she sing?'", type: "Best Answer", difficulty: "Easy" },
    { id: 8, question: "I ___ ride a bike, but I can't drive a car.", options: ["can", "can't", "could", "couldn't"], answer: 0, explanation: "The sentence says 'but I can't drive', so the first part must be a positive ability: 'can'.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 9, question: "Find the mistake: 'Can you to help me?'", options: ["Can → Could", "to help → help", "you → I", "me → us"], answer: 1, explanation: "After a modal verb like 'can', use the base verb without 'to'.", type: "Error Correction", difficulty: "Medium" },
    { id: 10, question: "My dog ___ catch a ball.", options: ["can", "can to", "is can", "have can"], answer: 0, explanation: "Animals can have abilities too. Use 'can + base verb'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 11, question: "What does 'Can I open the window?' mean?", options: ["Asking for information", "Asking for permission", "Giving an order", "Making a promise"], answer: 1, explanation: "'Can I…?' is a polite way to ask for permission.", type: "Best Answer", difficulty: "Medium" },
    { id: 12, question: "Which is the correct negative of 'She can dance'?", options: ["She not can dance.", "She doesn't can dance.", "She can't dance.", "She cans't dance."], answer: 2, explanation: "The negative of 'can' is 'can't' or 'cannot'.", type: "Best Answer", difficulty: "Easy" },
    { id: 13, question: "Find the mistake: 'Can he plays basketball?'", options: ["Can → Does", "plays → play", "basketball → the basketball", "he → she"], answer: 1, explanation: "After 'can' always use the base form — 'play', not 'plays'.", type: "Error Correction", difficulty: "Medium" },
    { id: 14, question: "Yuki ___ speak three languages!", options: ["can", "cans", "is able", "have"], answer: 0, explanation: "'Can' expresses ability. It doesn't change for any subject.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 15, question: "Which sentence shows INABILITY?", options: ["I can swim.", "Can you swim?", "She can't cook.", "He can run fast."], answer: 2, explanation: "'Can't' (cannot) expresses that someone is NOT able to do something.", type: "Best Answer", difficulty: "Easy" }
  ],
  "2-past": [
    { id: 1, question: "What did you ___ yesterday?", options: ["do", "does", "did", "doing"], answer: 0, explanation: "After 'did' in a question, use the base form of the verb.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 2, question: "I ___ to school yesterday.", options: ["go", "goes", "went", "going"], answer: 2, explanation: "'Went' is the irregular past form of 'go'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "Find the mistake: 'She don't like apples yesterday.'", options: ["She → He", "don't → didn't", "like → liked", "apples → apple"], answer: 1, explanation: "Use 'didn't' (not 'don't') for past simple negatives.", type: "Error Correction", difficulty: "Medium" },
    { id: 4, question: "We ___ a movie last Friday.", options: ["watch", "watches", "watched", "watching"], answer: 2, explanation: "Regular past tense adds -ed. 'Watch' → 'watched'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 5, question: "Which sentence is CORRECT?", options: ["I didn't went there.", "I didn't go there.", "I didn't gone there.", "I not went there."], answer: 1, explanation: "After 'didn't', always use the base form: 'go', not 'went'.", type: "Best Answer", difficulty: "Medium" },
    { id: 6, question: "She ___ a letter to her friend last week.", options: ["write", "writes", "wrote", "written"], answer: 2, explanation: "'Write' is irregular — its past form is 'wrote'.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 7, question: "Find the mistake: 'Did he went to the park?'", options: ["Did → Does", "he → she", "went → go", "park → the park"], answer: 2, explanation: "After 'did' in a question, use the base form 'go', not 'went'.", type: "Error Correction", difficulty: "Medium" },
    { id: 8, question: "I ___ very tired after the game.", options: ["am", "was", "were", "be"], answer: 1, explanation: "'Was' is the past form of 'am/is' for I, he, she, it.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 9, question: "They ___ happy about the result.", options: ["was", "is", "were", "be"], answer: 2, explanation: "'Were' is the past form of 'are' for plural subjects.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 10, question: "What is the past form of 'eat'?", options: ["eated", "aten", "ate", "eats"], answer: 2, explanation: "'Eat' is irregular. Its past form is 'ate'.", type: "Best Answer", difficulty: "Easy" },
    { id: 11, question: "Which question is CORRECT?", options: ["Did she went?", "Did she goes?", "Did she go?", "Did she going?"], answer: 2, explanation: "Did + subject + base verb: 'Did she go?' is correct.", type: "Best Answer", difficulty: "Medium" },
    { id: 12, question: "Find the mistake: 'He study hard last night.'", options: ["He → She", "study → studied", "hard → hardly", "night → evening"], answer: 1, explanation: "For regular past tense, add -ed: 'study' → 'studied'.", type: "Error Correction", difficulty: "Easy" },
    { id: 13, question: "We ___ not watch TV last night.", options: ["do", "does", "did", "done"], answer: 2, explanation: "Use 'did not / didn't' for past simple negatives.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 14, question: "What is the past form of 'have'?", options: ["haved", "has", "had", "have"], answer: 2, explanation: "'Have' is irregular. Its past form is 'had'.", type: "Best Answer", difficulty: "Easy" },
    { id: 15, question: "I ___ my homework before dinner.", options: ["finish", "finishes", "finished", "finishing"], answer: 2, explanation: "Regular past tense: 'finish' → 'finished'.", type: "Fill in the Blank", difficulty: "Easy" }
  ],
  "3-perfect": [
    { id: 1, question: "Have you ever ___ to America?", options: ["go", "went", "been", "be"], answer: 2, explanation: "Use 'been' for the experience of visiting a place with Present Perfect.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 2, question: "I have ___ English for three years.", options: ["study", "studied", "studying", "studies"], answer: 1, explanation: "Present Perfect uses 'have/has' + past participle.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "She ___ already eaten lunch.", options: ["have", "has", "had", "is"], answer: 1, explanation: "Use 'has' (not 'have') with third person singular subjects.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 4, question: "Which sentence is CORRECT Present Perfect?", options: ["I have saw that movie.", "I have seen that movie.", "I have see that movie.", "I has seen that movie."], answer: 1, explanation: "'See' → past participle is 'seen'. Use 'have' with I.", type: "Best Answer", difficulty: "Medium" },
    { id: 5, question: "Find the mistake: 'He has went to Tokyo.'", options: ["He → She", "has → have", "went → gone", "to → in"], answer: 2, explanation: "'Go' → past participle is 'gone'. 'Went' is simple past, not a past participle.", type: "Error Correction", difficulty: "Medium" },
    { id: 6, question: "We have lived here ___ 2010.", options: ["for", "since", "ago", "before"], answer: 1, explanation: "Use 'since' with a specific point in time (2010, Monday, etc.).", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 7, question: "I have known her ___ five years.", options: ["since", "ago", "for", "before"], answer: 2, explanation: "Use 'for' with a duration of time (five years, two months, etc.).", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 8, question: "Have you ___ tried sushi?", options: ["ever", "never", "already", "yet"], answer: 0, explanation: "'Ever' is used in questions to ask about any time in someone's life.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 9, question: "I have ___ finished my homework. I just did it.", options: ["yet", "never", "just", "since"], answer: 2, explanation: "'Just' means a very short time ago — used in Present Perfect.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 10, question: "Which sentence is CORRECT?", options: ["I never have eaten natto.", "I have never eaten natto.", "I have never eat natto.", "I has never eaten natto."], answer: 1, explanation: "'Never' comes between 'have' and the past participle.", type: "Best Answer", difficulty: "Hard" },
    { id: 11, question: "Find the mistake: 'She have studied French before.'", options: ["She → He", "have → has", "studied → study", "before → ago"], answer: 1, explanation: "With 'she' (third person singular), use 'has', not 'have'.", type: "Error Correction", difficulty: "Easy" },
    { id: 12, question: "Has he finished ___ yet?", options: ["it", "them", "his", "him"], answer: 0, explanation: "'It' is the correct object pronoun here — 'finished it yet?'", type: "Fill in the Blank", difficulty: "Hard" },
    { id: 13, question: "What does 'I have been to Paris' mean?", options: ["I am in Paris now.", "I went and came back.", "I will go to Paris.", "I want to go to Paris."], answer: 1, explanation: "'Have been to' means the experience of visiting and returning — you are NOT there now.", type: "Best Answer", difficulty: "Medium" },
    { id: 14, question: "Find the mistake: 'They have never went abroad.'", options: ["They → He", "have → has", "never → ever", "went → been"], answer: 3, explanation: "'Gone/been abroad' uses the past participle. 'Went' is simple past.", type: "Error Correction", difficulty: "Hard" },
    { id: 15, question: "Which word tells us HOW LONG something has continued?", options: ["ever", "just", "for", "already"], answer: 2, explanation: "'For' expresses duration: 'I have studied for two hours.'", type: "Best Answer", difficulty: "Medium" }
  ],

  // ── Grade 1 ───────────────────────────────────────────────────
  "1-be": [
    { id: 1, question: "I ___ a student.", options: ["am", "is", "are", "be"], answer: 0, explanation: "Use 'am' with the subject 'I'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 2, question: "She ___ from Japan.", options: ["am", "is", "are", "be"], answer: 1, explanation: "Use 'is' with he, she, and it.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "We ___ in Grade 1.", options: ["am", "is", "are", "be"], answer: 2, explanation: "Use 'are' with we, you, and they.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 4, question: "Which sentence is CORRECT?", options: ["He are tall.", "She am kind.", "They is busy.", "You are smart."], answer: 3, explanation: "'You are smart' is correct. 'Are' pairs with 'you'.", type: "Best Answer", difficulty: "Easy" },
    { id: 5, question: "Find the mistake: 'I is twelve years old.'", options: ["I → He", "is → am", "twelve → 12", "years → year"], answer: 1, explanation: "'I' must use 'am', not 'is'.", type: "Error Correction", difficulty: "Easy" },
    { id: 6, question: "___ he a teacher?", options: ["Am", "Is", "Are", "Be"], answer: 1, explanation: "Use 'Is' for questions with he, she, or it.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 7, question: "I ___ not tired today.", options: ["am", "is", "are", "do"], answer: 0, explanation: "Negative: I am not → 'I'm not'. Use 'am' with 'I'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 8, question: "Which is the correct question?", options: ["Are you hungry?", "Is you hungry?", "Am you hungry?", "Be you hungry?"], answer: 0, explanation: "'Are you…?' is the correct question form for 'you'.", type: "Best Answer", difficulty: "Easy" },
    { id: 9, question: "Ken and Yuki ___ best friends.", options: ["am", "is", "are", "be"], answer: 2, explanation: "Two people together = plural, so use 'are'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 10, question: "Find the mistake: 'Are she a nurse?'", options: ["Are → Is", "she → he", "a → an", "nurse → doctor"], answer: 0, explanation: "'She' needs 'Is', not 'Are'.", type: "Error Correction", difficulty: "Easy" },
    { id: 11, question: "The book ___ on the desk.", options: ["am", "is", "are", "be"], answer: 1, explanation: "'The book' is singular (it), so use 'is'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 12, question: "Which is the correct negative?", options: ["She not is kind.", "She isn't kind.", "She amn't kind.", "She aren't kind."], answer: 1, explanation: "The negative of 'she is' is 'she isn't' (is not).", type: "Best Answer", difficulty: "Medium" },
    { id: 13, question: "My parents ___ at home right now.", options: ["am", "is", "are", "be"], answer: 2, explanation: "'My parents' is plural, so use 'are'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 14, question: "Find the mistake: 'We isn't ready.'", options: ["We → I", "isn't → aren't", "ready → readying", "We → They"], answer: 1, explanation: "'We' uses 'are', so the negative is 'aren't'.", type: "Error Correction", difficulty: "Medium" },
    { id: 15, question: "Which sentence uses a be-verb CORRECTLY?", options: ["I are happy.", "She am nice.", "He is tall.", "They is late."], answer: 2, explanation: "'He is tall' is correct — 'is' pairs with he, she, it.", type: "Best Answer", difficulty: "Easy" }
  ],
  "1-present": [
    { id: 1, question: "I ___ English every day.", options: ["study", "studies", "studied", "studying"], answer: 0, explanation: "With 'I', use the base form of the verb in simple present.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 2, question: "She ___ tennis on weekends.", options: ["play", "plays", "played", "playing"], answer: 1, explanation: "With he/she/it, add -s to the verb: 'plays'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "He ___ not like coffee.", options: ["do", "does", "is", "are"], answer: 1, explanation: "Negative with he/she/it: 'does not / doesn't'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 4, question: "Which sentence is CORRECT?", options: ["She study hard.", "She studys hard.", "She studies hard.", "She studing hard."], answer: 2, explanation: "For verbs ending in -y after a consonant, change y → i and add -es: 'studies'.", type: "Best Answer", difficulty: "Medium" },
    { id: 5, question: "___ he play soccer?", options: ["Do", "Does", "Is", "Are"], answer: 1, explanation: "Questions with he/she/it use 'Does', not 'Do'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 6, question: "Find the mistake: 'She don't eat meat.'", options: ["She → He", "don't → doesn't", "eat → eats", "meat → meats"], answer: 1, explanation: "With 'she', use 'doesn't' (does not), not 'don't'.", type: "Error Correction", difficulty: "Easy" },
    { id: 7, question: "They ___ in Osaka.", options: ["live", "lives", "lived", "living"], answer: 0, explanation: "'They' is plural — use the base form 'live'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 8, question: "My father ___ to work by train.", options: ["go", "goes", "gone", "going"], answer: 1, explanation: "'My father' = he, so add -es to 'go' → 'goes'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 9, question: "Which question is CORRECT?", options: ["Do she like cats?", "Does she likes cats?", "Does she like cats?", "Is she like cats?"], answer: 2, explanation: "Does + subject + base verb: 'Does she like cats?'", type: "Best Answer", difficulty: "Medium" },
    { id: 10, question: "Find the mistake: 'He go to school by bike.'", options: ["He → She", "go → goes", "school → the school", "bike → a bike"], answer: 1, explanation: "With 'he', the verb needs -s: 'goes'.", type: "Error Correction", difficulty: "Easy" },
    { id: 11, question: "I ___ breakfast at 7 every morning.", options: ["have", "has", "had", "having"], answer: 0, explanation: "With 'I', always use the base form: 'have'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 12, question: "Which is NOT correct?", options: ["We play games.", "They study math.", "He watch TV.", "She reads books."], answer: 2, explanation: "'He watch TV' is wrong — it should be 'He watches TV'.", type: "Best Answer", difficulty: "Medium" },
    { id: 13, question: "She ___ three languages.", options: ["speak", "speaks", "spoken", "speaking"], answer: 1, explanation: "'She' is third person singular — add -s: 'speaks'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 14, question: "Find the mistake: 'Does he goes to juku?'", options: ["Does → Do", "goes → go", "to → at", "juku → school"], answer: 1, explanation: "After 'does' in a question, always use the base form: 'go', not 'goes'.", type: "Error Correction", difficulty: "Medium" },
    { id: 15, question: "We ___ our homework after dinner.", options: ["do", "does", "did", "doing"], answer: 0, explanation: "'We' is plural — use the base form 'do'.", type: "Fill in the Blank", difficulty: "Easy" }
  ],

  // ── Grade 2 ───────────────────────────────────────────────────
  "2-going_to": [
    { id: 1, question: "I ___ going to study tonight.", options: ["am", "is", "are", "be"], answer: 0, explanation: "With 'I', use 'am going to'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 2, question: "She ___ going to visit Kyoto next week.", options: ["am", "is", "are", "be"], answer: 1, explanation: "With she/he/it, use 'is going to'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "We ___ going to watch the game together.", options: ["am", "is", "are", "be"], answer: 2, explanation: "With we/they/you, use 'are going to'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 4, question: "Which sentence is CORRECT?", options: ["I going to eat pizza.", "I am going eat pizza.", "I am going to eat pizza.", "I am going to eating pizza."], answer: 2, explanation: "The pattern is: am/is/are + going to + base verb.", type: "Best Answer", difficulty: "Easy" },
    { id: 5, question: "Find the mistake: 'He is going to plays soccer.'", options: ["He → She", "is → are", "going to → going", "plays → play"], answer: 3, explanation: "After 'going to', always use the base form: 'play', not 'plays'.", type: "Error Correction", difficulty: "Medium" },
    { id: 6, question: "___ you going to come to the party?", options: ["Am", "Is", "Are", "Do"], answer: 2, explanation: "Question form with 'you': 'Are you going to…?'", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 7, question: "I am not ___ to stay late.", options: ["go", "going", "gone", "went"], answer: 1, explanation: "Negative: 'am not going to'. The -ing form stays.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 8, question: "What is 'going to' used for?", options: ["Past actions", "Habits", "Plans and intentions", "Commands"], answer: 2, explanation: "'Going to' expresses future plans or intentions the speaker has already decided.", type: "Best Answer", difficulty: "Easy" },
    { id: 9, question: "Which question is CORRECT?", options: ["Is she going to comes?", "Is she going to come?", "Does she going to come?", "She is going to come?"], answer: 1, explanation: "Is + subject + going to + base verb: 'Is she going to come?'", type: "Best Answer", difficulty: "Medium" },
    { id: 10, question: "Find the mistake: 'They are going to visited the museum.'", options: ["They → She", "are → is", "going to → going", "visited → visit"], answer: 3, explanation: "After 'going to', use the base verb: 'visit', not 'visited'.", type: "Error Correction", difficulty: "Medium" },
    { id: 11, question: "He ___ going to be a doctor someday.", options: ["am", "is", "are", "will"], answer: 1, explanation: "'He' needs 'is going to'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 12, question: "I am going to ___ lunch at noon.", options: ["eat", "eats", "ate", "eating"], answer: 0, explanation: "After 'going to', always use the base form of the verb.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 13, question: "Which is the correct negative?", options: ["I amn't going to go.", "I not going to go.", "I'm not going to go.", "I don't going to go."], answer: 2, explanation: "Negative: 'I'm not going to go.' = 'I am not going to go.'", type: "Best Answer", difficulty: "Medium" },
    { id: 14, question: "Find the mistake: 'Are he going to help?'", options: ["Are → Is", "he → she", "going → go", "help → helps"], answer: 0, explanation: "'He' needs 'Is', not 'Are'.", type: "Error Correction", difficulty: "Easy" },
    { id: 15, question: "They ___ going to move to a new house.", options: ["am", "is", "are", "be"], answer: 2, explanation: "'They' is plural — use 'are going to'.", type: "Fill in the Blank", difficulty: "Easy" }
  ],
  "2-must": [
    { id: 1, question: "You ___ wear a seatbelt. It's the law.", options: ["must", "musts", "must to", "musting"], answer: 0, explanation: "'Must' expresses strong obligation. No -s, no 'to'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 2, question: "Students ___ be quiet in the library.", options: ["must", "musts", "must be to", "must to"], answer: 0, explanation: "'Must + base verb' — no 'to' and no changes for any subject.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "Which sentence is CORRECT?", options: ["She must to study.", "She musts study.", "She must study.", "She must studying."], answer: 2, explanation: "Must + base verb with no 'to' and no -ing.", type: "Best Answer", difficulty: "Easy" },
    { id: 4, question: "I ___ not run in the hallway.", options: ["must", "have", "do", "am"], answer: 0, explanation: "'Must not / mustn't' means it is forbidden or not allowed.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 5, question: "You ___ to follow the school rules.", options: ["must", "have", "has", "musts"], answer: 1, explanation: "'Have to' also expresses obligation. 'Have to' is used with I/you/we/they.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 6, question: "She ___ to wear a uniform at school.", options: ["have", "has", "must", "do"], answer: 1, explanation: "'Has to' is used with he/she/it to show obligation.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 7, question: "Find the mistake: 'He musts finish his homework.'", options: ["He → She", "musts → must", "finish → finishes", "his → her"], answer: 1, explanation: "'Must' never changes — no -s for third person.", type: "Error Correction", difficulty: "Easy" },
    { id: 8, question: "What does 'must not' mean?", options: ["Not necessary", "Forbidden / not allowed", "Maybe not", "Past obligation"], answer: 1, explanation: "'Must not' means something is prohibited — do NOT do it.", type: "Best Answer", difficulty: "Medium" },
    { id: 9, question: "I don't ___ to wake up early on Sunday.", options: ["must", "have", "has", "need"], answer: 1, explanation: "'Don't have to' means there is NO obligation — it's optional.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 10, question: "Which sentence means 'it is NOT necessary'?", options: ["You must not go.", "You don't have to go.", "You must go.", "You have to go."], answer: 1, explanation: "'Don't have to' = not necessary (but you can if you want).", type: "Best Answer", difficulty: "Medium" },
    { id: 11, question: "Find the mistake: 'She have to finish by noon.'", options: ["She → He", "have → has", "finish → finishes", "by → at"], answer: 1, explanation: "With 'she', use 'has to', not 'have to'.", type: "Error Correction", difficulty: "Medium" },
    { id: 12, question: "We ___ eat or drink in the classroom.", options: ["must not", "don't have to", "must", "have to"], answer: 0, explanation: "'Must not' means it is forbidden — eating/drinking in class is not allowed.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 13, question: "What is the difference between 'must not' and 'don't have to'?", options: ["They are the same.", "'Must not' = forbidden; 'don't have to' = not necessary.", "'Don't have to' = forbidden; 'must not' = not necessary.", "Both mean 'not possible'."], answer: 1, explanation: "'Must not' = NOT allowed. 'Don't have to' = NOT required, but optional.", type: "Best Answer", difficulty: "Hard" },
    { id: 14, question: "You ___ see this movie — it's amazing!", options: ["must", "must not", "don't have to", "have"], answer: 0, explanation: "'Must' can also express a strong recommendation.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 15, question: "Find the mistake: 'Does she must go?'", options: ["Does → Is", "must → have to", "go → goes", "Does → Must"], answer: 3, explanation: "'Must' is already a modal verb — for questions, move it to the front: 'Must she go?'", type: "Error Correction", difficulty: "Hard" }
  ],

  // ── Grade 3 ───────────────────────────────────────────────────
  "3-passive": [
    { id: 1, question: "English ___ spoken in many countries.", options: ["is", "are", "has", "was"], answer: 0, explanation: "Passive: is/am/are + past participle. 'English' is singular → 'is spoken'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 2, question: "The window ___ broken by the ball.", options: ["is", "was", "were", "been"], answer: 1, explanation: "Past passive for a singular subject: 'was + past participle'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "These pictures ___ taken by my father.", options: ["is", "was", "were", "be"], answer: 2, explanation: "Plural subject → 'were + past participle'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 4, question: "Which sentence is CORRECT passive?", options: ["Rice is eat in Japan.", "Rice is eaten in Japan.", "Rice is ate in Japan.", "Rice eats in Japan."], answer: 1, explanation: "Passive = is + past participle. 'Eat' → 'eaten'.", type: "Best Answer", difficulty: "Medium" },
    { id: 5, question: "Find the mistake: 'This book was write by Natsume Soseki.'", options: ["This → That", "was → is", "write → written", "by → for"], answer: 2, explanation: "Passive uses the past participle: 'write' → 'written'.", type: "Error Correction", difficulty: "Medium" },
    { id: 6, question: "The cake ___ made by my mother yesterday.", options: ["is", "are", "was", "were"], answer: 2, explanation: "Past tense passive with singular subject: 'was made'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 7, question: "How do you make a passive sentence?", options: ["Subject + verb + object", "Subject + be + past participle", "Subject + have + past participle", "Subject + be + base verb"], answer: 1, explanation: "Passive = Subject + be (am/is/are/was/were) + past participle.", type: "Best Answer", difficulty: "Medium" },
    { id: 8, question: "The rooms ___ cleaned every day.", options: ["is", "was", "are", "be"], answer: 2, explanation: "'Rooms' is plural → 'are cleaned'. Present passive.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 9, question: "Find the mistake: 'The song was sang by BTS.'", options: ["The → A", "was → is", "sang → sung", "by → with"], answer: 2, explanation: "'Sing' → past participle is 'sung', not 'sang'.", type: "Error Correction", difficulty: "Hard" },
    { id: 10, question: "This bridge ___ built 100 years ago.", options: ["is", "was", "were", "has"], answer: 1, explanation: "'Ago' signals past tense → 'was built'.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 11, question: "Which sentence uses passive CORRECTLY?", options: ["The ball kicked by Ken.", "Ken was kicked the ball.", "The ball was kicked by Ken.", "Ken kicked by the ball."], answer: 2, explanation: "Subject (ball) + was + past participle (kicked) + by + agent (Ken).", type: "Best Answer", difficulty: "Medium" },
    { id: 12, question: "Many languages ___ spoken in Singapore.", options: ["is", "was", "are", "be"], answer: 2, explanation: "'Languages' is plural → 'are spoken'. Present passive.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 13, question: "Find the mistake: 'The letters were sended yesterday.'", options: ["The → These", "were → was", "sended → sent", "yesterday → last day"], answer: 2, explanation: "'Send' is irregular — its past participle is 'sent', not 'sended'.", type: "Error Correction", difficulty: "Medium" },
    { id: 14, question: "The Eiffel Tower ___ visited by millions of tourists each year.", options: ["is", "are", "was", "were"], answer: 0, explanation: "Singular subject + present passive → 'is visited'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 15, question: "What does the passive voice focus on?", options: ["The person doing the action", "The action and what receives it", "The time of the action", "The reason for the action"], answer: 1, explanation: "Passive focuses on what happened (or what was affected), not who did it.", type: "Best Answer", difficulty: "Medium" }
  ],
  "3-relative": [
    { id: 1, question: "This is the book ___ I told you about.", options: ["who", "which", "whose", "whom"], answer: 1, explanation: "Use 'which' (or 'that') for things. Use 'who' for people.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 2, question: "I have a friend ___ speaks five languages.", options: ["which", "whose", "who", "whom"], answer: 2, explanation: "Use 'who' (or 'that') for people as the subject of the relative clause.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "The girl ___ bag was stolen is my classmate.", options: ["who", "which", "whose", "that"], answer: 2, explanation: "Use 'whose' to show possession in a relative clause.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 4, question: "Which sentence is CORRECT?", options: ["I know the man which won.", "I know the man who won.", "I know the man whose won.", "I know the man whom won."], answer: 1, explanation: "'Who' is used for people when they are the subject of the clause.", type: "Best Answer", difficulty: "Easy" },
    { id: 5, question: "Find the mistake: 'The movie which I saw it was great.'", options: ["The → A", "which → who", "saw it → saw", "great → good"], answer: 2, explanation: "'Which I saw it' has an extra 'it'. The relative pronoun already replaces the object.", type: "Error Correction", difficulty: "Hard" },
    { id: 6, question: "The town ___ I grew up in is small.", options: ["who", "whose", "which", "whom"], answer: 2, explanation: "Use 'which' (or 'that') for places and things.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 7, question: "She is the teacher ___ helped me the most.", options: ["which", "whose", "what", "who"], answer: 3, explanation: "'Who' refers to a person (the teacher) as the subject of the relative clause.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 8, question: "The dog ___ bit me was big.", options: ["which", "whose", "who", "whom"], answer: 0, explanation: "For animals, use 'which' or 'that'. 'Who' is mainly for people.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 9, question: "Which sentence is CORRECT?", options: ["I want a phone who has a good camera.", "I want a phone which has a good camera.", "I want a phone whose has a good camera.", "I want a phone whom has a good camera."], answer: 1, explanation: "A phone is a thing — use 'which' (or 'that').", type: "Best Answer", difficulty: "Easy" },
    { id: 10, question: "Find the mistake: 'He is the student who score is highest.'", options: ["He → She", "who → whose", "score → scores", "highest → higher"], answer: 1, explanation: "'Whose' shows possession: 'the student whose score is highest'.", type: "Error Correction", difficulty: "Medium" },
    { id: 11, question: "The word 'who', 'which', and 'that' in relative clauses are called ___.", options: ["prepositions", "conjunctions", "relative pronouns", "auxiliary verbs"], answer: 2, explanation: "They are relative pronouns — they connect a noun to a describing clause.", type: "Best Answer", difficulty: "Easy" },
    { id: 12, question: "Is it possible to use 'that' instead of 'who' or 'which'?", options: ["Never", "Only with things", "Only with people", "Yes, for both people and things"], answer: 3, explanation: "'That' can replace 'who' or 'which' in most relative clauses.", type: "Best Answer", difficulty: "Medium" },
    { id: 13, question: "This is the restaurant ___ we ate at last year.", options: ["who", "whose", "which", "whom"], answer: 2, explanation: "A restaurant is a thing/place — use 'which' or 'that'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 14, question: "Find the mistake: 'I have a cat which name is Mochi.'", options: ["I → She", "which → whose", "name → names", "is → was"], answer: 1, explanation: "Possession requires 'whose': 'a cat whose name is Mochi'.", type: "Error Correction", difficulty: "Medium" },
    { id: 15, question: "The students ___ passed the test were very happy.", options: ["who", "which", "whose", "whom"], answer: 0, explanation: "'Who' refers to people as the subject of the relative clause.", type: "Fill in the Blank", difficulty: "Easy" }
  ]
};

const allQuizData = { ...quizData, ...revisionQuizData };

type GameState = "LOBBY" | "QUESTION" | "REVEAL" | "LEADERBOARD" | "FINAL";
type LobbyMode = "regular" | "revision";

const gradeTopics: Record<string, { key: string; label: string }[]> = {
  "1": [
    { key: "1-can",     label: "CAN" },
    { key: "1-be",      label: "BE VERB" },
    { key: "1-present", label: "PRESENT" },
  ],
  "2": [
    { key: "2-past",     label: "PAST TENSE" },
    { key: "2-going_to", label: "GOING TO" },
    { key: "2-must",     label: "MUST / HAVE TO" },
  ],
  "3": [
    { key: "3-perfect",  label: "PRESENT PERFECT" },
    { key: "3-passive",  label: "PASSIVE VOICE" },
    { key: "3-relative", label: "RELATIVE PRONOUNS" },
  ],
};

const revisionGradeTopics: Record<string, { key: string; label: string; desc: string }[]> = {
  "1": [
    { key: "rev-1-w1", label: "REVISION WEEK 1", desc: "Greetings · I like/can/have · Do you?" },
    { key: "rev-1-w2", label: "REVISION WEEK 2", desc: "What/How many? · He/She · Vocabulary" },
  ],
  "2": [
    { key: "rev-2-w1", label: "REVISION WEEK 1", desc: "Be verbs · Simple present · WH-questions · There is/are" },
    { key: "rev-2-w2", label: "REVISION WEEK 2", desc: "Can · Simple past · Progressive · Prepositions" },
  ],
  "3": [
    { key: "rev-3-w1", label: "REVISION WEEK 1", desc: "Going to · Will · Must/Should · Comparatives" },
    { key: "rev-3-w2", label: "REVISION WEEK 2", desc: "Infinitives · When/If · SVOO/SVOC · Past progressive" },
  ],
};

export default function ClassQuiz() {
  const [gameState, setGameState] = useState<GameState>("LOBBY");
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>("regular");
  const [selectedGrade, setSelectedGrade] = useState("1");
  const [selectedQuiz, setSelectedQuiz] = useState("1-can");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timer, setTimer] = useState(15);
  const [scores, setScores] = useState<Record<string, number>>({
    "Team Dragons": 0,
    "Team Phoenix": 0,
    "Team Tigers": 0,
    "Team Pandas": 0
  });
  const [streak, setStreak] = useState<Record<string, number>>({
    "Team Dragons": 0,
    "Team Phoenix": 0,
    "Team Tigers": 0,
    "Team Pandas": 0
  });
  const [awardedTeams, setAwardedTeams] = useState<Set<string>>(new Set());
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const questions = lobbyMode === "ai" ? aiQuestions : (allQuizData[selectedQuiz] || []);
  const currentQuestion = questions[currentQuestionIdx];

  useEffect(() => {
    let interval: any;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && gameState === "QUESTION") {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer, gameState]);

  const startQuiz = () => {
    setGameState("QUESTION");
    setTimer(20);
    setIsTimerActive(true);
    setAwardedTeams(new Set());
  };

  const handleTimeUp = () => {
    setIsTimerActive(false);
    setGameState("REVEAL");
  };

  const awardPoints = (team: string) => {
    if (awardedTeams.has(team)) return;
    let points = 1000;
    const newStreak = (streak[team] || 0) + 1;
    if (newStreak >= 3) points += 200;
    if (newStreak >= 5) points += 500;
    setScores(prev => ({ ...prev, [team]: (prev[team] || 0) + points }));
    setStreak(prev => ({ ...prev, [team]: newStreak }));
    setAwardedTeams(prev => new Set(prev).add(team));
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const nextQuestion = () => {
    // Reset streak for teams that were NOT awarded this round
    Object.keys(scores).forEach(team => {
      if (!awardedTeams.has(team)) {
        setStreak(prev => ({ ...prev, [team]: 0 }));
      }
    });
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setTimer(20);
      setIsTimerActive(true);
      setGameState("QUESTION");
      setAwardedTeams(new Set());
    } else {
      setGameState("FINAL");
    }
  };

  const formatPoints = (num: number) => new Intl.NumberFormat().format(num);

  const generateAIQuestions = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiGenerated(false);
    try {
      const res = await fetch(`/api/games/class-quiz/${selectedGrade}?topic=${encodeURIComponent(aiTopic.trim())}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAiQuestions(data);
      setAiGenerated(true);
    } catch {
      alert("AI generation failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (gameState === "LOBBY") {
    return (
      <div className="min-h-screen bg-[#46178F] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl border border-white/20">
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-3">
              <Link href="/dashboard"><button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold"><Home size={18}/> Dashboard</button></Link>
              <span className="text-white/20">·</span>
              <Link href="/games"><button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold"><ArrowLeft size={18}/> All Games</button></Link>
            </div>
            <div className="bg-yellow-400 text-[#46178F] px-6 py-2 rounded-full font-black text-sm tracking-widest uppercase italic">
              New Game
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-7xl font-display font-black mb-4 uppercase italic tracking-tight">CLASS QUIZ</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Fast-paced multiple choice battles for JHS English. Ready to compete?</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="space-y-4">
              {/* Mode toggle */}
              <label className="text-xs font-black uppercase tracking-widest text-white/40">Mode</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setLobbyMode("regular"); setSelectedGrade("1"); setSelectedQuiz("1-can"); setAiGenerated(false); }}
                  className={`py-3 px-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1 transition-all ${lobbyMode === "regular" ? "bg-white text-[#46178F] shadow-xl" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
                >
                  <BookOpen size={14} /> Regular
                </button>
                <button
                  onClick={() => { setLobbyMode("revision"); setSelectedGrade("1"); setSelectedQuiz("rev-1-w1"); setAiGenerated(false); }}
                  className={`py-3 px-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1 transition-all ${lobbyMode === "revision" ? "bg-yellow-400 text-[#46178F] shadow-xl" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
                >
                  <RotateCcw size={14} /> Revision
                </button>
                <button
                  onClick={() => { setLobbyMode("ai" as any); setAiGenerated(false); setAiQuestions([]); }}
                  className={`py-3 px-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1 transition-all ${lobbyMode === ("ai" as any) ? "bg-purple-400 text-white shadow-xl" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
                >
                  <Sparkles size={14} /> AI Topic
                </button>
              </div>

              {lobbyMode === "revision" && (
                <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl px-4 py-3">
                  <p className="text-yellow-300 text-xs font-bold leading-snug">Start-of-year review. Each grade revises the grammar from their previous year.</p>
                </div>
              )}

              {(lobbyMode as any) === "ai" && (
                <div className="space-y-3">
                  <div className="bg-purple-400/10 border border-purple-400/30 rounded-2xl px-4 py-3">
                    <p className="text-purple-200 text-xs font-bold leading-snug">AI generates 10 fresh questions on any grammar topic or theme you choose.</p>
                  </div>
                  <label className="text-xs font-black uppercase tracking-widest text-white/40 block">Select Grade</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["1", "2", "3"].map(g => (
                      <button
                        key={g}
                        onClick={() => { setSelectedGrade(g); setAiGenerated(false); setAiQuestions([]); }}
                        className={`py-3 rounded-2xl font-black text-lg transition-all ${selectedGrade === g ? "bg-purple-400 text-white shadow-xl scale-[1.03]" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
                      >
                        G{g}
                      </button>
                    ))}
                  </div>
                  <label className="text-xs font-black uppercase tracking-widest text-white/40 block">Topic / Grammar Focus</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={e => { setAiTopic(e.target.value); setAiGenerated(false); }}
                    placeholder="e.g. Past Tense, Can, Travel..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    onKeyDown={e => e.key === "Enter" && generateAIQuestions()}
                  />
                  <button
                    onClick={generateAIQuestions}
                    disabled={!aiTopic.trim() || aiLoading}
                    className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg"
                  >
                    {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Sparkles size={16} /> Generate Questions</>}
                  </button>
                  {aiGenerated && (
                    <div className="bg-green-400/20 border border-green-400/40 rounded-2xl px-4 py-2 text-green-300 text-xs font-black text-center">
                      ✓ {aiQuestions.length} questions ready — hit Start Battle!
                    </div>
                  )}
                </div>
              )}

              {(lobbyMode as any) !== "ai" && (
                <>
                  {/* Grade selector */}
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Select Grade</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["1", "2", "3"].map(g => (
                      <button
                        key={g}
                        onClick={() => {
                          setSelectedGrade(g);
                          setSelectedQuiz(lobbyMode === "revision" ? revisionGradeTopics[g][0].key : gradeTopics[g][0].key);
                        }}
                        className={`py-4 rounded-2xl font-black text-lg transition-all ${selectedGrade === g ? "bg-yellow-400 text-[#46178F] shadow-xl scale-[1.03]" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
                      >
                        G{g}
                      </button>
                    ))}
                  </div>

                  {/* Topics for selected grade */}
                  <label className="text-xs font-black uppercase tracking-widest text-white/40 pt-1 block">
                    {lobbyMode === "revision" ? "Revision Quiz" : "Select Topic"}
                  </label>
                  <div className="space-y-3">
                    {lobbyMode === "regular"
                      ? gradeTopics[selectedGrade].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setSelectedQuiz(key)}
                            className={`w-full p-5 rounded-2xl text-left font-bold transition-all ${selectedQuiz === key ? "bg-white text-[#46178F] shadow-xl scale-[1.02]" : "bg-white/5 hover:bg-white/10 border border-white/10"}`}
                          >
                            <span className="block text-[10px] opacity-60 uppercase mb-1">Grade {selectedGrade}</span>
                            {label}
                          </button>
                        ))
                      : revisionGradeTopics[selectedGrade].map(({ key, label, desc }) => (
                          <button
                            key={key}
                            onClick={() => setSelectedQuiz(key)}
                            className={`w-full p-5 rounded-2xl text-left font-bold transition-all ${selectedQuiz === key ? "bg-yellow-400 text-[#46178F] shadow-xl scale-[1.02]" : "bg-white/5 hover:bg-white/10 border border-white/10"}`}
                          >
                            <span className="block text-[10px] opacity-60 uppercase mb-1">Grade {selectedGrade} · 25 Questions</span>
                            <span className="block">{label}</span>
                            <span className="block text-[11px] font-medium opacity-60 mt-1">{desc}</span>
                          </button>
                        ))
                    }
                  </div>
                </>
              )}
            </div>

            <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-yellow-400" />
                <h3 className="font-black uppercase tracking-wider text-sm">Teams Ready</h3>
              </div>
              <div className="space-y-3">
                {Object.keys(scores).map(team => (
                  <div key={team} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="font-bold">{team}</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={(lobbyMode as any) === "ai" && !aiGenerated}
            className="w-full py-8 bg-yellow-400 hover:bg-yellow-300 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed text-[#46178F] rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98]"
          >
            {(lobbyMode as any) === "ai" && !aiGenerated ? "Generate Questions First" : "Start Battle"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans overflow-hidden">
      <div className="bg-white px-10 py-6 flex items-center justify-between shadow-sm z-30 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#46178F] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Zap size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none tracking-tight">CLASS QUIZ</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
              Question {currentQuestionIdx + 1} of {questions.length} • {currentQuestion.difficulty}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-8 transition-all ${timer <= 5 ? "border-red-500 text-red-500 scale-110" : "border-[#46178F] text-[#46178F]"}`}>
            <span className="text-3xl font-black">{timer}</span>
            <span className="text-[8px] font-bold uppercase">Sec</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-10 flex flex-col gap-10">
        <div className="flex-1 bg-white rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center p-20 relative overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-20 max-w-6xl mx-auto tracking-tight leading-[1.1]">
                {currentQuestion.question}
              </h1>

              {gameState === "QUESTION" && (
                <div className="grid grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
                  {currentQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={handleTimeUp}
                      className={`relative p-10 rounded-[2.5rem] text-3xl font-bold flex items-center justify-center shadow-lg transition-all active:scale-[0.97] hover:brightness-110
                        ${idx === 0 ? "bg-blue-500 text-white" : ""}
                        ${idx === 1 ? "bg-green-500 text-white" : ""}
                        ${idx === 2 ? "bg-yellow-400 text-slate-900" : ""}
                        ${idx === 3 ? "bg-red-500 text-white" : ""}
                      `}
                    >
                      <div className="absolute top-4 left-6 opacity-30 text-5xl font-black">{["A", "B", "C", "D"][idx]}</div>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {gameState === "REVEAL" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-4xl mx-auto space-y-6"
                >
                  {/* Correct answer banner */}
                  <div className="p-10 rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl bg-green-500 text-white">
                    <CheckCircle2 size={64} />
                    <h2 className="text-4xl font-black uppercase italic">Correct Answer</h2>
                    <p className="text-3xl font-black">{currentQuestion.options[currentQuestion.answer]}</p>
                  </div>

                  {/* Quick insight */}
                  <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] text-left relative overflow-hidden">
                    <div className="absolute -top-3 left-10 bg-slate-900 px-5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Quick Insight</div>
                    <p className="text-xl leading-relaxed italic">{currentQuestion.explanation}</p>
                  </div>

                  {/* Teacher award buttons */}
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6">
                    <p className="text-center text-xs font-black uppercase tracking-widest text-white/40 mb-4">Tap a team to award +1,000 pts</p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.keys(scores).map((team, idx) => {
                        const awarded = awardedTeams.has(team);
                        const colors = ["bg-purple-500","bg-orange-500","bg-blue-500","bg-green-500"];
                        return (
                          <button
                            key={team}
                            onClick={() => awardPoints(team)}
                            disabled={awarded}
                            className={`relative p-5 rounded-2xl font-black text-white text-lg flex items-center justify-between transition-all
                              ${awarded ? "opacity-40 cursor-not-allowed scale-95" : `${colors[idx]} hover:brightness-110 active:scale-[0.97] shadow-lg`}
                            `}
                          >
                            <span>{team}</span>
                            {awarded
                              ? <CheckCircle2 size={24} />
                              : <span className="text-sm font-bold opacity-70">+1,000</span>
                            }
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={nextQuestion}
                    className="w-full py-7 bg-[#46178F] text-white rounded-[2rem] font-black text-2xl uppercase tracking-widest hover:bg-[#5b1eb9] transition-all shadow-xl"
                  >
                    Next Question →
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {Object.keys(scores).map((team, idx) => (
            <div key={team} className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white
                  ${idx === 0 ? "bg-purple-500" : ""}
                  ${idx === 1 ? "bg-orange-500" : ""}
                  ${idx === 2 ? "bg-blue-500" : ""}
                  ${idx === 3 ? "bg-green-500" : ""}
                `}>
                  {idx === 0 ? "🐉" : idx === 1 ? "🔥" : idx === 2 ? "🐯" : "🐼"}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{team}</h4>
                  <p className="text-xl font-black text-slate-900">{formatPoints(scores[team])}</p>
                </div>
              </div>
              {streak[team] >= 3 && (
                <div className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full flex items-center gap-1 animate-bounce">
                  <Zap size={14} fill="currentColor" />
                  <span className="text-xs font-black">{streak[team]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {gameState === "FINAL" && (
        <div className="fixed inset-0 z-50 bg-[#46178F] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full bg-white rounded-[3rem] p-16 shadow-2xl text-center"
          >
            <Crown size={100} className="text-yellow-400 mx-auto mb-8 animate-bounce" />
            <h1 className="text-6xl font-black text-slate-900 mb-4 uppercase italic">VICTORY!</h1>
            <p className="text-xl text-slate-500 mb-12">The battle has ended. Here is the final standing.</p>

            <div className="space-y-4 mb-12">
              {Object.entries(scores)
                .sort(([, a], [, b]) => b - a)
                .map(([team, score], idx) => (
                  <div key={team} className={`flex items-center justify-between p-6 rounded-2xl ${idx === 0 ? "bg-yellow-50 border-2 border-yellow-200" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-6">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${idx === 0 ? "bg-yellow-400 text-white" : "bg-slate-200 text-slate-500"}`}>
                        {idx + 1}
                      </span>
                      <span className="text-2xl font-black text-slate-900">{team}</span>
                    </div>
                    <span className="text-3xl font-display font-black text-[#46178F]">{formatPoints(score)}</span>
                  </div>
                ))}
            </div>

            <button
              onClick={() => {
                setGameState("LOBBY");
                setCurrentQuestionIdx(0);
                setScores({
                  "Team Dragons": 0,
                  "Team Phoenix": 0,
                  "Team Tigers": 0,
                  "Team Pandas": 0
                });
                setStreak({});
              }}
              className="w-full py-8 bg-[#46178F] text-white rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-xl"
            >
              Play Again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
