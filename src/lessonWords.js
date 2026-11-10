// Words for the "Words" step of each lesson: eight per lesson, chosen from the lesson topic.
// Each entry has a short English definition, translations (kk = Kazakh, ru = Russian) and an example sentence.
// The example must contain the word, because the gap game blanks it out. Keep entries to a single word.
// Lesson ids match INITIAL_MODULES in App.js. Mock tests have no word list.
const w = (word, pos, def, kk, ru, ex) => ({ word, pos, def, kk, ru, ex });

export const LESSON_WORDS = {
  // Listening Part 1: forms and notes
  "1-1": [
    w("booking", "noun", "arranging to have a room, ticket or service", "брондау", "бронирование", "I made a booking for two people at seven."),
    w("deposit", "noun", "money you pay first to keep something for you", "алдын ала төлем, кепіл ақша", "залог, предоплата", "You pay a deposit of fifty pounds when you book."),
    w("postcode", "noun", "letters and numbers at the end of an address", "пошта индексі", "почтовый индекс", "Please write your postcode at the bottom of the form."),
    w("enquiry", "noun", "a question asking for information", "сұрау, сауал", "запрос, вопрос", "I'm calling with an enquiry about evening classes."),
    w("register", "verb", "to put your name on an official list", "тіркелу", "зарегистрироваться", "You need to register before the first lesson."),
    w("fee", "noun", "money you pay for a service or a course", "ақы, төлем", "плата, взнос", "The course fee includes all the books."),
    w("cancel", "verb", "to say that something will not happen", "бас тарту, күшін жою", "отменять", "Can I cancel my booking by phone?"),
    w("surname", "noun", "your family name", "тегі", "фамилия", "My surname is spelled with a double R."),
  ],
  // Reading: True, False, Not Given
  "1-2": [
    w("statement", "noun", "something that you say or write", "мәлімдеме, тұжырым", "утверждение", "Decide if the statement is true or false."),
    w("evidence", "noun", "facts that show something is true", "дәлел", "доказательство", "The text gives no evidence for this idea."),
    w("contradict", "verb", "to say the opposite of something", "қайшы келу", "противоречить", "The second paragraph contradicts the first one."),
    w("claim", "verb", "to say that something is true, often without proof", "мәлімдеу", "утверждать", "The writer claims that cities are getting quieter."),
    w("mention", "verb", "to say something briefly", "айту, атап өту", "упоминать", "The passage does not mention the price."),
    w("assume", "verb", "to think something is true without checking", "болжау, деп ойлау", "предполагать", "Do not assume that Not Given means False."),
    w("paragraph", "noun", "a group of sentences about one idea", "абзац", "абзац", "Read the first paragraph carefully."),
    w("conclusion", "noun", "the final opinion or decision", "қорытынды", "вывод, заключение", "The conclusion is at the end of the text."),
  ],
  // Writing Task 1: line graphs
  "1-3": [
    w("increase", "verb", "to go up", "өсу, көбею", "увеличиваться, расти", "The number of visitors increased in 2010."),
    w("decrease", "verb", "to go down", "азаю, төмендеу", "уменьшаться, снижаться", "Sales decreased slightly in March."),
    w("fluctuate", "verb", "to go up and down", "ауытқу", "колебаться", "Prices fluctuated between five and ten dollars."),
    w("peak", "noun", "the highest point", "ең жоғары нүкте, шың", "пик, максимум", "The line reaches a peak in July."),
    w("plunge", "verb", "to fall very quickly", "күрт құлдырау", "резко упасть", "Profits plunged after the shop closed."),
    w("stable", "adjective", "not changing", "тұрақты", "стабильный", "The figure remained stable for three years."),
    w("trend", "noun", "the general direction of change", "үрдіс, бағыт", "тенденция", "The graph shows a clear upward trend."),
    w("gradual", "adjective", "slow and steady", "біртіндеп болатын", "постепенный", "There was a gradual rise in temperature."),
  ],
  // Writing Task 2: advantages and disadvantages
  "1-4": [
    w("advantage", "noun", "something good that helps you", "артықшылық", "преимущество", "One advantage of cities is the number of jobs."),
    w("drawback", "noun", "a problem that makes something less good", "кемшілік, кері жағы", "недостаток, минус", "The main drawback is the high cost."),
    w("outweigh", "verb", "to be greater or more important than something", "басым болу, артық түсу", "перевешивать", "The benefits outweigh the risks."),
    w("convenient", "adjective", "easy and useful", "ыңғайлы", "удобный", "Online shopping is convenient for busy people."),
    w("overcrowded", "adjective", "with too many people", "адамға тым толы", "переполненный", "Overcrowded buses make the journey stressful."),
    w("isolated", "adjective", "feeling alone, or far from other people", "оқшауланған, жалғыз", "изолированный, одинокий", "Remote workers can feel isolated."),
    w("affordable", "adjective", "cheap enough to buy", "қолжетімді (бағасы жағынан)", "доступный по цене", "Affordable homes are hard to find."),
    w("essential", "adjective", "absolutely necessary", "аса қажет", "необходимый, важнейший", "Sleep is essential for good health."),
  ],
  // Speaking Part 1: fluency
  "1-5": [
    w("fluent", "adjective", "able to speak easily and smoothly", "еркін сөйлейтін", "беглый", "She is fluent in three languages."),
    w("hesitate", "verb", "to pause before speaking or acting", "тартыну, кідіру", "колебаться, запинаться", "Don't hesitate to ask if you don't understand."),
    w("pronounce", "verb", "to say a word in a particular way", "дыбыстау, айту", "произносить", "How do you pronounce this word?"),
    w("accent", "noun", "a way of speaking that shows where you are from", "акцент", "акцент", "He has a slight American accent."),
    w("habit", "noun", "something you do often without thinking", "әдет", "привычка", "Reading before bed is a good habit."),
    w("opinion", "noun", "what you think about something", "пікір", "мнение", "In my opinion, winter is the best season."),
    w("frequently", "adverb", "often", "жиі", "часто", "I frequently visit my grandparents."),
    w("hobby", "noun", "something you enjoy doing in your free time", "хобби", "хобби", "My hobby is photography."),
  ],
  // Listening: maps and plans
  "2-1": [
    w("opposite", "preposition", "on the other side of", "қарсы, қарама-қарсы", "напротив", "The café is opposite the library."),
    w("junction", "noun", "a place where roads meet", "қиылыс", "перекрёсток", "Turn left at the junction."),
    w("entrance", "noun", "the way in", "кіреберіс", "вход", "The main entrance is on the east side."),
    w("corridor", "noun", "a long narrow passage inside a building", "дәліз", "коридор", "The classroom is at the end of the corridor."),
    w("staircase", "noun", "stairs inside a building", "баспалдақ", "лестница", "Take the staircase to the second floor."),
    w("fountain", "noun", "water jets in a park or square", "субұрқақ", "фонтан", "Meet me next to the fountain."),
    w("pavement", "noun", "the path at the side of a road", "жаяу жүргіншілер жолы", "тротуар", "Walk along the pavement until the bridge."),
    w("beside", "preposition", "next to", "қасында", "рядом с, возле", "The bank is beside the post office."),
  ],
  // Reading: headings and summaries
  "2-2": [
    w("heading", "noun", "a title for a paragraph", "атау, тақырып", "заголовок", "Choose the best heading for each paragraph."),
    w("summary", "noun", "a short version of the main points", "қысқаша мазмұн", "краткое содержание", "Complete the summary with words from the text."),
    w("locate", "verb", "to find where something is", "табу, орнын анықтау", "находить, определять место", "Locate the answer in the third paragraph."),
    w("skim", "verb", "to read quickly to get the main idea", "жылдам көз жүгірту", "бегло просматривать", "Skim the text before you read the questions."),
    w("scan", "verb", "to look quickly for a specific word or number", "іздеп қарап шығу", "искать глазами", "Scan the passage for dates and names."),
    w("detail", "noun", "a small piece of information", "егжей-тегжей", "деталь", "The question asks for a specific detail."),
    w("topic", "noun", "the subject of a text or talk", "тақырып", "тема", "The topic of the passage is renewable energy."),
    w("paraphrase", "verb", "to say something again in different words", "басқаша жеткізу", "перефразировать", "The question paraphrases a sentence in the text."),
  ],
  // Writing Task 1: bar charts and pie charts
  "2-3": [
    w("proportion", "noun", "a part of a whole", "үлес", "доля, пропорция", "A large proportion of the budget goes on rent."),
    w("percentage", "noun", "a number out of one hundred", "пайыз", "процент", "The percentage of women rose to 55."),
    w("category", "noun", "a group of similar things", "санат", "категория", "Food is the biggest category of spending."),
    w("majority", "noun", "more than half of a group", "көпшілік", "большинство", "The majority of students walk to school."),
    w("minority", "noun", "less than half of a group", "азшылық", "меньшинство", "Only a small minority use the train."),
    w("respectively", "adverb", "in the order that was mentioned", "сәйкесінше", "соответственно", "Tea and coffee were 20% and 35% respectively."),
    w("compare", "verb", "to look at how things are alike or different", "салыстыру", "сравнивать", "The chart compares sales in two cities."),
    w("approximately", "adverb", "about, not exactly", "шамамен", "приблизительно", "Approximately half of the people agreed."),
  ],
  // Writing Task 2: causes and solutions
  "3-1": [
    w("cause", "noun", "the reason something happens", "себеп", "причина", "Poor planning is one cause of traffic jams."),
    w("solution", "noun", "a way to solve a problem", "шешім", "решение", "Cheap buses could be a good solution."),
    w("tackle", "verb", "to try to deal with a problem", "күресу, шешуге кірісу", "решать, бороться с", "Governments must tackle air pollution."),
    w("congestion", "noun", "too much traffic in one place", "кептеліс", "затор, перегруженность", "Traffic congestion wastes time and money."),
    w("measure", "noun", "an action taken to solve a problem", "шара", "мера", "The city introduced new measures to cut waste."),
    w("prevent", "verb", "to stop something from happening", "алдын алу", "предотвращать", "Better lighting can prevent accidents."),
    w("campaign", "noun", "a planned set of actions to reach a goal", "науқан", "кампания", "The campaign encourages people to recycle."),
    w("harmful", "adjective", "causing damage", "зиянды", "вредный", "Smoke from factories is harmful to health."),
  ],
  // Speaking Part 2: the long turn
  "3-2": [
    w("memorable", "adjective", "easy to remember because it is special", "есте қаларлық", "запоминающийся", "It was a memorable trip."),
    w("atmosphere", "noun", "the feeling of a place", "атмосфера", "атмосфера", "The café has a friendly atmosphere."),
    w("scenery", "noun", "the natural views of a place", "табиғат көрінісі", "пейзаж, виды", "The scenery in the mountains was amazing."),
    w("souvenir", "noun", "something you buy to remember a trip", "естелік сыйлық", "сувенир", "I bought a small souvenir for my sister."),
    w("unforgettable", "adjective", "impossible to forget", "ұмытылмас", "незабываемый", "The concert was an unforgettable evening."),
    w("describe", "verb", "to say what someone or something is like", "сипаттау", "описывать", "Describe a place you would like to visit."),
    w("destination", "noun", "the place where you are going", "баратын жер", "пункт назначения", "Paris is a popular holiday destination."),
    w("adventure", "noun", "an exciting or unusual experience", "шытырман оқиға", "приключение", "Our trip was a real adventure."),
  ],
  // Listening: tables, forms and notes
  "3-3": [
    w("deadline", "noun", "the last time by which something must be done", "мерзім, соңғы күн", "крайний срок", "The deadline for applications is Friday."),
    w("address", "noun", "the details of where you live", "мекенжай", "адрес", "Write your home address in capital letters."),
    w("membership", "noun", "being a member of a club or group", "мүшелік", "членство", "Membership costs thirty pounds a year."),
    w("discount", "noun", "a lower price", "жеңілдік", "скидка", "Students get a ten percent discount."),
    w("receipt", "noun", "a paper that shows you have paid", "түбіртек, чек", "квитанция, чек", "Keep your receipt in case you need a refund."),
    w("refund", "noun", "money that is given back to you", "ақшаны қайтару", "возврат денег", "You can ask for a full refund."),
    w("capital", "adjective", "in the form of big letters", "бас (әріп)", "заглавный", "Write your name in capital letters."),
    w("reception", "noun", "the desk where visitors arrive and check in", "қабылдау бөлмесі, ресепшн", "стойка регистрации", "Please leave your keys at reception."),
  ],
  // Reading: matching information
  "4-1": [
    w("reveal", "verb", "to show something that was hidden", "көрсету, ашу", "показывать, раскрывать", "The survey reveals a change in habits."),
    w("approach", "noun", "a way of dealing with something", "тәсіл", "подход", "A new approach to teaching has been introduced."),
    w("factor", "noun", "one of the things that influences a result", "фактор", "фактор", "Cost is an important factor."),
    w("survey", "noun", "a set of questions asked to many people", "сауалнама", "опрос", "The survey asked 500 people about their diet."),
    w("researcher", "noun", "a person who studies something carefully", "зерттеуші", "исследователь", "The researcher compared two groups."),
    w("participant", "noun", "a person who takes part in something", "қатысушы", "участник", "Each participant completed a short test."),
    w("publish", "verb", "to print or put something online for the public", "жариялау", "публиковать", "The results were published last year."),
    w("conduct", "verb", "to organise and carry out", "жүргізу", "проводить", "Scientists conducted an experiment."),
  ],
  // Writing Task 1: tables
  "4-2": [
    w("figure", "noun", "a number, especially in official information", "көрсеткіш, сан", "показатель, цифра", "The figure for 2020 was the lowest."),
    w("column", "noun", "a vertical line of information in a table", "баған", "столбец", "Look at the last column of the table."),
    w("row", "noun", "a horizontal line of information", "жол", "строка", "The top row shows the years."),
    w("highest", "adjective", "greatest in amount", "ең жоғары", "наивысший", "Japan had the highest number of visitors."),
    w("lowest", "adjective", "least in amount", "ең төмен", "наименьший, самый низкий", "Unemployment was lowest in 2019."),
    w("slightly", "adverb", "a little", "сәл, аздап", "немного, слегка", "Sales fell slightly in June."),
    w("double", "verb", "to become twice as big", "екі есе өсу", "удваиваться", "The number of users doubled in five years."),
    w("whereas", "conjunction", "used to compare two different things", "ал, керісінше", "тогда как", "Car use rose, whereas bus use fell."),
  ],
  // Writing Task 2: discussion essays
  "4-3": [
    w("argue", "verb", "to give reasons to support an idea", "дәлелдеу, пікір білдіру", "утверждать, доказывать", "Some people argue that homework is useless."),
    w("debate", "noun", "a discussion where people disagree", "пікірталас", "дебаты, дискуссия", "There is a lot of debate about school uniforms."),
    w("viewpoint", "noun", "a way of thinking about something", "көзқарас", "точка зрения", "Each viewpoint has its strengths."),
    w("justify", "verb", "to give a good reason for something", "негіздеу", "обосновывать, оправдывать", "Can high prices be justified?"),
    w("extent", "noun", "how much, or the size of something", "дәреже, көлем", "степень, мера", "To what extent do you agree?"),
    w("balanced", "adjective", "fair and giving attention to all sides", "теңгерімді", "сбалансированный", "A balanced essay discusses both views."),
    w("reasonable", "adjective", "fair and sensible", "орынды, ақылға қонымды", "разумный", "It is reasonable to expect good service."),
    w("oppose", "verb", "to disagree with and try to stop", "қарсы болу", "выступать против", "Many residents oppose the new road."),
  ],
  // Speaking Parts 2 and 3
  "5-1": [
    w("abstract", "adjective", "existing as an idea, not as a real thing", "дерексіз, абстрактілі", "абстрактный", "Part 3 asks abstract questions about society."),
    w("influence", "verb", "to have an effect on someone or something", "әсер ету", "влиять", "Friends influence the music we like."),
    w("tendency", "noun", "a habit of doing or being something", "бейімділік", "склонность, тенденция", "Young people have a tendency to follow trends."),
    w("nowadays", "adverb", "at the present time", "қазіргі уақытта", "в наши дни", "Nowadays, most people shop online."),
    w("traditional", "adjective", "following older customs", "дәстүрлі", "традиционный", "Traditional food is popular at festivals."),
    w("predict", "verb", "to say what will happen", "болжау", "предсказывать", "I predict that most cars will be electric."),
    w("mainly", "adverb", "mostly", "негізінен", "главным образом", "I mainly use my phone for study."),
    w("depend", "verb", "to be decided by something else", "байланысты болу", "зависеть", "It depends on the weather."),
  ],
  // Listening: flow charts and diagrams
  "5-2": [
    w("process", "noun", "a series of steps to make or do something", "үдеріс, процесс", "процесс", "The process has five stages."),
    w("stage", "noun", "one step in a process", "кезең", "этап", "In the second stage, the fruit is washed."),
    w("label", "verb", "to write names on the parts of a picture", "белгілеу, таңбалау", "подписывать, маркировать", "Label the parts of the machine."),
    w("component", "noun", "one part of a machine or system", "құрамдас бөлік", "компонент, деталь", "The battery is the main component."),
    w("assemble", "verb", "to put parts together", "құрастыру", "собирать", "Workers assemble the cars by hand."),
    w("sequence", "noun", "the order in which things follow each other", "реттілік", "последовательность", "Listen for the sequence of steps."),
    w("mechanism", "noun", "a set of parts that work together", "тетік, механизм", "механизм", "The lock has a simple mechanism."),
    w("afterwards", "adverb", "later, after something", "содан кейін", "после, потом", "Afterwards, the paper is dried."),
  ],
  // Reading: diagram completion
  "5-3": [
    w("diagram", "noun", "a drawing that shows how something works", "сызба, диаграмма", "схема, диаграмма", "Look at the diagram on the next page."),
    w("structure", "noun", "the way the parts are arranged", "құрылым", "структура, строение", "The structure of the roof is very simple."),
    w("device", "noun", "a small machine made for a purpose", "құрылғы", "устройство", "This device cleans the water."),
    w("layer", "noun", "a level of material over another", "қабат", "слой", "A thin layer of sand filters the water."),
    w("tank", "noun", "a large container for liquid", "сыйымдылық, бак", "бак, резервуар", "Rain is stored in a tank."),
    w("install", "verb", "to put equipment in place", "орнату", "устанавливать", "They installed solar panels on the roof."),
    w("remove", "verb", "to take something away", "алып тастау", "удалять", "The filter removes dirt and bacteria."),
    w("durable", "adjective", "strong and lasting a long time", "берік, ұзаққа шыдайтын", "прочный", "Steel is a durable material."),
  ],
  // Writing Task 1: process diagrams
  "5-4": [
    w("raw", "adjective", "not yet cooked or processed", "шикі, өңделмеген", "сырой", "Raw materials are delivered to the factory."),
    w("heat", "verb", "to make something warm or hot", "қыздыру", "нагревать", "The mixture is heated to 100 degrees."),
    w("cool", "verb", "to make something less hot", "салқындату", "охлаждать", "The metal is cooled in water."),
    w("press", "verb", "to push down on something firmly", "қысу, престеу", "прессовать, давить", "The paper is pressed into thin sheets."),
    w("collect", "verb", "to bring things together", "жинау", "собирать", "Used bottles are collected from homes."),
    w("transport", "verb", "to carry from one place to another", "тасымалдау", "транспортировать", "Trucks transport the goods to the shops."),
    w("final", "adjective", "last", "соңғы", "заключительный, конечный", "The final product is packed in boxes."),
    w("finally", "adverb", "as the last step", "ең соңында", "наконец, в заключение", "Finally, the bottles are sent to the shops."),
  ],
  // Writing Task 2: double question
  "5-5": [
    w("challenge", "noun", "something difficult that tests you", "қиындық, сын", "вызов, трудность", "Learning a language is a big challenge."),
    w("motivation", "noun", "the reason why you want to do something", "ынта, мотивация", "мотивация", "Good teachers give students motivation."),
    w("confidence", "noun", "a feeling that you can do something well", "сенімділік", "уверенность", "Speaking practice builds confidence."),
    w("career", "noun", "the jobs that a person does in life", "мансап", "карьера", "Languages can help your career."),
    w("adulthood", "noun", "the time of life when you are an adult", "ересек шақ", "взрослая жизнь", "Many people start new hobbies in adulthood."),
    w("abroad", "adverb", "in or to another country", "шетелде", "за границей", "She studied abroad for a year."),
    w("struggle", "verb", "to try very hard to do something difficult", "қиналу, арпалысу", "с трудом справляться, бороться", "Adults often struggle with pronunciation."),
    w("patience", "noun", "the ability to wait calmly", "шыдамдылық", "терпение", "Learning needs patience and practice."),
  ],
  // Speaking Part 3: abstract topics
  "5-6": [
    w("globalisation", "noun", "the growth of connections between countries", "жаһандану", "глобализация", "Globalisation has changed the way we shop."),
    w("identity", "noun", "who you are, and the qualities that make you different", "бірегейлік, болмыс", "идентичность, самобытность", "Language is part of our national identity."),
    w("values", "noun", "beliefs about what is important in life", "құндылықтар", "ценности", "Family values are very important in my culture."),
    w("ethical", "adjective", "connected with what is right or wrong", "этикалық", "этичный", "Is it ethical to test products on animals?"),
    w("responsibility", "noun", "a duty to take care of something or someone", "жауапкершілік", "ответственность", "Parents have a responsibility to protect children."),
    w("inequality", "noun", "an unfair difference between groups", "теңсіздік", "неравенство", "Inequality between rich and poor is growing."),
    w("innovation", "noun", "a new idea or method", "жаңалық, инновация", "инновация", "Innovation drives economic growth."),
    w("cultural", "adjective", "connected with the customs and arts of a group", "мәдени", "культурный", "Cultural festivals bring people together."),
  ],
};
