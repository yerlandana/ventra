// Masterclass: a short course on its own. Students with plan "masterclass" see only this.
// Listening and Reading cover Part 1 only, Speaking covers all three parts, Writing is the pie chart skeleton.
const mc = (q, options, answer) => ({ type:"mc", q, options, answer, points:10 });
const gap = (q, answer, alt = []) => ({ type:"fitb", q, answer, alt, points:10 });
const tfng = (q, answer) => mc(q, ["True","False","Not Given"], ["True","False","Not Given"].indexOf(answer));

export const MC_DECK = { file:"b1-c1-phrases-idioms", title:"B1 to C1: phrases, idioms and speaking grammar" };

// Phrase game rounds come from the B1 to C1 deck. Each round's wrong answers are the other phrases in its group.
export const MC_GAME = [
  { ask:"Upgrade it", rounds:[
    ["very important","crucial"],["very big","enormous"],["very good","outstanding"],["very bad","dreadful"],["very tired","exhausted"],
  ]},
  { ask:"Which idiom means", rounds:[
    ["say exactly the right thing","hit the nail on the head"],["make more effort than needed","go the extra mile"],["start again from the beginning","back to square one"],["doing something correctly","on the right track"],["very easy","a piece of cake"],
  ]},
  { ask:"Which idiom means", rounds:[
    ["extremely happy","over the moon"],["slightly ill","under the weather"],["nervous and tense","on edge"],["a feeling of relief","a weight off my shoulders"],["stay positive","keep your chin up"],
  ]},
  { ask:"Which idiom means", rounds:[
    ["a bad thing that turns out good","a blessing in disguise"],["two bad choices","between a rock and a hard place"],["take on too much","bite off more than you can chew"],["do something badly to save time or money","cut corners"],
  ]},
];

export const MC_READING = { kind:"reading", label:"Mock", title:"Reading Part 1: Bees on the rooftops", intro:"Read the passage, then answer. Questions 1 to 5: True, False or Not Given. Questions 6 to 10: ONE WORD ONLY from the passage.",
  passage:"Around the world, a growing number of city residents are keeping bees on rooftops, on balconies and in small gardens. Many people assume that bees prefer the countryside, but cities can offer them a surprising advantage. Parks, street trees and window boxes flower at different times of the year, so urban bees often have a longer feeding season than bees living near large farms, where a single crop may bloom for just a few weeks.\n\nStarting a hive is not expensive, but it does require training. Most local associations ask beginners to complete a short course before they buy any equipment. Students learn how to handle the insects safely and how to recognise common diseases. They are also advised to speak to their neighbours first, since some people are worried about being stung.\n\nHoney is not the only reason for the popularity of city hives. Some restaurants buy honey from nearby hives because their customers like local food, and schools have begun to install hives so that children can watch the insects at work. However, experts warn that too many hives in one area could leave less food for wild bees. For this reason, they recommend planting more flowers before adding more hives.",
  questions:[
    tfng("Bees in cities can have a longer feeding season than bees near some farms.","True"),
    tfng("More city bees live on rooftops than in gardens.","Not Given"),
    tfng("Beginners usually buy their equipment before taking a course.","False"),
    tfng("The law requires neighbours to agree to a new hive.","Not Given"),
    tfng("Experts believe that more hives always help wild bees.","False"),
    gap("On large farms, a single ___ may bloom for just a few weeks.","crop"),
    gap("Courses teach students to recognise common ___ .","diseases"),
    gap("Some neighbours are worried about being ___ .","stung"),
    gap("Schools install hives so that ___ can watch the insects.","children"),
    gap("Experts recommend planting more ___ before adding more hives.","flowers"),
  ]};

export const MC_SPEAKING = [
  { part:"Part 1", seconds:30, q:"Where are you from? What do you like most about your hometown?", tip:"What I love most is..." },
  { part:"Part 1", seconds:30, q:"Do you work or are you a student?", tip:"I work late, which is why..." },
  { part:"Part 1", seconds:30, q:"What do you enjoy doing in your free time?", tip:"To be honest,..." },
  { part:"Part 1", seconds:30, q:"Do you prefer to spend time alone or with other people?", tip:"By and large,..." },
  { part:"Part 2", prep:60, seconds:120, q:"Describe a person who has helped you to learn something.\nYou should say: who this person is, what they helped you to learn, how they helped you, and explain how you felt about it.", tip:"It was my teacher who made me confident." },
  { part:"Part 3", seconds:45, q:"Who do you think children learn more from: parents or teachers?", tip:"It seems to me that..." },
  { part:"Part 3", seconds:45, q:"How has technology changed the way people learn?", tip:"This has led to..." },
  { part:"Part 3", seconds:45, q:"Do you think schools will still be needed in the future?", tip:"It could well be that..." },
];

export const MC_PIE = [["Rent",40,"#2A2680"],["Food",25,"#5F4FD9"],["Transport",15,"#B6AFF0"],["Books",12,"#C9973A"],["Entertainment",8,"#E4BF6C"]];

export const MC_WRITING = { kind:"writing", label:"Task", title:"Pie chart: complete the report", intro:"Practice data: how one student spends their monthly budget. Use the skeleton and the chart to complete each sentence of the report.",
  questions:[
    gap("The pie chart illustrates the ___ of a student's monthly budget spent in five categories.","proportion",["share"]),
    gap("Overall, it is evident that rent ___ for the greatest share.","accounted"),
    gap("Rent made up the ___ segment at 40%.","largest"),
    gap("This was followed by food at ___ %.","25"),
    gap("Food represented exactly a ___ of the total.","quarter"),
    gap("The remaining categories were more ___ .","modest"),
    gap("Transport and books accounted for 15% and 12% ___ .","respectively"),
    gap("Entertainment represented only ___ %.","8"),
  ]};
