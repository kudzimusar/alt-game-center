import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, Home, Trophy, Loader } from "lucide-react";
import confetti from "canvas-confetti";
import { grammarSets } from "@/lib/quiz/grammar-sets";

interface Question {
  h1: string;
  h2: string;
  h3: string;
  ans: string;
  query?: string;
  g1?: string;
  g2?: string;
  g3?: string;
}

const SERPER_KEY = "57bf2beb67e1b19d35b75e0b80b6d393bb5f0aa1";

function makePlaceholderSVG(label: string): string {
  const encoded = encodeURIComponent(label.toUpperCase());
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='480' viewBox='0 0 800 480'%3E%3Crect width='800' height='480' fill='%23f1f5f9'/%3E%3Ctext x='400' y='220' font-size='38' text-anchor='middle' fill='%2364748b' font-family='sans-serif'%3E🎨 ${encoded}%3C/text%3E%3Ctext x='400' y='280' font-size='22' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif'%3EImage not found%3C/text%3E%3C/svg%3E`;
}

function makeLoadingSVG(): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='480' viewBox='0 0 800 480'%3E%3Crect width='800' height='480' fill='%23f8fafc'/%3E%3Ctext x='400' y='250' font-size='30' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif'%3E⏳ Searching images...%3C/text%3E%3C/svg%3E`;
}

const quizDataFallback = {
  JHS1: [
    {
      h1: "<span class='grammar-underline'>What</span> do you use to write with ink?",
      h2: "<span class='grammar-underline'>Where</span> do you keep it? In your pencil case?",
      h3: "This <span class='grammar-underline'>is</span> usually blue or black.",
      ans: "Pen",
      query: "ballpoint-pen",
    },
    {
      h1: "<span class='grammar-underline'>Who</span> is the fairy boy in green clothes from Hyrule?",
      h2: "<span class='grammar-underline'>What</span> does he carry? A sword and shield?",
      h3: "He <span class='grammar-underline'>can</span> save Princess Zelda in this game.",
      ans: "Link",
      query: "zelda-hero",
    },
    {
      h1: "<span class='grammar-underline'>What</span> meal do you eat in the middle of the day?",
      h2: "<span class='grammar-underline'>When</span> do you have it? At 12 o'clock?",
      h3: "I <span class='grammar-underline'>like eating</span> this at school with friends.",
      ans: "Lunch",
      query: "school-lunch",
    },
    {
      h1: "<span class='grammar-underline'>Where</span> do you go to buy medicine when you are sick?",
      h2: "<span class='grammar-underline'>What</span> can you find there? Pills and bandages?",
      h3: "This place <span class='grammar-underline'>is</span> usually near a hospital.",
      ans: "Pharmacy",
      query: "drug-store",
    },
    {
      h1: "<span class='grammar-underline'>What</span> is the biggest star in our solar system?",
      h2: "<span class='grammar-underline'>Where</span> is it? In the center of the sky?",
      h3: "This star <span class='grammar-underline'>is</span> very hot and bright.",
      ans: "Sun",
      query: "bright-sun",
    },
    {
      h1: "<span class='grammar-underline'>Who</span> is the purple dragon who saves eggs in a game?",
      h2: "<span class='grammar-underline'>What</span> can he do? Breathe fire?",
      h3: "He <span class='grammar-underline'>can fly</span> and glide in the sky.",
      ans: "Spyro",
      query: "purple-dragon",
    },
    {
      h1: "<span class='grammar-underline'>What</span> orange vegetable is long and grows underground?",
      h2: "<span class='grammar-underline'>Where</span> can you find it? In a garden?",
      h3: "Rabbits <span class='grammar-underline'>like eating</span> this vegetable.",
      ans: "Carrot",
      query: "orange-carrot",
    },
    {
      h1: "<span class='grammar-underline'>What</span> animal has eight legs and makes webs?",
      h2: "<span class='grammar-underline'>Where</span> does it live? In corners of rooms?",
      h3: "This creature <span class='grammar-underline'>is</span> small and some people fear it.",
      ans: "Spider",
      query: "web-spider",
    },
    {
      h1: "<span class='grammar-underline'>Who</span> is the girl with ice powers in a Disney movie?",
      h2: "<span class='grammar-underline'>What</span> can she make? Snow and ice?",
      h3: "She <span class='grammar-underline'>can</span> build castles with her magic.",
      ans: "Elsa",
      query: "frozen-queen",
    },
    {
      h1: "<span class='grammar-underline'>What</span> color do you get when you mix red and white?",
      h2: "<span class='grammar-underline'>Where</span> can you see this color? On cherry blossoms?",
      h3: "This color <span class='grammar-underline'>is</span> soft and light.",
      ans: "Pink",
      query: "pink-color",
    },
    {
      h1: "<span class='grammar-underline'>What</span> do you sleep on at night? It is soft.",
      h2: "<span class='grammar-underline'>Where</span> is it? In your bedroom?",
      h3: "This <span class='grammar-underline'>is</span> usually covered with sheets.",
      ans: "Bed",
      query: "comfortable-bed",
    },
    {
      h1: "<span class='grammar-underline'>Who</span> is the fast blue character who collects rings?",
      h2: "<span class='grammar-underline'>What</span> can he do? Run super fast?",
      h3: "He <span class='grammar-underline'>can</span> defeat Dr. Robotnik.",
      ans: "Sonic",
      query: "blue-hedgehog",
    },
    {
      h1: "<span class='grammar-underline'>What</span> month comes before January?",
      h2: "<span class='grammar-underline'>When</span> do you celebrate Christmas?",
      h3: "This month <span class='grammar-underline'>is</span> the last one of the year.",
      ans: "December",
      query: "winter-month",
    },
    {
      h1: "<span class='grammar-underline'>Where</span> do you go to see doctors when you are very sick?",
      h2: "<span class='grammar-underline'>What</span> can they do there? Give you medicine?",
      h3: "This building <span class='grammar-underline'>is</span> where nurses work too.",
      ans: "Hospital",
      query: "medical-building",
    },
    {
      h1: "<span class='grammar-underline'>What</span> big animal has a long neck and eats leaves?",
      h2: "<span class='grammar-underline'>Where</span> does it live? In Africa?",
      h3: "This animal <span class='grammar-underline'>is</span> the tallest in the world.",
      ans: "Giraffe",
      query: "tall-giraffe",
    },
    {
      h1: "<span class='grammar-underline'>Who</span> is the cowboy toy in Toy Story?",
      h2: "<span class='grammar-underline'>What</span> does he wear? A cowboy hat and boots?",
      h3: "He <span class='grammar-underline'>can</span> talk and walk when people are not looking.",
      ans: "Woody",
      query: "toy-story-cowboy",
    },
    {
      h1: "<span class='grammar-underline'>What</span> do you use to cut paper?",
      h2: "<span class='grammar-underline'>Where</span> do you keep them? On your desk?",
      h3: "These <span class='grammar-underline'>are</span> sharp with two blades.",
      ans: "Scissors",
      query: "cutting-scissors",
    },
    {
      h1: "<span class='grammar-underline'>What</span> hot drink comes from beans and is brown?",
      h2: "<span class='grammar-underline'>When</span> do people drink it? In the morning?",
      h3: "Adults <span class='grammar-underline'>like drinking</span> this to wake up.",
      ans: "Coffee",
      query: "hot-coffee",
    },
    {
      h1: "<span class='grammar-underline'>Who</span> brings letters to your house every day?",
      h2: "<span class='grammar-underline'>What</span> do they carry? A big bag?",
      h3: "This person <span class='grammar-underline'>is</span> called a mail carrier.",
      ans: "Postman",
      query: "mail-carrier",
    },
    {
      h1: "<span class='grammar-underline'>What</span> shape is a ball or an orange?",
      h2: "<span class='grammar-underline'>Where</span> can you see this shape? Everywhere?",
      h3: "This shape <span class='grammar-underline'>is</span> perfectly round.",
      ans: "Circle",
      query: "round-shape",
    },
  ],
  JHS2: [
    {
      h1: "I <span class='grammar-underline'>am sure that</span> this is the largest country in the world by area.",
      h2: "It <span class='grammar-underline'>is important to</span> know it is in both Europe and Asia.",
      h3: "I enjoy <span class='grammar-underline'>learning</span> about its cold winters and famous buildings.",
      ans: "Russia",
      query: "russian-landscape",
    },
    {
      h1: "You <span class='grammar-underline'>have to</span> use eggs and flour to make this breakfast food.",
      h2: "I <span class='grammar-underline'>know how to</span> flip it in a pan.",
      h3: "I <span class='grammar-underline'>am sure that</span> it tastes great with maple syrup.",
      ans: "Pancake",
      query: "breakfast-pancakes",
    },
    {
      h1: "I <span class='grammar-underline'>think that</span> this creature is the largest animal on Earth.",
      h2: "It <span class='grammar-underline'>is important to</span> protect them in the ocean.",
      h3: "I enjoy <span class='grammar-underline'>watching</span> them swim and sing underwater.",
      ans: "Blue Whale",
      query: "ocean-whale",
    },
    {
      h1: "We <span class='grammar-underline'>must</span> use this to see the time during class.",
      h2: "I <span class='grammar-underline'>can show you how to</span> read the hour and minute hands.",
      h3: "I <span class='grammar-underline'>am sure that</span> being on time is very important.",
      ans: "Clock",
      query: "wall-clock",
    },
    {
      h1: "I <span class='grammar-underline'>am sure that</span> this game uses a white ball and a bat.",
      h2: "You <span class='grammar-underline'>have to</span> hit it to score runs.",
      h3: "I enjoy <span class='grammar-underline'>playing</span> this sport every weekend in Japan.",
      ans: "Baseball",
      query: "baseball-field",
    },
    {
      h1: "I <span class='grammar-underline'>think that</span> this is the smallest continent in the world.",
      h2: "It <span class='grammar-underline'>is important to</span> visit Sydney and Melbourne there.",
      h3: "I <span class='grammar-underline'>am sure that</span> kangaroos and koalas live here.",
      ans: "Australia",
      query: "australian-outback",
    },
    {
      h1: "We <span class='grammar-underline'>must</span> read this type of Japanese comic book.",
      h2: "I <span class='grammar-underline'>can show you how to</span> read it from right to left.",
      h3: "<span class='grammar-underline'>Reading</span> these stories is very popular in Japan.",
      ans: "Manga",
      query: "japanese-manga",
    },
    {
      h1: "I <span class='grammar-underline'>am sure that</span> this red fruit has seeds on the outside.",
      h2: "You <span class='grammar-underline'>have to</span> wash it before eating.",
      h3: "I enjoy <span class='grammar-underline'>eating</span> this on top of cake and ice cream.",
      ans: "Strawberry",
      query: "fresh-strawberry",
    },
    {
      h1: "I <span class='grammar-underline'>think that</span> this instrument has black and white keys.",
      h2: "It <span class='grammar-underline'>is important to</span> practice scales and chords.",
      h3: "I enjoy <span class='grammar-underline'>listening</span> to classical music played on this.",
      ans: "Piano",
      query: "piano-keys",
    },
    {
      h1: "We <span class='grammar-underline'>must</span> protect this black and white bear from China.",
      h2: "I <span class='grammar-underline'>can show you how to</span> recognize it by its round face.",
      h3: "I <span class='grammar-underline'>am sure that</span> bamboo is its favorite food.",
      ans: "Panda",
      query: "giant-panda",
    },
    {
      h1: "I <span class='grammar-underline'>am sure that</span> this bridge is golden and located in San Francisco.",
      h2: "It <span class='grammar-underline'>is important to</span> see it when visiting California.",
      h3: "I enjoy <span class='grammar-underline'>learning</span> about its orange color and long cables.",
      ans: "Golden Gate Bridge",
      query: "golden-gate",
    },
    {
      h1: "You <span class='grammar-underline'>have to</span> put toppings on dough to make this Italian food.",
      h2: "I <span class='grammar-underline'>think that</span> cheese and tomato sauce are the basics.",
      h3: "I enjoy <span class='grammar-underline'>eating</span> this with my family on Friday nights.",
      ans: "Pizza",
      query: "italian-pizza",
    },
    {
      h1: "I <span class='grammar-underline'>am sure that</span> this African animal has black and white stripes.",
      h2: "It <span class='grammar-underline'>is</span> similar to a horse but wild.",
      h3: "I enjoy <span class='grammar-underline'>watching</span> them run across the savanna.",
      ans: "Zebra",
      query: "striped-zebra",
    },
    {
      h1: "We <span class='grammar-underline'>must</span> take care of our body by brushing these every day.",
      h2: "I <span class='grammar-underline'>can show you how to</span> prevent cavities.",
      h3: "<span class='grammar-underline'>Using</span> toothpaste and floss is very important.",
      ans: "Teeth",
      query: "healthy-teeth",
    },
    {
      h1: "I <span class='grammar-underline'>think that</span> this anime character has spiky blonde hair.",
      h2: "He <span class='grammar-underline'>has to</span> become Hokage of his village.",
      h3: "I enjoy <span class='grammar-underline'>watching</span> him fight with shadow clones.",
      ans: "Naruto",
      query: "ninja-naruto",
    },
    {
      h1: "I <span class='grammar-underline'>am sure that</span> this traditional Japanese room has tatami mats.",
      h2: "You <span class='grammar-underline'>have to</span> take off your shoes before entering.",
      h3: "<span class='grammar-underline'>Sitting</span> on the floor for tea ceremony is traditional.",
      ans: "Washitsu",
      query: "japanese-room",
    },
    {
      h1: "I <span class='grammar-underline'>think that</span> this is the fastest bird in the world when diving.",
      h2: "It <span class='grammar-underline'>is important to</span> protect these hunters of the sky.",
      h3: "I enjoy <span class='grammar-underline'>watching</span> them catch prey at high speeds.",
      ans: "Falcon",
      query: "peregrine-falcon",
    },
    {
      h1: "We <span class='grammar-underline'>must</span> speak this language to communicate in Spain.",
      h2: "I <span class='grammar-underline'>can show you how to</span> say 'hello' - it is 'hola'.",
      h3: "<span class='grammar-underline'>Learning</span> this language helps you in many countries.",
      ans: "Spanish",
      query: "spanish-language",
    },
    {
      h1: "I <span class='grammar-underline'>am sure that</span> this yellow citrus fruit is very sour.",
      h2: "You <span class='grammar-underline'>have to</span> squeeze it to make juice.",
      h3: "I enjoy <span class='grammar-underline'>using</span> this to add flavor to water and food.",
      ans: "Lemon",
      query: "sour-lemon",
    },
    {
      h1: "I <span class='grammar-underline'>think that</span> this woman was a famous British queen for 70 years.",
      h2: "She <span class='grammar-underline'>has to</span> be remembered for her long reign.",
      h3: "I enjoy <span class='grammar-underline'>learning</span> about Queen Elizabeth II's life.",
      ans: "Queen Elizabeth",
      query: "british-queen",
    },
  ],
  JHS3: [
    {
      h1: "I <span class='grammar-underline'>have been studying</span> this European city known for its canals and gondolas.",
      h2: "This is <span class='grammar-underline'>a city that</span> is slowly sinking into the water.",
      h3: "Tell me <span class='grammar-underline'>which Italian food</span> you would eat in Venice.",
      ans: "Venice",
      query: "venice-canals",
    },
    {
      h1: "The leader <span class='grammar-underline'>signing</span> the Declaration of Independence was the first US president.",
      h2: "This is <span class='grammar-underline'>a person who</span> never told a lie according to legend.",
      h3: "I <span class='grammar-underline'>have learned</span> that George Washington's face is on the dollar bill.",
      ans: "George Washington",
      query: "first-president",
    },
    {
      h1: "I <span class='grammar-underline'>have been reading</span> this Japanese folktale about a grateful crane.",
      h2: "It is <span class='grammar-underline'>a story where</span> the bird weaves beautiful cloth.",
      h3: "The crane <span class='grammar-underline'>repays the kindness</span> of the man who saved it.",
      ans: "Tsuru no Ongaeshi",
      query: "grateful-crane",
    },
    {
      h1: "The inventor <span class='grammar-underline'>creating</span> the first airplane changed transportation forever.",
      h2: "These are <span class='grammar-underline'>brothers who</span> made history in 1903.",
      h3: "I <span class='grammar-underline'>have heard</span> about the Wright Brothers' first flight.",
      ans: "Wright Brothers",
      query: "first-airplane",
    },
    {
      h1: "I <span class='grammar-underline'>have visited</span> this ancient amphitheater where gladiators fought in Rome.",
      h2: "This is <span class='grammar-underline'>a structure that</span> is one of the Seven Wonders.",
      h3: "If I <span class='grammar-underline'>lived</span> in ancient times, I <span class='grammar-underline'>would</span> watch events here.",
      ans: "Colosseum",
      query: "roman-colosseum",
    },
    {
      h1: "The player <span class='grammar-underline'>scoring</span> many goals plays for Al Nassr now.",
      h2: "This is <span class='grammar-underline'>a footballer who</span> won five Ballon d'Or awards.",
      h3: "I <span class='grammar-underline'>have watched</span> Cristiano Ronaldo play many times.",
      ans: "Ronaldo",
      query: "portugal-footballer",
    },
    {
      h1: "I <span class='grammar-underline'>have been learning</span> about this force that keeps us on the ground.",
      h2: "It is <span class='grammar-underline'>a force that</span> Isaac Newton discovered.",
      h3: "The Earth <span class='grammar-underline'>pulls everything</span> toward its center because of this.",
      ans: "Gravity",
      query: "falling-apple",
    },
    {
      h1: "The explorer <span class='grammar-underline'>traveling</span> to the New World in 1492 was Italian.",
      h2: "This is <span class='grammar-underline'>a person who</span> sailed with three ships.",
      h3: "I <span class='grammar-underline'>have studied</span> Christopher Columbus in world history.",
      ans: "Columbus",
      query: "explorer-ships",
    },
    {
      h1: "I <span class='grammar-underline'>have just finished</span> watching this Ghibli film about a bathhouse.",
      h2: "It is <span class='grammar-underline'>a movie that</span> features a girl named Chihiro.",
      h3: "The spirits <span class='grammar-underline'>come to relax</span> in this magical place.",
      ans: "Spirited Away",
      query: "ghibli-bathhouse",
    },
    {
      h1: "I <span class='grammar-underline'>have been watching</span> this sport where players try to get a home run.",
      h2: "This is <span class='grammar-underline'>a game that</span> uses a bat, ball, and gloves.",
      h3: "Tell me <span class='grammar-underline'>which Japanese team</span> you support in this popular sport.",
      ans: "Baseball",
      query: "baseball-stadium",
    },
    {
      h1: "I <span class='grammar-underline'>have never climbed</span> this mountain range between France and Spain.",
      h2: "These are <span class='grammar-underline'>mountains that</span> separate two countries.",
      h3: "Tell me <span class='grammar-underline'>what animals live</span> in the Pyrenees.",
      ans: "Pyrenees",
      query: "mountain-range",
    },
    {
      h1: "The writer <span class='grammar-underline'>creating</span> Romeo and Juliet lived in England.",
      h2: "This is <span class='grammar-underline'>a playwright who</span> wrote many famous plays.",
      h3: "I <span class='grammar-underline'>wish I could</span> have seen William Shakespeare perform.",
      ans: "Shakespeare",
      query: "english-playwright",
    },
    {
      h1: "I <span class='grammar-underline'>have been studying</span> this war that lasted from 1939 to 1945.",
      h2: "It is <span class='grammar-underline'>a conflict that</span> involved most of the world's nations.",
      h3: "Many countries <span class='grammar-underline'>fought to stop</span> the spread of fascism.",
      ans: "World War II",
      query: "world-war-two",
    },
    {
      h1: "The athlete <span class='grammar-underline'>running</span> the fastest 100 meters set world records.",
      h2: "This is <span class='grammar-underline'>a person who</span> is from Jamaica.",
      h3: "I <span class='grammar-underline'>have seen</span> Usain Bolt win many gold medals.",
      ans: "Usain Bolt",
      query: "fastest-runner",
    },
    {
      h1: "I <span class='grammar-underline'>have just learned</span> about this famous battle where Napoleon was defeated.",
      h2: "This is <span class='grammar-underline'>a battle that</span> ended his rule in 1815.",
      h3: "Tell me <span class='grammar-underline'>what happened</span> at Waterloo in Belgium.",
      ans: "Waterloo",
      query: "napoleon-defeat",
    },
    {
      h1: "The scientist <span class='grammar-underline'>studying</span> evolution changed how we understand life.",
      h2: "This is <span class='grammar-underline'>a person who</span> traveled to the Galapagos Islands.",
      h3: "I <span class='grammar-underline'>have read</span> about Charles Darwin's theory of natural selection.",
      ans: "Darwin",
      query: "evolution-scientist",
    },
    {
      h1: "I <span class='grammar-underline'>have been practicing</span> this traditional Japanese art of paper folding.",
      h2: "It is <span class='grammar-underline'>an art form that</span> creates animals and flowers.",
      h3: "The crane <span class='grammar-underline'>symbolizes peace</span> when made from paper.",
      ans: "Origami",
      query: "paper-folding",
    },
    {
      h1: "The composer <span class='grammar-underline'>writing</span> symphonies became deaf but continued creating music.",
      h2: "This is <span class='grammar-underline'>a musician who</span> wrote Symphony No. 9.",
      h3: "I <span class='grammar-underline'>have listened to</span> Ludwig van Beethoven many times.",
      ans: "Beethoven",
      query: "classical-composer",
    },
    {
      h1: "I <span class='grammar-underline'>have just learned</span> about this wall that once divided a German city.",
      h2: "This is <span class='grammar-underline'>a barrier that</span> separated families for decades.",
      h3: "Tell me <span class='grammar-underline'>when the Berlin Wall</span> came down.",
      ans: "Berlin Wall",
      query: "divided-germany",
    },
    {
      h1: "The actress <span class='grammar-underline'>playing</span> Hermione Granger grew up with the Harry Potter films.",
      h2: "This is <span class='grammar-underline'>a person who</span> became a UN Women Goodwill Ambassador.",
      h3: "I <span class='grammar-underline'>have watched</span> Emma Watson in many movies.",
      ans: "Emma Watson",
      query: "hermione-actress",
    },
  ],
};

import { quizDataWeek1 } from "@/lib/quiz/week-1";
import { quizDataWeek0 } from "@/lib/quiz/week-0";
import { quizDataWeek2 } from "@/lib/quiz/week-2";
import { quizDataWeek3 } from "@/lib/quiz/week-3";
import { quizDataWeek4 } from "@/lib/quiz/week-4";
import { academicYearWeeks } from "@/lib/quiz/academic-year";
import { academicYearWeeks2 } from "@/lib/quiz/academic-year-2";
import { academicYearWeeks3 } from "@/lib/quiz/academic-year-3";

const quizSets = {
  "NH Grammar": grammarSets,
  "NH W30": academicYearWeeks3.WEEK_30,
  "NH W29": academicYearWeeks3.WEEK_29,
  "NH W28": academicYearWeeks3.WEEK_28,
  "NH W27": academicYearWeeks3.WEEK_27,
  "NH W26": academicYearWeeks3.WEEK_26,
  "NH W25": academicYearWeeks3.WEEK_25,
  "NH W24": academicYearWeeks3.WEEK_24,
  "NH W23": academicYearWeeks3.WEEK_23,
  "NH W22": academicYearWeeks3.WEEK_22,
  "NH W21": academicYearWeeks3.WEEK_21,
  "NH W20": academicYearWeeks3.WEEK_20,
  "NH W19": academicYearWeeks3.WEEK_19,
  "NH W18": academicYearWeeks3.WEEK_18,
  "NH W17": academicYearWeeks3.WEEK_17,
  "NH W16": academicYearWeeks2.WEEK_16,
  "NH W15": academicYearWeeks2.WEEK_15,
  "NH W14": academicYearWeeks2.WEEK_14,
  "NH W13": academicYearWeeks2.WEEK_13,
  "NH W12": academicYearWeeks2.WEEK_12,
  "NH W11": academicYearWeeks2.WEEK_11,
  "NH W10": academicYearWeeks.WEEK_10,
  "NH W09": academicYearWeeks.WEEK_09,
  "NH W08": academicYearWeeks.WEEK_08,
  "NH W07": academicYearWeeks.WEEK_07,
  "NH W06": academicYearWeeks.WEEK_06,
  "NH W05": academicYearWeeks.WEEK_05,
  "NH W04": academicYearWeeks.WEEK_04,
  "NH W03": academicYearWeeks.WEEK_03,
  "NH W02": academicYearWeeks.WEEK_02,
  "NH W01": academicYearWeeks.WEEK_01,
  "Week 4": quizDataWeek4,
  "Week 3": quizDataWeek3,
  "Week 2": quizDataWeek2,
  "Week 1": quizDataWeek1,
  "Week 0": quizDataWeek0,
  "Default": quizDataFallback,
};

export default function ThreeHintQuiz() {
  const [showLibrary, setShowLibrary] = useState(true);
  const [grade, setGrade] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<string>("Week 1");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [teamScores, setTeamScores] = useState({ a: 0, b: 0, c: 0, d: 0 });

  const [imgSrc, setImgSrc] = useState<string>("");

  const hint1Ref = useRef<HTMLDivElement>(null);
  const hint2Ref = useRef<HTMLDivElement>(null);
  const hint3Ref = useRef<HTMLDivElement>(null);
  const letterContainerRef = useRef<HTMLDivElement>(null);
  const answerBoxRef = useRef<HTMLDivElement>(null);
  const questionAreaRef = useRef<HTMLDivElement>(null);
  const scoresRef = useRef<HTMLDivElement>(null);

  const fetchImage = useCallback(async (query: string) => {
    setImgSrc(makeLoadingSVG());
    try {
      const res = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, num: 1, gl: "jp" }),
      });
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setImgSrc(data.images[0].imageUrl);
      } else {
        setImgSrc(makePlaceholderSVG(query));
      }
    } catch {
      setImgSrc(makePlaceholderSVG(query));
    }
  }, []);

  useEffect(() => {
    if (grade) {
      setQuestions(quizSets[selectedSet as keyof typeof quizSets][grade as keyof typeof quizDataFallback] || []);
    }
  }, [grade, selectedSet]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const q = questions[currentIndex];
      fetchImage(q.query || q.ans);
    }
  }, [currentIndex, questions, fetchImage]);

  const fetchQuiz = async (selectedGrade: string) => {
    setLoading(true);
    try {
      // We now use local sets, but keeping the signature for compatibility if needed
      setQuestions(quizSets[selectedSet as keyof typeof quizSets][selectedGrade as keyof typeof quizDataFallback] || []);
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      setQuestions(
        quizDataFallback[selectedGrade as keyof typeof quizDataFallback] || [],
      );
    } finally {
      setLoading(false);
      resetQuestion();

      // Scroll to top when grade changes
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const resetQuestion = () => {
    setCurrentIndex(0);
    setRevealedHints(new Set());
    setRevealedLetters(0);
    setShowAnswer(false);
  };

  const revealHint = (hintIndex: number) => {
    const newRevealed = new Set(revealedHints);
    newRevealed.add(hintIndex);
    setRevealedHints(newRevealed);

    // Auto-scroll to the revealed hint
    setTimeout(() => {
      const refs = [hint1Ref, hint2Ref, hint3Ref];
      refs[hintIndex]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const revealLetter = () => {
    const currentQuestion = questions[currentIndex];
    if (currentQuestion && revealedLetters < currentQuestion.ans.length) {
      setRevealedLetters(revealedLetters + 1);

      // Auto-scroll to letter container
      setTimeout(() => {
        letterContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setRevealedHints(new Set([0, 1, 2]));
    const currentQuestion = questions[currentIndex];
    if (currentQuestion) {
      setRevealedLetters(currentQuestion.ans.length);
    }

    // Auto-scroll to answer box
    setTimeout(() => {
      answerBoxRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRevealedHints(new Set());
      setRevealedLetters(0);
      setShowAnswer(false);

      // Scroll to top of question area
      setTimeout(() => {
        questionAreaRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const updateScore = (team: "a" | "b" | "c" | "d", points: number) => {
    setTeamScores((prev) => ({
      ...prev,
      [team]: prev[team] + points,
    }));
    confetti({ particleCount: 50, spread: 60 });

    // Auto-scroll to scores
    setTimeout(() => {
      scoresRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const goHome = () => {
    setGrade(null);
    setQuestions([]);
    setTeamScores({ a: 0, b: 0, c: 0, d: 0 });
    resetQuestion();
    setShowLibrary(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!grade || questions.length === 0) return;

      const key = e.key.toUpperCase();

      if (key === "1") revealHint(0);
      if (key === "2") revealHint(1);
      if (key === "3") revealHint(2);
      if (key === "L") revealLetter();
      if (key === " " || key === "A") {
        e.preventDefault();
        handleShowAnswer();
      }
      if (key === "N") handleNext();
      if (key === "H") goHome();

      if (key === "S") updateScore("a", 10);
      if (key === "K") updateScore("b", 10);
      if (key === "Z") updateScore("c", 10);
      if (key === "M") updateScore("d", 10);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    grade,
    currentIndex,
    questions,
    revealedHints,
    revealedLetters,
    showAnswer,
  ]);

  // Library Selection Screen
  if (showLibrary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-screen w-20 bg-slate-800 flex flex-col items-center py-6 gap-5 z-50">
          <Link href="/dashboard">
            <button className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors" title="Dashboard">
              <Home size={24} />
            </button>
          </Link>
          <Link href="/games">
            <button className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors" title="All Games">
              <ArrowLeft size={22} />
            </button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="ml-20 p-10">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Trophy size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white">
                  QUIZ <span className="text-blue-600">LIBRARY</span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Choose a Weekly Set
                </p>
              </div>
            </div>
            <div className="px-6 py-2 rounded-full bg-slate-300 dark:bg-slate-600 text-white font-black text-sm uppercase tracking-tight">
              Select Set
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {Object.keys(quizSets).filter(set => set !== "Default").map((setName) => (
              <button
                key={setName}
                onClick={() => {
                  setSelectedSet(setName);
                  setShowLibrary(false);
                }}
                className={`group relative h-64 rounded-[2.5rem] p-8 shadow-xl transition-all transform hover:-translate-y-2 hover:shadow-2xl overflow-hidden border-2 ${
                  setName === "NH Grammar"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white"
                    : "bg-white dark:bg-slate-800 border-transparent hover:border-blue-500"
                }`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 ${setName === "NH Grammar" ? "bg-white/10" : "bg-blue-500/10"}`} />
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 ${
                      setName === "NH Grammar"
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    }`}>
                      {setName === "NH Grammar" ? "⭐ Grammar Quiz" : "Weekly Set"}
                    </span>
                    <h3 className={`text-4xl font-black leading-tight ${setName === "NH Grammar" ? "text-white" : "text-slate-800 dark:text-white"}`}>
                      {setName}
                    </h3>
                    {setName === "NH Grammar" && (
                      <p className="text-sm text-white/80 font-semibold mt-2">
                        Be verbs · Past · Relative · Passive
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 font-bold text-sm ${setName === "NH Grammar" ? "text-white/70" : "text-slate-400"}`}>
                    <span>Click to start quiz</span>
                    <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center transform transition-transform group-hover:translate-x-1 ${setName === "NH Grammar" ? "bg-white/20" : "bg-blue-600"}`}>
                      →
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Grade Selection Screen
  if (!grade || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-screen w-20 bg-slate-800 flex flex-col items-center py-6 gap-5 z-50">
          <Link href="/dashboard">
            <button className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors" title="Dashboard">
              <Home size={24} />
            </button>
          </Link>
          <Link href="/games">
            <button className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors" title="All Games">
              <ArrowLeft size={22} />
            </button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="ml-20 p-10">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Trophy size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white">
                  NEW HORIZON <span className="text-blue-600">QUIZ</span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Shadreck's Classroom
                </p>
              </div>
            </div>
            <div className="px-6 py-2 rounded-full bg-slate-300 dark:bg-slate-600 text-white font-black text-sm uppercase tracking-tight">
              Awaiting Start
            </div>
          </div>

          {/* Grade Selection */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader className="animate-spin text-blue-600" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <button
                onClick={() => setGrade("JHS1")}
                className="h-72 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex flex-col items-center justify-center gap-3 shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <span className="text-8xl font-black">1</span>
                <span className="text-xl font-bold tracking-widest opacity-80">
                  GRADE
                </span>
              </button>
              <button
                onClick={() => setGrade("JHS2")}
                className="h-72 rounded-[2.5rem] bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex flex-col items-center justify-center gap-3 shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <span className="text-8xl font-black">2</span>
                <span className="text-xl font-bold tracking-widest opacity-80">
                  GRADE
                </span>
              </button>
              <button
                onClick={() => setGrade("JHS3")}
                className="h-72 rounded-[2.5rem] bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white flex flex-col items-center justify-center gap-3 shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <span className="text-8xl font-black">3</span>
                <span className="text-xl font-bold tracking-widest opacity-80">
                  GRADE
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const getGradientClass = () => {
    if (grade === "JHS1") return "from-blue-500 to-blue-600";
    if (grade === "JHS2") return "from-orange-500 to-orange-600";
    return "from-pink-500 to-pink-600";
  };

  // Quiz Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-20 bg-slate-800 flex flex-col items-center py-6 gap-5 z-50">
        <button
          onClick={goHome}
          className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors mb-4"
        >
          <Home size={24} />
        </button>
        <button
          onClick={() => setGrade("JHS1")}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black text-lg"
        >
          G1
        </button>
        <button
          onClick={() => setGrade("JHS2")}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-black text-lg"
        >
          G2
        </button>
        <button
          onClick={() => setGrade("JHS3")}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white font-black text-lg"
        >
          G3
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-20 p-10">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Trophy size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white">
                NEW HORIZON <span className="text-blue-600">QUIZ</span>
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Shadreck's Classroom
              </p>
            </div>
          </div>
          <div
            className={`px-6 py-2 rounded-full bg-gradient-to-r ${getGradientClass()} text-white font-black text-sm uppercase tracking-tight`}
          >
            {grade} ACTIVE
          </div>
        </div>

        {/* Question Counter */}
        <div
          className="mb-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md"
          ref={questionAreaRef}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Hints Revealed: {revealedHints.size}/3
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className={`h-full bg-gradient-to-r ${getGradientClass()} rounded-full transition-all duration-500`}
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Hints */}
        <div className="space-y-6 mb-10">
          {[
            {
              num: 1,
              hint: currentQuestion.h1,
              grammarTag: currentQuestion.g1,
              color: "border-sky-500",
              tagBg: "bg-sky-100 text-sky-700",
              numBg: "bg-sky-100 text-sky-600",
              ref: hint1Ref,
            },
            {
              num: 2,
              hint: currentQuestion.h2,
              grammarTag: currentQuestion.g2,
              color: "border-amber-500",
              tagBg: "bg-amber-100 text-amber-700",
              numBg: "bg-amber-100 text-amber-600",
              ref: hint2Ref,
            },
            {
              num: 3,
              hint: currentQuestion.h3,
              grammarTag: currentQuestion.g3,
              color: "border-rose-500",
              tagBg: "bg-rose-100 text-rose-700",
              numBg: "bg-rose-100 text-rose-600",
              ref: hint3Ref,
            },
          ].map(({ num, hint, grammarTag, color, tagBg, numBg, ref }, index) => (
            <div
              key={num}
              ref={ref}
              className={`bg-white dark:bg-slate-800 rounded-[1.875rem] p-8 shadow-md transition-all duration-500 ${
                revealedHints.has(index)
                  ? `border-l-[20px] ${color} opacity-100 animate-fade-in-right`
                  : "border-l-[12px] border-slate-200 dark:border-slate-700 opacity-40"
              }`}
            >
              <div className="flex items-start gap-6">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-black flex-shrink-0 ${
                    revealedHints.has(index) ? numBg : "bg-slate-100 text-slate-300"
                  }`}
                >
                  {num}
                </div>
                <div className="flex-1 min-w-0">
                  {revealedHints.has(index) && grammarTag && (
                    <span className={`inline-block text-xs font-bold tracking-wide px-3 py-1 rounded-full mb-2 ${tagBg}`}>
                      {grammarTag}
                    </span>
                  )}
                  {revealedHints.has(index) ? (
                    <p
                      className="text-3xl font-bold text-slate-700 dark:text-slate-200 leading-snug"
                      dangerouslySetInnerHTML={{ __html: hint }}
                    />
                  ) : (
                    <p className="text-3xl font-bold text-slate-400 dark:text-slate-500 pt-2">
                      Click button below to reveal hint {num}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Letter Clues */}
        <div
          className="flex flex-wrap justify-center gap-4 mb-10 min-h-[80px]"
          ref={letterContainerRef}
        >
          {currentQuestion.ans
            .split("")
            .slice(0, revealedLetters)
            .map((char, i) => (
              <div
                key={i}
                className={`w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg border-2 border-slate-200 dark:border-slate-700 animate-bounce-in ${
                  char === " " ? "invisible" : ""
                }`}
              >
                {char.toUpperCase()}
              </div>
            ))}
        </div>

        {/* Answer Box */}
        {showAnswer && (
          <div className="mb-10 animate-zoom-in" ref={answerBoxRef}>
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-2 shadow-2xl overflow-hidden">
              <div
                className={`bg-gradient-to-r ${getGradientClass()} text-white text-center py-8 rounded-t-[2.25rem]`}
              >
                <h2 className="text-7xl font-black uppercase">
                  {currentQuestion.ans}
                </h2>
              </div>
              <div className="w-full h-[420px] bg-slate-50 flex items-center justify-center overflow-hidden border-[10px] border-white rounded-b-[2.25rem]">
                <img
                  src={imgSrc}
                  alt={currentQuestion.ans}
                  className="max-w-full max-h-full object-contain transition-opacity duration-300"
                  onError={(e) => {
                    e.currentTarget.src = makePlaceholderSVG(currentQuestion.query || currentQuestion.ans);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <button
            onClick={() => revealHint(0)}
            disabled={revealedHints.has(0)}
            className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              revealedHints.has(0)
                ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
            }`}
          >
            Hint 1 [1]
          </button>
          <button
            onClick={() => revealHint(1)}
            disabled={revealedHints.has(1)}
            className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              revealedHints.has(1)
                ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
            }`}
          >
            Hint 2 [2]
          </button>
          <button
            onClick={() => revealHint(2)}
            disabled={revealedHints.has(2)}
            className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              revealedHints.has(2)
                ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg"
            }`}
          >
            Hint 3 [3]
          </button>
          <button
            onClick={revealLetter}
            disabled={revealedLetters >= currentQuestion.ans.length}
            className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              revealedLetters >= currentQuestion.ans.length
                ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
            }`}
          >
            Letter [L]
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <button
            onClick={handleShowAnswer}
            disabled={showAnswer}
            className={`py-5 px-8 rounded-2xl font-black text-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              showAnswer
                ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-xl"
            }`}
          >
            Show Answer [Space/A]
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= questions.length - 1}
            className={`py-5 px-8 rounded-2xl font-black text-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentIndex >= questions.length - 1
                ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl"
            }`}
          >
            Next Question [N] →
          </button>
        </div>

        {/* Team Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6" ref={scoresRef}>
          {[
            { team: "a", label: "Team A (S)", color: "blue" },
            { team: "b", label: "Team B (K)", color: "orange" },
            { team: "c", label: "Team C (Z)", color: "pink" },
            { team: "d", label: "Team D (M)", color: "purple" },
          ].map(({ team, label, color }) => (
            <div
              key={team}
              className={`bg-${color}-50 dark:bg-${color}-900/20 border-b-8 border-${color}-200 dark:border-${color}-700 rounded-3xl p-6 text-center transition-transform hover:scale-105`}
            >
              <p
                className={`text-xs font-black text-${color}-400 mb-1 uppercase`}
              >
                {label}
              </p>
              <p className="text-5xl font-black text-slate-800 dark:text-white">
                {teamScores[team as keyof typeof teamScores]}
              </p>
            </div>
          ))}
        </div>

        {/* Keyboard Guide */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Keyboard: [1,2,3] Hints | [L] Letter | [Space/A] Answer | [N] Next |
          [S,K,Z,M] Team Scores (+10) | [H] Home
        </p>
      </div>

      <style>{`
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes zoom-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-zoom-in {
          animation: zoom-in 0.5s ease-out;
        }

        .grammar-highlight {
          background: #fef08a;
          padding: 2px 8px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .gu {
          border-bottom: 5px solid #fbbf24;
          padding-bottom: 2px;
          color: #1e293b;
          font-weight: 900;
        }
      `}</style>
    </div>
  );
}
