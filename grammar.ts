// Grammar data: English tenses theory + practice exercises (B2 / IELTS 5.5+)

export interface TenseTopic {
  id: string;
  name: string; // English name
  nameRu: string; // Russian name
  formula: string;
  usage: string; // when to use (RU)
  markers: string; // signal words
  examples: { en: string; ru: string }[];
}

export interface GrammarExercise {
  id: number;
  tenseId: string;
  sentence: string; // contains "___" placeholder
  hint?: string; // base verb / Russian hint
  options: string[];
  answer: number; // index of correct option
  explanation: string; // RU explanation
}

export const tenses: TenseTopic[] = [
  {
    id: "present-simple",
    name: "Present Simple",
    nameRu: "Настоящее простое",
    formula: "V / V-s (he/she/it) · do/does not + V",
    usage: "Факты, привычки, расписания и регулярные действия.",
    markers: "always, usually, often, every day, sometimes, never",
    examples: [
      { en: "She works in a bank.", ru: "Она работает в банке." },
      { en: "Water boils at 100°C.", ru: "Вода кипит при 100°C." },
      { en: "I don't drink coffee.", ru: "Я не пью кофе." },
    ],
  },
  {
    id: "present-continuous",
    name: "Present Continuous",
    nameRu: "Настоящее длительное",
    formula: "am / is / are + V-ing",
    usage: "Действие происходит сейчас или в данный период; временные ситуации.",
    markers: "now, at the moment, currently, today, these days",
    examples: [
      { en: "I am studying English now.", ru: "Я сейчас учу английский." },
      { en: "They are building a new bridge.", ru: "Они строят новый мост." },
      { en: "He is not working today.", ru: "Он сегодня не работает." },
    ],
  },
  {
    id: "present-perfect",
    name: "Present Perfect",
    nameRu: "Настоящее совершённое",
    formula: "have / has + V3 (past participle)",
    usage: "Результат в настоящем; опыт; действие, завершённое к настоящему моменту.",
    markers: "just, already, yet, ever, never, since, for, recently",
    examples: [
      { en: "I have finished my homework.", ru: "Я закончил домашнюю работу." },
      { en: "She has lived here for ten years.", ru: "Она живёт здесь десять лет." },
      { en: "Have you ever been to London?", ru: "Ты когда-нибудь был в Лондоне?" },
    ],
  },
  {
    id: "present-perfect-continuous",
    name: "Present Perfect Continuous",
    nameRu: "Настоящее совершённое длительное",
    formula: "have / has been + V-ing",
    usage: "Действие началось в прошлом, длилось и связано с настоящим (важна длительность).",
    markers: "for, since, all day, how long, lately",
    examples: [
      { en: "I have been studying for three hours.", ru: "Я учусь уже три часа." },
      { en: "It has been raining since morning.", ru: "Дождь идёт с утра." },
    ],
  },
  {
    id: "past-simple",
    name: "Past Simple",
    nameRu: "Прошедшее простое",
    formula: "V2 (V-ed / irregular) · did not + V",
    usage: "Завершённое действие в прошлом с указанием времени.",
    markers: "yesterday, ago, last week, in 2010, when",
    examples: [
      { en: "We visited Rome last year.", ru: "Мы ездили в Рим в прошлом году." },
      { en: "He went home early.", ru: "Он ушёл домой рано." },
      { en: "I didn't see her.", ru: "Я её не видел." },
    ],
  },
  {
    id: "past-continuous",
    name: "Past Continuous",
    nameRu: "Прошедшее длительное",
    formula: "was / were + V-ing",
    usage: "Действие длилось в определённый момент прошлого; фон для другого действия.",
    markers: "while, when, at 5 pm yesterday, as",
    examples: [
      { en: "I was cooking when he called.", ru: "Я готовил, когда он позвонил." },
      { en: "They were watching TV all evening.", ru: "Они смотрели ТВ весь вечер." },
    ],
  },
  {
    id: "past-perfect",
    name: "Past Perfect",
    nameRu: "Прошедшее совершённое",
    formula: "had + V3 (past participle)",
    usage: "Действие, завершённое раньше другого действия в прошлом.",
    markers: "by the time, before, after, already, when",
    examples: [
      { en: "The train had left before we arrived.", ru: "Поезд ушёл до того, как мы приехали." },
      { en: "She had already eaten.", ru: "Она уже поела." },
    ],
  },
  {
    id: "past-perfect-continuous",
    name: "Past Perfect Continuous",
    nameRu: "Прошедшее совершённое длительное",
    formula: "had been + V-ing",
    usage: "Действие длилось до другого действия в прошлом (акцент на длительности).",
    markers: "for, since, before, until, how long",
    examples: [
      { en: "I had been waiting for two hours before the bus came.", ru: "Я ждал два часа, прежде чем пришёл автобус." },
      { en: "She had been working there since 2010.", ru: "Она работала там с 2010 года." },
    ],
  },
  {
    id: "future-simple",
    name: "Future Simple (will)",
    nameRu: "Будущее простое",
    formula: "will + V",
    usage: "Спонтанные решения, прогнозы, обещания, факты о будущем.",
    markers: "tomorrow, next week, soon, I think, probably",
    examples: [
      { en: "I will call you tomorrow.", ru: "Я позвоню тебе завтра." },
      { en: "It will rain later.", ru: "Позже пойдёт дождь." },
    ],
  },
  {
    id: "future-going-to",
    name: "Future: going to",
    nameRu: "Будущее: be going to",
    formula: "am / is / are going to + V",
    usage: "Планы, намерения и предсказания на основе очевидных признаков.",
    markers: "tonight, this weekend, plan, intend",
    examples: [
      { en: "I am going to start a new course.", ru: "Я собираюсь начать новый курс." },
      { en: "Look at the clouds — it is going to rain.", ru: "Посмотри на тучи — будет дождь." },
    ],
  },
  {
    id: "future-continuous",
    name: "Future Continuous",
    nameRu: "Будущее длительное",
    formula: "will be + V-ing",
    usage: "Действие будет длиться в определённый момент в будущем.",
    markers: "at this time tomorrow, at 8 pm, all day",
    examples: [
      { en: "This time tomorrow I will be flying to Paris.", ru: "Завтра в это время я буду лететь в Париж." },
      { en: "She will be working at 9 am.", ru: "В 9 утра она будет работать." },
    ],
  },
  {
    id: "future-perfect",
    name: "Future Perfect",
    nameRu: "Будущее совершённое",
    formula: "will have + V3 (past participle)",
    usage: "Действие, которое завершится к определённому моменту в будущем.",
    markers: "by, by the time, before, until, next year",
    examples: [
      { en: "I will have finished the report by 5 pm.", ru: "Я закончу отчёт к 5 вечера." },
      { en: "By next year she will have graduated.", ru: "К следующему году она закончит университет." },
    ],
  },
];

export const grammarExercises: GrammarExercise[] = [
  // Present Simple
  { id: 1, tenseId: "present-simple", sentence: "She ___ to work by bus every day.", hint: "go", options: ["go", "goes", "is going", "went"], answer: 1, explanation: "Привычка + he/she/it → глагол с -s: goes." },
  { id: 2, tenseId: "present-simple", sentence: "They ___ like spicy food.", hint: "отрицание", options: ["doesn't", "don't", "aren't", "didn't"], answer: 1, explanation: "Отрицание в Present Simple для they → don't." },
  { id: 3, tenseId: "present-simple", sentence: "Water ___ at 100 degrees.", hint: "boil", options: ["boil", "boils", "is boiling", "boiled"], answer: 1, explanation: "Научный факт → Present Simple, it → boils." },
  // Present Continuous
  { id: 4, tenseId: "present-continuous", sentence: "Be quiet! The baby ___.", hint: "sleep", options: ["sleeps", "is sleeping", "slept", "sleep"], answer: 1, explanation: "Действие прямо сейчас → am/is/are + V-ing." },
  { id: 5, tenseId: "present-continuous", sentence: "Look! It ___ outside.", hint: "rain", options: ["rains", "rained", "is raining", "rain"], answer: 2, explanation: "Маркер Look! указывает на действие сейчас → is raining." },
  { id: 6, tenseId: "present-continuous", sentence: "I ___ a lot of books these days.", hint: "read", options: ["read", "am reading", "have read", "reads"], answer: 1, explanation: "these days = временной период вокруг настоящего → Present Continuous." },
  // Present Perfect
  { id: 7, tenseId: "present-perfect", sentence: "I ___ already ___ my homework.", hint: "finish", options: ["have / finished", "has / finished", "did / finish", "am / finishing"], answer: 0, explanation: "Маркер already → Present Perfect: have + V3 (finished)." },
  { id: 8, tenseId: "present-perfect", sentence: "She ___ here since 2015.", hint: "live", options: ["lives", "lived", "has lived", "is living"], answer: 2, explanation: "since 2015 → Present Perfect: has lived." },
  { id: 9, tenseId: "present-perfect", sentence: "___ you ever ___ sushi?", hint: "try", options: ["Did / try", "Have / tried", "Are / trying", "Do / try"], answer: 1, explanation: "ever (опыт) → Present Perfect: Have you ever tried." },
  // Present Perfect Continuous
  { id: 10, tenseId: "present-perfect-continuous", sentence: "I ___ for two hours and I'm tired.", hint: "study", options: ["study", "have been studying", "studied", "am studying"], answer: 1, explanation: "Длительность до настоящего (for two hours) → have been + V-ing." },
  { id: 11, tenseId: "present-perfect-continuous", sentence: "It ___ since this morning.", hint: "snow", options: ["snows", "has been snowing", "snowed", "is snowing"], answer: 1, explanation: "since this morning + акцент на длительность → has been snowing." },
  // Past Simple
  { id: 12, tenseId: "past-simple", sentence: "We ___ to Spain last summer.", hint: "go", options: ["go", "went", "have gone", "were going"], answer: 1, explanation: "last summer → завершённое прошлое: go → went (неправ.)." },
  { id: 13, tenseId: "past-simple", sentence: "He ___ the email an hour ago.", hint: "send", options: ["sends", "sent", "has sent", "was sending"], answer: 1, explanation: "ago → Past Simple: send → sent." },
  { id: 14, tenseId: "past-simple", sentence: "I ___ see the film yesterday.", hint: "отрицание", options: ["don't", "didn't", "haven't", "wasn't"], answer: 1, explanation: "Отрицание в прошлом → didn't + базовый глагол." },
  // Past Continuous
  { id: 15, tenseId: "past-continuous", sentence: "I ___ dinner when the phone rang.", hint: "cook", options: ["cooked", "was cooking", "cook", "have cooked"], answer: 1, explanation: "Длительное действие, прерванное другим → was/were + V-ing." },
  { id: 16, tenseId: "past-continuous", sentence: "While they ___, it started to rain.", hint: "walk", options: ["walked", "were walking", "walk", "had walked"], answer: 1, explanation: "While + фоновое действие → Past Continuous: were walking." },
  // Past Perfect
  { id: 17, tenseId: "past-perfect", sentence: "The film ___ before we arrived.", hint: "start", options: ["started", "had started", "starts", "was starting"], answer: 1, explanation: "Раньше другого прошлого действия → had + V3." },
  { id: 18, tenseId: "past-perfect", sentence: "By 10 pm she ___ already ___ asleep.", hint: "fall", options: ["had / fallen", "has / fallen", "was / falling", "did / fall"], answer: 0, explanation: "By + время в прошлом → Past Perfect: had fallen." },
  // Past Perfect Continuous
  { id: 31, tenseId: "past-perfect-continuous", sentence: "I ___ for two hours before the bus came.", hint: "wait", options: ["waited", "had been waiting", "was waiting", "have waited"], answer: 1, explanation: "Длительность до другого прошлого действия → had been + V-ing." },
  { id: 32, tenseId: "past-perfect-continuous", sentence: "She ___ there since 2010 before she moved.", hint: "work", options: ["worked", "had been working", "was working", "has worked"], answer: 1, explanation: "since + до другого прошлого → Past Perfect Continuous." },
  // Future Simple
  { id: 19, tenseId: "future-simple", sentence: "I think it ___ snow tomorrow.", hint: "will?", options: ["will", "is going to", "going to", "shall"], answer: 0, explanation: "Прогноз с I think → will." },
  { id: 20, tenseId: "future-simple", sentence: "Don't worry, I ___ help you.", hint: "promise", options: ["am helping", "will", "helped", "help"], answer: 1, explanation: "Спонтанное обещание → will help." },
  // Future going to
  { id: 21, tenseId: "future-going-to", sentence: "We ___ visit grandma this weekend (plan).", hint: "plan", options: ["will", "are going to", "go", "going"], answer: 1, explanation: "Заранее запланированное действие → be going to." },
  { id: 22, tenseId: "future-going-to", sentence: "Look at the sky! It ___ rain.", hint: "evidence", options: ["will", "is going to", "rains", "rained"], answer: 1, explanation: "Предсказание по очевидным признакам → is going to." },
  // Future Continuous
  { id: 23, tenseId: "future-continuous", sentence: "At 9 am tomorrow I ___ an exam.", hint: "take", options: ["will take", "will be taking", "take", "am taking"], answer: 1, explanation: "Действие в процессе в момент будущего → will be + V-ing." },
  // Future Perfect
  { id: 33, tenseId: "future-perfect", sentence: "I ___ the report by 5 pm.", hint: "finish", options: ["will finish", "will have finished", "finish", "am finishing"], answer: 1, explanation: "by 5 pm = к моменту в будущем → will have + V3." },
  { id: 34, tenseId: "future-perfect", sentence: "By next year she ___ university.", hint: "finish", options: ["will finish", "will have finished", "finishes", "is finishing"], answer: 1, explanation: "By next year → Future Perfect: will have finished." },
  // Mixed contrast
  { id: 24, tenseId: "present-perfect", sentence: "I ___ my keys. I can't find them now.", hint: "lose", options: ["lost", "have lost", "had lost", "lose"], answer: 1, explanation: "Результат важен сейчас → Present Perfect: have lost." },
  { id: 25, tenseId: "past-simple", sentence: "When ___ you ___ English?", hint: "start", options: ["have / started", "did / start", "do / start", "are / starting"], answer: 1, explanation: "Вопрос о конкретном моменте в прошлом → did + start." },
  { id: 26, tenseId: "present-simple", sentence: "The train ___ at 7:00 every morning.", hint: "leave", options: ["is leaving", "leaves", "left", "has left"], answer: 1, explanation: "Расписание → Present Simple: leaves." },
  { id: 27, tenseId: "present-continuous", sentence: "Why ___ you ___ at me like that?", hint: "look", options: ["do / look", "are / looking", "did / look", "have / looked"], answer: 1, explanation: "Действие сейчас → are you looking." },
  { id: 28, tenseId: "past-continuous", sentence: "At 8 pm yesterday we ___ dinner.", hint: "have", options: ["had", "were having", "have had", "are having"], answer: 1, explanation: "Конкретный момент в прошлом → Past Continuous: were having." },
  { id: 29, tenseId: "future-simple", sentence: "Perhaps they ___ come to the party.", hint: "will?", options: ["will", "are going to", "come", "came"], answer: 0, explanation: "Неуверенность (perhaps) → will." },
  { id: 30, tenseId: "present-perfect-continuous", sentence: "How long ___ you ___ here?", hint: "wait", options: ["did / wait", "have / been waiting", "are / waiting", "do / wait"], answer: 1, explanation: "How long + длительность к настоящему → have you been waiting." },
];