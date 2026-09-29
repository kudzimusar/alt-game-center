import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Clock,
  Home,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Systematic MEXT-aligned hardcoded questions
// RULE: NEVER USE PLACEHOLDERS OR TRUNCATED DATA STRUCTURES IN THIS FILE.
// ALL 400 QUESTIONS MUST BE REPRESENTED FULLY TO PREVENT DATA LOSS.
// If data needs to be added, APPEND it to the existing structure.
const hardcodedQuestions: Record<string, any[]> = {
  "1": [
    // WEEKS 1-12
    {
      week: 1,
      day: "Mon",
      question: "What do you do at school?",
      grammar: "Be verb (is)",
      starter: "At school I...",
      example: "At school I play volleyball and clean my class.",
    },
    {
      week: 1,
      day: "Tue",
      question: "Where are you from? What city?",
      grammar: "Be verb (am)",
      starter: "I am from...",
      example: "I am from Osaka. It is a big city in Japan.",
    },
    {
      week: 1,
      day: "Wed",
      question: "How old are you? When is your birthday?",
      grammar: "Be verb (am)",
      starter: "I am... years old. My birthday is...",
      example: "I am 13 years old. My birthday is in April.",
    },
    {
      week: 1,
      day: "Thu",
      question: "Who is your best friend? Why?",
      grammar: "Be verb (is)",
      starter: "My best friend is... He/She is...",
      example: "My best friend is Taro. He is very kind and funny.",
    },
    {
      week: 1,
      day: "Fri",
      question: "What is your favorite color? Why?",
      grammar: "Be verb (is)",
      starter: "My favorite color is... because...",
      example: "My favorite color is blue because the sky is blue.",
    },
    {
      week: 2,
      day: "Mon",
      question: "What is your mother like? Describe her.",
      grammar: "Be verb (is)",
      starter: "My mother is...",
      example: "My mother is kind. She is tall and has short hair.",
    },
    {
      week: 2,
      day: "Tue",
      question: "What is your father like? Is he strict?",
      grammar: "Be verb (is)",
      starter: "My father is... Yes, he is... / No, he is not...",
      example: "My father is funny. No, he is not strict.",
    },
    {
      week: 2,
      day: "Wed",
      question: "Are you tall or short? How tall are you?",
      grammar: "Be verb (am)",
      starter: "I am... I am... centimeters tall.",
      example: "I am tall. I am 165 centimeters tall.",
    },
    {
      week: 2,
      day: "Thu",
      question: "Who is the funniest person in your family?",
      grammar: "Be verb (is)",
      starter: "The funniest person is... He/She is funny because...",
      example: "My brother is the funniest. He tells great jokes.",
    },
    {
      week: 2,
      day: "Fri",
      question: "What is your hair like? Is it long or short?",
      grammar: "Be verb (is)",
      starter: "My hair is...",
      example: "My hair is long and black. It is straight.",
    },
    {
      week: 3,
      day: "Mon",
      question: "What is in your bag right now?",
      grammar: "Be verb (is/are)",
      starter: "In my bag, there is... and there are...",
      example: "In my bag, there is a pencil case and there are three books.",
    },
    {
      week: 3,
      day: "Tue",
      question: "What is on your desk at home?",
      grammar: "Be verb (is/are)",
      starter: "On my desk, there is...",
      example: "On my desk, there is a lamp and my homework.",
    },
    {
      week: 3,
      day: "Wed",
      question: "What is your favorite possession? Why is it special?",
      grammar: "Be verb (is)",
      starter: "My favorite possession is... It is special because...",
      example: "My favorite possession is my phone. It was a gift.",
    },
    {
      week: 3,
      day: "Thu",
      question: "What is in your room? Describe it.",
      grammar: "Be verb (is/are)",
      starter: "In my room, there is... and...",
      example: "In my room, there is a bed, a desk, and a bookshelf.",
    },
    {
      week: 3,
      day: "Fri",
      question: "What is your favorite place in your house?",
      grammar: "Be verb (is)",
      starter: "My favorite place is... because...",
      example: "My favorite place is my room because it is quiet.",
    },
    {
      week: 4,
      day: "Mon",
      question: "Who are you? Tell me three things about yourself.",
      grammar: "Be verb (am)",
      starter: "I am... I am... and I am...",
      example: "I am 13 years old. I am from Tokyo. I am a student.",
    },
    {
      week: 4,
      day: "Tue",
      question: "What is your dream? Why is it your dream?",
      grammar: "Be verb (is)",
      starter: "My dream is... It is my dream because...",
      example: "My dream is to be a teacher. I like helping people.",
    },
    {
      week: 4,
      day: "Wed",
      question: "Where is the best place you visited? What is it like?",
      grammar: "Be verb (is)",
      starter: "The best place is... It is...",
      example: "The best place is Tokyo Disneyland. It is fun and exciting.",
    },
    {
      week: 4,
      day: "Thu",
      question: "Who are the most important people in your life?",
      grammar: "Be verb (are)",
      starter: "The most important people are...",
      example:
        "The most important people are my parents because they take care of me.",
    },
    {
      week: 4,
      day: "Fri",
      question: "What is special about your school?",
      grammar: "Be verb (is)",
      starter: "My school is special because...",
      example: "My school is special because we have a big gym.",
    },
    {
      week: 5,
      day: "Mon",
      question: "What sport can you play? How well can you play it?",
      grammar: "Can",
      starter: "I can play... I can play it...",
      example: "I can play soccer. I can play it pretty well.",
    },
    {
      week: 5,
      day: "Tue",
      question: "Can you cook? What can you cook?",
      grammar: "Can",
      starter: "Yes, I can cook... / No, I cannot cook...",
      example: "Yes, I can cook. I can make simple pasta.",
    },
    {
      week: 5,
      day: "Wed",
      question: "Can you speak any other languages? Which ones?",
      grammar: "Can",
      starter: "Yes, I can speak... / No, I can only speak...",
      example: "No, I can only speak Japanese and a little English.",
    },
    {
      week: 5,
      day: "Thu",
      question: "What musical instrument can you play?",
      grammar: "Can",
      starter: "I can play... / I cannot play any instrument.",
      example: "I can play the piano. I learned when I was young.",
    },
    {
      week: 5,
      day: "Fri",
      question: "Can you swim? Where did you learn?",
      grammar: "Can",
      starter: "Yes, I can swim... / No, I cannot swim...",
      example: "Yes, I can swim. I learned at the community pool.",
    },
    {
      week: 6,
      day: "Mon",
      question: "What can you do at home that you cannot do at school?",
      grammar: "Can/Cannot",
      starter: "At home, I can... but at school, I cannot...",
      example: "At home, I can play video games but at school, I cannot.",
    },
    {
      week: 6,
      day: "Tue",
      question: "Can you stay up late on weekends? Until what time?",
      grammar: "Can",
      starter: "Yes, I can stay up until... / No, I cannot stay up late...",
      example: "Yes, I can stay up until midnight on weekends.",
    },
    {
      week: 6,
      day: "Wed",
      question: "What can students do in the library?",
      grammar: "Can",
      starter: "In the library, students can...",
      example: "In the library, students can read books and study quietly.",
    },
    {
      week: 6,
      day: "Thu",
      question: "Can you use your phone during class? Why or why not?",
      grammar: "Can/Cannot",
      starter: "No, I cannot use my phone because...",
      example: "No, I cannot use my phone because it is against the rules.",
    },
    {
      week: 6,
      day: "Fri",
      question: "What can you eat for lunch at school?",
      grammar: "Can",
      starter: "I can eat... for lunch.",
      example: "I can eat school lunch or bring a bento from home.",
    },
    {
      week: 7,
      day: "Mon",
      question: "Where can you go for your next vacation?",
      grammar: "Can",
      starter: "I can go to...",
      example: "I can go to Hokkaido to see my grandparents.",
    },
    {
      week: 7,
      day: "Tue",
      question: "What job can you do in the future?",
      grammar: "Can",
      starter: "I can be a... in the future.",
      example: "I can be a doctor in the future if I study hard.",
    },
    {
      week: 7,
      day: "Wed",
      question: "What can you learn in high school?",
      grammar: "Can",
      starter: "In high school, I can learn...",
      example: "In high school, I can learn advanced math and science.",
    },
    {
      week: 7,
      day: "Thu",
      question: "Where can you study English outside of school?",
      grammar: "Can",
      starter: "I can study English...",
      example: "I can study English at home using apps or watching movies.",
    },
    {
      week: 7,
      day: "Fri",
      question: "What can you do to improve your grades?",
      grammar: "Can",
      starter: "I can improve my grades by...",
      example: "I can improve my grades by studying more and asking questions.",
    },
    {
      week: 8,
      day: "Mon",
      question:
        "What is something you can do now that you could not do last year?",
      grammar: "Can/Could not",
      starter: "Now I can... but last year I could not.",
      example: "Now I can speak some English but last year I could not.",
    },
    {
      week: 8,
      day: "Tue",
      question: "Who can run the fastest in your class?",
      grammar: "Can",
      starter: "... can run the fastest.",
      example: "Takeshi can run the fastest. He is on the track team.",
    },
    {
      week: 8,
      day: "Wed",
      question: "What can you see from your classroom window?",
      grammar: "Can",
      starter: "From my classroom, I can see...",
      example: "From my classroom, I can see the playground and mountains.",
    },
    {
      week: 8,
      day: "Thu",
      question: "What cannot you eat? Are you allergic to anything?",
      grammar: "Cannot",
      starter: "I cannot eat... because...",
      example: "I cannot eat peanuts because I am allergic.",
    },
    {
      week: 8,
      day: "Fri",
      question: "What can your mother do that you cannot do?",
      grammar: "Can/Cannot",
      starter: "My mother can... but I cannot.",
      example: "My mother can cook delicious meals but I cannot cook well.",
    },
    {
      week: 9,
      day: "Mon",
      question: "What time do you wake up every day? Why?",
      grammar: "Simple Present",
      starter: "I wake up at... because...",
      example: "I wake up at 6:30 because school starts at 8:00.",
    },
    {
      week: 9,
      day: "Tue",
      question: "What do you eat for breakfast? Do you eat every day?",
      grammar: "Simple Present",
      starter: "I eat... Yes, I eat... / No, I do not eat...",
      example: "I eat rice and miso soup. Yes, I eat breakfast every day.",
    },
    {
      week: 9,
      day: "Wed",
      question: "How do you go to school? How long does it take?",
      grammar: "Simple Present",
      starter: "I go to school by... It takes...",
      example: "I go to school by bicycle. It takes 15 minutes.",
    },
    {
      week: 9,
      day: "Thu",
      question: "What do you do after school every day?",
      grammar: "Simple Present",
      starter: "After school, I...",
      example: "After school, I go to club activities and then go home.",
    },
    {
      week: 9,
      day: "Fri",
      question: "What time do you usually do your homework?",
      grammar: "Simple Present",
      starter: "I usually do my homework at...",
      example: "I usually do my homework at 7:00 PM after dinner.",
    },
    {
      week: 10,
      day: "Mon",
      question: "What do you do in your free time?",
      grammar: "Simple Present",
      starter: "In my free time, I...",
      example: "In my free time, I play video games and watch anime.",
    },
    {
      week: 10,
      day: "Tue",
      question: "Do you play any sports regularly? Which ones?",
      grammar: "Simple Present",
      starter: "Yes, I play... / No, I do not play...",
      example: "Yes, I play basketball three times a week.",
    },
    {
      week: 10,
      day: "Wed",
      question: "What do you usually do on weekends?",
      grammar: "Simple Present",
      starter: "On weekends, I usually...",
      example: "On weekends, I usually sleep late and hang out with friends.",
    },
    {
      week: 10,
      day: "Thu",
      question: "Do you read books? What kind do you read?",
      grammar: "Simple Present",
      starter: "Yes, I read... / No, I do not read...",
      example: "Yes, I read manga and mystery novels.",
    },
    {
      week: 10,
      day: "Fri",
      question: "What music do you listen to? When do you listen?",
      grammar: "Simple Present",
      starter: "I listen to... I listen when...",
      example: "I listen to J-pop. I listen when I study or on the train.",
    },
    {
      week: 11,
      day: "Mon",
      question: "What subject do you like the most? Why?",
      grammar: "Simple Present",
      starter: "I like... the most because...",
      example: "I like English the most because it is interesting.",
    },
    {
      week: 11,
      day: "Tue",
      question: "What do you usually do during lunch break?",
      grammar: "Simple Present",
      starter: "During lunch break, I...",
      example: "During lunch break, I eat with friends and talk.",
    },
    {
      week: 11,
      day: "Wed",
      question: "Do you study in the library? How often?",
      grammar: "Simple Present",
      starter: "Yes, I study... / No, I do not study...",
      example: "Yes, I study in the library twice a week after school.",
    },
    {
      week: 11,
      day: "Thu",
      question: "What club activities do you do? What do you do there?",
      grammar: "Simple Present",
      starter: "I do... We...",
      example: "I do basketball club. We practice and play games.",
    },
    {
      week: 11,
      day: "Fri",
      question: "Do you walk to school with friends? Who do you walk with?",
      grammar: "Simple Present",
      starter: "Yes, I walk with... / No, I walk...",
      example: "Yes, I walk with my neighbor. We live near each other.",
    },
    {
      week: 12,
      day: "Mon",
      question: "What do you do when you do not understand something in class?",
      grammar: "Simple Present",
      starter: "I ask my...",
      example: "I ask my teacher or my friends for help when I am confused.",
    },
    {
      week: 12,
      day: "Tue",
      question: "Do you use a dictionary in English class?",
      grammar: "Simple Present",
      starter: "Yes, I use a...",
      example: "Yes, I use an electronic dictionary to look up new words.",
    },
    {
      week: 12,
      day: "Wed",
      question: "What is the most difficult subject for you?",
      grammar: "Simple Present",
      starter: "... is the most difficult because...",
      example:
        "Math is the most difficult for me because I don't like formulas.",
    },
    {
      week: 12,
      day: "Thu",
      question: "Do you have much homework every day?",
      grammar: "Simple Present",
      starter: "Yes, I have... / No, I do not...",
      example: "Yes, I have a lot of homework, especially in English and Math.",
    },
    {
      week: 12,
      day: "Fri",
      question: "What do you do on school holidays?",
      grammar: "Simple Present",
      starter: "On holidays, I...",
      example:
        "On holidays, I visit my relatives or go to the movies with friends.",
    },
    // WEEKS 13-24
    {
      week: 13,
      day: "Mon",
      question: "What did you do last weekend?",
      grammar: "Past Simple",
      starter: "Last weekend, I...",
      example: "Last weekend, I went to a shopping mall with my parents.",
    },
    {
      week: 13,
      day: "Tue",
      question: "What did you eat for dinner yesterday?",
      grammar: "Past Simple",
      starter: "Yesterday, I ate...",
      example: "Yesterday, I ate hamburger steak and rice for dinner.",
    },
    {
      week: 13,
      day: "Wed",
      question: "Did you watch TV last night? What did you watch?",
      grammar: "Past Simple",
      starter: "Yes, I watched... / No, I did not...",
      example: "Yes, I watched a variety show on TV last night.",
    },
    {
      week: 13,
      day: "Thu",
      question: "Where did you go last summer?",
      grammar: "Past Simple",
      starter: "Last summer, I went to...",
      example: "Last summer, I went to my grandparents' house in Hokkaido.",
    },
    {
      week: 13,
      day: "Fri",
      question: "Who did you talk to this morning?",
      grammar: "Past Simple",
      starter: "This morning, I talked to...",
      example: "This morning, I talked to my friends on the way to school.",
    },
    {
      week: 14,
      day: "Mon",
      question: "Were you busy yesterday? Why?",
      grammar: "Past Simple (was/were)",
      starter: "Yes, I was busy because... / No, I was not...",
      example: "Yes, I was busy because I had a basketball game.",
    },
    {
      week: 14,
      day: "Tue",
      question: "What was your favorite subject last year?",
      grammar: "Past Simple (was)",
      starter: "My favorite subject was...",
      example: "My favorite subject was math because I like numbers.",
    },
    {
      week: 14,
      day: "Wed",
      question: "How was your last birthday?",
      grammar: "Past Simple (was)",
      starter: "It was... I...",
      example: "It was great! I had a big party with my friends.",
    },
    {
      week: 14,
      day: "Thu",
      question: "Who was your teacher in elementary school?",
      grammar: "Past Simple (was)",
      starter: "My teacher was...",
      example: "My teacher was Mr. Tanaka. He was very kind.",
    },
    {
      week: 14,
      day: "Fri",
      question: "What was the weather like yesterday?",
      grammar: "Past Simple (was)",
      starter: "It was...",
      example: "It was sunny and very warm yesterday.",
    },
    {
      week: 15,
      day: "Mon",
      question: "What are you doing now?",
      grammar: "Present Continuous",
      starter: "I am...",
      example: "I am talking to my friends and practicing English.",
    },
    {
      week: 15,
      day: "Tue",
      question: "What is your friend doing right now?",
      grammar: "Present Continuous",
      starter: "My friend is...",
      example: "My friend is writing a notebook and listening to the teacher.",
    },
    {
      week: 15,
      day: "Wed",
      question: "Is it raining now?",
      grammar: "Present Continuous",
      starter: "Yes, it is... / No, it is not...",
      example: "No, it is not raining. It is a beautiful day.",
    },
    {
      week: 15,
      day: "Thu",
      question: "What are the students doing in the gym?",
      grammar: "Present Continuous",
      starter: "They are...",
      example: "They are playing volleyball and practicing hard.",
    },
    {
      week: 15,
      day: "Fri",
      question: "What are you wearing today?",
      grammar: "Present Continuous",
      starter: "I am wearing...",
      example: "I am wearing my school uniform and a blue sweater.",
    },
    {
      week: 16,
      day: "Mon",
      question: "Are you going to study tonight?",
      grammar: "Be going to",
      starter: "Yes, I am going to... / No, I am not...",
      example: "Yes, I am going to study English for tomorrow's test.",
    },
    {
      week: 16,
      day: "Tue",
      question: "What are you going to do tomorrow?",
      grammar: "Be going to",
      starter: "Tomorrow, I am going to...",
      example: "Tomorrow, I am going to go to my piano lesson.",
    },
    {
      week: 16,
      day: "Wed",
      question: "Where are you going to go next Sunday?",
      grammar: "Be going to",
      starter: "Next Sunday, I am going to go to...",
      example: "Next Sunday, I am going to go to the park with my dog.",
    },
    {
      week: 16,
      day: "Thu",
      question: "What are you going to eat for lunch tomorrow?",
      grammar: "Be going to",
      starter: "I am going to eat...",
      example: "I am going to eat the school lunch. It's spaghetti!",
    },
    {
      week: 16,
      day: "Fri",
      question: "Are you going to join any events this winter?",
      grammar: "Be going to",
      starter: "Yes, I am going to... / No, I am not...",
      example: "Yes, I am going to join the Christmas party at school.",
    },
    {
      week: 17,
      day: "Mon",
      question: "Which do you like better, dogs or cats?",
      grammar: "Comparatives",
      starter: "I like... better because...",
      example: "I like dogs better because they are very friendly.",
    },
    {
      week: 17,
      day: "Tue",
      question: "Which is larger, Tokyo or Osaka?",
      grammar: "Comparatives",
      starter: "... is larger than...",
      example: "Tokyo is larger than Osaka. Many people live there.",
    },
    {
      week: 17,
      day: "Wed",
      question: "Who is taller, you or your father?",
      grammar: "Comparatives",
      starter: "... is taller than...",
      example: "My father is taller than me, but I am growing fast.",
    },
    {
      week: 17,
      day: "Thu",
      question: "Which is more difficult, English or Math?",
      grammar: "Comparatives",
      starter: "I think... is more difficult than...",
      example: "I think Math is more difficult than English because it's hard.",
    },
    {
      week: 17,
      day: "Fri",
      question: "Which is more popular in Japan, baseball or soccer?",
      grammar: "Comparatives",
      starter: "I think... is more popular because...",
      example:
        "I think baseball is more popular because many people watch it on TV.",
    },
    {
      week: 18,
      day: "Mon",
      question: "Who is the tallest in your family?",
      grammar: "Superlatives",
      starter: "... is the tallest.",
      example: "My father is the tallest in my family. He is 180cm.",
    },
    {
      week: 18,
      day: "Tue",
      question: "What is the most interesting book for you?",
      grammar: "Superlatives",
      starter: "... is the most interesting for me.",
      example:
        "Harry Potter is the most interesting book for me. I love magic.",
    },
    {
      week: 18,
      day: "Wed",
      question: "What is the best season for you? Why?",
      grammar: "Superlatives",
      starter: "... is the best season for me because...",
      example: "Summer is the best season for me because I can go swimming.",
    },
    {
      week: 18,
      day: "Thu",
      question: "Who is the fastest runner in your class?",
      grammar: "Superlatives",
      starter: "... is the fastest runner.",
      example: "Kenta is the fastest runner. He is on the track team.",
    },
    {
      week: 18,
      day: "Fri",
      question: "What is the most beautiful place in Japan?",
      grammar: "Superlatives",
      starter: "I think... is the most beautiful.",
      example: "I think Mt. Fuji is the most beautiful place in Japan.",
    },
    {
      week: 19,
      day: "Mon",
      question: "What do you have to do at home?",
      grammar: "Have to",
      starter: "I have to...",
      example: "I have to clean my room every Saturday.",
    },
    {
      week: 19,
      day: "Tue",
      question: "Do you have to study English every day?",
      grammar: "Have to",
      starter: "Yes, I have to... / No, I do not have to...",
      example: "Yes, I have to study English to improve my speaking.",
    },
    {
      week: 19,
      day: "Wed",
      question: "What does your mother have to do every morning?",
      grammar: "Has to",
      starter: "She has to...",
      example: "She has to make breakfast and bento for me every morning.",
    },
    {
      week: 19,
      day: "Thu",
      question: "Do students have to wear uniforms at your school?",
      grammar: "Have to",
      starter: "Yes, we have to...",
      example: "Yes, we have to wear uniforms. I like my uniform.",
    },
    {
      week: 19,
      day: "Fri",
      question: "What time do you have to go to bed?",
      grammar: "Have to",
      starter: "I have to go to bed at...",
      example: "I have to go to bed at 10:30 PM to get enough sleep.",
    },
    {
      week: 20,
      day: "Mon",
      question: "You must be quiet in the library. What else must you do?",
      grammar: "Must",
      starter: "I must...",
      example: "I must return books on time and study hard.",
    },
    {
      week: 20,
      day: "Tue",
      question: "Must you help your parents at home?",
      grammar: "Must",
      starter: "Yes, I must... / No, I do not have to...",
      example: "Yes, I must help with the dishes after dinner.",
    },
    {
      week: 20,
      day: "Wed",
      question: "What must you not do in class?",
      grammar: "Must not",
      starter: "I must not...",
      example: "I must not talk to my friends when the teacher is speaking.",
    },
    {
      week: 20,
      day: "Thu",
      question: "Must we bring our textbooks to every class?",
      grammar: "Must",
      starter: "Yes, we must...",
      example: "Yes, we must bring our textbooks and notebooks every day.",
    },
    {
      week: 20,
      day: "Fri",
      question: "What must you do to stay healthy?",
      grammar: "Must",
      starter: "I must...",
      example: "I must eat vegetables and exercise every day.",
    },
    {
      week: 21,
      day: "Mon",
      question: "What can you see in the park?",
      grammar: "Review: Can",
      starter: "I can see...",
      example: "I can see many trees and children playing.",
    },
    {
      week: 21,
      day: "Tue",
      question: "Can you play the guitar? How about the piano?",
      grammar: "Review: Can",
      starter: "I can play... / I cannot play...",
      example: "I can play the piano, but I cannot play the guitar.",
    },
    {
      week: 21,
      day: "Wed",
      question: "What can you do for your friends?",
      grammar: "Review: Can",
      starter: "I can...",
      example: "I can listen to their problems and help them.",
    },
    {
      week: 21,
      day: "Thu",
      question: "Where can we buy stamps?",
      grammar: "Review: Can",
      starter: "We can buy stamps at...",
      example: "We can buy stamps at the post office or convenience stores.",
    },
    {
      week: 21,
      day: "Fri",
      question: "What can you do to help the environment?",
      grammar: "Review: Can",
      starter: "I can...",
      example: "I can recycle plastic bottles and save water.",
    },
    {
      week: 22,
      day: "Mon",
      question: "There is a pencil on the desk. What else is there?",
      grammar: "There is/are",
      starter: "There is... and there are...",
      example: "There is a notebook and there are some pens on the desk.",
    },
    {
      week: 22,
      day: "Tue",
      question: "Is there a convenience store near your house?",
      grammar: "Is there",
      starter: "Yes, there is... / No, there is not...",
      example: "Yes, there is a Lawson near my house. It's very useful.",
    },
    {
      week: 22,
      day: "Wed",
      question: "Are there many students in your class?",
      grammar: "Are there",
      starter: "Yes, there are... / No, there are not...",
      example: "Yes, there are 35 students in my class.",
    },
    {
      week: 22,
      day: "Thu",
      question: "How many classrooms are there in your school?",
      grammar: "Are there",
      starter: "There are...",
      example: "There are about twenty classrooms in my school.",
    },
    {
      week: 22,
      day: "Fri",
      question: "Is there a park in your town?",
      grammar: "Is there",
      starter: "Yes, there is a big park...",
      example: "Yes, there is a big park where I play soccer.",
    },
    {
      week: 23,
      day: "Mon",
      question: "What do you like doing on weekends?",
      grammar: "Gerunds",
      starter: "I like...ing...",
      example: "I like playing video games and reading manga.",
    },
    {
      week: 23,
      day: "Tue",
      question: "Is studying English fun for you?",
      grammar: "Gerunds",
      starter: "Yes, studying English is... / No, it is not...",
      example: "Yes, studying English is fun because I can talk to you!",
    },
    {
      week: 23,
      day: "Wed",
      question: "Do you enjoy cooking?",
      grammar: "Gerunds",
      starter: "Yes, I enjoy...ing... / No, I do not...",
      example: "Yes, I enjoy making cookies for my family.",
    },
    {
      week: 23,
      day: "Thu",
      question: "What is your favorite thing, singing or dancing?",
      grammar: "Gerunds",
      starter: "My favorite thing is...ing because...",
      example: "My favorite thing is dancing because it makes me happy.",
    },
    {
      week: 23,
      day: "Fri",
      question: "Are you good at drawing pictures?",
      grammar: "Gerunds",
      starter: "Yes, I am good at...ing / No, I am not...",
      example: "No, I am not good at drawing, but I like art class.",
    },
    {
      week: 24,
      day: "Mon",
      question: "What do you want to do this winter break?",
      grammar: "Infinitives",
      starter: "I want to...",
      example: "I want to go skiing with my family in Nagano.",
    },
    {
      week: 24,
      day: "Tue",
      question: "What do you like to eat for dinner?",
      grammar: "Infinitives",
      starter: "I like to eat...",
      example: "I like to eat sushi or ramen for dinner.",
    },
    {
      week: 24,
      day: "Wed",
      question: "Do you want to be a doctor in the future?",
      grammar: "Infinitives",
      starter: "Yes, I want to be... / No, I want to be...",
      example: "No, I want to be a pilot because I love airplanes.",
    },
    {
      week: 24,
      day: "Thu",
      question: "Is it easy to speak English?",
      grammar: "Infinitives",
      starter: "Yes, it is easy to... / No, it is difficult to...",
      example: "It is a bit difficult to speak English, but I'm practicing.",
    },
    {
      week: 24,
      day: "Fri",
      question: "What do you need to bring to school every day?",
      grammar: "Infinitives",
      starter: "I need to bring...",
      example: "I need to bring my backpack, textbooks, and lunch.",
    },
    // WEEKS 25-40
    {
      week: 25,
      day: "Mon",
      question: "What did you do during winter vacation?",
      grammar: "Review: Past Simple",
      starter: "During winter vacation, I...",
      example:
        "During winter vacation, I went to my grandmother's house and ate Osechi.",
    },
    {
      week: 25,
      day: "Tue",
      question: "Did you get any New Year's gifts (Otoshidama)?",
      grammar: "Past Simple",
      starter: "Yes, I got... / No, I didn't.",
      example: "Yes, I got some Otoshidama from my parents and grandparents.",
    },
    {
      week: 25,
      day: "Wed",
      question: "What was the best food you ate during the holidays?",
      grammar: "Past Simple",
      starter: "The best food was...",
      example: "The best food was the sushi we had on New Year's Eve.",
    },
    {
      week: 25,
      day: "Thu",
      question: "Did you go to a shrine for Hatsumode?",
      grammar: "Past Simple",
      starter: "Yes, I went to... / No, I didn't.",
      example: "Yes, I went to the local shrine with my family on January 1st.",
    },
    {
      week: 25,
      day: "Fri",
      question: "What is your New Year's resolution?",
      grammar: "Future: Will",
      starter: "My resolution is to...",
      example: "My resolution is to study English for 30 minutes every day.",
    },
    {
      week: 26,
      day: "Mon",
      question: "Which subject do you want to study more next year?",
      grammar: "Want to",
      starter: "I want to study...",
      example: "I want to study Science more because experiments are fun.",
    },
    {
      week: 26,
      day: "Tue",
      question: "What is your favorite school event so far?",
      grammar: "Superlative",
      starter: "My favorite event is... because...",
      example:
        "My favorite event is the Culture Festival because our class play was great.",
    },
    {
      week: 26,
      day: "Wed",
      question: "Who is the kindest person you met this year?",
      grammar: "Superlative",
      starter: "... is the kindest person.",
      example: "My homeroom teacher is the kindest person I met this year.",
    },
    {
      week: 26,
      day: "Thu",
      question: "What can you do better now than in April?",
      grammar: "Can",
      starter: "Now I can...",
      example: "Now I can write English sentences much faster than in April.",
    },
    {
      week: 26,
      day: "Fri",
      question: "What are you going to do this spring?",
      grammar: "Be going to",
      starter: "I am going to...",
      example: "I am going to join a soccer camp during spring vacation.",
    },
    // WEEKS 25-40 - GRADE 1 (TALK ABOUT YOU)
    {
      week: 25,
      day: "Mon",
      question: "What do you have in your pencil case?",
      grammar: "Have",
      starter: "I have...",
      example:
        "I have two pencils, an eraser, a ruler, and some pens in my pencil case.",
    },
    {
      week: 25,
      day: "Tue",
      question: "Do you have any brothers or sisters?",
      grammar: "Have",
      starter: "Yes, I have... / No, I do not have...",
      example: "Yes, I have one older brother and one younger sister.",
    },
    {
      week: 25,
      day: "Wed",
      question: "What do you have for breakfast every day?",
      grammar: "Have",
      starter: "I have... for breakfast.",
      example: "I have toast, eggs, and orange juice for breakfast.",
    },
    {
      week: 25,
      day: "Thu",
      question: "Do you have any pets at home?",
      grammar: "Have",
      starter: "Yes, I have... / No, I do not have...",
      example: "Yes, I have a dog named Pochi and a goldfish.",
    },
    {
      week: 25,
      day: "Fri",
      question: "What classes do you have on Mondays?",
      grammar: "Have",
      starter: "On Mondays, I have...",
      example:
        "On Mondays, I have math, English, science, PE, and social studies.",
    },
    {
      week: 26,
      day: "Mon",
      question: "How many friends do you have in your class?",
      grammar: "Have",
      starter: "I have... friends in my class.",
      example: "I have about ten close friends in my class.",
    },
    {
      week: 26,
      day: "Tue",
      question: "Does your family have a car?",
      grammar: "Have (third person)",
      starter: "Yes, my family has... / No, my family does not have...",
      example: "Yes, my family has a white car that we use on weekends.",
    },
    {
      week: 26,
      day: "Wed",
      question: "What do you have to do after school today?",
      grammar: "Have to",
      starter: "After school, I have to...",
      example:
        "After school, I have to go to club practice and then do my homework.",
    },
    {
      week: 26,
      day: "Thu",
      question: "Has your school changed since you entered?",
      grammar: "Has (present perfect)",
      starter: "Yes, it has changed... / No, it has not changed...",
      example: "Yes, it has changed. They built a new gym last year.",
    },
    {
      week: 26,
      day: "Fri",
      question: "Do you have enough time to do your hobbies?",
      grammar: "Have",
      starter: "Yes, I have... / No, I do not have...",
      example:
        "No, I do not have enough time because I am very busy with homework and club.",
    },
    {
      week: 27,
      day: "Mon",
      question: "What does your best friend have that you want?",
      grammar: "Have (third person)",
      starter: "My best friend has...",
      example: "My best friend has the newest smartphone that I really want.",
    },
    {
      week: 27,
      day: "Tue",
      question: "Do you have a favorite place in your town?",
      grammar: "Have",
      starter: "Yes, I have... / No, I do not have...",
      example:
        "Yes, I have a favorite park near my house where I play with friends.",
    },
    {
      week: 27,
      day: "Wed",
      question: "Has your town changed a lot in recent years?",
      grammar: "Has (present perfect)",
      starter: "Yes, it has changed... / No, it has not changed...",
      example:
        "Yes, it has changed a lot. They opened a new shopping mall last year.",
    },
    {
      week: 27,
      day: "Thu",
      question: "What homework do you have today?",
      grammar: "Have",
      starter: "Today, I have... homework.",
      example:
        "Today, I have math problems, English vocabulary, and a science worksheet.",
    },
    {
      week: 27,
      day: "Fri",
      question: "Do you have any plans for this weekend?",
      grammar: "Have",
      starter: "Yes, I have... / No, I do not have...",
      example: "Yes, I have plans to go shopping with my family on Saturday.",
    },
    {
      week: 28,
      day: "Mon",
      question: "What special talents do you have?",
      grammar: "Have",
      starter: "I have a talent for...",
      example: "I have a talent for drawing and playing the piano.",
    },
    {
      week: 28,
      day: "Tue",
      question: "Does your school have a good library?",
      grammar: "Have (third person)",
      starter: "Yes, it has... / No, it does not have...",
      example: "Yes, it has a big library with many books and computers.",
    },
    {
      week: 28,
      day: "Wed",
      question: "Have you finished your homework for tomorrow?",
      grammar: "Have (present perfect)",
      starter: "Yes, I have finished... / No, I have not finished...",
      example: "Yes, I have finished all my homework for tomorrow.",
    },
    {
      week: 28,
      day: "Thu",
      question: "What responsibilities do you have at home?",
      grammar: "Have",
      starter: "At home, I have to...",
      example:
        "At home, I have to clean my room, take out the trash, and help with dishes.",
    },
    {
      week: 28,
      day: "Fri",
      question: "Do you have any questions about today's lesson?",
      grammar: "Have",
      starter: "Yes, I have a question about... / No, I do not have...",
      example: "Yes, I have a question about how to use present perfect tense.",
    },
    {
      week: 29,
      day: "Mon",
      question: "What did you do last weekend?",
      grammar: "Past Simple",
      starter: "Last weekend, I...",
      example:
        "Last weekend, I went to the movies with my friends and played video games at home.",
    },
    {
      week: 29,
      day: "Tue",
      question: "Where did you go yesterday after school?",
      grammar: "Past Simple",
      starter: "Yesterday, I went to...",
      example: "Yesterday, I went to the library to study and then went home.",
    },
    {
      week: 29,
      day: "Wed",
      question: "What did you eat for dinner last night?",
      grammar: "Past Simple",
      starter: "Last night, I ate...",
      example: "Last night, I ate curry rice and salad for dinner.",
    },
    {
      week: 29,
      day: "Thu",
      question: "Did you watch TV yesterday? What did you watch?",
      grammar: "Past Simple",
      starter: "Yes, I watched... / No, I did not watch...",
      example: "Yes, I watched an anime show and a comedy program yesterday.",
    },
    {
      week: 29,
      day: "Fri",
      question: "What time did you go to bed last night?",
      grammar: "Past Simple",
      starter: "Last night, I went to bed at...",
      example:
        "Last night, I went to bed at 10:30 after finishing my homework.",
    },
    {
      week: 30,
      day: "Mon",
      question: "Where did you go during spring vacation?",
      grammar: "Past Simple",
      starter: "During spring vacation, I went to...",
      example:
        "During spring vacation, I went to my grandparents' house in the countryside.",
    },
    {
      week: 30,
      day: "Tue",
      question: "What was the weather like yesterday?",
      grammar: "Past Simple (was)",
      starter: "Yesterday, the weather was...",
      example:
        "Yesterday, the weather was sunny and warm, perfect for playing outside.",
    },
    {
      week: 30,
      day: "Wed",
      question: "Did you do your homework last night?",
      grammar: "Past Simple",
      starter: "Yes, I did... / No, I did not...",
      example: "Yes, I did my math and English homework after dinner.",
    },
    {
      week: 30,
      day: "Thu",
      question: "Who did you talk to at lunch today?",
      grammar: "Past Simple",
      starter: "At lunch, I talked to...",
      example: "At lunch, I talked to my best friend about the upcoming test.",
    },
    {
      week: 30,
      day: "Fri",
      question: "What was your favorite memory from last month?",
      grammar: "Past Simple (was)",
      starter: "My favorite memory was...",
      example:
        "My favorite memory was going to the amusement park with my family.",
    },
    {
      week: 31,
      day: "Mon",
      question: "How did you come to school this morning?",
      grammar: "Past Simple",
      starter: "This morning, I came by...",
      example: "This morning, I came to school by bicycle as usual.",
    },
    {
      week: 31,
      day: "Tue",
      question: "What did you learn in class yesterday?",
      grammar: "Past Simple",
      starter: "Yesterday, I learned about...",
      example: "Yesterday, I learned about photosynthesis in science class.",
    },
    {
      week: 31,
      day: "Wed",
      question: "Did it rain last weekend?",
      grammar: "Past Simple",
      starter: "Yes, it rained... / No, it did not rain...",
      example: "Yes, it rained on Saturday, so I stayed inside all day.",
    },
    {
      week: 31,
      day: "Thu",
      question: "What did your family do last Sunday?",
      grammar: "Past Simple",
      starter: "Last Sunday, my family...",
      example:
        "Last Sunday, my family went to a restaurant and then visited my aunt.",
    },
    {
      week: 31,
      day: "Fri",
      question: "When did you wake up this morning?",
      grammar: "Past Simple",
      starter: "This morning, I woke up at...",
      example: "This morning, I woke up at 6:30 and got ready for school.",
    },
    {
      week: 32,
      day: "Mon",
      question: "What was the last book you read?",
      grammar: "Past Simple (was)",
      starter: "The last book I read was...",
      example:
        "The last book I read was Harry Potter and the Philosopher's Stone.",
    },
    {
      week: 32,
      day: "Tue",
      question: "Did you enjoy your last birthday? What did you do?",
      grammar: "Past Simple",
      starter: "Yes, I enjoyed it. I...",
      example:
        "Yes, I enjoyed it. I had a party with friends and got many presents.",
    },
    {
      week: 32,
      day: "Wed",
      question: "What was the last movie you watched?",
      grammar: "Past Simple (was)",
      starter: "The last movie I watched was...",
      example:
        "The last movie I watched was a superhero action movie at the cinema.",
    },
    {
      week: 32,
      day: "Thu",
      question: "Where did you buy your school bag?",
      grammar: "Past Simple",
      starter: "I bought it at...",
      example:
        "I bought it at a department store with my mother before school started.",
    },
    {
      week: 32,
      day: "Fri",
      question: "What did you do after school yesterday?",
      grammar: "Past Simple",
      starter: "After school yesterday, I...",
      example:
        "After school yesterday, I went to basketball practice and then studied at home.",
    },
    {
      week: 33,
      day: "Mon",
      question: "When did you start learning English?",
      grammar: "Past Simple",
      starter: "I started learning English in...",
      example:
        "I started learning English in elementary school when I was 10 years old.",
    },
    {
      week: 33,
      day: "Tue",
      question: "What was your favorite toy when you were young?",
      grammar: "Past Simple (was)",
      starter: "When I was young, my favorite toy was...",
      example:
        "When I was young, my favorite toy was a stuffed bear that I took everywhere.",
    },
    {
      week: 33,
      day: "Wed",
      question: "Where did you live when you were a child?",
      grammar: "Past Simple",
      starter: "When I was a child, I lived in...",
      example: "When I was a child, I lived in Osaka before we moved here.",
    },
    {
      week: 33,
      day: "Thu",
      question: "What was your favorite food as a child?",
      grammar: "Past Simple (was)",
      starter: "As a child, my favorite food was...",
      example: "As a child, my favorite food was hamburgers and french fries.",
    },
    {
      week: 33,
      day: "Fri",
      question: "Who was your best friend in elementary school?",
      grammar: "Past Simple (was)",
      starter: "My best friend was...",
      example:
        "My best friend was Takeshi. We played together every day after school.",
    },
    {
      week: 34,
      day: "Mon",
      question: "What games did you play when you were younger?",
      grammar: "Past Simple",
      starter: "When I was younger, I played...",
      example:
        "When I was younger, I played tag, hide and seek, and video games with friends.",
    },
    {
      week: 34,
      day: "Tue",
      question: "Did you like school when you were in elementary school?",
      grammar: "Past Simple",
      starter: "Yes, I liked... / No, I did not like...",
      example:
        "Yes, I liked school because I had fun teachers and good friends.",
    },
    {
      week: 34,
      day: "Wed",
      question: "What was your favorite subject in elementary school?",
      grammar: "Past Simple (was)",
      starter: "My favorite subject was...",
      example:
        "My favorite subject was art because I loved drawing and painting.",
    },
    {
      week: 34,
      day: "Thu",
      question: "Where did you go for family trips when you were young?",
      grammar: "Past Simple",
      starter: "When I was young, we went to...",
      example:
        "When I was young, we went to the beach every summer for vacation.",
    },
    {
      week: 34,
      day: "Fri",
      question: "What did you want to be when you were a child?",
      grammar: "Past Simple",
      starter: "When I was a child, I wanted to be...",
      example:
        "When I was a child, I wanted to be a firefighter because they seemed so brave.",
    },
    {
      week: 35,
      day: "Mon",
      question: "When did you learn to ride a bicycle?",
      grammar: "Past Simple",
      starter: "I learned to ride a bicycle when...",
      example:
        "I learned to ride a bicycle when I was 6 years old with my father's help.",
    },
    {
      week: 35,
      day: "Tue",
      question: "What was your elementary school like?",
      grammar: "Past Simple (was)",
      starter: "My elementary school was...",
      example:
        "My elementary school was small and friendly with a big playground.",
    },
    {
      week: 35,
      day: "Wed",
      question: "Did you have any pets when you were younger?",
      grammar: "Past Simple",
      starter: "Yes, I had... / No, I did not have...",
      example:
        "Yes, I had a hamster named Chibi when I was in elementary school.",
    },
    {
      week: 35,
      day: "Thu",
      question: "What was the first English word you learned?",
      grammar: "Past Simple (was)",
      starter: "The first English word I learned was...",
      example:
        "The first English word I learned was 'hello' in elementary school.",
    },
    {
      week: 35,
      day: "Fri",
      question: "How did you celebrate your birthday when you were young?",
      grammar: "Past Simple",
      starter: "When I was young, I celebrated by...",
      example:
        "When I was young, I celebrated with a cake, presents, and a small party with family.",
    },
    {
      week: 36,
      day: "Mon",
      question: "What scared you when you were a child?",
      grammar: "Past Simple",
      starter: "When I was a child, ... scared me.",
      example:
        "When I was a child, the dark scared me, but now I am okay with it.",
    },
    {
      week: 36,
      day: "Tue",
      question: "Did you enjoy reading when you were younger?",
      grammar: "Past Simple",
      starter: "Yes, I enjoyed... / No, I did not enjoy...",
      example:
        "Yes, I enjoyed reading picture books and simple stories before bed.",
    },
    {
      week: 36,
      day: "Wed",
      question: "What was your favorite activity in elementary school?",
      grammar: "Past Simple (was)",
      starter: "My favorite activity was...",
      example:
        "My favorite activity was playing dodgeball during recess with my classmates.",
    },
    {
      week: 36,
      day: "Thu",
      question: "When did you first use a computer?",
      grammar: "Past Simple",
      starter: "I first used a computer when...",
      example: "I first used a computer when I was 8 years old to play games.",
    },
    {
      week: 36,
      day: "Fri",
      question: "Who was your favorite teacher in elementary school and why?",
      grammar: "Past Simple (was)",
      starter: "My favorite teacher was... because...",
      example:
        "My favorite teacher was Mrs. Yamada because she was kind and made learning fun.",
    },
    {
      week: 37,
      day: "Mon",
      question: "What was the best thing you learned this year?",
      grammar: "Past Simple (was)",
      starter: "The best thing I learned was...",
      example:
        "The best thing I learned was how to introduce myself in English.",
    },
    {
      week: 37,
      day: "Tue",
      question:
        "What can you do now that you could not do at the start of the year?",
      grammar: "Can (present vs past)",
      starter: "Now I can... but at the start I could not...",
      example:
        "Now I can speak simple English sentences, but at the start I could not.",
    },
    {
      week: 37,
      day: "Wed",
      question: "Who is your favorite classmate and why?",
      grammar: "Present Simple + is",
      starter: "My favorite classmate is... because...",
      example:
        "My favorite classmate is Yuki because she is kind and always helps me.",
    },
    {
      week: 37,
      day: "Thu",
      question: "What do you like most about English class?",
      grammar: "Present Simple",
      starter: "I like... most because...",
      example:
        "I like speaking activities most because they are fun and interactive.",
    },
    {
      week: 37,
      day: "Fri",
      question: "How many new friends did you make this year?",
      grammar: "Past Simple",
      starter: "This year, I made... new friends.",
      example: "This year, I made five new friends in my class and club.",
    },
    {
      week: 38,
      day: "Mon",
      question: "What is your favorite memory from this school year?",
      grammar: "Present Simple + is",
      starter: "My favorite memory is...",
      example: "My favorite memory is the school trip to Kyoto with my class.",
    },
    {
      week: 38,
      day: "Tue",
      question: "Are you happy with your English progress this year?",
      grammar: "Present Simple + are",
      starter: "Yes, I am happy because... / No, I am not happy because...",
      example:
        "Yes, I am happy because I can understand and speak more English now.",
    },
    {
      week: 38,
      day: "Wed",
      question: "What subject did you improve the most in?",
      grammar: "Past Simple",
      starter: "I improved the most in...",
      example:
        "I improved the most in math because I studied hard and asked questions.",
    },
    {
      week: 38,
      day: "Thu",
      question: "Do you have any goals for next year?",
      grammar: "Present Simple + have",
      starter: "Yes, I have... / My goal is to...",
      example:
        "Yes, I have a goal to speak English more confidently in Grade 2.",
    },
    {
      week: 38,
      day: "Fri",
      question: "What was the most difficult thing you learned this year?",
      grammar: "Past Simple (was)",
      starter: "The most difficult thing was...",
      example: "The most difficult thing was learning verb tenses in English.",
    },
    {
      week: 39,
      day: "Mon",
      question: "Can you describe your best friend?",
      grammar: "Can + Present Simple",
      starter: "My best friend is... He/She has... He/She can...",
      example:
        "My best friend is Kenji. He has short black hair. He can play guitar very well.",
    },
    {
      week: 39,
      day: "Tue",
      question: "What are you doing to prepare for Grade 2?",
      grammar: "Present Continuous",
      starter: "I am... to prepare.",
      example:
        "I am reviewing Grade 1 grammar and vocabulary to prepare for Grade 2.",
    },
    {
      week: 39,
      day: "Wed",
      question: "Where do you want to go during summer vacation?",
      grammar: "Present Simple + want",
      starter: "I want to go to...",
      example:
        "I want to go to Tokyo Disneyland with my family during summer vacation.",
    },
    {
      week: 39,
      day: "Thu",
      question: "What did you enjoy most about being in Grade 1?",
      grammar: "Past Simple",
      starter: "I enjoyed... most.",
      example:
        "I enjoyed making new friends and learning interesting things most.",
    },
    {
      week: 39,
      day: "Fri",
      question: "How do you feel about starting Grade 2?",
      grammar: "Present Simple + feel",
      starter: "I feel... because...",
      example:
        "I feel excited because I will learn more and have new experiences.",
    },
    {
      week: 40,
      day: "Mon",
      question: "What advice can you give to new Grade 1 students?",
      grammar: "Can + Imperative",
      starter: "You should... / Make sure to...",
      example:
        "You should study regularly, make friends, and do not be afraid to ask questions.",
    },
    {
      week: 40,
      day: "Tue",
      question:
        "What is one thing you want to change about yourself next year?",
      grammar: "Present Simple + want",
      starter: "I want to change... / I want to become...",
      example:
        "I want to become more organized with my homework and study schedule.",
    },
    {
      week: 40,
      day: "Wed",
      question: "Are you looking forward to Grade 2? Why?",
      grammar: "Present Continuous + are",
      starter: "Yes, I am looking forward to... because...",
      example:
        "Yes, I am looking forward to Grade 2 because I will learn more advanced English.",
    },
    {
      week: 40,
      day: "Thu",
      question: "What was your proudest moment this year?",
      grammar: "Past Simple (was)",
      starter: "My proudest moment was when...",
      example:
        "My proudest moment was when I gave a presentation in English in front of the class.",
    },
    {
      week: 40,
      day: "Fri",
      question: "What do you want to say to yourself as you finish Grade 1?",
      grammar: "Imperative / Present Simple",
      starter: "I want to say...",
      example:
        "I want to say: Great job! You worked hard and learned a lot. Keep going!",
    },
  ],
  "2": [
    // WEEKS 1-12
    {
      week: 1,
      day: "Mon",
      question: "What did you do during spring vacation? Where did you go?",
      grammar: "Past Simple",
      starter: "During spring vacation, I...",
      example: "During spring vacation, I went to my grandparents' house.",
    },
    {
      week: 1,
      day: "Tue",
      question: "Did you travel anywhere last month? Where?",
      grammar: "Past Simple",
      starter: "Yes, I traveled to... / No, I did not travel...",
      example: "Yes, I traveled to Kyoto with my family.",
    },
    {
      week: 1,
      day: "Wed",
      question: "What was the best meal you ate recently?",
      grammar: "Past Simple (was)",
      starter: "The best meal was...",
      example: "The best meal was sushi at a restaurant for my birthday.",
    },
    {
      week: 1,
      day: "Thu",
      question: "Who did you spend the most time with last week?",
      grammar: "Past Simple",
      starter: "Last week, I spent the most time with...",
      example: "Last week, I spent the most time with my basketball team.",
    },
    {
      week: 1,
      day: "Fri",
      question: "What did you learn in your classes last week?",
      grammar: "Past Simple",
      starter: "Last week, I learned...",
      example: "Last week, I learned about photosynthesis in science.",
    },
    {
      week: 2,
      day: "Mon",
      question: "Where did you live when you were a child?",
      grammar: "Past Simple",
      starter: "When I was a child, I lived...",
      example: "When I was a child, I lived in Sapporo.",
    },
    {
      week: 2,
      day: "Tue",
      question: "What was your favorite toy when you were young?",
      grammar: "Past Simple (was)",
      starter: "My favorite toy was...",
      example: "My favorite toy was my teddy bear.",
    },
    {
      week: 2,
      day: "Wed",
      question: "Did you like school when you were in elementary school?",
      grammar: "Past Simple",
      starter: "Yes, I liked... / No, I did not like...",
      example: "Yes, I liked school because I had good friends.",
    },
    {
      week: 2,
      day: "Thu",
      question: "What games did you play as a child?",
      grammar: "Past Simple",
      starter: "As a child, I played...",
      example: "As a child, I played tag and hide-and-seek.",
    },
    {
      week: 2,
      day: "Fri",
      question: "Who was your best friend in elementary school?",
      grammar: "Past Simple (was)",
      starter: "My best friend was...",
      example: "My best friend was Kenji. We sat next to each other.",
    },
    {
      week: 3,
      day: "Mon",
      question: "What was the most interesting thing you did last year?",
      grammar: "Past Simple (was)",
      starter: "Last year, the most interesting thing was...",
      example:
        "Last year, the most interesting thing was going to Tokyo Disneyland.",
    },
    {
      week: 3,
      day: "Tue",
      question: "Did you join any new clubs or activities last year?",
      grammar: "Past Simple",
      starter: "Yes, I joined... / No, I did not join...",
      example: "Yes, I joined the art club and learned painting techniques.",
    },
    {
      week: 3,
      day: "Wed",
      question: "What was your biggest challenge in Grade 1?",
      grammar: "Past Simple (was)",
      starter: "My biggest challenge was...",
      example: "My biggest challenge was making new friends at the start.",
    },
    {
      week: 3,
      day: "Thu",
      question: "Did your English improve a lot last year?",
      grammar: "Past Simple",
      starter: "Yes, it improved... / No, it did not improve...",
      example: "Yes, it improved because I practiced speaking with the ALT.",
    },
    {
      week: 3,
      day: "Fri",
      question: "What did you accomplish last year that you are proud of?",
      grammar: "Past Simple",
      starter: "Last year, I accomplished...",
      example: "Last year, I accomplished getting better grades in math.",
    },
    {
      week: 4,
      day: "Mon",
      question: "When was the last time you felt really happy? What happened?",
      grammar: "Past Simple (was)",
      starter: "The last time I felt really happy was when...",
      example:
        "The last time I felt really happy was when my team won the basketball game.",
    },
    {
      week: 4,
      day: "Tue",
      question: "What was the last book you read? Did you like it?",
      grammar: "Past Simple (was)",
      starter:
        "The last book I read was... Yes, I liked it... / No, I did not...",
      example: "The last book I read was Harry Potter. Yes, I liked it a lot.",
    },
    {
      week: 4,
      day: "Wed",
      question: "When did you last go out with your family? Where did you go?",
      grammar: "Past Simple",
      starter: "I last went out with my family... We went...",
      example:
        "I last went out with my family last Sunday. We went to a shopping mall.",
    },
    {
      week: 4,
      day: "Thu",
      question: "What was the last thing that made you laugh?",
      grammar: "Past Simple (was)",
      starter: "The last thing that made me laugh was...",
      example:
        "The last thing that made me laugh was a funny video my friend showed me.",
    },
    {
      week: 4,
      day: "Fri",
      question: "When did you last help someone? What did you do?",
      grammar: "Past Simple",
      starter: "I last helped someone... I...",
      example:
        "I last helped someone yesterday. I helped my classmate with homework.",
    },
    {
      week: 5,
      day: "Mon",
      question: "What are you going to do this weekend?",
      grammar: "Be going to",
      starter: "This weekend, I am going to...",
      example:
        "This weekend, I am going to study for my test and play video games.",
    },
    {
      week: 5,
      day: "Tue",
      question: "Are you going to watch any movies soon? Which ones?",
      grammar: "Be going to",
      starter: "Yes, I am going to watch... / No, I am not going to...",
      example: "Yes, I am going to watch the new Marvel movie with friends.",
    },
    {
      week: 5,
      day: "Wed",
      question: "What will you eat for lunch today?",
      grammar: "Will",
      starter: "Today, I will eat...",
      example: "Today, I will eat the school lunch. It is curry today.",
    },
    {
      week: 5,
      day: "Thu",
      question: "Are you going to join any activities this month?",
      grammar: "Be going to",
      starter: "Yes, I am going to join... / No, I am not going to...",
      example:
        "Yes, I am going to join the culture festival planning committee.",
    },
    {
      week: 5,
      day: "Fri",
      question: "What time will you go to bed tonight?",
      grammar: "Will",
      starter: "Tonight, I will go to bed at...",
      example:
        "Tonight, I will go to bed at 11:00 PM after finishing homework.",
    },
    {
      week: 6,
      day: "Mon",
      question: "What are you going to do during summer vacation?",
      grammar: "Be going to",
      starter: "During summer vacation, I am going to...",
      example:
        "During summer vacation, I am going to visit my cousins in Osaka.",
    },
    {
      week: 6,
      day: "Tue",
      question: "Are you going to travel anywhere this summer? Where?",
      grammar: "Be going to",
      starter: "Yes, I am going to... / No, I am not going to...",
      example: "Yes, I am going to Okinawa with my family for a week.",
    },
    {
      week: 6,
      day: "Wed",
      question: "Will you study during the summer break?",
      grammar: "Will",
      starter: "Yes, I will study... / No, I will not study...",
      example: "Yes, I will study a little bit to prepare for next semester.",
    },
    {
      week: 6,
      day: "Thu",
      question: "What will you do to stay cool in summer?",
      grammar: "Will",
      starter: "I will...",
      example: "I will swim at the pool and eat ice cream.",
    },
    {
      week: 6,
      day: "Fri",
      question: "Are you going to learn anything new this summer?",
      grammar: "Be going to",
      starter: "Yes, I am going to learn... / No, I am not going to...",
      example: "Yes, I am going to learn how to cook from my grandmother.",
    },
    {
      week: 7,
      day: "Mon",
      question: "What are you going to do to improve your English?",
      grammar: "Be going to",
      starter: "I am going to...",
      example: "I am going to watch more English movies without subtitles.",
    },
    {
      week: 7,
      day: "Tue",
      question: "What will you be doing in five years?",
      grammar: "Will + continuous",
      starter: "In five years, I will be...",
      example: "In five years, I will be in university studying business.",
    },
    {
      week: 7,
      day: "Wed",
      question: "Are you going to try any new hobbies soon?",
      grammar: "Be going to",
      starter: "Yes, I am going to try... / No, I am not going to...",
      example:
        "Yes, I am going to try photography because it looks interesting.",
    },
    {
      week: 7,
      day: "Thu",
      question: "What will you do after you graduate from junior high school?",
      grammar: "Will",
      starter: "After graduation, I will...",
      example: "After graduation, I will go to high school and study hard.",
    },
    {
      week: 7,
      day: "Fri",
      question: "Are you going to take any lessons or classes soon?",
      grammar: "Be going to",
      starter: "Yes, I am going to take... / No, I am not going to...",
      example:
        "Yes, I am going to take swimming lessons to improve my technique.",
    },
    {
      week: 8,
      day: "Mon",
      question: "Do you think it will rain tomorrow? Why?",
      grammar: "Will",
      starter: "Yes, I think it will... / No, I do not think it will...",
      example: "Yes, I think it will rain because the sky is cloudy.",
    },
    {
      week: 8,
      day: "Tue",
      question: "Who will win the next big sports championship?",
      grammar: "Will",
      starter: "I think ... will win because...",
      example: "I think the Giants will win because they have strong players.",
    },
    {
      week: 8,
      day: "Wed",
      question: "What will technology be like in 20 years?",
      grammar: "Will",
      starter: "In 20 years, technology will be...",
      example:
        "In 20 years, technology will be much more advanced with AI everywhere.",
    },
    {
      week: 8,
      day: "Thu",
      question: "Do you think you will use English in your future career?",
      grammar: "Will",
      starter: "Yes, I think I will... / No, I do not think I will...",
      example:
        "Yes, I think I will use English because many companies are international.",
    },
    {
      week: 8,
      day: "Fri",
      question: "What will your town be like in the future?",
      grammar: "Will",
      starter: "In the future, my town will...",
      example:
        "In the future, my town will have more tall buildings and better transportation.",
    },
    {
      week: 9,
      day: "Mon",
      question: "If you have free time this weekend, what will you do?",
      grammar: "If + present, will",
      starter: "If I have free time, I will...",
      example: "If I have free time, I will go to the movies with my friends.",
    },
    {
      week: 9,
      day: "Tue",
      question: "If it rains during lunch break, where will you go?",
      grammar: "If + present, will",
      starter: "If it rains, I will...",
      example:
        "If it rains, I will stay in the classroom and talk with friends.",
    },
    {
      week: 9,
      day: "Wed",
      question:
        "If you get good grades this semester, what will you do to celebrate?",
      grammar: "If + present, will",
      starter: "If I get good grades, I will...",
      example:
        "If I get good grades, I will ask my parents to buy me a new game.",
    },
    {
      week: 9,
      day: "Thu",
      question: "If your friend is absent tomorrow, what will you do?",
      grammar: "If + present, will",
      starter: "If my friend is absent, I will...",
      example:
        "If my friend is absent, I will take notes for them and explain later.",
    },
    {
      week: 9,
      day: "Fri",
      question: "If you have 1,000 yen, what will you buy?",
      grammar: "If + present, will",
      starter: "If I have 1,000 yen, I will buy...",
      example:
        "If I have 1,000 yen, I will buy a manga volume and some snacks.",
    },
    {
      week: 10,
      day: "Mon",
      question: "If you study hard, what will happen to your grades?",
      grammar: "If + present, will",
      starter: "If I study hard, my grades will...",
      example:
        "If I study hard, my grades will improve and my parents will be happy.",
    },
    {
      week: 10,
      day: "Tue",
      question: "If you join a new club, which one will you join?",
      grammar: "If + present, will",
      starter: "If I join a new club, I will join...",
      example:
        "If I join a new club, I will join the drama club because acting is fun.",
    },
    {
      week: 10,
      day: "Wed",
      question:
        "If you can go anywhere during summer vacation, where will you go?",
      grammar: "If + present, will",
      starter: "If I can go anywhere, I will go...",
      example:
        "If I can go anywhere, I will go to Hawaii because I love the beach.",
    },
    {
      week: 10,
      day: "Thu",
      question:
        "If you pass the entrance exam, which high school will you attend?",
      grammar: "If + present, will",
      starter: "If I pass the exam, I will attend...",
      example:
        "If I pass the exam, I will attend the high school near my house.",
    },
    {
      week: 10,
      day: "Fri",
      question:
        "If you save your allowance for three months, what will you buy?",
      grammar: "If + present, will",
      starter: "If I save for three months, I will buy...",
      example: "If I save for three months, I will buy a new smartphone.",
    },
    {
      week: 11,
      day: "Mon",
      question: "If you eat too much candy, what will happen?",
      grammar: "If + present, will",
      starter: "If I eat too much candy, I will...",
      example: "If I eat too much candy, I will get a toothache.",
    },
    {
      week: 11,
      day: "Tue",
      question: "If you don't sleep enough, how will you feel?",
      grammar: "If + present, will",
      starter: "If I don't sleep enough, I will...",
      example:
        "If I don't sleep enough, I will feel tired and sleepy in class.",
    },
    {
      week: 11,
      day: "Wed",
      question:
        "If you see a lot of window trash in the park, what will you do?",
      grammar: "If + present, will",
      starter: "If I see trash, I will...",
      example:
        "If I see a lot of trash, I will pick it up and put it in the bin.",
    },
    {
      week: 11,
      day: "Thu",
      question: "If you find a wallet on the street, what will you do?",
      grammar: "If + present, will",
      starter: "If I find a wallet, I will...",
      example: "If I find a wallet, I will take it to the police station.",
    },
    {
      week: 11,
      day: "Fri",
      question: "If you get lost in a new city, who will you ask for help?",
      grammar: "If + present, will",
      starter: "If I get lost, I will ask...",
      example:
        "If I get lost, I will ask a police officer or use my phone map.",
    },
    {
      week: 12,
      day: "Mon",
      question:
        "If you have a problem with your homework, who will you talk to?",
      grammar: "If + present, will",
      starter: "If I have a problem, I will...",
      example: "If I have a problem, I will talk to my teacher or my parents.",
    },
    {
      week: 12,
      day: "Tue",
      question: "If you win a lottery, what will you do with the money?",
      grammar: "If + present, will",
      starter: "If I win, I will...",
      example:
        "If I win a lottery, I will save half and use the rest to travel.",
    },
    {
      week: 12,
      day: "Wed",
      question: "If you are hungry after school, what will you eat?",
      grammar: "If + present, will",
      starter: "If I am hungry, I will...",
      example: "If I am hungry, I will eat some fruit or a rice ball.",
    },
    {
      week: 12,
      day: "Thu",
      question: "If you feel sick tomorrow morning, what will you do?",
      grammar: "If + present, will",
      starter: "If I feel sick, I will...",
      example: "If I feel sick, I will tell my parents and stay home to rest.",
    },
    {
      week: 12,
      day: "Fri",
      question: "If your computer breaks, how will you do your homework?",
      grammar: "If + present, will",
      starter: "If my computer breaks, I will...",
      example:
        "If my computer breaks, I will go to the library or use my tablet.",
    },
    // WEEKS 13-24
    {
      week: 13,
      day: "Mon",
      question: "Is English as difficult as Japanese for you?",
      grammar: "as...as",
      starter: "No, English is not as... as...",
      example: "No, English is not as difficult as Japanese for me.",
    },
    {
      week: 13,
      day: "Tue",
      question: "Are you as tall as your father?",
      grammar: "as...as",
      starter: "No, I am not as tall as my father yet.",
      example: "No, I am not as tall as my father yet.",
    },
    {
      week: 13,
      day: "Wed",
      question: "Is your city as big as Tokyo?",
      grammar: "as...as",
      starter: "No, my city is not as big as Tokyo.",
      example:
        "No, my city is not as big as Tokyo, but it is very comfortable.",
    },
    {
      week: 13,
      day: "Thu",
      question: "Do you study as hard as your best friend?",
      grammar: "as...as",
      starter: "Yes, I study as hard as my friend. We study together.",
      example: "Yes, I study as hard as my friend. We study together.",
    },
    {
      week: 13,
      day: "Fri",
      question: "Is this winter as cold as last winter?",
      grammar: "as...as",
      starter: "Yes, it is as cold as last winter.",
      example: "Yes, it is as cold as last winter. I need a heavy coat.",
    },
    {
      week: 14,
      day: "Mon",
      question: "Was your lunch eaten by you or given to someone?",
      grammar: "Passive Voice",
      starter: "My lunch was...",
      example: "My lunch was eaten by me. It was delicious.",
    },
    {
      week: 14,
      day: "Tue",
      question: "Is English spoken in many countries?",
      grammar: "Passive Voice",
      starter: "Yes, English is spoken in...",
      example: "Yes, English is spoken in many countries around the world.",
    },
    {
      week: 14,
      day: "Wed",
      question: "When was your school built?",
      grammar: "Passive Voice",
      starter: "My school was built...",
      example: "My school was built fifty years ago. It is quite old.",
    },
    {
      week: 14,
      day: "Thu",
      question: "Are these cars made in Japan?",
      grammar: "Passive Voice",
      starter: "Yes, these cars are made in Japan by a famous company.",
      example: "Yes, these cars are made in Japan by a famous company.",
    },
    {
      week: 14,
      day: "Fri",
      question: "What is this bridge called?",
      grammar: "Passive Voice",
      starter: "This bridge is called...",
      example:
        "This bridge is called the Rainbow Bridge. It's beautiful at night.",
    },
    {
      week: 15,
      day: "Mon",
      question: "Do you have any books written in English?",
      grammar: "Passive Voice (written)",
      starter: "Yes, I have... / No, I do not have...",
      example: "Yes, I have some picture books written in English.",
    },
    {
      week: 15,
      day: "Tue",
      question: "Was this cake made by your mother?",
      grammar: "Passive Voice",
      starter: "Yes, it was made by... / No, it was made by...",
      example: "Yes, this cake was made by my mother for my birthday.",
    },
    {
      week: 15,
      day: "Wed",
      question: "Is the classroom cleaned by students every day?",
      grammar: "Passive Voice",
      starter: "Yes, the classroom is cleaned by...",
      example: "Yes, the classroom is cleaned by us after school every day.",
    },
    {
      week: 15,
      day: "Thu",
      question: "Was America discovered by Columbus?",
      grammar: "Passive Voice",
      starter: "Yes, it was...",
      example: "Yes, America was discovered by Columbus in 1492.",
    },
    {
      week: 15,
      day: "Fri",
      question: "Is this song loved by many people?",
      grammar: "Passive Voice",
      starter: "Yes, this song is loved by...",
      example: "Yes, this song is loved by many young people in Japan.",
    },
    {
      week: 16,
      day: "Mon",
      question: "What were you doing at 8 PM yesterday?",
      grammar: "Past Continuous",
      starter: "At 8 PM yesterday, I was...ing...",
      example:
        "At 8 PM yesterday, I was doing my homework and listening to music.",
    },
    {
      week: 16,
      day: "Tue",
      question: "Were you sleeping when the phone rang?",
      grammar: "Past Continuous",
      starter: "Yes, I was... / No, I was not...",
      example: "No, I was not sleeping. I was reading a book.",
    },
    {
      week: 16,
      day: "Wed",
      question: "What was your mother doing when you got home?",
      grammar: "Past Continuous",
      starter: "She was...ing...",
      example: "She was cooking dinner when I got home yesterday.",
    },
    {
      week: 16,
      day: "Thu",
      question: "Were your friends playing soccer after school?",
      grammar: "Past Continuous",
      starter: "Yes, they were...ing... / No, they were not...",
      example: "Yes, they were playing soccer on the playground.",
    },
    {
      week: 16,
      day: "Fri",
      question: "Was it raining when you woke up this morning?",
      grammar: "Past Continuous",
      starter: "Yes, it was...ing / No, it was not...",
      example: "No, it was not raining. The sun was shining.",
    },
    {
      week: 17,
      day: "Mon",
      question: "I think that English is interesting. What do you think?",
      grammar: "that clause",
      starter: "I think that... / I don't think that...",
      example: "I think that English is very useful for my future.",
    },
    {
      week: 17,
      day: "Tue",
      question: "Do you believe that aliens exist?",
      grammar: "that clause",
      starter: "Yes, I believe that... / No, I don't believe that...",
      example: "Yes, I believe that aliens exist somewhere in the universe.",
    },
    {
      week: 17,
      day: "Wed",
      question: "Do you hope that it will be sunny tomorrow?",
      grammar: "that clause",
      starter: "Yes, I hope that it will be...",
      example: "Yes, I hope that it will be sunny because I have a game.",
    },
    {
      week: 17,
      day: "Thu",
      question: "Did you know that Mt. Fuji is the highest mountain in Japan?",
      grammar: "that clause",
      starter: "Yes, I knew that... / No, I didn't know that...",
      example: "Yes, I knew that. It is a very beautiful mountain.",
    },
    {
      week: 17,
      day: "Fri",
      question: "Do you think that students should use tablets in class?",
      grammar: "that clause",
      starter: "I think that students should... because...",
      example:
        "I think that students should use tablets because it's efficient.",
    },
    {
      week: 18,
      day: "Mon",
      question: "What makes you happy?",
      grammar: "Make + object + adjective",
      starter: "... makes me happy.",
      example: "Playing with my cat makes me very happy.",
    },
    {
      week: 18,
      day: "Tue",
      question: "Does studying English make you tired?",
      grammar: "Make + object + adjective",
      starter: "Yes, it makes me... / No, it doesn't make me...",
      example: "No, it doesn't make me tired. It makes me excited!",
    },
    {
      week: 18,
      day: "Wed",
      question: "What kind of music makes you feel relaxed?",
      grammar: "Make + object + adjective",
      starter: "... makes me feel relaxed.",
      example: "Classical music makes me feel very relaxed when I study.",
    },
    {
      week: 18,
      day: "Thu",
      question: "Does rainy weather make you sad?",
      grammar: "Make + object + adjective",
      starter: "No, it doesn't make me sad. I like rainy days.",
      example:
        "No, it doesn't make me sad. I like reading at home on rainy days.",
    },
    {
      week: 18,
      day: "Fri",
      question: "What makes your parents angry?",
      grammar: "Make + object + adjective",
      starter: "... makes my parents angry.",
      example: "Not doing my homework makes my parents very angry.",
    },
    {
      week: 19,
      day: "Mon",
      question: "Do you want me to help you with your English?",
      grammar: "Want + person + to infinitive",
      starter: "Yes, I want you to... / No, thank you.",
      example: "Yes, I want you to practice speaking with me.",
    },
    {
      week: 19,
      day: "Tue",
      question: "Does your mother want you to be a doctor?",
      grammar: "Want + person + to infinitive",
      starter: "Yes, she wants me to be... / No, she wants me to be...",
      example: "No, she wants me to be happy and do what I like.",
    },
    {
      week: 19,
      day: "Wed",
      question: "What do you want your friends to do for you?",
      grammar: "Want + person + to infinitive",
      starter: "I want them to...",
      example: "I want them to be kind and play games with me.",
    },
    {
      week: 19,
      day: "Thu",
      question: "Do you want your teacher to give you less homework?",
      grammar: "Want + person + to infinitive",
      starter: "Yes, I want my teacher to...!",
      example: "Yes, I want my teacher to give us less homework on weekends.",
    },
    {
      week: 19,
      day: "Fri",
      question: "What do you want your parents to buy for you?",
      grammar: "Want + person + to infinitive",
      starter: "I want them to buy me...",
      example: "I want them to buy me a new pair of sneakers for basketball.",
    },
    {
      week: 20,
      day: "Mon",
      question: "Who told you to study hard?",
      grammar: "Tell + person + to infinitive",
      starter: "My... told me to study hard.",
      example: "My mother told me to study hard for the entrance exams.",
    },
    {
      week: 20,
      day: "Tue",
      question: "Did the teacher tell you to be quiet?",
      grammar: "Tell + person + to infinitive",
      starter: "Yes, the teacher told us to...",
      example:
        "Yes, the teacher told us to be quiet and listen to the instructions.",
    },
    {
      week: 20,
      day: "Wed",
      question: "What did your parents tell you to do this morning?",
      grammar: "Tell + person + to infinitive",
      starter: "They told me to...",
      example: "They told me to eat my breakfast and bring my umbrella.",
    },
    {
      week: 20,
      day: "Thu",
      question: "Who asked you to join the club?",
      grammar: "Ask + person + to infinitive",
      starter: "My... asked me to join.",
      example: "My best friend asked me to join the art club with her.",
    },
    {
      week: 20,
      day: "Fri",
      question: "Did I ask you to speak in English?",
      grammar: "Ask + person + to infinitive",
      starter: "Yes, you asked me to...",
      example: "Yes, you asked me to speak in English during Small Talk.",
    },
    {
      week: 21,
      day: "Mon",
      question: "Is it fun to play video games?",
      grammar: "It is... to infinitive",
      starter: "Yes, it is fun to...",
      example: "Yes, it is fun to play video games with my friends online.",
    },
    {
      week: 21,
      day: "Tue",
      question: "Is it difficult to get up early?",
      grammar: "It is... to infinitive",
      starter: "Yes, it is difficult to...",
      example: "Yes, it is very difficult for me to get up at 6 AM.",
    },
    {
      week: 21,
      day: "Wed",
      question: "Is it important to study English?",
      grammar: "It is... to infinitive",
      starter: "Yes, it is important to...",
      example: "Yes, it is important to study English for my future career.",
    },
    {
      week: 21,
      day: "Thu",
      question: "Is it easy to cook ramen?",
      grammar: "It is... to infinitive",
      starter: "Yes, it is easy to...",
      example: "Yes, it is easy to cook cup ramen, but real ramen is hard.",
    },
    {
      week: 21,
      day: "Fri",
      question: "Is it necessary to wear a mask today?",
      grammar: "It is... to infinitive",
      starter: "Yes, it is necessary to... / No, it is not...",
      example: "No, it is not necessary to wear a mask outdoors now.",
    },
    {
      week: 22,
      day: "Mon",
      question: "I don't know how to speak French. Do you?",
      grammar: "how to infinitive",
      starter: "No, I don't know how to... / Yes, I know how to...",
      example:
        "No, I don't know how to speak French, but I know how to speak Japanese.",
    },
    {
      week: 22,
      day: "Tue",
      question: "Do you know how to use this smartphone?",
      grammar: "how to infinitive",
      starter: "Yes, I know how to...",
      example: "Yes, I know how to use it. It's very easy for me.",
    },
    {
      week: 22,
      day: "Wed",
      question: "Did you learn how to swim in elementary school?",
      grammar: "how to infinitive",
      starter: "Yes, I learned how to...",
      example: "Yes, I learned how to swim in the school pool.",
    },
    {
      week: 22,
      day: "Thu",
      question: "Does your friend know how to play the guitar?",
      grammar: "how to infinitive",
      starter: "Yes, my friend knows how to...",
      example: "Yes, my friend knows how to play the guitar very well.",
    },
    {
      week: 22,
      day: "Fri",
      question: "Do you know how to make sushi?",
      grammar: "how to infinitive",
      starter: "Yes, I know how to... / No, I don't...",
      example: "No, I don't know how to make it. My father knows how to.",
    },
    {
      week: 23,
      day: "Mon",
      question: "Show me how to solve this problem.",
      grammar: "Show/Tell + how to",
      starter: "I will show you how to...",
      example: "I will show you how to solve this math problem. It's easy.",
    },
    {
      week: 23,
      day: "Tue",
      question: "Can you tell me what to do for homework?",
      grammar: "what to infinitive",
      starter: "Yes, I can tell you what to...",
      example: "Yes, I can tell you what to do. We must finish page 24.",
    },
    {
      week: 23,
      day: "Wed",
      question: "Do you know where to go for the next field trip?",
      grammar: "where to infinitive",
      starter: "Yes, I know where to...",
      example: "Yes, I know where to go. We are going to the science museum.",
    },
    {
      week: 23,
      day: "Thu",
      question: "Can you tell me when to start the game?",
      grammar: "when to infinitive",
      starter: "I will tell you when to...",
      example: "I will tell you when to start. Please wait for my signal.",
    },
    {
      week: 23,
      day: "Fri",
      question: "Do you know which book to read next?",
      grammar: "which to infinitive",
      starter: "Yes, I know which... / No, I don't...",
      example: "Yes, I know which book to read. I'm going to read a mystery.",
    },
    {
      week: 24,
      day: "Mon",
      question: "What do you want to be when you grow up?",
      grammar: "Review: Want to be",
      starter: "I want to be a...",
      example: "I want to be a teacher because I like helping people.",
    },
    {
      week: 24,
      day: "Tue",
      question: "Why do you study English?",
      grammar: "Infinitive (purpose)",
      starter: "I study English to...",
      example: "I study English to talk to people from other countries.",
    },
    {
      week: 24,
      day: "Wed",
      question: "Do you have anything to eat now?",
      grammar: "Infinitive (adj use)",
      starter: "Yes, I have... to eat. / No, I don't.",
      example: "No, I don't have anything to eat now. I'm hungry.",
    },
    {
      week: 24,
      day: "Thu",
      question: "Do you have much homework to do today?",
      grammar: "Infinitive (adj use)",
      starter: "Yes, I have a lot of... to do.",
      example: "Yes, I have a lot of homework to do for math and science.",
    },
    {
      week: 24,
      day: "Fri",
      question: "Is there a good place to visit in your town?",
      grammar: "Infinitive (adj use)",
      starter: "Yes, there is a... to visit.",
      example: "Yes, there is a beautiful temple to visit in my town.",
    },
    // WEEKS 25-40
    {
      week: 25,
      day: "Mon",
      question: "How was your winter vacation? Tell me one thing.",
      grammar: "Past Simple",
      starter: "It was... I...",
      example: "It was relaxing. I watched many movies at home.",
    },
    {
      week: 25,
      day: "Tue",
      question: "What is the most important rule in your house?",
      grammar: "Must/Have to",
      starter: "The most important rule is that I must...",
      example:
        "The most important rule is that I must finish my homework before dinner.",
    },
    {
      week: 25,
      day: "Wed",
      question: "What should students do to make the school better?",
      grammar: "Should",
      starter: "I think students should...",
      example: "I think students should pick up trash and be kind to everyone.",
    },
    {
      week: 25,
      day: "Thu",
      question: "If you were the principal, what would you change?",
      grammar: "Subjunctive",
      starter: "If I were the principal, I would...",
      example: "If I were the principal, I would make the lunch break longer.",
    },
    {
      week: 25,
      day: "Fri",
      question: "What are your goals for Grade 3?",
      grammar: "Future/Hope",
      starter: "My goal is to...",
      example: "My goal for Grade 3 is to pass the Eiken 3rd grade exam.",
    },
    {
      week: 26,
      day: "Mon",
      question: "Which is more interesting, English or Science?",
      grammar: "Comparative",
      starter: "I think... is more interesting than...",
      example: "I think Science is more interesting because I like nature.",
    },
    {
      week: 26,
      day: "Tue",
      question: "Who is the most famous person in Japan now?",
      grammar: "Superlative",
      starter: "I think... is the most famous.",
      example: "I think Shohei Ohtani is the most famous person right now.",
    },
    {
      week: 26,
      day: "Wed",
      question: "What is the best way to make new friends?",
      grammar: "Infinitive",
      starter: "The best way is to...",
      example: "The best way to make friends is to talk to them with a smile.",
    },
    {
      week: 26,
      day: "Thu",
      question: "What makes you feel proud of your class?",
      grammar: "Make + Obj + Adj",
      starter: "... makes me feel proud.",
      example: "Our teamwork during the sports festival makes me feel proud.",
    },
    {
      week: 26,
      day: "Fri",
      question: "What do you want to do after graduation next year?",
      grammar: "Want to",
      starter: "I want to...",
      example: "I want to go to a high school with a strong basketball team.",
    },
    // WEEKS 25-40 - GRADE 2 (WHAT IF?)
    {
      week: 25,
      day: "Mon",
      question: "Can you tell me where the library is in this school?",
      grammar: "Indirect Question",
      starter: "The library is...",
      example: "The library is on the second floor near the science room.",
    },
    {
      week: 25,
      day: "Tue",
      question: "Do you know what time the school festival starts?",
      grammar: "Indirect Question",
      starter: "I think it starts at...",
      example: "I think it starts at 9:00 AM on Saturday.",
    },
    {
      week: 25,
      day: "Wed",
      question: "Can you tell me how to get to the train station from here?",
      grammar: "Indirect Question",
      starter: "You can get there by...",
      example:
        "You can get there by walking straight and turning left at the convenience store.",
    },
    {
      week: 25,
      day: "Thu",
      question: "Do you know why English is important to study?",
      grammar: "Indirect Question",
      starter: "I think English is important because...",
      example:
        "I think English is important because it helps us communicate with people around the world.",
    },
    {
      week: 25,
      day: "Fri",
      question: "Can you tell me what your favorite subject is and why?",
      grammar: "Indirect Question",
      starter: "My favorite subject is... because...",
      example:
        "My favorite subject is science because I like doing experiments.",
    },
    {
      week: 26,
      day: "Mon",
      question: "Do you know how many students are in your grade?",
      grammar: "Indirect Question",
      starter: "I think there are...",
      example: "I think there are about 180 students in my grade.",
    },
    {
      week: 26,
      day: "Tue",
      question: "Can you tell me what you did last weekend?",
      grammar: "Indirect Question (past)",
      starter: "Last weekend, I...",
      example:
        "Last weekend, I went shopping with my friends and watched a movie.",
    },
    {
      week: 26,
      day: "Wed",
      question: "Do you know when the next test is?",
      grammar: "Indirect Question",
      starter: "I think the next test is...",
      example: "I think the next test is next Friday in math class.",
    },
    {
      week: 26,
      day: "Thu",
      question: "Can you tell me how to make friends in a new school?",
      grammar: "Indirect Question",
      starter: "I think you should...",
      example:
        "I think you should smile, be friendly, and join clubs to meet people.",
    },
    {
      week: 26,
      day: "Fri",
      question: "Do you know what you want to be in the future?",
      grammar: "Indirect Question",
      starter: "I want to be... / I am not sure yet, but...",
      example: "I want to be a teacher because I like helping people learn.",
    },
    {
      week: 27,
      day: "Mon",
      question: "Can you tell me where you went during summer vacation?",
      grammar: "Indirect Question (past)",
      starter: "During summer vacation, I went to...",
      example: "During summer vacation, I went to Okinawa with my family.",
    },
    {
      week: 27,
      day: "Tue",
      question: "Do you know how long it takes to learn English well?",
      grammar: "Indirect Question",
      starter: "I think it takes...",
      example:
        "I think it takes many years of practice and study to learn English well.",
    },
    {
      week: 27,
      day: "Wed",
      question: "Can you tell me what makes you happy?",
      grammar: "Indirect Question",
      starter: "What makes me happy is...",
      example:
        "What makes me happy is spending time with my friends and playing sports.",
    },
    {
      week: 27,
      day: "Thu",
      question: "Do you know who won the last sports festival?",
      grammar: "Indirect Question",
      starter: "I think... won.",
      example: "I think the red team won the last sports festival.",
    },
    {
      week: 27,
      day: "Fri",
      question: "Can you tell me why you chose this school?",
      grammar: "Indirect Question",
      starter: "I chose this school because...",
      example:
        "I chose this school because it is close to my house and has good teachers.",
    },
    {
      week: 28,
      day: "Mon",
      question: "Do you know what the weather will be like tomorrow?",
      grammar: "Indirect Question (future)",
      starter: "I think it will be...",
      example: "I think it will be sunny and warm tomorrow.",
    },
    {
      week: 28,
      day: "Tue",
      question: "Can you tell me how you study for tests?",
      grammar: "Indirect Question",
      starter: "I study by...",
      example:
        "I study by making notes, doing practice problems, and reviewing with friends.",
    },
    {
      week: 28,
      day: "Wed",
      question: "Do you know what time you usually go to bed?",
      grammar: "Indirect Question",
      starter: "I usually go to bed at...",
      example: "I usually go to bed at 10:30 PM on school nights.",
    },
    {
      week: 28,
      day: "Thu",
      question: "Can you tell me what your dream vacation would be?",
      grammar: "Indirect Question (conditional)",
      starter: "My dream vacation would be...",
      example:
        "My dream vacation would be visiting Europe and seeing famous landmarks.",
    },
    {
      week: 28,
      day: "Fri",
      question: "Do you know how to use this grammar point in a sentence?",
      grammar: "Indirect Question",
      starter: "Yes, I can use it by...",
      example:
        "Yes, I can use it by asking polite questions like 'Do you know what time it is?'",
    },
    {
      week: 29,
      day: "Mon",
      question: "What is your town known for?",
      grammar: "Passive Voice",
      starter: "My town is known for...",
      example:
        "My town is known for its beautiful cherry blossoms and historic temple.",
    },
    {
      week: 29,
      day: "Tue",
      question: "How is sushi made?",
      grammar: "Passive Voice",
      starter: "Sushi is made by...",
      example:
        "Sushi is made by placing fresh fish on rice and sometimes wrapping it with seaweed.",
    },
    {
      week: 29,
      day: "Wed",
      question: "When was this school built?",
      grammar: "Passive Voice",
      starter: "This school was built in...",
      example: "This school was built in 1985, so it is almost 40 years old.",
    },
    {
      week: 29,
      day: "Thu",
      question: "What languages are spoken in your family?",
      grammar: "Passive Voice",
      starter: "In my family, ... is/are spoken.",
      example: "In my family, only Japanese is spoken at home.",
    },
    {
      week: 29,
      day: "Fri",
      question: "How is English taught in your school?",
      grammar: "Passive Voice",
      starter: "English is taught by...",
      example:
        "English is taught by Japanese teachers and ALTs using textbooks and conversation practice.",
    },
    {
      week: 30,
      day: "Mon",
      question: "What sports are played at your school?",
      grammar: "Passive Voice",
      starter: "At my school, ... are played.",
      example:
        "At my school, soccer, basketball, volleyball, and tennis are played.",
    },
    {
      week: 30,
      day: "Tue",
      question: "Where is rice grown in Japan?",
      grammar: "Passive Voice",
      starter: "Rice is grown in...",
      example:
        "Rice is grown in many areas of Japan, especially in Niigata and Akita.",
    },
    {
      week: 30,
      day: "Wed",
      question: "How are students chosen for the school festival committee?",
      grammar: "Passive Voice",
      starter: "Students are chosen by...",
      example:
        "Students are chosen by volunteering or being nominated by their classmates.",
    },
    {
      week: 30,
      day: "Thu",
      question: "What is your favorite dish and how is it prepared?",
      grammar: "Passive Voice",
      starter: "My favorite dish is... It is prepared by...",
      example:
        "My favorite dish is curry rice. It is prepared by cooking vegetables and meat in curry sauce.",
    },
    {
      week: 30,
      day: "Fri",
      question: "When was your favorite anime or manga created?",
      grammar: "Passive Voice",
      starter: "It was created in...",
      example: "One Piece was created in 1997 by Eiichiro Oda.",
    },
    {
      week: 31,
      day: "Mon",
      question: "How are grades calculated in your school?",
      grammar: "Passive Voice",
      starter: "Grades are calculated by...",
      example:
        "Grades are calculated by combining test scores, homework, and class participation.",
    },
    {
      week: 31,
      day: "Tue",
      question: "What is recycled in your home?",
      grammar: "Passive Voice",
      starter: "In my home, ... is/are recycled.",
      example:
        "In my home, plastic bottles, paper, and cans are recycled every week.",
    },
    {
      week: 31,
      day: "Wed",
      question: "How is chocolate made?",
      grammar: "Passive Voice",
      starter: "Chocolate is made by...",
      example:
        "Chocolate is made by processing cacao beans, adding sugar, and mixing ingredients together.",
    },
    {
      week: 31,
      day: "Thu",
      question: "What rules are followed in your classroom?",
      grammar: "Passive Voice",
      starter: "In my classroom, ... rules are followed.",
      example:
        "In my classroom, respect, punctuality, and hard work rules are followed.",
    },
    {
      week: 31,
      day: "Fri",
      question: "Where are the Olympic Games held next?",
      grammar: "Passive Voice (future)",
      starter: "The next Olympics will be held in...",
      example: "The next Olympics will be held in Los Angeles in 2028.",
    },
    {
      week: 32,
      day: "Mon",
      question: "How is your favorite song performed?",
      grammar: "Passive Voice",
      starter: "It is performed by...",
      example:
        "It is performed by a band with guitars, drums, and powerful vocals.",
    },
    {
      week: 32,
      day: "Tue",
      question: "What traditions are celebrated in your family?",
      grammar: "Passive Voice",
      starter: "In my family, ... are celebrated.",
      example:
        "In my family, New Year and Obon are celebrated with special foods and visiting relatives.",
    },
    {
      week: 32,
      day: "Wed",
      question: "How are smartphones used by students?",
      grammar: "Passive Voice",
      starter: "Smartphones are used for...",
      example:
        "Smartphones are used for communication, studying, entertainment, and taking photos.",
    },
    {
      week: 32,
      day: "Thu",
      question: "What problems are caused by pollution?",
      grammar: "Passive Voice",
      starter: "Many problems are caused by pollution, such as...",
      example:
        "Many problems are caused by pollution, such as dirty air, sick animals, and climate change.",
    },
    {
      week: 32,
      day: "Fri",
      question: "How is paper made from trees?",
      grammar: "Passive Voice",
      starter: "Paper is made by...",
      example:
        "Paper is made by cutting trees, processing the wood into pulp, and pressing it into sheets.",
    },
    {
      week: 33,
      day: "Mon",
      question: "What do you have to do every morning before school?",
      grammar: "Have to",
      starter: "Every morning, I have to...",
      example:
        "Every morning, I have to wake up at 6:30, eat breakfast, and prepare my school bag.",
    },
    {
      week: 33,
      day: "Tue",
      question: "What must students do to be successful?",
      grammar: "Must",
      starter: "Students must...",
      example:
        "Students must study hard, listen to teachers, and never give up on their goals.",
    },
    {
      week: 33,
      day: "Wed",
      question: "What do you have to bring to school every day?",
      grammar: "Have to",
      starter: "I have to bring...",
      example:
        "I have to bring my textbooks, notebooks, pencil case, and lunch box every day.",
    },
    {
      week: 33,
      day: "Thu",
      question: "What must we do to protect the environment?",
      grammar: "Must",
      starter: "We must...",
      example:
        "We must recycle, save water and energy, and reduce plastic waste to protect the environment.",
    },
    {
      week: 33,
      day: "Fri",
      question: "What do you have to do before taking a test?",
      grammar: "Have to",
      starter: "Before a test, I have to...",
      example:
        "Before a test, I have to review my notes, do practice problems, and get enough sleep.",
    },
    {
      week: 34,
      day: "Mon",
      question: "What must you do if you are late to class?",
      grammar: "Must",
      starter: "If I am late, I must...",
      example:
        "If I am late, I must apologize to the teacher and explain the reason.",
    },
    {
      week: 34,
      day: "Tue",
      question: "What do you have to do to join a club?",
      grammar: "Have to",
      starter: "To join a club, I have to...",
      example:
        "To join a club, I have to fill out an application form and attend the first meeting.",
    },
    {
      week: 34,
      day: "Wed",
      question: "What must people do to stay healthy?",
      grammar: "Must",
      starter: "To stay healthy, people must...",
      example:
        "To stay healthy, people must exercise regularly, eat nutritious food, and sleep well.",
    },
    {
      week: 34,
      day: "Thu",
      question: "What do you have to wear to school?",
      grammar: "Have to",
      starter: "I have to wear...",
      example: "I have to wear my school uniform with proper shoes and socks.",
    },
    {
      week: 34,
      day: "Fri",
      question: "What must you do to make friends?",
      grammar: "Must",
      starter: "To make friends, you must...",
      example:
        "To make friends, you must be kind, be yourself, and show interest in others.",
    },
    {
      week: 35,
      day: "Mon",
      question: "What do you have to study for your next test?",
      grammar: "Have to",
      starter: "For my next test, I have to study...",
      example:
        "For my next test, I have to study grammar, vocabulary, and reading comprehension.",
    },
    {
      week: 35,
      day: "Tue",
      question: "What must drivers do to be safe on the road?",
      grammar: "Must",
      starter: "Drivers must...",
      example:
        "Drivers must follow traffic rules, wear seatbelts, and pay attention to the road.",
    },
    {
      week: 35,
      day: "Wed",
      question: "What do you have to do to improve your English?",
      grammar: "Have to",
      starter: "To improve my English, I have to...",
      example:
        "To improve my English, I have to practice speaking, read English books, and watch movies.",
    },
    {
      week: 35,
      day: "Thu",
      question: "What must you remember when using social media?",
      grammar: "Must",
      starter: "When using social media, I must remember to...",
      example:
        "When using social media, I must remember to be respectful and protect my privacy.",
    },
    {
      week: 35,
      day: "Fri",
      question: "What do you have to do to achieve your dreams?",
      grammar: "Have to",
      starter: "To achieve my dreams, I have to...",
      example:
        "To achieve my dreams, I have to work hard, never give up, and believe in myself.",
    },
    {
      week: 36,
      day: "Mon",
      question: "What must we do to help others in need?",
      grammar: "Must",
      starter: "We must...",
      example:
        "We must show kindness, offer help when we can, and donate to charity.",
    },
    {
      week: 36,
      day: "Tue",
      question: "What do you have to remember when visiting another country?",
      grammar: "Have to",
      starter: "When visiting another country, I have to remember to...",
      example:
        "When visiting another country, I have to remember to respect their culture and learn basic phrases.",
    },
    {
      week: 36,
      day: "Wed",
      question: "What must teachers do to be effective?",
      grammar: "Must",
      starter: "Teachers must...",
      example:
        "Teachers must be patient, explain clearly, and care about their students' success.",
    },
    {
      week: 36,
      day: "Thu",
      question: "What do you have to do to save money?",
      grammar: "Have to",
      starter: "To save money, I have to...",
      example:
        "To save money, I have to spend less on unnecessary things and put money aside regularly.",
    },
    {
      week: 36,
      day: "Fri",
      question: "What must we remember about the importance of education?",
      grammar: "Must",
      starter: "We must remember that education...",
      example:
        "We must remember that education opens doors to opportunities and helps us grow as people.",
    },
    {
      week: 37,
      day: "Mon",
      question: "Looking back at this year, what did you learn about yourself?",
      grammar: "Past Simple",
      starter: "This year, I learned that I...",
      example:
        "This year, I learned that I am stronger than I thought and can overcome challenges.",
    },
    {
      week: 37,
      day: "Tue",
      question: "What was your biggest achievement this year?",
      grammar: "Past Simple",
      starter: "My biggest achievement was...",
      example:
        "My biggest achievement was passing the Eiken test and improving my English speaking.",
    },
    {
      week: 37,
      day: "Wed",
      question: "What will you do differently next year?",
      grammar: "Future (will)",
      starter: "Next year, I will...",
      example:
        "Next year, I will study more consistently and participate more in class.",
    },
    {
      week: 37,
      day: "Thu",
      question: "What skill have you improved the most this year?",
      grammar: "Present Perfect",
      starter: "I have improved... the most.",
      example:
        "I have improved my teamwork skills the most through club activities.",
    },
    {
      week: 37,
      day: "Fri",
      question:
        "If you could change one thing about this year, what would it be?",
      grammar: "Second Conditional",
      starter: "If I could change one thing, I would...",
      example:
        "If I could change one thing, I would have studied harder in the first semester.",
    },
    {
      week: 38,
      day: "Mon",
      question: "What are you most grateful for from this school year?",
      grammar: "Present Simple",
      starter: "I am most grateful for...",
      example:
        "I am most grateful for my supportive friends and encouraging teachers.",
    },
    {
      week: 38,
      day: "Tue",
      question:
        "How have your study habits changed since the beginning of the year?",
      grammar: "Present Perfect",
      starter: "My study habits have changed by...",
      example:
        "My study habits have changed by becoming more organized and planning ahead.",
    },
    {
      week: 38,
      day: "Wed",
      question: "What goal are you going to set for next year?",
      grammar: "Going to",
      starter: "Next year, I am going to...",
      example:
        "Next year, I am going to join more school events and make new friends.",
    },
    {
      week: 38,
      day: "Thu",
      question: "What mistake did you learn from this year?",
      grammar: "Past Simple",
      starter: "I learned from the mistake of...",
      example:
        "I learned from the mistake of procrastinating and now I start homework earlier.",
    },
    {
      week: 38,
      day: "Fri",
      question: "How do you want to grow as a student next year?",
      grammar: "Want to",
      starter: "I want to grow by...",
      example:
        "I want to grow by asking more questions and not being afraid of making mistakes.",
    },
    {
      week: 39,
      day: "Mon",
      question: "What subject has become easier for you this year?",
      grammar: "Present Perfect",
      starter: "... has become easier because...",
      example:
        "Math has become easier because I practice regularly and ask for help when needed.",
    },
    {
      week: 39,
      day: "Tue",
      question: "What will you remember most about Grade 2?",
      grammar: "Future (will)",
      starter: "I will remember...",
      example:
        "I will remember the school trip, sports day, and all the fun times with my classmates.",
    },
    {
      week: 39,
      day: "Wed",
      question: "How can you help new students next year?",
      grammar: "Can",
      starter: "I can help new students by...",
      example:
        "I can help new students by showing them around, answering questions, and being friendly.",
    },
    {
      week: 39,
      day: "Thu",
      question: "What advice would you give to students entering Grade 2?",
      grammar: "Should",
      starter: "You should...",
      example:
        "You should manage your time well, make good friends, and enjoy learning new things.",
    },
    {
      week: 39,
      day: "Fri",
      question: "What are you looking forward to in Grade 3?",
      grammar: "Present Continuous (future)",
      starter: "I am looking forward to...",
      example:
        "I am looking forward to preparing for high school and learning more advanced English.",
    },
    {
      week: 40,
      day: "Mon",
      question: "What was the most challenging thing you did this year?",
      grammar: "Past Simple",
      starter: "The most challenging thing was...",
      example:
        "The most challenging thing was presenting in English in front of the class.",
    },
    {
      week: 40,
      day: "Tue",
      question: "How has your confidence grown this year?",
      grammar: "Present Perfect",
      starter: "My confidence has grown by...",
      example:
        "My confidence has grown by speaking more in class and trying new activities.",
    },
    {
      week: 40,
      day: "Wed",
      question: "What will you do this summer to prepare for Grade 3?",
      grammar: "Future (will)",
      starter: "This summer, I will...",
      example:
        "This summer, I will review Grade 2 material and start preparing for entrance exams.",
    },
    {
      week: 40,
      day: "Thu",
      question: "What friendship have you valued most this year?",
      grammar: "Present Perfect",
      starter: "I have valued... most because...",
      example:
        "I have valued my friendship with Yuki most because she always supports me.",
    },
    {
      week: 40,
      day: "Fri",
      question:
        "As Grade 2 ends, what is your message to yourself for next year?",
      grammar: "Imperative",
      starter: "My message is...",
      example:
        "My message is: work hard, stay positive, and believe in yourself. You can do it!",
    },
  ],
  "3": [
    // WEEKS 1-12
    {
      week: 1,
      day: "Mon",
      question: "Have you ever been to another country? Where have you been?",
      grammar: "Present Perfect",
      starter: "Yes, I have been to... / No, I have never been...",
      example:
        "No, I have never been to another country, but I want to visit America.",
    },
    {
      week: 1,
      day: "Tue",
      question:
        "Have you ever tried a food that you did not like? What was it?",
      grammar: "Present Perfect",
      starter: "Yes, I have tried... / No, I have never tried...",
      example: "Yes, I have tried natto. I did not like the smell.",
    },
    {
      week: 1,
      day: "Wed",
      question: "Have you ever met a famous person? Who was it?",
      grammar: "Present Perfect",
      starter: "Yes, I have met... / No, I have never met...",
      example: "Yes, I have met a famous baseball player.",
    },
    {
      week: 1,
      day: "Thu",
      question: "What is the most interesting thing you have ever done?",
      grammar: "Present Perfect",
      starter: "The most interesting thing I have done is...",
      example: "The most interesting thing I have done is climb Mount Fuji.",
    },
    {
      week: 1,
      day: "Fri",
      question: "Have you ever won any competitions or awards?",
      grammar: "Present Perfect",
      starter: "Yes, I have won... / No, I have never won...",
      example: "Yes, I have won a medal in a swim meet.",
    },
    {
      week: 2,
      day: "Mon",
      question: "How long have you studied English? Do you enjoy it?",
      grammar: "Present Perfect (duration)",
      starter: "I have studied English for...",
      example: "I have studied English for seven years.",
    },
    {
      week: 2,
      day: "Tue",
      question: "How long have you lived in your current house?",
      grammar: "Present Perfect (duration)",
      starter: "I have lived here for...",
      example: "I have lived here for ten years.",
    },
    {
      week: 2,
      day: "Wed",
      question: "How long have you known your best friend?",
      grammar: "Present Perfect (duration)",
      starter: "I have known my best friend for...",
      example: "I have known my best friend for six years.",
    },
    {
      week: 2,
      day: "Thu",
      question: "Have you ever changed schools? How many schools?",
      grammar: "Present Perfect",
      starter: "Yes, I have changed... / No, I have never changed...",
      example: "No, I have never changed schools.",
    },
    {
      week: 2,
      day: "Fri",
      question: "How long have your parents been married?",
      grammar: "Present Perfect (duration)",
      starter: "My parents have been married for...",
      example: "My parents have been married for 20 years.",
    },
    {
      week: 3,
      day: "Mon",
      question: "How has your English improved since Grade 1?",
      grammar: "Present Perfect",
      starter: "My English has improved... Since Grade 1, I...",
      example:
        "My English has improved a lot. Since Grade 1, I have learned many new words.",
    },
    {
      week: 3,
      day: "Tue",
      question: "What have you learned about yourself in junior high school?",
      grammar: "Present Perfect",
      starter: "I have learned that I...",
      example:
        "I have learned that I am good at helping others and solving problems.",
    },
    {
      week: 3,
      day: "Wed",
      question: "Have your interests changed since elementary school? How?",
      grammar: "Present Perfect",
      starter:
        "Yes, my interests have changed... / No, they have not changed...",
      example:
        "Yes, my interests have changed. I used to like only sports, but now I like science too.",
    },
    {
      week: 3,
      day: "Thu",
      question: "What skills have you developed in the past three years?",
      grammar: "Present Perfect",
      starter: "In the past three years, I have developed...",
      example: "In the past three years, I have developed better study habits.",
    },
    {
      week: 3,
      day: "Fri",
      question: "Has your personality changed? In what way?",
      grammar: "Present Perfect",
      starter: "Yes, my personality has changed... / No, it has not changed...",
      example: "Yes, my personality has changed. I have become more confident.",
    },
    {
      week: 4,
      day: "Mon",
      question: "What is something you have never tried but want to try?",
      grammar: "Present Perfect",
      starter: "I have never tried... but I want to try it because...",
      example:
        "I have never tried skydiving but I want to try it because it looks exciting.",
    },
    {
      week: 4,
      day: "Tue",
      question: "Have you ever regretted anything? What?",
      grammar: "Present Perfect",
      starter: "Yes, I have regretted... / No, I have never regretted...",
      example:
        "Yes, I have regretted not practicing piano more when I was younger.",
    },
    {
      week: 4,
      day: "Wed",
      question: "What place have you always wanted to visit?",
      grammar: "Present Perfect",
      starter: "I have always wanted to visit...",
      example:
        "I have always wanted to visit Paris because I love French culture.",
    },
    {
      week: 4,
      day: "Thu",
      question: "How many different sports have you tried? Which was best?",
      grammar: "Present Perfect",
      starter: "I have tried... sports. The best was...",
      example:
        "I have tried five sports. The best was basketball because I made good friends.",
    },
    {
      week: 4,
      day: "Fri",
      question: "Have you ever helped someone in a big way? What did you do?",
      grammar: "Present Perfect",
      starter: "Yes, I have helped... / No, I have never...",
      example: "Yes, I have helped my friend study and they passed their test.",
    },
    {
      week: 5,
      day: "Mon",
      question: "What have you been doing after school lately?",
      grammar: "Present Perfect Continuous",
      starter: "Lately, I have been...",
      example:
        "Lately, I have been staying after school for club activities and studying.",
    },
    {
      week: 5,
      day: "Tue",
      question: "Have you been sleeping well recently? Why or why not?",
      grammar: "Present Perfect Continuous",
      starter: "Yes, I have been sleeping... / No, I have not been sleeping...",
      example:
        "No, I have not been sleeping well because I have too much homework.",
    },
    {
      week: 5,
      day: "Wed",
      question: "What subject have you been studying the most this month?",
      grammar: "Present Perfect Continuous",
      starter: "This month, I have been studying... the most.",
      example: "This month, I have been studying math the most.",
    },
    {
      week: 5,
      day: "Thu",
      question: "Have you been exercising regularly? What have you been doing?",
      grammar: "Present Perfect Continuous",
      starter: "Yes, I have been exercising... / No, I have not been...",
      example:
        "Yes, I have been exercising. I have been running every morning.",
    },
    {
      week: 5,
      day: "Fri",
      question: "What have you been watching on TV or online lately?",
      grammar: "Present Perfect Continuous",
      starter: "Lately, I have been watching...",
      example:
        "Lately, I have been watching a Korean drama about high school students.",
    },
    {
      week: 6,
      day: "Mon",
      question: "What have you been practicing to get better at?",
      grammar: "Present Perfect Continuous",
      starter: "I have been practicing... to get better.",
      example:
        "I have been practicing basketball shots every day to improve my accuracy.",
    },
    {
      week: 6,
      day: "Tue",
      question:
        "How long have you been learning your instrument? Are you improving?",
      grammar: "Present Perfect Continuous",
      starter: "I have been learning... for...",
      example:
        "I have been learning piano for five years. Yes, I am improving slowly.",
    },
    {
      week: 6,
      day: "Wed",
      question:
        "Have you been working on any projects? What have you been creating?",
      grammar: "Present Perfect Continuous",
      starter: "Yes, I have been working on... / No, I have not been...",
      example:
        "Yes, I have been working on a science project about solar energy.",
    },
    {
      week: 6,
      day: "Thu",
      question: "What have you been trying to improve about yourself?",
      grammar: "Present Perfect Continuous",
      starter: "I have been trying to improve...",
      example:
        "I have been trying to improve my time management and organization skills.",
    },
    {
      week: 6,
      day: "Fri",
      question: "Have you been reading any books? What have you been reading?",
      grammar: "Present Perfect Continuous",
      starter: "Yes, I have been reading... / No, I have not been...",
      example:
        "Yes, I have been reading a fantasy series about dragons and magic.",
    },
    {
      week: 7,
      day: "Mon",
      question: "What problem have you been trying to solve?",
      grammar: "Present Perfect Continuous",
      starter: "I have been trying to solve...",
      example:
        "I have been trying to solve how to balance club activities and study time.",
    },
    {
      week: 7,
      day: "Tue",
      question: "Have you been having any difficulties with your studies?",
      grammar: "Present Perfect Continuous",
      starter: "Yes, I have been having... / No, I have not been...",
      example: "Yes, I have been having difficulties with English grammar.",
    },
    {
      week: 7,
      day: "Wed",
      question: "What have you been worrying about lately?",
      grammar: "Present Perfect Continuous",
      starter: "Lately, I have been worrying about...",
      example:
        "Lately, I have been worrying about entrance exams and my future.",
    },
    {
      week: 7,
      day: "Thu",
      question: "Have you been getting enough rest? Why or why not?",
      grammar: "Present Perfect Continuous",
      starter: "Yes, I have been getting... / No, I have not been getting...",
      example:
        "No, I have not been getting enough rest because I stay up late studying.",
    },
    {
      week: 7,
      day: "Fri",
      question: "What have you been struggling with in your life?",
      grammar: "Present Perfect Continuous",
      starter: "I have been struggling with...",
      example: "I have been struggling with maintaining friendships.",
    },
    {
      week: 8,
      day: "Mon",
      question: "What has been making you happy these days?",
      grammar: "Present Perfect Continuous",
      starter: "... has been making me happy.",
      example:
        "Spending time with my friends has been making me happy these days.",
    },
    {
      week: 8,
      day: "Tue",
      question: "How long have you been attending this school?",
      grammar: "Present Perfect Continuous",
      starter: "I have been attending... for...",
      example:
        "I have been attending this school for three years since first grade.",
    },
    {
      week: 8,
      day: "Wed",
      question: "What have you been doing to prepare for high school?",
      grammar: "Present Perfect Continuous",
      starter: "I have been... to prepare.",
      example:
        "I have been studying hard and researching different high schools to prepare.",
    },
    {
      week: 8,
      day: "Thu",
      question: "Have you been keeping any secrets? What kind?",
      grammar: "Present Perfect Continuous",
      starter: "Yes, I have been keeping... / No, I have not been...",
      example:
        "Yes, I have been keeping a surprise birthday party secret for my friend.",
    },
    {
      week: 8,
      day: "Fri",
      question: "What have you been dreaming about lately?",
      grammar: "Present Perfect Continuous",
      starter: "Lately, I have been dreaming about...",
      example:
        "Lately, I have been dreaming about traveling to different countries.",
    },
    {
      week: 9,
      day: "Mon",
      question: "What is the best way to learn English?",
      grammar: "Infinitives",
      starter: "The best way is to...",
      example: "The best way to learn English is to speak with ALTs every day.",
    },
    {
      week: 9,
      day: "Tue",
      question: "What should we do to protect the environment?",
      grammar: "Infinitives",
      starter: "We should... to protect...",
      example: "We should recycle plastic to protect our oceans.",
    },
    {
      week: 9,
      day: "Wed",
      question: "What do you want to be in the future?",
      grammar: "Infinitives",
      starter: "I want to be a...",
      example: "I want to be a pilot to travel all around the world.",
    },
    {
      week: 9,
      day: "Thu",
      question: "What do you like to do on rainy days?",
      grammar: "Infinitives",
      starter: "I like to...",
      example: "I like to stay home and read books on rainy days.",
    },
    {
      week: 9,
      day: "Fri",
      question: "What is something you need to do today?",
      grammar: "Infinitives",
      starter: "Today, I need to...",
      example: "Today, I need to finish my English project for next week.",
    },
    {
      week: 10,
      day: "Mon",
      question: "Who is someone who has inspired you?",
      grammar: "Relative Clauses",
      starter: "The person who inspired me is...",
      example:
        "The person who inspired me is my grandfather because he worked hard.",
    },
    {
      week: 10,
      day: "Tue",
      question: "What is a movie that makes you happy?",
      grammar: "Relative Clauses",
      starter: "A movie that makes me happy is...",
      example:
        "A movie that makes me happy is Totoro because it is very peaceful.",
    },
    {
      week: 10,
      day: "Wed",
      question: "What is a place that you want to visit again?",
      grammar: "Relative Clauses",
      starter: "A place that I want to visit is...",
      example:
        "A place that I want to visit again is Okinawa because the sea is beautiful.",
    },
    {
      week: 10,
      day: "Thu",
      question: "Who is a teacher that you will never forget?",
      grammar: "Relative Clauses",
      starter: "A teacher that I will never forget is...",
      example:
        "A teacher that I will never forget is my elementary school teacher.",
    },
    {
      week: 10,
      day: "Fri",
      question: "What is a food that you cannot live without?",
      grammar: "Relative Clauses",
      starter: "A food that I cannot live without is...",
      example:
        "A food that I cannot live without is rice because I eat it every day.",
    },
    {
      week: 11,
      day: "Mon",
      question: "Can you tell me what your dream job is?",
      grammar: "Indirect Questions",
      starter: "My dream job is...",
      example: "I can tell you that my dream job is being a game developer.",
    },
    {
      week: 11,
      day: "Tue",
      question: "Do you know where your best friend is now?",
      grammar: "Indirect Questions",
      starter: "I think they are...",
      example:
        "I don't know exactly where they are, but they are probably at home.",
    },
    {
      week: 11,
      day: "Wed",
      question: "Can you explain why you like your hobby?",
      grammar: "Indirect Questions",
      starter: "I like it because...",
      example: "I can explain that I like my hobby because it helps me relax.",
    },
    {
      week: 11,
      day: "Thu",
      question: "Do you know how to use this machine?",
      grammar: "Indirect Questions",
      starter: "Yes, you should...",
      example: "Yes, I know how to use it. You just need to press this button.",
    },
    {
      week: 11,
      day: "Fri",
      question: "Can you tell me when your birthday is?",
      grammar: "Indirect Questions",
      starter: "My birthday is on...",
      example: "My birthday is on August 15th. It's during summer vacation.",
    },
    {
      week: 12,
      day: "Mon",
      question: "Does your mother let you stay up late?",
      grammar: "Causative Verbs",
      starter: "Yes, she lets me... / No, she doesn't...",
      example: "No, she doesn't let me stay up late on school nights.",
    },
    {
      week: 12,
      day: "Tue",
      question: "What makes you feel excited?",
      grammar: "Causative Verbs",
      starter: "... makes me feel excited.",
      example: "Playing sports with my friends makes me feel very excited.",
    },
    {
      week: 12,
      day: "Wed",
      question: "Does your teacher help you understand English?",
      grammar: "Causative Verbs",
      starter: "Yes, my teacher helps me...",
      example: "Yes, my teacher helps me understand difficult grammar points.",
    },
    {
      week: 12,
      day: "Thu",
      question: "What makes your parents happy?",
      grammar: "Causative Verbs",
      starter: "... makes them happy.",
      example: "Getting good grades on my tests always makes my parents happy.",
    },
    {
      week: 12,
      day: "Fri",
      question: "Do your friends make you laugh?",
      grammar: "Causative Verbs",
      starter: "Yes, they make me...",
      example: "Yes, my friends always make me laugh with their funny jokes.",
    },
    // WEEKS 13-24
    {
      week: 13,
      day: "Mon",
      question: "Have you finished your homework yet?",
      grammar: "Present Perfect (Completion)",
      starter: "Yes, I have already... / No, I haven't... yet.",
      example: "Yes, I have already finished my English homework.",
    },
    {
      week: 13,
      day: "Tue",
      question: "Have you ever seen a movie that moved you?",
      grammar: "Present Perfect (Experience)",
      starter: "Yes, I have seen... that moved me.",
      example: "Yes, I have seen 'Titanic' and it moved me very much.",
    },
    {
      week: 13,
      day: "Wed",
      question: "How long have you been studying for the entrance exams?",
      grammar: "Present Perfect Continuous",
      starter: "I have been studying for... since...",
      example: "I have been studying for the exams since last summer.",
    },
    {
      week: 13,
      day: "Thu",
      question: "Has your friend ever been late for school?",
      grammar: "Present Perfect (Experience)",
      starter: "Yes, they have... / No, they haven't...",
      example: "Yes, my friend has been late twice this month.",
    },
    {
      week: 13,
      day: "Fri",
      question: "Have you ever eaten something very strange?",
      grammar: "Present Perfect (Experience)",
      starter: "Yes, I have eaten... / No, I haven't.",
      example:
        "Yes, I have eaten kangaroo meat when I was in elementary school.",
    },
    {
      week: 14,
      day: "Mon",
      question: "Was your house built before you were born?",
      grammar: "Passive Voice",
      starter: "Yes, it was built... / No, it wasn't.",
      example: "Yes, it was built ten years before I was born.",
    },
    {
      week: 14,
      day: "Tue",
      question: "Are many things in your room made in China?",
      grammar: "Passive Voice",
      starter: "Yes, many things are... / No, they aren't.",
      example: "Yes, many things like my desk and chair are made in China.",
    },
    {
      week: 14,
      day: "Wed",
      question: "When was the last time you were scolded by your parents?",
      grammar: "Passive Voice",
      starter: "I was scolded when...",
      example: "I was scolded when I forgot to do my chores last night.",
    },
    {
      week: 14,
      day: "Thu",
      question: "Is English used in your daily life outside of school?",
      grammar: "Passive Voice",
      starter: "Yes, it is... / No, it isn't.",
      example: "No, it isn't really used in my daily life yet.",
    },
    {
      week: 14,
      day: "Fri",
      question: "Was your favorite book written by a Japanese author?",
      grammar: "Passive Voice",
      starter: "Yes, it was written by... / No, it was written by...",
      example: "Yes, it was written by Haruki Murakami. I love his stories.",
    },
    {
      week: 15,
      day: "Mon",
      question: "What is a movie that was filmed in Japan?",
      grammar: "Passive Voice",
      starter: "A movie that was filmed in Japan is...",
      example: "A movie that was filmed in Japan is 'Your Name'.",
    },
    {
      week: 15,
      day: "Tue",
      question: "Are any languages spoken in your home besides Japanese?",
      grammar: "Passive Voice",
      starter: "Yes, ... is spoken. / No, only Japanese is spoken.",
      example: "No, only Japanese is spoken in my home.",
    },
    {
      week: 15,
      day: "Wed",
      question: "Was your bicycle stolen before?",
      grammar: "Passive Voice",
      starter: "Yes, it was... / No, it wasn't.",
      example: "No, it hasn't been stolen. I always lock it.",
    },
    {
      week: 15,
      day: "Thu",
      question: "Is this classroom cleaned by students every day?",
      grammar: "Passive Voice",
      starter: "Yes, it is cleaned by...",
      example: "Yes, it is cleaned by us after school every day.",
    },
    {
      week: 15,
      day: "Fri",
      question: "Was this letter written in English?",
      grammar: "Passive Voice",
      starter: "Yes, it was written in...",
      example:
        "Yes, this letter was written in English by my friend in America.",
    },
    {
      week: 16,
      day: "Mon",
      question: "Do you know who that man standing over there is?",
      grammar: "Participial Phrases",
      starter: "The man standing over there is...",
      example: "The man standing over there is our principal, Mr. Sato.",
    },
    {
      week: 16,
      day: "Tue",
      question: "What is the name of the girl wearing the red hat?",
      grammar: "Participial Phrases",
      starter: "The girl wearing the red hat is...",
      example: "The girl wearing the red hat is my cousin, Hana.",
    },
    {
      week: 16,
      day: "Wed",
      question: "Do you have a picture taken by yourself?",
      grammar: "Participial Phrases",
      starter: "Yes, I have a picture taken by...",
      example: "Yes, I have a picture taken by me when I went to Kyoto.",
    },
    {
      week: 16,
      day: "Thu",
      question: "Is that a car made in Germany?",
      grammar: "Participial Phrases",
      starter: "Yes, it's a car made in...",
      example: "Yes, that is a car made in Germany. It looks very cool.",
    },
    {
      week: 16,
      day: "Fri",
      question: "Who is the boy talking to the teacher?",
      grammar: "Participial Phrases",
      starter: "The boy talking to the teacher is...",
      example: "The boy talking to the teacher is Takeshi, my classmate.",
    },
    {
      week: 17,
      day: "Mon",
      question: "What is the book written by your favorite author?",
      grammar: "Participial Phrases",
      starter: "The book written by... is...",
      example: "The book written by Natsume Soseki is 'Kokoro'.",
    },
    {
      week: 17,
      day: "Tue",
      question: "Do you like songs sung by American singers?",
      grammar: "Participial Phrases",
      starter: "Yes, I like songs sung by... / No, I don't.",
      example: "Yes, I like songs sung by Taylor Swift very much.",
    },
    {
      week: 17,
      day: "Wed",
      question: "Who is the student sitting next to you?",
      grammar: "Participial Phrases",
      starter: "The student sitting next to me is...",
      example:
        "The student sitting next to me is Ken. He is very good at math.",
    },
    {
      week: 17,
      day: "Thu",
      question: "Is that a bag bought in France?",
      grammar: "Participial Phrases",
      starter: "Yes, it's a bag bought in... / No, it was bought in...",
      example: "No, it was bought in a department store in Tokyo.",
    },
    {
      week: 17,
      day: "Fri",
      question: "What is the language used in this movie?",
      grammar: "Participial Phrases",
      starter: "The language used in this movie is...",
      example: "The language used in this movie is English and French.",
    },
    {
      week: 18,
      day: "Mon",
      question: "If you were a bird, where would you fly?",
      grammar: "Subjunctive Mood",
      starter: "If I were a bird, I would fly to...",
      example: "If I were a bird, I would fly to Hawaii to see the ocean.",
    },
    {
      week: 18,
      day: "Tue",
      question: "If you had a lot of money, what would you buy?",
      grammar: "Subjunctive Mood",
      starter: "If I had a lot of money, I would buy...",
      example:
        "If I had a lot of money, I would buy a big house for my parents.",
    },
    {
      week: 18,
      day: "Wed",
      question: "If you could speak five languages, what would you do?",
      grammar: "Subjunctive Mood",
      starter: "If I could speak... I would...",
      example:
        "If I could speak five languages, I would travel around the world.",
    },
    {
      week: 18,
      day: "Thu",
      question: "What would you do if you saw a ghost?",
      grammar: "Subjunctive Mood",
      starter: "If I saw a ghost, I would...",
      example: "If I saw a ghost, I would run away as fast as possible!",
    },
    {
      week: 18,
      day: "Fri",
      question: "If you were the prime minister, what would you change?",
      grammar: "Subjunctive Mood",
      starter: "If I were the prime minister, I would change...",
      example: "If I were the prime minister, I would change the school hours.",
    },
    {
      week: 19,
      day: "Mon",
      question: "I wish I could play the piano well. What do you wish?",
      grammar: "I wish I could...",
      starter: "I wish I could...",
      example: "I wish I could play basketball as well as my brother.",
    },
    {
      week: 19,
      day: "Tue",
      question: "Do you wish you had more free time?",
      grammar: "I wish I had...",
      starter: "Yes, I wish I had... because...",
      example: "Yes, I wish I had more free time to play video games.",
    },
    {
      week: 19,
      day: "Wed",
      question: "Do you wish it were summer now?",
      grammar: "I wish it were...",
      starter: "Yes, I wish it were... / No, I like winter.",
      example: "Yes, I wish it were summer because I love the heat.",
    },
    {
      week: 19,
      day: "Thu",
      question: "I wish I were taller. Do you wish that too?",
      grammar: "I wish I were...",
      starter: "Yes, I wish I were... / No, I'm okay.",
      example: "Yes, I wish I were taller to reach high things.",
    },
    {
      week: 19,
      day: "Fri",
      question: "What do you wish you knew how to do?",
      grammar: "I wish I knew how to...",
      starter: "I wish I knew how to...",
      example: "I wish I knew how to cook delicious Italian food.",
    },
    {
      week: 20,
      day: "Mon",
      question: "What is something that makes you feel proud?",
      grammar: "Relative Clauses",
      starter: "Something that makes me feel proud is...",
      example:
        "Something that makes me feel proud is my hard work in the soccer club.",
    },
    {
      week: 20,
      day: "Tue",
      question: "Who is the person that you respect the most?",
      grammar: "Relative Clauses",
      starter: "The person that I respect the most is...",
      example: "The person that I respect the most is my mother.",
    },
    {
      week: 20,
      day: "Wed",
      question: "What is a city that you want to live in?",
      grammar: "Relative Clauses",
      starter: "A city that I want to live in is...",
      example:
        "A city that I want to live in is London because I like history.",
    },
    {
      week: 20,
      day: "Thu",
      question: "What is a hobby that you have had for a long time?",
      grammar: "Relative Clauses",
      starter: "A hobby that I have had for a long time is...",
      example: "A hobby that I have had for a long time is collecting stamps.",
    },
    {
      week: 20,
      day: "Fri",
      question: "Who is a friend that always helps you?",
      grammar: "Relative Clauses",
      starter: "A friend that always helps me is...",
      example: "A friend that always helps me is Kenta. He is very kind.",
    },
    {
      week: 21,
      day: "Mon",
      question: "Do you have any books that were given by your parents?",
      grammar: "Relative Clauses (Passive)",
      starter: "Yes, I have... / No, I don't.",
      example: "Yes, I have a science book that was given by my father.",
    },
    {
      week: 21,
      day: "Tue",
      question: "Is there a movie that was directed by a famous director?",
      grammar: "Relative Clauses (Passive)",
      starter: "Yes, there is... directed by...",
      example:
        "Yes, 'Spirited Away' is a movie that was directed by Hayao Miyazaki.",
    },
    {
      week: 21,
      day: "Wed",
      question: "What is a present that was received recently?",
      grammar: "Relative Clauses (Passive)",
      starter: "A present that was received recently is...",
      example:
        "A present that was received recently is a new watch for my birthday.",
    },
    {
      week: 21,
      day: "Thu",
      question: "Are there any rules that are followed in your school?",
      grammar: "Relative Clauses (Passive)",
      starter: "Yes, there are many rules that are...",
      example:
        "Yes, there are many rules that are followed, like wearing uniforms.",
    },
    {
      week: 21,
      day: "Fri",
      question: "Who is the singer that is loved by many people?",
      grammar: "Relative Clauses",
      starter: "The singer that is loved by many people is...",
      example: "The singer that is loved by many people is Kenshi Yonezu.",
    },
    {
      week: 22,
      day: "Mon",
      question: "Do you know the boy who is talking to the principal?",
      grammar: "Relative Clauses (who)",
      starter: "Yes, the boy who is... is...",
      example:
        "Yes, the boy who is talking to the principal is my friend, Taro.",
    },
    {
      week: 22,
      day: "Tue",
      question: "Who is the teacher who teaches you English?",
      grammar: "Relative Clauses (who)",
      starter: "The teacher who teaches us English is...",
      example:
        "The teacher who teaches us English is Ms. White. She's from Canada.",
    },
    {
      week: 22,
      day: "Wed",
      question: "Do you have a friend who can speak three languages?",
      grammar: "Relative Clauses (who)",
      starter: "Yes, I have a friend who... / No, I don't.",
      example:
        "Yes, I have a friend who can speak Japanese, English, and Chinese.",
    },
    {
      week: 22,
      day: "Thu",
      question: "Who is the girl who won the speech contest?",
      grammar: "Relative Clauses (who)",
      starter: "The girl who won the contest is...",
      example: "The girl who won the speech contest is Yui from class 3-A.",
    },
    {
      week: 22,
      day: "Fri",
      question: "Do you know the woman who wrote this book?",
      grammar: "Relative Clauses (who)",
      starter: "Yes, the woman who... is...",
      example: "Yes, the woman who wrote this book is J.K. Rowling.",
    },
    {
      week: 23,
      day: "Mon",
      question: "What is a car which is made in Germany?",
      grammar: "Relative Clauses (which)",
      starter: "A car which is made in Germany is...",
      example: "A car which is made in Germany is a BMW or a Mercedes.",
    },
    {
      week: 23,
      day: "Tue",
      question: "Do you have any animals which are kept at home?",
      grammar: "Relative Clauses (which)",
      starter: "Yes, I have a... which is... / No, I don't.",
      example: "Yes, I have a dog which is very small and cute.",
    },
    {
      week: 23,
      day: "Wed",
      question: "What is a subject which is difficult for you?",
      grammar: "Relative Clauses (which)",
      starter: "A subject which is difficult for me is...",
      example:
        "A subject which is difficult for me is Science because of the formulas.",
    },
    {
      week: 23,
      day: "Thu",
      question: "Is there a place which is famous for its beautiful view?",
      grammar: "Relative Clauses (which)",
      starter: "Yes, there is... which is...",
      example:
        "Yes, Kyoto is a place which is famous for its beautiful temples.",
    },
    {
      week: 23,
      day: "Fri",
      question: "What is a food which is eaten during New Year?",
      grammar: "Relative Clauses (which)",
      starter: "A food which is eaten during New Year is...",
      example: "A food which is eaten during New Year is Osechi-ryori.",
    },
    {
      week: 24,
      day: "Mon",
      question: "Do you know what time the next train leaves?",
      grammar: "Indirect Questions",
      starter: "I think it leaves at...",
      example:
        "I don't know exactly, but I think the next train leaves at 4:15.",
    },
    {
      week: 24,
      day: "Tue",
      question: "Can you tell me where the library is?",
      grammar: "Indirect Questions",
      starter: "The library is...",
      example:
        "Can you tell me where the library is? It's on the second floor.",
    },
    {
      week: 24,
      day: "Wed",
      question: "Do you know how to get to the station?",
      grammar: "Indirect Questions",
      starter: "Yes, you should...",
      example:
        "Yes, I know how to get there. You should turn left at the corner.",
    },
    {
      week: 24,
      day: "Thu",
      question: "Can you explain why you were late?",
      grammar: "Indirect Questions",
      starter: "I was late because...",
      example:
        "I can explain why I was late. I missed my usual bus this morning.",
    },
    {
      week: 24,
      day: "Fri",
      question: "Do you know who that person is?",
      grammar: "Indirect Questions",
      starter: "That person is...",
      example: "I don't know who that person is, but he looks like a teacher.",
    },
    // WEEKS 25-40
    {
      week: 25,
      day: "Mon",
      question: "How are you preparing for your entrance exams?",
      grammar: "Present Perfect Continuous",
      starter: "I have been...ing...",
      example: "I have been studying in the library every day until 6 PM.",
    },
    {
      week: 25,
      day: "Tue",
      question: "What is the most memorable moment of your JHS life?",
      grammar: "Superlative",
      starter: "The most memorable moment was...",
      example: "The most memorable moment was the school trip to Kyoto.",
    },
    {
      week: 25,
      day: "Wed",
      question: "Who is the teacher that helped you the most?",
      grammar: "Relative Clause",
      starter: "The teacher that helped me the most is...",
      example:
        "The teacher that helped me the most is Mr. Suzuki, my math teacher.",
    },
    {
      week: 25,
      day: "Thu",
      question:
        "If you could go back to Grade 1, what would you do differently?",
      grammar: "Subjunctive",
      starter: "If I could go back, I would...",
      example:
        "If I could go back, I would join more clubs and try everything.",
    },
    {
      week: 25,
      day: "Fri",
      question: "What is your message to the junior students?",
      grammar: "Imperative/Suggestion",
      starter: "My message is...",
      example:
        "My message is: enjoy every day and don't be afraid of mistakes!",
    },
    {
      week: 26,
      day: "Mon",
      question: "What is the thing that you will miss most about this school?",
      grammar: "Relative Clause",
      starter: "I will miss...",
      example: "I will miss eating lunch with my friends in the classroom.",
    },
    {
      week: 26,
      day: "Tue",
      question: "Do you know what you want to study in high school?",
      grammar: "Indirect Question",
      starter: "I think I want to study...",
      example:
        "Yes, I know that I want to study international business in high school.",
    },
    {
      week: 26,
      day: "Wed",
      question: "What is a dream that you want to achieve in ten years?",
      grammar: "Relative Clause",
      starter: "A dream that I want to achieve is...",
      example:
        "A dream that I want to achieve is working as an architect in Europe.",
    },
    {
      week: 26,
      day: "Thu",
      question: "How has this school made you a better person?",
      grammar: "Make + Obj + Noun/Adj",
      starter: "This school has made me...",
      example:
        "This school has made me a more confident and responsible person.",
    },
    {
      week: 26,
      day: "Fri",
      question: "Where do you want to go for your graduation trip?",
      grammar: "Want to",
      starter: "I want to go to...",
      example: "I want to go to Universal Studios Japan with my best friends.",
    },
    // WEEKS 26-40 - GRADE 3 CONTINUATION
    {
      week: 26,
      day: "Mon",
      question:
        "If you lived in a different country, where would you live? Why?",
      grammar: "Second Conditional",
      starter: "If I lived in a different country, I would live in...",
      example:
        "If I lived in a different country, I would live in Canada because it is beautiful and multicultural.",
    },
    {
      week: 26,
      day: "Tue",
      question: "If you were an animal, what animal would you be? Why?",
      grammar: "Second Conditional",
      starter: "If I were an animal, I would be a...",
      example:
        "If I were an animal, I would be a dolphin because they are intelligent and live in the ocean.",
    },
    {
      week: 26,
      day: "Wed",
      question: "If you had a time machine, what time period would you visit?",
      grammar: "Second Conditional",
      starter: "If I had a time machine, I would visit...",
      example:
        "If I had a time machine, I would visit the Edo period to see what life was like for samurai.",
    },
    {
      week: 26,
      day: "Thu",
      question: "If you were the opposite gender for a day, what would you do?",
      grammar: "Second Conditional",
      starter: "If I were the opposite gender, I would...",
      example:
        "If I were the opposite gender, I would try to understand different perspectives and experiences.",
    },
    {
      week: 26,
      day: "Fri",
      question: "If you could live in any time period, which would you choose?",
      grammar: "Second Conditional",
      starter: "If I could live in... I would choose...",
      example:
        "If I could live in any time period, I would choose the future to see advanced technology.",
    },
    {
      week: 27,
      day: "Mon",
      question: "If you were a teacher, what subject would you teach? How?",
      grammar: "Second Conditional",
      starter: "If I were a teacher, I would teach...",
      example:
        "If I were a teacher, I would teach English through games and conversation.",
    },
    {
      week: 27,
      day: "Tue",
      question:
        "If you owned a restaurant, what kind would it be? What would you serve?",
      grammar: "Second Conditional",
      starter: "If I owned a restaurant, it would be...",
      example:
        "If I owned a restaurant, it would be a ramen shop serving many different flavors.",
    },
    {
      week: 27,
      day: "Wed",
      question:
        "If you were the principal of this school, what would you change?",
      grammar: "Second Conditional",
      starter: "If I were the principal, I would change...",
      example:
        "If I were the principal, I would make lunch break longer and add more clubs.",
    },
    {
      week: 27,
      day: "Thu",
      question: "If you could be any age right now, what age would you be?",
      grammar: "Second Conditional",
      starter: "If I could be any age, I would be...",
      example:
        "If I could be any age, I would be 20 because you have freedom but not too much responsibility.",
    },
    {
      week: 27,
      day: "Fri",
      question: "If you lived alone, what would your daily life be like?",
      grammar: "Second Conditional",
      starter: "If I lived alone, I would...",
      example:
        "If I lived alone, I would have more freedom but I would miss my family.",
    },
    {
      week: 28,
      day: "Mon",
      question:
        "If you could meet anyone in history, who would you meet? What would you ask?",
      grammar: "Second Conditional",
      starter: "If I could meet..., I would meet... I would ask...",
      example:
        "If I could meet anyone, I would meet Albert Einstein. I would ask him how he thought of his theories.",
    },
    {
      week: 28,
      day: "Tue",
      question: "If you could have dinner with any celebrity, who would it be?",
      grammar: "Second Conditional",
      starter: "If I could have dinner with..., I would choose...",
      example:
        "If I could have dinner with a celebrity, I would choose BTS because I love their music.",
    },
    {
      week: 28,
      day: "Wed",
      question: "If you could train with any athlete, who would you choose?",
      grammar: "Second Conditional",
      starter: "If I could train with..., I would choose...",
      example:
        "If I could train with an athlete, I would choose Naomi Osaka to learn mental strength.",
    },
    {
      week: 28,
      day: "Thu",
      question: "If you could learn from any expert, what would you learn?",
      grammar: "Second Conditional",
      starter: "If I could learn from an expert, I would learn...",
      example:
        "If I could learn from an expert, I would learn cooking from a famous chef.",
    },
    {
      week: 28,
      day: "Fri",
      question: "If you could attend any event in the world, what would it be?",
      grammar: "Second Conditional",
      starter: "If I could attend any event, I would go to...",
      example:
        "If I could attend any event, I would go to the Olympics to see the best athletes.",
    },
    {
      week: 29,
      day: "Mon",
      question:
        "If you could be in any movie or TV show, which would you choose?",
      grammar: "Second Conditional",
      starter: "If I could be in..., I would choose...",
      example:
        "If I could be in a movie, I would choose Harry Potter because magic looks fun.",
    },
    {
      week: 29,
      day: "Tue",
      question: "If you could join any band or music group, which would it be?",
      grammar: "Second Conditional",
      starter: "If I could join..., I would join...",
      example:
        "If I could join a music group, I would join ONE OK ROCK because their energy is amazing.",
    },
    {
      week: 29,
      day: "Wed",
      question: "If you could work for any company, which would you choose?",
      grammar: "Second Conditional",
      starter: "If I could work for..., I would choose...",
      example:
        "If I could work for any company, I would choose Nintendo because I love video games.",
    },
    {
      week: 29,
      day: "Thu",
      question: "If you could study at any university, where would you go?",
      grammar: "Second Conditional",
      starter: "If I could study at..., I would go to...",
      example:
        "If I could study anywhere, I would go to Oxford because it is prestigious.",
    },
    {
      week: 29,
      day: "Fri",
      question:
        "If you could collaborate with anyone on a project, who would it be?",
      grammar: "Second Conditional",
      starter: "If I could collaborate with..., I would choose...",
      example:
        "If I could collaborate with anyone, I would choose a famous YouTuber to learn video editing.",
    },
    {
      week: 30,
      day: "Mon",
      question: "If you had unlimited money, what would you do with it?",
      grammar: "Second Conditional",
      starter: "If I had unlimited money, I would...",
      example:
        "If I had unlimited money, I would travel the world and help poor communities.",
    },
    {
      week: 30,
      day: "Tue",
      question:
        "If you could change one thing about the world, what would it be?",
      grammar: "Second Conditional",
      starter: "If I could change one thing, I would change...",
      example:
        "If I could change one thing, I would eliminate poverty so everyone has enough food.",
    },
    {
      week: 30,
      day: "Wed",
      question: "If you could have any job in the world, what would it be?",
      grammar: "Second Conditional",
      starter: "If I could have any job, I would be a...",
      example:
        "If I could have any job, I would be a video game designer to create fun experiences.",
    },
    {
      week: 30,
      day: "Thu",
      question: "If you won a million dollars, what would you do?",
      grammar: "Second Conditional",
      starter: "If I won a million dollars, I would...",
      example:
        "If I won a million dollars, I would save half, give some to my parents, and travel.",
    },
    {
      week: 30,
      day: "Fri",
      question: "If you could change your past, what would you do differently?",
      grammar: "Second Conditional",
      starter: "If I could change my past, I would...",
      example:
        "If I could change my past, I would study harder in elementary school to build better habits.",
    },
    {
      week: 31,
      day: "Mon",
      question: "If you could master any skill instantly, what would it be?",
      grammar: "Second Conditional",
      starter: "If I could master any skill, I would master...",
      example:
        "If I could master any skill, I would master playing piano to perform for others.",
    },
    {
      week: 31,
      day: "Tue",
      question:
        "If you could make one wish come true, what would you wish for?",
      grammar: "Second Conditional",
      starter: "If I could make one wish, I would wish for...",
      example: "If I could make one wish, I would wish for world peace.",
    },
    {
      week: 31,
      day: "Wed",
      question: "If you could have any pet, what would you have?",
      grammar: "Second Conditional",
      starter: "If I could have any pet, I would have a...",
      example:
        "If I could have any pet, I would have a penguin because they are cute and funny.",
    },
    {
      week: 31,
      day: "Thu",
      question: "If you could live anywhere, where would your dream home be?",
      grammar: "Second Conditional",
      starter: "If I could live anywhere, my dream home would be...",
      example:
        "If I could live anywhere, my dream home would be by the beach in Hawaii.",
    },
    {
      week: 31,
      day: "Fri",
      question:
        "If you could give advice to your younger self, what would you say?",
      grammar: "Second Conditional",
      starter: "If I could give advice to my younger self, I would say...",
      example:
        "If I could give advice to my younger self, I would say do not worry so much and enjoy life.",
    },
    {
      week: 32,
      day: "Mon",
      question:
        "I wish I could speak English perfectly. What do you wish you could do?",
      grammar: "Wish Clause",
      starter: "I wish I could...",
      example: "I wish I could play guitar because music is beautiful.",
    },
    {
      week: 32,
      day: "Tue",
      question: "I wish I had more free time. What do you wish you had?",
      grammar: "Wish Clause",
      starter: "I wish I had...",
      example: "I wish I had a bigger room to study and relax in.",
    },
    {
      week: 32,
      day: "Wed",
      question: "I wish I were taller. What do you wish about yourself?",
      grammar: "Wish Clause",
      starter: "I wish I were...",
      example: "I wish I were more confident when speaking in front of people.",
    },
    {
      week: 32,
      day: "Thu",
      question: "I wish I had studied harder last year. What do you regret?",
      grammar: "Wish Clause (past)",
      starter: "I wish I had...",
      example: "I wish I had joined more clubs in first grade.",
    },
    {
      week: 32,
      day: "Fri",
      question: "What is something you wish would change about school?",
      grammar: "Wish Clause",
      starter: "I wish... would change.",
      example:
        "I wish the school day would start later because I am tired in the morning.",
    },
    {
      week: 33,
      day: "Mon",
      question:
        "The student studying in the library is my friend. Describe someone you know.",
      grammar: "Reduced Relative Clause",
      starter: "The person...ing is...",
      example: "The girl playing piano in the music room is my classmate.",
    },
    {
      week: 33,
      day: "Tue",
      question:
        "The book written by J.K. Rowling is amazing. What is something you like?",
      grammar: "Reduced Relative Clause",
      starter: "The... (past participle) is...",
      example: "The movie directed by Miyazaki is my favorite anime film.",
    },
    {
      week: 33,
      day: "Wed",
      question:
        "People living in big cities often feel stressed. What do you notice about people?",
      grammar: "Reduced Relative Clause",
      starter: "People...ing often...",
      example:
        "Students studying late at night often drink coffee to stay awake.",
    },
    {
      week: 33,
      day: "Thu",
      question:
        "The letter sent yesterday arrived today. Tell me about something recent.",
      grammar: "Reduced Relative Clause",
      starter: "The... (past participle)...",
      example: "The package ordered online came very quickly.",
    },
    {
      week: 33,
      day: "Fri",
      question:
        "Anyone wanting to join should sign up now. What opportunities are available?",
      grammar: "Reduced Relative Clause",
      starter: "Anyone...ing should...",
      example:
        "Students hoping to improve English should practice speaking every day.",
    },
    {
      week: 34,
      day: "Mon",
      question:
        "If I had known about the test, I would have studied more. What would you have done differently?",
      grammar: "Third Conditional",
      starter: "If I had known..., I would have...",
      example:
        "If I had known it would rain, I would have brought an umbrella.",
    },
    {
      week: 34,
      day: "Tue",
      question:
        "If you had been born in a different country, how would your life have been different?",
      grammar: "Third Conditional",
      starter: "If I had been born in..., I would have...",
      example:
        "If I had been born in America, I would have learned English from birth.",
    },
    {
      week: 34,
      day: "Wed",
      question:
        "If you had studied a different subject more, what would you have learned?",
      grammar: "Third Conditional",
      starter: "If I had studied... more, I would have learned...",
      example:
        "If I had studied music more, I would have learned to play guitar well.",
    },
    {
      week: 34,
      day: "Thu",
      question:
        "If you had joined a different club, what skills would you have gained?",
      grammar: "Third Conditional",
      starter: "If I had joined..., I would have gained...",
      example:
        "If I had joined the basketball club, I would have become more athletic.",
    },
    {
      week: 34,
      day: "Fri",
      question:
        "If you had met your best friend earlier, how would your life have changed?",
      grammar: "Third Conditional",
      starter: "If I had met... earlier, my life would have...",
      example:
        "If I had met my best friend in elementary school, we would have had more memories together.",
    },
    {
      week: 35,
      day: "Mon",
      question:
        "Looking back at three years of junior high school, what are you most proud of?",
      grammar: "Present Perfect",
      starter: "I am most proud of...",
      example:
        "I am most proud of passing the Eiken test and making great friends.",
    },
    {
      week: 35,
      day: "Tue",
      question: "What skills have you developed during junior high school?",
      grammar: "Present Perfect",
      starter: "I have developed...",
      example:
        "I have developed better study habits and time management skills.",
    },
    {
      week: 35,
      day: "Wed",
      question: "How have you changed as a person since Grade 1?",
      grammar: "Present Perfect",
      starter: "I have changed by becoming...",
      example: "I have changed by becoming more confident and responsible.",
    },
    {
      week: 35,
      day: "Thu",
      question: "What is the most important lesson you have learned in JHS?",
      grammar: "Present Perfect",
      starter: "The most important lesson I have learned is...",
      example:
        "The most important lesson I have learned is that hard work always pays off.",
    },
    {
      week: 35,
      day: "Fri",
      question: "What memories will you treasure from these three years?",
      grammar: "Future (will)",
      starter: "I will treasure...",
      example:
        "I will treasure the school trip to Kyoto and the sports festivals.",
    },
    {
      week: 36,
      day: "Mon",
      question:
        "What advice would you give to students entering Grade 1 next year?",
      grammar: "Modal (should)",
      starter: "You should...",
      example:
        "You should join clubs, make many friends, and enjoy every moment.",
    },
    {
      week: 36,
      day: "Tue",
      question: "If you could relive one moment from JHS, which would it be?",
      grammar: "Second Conditional",
      starter: "If I could relive one moment, it would be...",
      example:
        "If I could relive one moment, it would be winning the basketball tournament.",
    },
    {
      week: 36,
      day: "Wed",
      question: "What do you hope to achieve in high school?",
      grammar: "Hope to + infinitive",
      starter: "I hope to achieve...",
      example: "I hope to achieve better grades and continue playing sports.",
    },
    {
      week: 36,
      day: "Thu",
      question: "What will you miss most about junior high school?",
      grammar: "Future (will)",
      starter: "I will miss...",
      example:
        "I will miss seeing my friends every day and eating lunch together.",
    },
    {
      week: 36,
      day: "Fri",
      question: "How do you want people to remember you from JHS?",
      grammar: "Want + object + infinitive",
      starter: "I want people to remember me as...",
      example:
        "I want people to remember me as someone who was kind and helpful.",
    },
    {
      week: 37,
      day: "Mon",
      question: "What goals are you setting for yourself in high school?",
      grammar: "Present Continuous (future plan)",
      starter: "I am planning to...",
      example: "I am planning to study harder and join the English club.",
    },
    {
      week: 37,
      day: "Tue",
      question: "Looking at your journey, what mistakes taught you the most?",
      grammar: "Past Simple",
      starter: "The mistake that taught me the most was...",
      example:
        "The mistake that taught me the most was not asking for help when I needed it.",
    },
    {
      week: 37,
      day: "Wed",
      question: "How has English class prepared you for the future?",
      grammar: "Present Perfect",
      starter: "English class has prepared me by...",
      example:
        "English class has prepared me by giving me confidence to speak and communicate.",
    },
    {
      week: 37,
      day: "Thu",
      question: "What book, movie, or experience changed your perspective?",
      grammar: "Past Simple",
      starter: "... changed my perspective because...",
      example:
        "Reading 'Wonder' changed my perspective because it taught me about kindness.",
    },
    {
      week: 37,
      day: "Fri",
      question:
        "If you could thank one person from JHS, who would it be and why?",
      grammar: "Modal (would)",
      starter: "I would thank... because...",
      example:
        "I would thank my homeroom teacher because she always believed in me.",
    },
    {
      week: 38,
      day: "Mon",
      question: "What subject will be most useful for your future career?",
      grammar: "Future (will)",
      starter: "I think... will be most useful because...",
      example:
        "I think English will be most useful because I want to work internationally.",
    },
    {
      week: 38,
      day: "Tue",
      question: "Describe a moment when you felt truly proud of yourself.",
      grammar: "Past Simple",
      starter: "I felt truly proud when...",
      example:
        "I felt truly proud when I helped my teammate score the winning goal.",
    },
    {
      week: 38,
      day: "Wed",
      question: "What tradition from this school should never change?",
      grammar: "Modal (should)",
      starter: "I think... should never change because...",
      example:
        "I think the sports festival should never change because it brings everyone together.",
    },
    {
      week: 38,
      day: "Thu",
      question: "How will you stay connected with your JHS friends?",
      grammar: "Future (will)",
      starter: "I will stay connected by...",
      example:
        "I will stay connected by meeting up during holidays and using social media.",
    },
    {
      week: 38,
      day: "Fri",
      question: "What do you wish you had known when you started Grade 1?",
      grammar: "Wish (past)",
      starter: "I wish I had known that...",
      example:
        "I wish I had known that everyone feels nervous at first, so I would have worried less.",
    },
    {
      week: 39,
      day: "Mon",
      question: "What is your biggest dream for the next ten years?",
      grammar: "Infinitive",
      starter: "My biggest dream is to...",
      example:
        "My biggest dream is to study abroad and experience different cultures.",
    },
    {
      week: 39,
      day: "Tue",
      question: "Who has been your biggest inspiration and why?",
      grammar: "Present Perfect",
      starter: "... has been my biggest inspiration because...",
      example:
        "My English teacher has been my biggest inspiration because she never gave up on me.",
    },
    {
      week: 39,
      day: "Wed",
      question: "What challenge are you most prepared to face in high school?",
      grammar: "Present Simple",
      starter: "I am most prepared to face...",
      example:
        "I am most prepared to face difficult exams because I learned good study habits.",
    },
    {
      week: 39,
      day: "Thu",
      question:
        "If you wrote a book about your JHS experience, what would the title be?",
      grammar: "Second Conditional",
      starter: "If I wrote a book, the title would be...",
      example:
        "If I wrote a book, the title would be 'Three Years of Growth and Friendship'.",
    },
    {
      week: 39,
      day: "Fri",
      question:
        "What does success mean to you now compared to three years ago?",
      grammar: "Present Simple vs. Past Simple",
      starter: "Now success means... but three years ago it meant...",
      example:
        "Now success means being happy and helping others, but three years ago it meant getting good grades.",
    },
    {
      week: 40,
      day: "Mon",
      question:
        "What is one thing you will definitely do differently in high school?",
      grammar: "Future (will)",
      starter: "I will definitely...",
      example:
        "I will definitely participate more in class discussions and ask more questions.",
    },
    {
      week: 40,
      day: "Tue",
      question: "How do you want to grow as a person in the next year?",
      grammar: "Want to + infinitive",
      starter: "I want to grow by becoming...",
      example:
        "I want to grow by becoming more independent and taking responsibility for my actions.",
    },
    {
      week: 40,
      day: "Wed",
      question:
        "What message do you want to leave for future students of this school?",
      grammar: "Imperative/Want",
      starter: "I want to tell future students to...",
      example:
        "I want to tell future students to cherish every moment and make the most of their time here.",
    },
    {
      week: 40,
      day: "Thu",
      question: "Looking forward, what excites you most about high school?",
      grammar: "Present Simple",
      starter: "What excites me most is...",
      example:
        "What excites me most is meeting new people and learning new subjects.",
    },
    {
      week: 40,
      day: "Fri",
      question:
        "As you close this chapter, what is your final reflection on junior high school?",
      grammar: "Present Perfect",
      starter: "Junior high school has been...",
      example:
        "Junior high school has been an amazing journey of learning, friendship, and personal growth.",
    },
  ],
};

export default function SmallTalk() {
  const [grade, setGrade] = useState<string | null>(null);
  const [week, setWeek] = useState(1);
  const [dayIndex, setDayIndex] = useState(0); // 0: Mon, 1: Tue, etc.
  const [showExample, setShowExample] = useState(false);
  const [timer, setTimer] = useState<{
    time: number;
    isActive: boolean;
    type: string;
  } | null>(null);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Select question based on grade, week, and day
  const currentQuestion = grade
    ? hardcodedQuestions[grade]?.find(
        (q) => q.week === week && q.day === days[dayIndex],
      )
    : null;

  useEffect(() => {
    let interval: any;
    if (timer?.isActive && timer.time > 0) {
      interval = setInterval(
        () => setTimer((t) => (t ? { ...t, time: t.time - 1 } : null)),
        1000,
      );
    } else if (timer?.time === 0) {
      setTimer((t) => (t ? { ...t, isActive: false } : null));
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleWeekChange = (direction: "prev" | "next") => {
    if (direction === "prev" && week > 1) setWeek((w) => w - 1);
    if (direction === "next" && week < 40) setWeek((w) => w + 1);
    setShowExample(false);
  };

  const handleDayChange = (idx: number) => {
    setDayIndex(idx);
    setShowExample(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!grade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
            <Link href="/dashboard"><button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold"><Home size={18}/> Dashboard</button></Link>
            <span className="text-slate-300">·</span>
            <Link href="/games"><button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold"><ArrowLeft size={18}/> All Games</button></Link>
          </div>
          <h1 className="text-5xl font-display font-black text-center mb-10 text-slate-900 uppercase italic tracking-tight">
            Small Talk
          </h1>
          <div className="space-y-4">
            {["1", "2", "3"].map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xl transition-all active:scale-[0.98]"
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white px-8 py-5 flex items-center justify-between border-b border-slate-100 shadow-sm z-20">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setGrade(null);
              setWeek(1);
              setDayIndex(0);
            }}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-black text-slate-900 uppercase italic leading-none">
              SMALL TALK - GRADE {grade}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">
              {grade === "1"
                ? "TALK ABOUT YOU"
                : grade === "2"
                  ? "WHAT IF?"
                  : "IMAGINE"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-slate-50 border border-slate-100 rounded-full flex items-center p-1.5">
            <button
              onClick={() => handleWeekChange("prev")}
              disabled={week === 1}
              className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all disabled:opacity-20"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-6 font-black text-sm min-w-[120px] text-center text-slate-700">
              Week {week}
            </span>
            <button
              onClick={() => handleWeekChange("next")}
              disabled={week === 40}
              className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all disabled:opacity-20"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex bg-slate-50 border border-slate-100 rounded-full p-1.5">
            {days.map((day, idx) => (
              <button
                key={day}
                onClick={() => handleDayChange(idx)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${dayIndex === idx ? "bg-white text-blue-600 shadow-md scale-105" : "text-slate-400 hover:text-slate-600"}`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col p-10 max-w-7xl mx-auto w-full gap-10">
        <div className="flex-1 bg-white rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.06)] border border-slate-50 flex flex-col items-center justify-center text-center p-16 relative overflow-hidden group">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-20" />

          <div className="absolute top-16 left-1/2 -translate-x-1/2">
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em]">
              Today's Opening Question
            </span>
          </div>

          <div className="mt-8 mb-8 inline-block px-8 py-2.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-sm">
            GRAMMAR: {currentQuestion?.grammar || "Systematic Review"}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${week}-${dayIndex}`}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-5xl md:text-8xl font-display font-black text-[#0F172A] leading-[1.1] mb-16 max-w-5xl tracking-tight">
                {currentQuestion?.question ||
                  "No questions available for this day."}
              </h2>

              <div className="w-full max-w-2xl space-y-8">
                <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden group/starter">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-40 group-hover/starter:opacity-100 transition-opacity" />
                  <div className="absolute -top-3 left-10 bg-white px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Sentence Starter
                  </div>
                  <p className="text-3xl font-bold text-slate-800 italic border-b-[6px] border-blue-500/30 pb-3 inline-block">
                    {currentQuestion?.starter
                      ? `"${currentQuestion.starter}"`
                      : "..."}
                  </p>
                </div>

                <button
                  onClick={() => setShowExample(!showExample)}
                  className={`w-full py-6 border-2 border-dashed rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all duration-300 ${showExample ? "bg-slate-50 border-slate-300 text-slate-600" : "border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"}`}
                >
                  {showExample
                    ? "Hide Example Answer"
                    : "Click to Reveal Example Answer"}
                </button>

                <AnimatePresence>
                  {showExample && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: 20 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 20 }}
                      className="overflow-hidden"
                    >
                      <div className="p-10 bg-[#1E293B] text-white rounded-[2.5rem] text-2xl font-bold leading-relaxed shadow-2xl mt-6 relative border border-slate-700/50">
                        <div className="absolute -top-3 left-10 bg-[#1E293B] px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                          Model Answer
                        </div>
                        "{currentQuestion?.example || "..."}"
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Classroom Management */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <Clock size={120} />
          </div>

          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <Clock className="text-slate-400" size={24} />
            </div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">
              Classroom Management
            </span>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {[
              { label: "THINK TIME", time: 120 },
              { label: "PAIR TIME", time: 180 },
              { label: "SHARE TIME", time: 300 },
            ].map((t) => (
              <button
                key={t.label}
                onClick={() =>
                  setTimer({ time: t.time, isActive: true, type: t.label })
                }
                className={`p-10 rounded-[2.5rem] transition-all duration-300 flex flex-col items-center gap-4 group/timer ${timer?.type === t.label ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105" : "bg-slate-50 hover:bg-slate-100 hover:scale-[1.02]"}`}
              >
                <span
                  className={`text-[11px] font-black uppercase tracking-[0.3em] ${timer?.type === t.label ? "text-blue-100" : "text-slate-400"}`}
                >
                  {t.label}
                </span>
                <span className="text-5xl font-display font-black tracking-tight">
                  {timer?.type === t.label
                    ? formatTime(timer.time)
                    : formatTime(t.time)}
                </span>
                <div
                  className={`w-12 h-1 rounded-full transition-all ${timer?.type === t.label ? "bg-white/40" : "bg-slate-200 group-hover/timer:bg-slate-300"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
