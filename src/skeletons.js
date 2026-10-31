// Essay skeletons for the Writing lessons. [square brackets] are the parts students fill in.
export const SKELETONS = {
  process: {
    title:"Process diagram", task:"Task 1", words:"150+ words, 20 min",
    paragraphs:[
      { label:"Introduction", frame:"The provided diagram depicts a step-by-step process of [converting X into Y]." },
      { label:"Overview", frame:"Overall, the process consists of [number] sequential stages, commencing with [first stage] and culminating in [final product].", example:"Overall, the process consists of 9 sequential stages, commencing with cultivating bamboo plants and culminating in a final wearable garment." },
      { label:"Body 1: first half", frame:"Initially, [stage] is done [manually / automatically], followed by [stage]. Following that, [material] is transported to [place], which [function]." },
      { label:"Body 2: second half", frame:"Subsequently, the next stage involves [verb + -ing]. The next step results in the creation of [product]. Finally, [last stage], which results in [end product]." },
    ],
    phrases:["commencing with ... and culminating in ...","followed by","Following that,","Subsequently,","results in the creation of","manually (a person does it)","automatically (a machine does it)","assemble, fabricate, construct, convert"],
    avoid:[["I drink water.","Water is drunk. Use the passive for stages."],["grown enough","fully matured"],["makes liquid pulp","produces liquid pulp"]],
  },
  map: {
    title:"Map", task:"Task 1", words:"150+ words, 20 min",
    paragraphs:[
      { label:"Introduction", frame:"The map illustrates how [place] changed between [period 1] and [period 2]." },
      { label:"Overview", frame:"Overall, it can be clearly seen that [place] has undergone reconstruction from [before] into [after], with [new features]. Despite these changes, [what stayed] remain constant." },
      { label:"Body 1: before", frame:"Before the development, [place] had [features]. It was covered with [feature], located mainly on the [direction] side. Furthermore, [feature] was situated on the [direction] side." },
      { label:"Body 2: after", frame:"After the construction work, a range of infrastructure had been built. [Feature] was created in the [location] and connected with [feature]. Moreover, [feature] was built, which provides access to [place]." },
    ],
    phrases:["was situated on the western side","remain constant","were added","was constructed","At the same time,","allowing access to"],
    avoid:[["Past Simple only","Use had been built to show the result of the change."]],
  },
  graph: {
    title:"Line graph / bar chart", task:"Task 1", words:"150+ words, 20 min",
    paragraphs:[
      { label:"Introduction", frame:"The graph illustrates [what is measured] in [place], over the period from [year] to [year]." },
      { label:"Overview", frame:"Overall, while [category A] exhibited relatively stable levels throughout the period, [category B] recorded notable growth, and [category C] experienced a consistent decline.", example:"No figures in the overview, only the main trends." },
      { label:"Body 1: first group", frame:"[Category] began with [figure] in [year], gradually decreasing to [figure] by [year], before recovering to [figure] in [year]. Similarly, [category] maintained [trend]. In contrast, [category] witnessed a continuous and sharp decline from [figure] to [figure], representing the most significant drop." },
      { label:"Body 2: second group", frame:"[Category] showed a fluctuating pattern, beginning at [figure], rising to [figure], before surging to [figure]. [Category], initially the least popular with only [figure], experienced a steady rise. Notably, while [A] and [B] both ended the period higher, [C] ended lower." },
    ],
    phrases:["over the period from ... to ...","exhibited relatively stable","recorded notable growth","a consistent decline","witnessed","experienced a slight dip","saw a crossover point","levelled off","plummeted, soared, rebounded"],
    avoid:[["Describing every number in order","Group lines with similar trends."],["Figures in the overview","Keep them for the body paragraphs."]],
  },
  pie: {
    title:"Pie chart", task:"Task 1", words:"150 to 185 words, 20 min",
    paragraphs:[
      { label:"Introduction", frame:"The pie chart illustrates the proportion of [topic] in [place] in [year], divided into [number] categories." },
      { label:"Overview", frame:"Overall, it is evident that [largest] accounted for the greatest share, while [smallest] represented the smallest proportion. [Second key feature]." },
      { label:"Body 1: main segments", frame:"[Largest] made up the largest segment at [%], which was [nearly / more than] [fraction] of the total. This was followed by [second] at [%] and [third] at [%]." },
      { label:"Body 2: remaining segments", frame:"The remaining categories were more modest. [Category] and [category] accounted for [%] and [%] respectively, while [smallest] represented only [%]." },
    ],
    phrases:["accounted for, made up, represented","just over a third (34%)","less than a quarter","was twice as large as","respectively","by contrast","a relatively modest proportion","the remaining categories were broadly similar"],
    avoid:[["Listing every percentage","Compare the segments."],["Writing a conclusion","The overview replaces it."],["Giving reasons or an opinion","Report the data only."]],
  },
  twoPies: {
    title:"Two pie charts", task:"Task 1", words:"150 to 185 words, 20 min",
    paragraphs:[
      { label:"Introduction", frame:"The pie charts compare the relative shares of [topic] in [place] in [year 1] and [year 2]." },
      { label:"Overview", frame:"Overall, [largest] remained the largest share in both years. A notable difference can be observed in [category], which [rose / fell] considerably." },
      { label:"Body 1: what grew", frame:"In [year 1], [category] accounted for [%]. By [year 2], this figure had increased to [%], more than [ratio] the original share." },
      { label:"Body 2: what fell or stayed", frame:"By contrast, [category] fell from [%] to [%], whereas [category] remained stable at [%]." },
    ],
    phrases:["A notable difference can be observed","had increased to","fell from ... to ...","remained stable at","whereas"],
    avoid:[["Describing each chart separately","Compare the same category across both charts."]],
  },
  hybrid: {
    title:"Pie chart + graph or table", task:"Task 1", words:"160 to 185 words, 20 min",
    paragraphs:[
      { label:"Introduction", frame:"The [pie chart] and [line graph / table] provide information about [topic] in [place]. The [first] shows [what], while the [second] displays [what]." },
      { label:"Overview: both charts", frame:"Overall, [key finding from chart 1], while [key trend from chart 2]. Taken together, the charts suggest that [connection]." },
      { label:"Body 1: first chart", frame:"[Largest] accounted for the greatest proportion at [%], followed by [second] at [%], while [smallest] made up only [%]." },
      { label:"Body 2: second chart + link", frame:"The [graph] shows that [main trend], [key figures]. This is consistent with the first chart, as [connection]." },
    ],
    phrases:["Taken together, the charts suggest that","Both charts indicate that","This is consistent with the data","In contrast, the graph reveals","The graph adds further context"],
    avoid:[["Writing two separate essays","Link the charts in the overview and at the end."]],
  },
  table: {
    title:"Table / table + chart", task:"Task 1", words:"150+ words, 20 min",
    paragraphs:[
      { label:"Introduction", frame:"The provided table depicts data regarding [topic] for [period] in [place]. It displays information about [categories]." },
      { label:"Overview", frame:"Overall, [topic] had [number] main [categories], namely [A], [B] and [C], where the highest was [category]. [Second main pattern]." },
      { label:"Body 1: largest values", frame:"In [year], almost [%] of [total] came from [category], while [category] stood at slightly higher than [fraction] of the total." },
      { label:"Body 2: changes or remaining values", frame:"[Category] exhibited [figure] in [year], and had increased by [amount] by [year], which was the most significant rise among all [number] categories. [Category] remained the same for both periods." },
    ],
    phrases:["namely","slightly higher than one-tenth","the most significant rise among","respectively","remained the same for both periods","ranked first, closely followed by"],
    avoid:[["Copying the whole table","Select the highest, lowest and most changed values."]],
  },
  problem: {
    title:"Problem and solution", task:"Task 2", words:"250+ words, 40 min",
    paragraphs:[
      { label:"Introduction", frame:"The issue of [problem] has attracted increasing attention in modern society, as it gives rise to several serious problems. This essay will discuss key challenges involved, such as [cause 1] and [cause 2], and suggest practical measures to address them." },
      { label:"Body 1: causes", frame:"This problem largely stems from [cause 1]. [Explain why]. Moreover, [cause 2] motivates people to [result]. For instance, in [place], [specific example]." },
      { label:"Body 2: solutions", frame:"One effective way to address this problem is to [solution 1]. By [action], authorities can tackle [problem]. In addition, [who] should [solution 2]. For example, in [place], [real programme or case]." },
      { label:"Conclusion", frame:"In conclusion, [problem] is primarily driven by [causes]. Nevertheless, this issue can be mitigated by [solutions]." },
    ],
    phrases:["has attracted increasing attention","gives rise to","largely stems from","One effective way to address this problem","can tackle the pressure on","is primarily driven by","can be mitigated by"],
    avoid:[["Solutions unrelated to the causes","Each solution must answer a cause."],["A new idea in the conclusion","Only restate."]],
  },
  double: {
    title:"Double question", task:"Task 2", words:"250+ words, 40 min",
    paragraphs:[
      { label:"Introduction", frame:"The issue of [topic] has attracted increasing attention in modern society. This problem stems largely from [main reason], and although [topic] offers certain benefits, I believe that [your answer to question 2]." },
      { label:"Body 1: question 1", frame:"One major reason why [topic] is that [reason 1]. [Explain]. According to [source], [fact]. Another important factor is [reason 2]. [Explain with an example]." },
      { label:"Body 2: question 2", frame:"Despite some advantages, [topic] can have several detrimental effects. Firstly, [effect 1]. As a result, [consequence]. In addition, [effect 2]. For instance, [example]." },
      { label:"Conclusion", frame:"In conclusion, [topic] is mainly driven by [reasons]. I believe it has a more [positive / negative] impact, as [main effect]." },
    ],
    phrases:["One major reason why","Another important factor is","Despite some advantages,","detrimental effects","is mainly driven by"],
    avoid:[["Answering only one question","Give each question its own paragraph and answer it in the first sentence."]],
  },
  opinion: {
    title:"Opinion + reasons", task:"Task 2", words:"250+ words, 40 min",
    paragraphs:[
      { label:"Introduction", frame:"In contemporary society, [topic], driven by [main cause]. While this has become a powerful influence on everyday life, I believe it is largely a [positive / negative] development, as it [reason 1] and [reason 2]." },
      { label:"Body 1: how or why", frame:"Nowadays, [cause 1] has a significant influence on [topic] through [how]. In addition, [cause 2] made [result], allowing [who] to [action]." },
      { label:"Body 2: your view", frame:"From a [positive / negative] perspective, [topic] encourages [effect]. People are exposed to [what], which enables them to [result]. For instance, [example]. Furthermore, [second effect]." },
      { label:"Conclusion", frame:"In conclusion, [topic] has become highly influential due to [causes]. Although it presents certain challenges, I support the idea that its overall impact is [positive / negative], as it [main reason]." },
    ],
    phrases:["In contemporary society,","has a significant influence on","From a positive perspective,","which enables them to","I support the idea that"],
    avoid:[["Changing your opinion in the conclusion","Keep the same position from start to end."]],
  },
  advantages: {
    title:"Advantages and disadvantages", task:"Task 2", words:"250+ words, 40 min",
    paragraphs:[
      { label:"Introduction", frame:"It is widely known that in the modern world many people [topic], whereas others prefer [alternative]. Having the opportunity to [topic] has benefits, such as [advantage], but there are also some drawbacks." },
      { label:"Body 1: advantages", frame:"One evident benefit of [topic] is [advantage]. For instance, [specific example]. Another reason is [advantage 2], because [explain]." },
      { label:"Body 2: disadvantages", frame:"On the other hand, a major drawback of [topic] is [disadvantage]. This is largely due to [reason]. For example, [specific example]. Consequently, [result]." },
      { label:"Conclusion", frame:"In conclusion, although [topic] offers [advantages], it also brings [disadvantages]. On balance, [state which side is stronger, if the question asks]." },
    ],
    phrases:["One evident benefit of","Another reason is","On the other hand,","a major drawback of","This is largely due to","On balance,"],
    avoid:[["there also be some drawbacks","there are also some drawbacks"],["Having a possibility ... have benefits","Having the opportunity ... has benefits"]],
  },
  discussion: {
    title:"Discussion essay", task:"Task 2", words:"250+ words, 40 min",
    paragraphs:[
      { label:"Introduction", frame:"While some argue that [view A], others contend that [view B]. This essay examines both before concluding that [your position]." },
      { label:"Body 1: view A (PEEL)", frame:"On the one hand, [view A]. This is because [reason]. For instance, [example]. As a result, [consequence]." },
      { label:"Body 2: view B (PEEL)", frame:"On the other hand, [view B]. The primary reason is that [explanation]. For example, [example]. Therefore, [link back to your view]." },
      { label:"Conclusion", frame:"In conclusion, although [opposing view], I firmly believe that [your position] because [brief reason]." },
    ],
    phrases:["others contend that","Proponents of this view might argue that","However, this argument overlooks the fact that","While it is true that ..., this does not mean","There is some validity to the argument that","Admittedly,","I firmly believe that"],
    avoid:[["In this essay I will talk about","State your position instead."],["Only one side","Discuss both views and give your own opinion."]],
  },
};

export const LESSON_SKELETON = {
  "1-3":"graph", "1-4":"advantages", "2-3":"pie", "3-1":"problem", "4-2":"table", "4-3":"discussion", "5-4":"process", "5-5":"double",
  "mock-1":"discussion", "mock-2":"graph", "mock-3":"advantages", "mock-4":"discussion", "mock-5":"discussion",
};
