// Real English: B1 -> B2. 24 topics, each with current slang, idioms, 2 grammar points and
// one task per skill. The page is src/RealEnglishPage.js, progress goes to submissions/{email}.realEnglish.
// Listening audio: public/course/real-english/NN.mp3 (made from listening.lines with Kokoro TTS).
//
// Topic shape:
//   slang / idioms: [phrase, meaning, example]
//   grammar: { name, rule, ex: [..] }, gq: [sentence with ___, accepted answers split by "|"]
//   reading: { title, text, q: [[question, [options], correctIndex]] }
//   listening: { who: [nameA, nameB], lines: [[0|1, text]], q: [[question, [options], correctIndex]] }
//   speaking: [three questions], writing: prompt

export const COURSE_INFO = {
  id: "real-english",
  title: "Real English: B1 → B2",
  short: "24 topics · slang, idioms, grammar · all 4 skills",
  note: "Slang is for conversations, chats and social media. In IELTS Writing stay formal; in Speaking, one natural idiom is enough.",
};

export const TASKS = [
  { id: "vocab", label: "Words", icon: "💬" },
  { id: "grammar", label: "Grammar", icon: "🧩" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "listening", label: "Listening", icon: "🎧" },
  { id: "speaking", label: "Speaking", icon: "🎤" },
  { id: "writing", label: "Writing", icon: "✍️" },
];

export const TOPICS = [
  {
    id: "t01", title: "First impressions & vibes", stage: "B1",
    slang: [
      ["vibe", "the feeling a person or place gives you", "This café has a really chill vibe."],
      ["lowkey", "a little; quietly, without showing it", "I'm lowkey nervous about tomorrow."],
      ["no cap", "honestly, I'm not lying", "Best pizza I've ever had, no cap."],
      ["it's giving…", "it looks like / it reminds me of…", "Your new jacket? It's giving rock star."],
    ],
    idioms: [
      ["break the ice", "start a conversation when people feel awkward", "He told a joke to break the ice."],
      ["hit it off", "like each other immediately", "We hit it off on the first day of school."],
      ["judge a book by its cover", "decide about someone from how they look", "She looks strict, but don't judge a book by its cover."],
    ],
    grammar: [
      { name: "Present simple vs present continuous", rule: "Present simple for habits and facts; present continuous for now and temporary situations.", ex: ["I usually wear jeans, but today I'm wearing a suit.", "She works in a bank. This month she's working from home."] },
      { name: "Stative verbs", rule: "Verbs of thinking, feeling and having (know, like, believe, seem, own) are not normally used in the continuous.", ex: ["I know him. (not I'm knowing him)", "He seems friendly."] },
    ],
    gq: [
      ["Right now I ___ (sit) in a café.", "am sitting|'m sitting"],
      ["He ___ (seem) really friendly.", "seems"],
      ["We usually ___ (meet) on Fridays.", "meet"],
      ["Look! It ___ (rain) again.", "is raining|'s raining"],
    ],
    reading: {
      title: "Seven seconds",
      text: "Psychologists say we decide what we think of a new person in about seven seconds. In that short time we notice their face, their clothes and, most of all, their body language. A warm smile and eye contact usually make a good impression, while crossed arms can look unfriendly. The surprising part is that first impressions are hard to change. Even when we learn new facts about someone, we often keep our first opinion. However, the research also shows that people who are curious and ask questions are remembered as more likeable, even if they were nervous at the start.",
      q: [
        ["What do we notice most in the first seconds?", ["Clothes", "Body language", "Voice"], 1],
        ["According to the text, first impressions are…", ["easy to change", "hard to change", "always wrong"], 1],
        ["Who is remembered as more likeable?", ["People who ask questions", "People who talk a lot", "People who never feel nervous"], 0],
      ],
    },
    listening: {
      who: ["Mia", "Jake"],
      lines: [
        [0, "Hi! I don't think we've met. I'm Mia. I'm lowkey hiding from the music, it's so loud."],
        [1, "Ha, same. I'm Jake. I'm a friend of Tom's. We play football together on Saturdays."],
        [0, "Oh nice. I know Tom from work. So what do you do, apart from football?"],
        [1, "I'm a student. I'm studying design, but right now I'm working in a café for the summer."],
        [0, "No way, which café? I'm always looking for a good one."],
        [1, "The Green Cup, near the park. It has a really calm vibe. Come by on Monday and the coffee's on me."],
        [0, "Deal. See? We hit it off already."],
      ],
      q: [
        ["How does Jake know Tom?", ["From work", "From football", "From university"], 1],
        ["What is Jake doing this summer?", ["Studying design", "Working in a café", "Travelling"], 1],
        ["What does Jake offer Mia?", ["A free coffee", "A football ticket", "A job"], 0],
      ],
    },
    speaking: ["What gives a place a good vibe for you?", "Do you think first impressions are usually right? Why?", "How do you break the ice with new people?"],
    writing: "Write a message to a new classmate (80–120 words). Say who you are, what you usually do and what you are doing these days. Use one idiom from this topic.",
  },
  {
    id: "t02", title: "Friends & group chats", stage: "B1",
    slang: [
      ["bestie", "best friend", "My bestie always knows when I'm sad."],
      ["spill the tea", "tell the gossip", "Come on, spill the tea! What happened at the party?"],
      ["left on read", "someone saw your message but didn't reply", "I texted him an hour ago and he left me on read."],
      ["say less", "OK, I understand, you don't need to explain", "\"Pizza at my place tonight?\" \"Say less.\""],
    ],
    idioms: [
      ["keep in touch", "continue to contact someone", "We moved to different cities but we keep in touch."],
      ["drift apart", "slowly become less close", "After school we drifted apart."],
      ["a shoulder to cry on", "someone who listens when you are upset", "She was always a shoulder to cry on."],
    ],
    grammar: [
      { name: "Present perfect vs past simple", rule: "Present perfect for experience and results with no finished time; past simple with a finished time (yesterday, in 2020, ago).", ex: ["I've known Aisha for years.", "We met at school ten years ago."] },
      { name: "for and since", rule: "for + a period (for three years); since + a starting point (since 2019, since Monday).", ex: ["We've been friends for ten years.", "She's lived here since 2021."] },
    ],
    gq: [
      ["I ___ (know) Aisha since 2019.", "have known|'ve known"],
      ["We ___ (meet) at school ten years ago.", "met"],
      ["Have you ever ___ (lose) your phone?", "lost"],
      ["She has lived here ___ three years.", "for"],
    ],
    reading: {
      title: "The 300-message problem",
      text: "Many young people say group chats are the main way they keep in touch with friends. But a recent survey found that the average student has nine active group chats and receives over 300 messages a day. Some people feel stressed when they cannot keep up and worry that friends will think they are rude. Others mute the chats and only check them once in the evening. Experts suggest that it is fine to take a break, and that a quick voice message can feel more personal than ten emojis. As one student put it: real friends don't count how fast you reply.",
      q: [
        ["How many active group chats does the average student have?", ["Three", "Nine", "Three hundred"], 1],
        ["Some people mute chats and…", ["delete them", "check them once in the evening", "leave the group"], 1],
        ["What do experts say about voice messages?", ["They can feel more personal", "They are rude", "They take too long"], 0],
      ],
    },
    listening: {
      who: ["Aru", "Dan"],
      lines: [
        [0, "Okay, spill the tea. Why did you leave the group chat yesterday?"],
        [1, "Honestly, it was too much. I've had two hundred messages since Monday and most of them were memes."],
        [0, "Fair. But Leila thought you were angry with her."],
        [1, "No way! I've known Leila since primary school. I'll call her tonight."],
        [0, "Good. And maybe just mute the chat next time instead of leaving."],
        [1, "Say less. I'll join again after I talk to her."],
      ],
      q: [
        ["Why did Dan leave the chat?", ["He was angry with Leila", "There were too many messages", "He lost his phone"], 1],
        ["How long has Dan known Leila?", ["Since Monday", "Since primary school", "For one year"], 1],
        ["What will Dan do tonight?", ["Call Leila", "Delete the app", "Send memes"], 0],
      ],
    },
    speaking: ["How do you usually keep in touch with friends?", "Have you ever drifted apart from a friend? What happened?", "Are group chats good or bad for friendships?"],
    writing: "Write about your closest friend (80–120 words): how long you have known them, how you met and what you have done together. Use the present perfect, the past simple and for/since.",
  },
  {
    id: "t03", title: "Food & cafés", stage: "B1",
    slang: [
      ["bussin'", "extremely tasty", "These dumplings are bussin'."],
      ["mid", "average, not very good", "The burger was mid, to be honest."],
      ["hangry", "angry because you are hungry", "Feed me before I get hangry."],
      ["girl dinner", "a random plate of snacks eaten as a meal", "Cheese, crackers and grapes: girl dinner."],
    ],
    idioms: [
      ["a piece of cake", "very easy", "The test was a piece of cake."],
      ["have a sweet tooth", "love sweet food", "I have a real sweet tooth, I can't say no to cake."],
      ["bite off more than you can chew", "try to do more than you can manage", "I bit off more than I could chew with three jobs."],
    ],
    grammar: [
      { name: "Quantifiers", rule: "much + uncountable, many + countable; a little + uncountable, a few + countable (in questions and negatives: much/many; in positives: a lot of).", ex: ["There isn't much sugar.", "I've got a few vegan friends."] },
      { name: "too and enough", rule: "too + adjective (more than OK); adjective + enough (as much as needed); enough + noun.", ex: ["The soup is too hot.", "Is it big enough? We don't have enough chairs."] },
    ],
    gq: [
      ["There isn't ___ milk left.", "much"],
      ["I've got ___ friends who are vegan. (a small number)", "a few"],
      ["This soup is ___ hot to eat.", "too"],
      ["Is the pizza big ___ for four people?", "enough"],
    ],
    reading: {
      title: "The café as a third place",
      text: "Sociologists talk about the 'third place': somewhere that is not home and not work, where people can relax and meet others. For many young people today, the third place is a café. A coffee costs less than a cinema ticket, the wifi is free, and nobody asks you to leave. Some cafés now offer 'laptop-free' tables to keep conversation alive, while others sell work passes so students can stay all day. Owners say the busiest time is no longer the morning rush but the late afternoon, when students arrive with their books and order one drink and a lot of snacks.",
      q: [
        ["What is a 'third place'?", ["A third home", "A place that is not home or work", "A cheap restaurant"], 1],
        ["Why do some cafés have laptop-free tables?", ["To keep conversation alive", "To save electricity", "To sell more food"], 0],
        ["When is the busiest time now?", ["Early morning", "Lunchtime", "Late afternoon"], 2],
      ],
    },
    listening: {
      who: ["Zara", "Ben"],
      lines: [
        [0, "I'm so hangry. Can we order now?"],
        [1, "Sure. The reviews say the ramen here is bussin'."],
        [0, "Hmm, it's too spicy for me. I'll get the chicken salad."],
        [1, "Are you sure that's enough? You said you were starving."],
        [0, "Fine, and a few dumplings too. Do they have any desserts? I've got such a sweet tooth."],
        [1, "Only cheesecake, and people say it's a bit mid. Let's go to the bakery after."],
      ],
      q: [
        ["Why doesn't Zara order the ramen?", ["It's too expensive", "It's too spicy", "It's sold out"], 1],
        ["What does Zara add to her order?", ["Some dumplings", "A cheesecake", "A soup"], 0],
        ["Where will they go after?", ["Home", "A bakery", "Another café"], 1],
      ],
    },
    speaking: ["Describe a café or restaurant you love.", "Do young people eat out more than older people in your country?", "Is it better to cook at home or eat out? Why?"],
    writing: "Write a short review of a café (80–120 words) for a social media post. Say what was bussin' and what was mid. Use too, enough and at least two quantifiers.",
  },
  {
    id: "t04", title: "Money & being broke", stage: "B1",
    slang: [
      ["broke", "having no money", "I can't come, I'm broke until payday."],
      ["bougie", "liking expensive, fancy things", "Oat milk and a candle for $40? So bougie."],
      ["flex", "showing off something you have", "Posting his new car was a flex."],
      ["loud budgeting", "saying openly that you are saving money instead of spending", "No dinner out for me, I'm loud budgeting this month."],
    ],
    idioms: [
      ["cost an arm and a leg", "be very expensive", "Concert tickets cost an arm and a leg."],
      ["tighten your belt", "spend less money", "After the holiday we had to tighten our belts."],
      ["money doesn't grow on trees", "money is limited, don't waste it", "Turn the lights off, money doesn't grow on trees!"],
    ],
    grammar: [
      { name: "First conditional", rule: "If + present simple, will + verb: a real possibility in the future.", ex: ["If I save $20 a week, I'll have $1,000 in a year.", "If you lend me $10, I'll pay you back tomorrow."] },
      { name: "unless, as soon as, when", rule: "unless = if not. After unless/as soon as/when about the future we use the present simple.", ex: ["I won't buy it unless it's on sale.", "As soon as I get paid, I'll buy the tickets."] },
    ],
    gq: [
      ["If I ___ (save) $20 a week, I'll have $1,000 in a year.", "save"],
      ["I won't buy it ___ it's on sale.", "unless"],
      ["If you lend me $10, I ___ (pay) you back tomorrow.", "will pay|'ll pay"],
      ["As soon as I ___ (get) paid, I'll buy concert tickets.", "get"],
    ],
    reading: {
      title: "Why 'loud budgeting' went viral",
      text: "In 2024 a new trend appeared on social media: loud budgeting. Instead of quietly saying 'I'm busy' when friends invite them to an expensive dinner, people simply say 'I'm saving money this month.' Supporters say it removes the shame of being broke and helps friends choose cheaper plans, such as picnics or movie nights at home. Financial advisers like the idea because it makes saving a social goal, not a secret. Critics, however, say it can become another kind of flex, where people post screenshots of their savings apps to look disciplined.",
      q: [
        ["What do loud budgeters say to friends?", ["I'm busy", "I'm saving money", "I'm ill"], 1],
        ["Why do financial advisers like the trend?", ["It makes saving a social goal", "It sells more apps", "It is a secret"], 0],
        ["What is the critics' worry?", ["It is too expensive", "It can become a kind of flex", "It is not popular"], 1],
      ],
    },
    listening: {
      who: ["Leo", "Sara"],
      lines: [
        [0, "Are you coming to the concert on Friday?"],
        [1, "I'd love to, but the tickets cost an arm and a leg. I'm kind of broke."],
        [0, "If you buy them today, you'll get twenty percent off."],
        [1, "Still too much. I won't go unless my sister lends me the money."],
        [0, "What about the free festival in the park on Sunday?"],
        [1, "Now that's my kind of plan. As soon as I finish work, I'll meet you there."],
      ],
      q: [
        ["Why isn't Sara sure about the concert?", ["She is busy", "Tickets are too expensive", "She doesn't like the band"], 1],
        ["What discount is there today?", ["10%", "20%", "50%"], 1],
        ["What do they decide to do?", ["Go to a free festival", "Buy concert tickets", "Stay at home"], 0],
      ],
    },
    speaking: ["Do you prefer to save money or spend it? Why?", "What is something that costs an arm and a leg in your city?", "Should children get pocket money?"],
    writing: "Your friend wants to buy an expensive phone. Write them a message (80–120 words) with advice. Use at least three first conditional sentences and unless.",
  },
  {
    id: "t05", title: "Social media life", stage: "B1",
    slang: [
      ["doomscrolling", "scrolling through bad or useless news for a long time", "I was doomscrolling until 2 a.m."],
      ["FOMO", "fear of missing out", "I went to the party because of FOMO."],
      ["touch grass", "go outside and take a break from the internet", "You've been online all day. Go touch grass."],
      ["main character energy", "acting like the star of your own life", "Walking in the rain with headphones? Main character energy."],
    ],
    idioms: [
      ["go down a rabbit hole", "get lost in one topic for a long time", "I went down a rabbit hole of cat videos."],
      ["kill time", "do something while waiting", "I scroll TikTok to kill time on the bus."],
      ["out of the loop", "not knowing the latest information", "I deleted Instagram, so I'm out of the loop."],
    ],
    grammar: [
      { name: "Present perfect continuous", rule: "have/has been + -ing for an activity that started in the past and is still going on (or just stopped), often with how long.", ex: ["I've been scrolling for two hours.", "How long have you been learning English?"] },
      { name: "just, already, yet", rule: "just = a moment ago; already = earlier than expected (positive); yet = until now (questions and negatives, at the end).", ex: ["She's just posted it.", "Have you watched it yet? I've already seen it."] },
    ],
    gq: [
      ["I ___ (scroll) for two hours. My eyes hurt!", "have been scrolling|'ve been scrolling"],
      ["Have you watched the new video ___?", "yet"],
      ["She has ___ posted it. It's only one minute old.", "just"],
      ["We've ___ seen this meme. It's so old.", "already"],
    ],
    reading: {
      title: "Brain rot and the 30-minute rule",
      text: "In 2024 'brain rot' was chosen as the Oxford Word of the Year. It describes the tired, empty feeling after hours of watching low-quality content. Researchers say the problem is not social media itself but the endless feed, which never gives our brain a natural stopping point. Some students now use a simple '30-minute rule': after half an hour they close the app and do something offline, even for five minutes. In one small study, students who followed the rule for two weeks said they slept better and felt less FOMO, although they used social media for nearly the same total time.",
      q: [
        ["What does 'brain rot' describe?", ["A tired, empty feeling", "A health app", "A new phone"], 0],
        ["What is the main problem, according to researchers?", ["Social media itself", "The endless feed", "Bad wifi"], 1],
        ["What happened to students who used the rule?", ["They used social media much less", "They slept better", "They deleted their apps"], 1],
      ],
    },
    listening: {
      who: ["Nina", "Sam"],
      lines: [
        [0, "You look tired. Have you been doomscrolling again?"],
        [1, "Guilty. I've been watching videos since midnight. I went down a total rabbit hole about space."],
        [0, "Have you finished your essay yet?"],
        [1, "Not yet. I've just started the introduction."],
        [0, "Okay, phone in the drawer for one hour. Then we go to the park and touch grass."],
        [1, "Fine. But only because I've already missed two deadlines this month."],
      ],
      q: [
        ["What was Sam watching?", ["Music videos", "Videos about space", "The news"], 1],
        ["How much of his essay has Sam written?", ["None", "He has just started", "All of it"], 1],
        ["What will they do after an hour?", ["Go to the park", "Watch a film", "Sleep"], 0],
      ],
    },
    speaking: ["How much time do you spend on social media each day?", "Have you ever had FOMO? Describe the situation.", "Should there be an age limit for social media?"],
    writing: "Write a short post (80–120 words) about your phone habits. Say how long you have been using social media today and what you have already done or not done yet.",
  },
  {
    id: "t06", title: "Work & side hustles", stage: "B1",
    slang: [
      ["side hustle", "a second job or small business next to your main job or studies", "Her side hustle is selling handmade earrings."],
      ["the grind", "hard, continuous work", "Back to the grind on Monday."],
      ["quiet quitting", "doing only the minimum your job asks for", "He stopped staying late. Some call it quiet quitting."],
      ["WFH", "working from home", "I'm WFH on Fridays."],
    ],
    idioms: [
      ["learn the ropes", "learn how to do a new job", "It took me a month to learn the ropes."],
      ["call it a day", "stop working for today", "It's 7 p.m. Let's call it a day."],
      ["pull your weight", "do your fair share of the work", "Everyone in the team has to pull their weight."],
    ],
    grammar: [
      { name: "must, have to, don't have to, mustn't", rule: "must/have to = necessary; don't have to = not necessary; mustn't = not allowed.", ex: ["I have to start at 8.", "You don't have to wear a suit, but you mustn't be late."] },
      { name: "should / ought to", rule: "should + verb for advice; ought to means the same and is a bit more formal.", ex: ["You should ask for a raise.", "You ought to update your CV."] },
    ],
    gq: [
      ["You ___ wear a uniform. Jeans are fine.", "don't have to|do not have to"],
      ["You ___ smoke in the office. It's against the rules.", "mustn't|must not"],
      ["I ___ start work at 8 every day. (it's my boss's rule)", "have to"],
      ["You ___ ask for a raise. You deserve it! (advice)", "should|ought to"],
    ],
    reading: {
      title: "The rise of the side hustle",
      text: "Around four in ten young adults in the UK and the US now have a side hustle. Some do it for extra money, while others want to test a business idea without quitting their main job. Popular choices include tutoring, editing videos, reselling clothes online and designing logos. Experts say a side hustle can teach skills that employers value, like marketing and time management. But they also warn about burnout: if you work all week and then all weekend, you don't have time to rest. Their advice is to choose something you enjoy and to set clear hours, just like a real job.",
      q: [
        ["How many young adults have a side hustle?", ["About one in ten", "About four in ten", "Almost all"], 1],
        ["What can a side hustle teach?", ["Marketing and time management", "Only cooking", "Nothing useful"], 0],
        ["What do experts advise?", ["Work every weekend", "Set clear hours", "Quit your main job"], 1],
      ],
    },
    listening: {
      who: ["Kate", "Arman"],
      lines: [
        [0, "How's the new job? Have you learned the ropes yet?"],
        [1, "Almost. The good news is I don't have to wear a suit. The bad news is I have to start at seven thirty."],
        [0, "Ouch. Are you still doing your side hustle?"],
        [1, "Yeah, I edit videos for two small brands in the evenings."],
        [0, "You should be careful. You mustn't burn out in your first month."],
        [1, "True. I'm going to call it a day at nine, no matter what."],
      ],
      q: [
        ["What is good about Arman's new job?", ["He can work from home", "He doesn't have to wear a suit", "He starts late"], 1],
        ["What is his side hustle?", ["Tutoring", "Editing videos", "Selling clothes"], 1],
        ["What does Arman decide?", ["To quit the side hustle", "To stop work at nine", "To ask for a raise"], 1],
      ],
    },
    speaking: ["Would you like to have a side hustle? What kind?", "What rules do students have to follow at your school or university?", "Is working from home better than working in an office?"],
    writing: "Write an email (80–120 words) to a new team member explaining the rules of your workplace or class. Use have to, don't have to, mustn't and should.",
  },
  {
    id: "t07", title: "Travel fails", stage: "B1+",
    slang: [
      ["big yikes", "that's very awkward or bad", "He forgot his passport at home? Big yikes."],
      ["cooked", "in big trouble, with no way to fix it", "The last train has left. We're cooked."],
      ["a mood", "a feeling everyone can relate to", "Sleeping in the airport chair? A mood."],
      ["the struggle is real", "this is really difficult (said with humour)", "Carrying three suitcases up the stairs: the struggle is real."],
    ],
    idioms: [
      ["in the middle of nowhere", "far from towns and people", "Our bus broke down in the middle of nowhere."],
      ["travel light", "take very little luggage", "I always travel light, just a backpack."],
      ["a blessing in disguise", "something bad that turns out to be good", "Missing the flight was a blessing in disguise: we met amazing people."],
    ],
    grammar: [
      { name: "Past continuous", rule: "was/were + -ing for a background action, often interrupted by a short action in the past simple.", ex: ["I was waiting for the bus when it started to rain.", "While we were sleeping, someone stole our bags."] },
      { name: "Past perfect", rule: "had + past participle for an action that happened before another past action.", ex: ["When we got to the gate, the plane had already left.", "I realised I'd forgotten my passport."] },
    ],
    gq: [
      ["I ___ (wait) for the bus when it started to rain.", "was waiting"],
      ["When we got to the airport, the plane had already ___ (leave).", "left"],
      ["While she was sleeping, someone ___ (steal) her bag.", "stole"],
      ["I realised I ___ (forget) my passport.", "had forgotten|'d forgotten"],
    ],
    reading: {
      title: "The trip that went wrong (and right)",
      text: "Last summer, Dina and her brother were travelling to a small village in the mountains. They had booked a guesthouse online and had paid for two nights. But when they arrived late at night, the owner had never heard of them: the website was a scam. It was raining, they were in the middle of nowhere, and their phones were dying. A local family who were driving past stopped and offered them a room. They stayed for three days, learned to make bread and went hiking with the family's children. 'It was a blessing in disguise,' Dina says. 'It was the best part of the trip.'",
      q: [
        ["What was wrong with the guesthouse?", ["It was full", "The website was a scam", "It was closed for repairs"], 1],
        ["Who helped them?", ["The police", "A local family", "The guesthouse owner"], 1],
        ["How did Dina feel about the trip in the end?", ["It was the best part", "She wants her money back", "She will never travel again"], 0],
      ],
    },
    listening: {
      who: ["Max", "Lina"],
      lines: [
        [0, "How was Istanbul?"],
        [1, "Don't ask. On the first day I was taking photos on the ferry when my phone fell into the water."],
        [0, "Big yikes. Did you have a backup?"],
        [1, "No. And I hadn't saved the hotel address anywhere, so I was totally cooked."],
        [0, "So what did you do?"],
        [1, "A man who was sitting next to me helped me find it on his map. We're friends now. Blessing in disguise, I guess."],
      ],
      q: [
        ["What was Lina doing when she lost her phone?", ["Eating", "Taking photos on a ferry", "Shopping"], 1],
        ["Why was the situation bad?", ["She hadn't saved the hotel address", "She had no money", "She missed her flight"], 0],
        ["Who helped her?", ["A hotel worker", "A man next to her", "Her friend Max"], 1],
      ],
    },
    speaking: ["Tell me about a trip that didn't go as planned.", "Do you prefer to travel light? Why?", "What is the most important thing to plan before a trip?"],
    writing: "Write a story (100–140 words) that begins: 'We were waiting at the station when…'. Use the past continuous, the past simple and the past perfect.",
  },
  {
    id: "t08", title: "Sleep & health", stage: "B1+",
    slang: [
      ["sleepmaxxing", "trying every trick to get perfect sleep", "Mouth tape, eye mask, magnesium: she's sleepmaxxing."],
      ["bed rotting", "staying in bed all day to rest and do nothing", "Sunday was pure bed rotting."],
      ["wiped", "extremely tired", "After the exam I was completely wiped."],
      ["glow-up", "a big improvement in how someone looks or feels", "Drinking more water was her glow-up secret."],
    ],
    idioms: [
      ["under the weather", "a little ill", "I'm a bit under the weather today."],
      ["sleep like a log", "sleep very deeply", "After hiking we slept like logs."],
      ["burn the candle at both ends", "work late and get up early until you are exhausted", "Studying all night and working all day, she was burning the candle at both ends."],
    ],
    grammar: [
      { name: "used to / would", rule: "used to + verb for past habits and states that are not true now; would + verb for repeated past actions (not states).", ex: ["I used to drink five coffees a day.", "As kids, we would stay up and read with a torch."] },
      { name: "Gerund or infinitive", rule: "Some verbs take -ing (enjoy, avoid, finish), others take to + verb (decide, want, hope). stop doing = finish a habit; stop to do = stop in order to do.", ex: ["I enjoy walking in the morning.", "She decided to go to bed earlier."] },
    ],
    gq: [
      ["I ___ drink five coffees a day, but now I drink one.", "used to"],
      ["I enjoy ___ (walk) in the morning.", "walking"],
      ["She decided ___ (go) to bed earlier.", "to go"],
      ["Did you ___ stay up late as a teenager?", "use to"],
    ],
    reading: {
      title: "Teenagers are not lazy",
      text: "Parents often complain that teenagers sleep too late. But scientists say it is not laziness. During the teenage years the body clock moves about two hours later, so a 16-year-old naturally feels sleepy at around 11 p.m. and wants to wake up at 8. When school starts at 8, many students are wiped before the first lesson. Some schools in the US have tried starting an hour later. Students there got more sleep, had better grades and were in fewer car accidents. Doctors also recommend avoiding screens for an hour before bed, because blue light tells the brain it is still daytime.",
      q: [
        ["Why do teenagers sleep late?", ["They are lazy", "Their body clock moves later", "They drink coffee"], 1],
        ["What happened in schools that started later?", ["Grades got better", "Students slept less", "Nothing changed"], 0],
        ["Why should you avoid screens before bed?", ["They are expensive", "Blue light tells the brain it is daytime", "They are noisy"], 1],
      ],
    },
    listening: {
      who: ["Ella", "Tim"],
      lines: [
        [0, "You look like you slept like a log."],
        [1, "Finally! I used to go to bed at two every night. Now I stop using my phone at eleven."],
        [0, "Impressive. I keep promising to do that, but I never manage it."],
        [1, "I also stopped drinking coffee after lunch. Total glow-up."],
        [0, "I'm so wiped this week. I've been burning the candle at both ends."],
        [1, "Try it for one week. If you hate it, you can go back to bed rotting on Sundays."],
      ],
      q: [
        ["What time did Tim use to go to bed?", ["Eleven", "Midnight", "Two o'clock"], 2],
        ["What else did Tim stop?", ["Coffee after lunch", "Sport", "Breakfast"], 0],
        ["How does Ella feel this week?", ["Very tired", "Relaxed", "Ill"], 0],
      ],
    },
    speaking: ["How many hours do you usually sleep?", "What did you use to do as a child that you don't do now?", "What is the best way to stay healthy as a student?"],
    writing: "Write about how your daily habits have changed (100–140 words). Use used to at least twice and three verbs followed by -ing or to + verb.",
  },
  {
    id: "t09", title: "City life", stage: "B1+",
    slang: [
      ["hidden gem", "a great place that few people know", "This tiny bookshop is a real hidden gem."],
      ["lit", "exciting and full of energy", "The city centre is lit on Friday nights."],
      ["the plug", "the person who can get you something or knows the best places", "Ask Asel, she's the plug for cheap tickets."],
      ["rent-free", "(in your head) you can't stop thinking about it", "That street food stall lives in my head rent-free."],
    ],
    idioms: [
      ["the concrete jungle", "a big city with lots of buildings and little nature", "I needed a break from the concrete jungle."],
      ["on the go", "busy and moving all the time", "City people eat on the go."],
      ["off the beaten track", "far from the places tourists usually visit", "We found a café off the beaten track."],
    ],
    grammar: [
      { name: "Comparatives and superlatives", rule: "short adjectives: bigger, the biggest; long adjectives: more expensive, the most expensive; irregular: good, better, the best.", ex: ["Almaty is bigger than Shymkent.", "This is the best coffee in town."] },
      { name: "(not) as…as, the more…the more", rule: "as + adjective + as = the same; not as…as = less. The + comparative, the + comparative shows two things changing together.", ex: ["The bus isn't as fast as the metro.", "The more you walk, the healthier you feel."] },
    ],
    gq: [
      ["Almaty is ___ (big) than Astana.", "bigger"],
      ["This is the ___ (good) coffee in town.", "best"],
      ["The bus isn't ___ fast as the metro.", "as"],
      ["The more you walk, the ___ (healthy) you feel.", "healthier"],
    ],
    reading: {
      title: "The 15-minute city",
      text: "Imagine living in a place where you can reach your school, a doctor, shops and a park in 15 minutes on foot or by bike. This is the idea of the '15-minute city', made popular by the mayor of Paris. Supporters say it makes life calmer and healthier: the more people walk, the less traffic there is. Cities like Melbourne and Barcelona have closed some streets to cars and turned them into small squares. But critics say the idea works better in rich city centres than in the suburbs, where flats are cheaper but jobs and services are further away.",
      q: [
        ["What can you reach in a 15-minute city?", ["Only shops", "School, doctor, shops and a park", "The airport"], 1],
        ["What have Melbourne and Barcelona done?", ["Built more roads", "Turned some streets into squares", "Opened new airports"], 1],
        ["Where does the idea work less well, according to critics?", ["In city centres", "In the suburbs", "In Paris"], 1],
      ],
    },
    listening: {
      who: ["Jon", "Aiko"],
      lines: [
        [0, "So, do you like living in the city now?"],
        [1, "Honestly, it's louder than my hometown, but it's way more lit. There's always something to do."],
        [0, "Isn't it more expensive too?"],
        [1, "Rent is the worst part. But my friend Malik is the plug, he knows all the cheap places."],
        [0, "Any hidden gems I should try?"],
        [1, "A tiny noodle bar off the beaten track, behind the old market. It lives in my head rent-free."],
      ],
      q: [
        ["How does Aiko compare the city to her hometown?", ["Quieter", "Louder but more exciting", "Cheaper"], 1],
        ["What is the worst part of city life for her?", ["Traffic", "Rent", "Noise"], 1],
        ["Where is the noodle bar?", ["Behind the old market", "In the city centre", "Near the station"], 0],
      ],
    },
    speaking: ["What is the best and worst thing about your city?", "Would you prefer to live in a big city or a small town?", "How could your city be better for young people?"],
    writing: "Compare your city with another city you know (100–140 words). Use comparatives, superlatives, not as…as and one 'the more… the more' sentence.",
  },
  {
    id: "t10", title: "Dating & situationships", stage: "B1+",
    slang: [
      ["rizz", "charm; the ability to attract someone", "He talked to her for five minutes and got her number. Serious rizz."],
      ["situationship", "a romantic relationship with no clear label", "Are they dating? No, it's a situationship."],
      ["the ick", "a sudden feeling of disgust for someone you liked", "He chewed with his mouth open and I got the ick."],
      ["ghost", "stop replying to someone with no explanation", "We went on three dates and then he ghosted me."],
    ],
    idioms: [
      ["head over heels", "completely in love", "She's head over heels for him."],
      ["plenty more fish in the sea", "there are many other people to date", "Don't cry, there are plenty more fish in the sea."],
      ["pop the question", "ask someone to marry you", "He popped the question on the beach."],
    ],
    grammar: [
      { name: "Second conditional", rule: "If + past simple, would + verb: an imaginary or unlikely situation now or in the future.", ex: ["If I had more rizz, I'd talk to her.", "What would you do if someone ghosted you?"] },
      { name: "I wish + past simple", rule: "wish + past simple for a present situation you want to be different (were is common for all persons).", ex: ["I wish I were braver.", "I wish he replied faster."] },
    ],
    gq: [
      ["If I ___ (have) more rizz, I'd talk to her.", "had"],
      ["If he texted me, I ___ (reply) at once.", "would reply|'d reply"],
      ["I wish I ___ (be) braver.", "were|was"],
      ["What would you do if someone ___ (ghost) you?", "ghosted"],
    ],
    reading: {
      title: "Why 'the ick' is everywhere",
      text: "'The ick' started as a joke on a British dating show and is now used all over the world. People share tiny things that suddenly make them lose interest: someone running for a bus, clapping when the plane lands, or using too many emojis. Psychologists say the ick is often not about the other person at all. Sometimes it appears when a relationship becomes serious and we feel nervous. Their advice? If a small habit gives you the ick, ask yourself whether you would still care about it if you really liked the person. If the answer is no, maybe the problem is somewhere else.",
      q: [
        ["Where did 'the ick' start?", ["On a dating show", "In a book", "In a song"], 0],
        ["According to psychologists, the ick sometimes appears when…", ["we are hungry", "a relationship becomes serious", "we use social media"], 1],
        ["What question do they suggest?", ["Would you care if you really liked the person?", "Is the person rich?", "Do your friends like them?"], 0],
      ],
    },
    listening: {
      who: ["Dina", "Chris"],
      lines: [
        [0, "So, are you and Amir dating now?"],
        [1, "It's complicated. It's more of a situationship. We text every day but he never makes plans."],
        [0, "If I were you, I'd just ask him what you are."],
        [1, "I know. I wish I were braver. What if he ghosts me?"],
        [0, "Then he's not the one. There are plenty more fish in the sea."],
        [1, "True. Okay, I'll ask him on Saturday. Wish me luck."],
      ],
      q: [
        ["How does Chris describe the relationship?", ["Serious", "A situationship", "Finished"], 1],
        ["What is Chris afraid of?", ["Amir will ghost him", "Amir will pop the question", "Amir will move away"], 0],
        ["When will Chris talk to Amir?", ["Tonight", "On Saturday", "Next month"], 1],
      ],
    },
    speaking: ["What qualities are important in a partner or a friend?", "What would you do if a friend ghosted you?", "Is online dating a good way to meet people?"],
    writing: "Write an advice column answer (100–140 words) to someone in a situationship. Use the second conditional at least three times and one sentence with I wish.",
  },
  {
    id: "t11", title: "Shopping & dupes", stage: "B1+",
    slang: [
      ["dupe", "a cheaper copy of an expensive product", "This $15 bag is a dupe of a $900 one."],
      ["haul", "a video or post showing everything you bought", "She posted a huge haul after the sale."],
      ["drip", "stylish clothes and accessories", "Check out his drip: new trainers and a vintage jacket."],
      ["retail therapy", "shopping to feel better", "Bad week? Time for some retail therapy."],
    ],
    idioms: [
      ["a rip-off", "much too expensive", "$12 for water? What a rip-off!"],
      ["shop till you drop", "shop for a very long time", "We shopped till we dropped in Dubai."],
      ["on a shoestring", "with very little money", "I furnished my flat on a shoestring."],
    ],
    grammar: [
      { name: "The passive (present and past)", rule: "be + past participle when the action is more important than who does it. Use by to say who.", ex: ["These trainers are made in Vietnam.", "The store was opened in 2015."] },
      { name: "have something done", rule: "have + object + past participle when someone else does a service for you.", ex: ["I'm having my phone screen fixed.", "She had her nails done."] },
    ],
    gq: [
      ["These trainers ___ (make) in Vietnam.", "are made"],
      ["The store ___ (open) in 2015.", "was opened"],
      ["I'm having my phone screen ___ (fix) today.", "fixed"],
      ["Millions of dupes ___ (sell) online every year.", "are sold"],
    ],
    reading: {
      title: "Dupe culture",
      text: "Not long ago, buying a copy of a famous product felt embarrassing. Today, many young shoppers proudly post their 'dupes' online. A dupe is not a fake: it does not use the original brand's name or logo, it simply looks and works in a similar way. Some shoppers say dupes are a smart reaction to rising prices. Brands, however, are worried, and a few have taken companies to court. Environmental groups add another point: whether a product is cheap or expensive, buying too much is the real problem. They suggest one simple question before you click 'buy': will I wear or use this at least thirty times?",
      q: [
        ["How is a dupe different from a fake?", ["It is more expensive", "It doesn't use the brand's name or logo", "It is made by the original brand"], 1],
        ["Why do some shoppers buy dupes?", ["Rising prices", "They are better quality", "They are made locally"], 0],
        ["What do environmental groups suggest?", ["Buy only dupes", "Ask if you will use it 30 times", "Never shop online"], 1],
      ],
    },
    listening: {
      who: ["Rita", "Omar"],
      lines: [
        [0, "Nice drip! Where did you get that jacket?"],
        [1, "Thanks! It's a dupe. The original costs four hundred dollars, which is a total rip-off. This was forty."],
        [0, "No way. It looks exactly the same."],
        [1, "And I had the sleeves shortened at a little shop near my house. Five dollars."],
        [0, "I need that. I'm on a shoestring this month, but I want something for the party."],
        [1, "Come with me on Saturday. But no shopping till we drop, okay? Two hours max."],
      ],
      q: [
        ["How much did Omar's jacket cost?", ["$5", "$40", "$400"], 1],
        ["What did Omar have done to the jacket?", ["The sleeves shortened", "The colour changed", "A logo added"], 0],
        ["What do they plan for Saturday?", ["Two hours of shopping", "A party", "A haul video"], 0],
      ],
    },
    speaking: ["Do you prefer shopping online or in shops?", "Is it OK to buy dupes? Why or why not?", "What was the last thing you had repaired or done for you?"],
    writing: "Write a product description (100–140 words) for an online shop. Use at least four passive sentences and one 'have something done'.",
  },
  {
    id: "t12", title: "Tech & AI", stage: "B1+",
    slang: [
      ["NPC", "a person who acts like a background game character, without their own ideas", "He just repeats what everyone says, total NPC."],
      ["brain rot", "low-quality content that makes you feel dull; the feeling itself", "Three hours of short videos. Pure brain rot."],
      ["glitch", "(my brain glitched) suddenly couldn't think", "The teacher asked me a question and my brain glitched."],
      ["AI slop", "low-quality content made quickly with AI", "My feed is full of AI slop."],
    ],
    idioms: [
      ["ahead of the curve", "more modern or advanced than others", "Our school is ahead of the curve with AI tools."],
      ["a double-edged sword", "something with both good and bad effects", "AI is a double-edged sword."],
      ["the tip of the iceberg", "a small visible part of a much bigger problem", "Fake videos are just the tip of the iceberg."],
    ],
    grammar: [
      { name: "Future forms", rule: "will for predictions and quick decisions; going to for plans and evidence-based predictions; present continuous for fixed arrangements.", ex: ["I think AI will change every job.", "Look at those clouds, it's going to rain.", "I'm meeting my tutor at 5."] },
      { name: "Future continuous", rule: "will be + -ing for an action in progress at a time in the future.", ex: ["This time tomorrow I'll be flying to Dubai.", "In 2040 we'll be using AI for everything."] },
    ],
    gq: [
      ["Look at those clouds. It ___ rain. (evidence)", "is going to|'s going to"],
      ["I think AI ___ (change) every job.", "will change|'ll change"],
      ["This time tomorrow I ___ (fly) to Dubai.", "will be flying|'ll be flying"],
      ["I ___ (meet) my tutor at 5. It's in my calendar.", "am meeting|'m meeting"],
    ],
    reading: {
      title: "Will AI take our jobs?",
      text: "Every big technology has made people worry about jobs. When cars appeared, horse drivers lost work; when computers arrived, typists did. AI is different because it can do tasks we thought only humans could do, like writing, translating and drawing. A 2025 report predicts that AI will change around 40% of jobs, but will fully replace only a small number. Most people will be using AI as an assistant, not losing their job to it. The report says the winners will be workers who are ahead of the curve: people who learn to use AI tools well and who keep skills machines find hard, like empathy and leadership.",
      q: [
        ["Why is AI different from earlier technology?", ["It is cheaper", "It can do tasks we thought only humans could do", "It is slower"], 1],
        ["What does the report predict?", ["AI will replace most jobs", "AI will change about 40% of jobs", "AI will not affect jobs"], 1],
        ["Which skills are hard for machines?", ["Translating", "Empathy and leadership", "Typing"], 1],
      ],
    },
    listening: {
      who: ["Eva", "Nurlan"],
      lines: [
        [0, "Are you going to use AI for your essay?"],
        [1, "Only to check grammar. Last time I let it write a paragraph and it was pure AI slop."],
        [0, "Ha. My teacher says AI is a double-edged sword."],
        [1, "True. Anyway, I'm meeting my study group at six. We're going to practise speaking without any apps."],
        [0, "Old school. This time next year we'll be talking to robots instead."],
        [1, "Maybe. But I think teachers will still exist. Robots can't give you a proper pep talk."],
      ],
      q: [
        ["What does Nurlan use AI for?", ["Writing essays", "Checking grammar", "Drawing"], 1],
        ["What is Nurlan doing at six?", ["Meeting his study group", "Going to the gym", "Writing his essay"], 0],
        ["What does Nurlan think about teachers?", ["They will disappear", "They will still exist", "They will be robots"], 1],
      ],
    },
    speaking: ["How do you use technology for studying?", "Do you think AI will help or hurt young people?", "What will you be doing in ten years?"],
    writing: "Write a paragraph (100–140 words): 'My life in 2035'. Use will, going to, the present continuous for one arrangement and the future continuous.",
  },
  {
    id: "t13", title: "Climate & eco life", stage: "B2",
    slang: [
      ["greenwashing", "pretending to be eco-friendly to sell more", "A 'green' bottle made of new plastic? That's greenwashing."],
      ["eco-anxiety", "stress and worry about climate change", "The fires gave me serious eco-anxiety."],
      ["thrifting", "buying second-hand clothes and things", "All my best jeans are from thrifting."],
      ["cottagecore", "a simple, romantic countryside style", "Baking bread and wearing long dresses: very cottagecore."],
    ],
    idioms: [
      ["a drop in the ocean", "a very small amount compared to what is needed", "One reusable bag is a drop in the ocean, but it's a start."],
      ["go green", "start living in a more eco-friendly way", "Our office has decided to go green."],
      ["turn over a new leaf", "start behaving in a better way", "I've turned over a new leaf: no more fast fashion."],
    ],
    grammar: [
      { name: "Zero conditional", rule: "If/When + present simple, present simple: facts and things that are always true.", ex: ["If you heat ice, it melts.", "When people don't sort waste, it goes to landfill."] },
      { name: "Passive with modals", rule: "modal (can/should/must/will) + be + past participle.", ex: ["Plastic bottles should be recycled.", "This problem can't be solved by one country."] },
    ],
    gq: [
      ["If you heat ice, it ___ (melt).", "melts"],
      ["Plastic bottles should ___ (recycle).", "be recycled"],
      ["If people ___ (not / sort) waste, it goes to landfill.", "don't sort|do not sort"],
      ["Cars must ___ (check) every year.", "be checked"],
    ],
    reading: {
      title: "Thrifting goes mainstream",
      text: "Second-hand shopping used to be seen as something people did only when they had no choice. Now it is one of the fastest-growing parts of the fashion industry. Apps like Vinted have made it easy to sell clothes you no longer wear, and 'thrift hauls' get millions of views. The environmental case is strong: making one new pair of jeans can use thousands of litres of water. However, researchers warn that if people buy second-hand clothes and then still buy just as many new ones, the benefit disappears. The most sustainable item, they say, is the one that is already in your wardrobe.",
      q: [
        ["How was second-hand shopping seen in the past?", ["As fashionable", "As something people did when they had no choice", "As expensive"], 1],
        ["What is one environmental cost of new jeans?", ["Electricity", "Thousands of litres of water", "Plastic packaging"], 1],
        ["When does the benefit of thrifting disappear?", ["If people still buy just as many new clothes", "If clothes are cheap", "If people use apps"], 0],
      ],
    },
    listening: {
      who: ["Mark", "Aida"],
      lines: [
        [0, "Is that a new coat? It looks great."],
        [1, "Thrifted! Eight dollars. I've decided to go green this year: no new clothes."],
        [0, "Respect. Some people say one person's choices are a drop in the ocean."],
        [1, "Maybe, but if everyone thinks like that, nothing changes. Habits spread."],
        [0, "Fair. Our university says all plastic must be sorted by next month."],
        [1, "Good. As long as it isn't just greenwashing for their website."],
      ],
      q: [
        ["How much was Aida's coat?", ["$8", "$18", "$80"], 0],
        ["What is Aida's plan for this year?", ["No new clothes", "No plastic", "No travel"], 0],
        ["What is Aida worried about at the university?", ["High prices", "Greenwashing", "Too much rubbish"], 1],
      ],
    },
    speaking: ["What do you do to help the environment?", "Should governments or individuals do more for the climate?", "Would you buy second-hand clothes? Why?"],
    writing: "Write a short opinion paragraph (120–150 words): 'Small actions can save the planet.' Agree or disagree. Use the zero conditional and two modal passives.",
  },
  {
    id: "t14", title: "Exams & study hacks", stage: "B2",
    slang: [
      ["cram", "study a lot just before an exam", "I crammed all night for the history test."],
      ["ace", "do extremely well in a test", "She aced her IELTS Speaking."],
      ["pull an all-nighter", "stay awake all night, usually to study", "Never pull an all-nighter before a big exam."],
      ["lock in", "focus completely on a task", "Phone off. Time to lock in."],
    ],
    idioms: [
      ["hit the books", "start studying seriously", "Exams are next week, so I need to hit the books."],
      ["pass with flying colours", "pass very successfully", "He passed with flying colours."],
      ["learn by heart", "memorise", "I learned the phrases by heart."],
    ],
    grammar: [
      { name: "Reported statements", rule: "After said/told, tenses usually move back: am → was, will → would, have done → had done.", ex: ["'I'm tired.' → She said she was tired.", "'The test will be on Monday.' → He told us the test would be on Monday."] },
      { name: "Reported questions", rule: "No question word order and no do/does/did. Yes/no questions use if or whether.", ex: ["'Where do you live?' → He asked me where I lived.", "'Have you finished?' → She asked if I had finished."] },
    ],
    gq: [
      ["'I'm tired.' → She said she ___ tired.", "was"],
      ["'Where do you live?' → He asked me where I ___.", "lived"],
      ["'I will help you.' → He said he ___ help me.", "would"],
      ["'Have you finished?' → She asked ___ I had finished.", "if|whether"],
    ],
    reading: {
      title: "Stop rereading, start testing",
      text: "Most students prepare for exams by rereading their notes and highlighting. It feels productive, but research shows it is one of the least effective methods. Two techniques work much better. The first is 'retrieval practice': closing the book and trying to remember the information, for example with flashcards or practice tests. The second is 'spaced repetition': studying a topic several times over days or weeks instead of cramming the night before. In one experiment, students who tested themselves remembered 50% more a week later than students who reread. The lesson is simple: if it feels a little hard, you are probably learning.",
      q: [
        ["What do most students do to prepare?", ["Practice tests", "Reread notes and highlight", "Study in groups"], 1],
        ["What is retrieval practice?", ["Trying to remember without the book", "Reading faster", "Copying notes"], 0],
        ["How much more did self-testing students remember?", ["10%", "25%", "50%"], 2],
      ],
    },
    listening: {
      who: ["Ms Lee", "Arsen"],
      lines: [
        [0, "Arsen, you look exhausted. Did you pull an all-nighter?"],
        [1, "Yes. My friend said cramming was the best way. He told me he had aced his test like that."],
        [0, "And how do you feel?"],
        [1, "Like a zombie. I can't remember anything I read."],
        [0, "Next time, try flashcards for twenty minutes every day for two weeks. And test yourself."],
        [1, "Okay. You said last time that rereading doesn't work. I should have listened."],
      ],
      q: [
        ["What did Arsen's friend tell him?", ["He had aced his test by cramming", "He had failed", "He used flashcards"], 0],
        ["How does Arsen feel?", ["Confident", "Like a zombie", "Happy"], 1],
        ["What does Ms Lee recommend?", ["Flashcards every day for two weeks", "More all-nighters", "Rereading notes"], 0],
      ],
    },
    speaking: ["How do you usually prepare for exams?", "What did your teacher tell you about your English last time?", "Are exams the best way to measure what students know?"],
    writing: "Report a conversation with a teacher or friend about exams (120–150 words). Use at least three reported statements and two reported questions.",
  },
  {
    id: "t15", title: "Music & festivals", stage: "B2",
    slang: [
      ["slaps", "(a song) sounds really good", "This new track slaps."],
      ["banger", "a great, energetic song", "Every song on the album is a banger."],
      ["on repeat", "listened to again and again", "I've had this song on repeat all week."],
      ["stan", "be a very big fan of", "I stan this band. I know every lyric."],
    ],
    idioms: [
      ["music to my ears", "very good news", "'The concert is free.' That's music to my ears."],
      ["face the music", "accept the consequences of what you did", "I missed the deadline, now I have to face the music."],
      ["ring a bell", "sound familiar", "The name rings a bell, but I can't remember the song."],
    ],
    grammar: [
      { name: "Defining and non-defining relative clauses", rule: "Defining (no commas) says which one: who/which/that. Non-defining (with commas) adds extra information: who/which, never that.", ex: ["I like songs that make me dance.", "The festival, which takes place in July, is sold out."] },
      { name: "whose, where", rule: "whose for possession; where for places.", ex: ["That's the singer whose song went viral.", "This is the club where we met."] },
    ],
    gq: [
      ["That's the singer ___ song went viral.", "whose"],
      ["This is the club ___ we met.", "where"],
      ["The festival, ___ takes place in July, is sold out.", "which"],
      ["I like songs ___ make me dance.", "that|which"],
    ],
    reading: {
      title: "Why we love the songs from when we were 14",
      text: "Have you noticed that the songs you loved as a teenager still feel special? Scientists who study music and memory say this is no accident. Between the ages of about 12 and 22, the brain is developing fast and emotions are very strong, so the music we hear during those years is linked to powerful memories. Researchers who analysed Spotify data found that people's favourite songs were most often released when they were around 14. Later in life, many people stop discovering new music, usually around the age of 30. So if a song slaps for you at 14, there is a good chance you will still love it at 50.",
      q: [
        ["Why is teenage music special?", ["It is better quality", "It is linked to powerful memories", "It is louder"], 1],
        ["At what age were people's favourite songs often released?", ["Around 14", "Around 22", "Around 30"], 0],
        ["What happens around the age of 30?", ["People stop discovering new music", "People start playing instruments", "People go to more festivals"], 0],
      ],
    },
    listening: {
      who: ["Tom", "Saule"],
      lines: [
        [0, "Did you get tickets for the summer festival?"],
        [1, "Yes! The festival, which is in the mountains this year, sold out in ten minutes."],
        [0, "Who's headlining?"],
        [1, "Remember the singer whose song we had on repeat all spring? Her."],
        [0, "No way, that's music to my ears. Is it the same place where we camped last year?"],
        [1, "No, a new lake site. And there's a free bus that goes from the city centre."],
      ],
      q: [
        ["Where is the festival this year?", ["In the city centre", "In the mountains", "On the beach"], 1],
        ["How fast did it sell out?", ["Ten minutes", "One day", "One week"], 0],
        ["How can they get there?", ["By train", "By a free bus", "By car only"], 1],
      ],
    },
    speaking: ["What kind of music do you have on repeat at the moment?", "Have you ever been to a concert or festival? Describe it.", "Is music education important at school?"],
    writing: "Describe a concert or festival you went to or would like to go to (120–150 words). Use at least four relative clauses, including whose and where.",
  },
  {
    id: "t16", title: "Sport & fitness", stage: "B2",
    slang: [
      ["GOAT", "greatest of all time", "Messi or Ronaldo: who's the GOAT?"],
      ["clutch", "doing well under pressure at the key moment", "That last-second goal was so clutch."],
      ["gym rat", "someone who spends a lot of time at the gym", "He's a total gym rat, he goes twice a day."],
      ["a W / an L", "a win / a loss (also in life)", "Got the job? Big W. Missed the bus? Small L."],
    ],
    idioms: [
      ["the ball is in your court", "it's your turn to act or decide", "I've made my offer. The ball is in your court."],
      ["go the extra mile", "make more effort than expected", "Our coach always goes the extra mile."],
      ["throw in the towel", "give up", "I was tired, but I didn't throw in the towel."],
    ],
    grammar: [
      { name: "Modals of deduction (present)", rule: "must = I'm sure it's true; can't = I'm sure it isn't true; might/may/could = it's possible.", ex: ["He trains every day. He must be really fit.", "She can't be the captain, she's only 12."] },
      { name: "Deduction with continuous", rule: "modal + be + -ing for something happening now.", ex: ["The stadium is so loud. They must be winning.", "He isn't answering. He might be training."] },
    ],
    gq: [
      ["He trains every day. He ___ be really fit. (sure)", "must"],
      ["She ___ be the captain. She's only 12. (sure it's not true)", "can't|cannot"],
      ["I'm not sure, but it ___ be the final today.", "might|may|could"],
      ["They lost 5–0. They ___ be very happy.", "can't|cannot"],
    ],
    reading: {
      title: "The 'weekend warrior' effect",
      text: "Doctors usually advise doing some exercise every day. But what if you only have time at the weekend? A large study of over 350,000 adults found that 'weekend warriors', people who do all their weekly exercise in one or two days, get almost the same health benefits as people who exercise regularly. The key is the total amount: around 150 minutes of moderate activity a week. The researchers say this is good news for busy students and workers. There is one warning, however: people who exercise rarely but very hard are more likely to get injured, so warming up is a must.",
      q: [
        ["Who are 'weekend warriors'?", ["Professional athletes", "People who exercise in one or two days a week", "People who never exercise"], 1],
        ["What matters most, according to the study?", ["The total amount of exercise", "The time of day", "The type of sport"], 0],
        ["What is the warning?", ["Weekend exercise is useless", "Injuries are more likely, so warm up", "Exercise is bad for students"], 1],
      ],
    },
    listening: {
      who: ["Liam", "Madina"],
      lines: [
        [0, "Whoa, listen to that crowd. Kazakhstan must be winning."],
        [1, "Or they might be losing and everyone's shouting at the referee."],
        [0, "Check the score. Ah, two-one! That goalkeeper is so clutch."],
        [1, "He's the GOAT of our league. He must train every day."],
        [0, "Speaking of training, are we still going to the gym tomorrow?"],
        [1, "The ball's in your court. I'm free at seven, but not before."],
      ],
      q: [
        ["What is the score?", ["1–1", "2–1", "2–0"], 1],
        ["Who do they think is clutch?", ["The goalkeeper", "The referee", "The coach"], 0],
        ["When is Madina free tomorrow?", ["At seven", "Before seven", "All day"], 0],
      ],
    },
    speaking: ["Who is the GOAT in your favourite sport? Why?", "How do you keep fit?", "Should sport be compulsory at school?"],
    writing: "Look at a sports photo (or imagine one) and write what must, might or can't be happening (120–150 words). Use at least five modals of deduction.",
  },
  {
    id: "t17", title: "Binge-watching & series", stage: "B2",
    slang: [
      ["binge", "watch many episodes in one go", "I binged the whole season in a weekend."],
      ["no spoilers", "don't tell me what happens", "I'm on episode 3, so no spoilers!"],
      ["hits different", "feels special or stronger in a certain situation", "Watching horror at 3 a.m. hits different."],
      ["delulu", "unrealistic, believing something that isn't true (from 'delusional')", "I'm delulu, I think they'll make season 10."],
    ],
    idioms: [
      ["on the edge of your seat", "very excited and nervous to know what happens", "The finale kept me on the edge of my seat."],
      ["a couch potato", "someone who watches a lot of TV and doesn't move much", "Winter turns me into a couch potato."],
      ["jump the shark", "(a series) become worse by doing something ridiculous", "The show jumped the shark when the dog started talking."],
    ],
    grammar: [
      { name: "Modals of deduction (past)", rule: "must have / can't have / might have + past participle: guesses about the past.", ex: ["The lights are off. They must have gone to bed.", "He can't have seen the finale, it hasn't aired yet."] },
      { name: "should have / shouldn't have", rule: "should(n't) have + past participle: criticism or regret about the past.", ex: ["You shouldn't have told me the ending!", "I should have gone to sleep earlier."] },
    ],
    gq: [
      ["The lights are off. They ___ gone to bed. (sure)", "must have"],
      ["He ___ seen the finale. It hasn't come out yet.", "can't have|cannot have"],
      ["You ___ told me the ending! Now it's ruined.", "shouldn't have|should not have"],
      ["She ___ forgotten. I'm not sure.", "might have|may have|could have"],
    ],
    reading: {
      title: "Why the cliffhanger works",
      text: "Streaming platforms know exactly why you press 'Next episode' at 2 a.m. Writers end episodes with a cliffhanger, a moment of tension that is left unresolved. Psychologists link this to the Zeigarnik effect: our brain remembers unfinished tasks better than finished ones, so an open story keeps us thinking. Autoplay makes the decision even easier, because the next episode starts in five seconds. Some viewers now use a trick to stop bingeing: they stop watching in the middle of an episode, not at the end, when the tension is low. It sounds strange, but it seems to work.",
      q: [
        ["What is a cliffhanger?", ["A happy ending", "A tense moment left unresolved", "A trailer"], 1],
        ["What is the Zeigarnik effect?", ["We remember unfinished tasks better", "We forget stories quickly", "We prefer short episodes"], 0],
        ["What trick do some viewers use?", ["Stop in the middle of an episode", "Turn on autoplay", "Watch at 2 a.m."], 0],
      ],
    },
    listening: {
      who: ["Yan", "Aliya"],
      lines: [
        [0, "You look like you haven't slept."],
        [1, "I binged the whole new season. Eight episodes. The finale had me on the edge of my seat."],
        [0, "No spoilers! I'm only on episode two."],
        [1, "Fine. But you must have heard what happens to the brother. Everyone's talking about it."],
        [0, "I haven't! I muted the hashtag."],
        [1, "Good. Honestly, I should have stopped at midnight. I have an exam in three hours."],
      ],
      q: [
        ["How many episodes did Aliya watch?", ["Two", "Eight", "Ten"], 1],
        ["How did Yan avoid spoilers?", ["He muted the hashtag", "He deleted the app", "He stayed offline"], 0],
        ["What does Aliya regret?", ["Not stopping at midnight", "Watching episode two", "Telling the ending"], 0],
      ],
    },
    speaking: ["What series have you binged recently?", "Do you think watching series can help you learn English?", "What should you have done differently last weekend?"],
    writing: "Write a review of a series (120–150 words) without spoilers. Include two past deductions (must have / can't have) and one sentence with should have.",
  },
  {
    id: "t18", title: "Gaming & online life", stage: "B2",
    slang: [
      ["GG", "good game (said at the end, also to mean 'it's over')", "GG everyone, see you tomorrow."],
      ["noob", "a beginner who doesn't know much", "Don't laugh, I'm a noob at this game."],
      ["rage quit", "stop playing suddenly because you are angry", "He lost three times and rage quit."],
      ["OP", "overpowered, too strong", "That new character is totally OP."],
    ],
    idioms: [
      ["a game changer", "something that changes a situation completely", "Fast internet was a game changer for online classes."],
      ["level up", "improve, reach a higher level", "I want to level up my English this year."],
      ["beat someone at their own game", "win against someone using their own methods", "She beat the pros at their own game."],
    ],
    grammar: [
      { name: "Third conditional", rule: "If + past perfect, would have + past participle: an imaginary past and its result.", ex: ["If I had practised more, I would have won.", "We would have finished the level if the wifi hadn't crashed."] },
      { name: "It's (high) time + past simple", rule: "It's time / it's high time + subject + past simple: something should happen now.", ex: ["It's time you went to bed.", "It's high time we started revising."] },
    ],
    gq: [
      ["If I ___ (practise) more, I would have won.", "had practised|'d practised|had practiced|'d practiced"],
      ["We would have won if the wifi ___ (not / crash).", "hadn't crashed|had not crashed"],
      ["It's time you ___ (go) to bed.", "went"],
      ["If she hadn't rage quit, she ___ (win).", "would have won|'d have won"],
    ],
    reading: {
      title: "Can gaming teach English?",
      text: "Many teachers have noticed something surprising: some of their best speakers learned a lot of English from online games. Studies from Scandinavia support this. Teenagers who played multiplayer games for several hours a week had larger English vocabularies than those who didn't, mostly because they had to communicate quickly with players from other countries. Researchers stress that the type of game matters. Games with a lot of reading and voice chat help most, while fast shooting games help less. And of course, if you play all night instead of sleeping, you won't level up anywhere except in the game.",
      q: [
        ["What did teachers notice?", ["Gamers have worse grades", "Some good speakers learned English from games", "Games are banned in schools"], 1],
        ["Why did gamers learn more vocabulary?", ["They read textbooks", "They had to communicate with international players", "They watched films"], 1],
        ["Which games help most?", ["Fast shooting games", "Games with reading and voice chat", "Offline games"], 1],
      ],
    },
    listening: {
      who: ["Ali", "Becky"],
      lines: [
        [0, "GG. That was so close."],
        [1, "If my internet hadn't frozen in the last round, we would have won."],
        [0, "Don't rage quit on me. That new character is just OP."],
        [1, "Fine. But honestly, it's time I stopped for tonight. I have a presentation at nine."],
        [0, "In English? Voice chat with the Canadian team must have been good practice."],
        [1, "True, that was a game changer. I learned more slang this month than in a year of classes."],
      ],
      q: [
        ["Why did they lose?", ["The internet froze", "Becky rage quit", "The character was weak"], 0],
        ["Why does Becky want to stop?", ["She is angry", "She has a presentation at nine", "Her internet is slow"], 1],
        ["What helped Becky's English?", ["Classes", "Voice chat with a Canadian team", "Films"], 1],
      ],
    },
    speaking: ["Do you play video games? Why or why not?", "Can games be useful for education?", "Tell me about something you would have done differently if you'd had the chance."],
    writing: "Write about a time something went wrong (120–150 words) and what would have happened if things had been different. Use the third conditional three times and 'it's time'.",
  },
  {
    id: "t19", title: "Family & adulting", stage: "B2",
    slang: [
      ["adulting", "doing boring adult tasks like paying bills", "I paid my taxes and cooked dinner. Adulting!"],
      ["the fam", "family, or a close group of friends", "Sunday lunch with the fam."],
      ["boomer", "(jokingly) an older person who doesn't understand new trends", "My dad prints his emails. Such a boomer."],
      ["vibe check", "a quick test of someone's mood or attitude", "Morning vibe check: how's everyone feeling?"],
    ],
    idioms: [
      ["run in the family", "be common in a family", "Tall genes run in our family."],
      ["the black sheep", "a family member who is very different from the others", "I'm the black sheep: everyone's a doctor except me."],
      ["like two peas in a pod", "very similar", "My sister and I are like two peas in a pod."],
    ],
    grammar: [
      { name: "used to vs be/get used to", rule: "used to + verb = a past habit. be used to + -ing = familiar with it. get used to + -ing = becoming familiar.", ex: ["I used to live with my parents.", "I'm not used to cooking every day, but I'm getting used to it."] },
      { name: "make and let", rule: "make + person + verb = force; let + person + verb = allow. No 'to' after them.", ex: ["Mum makes me clean my room.", "My parents never let me stay out after 10."] },
    ],
    gq: [
      ["I'm not ___ to cooking every day yet.", "used"],
      ["My parents never ___ me stay out after 10. (allow)", "let"],
      ["You'll soon get used to ___ (pay) bills.", "paying"],
      ["Mum ___ me clean my room every Saturday. (force)", "makes|made"],
    ],
    reading: {
      title: "Adulting school",
      text: "In some countries, young people are now taking classes in 'adulting'. These short courses teach things that school often doesn't: how to read a rental contract, change a tyre, cook five cheap meals, and talk to a doctor. Organisers say many students arrive at university very good at exams but not used to managing their own lives. One survey found that a third of 20-year-olds had never paid a bill on their own. Parents have mixed feelings. Some say they should have taught these skills at home; others say the world has simply become more complicated than when they were young.",
      q: [
        ["What do adulting classes teach?", ["Exam skills", "Practical life skills", "Sports"], 1],
        ["What did the survey find?", ["A third of 20-year-olds had never paid a bill alone", "Most students can change a tyre", "Parents teach all these skills"], 0],
        ["How do parents feel?", ["All are happy", "They have mixed feelings", "They are angry"], 1],
      ],
    },
    listening: {
      who: ["Mum", "Daniyar"],
      lines: [
        [0, "So, how's life in your new flat?"],
        [1, "Adulting is hard, Mum. I'm still not used to cooking every night."],
        [0, "You'll get used to it. When you lived here, I had to make you wash the dishes."],
        [1, "I know, I know. You used to let me play games only after I'd done my homework."],
        [0, "And now?"],
        [1, "Now I play until two and eat noodles. Okay, maybe I'll come for Sunday lunch with the fam."],
      ],
      q: [
        ["What is Daniyar not used to?", ["Cooking every night", "Living alone", "Paying rent"], 0],
        ["What did his mum make him do?", ["Wash the dishes", "Go to bed early", "Cook dinner"], 0],
        ["What will Daniyar probably do?", ["Come for Sunday lunch", "Move back home", "Stop playing games"], 0],
      ],
    },
    speaking: ["What adult tasks do you find difficult?", "What did your parents make you do or let you do as a child?", "At what age should young people leave home?"],
    writing: "Write about a big change in your life (120–150 words): what you used to do, what you're used to now and what you are getting used to. Use make and let once each.",
  },
  {
    id: "t20", title: "Fashion & identity", stage: "B2",
    slang: [
      ["fit", "outfit", "Love your fit today!"],
      ["slay", "do something extremely well; look amazing", "You slayed that presentation."],
      ["-core", "an aesthetic or style (cottagecore, gorpcore)", "Hiking jackets in the city? That's gorpcore."],
      ["basic", "ordinary, following popular trends without personality", "Pumpkin latte and Uggs? So basic, but I love it."],
    ],
    idioms: [
      ["dressed to kill", "wearing very attractive, impressive clothes", "She arrived at the party dressed to kill."],
      ["fit like a glove", "fit perfectly", "These jeans fit like a glove."],
      ["the height of fashion", "very fashionable at the moment", "Wide jeans are the height of fashion again."],
    ],
    grammar: [
      { name: "Adjective order", rule: "opinion - size - age - shape - colour - origin - material - purpose + noun.", ex: ["a beautiful long black dress", "an old Italian leather bag"] },
      { name: "so / such … that", rule: "so + adjective/adverb; such (a/an) + (adjective) + noun; both can be followed by that + result.", ex: ["The shoes were so expensive that I left them.", "It was such a cool fit that everyone took photos."] },
    ],
    gq: [
      ["She wore a ___ dress. (black / long / beautiful)", "beautiful long black"],
      ["It was ___ a cool fit that everyone took photos.", "such"],
      ["The shoes were ___ expensive that I left them.", "so"],
      ["I bought an ___ bag. (leather / old / Italian)", "old italian leather"],
    ],
    reading: {
      title: "Microtrends",
      text: "Fashion trends used to change with the seasons. Now, thanks to social media, a 'microtrend' can appear, become the height of fashion and disappear in a few weeks. One week everyone wants a certain bag; the next week it looks basic. Fast-fashion companies can copy a viral item in days, so prices are low but the clothes are often worn only a few times. Some young people are reacting by building a personal style instead of following every -core. Stylists suggest a simple test: if you would have worn it a year ago and would still wear it a year from now, it is your style, not a trend.",
      q: [
        ["How fast can a microtrend disappear?", ["In a few weeks", "In a season", "In a year"], 0],
        ["Why are fast-fashion clothes a problem?", ["They are worn only a few times", "They are too expensive", "They are hard to find"], 0],
        ["What is the stylists' test?", ["Would you wear it a year ago and a year from now?", "Is it on sale?", "Did an influencer wear it?"], 0],
      ],
    },
    listening: {
      who: ["Mira", "Joe"],
      lines: [
        [0, "Okay, your fit today is amazing. Where's that jacket from?"],
        [1, "Thanks! It's my grandad's old brown leather jacket. It fits like a glove."],
        [0, "Vintage! You're slaying. I feel so basic in my hoodie."],
        [1, "Stop, it's such a nice colour that it looks expensive."],
        [0, "Ha. I want to stop buying microtrends. They're so cheap that I buy too many."],
        [1, "Same. One good piece is better than ten things you wear twice."],
      ],
      q: [
        ["Whose jacket is Joe wearing?", ["His father's", "His grandad's", "His own new one"], 1],
        ["How does Mira feel in her hoodie?", ["Basic", "Stylish", "Cold"], 0],
        ["What does Mira want to stop?", ["Buying microtrends", "Wearing hoodies", "Shopping online"], 0],
      ],
    },
    speaking: ["How would you describe your style?", "Do clothes say something about who we are?", "Should schools have uniforms?"],
    writing: "Describe your favourite outfit or someone's style (120–150 words). Use three phrases with two or more adjectives in the correct order, and both so…that and such…that.",
  },
  {
    id: "t21", title: "News & fake news", stage: "B2",
    slang: [
      ["the receipts", "proof such as screenshots", "She says he lied? Show me the receipts."],
      ["clickbait", "a headline made only to get clicks", "'You won't believe what happened next' is pure clickbait."],
      ["sus", "suspicious", "That website looks sus."],
      ["cap", "a lie (no cap = no lie)", "That headline is cap."],
    ],
    idioms: [
      ["take it with a pinch of salt", "don't completely believe it", "Take online reviews with a pinch of salt."],
      ["hear it on the grapevine", "hear news unofficially, as gossip", "I heard it on the grapevine that she's leaving."],
      ["a storm in a teacup", "a lot of anger about something unimportant", "The fight online was a storm in a teacup."],
    ],
    grammar: [
      { name: "Contrast linkers", rule: "although + clause; despite / in spite of + noun or -ing; however at the start of a new sentence, followed by a comma.", ex: ["Although the story was fake, millions shared it.", "Despite the evidence, people believed it.", "The video looked real. However, it was made by AI."] },
      { name: "Impersonal passive", rule: "It is said / believed / reported that… or Subject + is said to + verb: for news when the source is general.", ex: ["It is said that the CEO will resign.", "The singer is reported to be in hospital."] },
    ],
    gq: [
      ["___ the story was fake, millions shared it.", "although|though|even though"],
      ["___ the evidence, people believed it.", "despite|in spite of"],
      ["It ___ (say) that the CEO will resign.", "is said"],
      ["The video looked real. ___, it was made by AI.", "however"],
    ],
    reading: {
      title: "Lies travel faster",
      text: "A famous study by researchers at MIT looked at more than 100,000 stories shared on Twitter. It found that false news spread six times faster than true news and reached far more people. Surprisingly, bots were not the main reason: real people shared the fake stories, because they were more surprising and emotional. Although fact-checking websites exist, most people never visit them. Experts recommend a habit called 'lateral reading': instead of studying a suspicious page closely, open a new tab and check what other sources say about it. Professional fact-checkers do this, and it takes less than a minute.",
      q: [
        ["How fast did false news spread compared to true news?", ["Twice as fast", "Six times faster", "At the same speed"], 1],
        ["Who mainly shared the fake stories?", ["Bots", "Real people", "Journalists"], 1],
        ["What is lateral reading?", ["Reading a page very closely", "Checking what other sources say in a new tab", "Reading only headlines"], 1],
      ],
    },
    listening: {
      who: ["Asel", "Rob"],
      lines: [
        [0, "Did you see that the university is closing for a month? It's all over the chats."],
        [1, "Hmm, that sounds sus. Where did you hear it?"],
        [0, "On the grapevine. A screenshot of an email from the dean."],
        [1, "Although it looks official, the email address is wrong. Look, it's a Gmail account."],
        [0, "Oh no, I've already shared it with three groups."],
        [1, "Then post a correction. Despite the drama, it's just a storm in a teacup."],
      ],
      q: [
        ["What was the rumour?", ["The university is closing for a month", "Exams are cancelled", "The dean resigned"], 0],
        ["Why does Rob think it's fake?", ["The date is wrong", "The email address is wrong", "The dean is on holiday"], 1],
        ["What does Rob advise?", ["Post a correction", "Delete the chats", "Call the dean"], 0],
      ],
    },
    speaking: ["Where do you get your news from?", "Have you ever believed a fake story? What happened?", "Should social media companies remove false information?"],
    writing: "Write a paragraph (120–150 words): 'How to spot fake news'. Use although, despite, however and one impersonal passive (It is said / believed that…).",
  },
  {
    id: "t22", title: "Stress & burnout", stage: "B2",
    slang: [
      ["I'm so done", "I'm tired of this and can't continue", "Third essay this week. I'm so done."],
      ["the Sunday scaries", "anxiety on Sunday evening about the week ahead", "Got the Sunday scaries already."],
      ["spiral", "start worrying more and more", "Don't spiral, it's just one bad mark."],
      ["doing the most", "doing too much, overdoing it", "Three clubs, two jobs and a full course? You're doing the most."],
    ],
    idioms: [
      ["at the end of my rope", "with no patience or energy left", "After a week of night shifts I was at the end of my rope."],
      ["take it easy", "relax, don't work too hard", "Take it easy this weekend."],
      ["a weight off my shoulders", "a big relief", "Finishing the project was a weight off my shoulders."],
    ],
    grammar: [
      { name: "Future perfect", rule: "will have + past participle: an action complete before a future time. Often with by / by the time.", ex: ["By June, I will have finished my course.", "By the time you arrive, we'll have eaten."] },
      { name: "Future continuous vs future perfect", rule: "will be + -ing = in progress at that time; will have done = finished before that time.", ex: ["At 9 I'll be meditating, so don't call.", "By 10 I'll have finished, so call then."] },
    ],
    gq: [
      ["By June, I ___ (finish) my course.", "will have finished|'ll have finished"],
      ["By the time you arrive, we ___ (eat).", "will have eaten|'ll have eaten"],
      ["Don't call at 9. I ___ (meditate).", "will be meditating|'ll be meditating"],
      ["By next year she ___ (save) enough to travel.", "will have saved|'ll have saved"],
    ],
    reading: {
      title: "Burnout is not just being tired",
      text: "The World Health Organization describes burnout as a result of long-term stress at work or study that has not been successfully managed. It has three signs: feeling exhausted, feeling negative or distant about your work, and doing it less well. Unlike normal tiredness, burnout does not disappear after one good night's sleep. Psychologists suggest small, regular changes rather than one big holiday: clear start and finish times, short breaks every 90 minutes, and saying no to extra tasks. They also note that people who are doing the most are often the last to notice, so friends and family can play an important role.",
      q: [
        ["How many signs of burnout does the WHO describe?", ["Two", "Three", "Five"], 1],
        ["How is burnout different from normal tiredness?", ["It disappears after sleep", "It doesn't disappear after one good night", "It only affects workers"], 1],
        ["What do psychologists recommend?", ["One big holiday", "Small, regular changes", "Working longer"], 1],
      ],
    },
    listening: {
      who: ["Gulnara", "Pete"],
      lines: [
        [0, "You okay? You've been really quiet."],
        [1, "Honestly, I'm at the end of my rope. I've got the Sunday scaries and it's only Saturday."],
        [0, "You're doing the most. Work, the course, the volunteering…"],
        [1, "I know. But by Friday I'll have finished the big project, so it gets better."],
        [0, "Then take it easy tonight. Tomorrow at ten we'll be walking in the park, no phones."],
        [1, "Deal. That's actually a weight off my shoulders."],
      ],
      q: [
        ["How does Pete feel?", ["Excited", "Exhausted and stressed", "Bored"], 1],
        ["What will have happened by Friday?", ["He will have finished the project", "He will have quit his job", "He will have moved"], 0],
        ["What will they be doing tomorrow at ten?", ["Working", "Walking in the park", "Sleeping"], 1],
      ],
    },
    speaking: ["What stresses you most at the moment?", "What will you have achieved by the end of this year?", "Do young people today have more stress than their parents did?"],
    writing: "Write a plan for a calmer month (120–150 words). Say what you will have done by the end of it and what you will be doing at certain times. Use by and by the time.",
  },
  {
    id: "t23", title: "Job interviews", stage: "B2",
    slang: [
      ["nailed it", "did it perfectly", "How was the interview? Nailed it!"],
      ["humblebrag", "boasting while pretending to complain", "'Ugh, I have too many job offers.' Classic humblebrag."],
      ["vibe with", "get along with; like", "I really vibed with the team."],
      ["red flag", "a warning sign", "No salary in the job ad? Red flag."],
    ],
    idioms: [
      ["get your foot in the door", "get a first chance in a company or industry", "An internship can get your foot in the door."],
      ["think outside the box", "think creatively", "We need someone who thinks outside the box."],
      ["sell yourself short", "not show how good you really are", "Don't sell yourself short in the interview."],
    ],
    grammar: [
      { name: "Indirect questions", rule: "Could you tell me / Do you know / I was wondering + question word or if + normal word order (no do/does/did).", ex: ["Could you tell me where the office is?", "Do you know what time the interview starts?"] },
      { name: "Question tags", rule: "positive sentence + negative tag; negative sentence + positive tag. Use the same auxiliary.", ex: ["You've worked in sales, haven't you?", "She isn't late, is she?"] },
    ],
    gq: [
      ["Could you tell me where the office ___?", "is"],
      ["Do you know what time the interview ___ (start)?", "starts"],
      ["You've worked in sales, ___?", "haven't you"],
      ["She isn't late, ___?", "is she"],
    ],
    reading: {
      title: "The question you should always ask",
      text: "At the end of almost every interview, the employer asks: 'Do you have any questions for us?' Recruiters say that answering 'No, thank you' is a missed chance. Good questions show you have researched the company and are thinking about the future. Some of the most effective are: 'Could you tell me what success looks like in the first three months?' and 'What do you enjoy most about working here?' The second one also helps you check whether you would vibe with the team. Experts warn against asking only about holidays and salary in the first interview, as it can look like a red flag.",
      q: [
        ["Why is 'No, thank you' a bad answer?", ["It is rude", "It is a missed chance", "It is too long"], 1],
        ["What does the second question help you check?", ["The salary", "Whether you would get along with the team", "The office location"], 1],
        ["What can look like a red flag?", ["Asking only about holidays and salary", "Asking about success", "Researching the company"], 0],
      ],
    },
    listening: {
      who: ["Interviewer", "Amina"],
      lines: [
        [0, "So, Amina, you've worked in marketing for two years, haven't you?"],
        [1, "That's right. I started as an intern, which got my foot in the door, and then I joined the social media team."],
        [0, "And what's your biggest achievement?"],
        [1, "I ran a campaign with almost no budget that doubled our followers. We had to think outside the box."],
        [0, "Great. Do you have any questions for us?"],
        [1, "Yes. Could you tell me what success looks like in the first three months?"],
      ],
      q: [
        ["How did Amina start in marketing?", ["As an intern", "As a manager", "As a freelancer"], 0],
        ["What did her campaign do?", ["Doubled the followers", "Won a prize", "Cost a lot"], 0],
        ["What does Amina ask at the end?", ["About the salary", "What success looks like in three months", "About holidays"], 1],
      ],
    },
    speaking: ["What job would you like to do in the future?", "How should you prepare for an interview?", "Is it better to work for a big company or a small one?"],
    writing: "Write five polite questions you could ask at the end of an interview using indirect questions, then a short email (80–100 words) thanking the interviewer, with one question tag.",
  },
  {
    id: "t24", title: "Big goals & your era", stage: "B2",
    slang: [
      ["manifest", "believe strongly that something will happen (and work to make it happen)", "I'm manifesting band 7.5."],
      ["era", "a period of your life with a clear focus", "I'm in my study era: no parties till June."],
      ["side quest", "a small activity that isn't your main goal", "Learning guitar is my side quest this year."],
      ["no days off", "working on a goal every single day", "Twenty minutes of English, no days off."],
    ],
    idioms: [
      ["reach for the stars", "aim very high", "My teacher always told us to reach for the stars."],
      ["the sky's the limit", "there is no limit to what you can achieve", "With hard work, the sky's the limit."],
      ["a long shot", "something with little chance of success", "Getting into Oxford is a long shot, but I'll try."],
    ],
    grammar: [
      { name: "Mixed conditionals", rule: "Past cause → present result: If + past perfect, would + verb. Present cause → past result: If + past simple, would have + past participle.", ex: ["If I had started earlier, I would be fluent now.", "If I were more confident, I would have applied last year."] },
      { name: "had better / would rather", rule: "had better + verb = strong advice (or there will be a problem). would rather + verb (than) = preference.", ex: ["You'd better start now; the exam is in May.", "I'd rather study at home than in a café."] },
    ],
    gq: [
      ["If I had started earlier, I ___ (be) fluent now.", "would be|'d be"],
      ["If I were more confident, I ___ (apply) last year.", "would have applied|'d have applied"],
      ["You ___ start now. The exam is in May. (strong advice)", "had better|'d better"],
      ["I'd rather ___ (study) at home than in a café.", "study"],
    ],
    reading: {
      title: "Why most goals fail by February",
      text: "Studies suggest that around 80% of New Year's resolutions are given up by February. Psychologists say the main reason is that goals are too big and too vague, like 'get better at English'. They recommend turning a big goal into a small daily action, such as 'learn five new phrases after breakfast'. Linking the new habit to an old one helps: if you always drink tea at 8, do your vocabulary while the kettle boils. Tracking progress is also powerful, because seeing a long line of ticks makes you not want to break it. As one researcher put it, motivation gets you started, but habits keep you going.",
      q: [
        ["When are most resolutions given up?", ["By January", "By February", "By summer"], 1],
        ["Why do goals fail?", ["They are too big and vague", "They are too easy", "People are lazy"], 0],
        ["Why is tracking progress powerful?", ["You don't want to break the line of ticks", "It is required by teachers", "It is fun to buy apps"], 0],
      ],
    },
    listening: {
      who: ["Kai", "Laura"],
      lines: [
        [0, "So what's your main goal this year?"],
        [1, "Band seven point five, then a master's in Europe. It's a long shot, but I'm manifesting it."],
        [0, "If you hadn't started that course last year, you wouldn't be this confident now."],
        [1, "I'm in my study era. Thirty minutes a day, no days off. And I'd rather do a little every day than cram."],
        [0, "Smart. Any side quests?"],
        [1, "Running. But I'd better not start a marathon plan before the exam."],
      ],
      q: [
        ["What band does Laura want?", ["6.5", "7", "7.5"], 2],
        ["How does Laura study?", ["Thirty minutes a day", "All weekend", "Only before exams"], 0],
        ["What is Laura's side quest?", ["Running", "Guitar", "Cooking"], 0],
      ],
    },
    speaking: ["What is your biggest goal for the next five years?", "If you had started English earlier, how would your life be different now?", "Is it better to have big goals or small goals?"],
    writing: "Write a letter to yourself one year from now (120–150 words). Describe your goal, your daily plan and one regret. Use a mixed conditional, had better and would rather.",
  },
];
