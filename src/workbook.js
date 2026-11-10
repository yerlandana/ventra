// Writing and Grammar Workbook content: seven topics and six grammar units for each Task 2 level,
// plus one grammar unit for each course lesson ("By lesson").
// Answers are keyed "level:unit:task+index", for example "6:t-tech:w0". A unit can be added without touching saved answers.
const t = (from, to, example) => ({ from, to, example });
const r = (from, to) => ({ from, to });

export const LEVELS = {
  "6": { name:"5.0 to 6.0", frame:["Main idea","Reason","Example","Result"],
    frameExample:["First of all, young children learn languages faster than adults.","Their brains are flexible, so they copy new sounds and words easily.","For example, children who move abroad often speak the new language well within a year.","As a result, starting at primary school gives them a strong advantage."],
    topics:[
      { id:"tech", title:"Technology", question:"Do the advantages of mobile phones outweigh the disadvantages?",
        words:[t("talk to friends far away","keep in touch","Phones help us keep in touch with family."),t("use phone all day","spend hours online","Teenagers often spend hours online."),t("new machines","modern technology","Modern technology saves us time."),t("find things on internet","access information","Students can access information quickly."),t("robots take jobs","replace workers","Machines can replace workers in factories.")],
        grammar:{ skill:"Join the sentences with because, so, which or although.", items:[r("Phones are useful. They help us keep in touch.","Phones are useful because they help us keep in touch."),r("Teenagers spend hours online. They sleep less.","Teenagers spend hours online, so they sleep less."),r("Robots work fast. Factories want them.","Robots work fast, which is why factories want them."),r("The internet is helpful. It can be dangerous.","Although the internet is helpful, it can be dangerous.")]}},
      { id:"env", title:"Environment", question:"Who should do more to protect the environment: people or governments?",
        words:[t("dirty air","air pollution","Air pollution causes serious illness."),t("make less rubbish","reduce waste","We should reduce waste at home."),t("weather is changing","climate change","Climate change affects farming."),t("take trees away","destroy forests","Farming can destroy forests and wildlife."),t("use sun and wind","use renewable energy","Countries should use renewable energy.")],
        grammar:{ skill:"Rewrite the sentence with should, must, can or may.", items:[r("It is a good idea for people to recycle.","People should recycle."),r("It is necessary for factories to stop polluting rivers.","Factories must stop polluting rivers."),r("It is possible to save energy at home.","We can save energy at home."),r("Maybe the government will ban plastic bags.","The government may ban plastic bags.")]}},
      { id:"edu", title:"Education", question:"Is it better to study at school or online?",
        words:[t("study at home on computer","study online","Many adults study online after work."),t("good school results","good grades","Hard work leads to good grades."),t("learn skills for work","practical skills","Schools should teach practical skills."),t("pay for university","tuition fees","High tuition fees stop some students."),t("teacher makes you want to learn","motivate students","Good teachers motivate students to learn.")],
        grammar:{ skill:"Make one if sentence.", items:[r("Lessons are interesting. Students work harder.","If lessons are interesting, students will work harder."),r("Tuition fees are lower. More students go to university.","If tuition fees are lower, more students will go to university."),r("I do not have a computer, so I cannot study online.","If I had a computer, I could study online."),r("Students do not practise. They do not make progress.","If students do not practise, they do not make progress.")]}},
      { id:"health", title:"Health", question:"What can people do to live a healthier life?",
        words:[t("not doing sport","lack of exercise","Lack of exercise causes health problems."),t("bad food","fast food","Fast food is cheap but unhealthy."),t("go to doctor","get medical treatment","Everyone should get medical treatment."),t("feel stressed","suffer from stress","Many workers suffer from stress."),t("very fat","obesity","Obesity is a growing problem.")],
        grammar:{ skill:"Correct the tense. Look at the time words.", items:[r("In the past, people walk more.","In the past, people walked more."),r("Recently, fast food become very popular.","Recently, fast food has become very popular."),r("Last year, my city open a new hospital.","Last year, my city opened a new hospital."),r("Now, many workers is suffering from stress.","Now, many workers are suffering from stress.")]}},
      { id:"crime", title:"Crime", question:"Is prison the best way to reduce crime?",
        words:[t("people who do crime","criminals","Criminals should be punished."),t("more police","police presence","More police presence makes people feel safe."),t("no money","poverty","Poverty is a main cause of crime."),t("make crime go down","reduce crime","Better education can reduce crime."),t("hard punishment","strict punishment","Strict punishment may stop crime.")],
        grammar:{ skill:"Find and fix the mistake.", items:[r("Criminals needs help to change.","Criminals need help to change."),r("Poverty is main cause of crime.","Poverty is a main cause of crime."),r("Prisons are full, they are expensive.","Prisons are full, and they are expensive."),r("Young people needs more support.","Young people need more support.")]}},
      { id:"work", title:"Work and money", question:"Is a high salary more important than free time?",
        words:[t("good job","well-paid job","Many graduates want a well-paid job."),t("work at home","work remotely","More staff work remotely these days."),t("no job","unemployment","Unemployment is high among young people."),t("time for family","work-life balance","A good job should offer work-life balance."),t("learn at work","gain experience","Interns gain experience before a real job.")],
        grammar:{ skill:"Join the sentences with because, although, so or which.", items:[r("Remote work is popular. It saves time.","Remote work is popular because it saves time."),r("The salary is high. The hours are long.","Although the salary is high, the hours are long."),r("Unemployment is high. Young people move abroad.","Unemployment is high, so young people move abroad."),r("Interns gain experience. This helps them find a job.","Interns gain experience, which helps them find a job.")]}},
      { id:"society", title:"Society", question:"Is life in a big city better than life in a village?",
        words:[t("too many people","overcrowding","Overcrowding makes cities stressful."),t("old people","elderly people","Elderly people need more care."),t("not equal","inequality","Inequality causes social problems."),t("life in a city","urban life","Urban life is fast and stressful."),t("help from government","public services","The state should improve public services.")],
        grammar:{ skill:"Make one comparative sentence.", items:[r("Life in a city is fast. Life in a village is slow.","Life in a city is faster than life in a village."),r("Housing is expensive in cities. It is cheap in villages.","Housing is more expensive in cities than in villages."),r("Overcrowding is a big problem now. It was smaller before.","Overcrowding is a bigger problem now than before."),r("Public services are good in the capital. They are bad in small towns.","Public services are better in the capital than in small towns.")]}},
    ],
    grammarUnits:[
      { id:"join", title:"Join your sentences", how:"Turn two short sentences into one longer sentence.", items:[r("Many people drive. The air is dirty.","Many people drive, so the air is dirty."),r("Exercise is good. It reduces stress.","Exercise is good because it reduces stress."),r("Online lessons are cheap. Students like them.","Online lessons are cheap, which attracts students."),r("Cars are fast. They are expensive too.","Although cars are fast, they are expensive.")]},
      { id:"tense", title:"Past and present", how:"Choose the tense that matches the time. Last year, in the past: past simple. Recently, since: present perfect.", items:[r("Technology change our lives a lot.","Technology has changed our lives a lot."),r("Last year, the government build a school.","Last year, the government built a school."),r("In the past, people write letters.","In the past, people wrote letters."),r("Now, many people is using phones all day.","Now, many people are using phones all day.")]},
      { id:"modal", title:"Modal verbs", how:"Give advice, rules and possibilities in a shorter way.", items:[r("I think it is good if schools teach cooking.","Schools should teach cooking."),r("Maybe people will stop using cars.","People may stop using cars."),r("It is necessary to wear seat belts.","Drivers must wear seat belts."),r("It is possible to save money.","Families can save money by cooking at home.")]},
      { id:"if", title:"If sentences", how:"Talk about results and solutions.", items:[r("Recycle more. The city is cleaner.","If we recycle more, the city will be cleaner."),r("Cheap buses. More people use them.","If buses are cheap, more people will use them."),r("I have no free time, so I do not exercise.","If I had more free time, I would exercise."),r("Students do not sleep. They cannot focus.","If students do not sleep, they cannot focus.")]},
      { id:"errors", title:"Errors that cost a band", how:"Fix each sentence. Check articles, plural -s and the verb to be.", items:[r("The people is happy in villages.","The people are happy in villages."),r("Students need more advices.","Students need more advice."),r("She don't like homework.","She doesn't like homework."),r("Cars are fast, they are dangerous.","Cars are fast, but they are dangerous.")]},
      { id:"forms", title:"Word forms", how:"Write the correct form of the word in brackets.", gaps:[["She worked hard and became ___ .","success","successful"],["Students have more ___ today.","choose","choice"],["___ is the key to a good job.","educate","Education"],["___ air causes illness.","pollute","Polluted"],["A ___ diet gives you energy.","health","healthy"],["Driving fast is ___ .","danger","dangerous"]]},
    ]},
  "7": { name:"6.5 to 7.5", frame:["Topic sentence","Explain the idea","Give an example","Link back"],
    frameExample:["To begin with, public transport is the better investment because it reduces congestion.","A single full bus can take dozens of cars off the road, which means shorter journeys for everyone, including drivers.","A case in point is Singapore, where high car taxes and a dense metro network keep traffic moving.","Therefore, building more roads alone treats the symptom rather than the cause."],
    topics:[
      { id:"tech", title:"Technology and AI", question:"Some people think artificial intelligence will do more harm than good. To what extent do you agree?",
        words:[t("make jobs disappear","automate routine tasks","Machines automate routine tasks cheaply."),t("lose private data","compromise privacy","Some apps compromise privacy without warning."),t("use phones too much","excessive screen time","Excessive screen time harms sleep and focus."),t("new technology","technological advances","Technological advances have changed how we work."),t("poor people have no internet","bridge the digital divide","Free wifi can bridge the digital divide.")],
        grammar:{ skill:"Combine with a relative clause: which, who, whose or where.", items:[r("AI writes reports. It saves companies time.","AI writes reports, which saves companies time."),r("Some people have no internet access. They fall behind.","People who have no internet access often fall behind."),r("Workers need training. Their jobs are automated.","Workers whose jobs are automated need training."),r("Some cities offer free wifi. Students study there.","Students study in cities where free wifi is available.")]}},
      { id:"env", title:"Environment and climate", question:"Should individuals or governments be responsible for reducing pollution?",
        words:[t("pollution from cars","greenhouse gas emissions","Transport produces many greenhouse gas emissions."),t("use less energy","cut your carbon footprint","Cycling helps people cut their carbon footprint."),t("cut down forests","deforestation","Deforestation destroys wildlife habitats."),t("solar and wind power","renewable energy sources","Nations should invest in renewable energy sources."),t("make strict rules","impose strict regulations","Governments can impose strict regulations.")],
        grammar:{ skill:"Rewrite in the passive.", items:[r("The government should introduce stricter laws.","Stricter laws should be introduced."),r("Factories release harmful gases.","Harmful gases are released by factories."),r("People cut down millions of trees every year.","Millions of trees are cut down every year."),r("Cities must build more cycle lanes.","More cycle lanes must be built.")]}},
      { id:"edu", title:"Education", question:"Should schools focus on exam results or on practical life skills?",
        words:[t("good results at school","academic achievement","Small classes can raise academic achievement."),t("study online at home","distance learning","Distance learning suits busy working adults."),t("skills for a job","vocational training","Vocational training prepares students for a career."),t("same chance for all","equal access to education","Free schools ensure equal access to education."),t("think for yourself","foster critical thinking","Schools should foster critical thinking.")],
        grammar:{ skill:"Rewrite with unless, as long as, or an unreal conditional.", items:[r("If schools do not change the curriculum, students will lack practical skills.","Unless schools change the curriculum, students will lack practical skills."),r("Students can succeed online if they stay motivated.","As long as students stay motivated, they can succeed online."),r("University is not free, so many talented students do not apply.","If university were free, more talented students would apply."),r("Distance learning exists because of the internet.","If it weren't for the internet, distance learning would not exist.")]}},
      { id:"health", title:"Health and lifestyle", question:"Is prevention more important than treatment in public health?",
        words:[t("sit all day","a sedentary lifestyle","A sedentary lifestyle increases health risks."),t("unhealthy food","processed food","Cheap processed food is linked to obesity."),t("free hospitals","universal healthcare","Universal healthcare protects low-income families."),t("help people stay healthy","promote public health","Campaigns promote public health at low cost."),t("feel calm and happy","mental wellbeing","Regular exercise improves mental wellbeing.")],
        grammar:{ skill:"Make the claim more cautious and academic.", items:[r("Processed food causes obesity.","Processed food tends to contribute to obesity."),r("Everyone knows exercise is good for the mind.","It is widely believed that exercise benefits mental wellbeing."),r("This campaign will solve the problem.","This campaign could, to some extent, solve the problem."),r("The government must build more gyms.","More sports facilities should be built.")]}},
      { id:"crime", title:"Crime and punishment", question:"Should criminals be punished or rehabilitated?",
        words:[t("stop people from crime","act as a deterrent","Tougher sentences may act as a deterrent."),t("go back to crime","reoffend","Without support, many prisoners reoffend."),t("help criminals change","rehabilitate offenders","Education can rehabilitate offenders."),t("real reasons for crime","root causes","Poverty is one of the root causes of crime."),t("crime by teenagers","juvenile delinquency","Juvenile delinquency is rising in some cities.")],
        grammar:{ skill:"Show contrast with although, despite, while or that said.", items:[r("Prison protects society, but it rarely changes offenders.","Although prison protects society, it rarely changes offenders."),r("Long sentences are expensive, but they are popular.","Despite being expensive, long sentences remain popular."),r("Some want harsher punishment. Others want rehabilitation.","While some call for harsher punishment, others favour rehabilitation."),r("Police presence reduces crime. It does not tackle the root causes.","Police presence reduces crime. That said, it does not tackle the root causes.")]}},
      { id:"work", title:"Work and the economy", question:"Do the benefits of remote working outweigh the drawbacks?",
        words:[t("work from home","remote working","Remote working removes the daily commute."),t("a job that will last","job security","Graduates value job security above high pay."),t("time for family and work","work-life balance","Flexible hours improve work-life balance."),t("get paid well","a competitive salary","Firms offer a competitive salary to attract talent."),t("start working","enter the job market","Graduates struggle to enter the job market.")],
        grammar:{ skill:"Link cause and result: which, in turn, / as a result of / has led to.", items:[r("Remote working removes the commute. People have more free time.","Remote working removes the daily commute, which, in turn, gives people more free time."),r("Automation is spreading. Many low-skilled jobs are disappearing.","As a result of automation, many low-skilled jobs are disappearing."),r("Wages are low. Graduates move abroad.","Low wages have led many graduates to move abroad."),r("Flexible hours improve balance. Staff are more productive.","Flexible hours improve work-life balance, which results in higher productivity.")]}},
      { id:"society", title:"Society and government", question:"Should governments spend more on the elderly or on young people?",
        words:[t("more old people","an ageing population","An ageing population puts pressure on pensions."),t("people move to cities","rapid urbanisation","Rapid urbanisation has pushed up housing costs."),t("decide where money goes","allocate funding","Governments must allocate funding carefully."),t("gap between rich and poor","income inequality","Income inequality can weaken community spirit."),t("keep old traditions","preserve cultural heritage","Museums help to preserve cultural heritage.")],
        grammar:{ skill:"Find and fix the error.", items:[r("Government should spend more on elderly.","The government should spend more on the elderly."),r("The number of people living in cities are rising.","The number of people living in cities is rising."),r("Young people need more informations about pensions.","Young people need more information about pensions."),r("Housing is expensive, many families cannot buy homes.","Housing is expensive, so many families cannot buy homes.")]}},
    ],
    grammarUnits:[
      { id:"relative", title:"Relative clauses", how:"Add detail without a new sentence. Use a comma before which when it adds extra information.", items:[r("Cars cause pollution. Pollution harms health.","Cars cause pollution, which harms health."),r("Some students have no internet. They fall behind.","Students who lack internet access often fall behind."),r("Cities have many jobs. People move there.","People move to cities, where jobs are plentiful."),r("Companies need workers. Their skills are modern.","Firms need workers whose skills are current.")]},
      { id:"cond", title:"Conditionals", how:"Talk about solutions and imagined results.", items:[r("If we ban cars, the air gets cleaner.","If cars were banned, the air would be cleaner."),r("Without this law, factories will pollute.","Unless the law changes, factories will keep polluting."),r("If people exercise, they are healthier.","As long as people exercise, they stay healthier."),r("Remote work exists because of the internet.","If it weren't for the internet, remote work would not exist.")]},
      { id:"cautious", title:"Cautious language", how:"Sound academic, not absolute.", items:[r("People think young people read less.","It is widely believed that young people read less."),r("Social media makes teenagers anxious.","Social media tends to make teenagers anxious."),r("This will solve the problem.","This could, to some extent, solve the problem."),r("The government must make stricter laws.","Stricter laws should be introduced.")]},
      { id:"contrast", title:"Contrast and concession", how:"Show that you see the other side before you give your view.", items:[r("Cars are useful but they cause pollution.","Although cars are useful, they cause pollution."),r("Exams are stressful but necessary.","Despite being stressful, exams are necessary."),r("Some like cities. Others like villages.","While some prefer cities, others prefer villages."),r("Online study is cheap, but it can be lonely.","Admittedly, online study is cheap, yet it can feel isolating.")]},
      { id:"errors", title:"Errors that cost half a band", how:"Fix each sentence. Check articles, uncountable nouns, agreement and commas.", items:[r("Government should build more hospitals.","The government should build more hospitals."),r("Technology gives us many informations.","Technology gives us a lot of information."),r("The number of cars are increasing.","The number of cars is increasing."),r("Cars are cheap, they are also noisy.","Cars are cheap, but they are also noisy.")]},
      { id:"forms", title:"Word families", how:"Write the correct form of the word in brackets.", gaps:[["Young adults should become less ___ on their parents.","depend","dependent"],["An ___ car saves money.","economy","economical"],["Regular exercise is ___ to all age groups.","benefit","beneficial"],["Prices have risen ___ over the past decade.","significant","significantly"],["___ friendly products are becoming popular.","environment","Environmentally"],["Flexible hours can raise ___ in many companies.","produce","productivity"]]},
    ]},
  "c": { name:"By lesson", topics:[],
    grammarUnits:[
      { id:"pres", lesson:1, title:"Present Simple and Continuous", how:"Present Simple for habits and facts. Present Continuous for actions happening now or around now.",
        gaps:[["Water ___ at 100 degrees Celsius.","boil","boils"],["Look! The bus ___ .","come","is coming",["'s coming"]],["She usually ___ to work by metro.","go","goes"],["I ___ for my IELTS exam this month.","study","am studying",["'m studying"]]],
        items:[r("He drink coffee every morning.","He drinks coffee every morning."),r("I am knowing the answer.","I know the answer.")]},
      { id:"articles", lesson:2, title:"Articles", how:"Write a, an, the, or a dash (-) if no article is needed.",
        gaps:[["She is ___ honest student.","a / an / the / -","an"],["___ sun rises in the east.","a / an / the / -","The"],["I want to be ___ engineer.","a / an / the / -","an"],["___ life in big cities can be stressful.","a / an / the / -","-",["no article","–","—","x"]]],
        items:[r("Government should build more schools.","The government should build more schools."),r("I bought a book. A book was boring.","I bought a book. The book was boring.")]},
      { id:"pastcont", lesson:3, title:"Past Simple and Past Continuous", how:"Past Continuous for a longer action in progress. Past Simple for the short action that interrupts it, and for finished events.",
        gaps:[["I ___ TV when the phone rang.","watch","was watching"],["While she was cooking, she ___ her finger.","cut","cut"],["The number of tourists ___ sharply in 2010.","rise","rose"],["At 8 pm yesterday, we ___ dinner.","have","were having"]],
        items:[r("Sales was rising steadily between 2000 and 2005.","Sales were rising steadily between 2000 and 2005."),r("I walked home when it started to rain.","I was walking home when it started to rain.")]},
      { id:"compare", lesson:5, title:"Comparatives and superlatives", how:"Short adjectives take -er and -est. Long adjectives take more and the most.",
        gaps:[["My city is ___ than my village.","big","bigger"],["This is the ___ day of my life.","good","best"],["Taxis are ___ than buses.","expensive","more expensive"],["Winter is the ___ season here.","cold","coldest"]],
        items:[r("My brother is more tall than me.","My brother is taller than me."),r("It is the most cheap café in town.","It is the cheapest café in town.")]},
      { id:"perfect", lesson:6, title:"Present Perfect and Past Simple", how:"Past Simple for a finished time (yesterday, in 2022). Present Perfect for experience, results now, and since or for.",
        gaps:[["I ___ to Paris in 2022.","go","went"],["She ___ here since 2020.","live","has lived",["has been living","'s lived"]],["I ___ my keys. I can't find them.","lose","have lost",["'ve lost"]],["We ___ the film last night.","see","saw"]],
        items:[r("I have seen him yesterday.","I saw him yesterday."),r("She lives here for five years.","She has lived here for five years.")]},
      { id:"passive", lesson:7, title:"Passive voice", how:"be + past participle. Use it when the action matters more than who does it, for example in processes and reports.",
        gaps:[["English ___ in many countries.","speak","is spoken"],["The bridge ___ in 1990.","build","was built"],["New rules ___ next year.","introduce","will be introduced"],["The paper ___ before it is dried.","clean","is cleaned"]],
        items:[r("People grow rice in Asia.","Rice is grown in Asia."),r("Someone stole my bike yesterday.","My bike was stolen yesterday.")]},
      { id:"cohesion", lesson:9, title:"Cohesive devices", how:"Link ideas to show contrast, result, addition and examples.",
        gaps:[["Cars are useful. ___, they cause pollution.","contrast","However"],["Prices rose. ___, fewer people travelled.","result","As a result",["Consequently","Therefore"]],["Many cities, ___ Almaty, have traffic jams.","example","such as"],["Exercise is healthy. ___, it reduces stress.","addition","In addition",["Moreover","Furthermore","What's more"]]],
        items:[r("Traffic is bad. So people are late.","Traffic is bad. As a result, people are often late."),r("Online study is cheap. But it is lonely.","Online study is cheap. However, it can be lonely.")]},
      { id:"pastperf", lesson:10, title:"Past Perfect", how:"had + past participle for an action that happened before another past action.",
        gaps:[["When we arrived, the film ___ .","already start","had already started"],["I was tired because I ___ all night.","not sleep","had not slept",["hadn't slept"]],["After he ___ his homework, he went out.","finish","had finished"],["By 2010, the company ___ 100 shops.","open","had opened"]],
        items:[r("The train left. Then I arrived at the station.","When I arrived at the station, the train had left."),r("She finished the essay. Then she checked it.","After she had finished the essay, she checked it.")]},
      { id:"prep", lesson:11, title:"Prepositions", how:"in, on, at for time, and the prepositions that go with common words.",
        gaps:[["I have studied IELTS ___ six months.","for / since","for"],["The exam starts ___ 9 am.","in / on / at","at"],["She was born ___ May.","in / on / at","in"],["We have classes ___ Monday.","in / on / at","on"]],
        items:[r("I am interested about history.","I am interested in history."),r("It depends of the weather.","It depends on the weather.")]},
      { id:"cond01", lesson:13, title:"Zero and first conditionals", how:"Zero: if + present, present (facts). First: if + present, will (real future).",
        gaps:[["If you heat ice, it ___ .","melt","melts"],["If it rains tomorrow, we ___ at home.","stay","will stay",["'ll stay"]],["If prices ___ , sales fall.","rise","rise"],["If you ___ hard, you will pass.","study","study"]],
        items:[r("If it will rain, I will take a taxi.","If it rains, I will take a taxi."),r("Water boils if you will heat it to 100 degrees.","Water boils if you heat it to 100 degrees.")]},
      { id:"cond23", lesson:14, title:"Second and third conditionals", how:"Second: if + past, would (imagined now). Third: if + had done, would have done (imagined past).",
        gaps:[["If I ___ rich, I would travel the world.","be","were",["was"]],["If she had studied, she ___ the exam.","pass","would have passed"],["If I ___ the answer, I would tell you.","know","knew"],["If we ___ earlier, we would have caught the bus.","leave","had left"]],
        items:[r("I don't have a car, so I take the bus.","If I had a car, I wouldn't take the bus."),r("He didn't revise, so he failed.","If he had revised, he wouldn't have failed.")]},
      { id:"condx", lesson:15, title:"Other conditional expressions", how:"unless, as long as, provided that, otherwise, without.",
        gaps:[["You won't improve ___ you practise.","if not","unless"],["___ you stay calm, you will do well.","on condition","As long as",["Provided that","Provided","Providing"]],["Hurry up, ___ we'll miss the bus.","or else","otherwise"],["___ my teacher, I wouldn't have passed.","if not for","Without",["But for"]]],
        items:[r("If you don't book now, there will be no seats.","Unless you book now, there will be no seats."),r("You can borrow my car if you drive carefully.","You can borrow my car as long as you drive carefully.")]},
      { id:"futperf", lesson:17, title:"Future Perfect", how:"will have + past participle for an action finished before a time in the future. Often with by.",
        gaps:[["By 2030, I ___ my degree.","finish","will have finished"],["By next week, she ___ the report.","write","will have written"],["By the time you arrive, we ___ .","leave","will have left"],["By June, they ___ 50 essays.","complete","will have completed"]],
        items:[r("I will finish the course before July.","By July, I will have finished the course."),r("They will build the metro before 2030.","By 2030, they will have built the metro.")]},
      { id:"speech", lesson:18, title:"Direct and indirect speech", how:"Move the tense one step back: am to was, will to would, have to had.",
        gaps:[["'I am tired,' she said. She said that she ___ tired.","be","was"],["'I will call you,' he said. He said that he ___ call me.","will","would"],["'We have finished,' they said. They said that they ___ finished.","have","had"],["'Where do you live?' she asked. She asked me where I ___ .","live","lived"]],
        items:[r("He said, 'I can swim.'","He said that he could swim."),r("She asked, 'Are you coming?'","She asked if I was coming.")]},
      { id:"commas", lesson:19, title:"Commas", how:"Add the missing commas, or fix the comma that joins two sentences. Commas count here, so check them carefully.",
        items:[r("However the results were surprising.","However, the results were surprising."),r("Although it was late we kept working.","Although it was late, we kept working."),r("My sister who lives in London is a doctor.","My sister, who lives in London, is a doctor."),r("The chart shows sales in 2010 2015 and 2020.","The chart shows sales in 2010, 2015 and 2020."),r("Cars are fast, they are dangerous.","Cars are fast, but they are dangerous."),r("If prices rise people buy less.","If prices rise, people buy less.")]},
    ]},
};

export const norm = (s) => String(s || "").toLowerCase().replace(/[\u2019']/g, "'").replace(/[.,!?;:]/g, "").replace(/\s+/g, " ").trim();
export const checkLine = (answers, key, accepted) => {
  const v = norm(answers[key]);
  return !!v && accepted.some(a => norm(a) === v);
};
export const gapAccepted = (g) => [g[2], ...(g[3] || [])];

export const unitsOf = (lv) => {
  const L = LEVELS[lv];
  return [
    ...L.topics.map(tp => ({ id:`t-${tp.id}`, group:"Topics", title:tp.title, topic:tp })),
    ...L.grammarUnits.map(g => ({ id:`g-${g.id}`, group:lv === "c" ? "By lesson" : "Grammar", title:lv === "c" ? `Lesson ${g.lesson}: ${g.title}` : g.title, grammar:g })),
  ];
};

// Every answer box in a unit. Grammar units that have both gaps and sentences use x for gaps and y for sentences.
export const keysOf = (lv, u) => {
  if (u.topic) {
    const tp = u.topic;
    return [
      ...tp.words.map((_, i) => `${lv}:${u.id}:w${i}`),
      ...tp.words.map((_, i) => `${lv}:${u.id}:s${i}`),
      ...tp.grammar.items.map((_, i) => `${lv}:${u.id}:g${i}`),
      ...LEVELS[lv].frame.map((_, i) => `${lv}:${u.id}:p${i}`),
    ];
  }
  const g = u.grammar, keys = [];
  (g.gaps || []).forEach((_, i) => keys.push(`${lv}:${u.id}:x${i}`));
  (g.items || []).forEach((_, i) => keys.push(`${lv}:${u.id}:${g.gaps ? "y" : "x"}${i}`));
  return keys;
};

export const progressOf = (answers, lv, u) => {
  const keys = keysOf(lv, u);
  return Math.round(keys.filter(k => String(answers[k] ?? "").trim()).length / keys.length * 100);
};

// A small summary saved beside the answers, so the teacher can see where a student is at a glance.
export function summarize(answers) {
  const levels = {};
  let filled = 0, total = 0, right = 0, rightTotal = 0;
  Object.keys(LEVELS).forEach(lv => {
    let lf = 0, lt = 0;
    unitsOf(lv).forEach(u => {
      const keys = keysOf(lv, u);
      lt += keys.length;
      lf += keys.filter(k => String(answers[k] ?? "").trim()).length;
      if (u.topic) u.topic.words.forEach((w, i) => { rightTotal++; if (checkLine(answers, `${lv}:${u.id}:w${i}`, [w.to])) right++; });
      ((u.grammar && u.grammar.gaps) || []).forEach((g, i) => { rightTotal++; if (checkLine(answers, `${lv}:${u.id}:x${i}`, gapAccepted(g))) right++; });
    });
    levels[lv] = Math.round(lf / lt * 100);
    filled += lf; total += lt;
  });
  return { filled, total, right, rightTotal, levels };
}
