// Auto-graded homework for the Listening and Reading lessons.
// Listening scripts are read aloud by the browser. Most sets end with grammar questions from the lesson.
const MapOfPark = () => (
  <svg viewBox="0 0 420 240" role="img" aria-label="Plan of a park with the main gate at the bottom and places labelled A to D" style={{ width:"100%", maxWidth:460, display:"block", margin:"0 auto" }}>
    <rect x="2" y="2" width="416" height="236" rx="12" fill="#F1EFFC" stroke="#5F4FD9"/>
    <path d="M210 238V120M70 120H350M210 120V30" stroke="#CFCBEF" strokeWidth="16" fill="none"/>
    <text x="210" y="232" textAnchor="middle" fontSize="12" fontWeight="700" fill="#14123F">Main gate</text>
    <rect x="165" y="92" width="90" height="26" rx="6" fill="#fff" stroke="#14123F"/><text x="210" y="110" textAnchor="middle" fontSize="12" fill="#14123F">Fountain</text>
    {[["A",60,92],["B",320,92],["C",150,24],["D",320,160]].map(([l,x,y]) => (
      <g key={l}><rect x={x} y={y} width="44" height="34" rx="6" fill="#EDAE3E"/><text x={x+22} y={y+23} textAnchor="middle" fontSize="16" fontWeight="800" fill="#14123F">{l}</text></g>
    ))}
  </svg>
);
const WaterFilter = () => (
  <svg viewBox="0 0 420 200" role="img" aria-label="Diagram of a water system with labels 1 at the roof, 2 below the tank and 3 at the tap" style={{ width:"100%", maxWidth:460, display:"block", margin:"0 auto" }}>
    <rect x="2" y="2" width="416" height="196" rx="12" fill="#F1EFFC" stroke="#5F4FD9"/>
    <path d="M50 60L120 25L190 60" fill="none" stroke="#14123F" strokeWidth="3"/>
    <rect x="95" y="70" width="60" height="44" rx="6" fill="#fff" stroke="#14123F"/><text x="125" y="96" textAnchor="middle" fontSize="11">Tank</text>
    <rect x="100" y="132" width="50" height="20" rx="4" fill="#EDAE3E"/>
    <path d="M125 114V132M125 152V176H320V140" fill="none" stroke="#5F4FD9" strokeWidth="4"/>
    <circle cx="320" cy="128" r="11" fill="#EDAE3E"/>
    <text x="205" y="44" fontSize="14" fontWeight="800">1</text><text x="164" y="147" fontSize="14" fontWeight="800">2</text><text x="340" y="133" fontSize="14" fontWeight="800">3</text>
  </svg>
);
const mc = (q, options, answer) => ({ type:"mc", q, options, answer, points:10 });
const tf = (q, answer) => ({ type:"tf", q, answer, points:10 });
const gap = (q, answer, alt = []) => ({ type:"fitb", q, answer, alt, points:10 });
const match = (q, pairs) => ({ type:"match", q, pairs, points:20 });

export const HOMEWORK = {
  "1-1": { kind:"listening", title:"Enrolling on a language course", intro:"A student phones a language centre. Read the form first and predict each answer, then listen. Write ONE WORD AND/OR A NUMBER for each answer.",
    script:"Good morning, Riverside Language Centre. Hello, I would like to join an evening English class. Of course, I will take your details. What is your family name? It is Harris. That is H, A, double R, I, S. Thank you. And your address? 27 Park Road. Park, like a city park. And the postcode? B S 6, 4 T N. What is your phone number? It is oh seven seven one four, five two nine, three six. Sorry, the last part is three eight. Thank you. Which evening would you like? I thought about Tuesday, but I work late that day, so Thursday, please. Fine. The course starts on the 5th of March. Sorry, I am looking at the old list. It starts on the 12th of March. How much is it? The full price is 180 pounds, but students pay 150. I am a student, so that is good. Do I need to bring my passport? No, just one photo for your card on the first day. And how did you hear about us? I looked at your website, but I first saw you in a newspaper. Lovely. Your teacher will be Mr Dawson. That is D, A, W, S, O, N. See you in March.",
    questions:[
      gap("Family name: ___", "Harris"),
      gap("Address: 27 ___ Road", "Park"),
      gap("Postcode: ___", "BS6 4TN", ["BS64TN"]),
      gap("Phone: ___", "07714 52938", ["0771452938","07714529 38","0771 452 938","07714 529 38"]),
      gap("Class day: ___", "Thursday"),
      gap("Start date: ___ March", "12", ["12th","the 12th","twelfth"]),
      gap("Student fee: £ ___", "150", ["one hundred and fifty"]),
      gap("Bring on the first day: one ___", "photo", ["photograph"]),
      gap("First heard about the centre in a: ___", "newspaper"),
      gap("Teacher: Mr ___", "Dawson"),
    ]},
  "1-2": { kind:"reading", title:"The city library", intro:"Read the passage, then answer. Use only the information in the text.",
    passage:"The Central Library opened in 1990 and quickly became the busiest public building in the city. Although its reading rooms were popular from the start, the digital archive was not available until 2005, when a government grant paid for the scanning of old newspapers.\n\nToday, the library lends about two million items a year. Most visitors are students, who use the quiet rooms during exam periods. Opening hours were extended in 2018 after a survey showed that many people could only visit in the evening. A small café was added in the same year.",
    questions:[
      tf("TRUE or FALSE: The digital archive was available from 1990.", false),
      mc("The library is the oldest building in the city.", ["True","False","Not Given"], 2),
      mc("Opening hours changed because of the results of a survey.", ["True","False","Not Given"], 0),
      gap("Short answer (ONE WORD): What did the government grant pay to scan? Old ___ .", "newspapers"),
      gap("Short answer (TWO WORDS): How many items does the library lend each year? About ___ .", "two million", ["2 million"]),
      gap("Grammar: Write a, an or the. She is ___ honest student.", "an"),
    ]},
  "2-1": { kind:"listening", title:"A tour of the park", intro:"Look at the plan. Listen and find each place.",
    figure:<MapOfPark />,
    script:"Welcome to the park. We are standing at the main gate. Walk straight ahead until you reach the fountain. Turn left at the fountain and follow the path to the end: that is where you will find the cafe. If you turn right at the fountain instead, the path takes you to the children's playground. The rose garden is straight on, behind the fountain, at the far end of the park. Finally, the toilets are on your right, about half way between the main gate and the east path.",
    questions:[
      mc("Where is the cafe?", ["A","B","C","D"], 0),
      mc("Where is the children's playground?", ["A","B","C","D"], 1),
      mc("Where is the rose garden?", ["A","B","C","D"], 2),
      mc("Where are the toilets?", ["A","B","C","D"], 3),
      gap("Grammar: I ___ (visit) Paris in 2022.", "visited"),
      mc("Grammar: Choose the correct sentence.", ["I have seen him yesterday.","I saw him yesterday.","I have saw him yesterday."], 1),
    ]},
  "2-2": { kind:"reading", title:"Why bees are disappearing", intro:"Read the two paragraphs, then answer.",
    passage:"A. Bee populations have fallen sharply in many countries over the past thirty years. Pesticides are thought to be the main cause, although the loss of wild flowers also plays a part. In some regions, a third of all hives were lost in a single winter.\n\nB. Several solutions have been proposed. In France, certain pesticides were banned in 2018, and farmers are encouraged to plant flower strips beside their fields. City residents can also help: rooftop hives have been installed in London and Paris, and they are looked after by local volunteers.",
    questions:[
      mc("Choose the best heading for paragraph A.", ["The value of honey","Reasons for the decline of bees","How hives are built"], 1),
      mc("Choose the best heading for paragraph B.", ["Ways to protect bees","The history of French farming","Life in big cities"], 0),
      mc("Which paragraph gives an example of a law?", ["A","B"], 1),
      gap("Summary (ONE WORD): The main cause of the decline is thought to be ___ .", "pesticides"),
      gap("Summary (ONE WORD): Rooftop hives are looked after by ___ .", "volunteers"),
      gap("Grammar, passive voice: The law ___ (introduce) in 2018.", "was introduced"),
    ]},
  "3-3": { kind:"listening", title:"Joining a language course", intro:"Complete the form with words or numbers you hear. Check your spelling.",
    script:"Hello, I'd like to register for the evening course. Of course. What's your family name? It's Hartley. That's H, A, R, T, L, E, Y. And your phone number? It's oh seven seven one, oh, sorry, oh seven seven two, double five, nine. Thank you. Where do you live? At fifteen Hill Road. That's fifteen, not fifty. The course starts on the fifth of June and it costs ninety pounds. Please bring two photographs on Monday.",
    questions:[
      gap("Family name: ___", "Hartley"),
      gap("Phone number: ___", "0772559", ["0772 559","077 2559"]),
      gap("Address: ___ Hill Road (number only)", "15", ["fifteen"]),
      gap("Fee: £ ___", "90", ["ninety"]),
      gap("Bring two ___ on Monday.", "photographs", ["photos"]),
      gap("Grammar: Write the preposition. The course starts ___ the fifth of June.", "on"),
    ]},
  "4-1": { kind:"reading", title:"Urban gardens", intro:"Read the passage, then answer.",
    passage:"A. Urban gardens not only supply fresh food but also bring neighbours together, which is why many city councils now fund them. A study in Toronto found that residents near a garden were twice as likely to know their neighbours by name.\n\nB. Starting a garden is not always easy. Land in cities is expensive, and soil on former industrial sites may be polluted. For this reason, many projects grow vegetables in raised beds filled with clean soil.\n\nC. Schools have also joined the movement. Pupils who help in a garden often eat more vegetables, and teachers use the plants in science lessons.",
    questions:[
      match("Which paragraph contains each piece of information?", [["a problem with land","B"],["an example from education","C"],["research about neighbours","A"]]),
      mc("Choose the best title for the whole text.", ["Food prices in Toronto","Urban gardens: benefits and challenges","How to teach science"], 1),
      gap("Complete (TWO WORDS): City councils fund gardens because they bring ___ .", "neighbours together"),
      gap("Complete (TWO WORDS): To avoid polluted soil, many projects use ___ .", "raised beds"),
      tf("Teachers use the gardens in science lessons.", true),
      mc("Grammar: Find the main verb. The policy, which began in 2015, has reduced traffic.", ["began","has reduced","which began"], 1),
    ]},
  "5-2": { kind:"listening", title:"How dried fruit is made", intro:"Complete the flow chart: 1 wash, 2 ___, 3 ___, 4 ___.",
    script:"Let me explain how our dried fruit is made. First, the fruit is washed in cold water. Before it is dried, it is cut into small pieces. The pieces then go into a large oven, where they are dried for twelve hours. Only then is the fruit packed into paper bags. The oven is at the back of the factory and it is controlled by a computer.",
    questions:[
      gap("Stage 2: the fruit is ___ into small pieces.", "cut"),
      gap("Stage 3: the pieces are dried for ___ hours.", "12", ["twelve"]),
      gap("Stage 4: the fruit is packed into ___ bags.", "paper"),
      mc("Where is the oven?", ["At the front of the factory","At the back of the factory","Next to the packing room"], 1),
      gap("Grammar, passive: The fruit ___ (wash) first.", "is washed"),
      mc("Grammar: Choose the correct sentence.", ["After wash, it dried.","After washing, it is dried.","After it wash, it is dry."], 1),
    ]},
  "5-3": { kind:"reading", title:"A home water system", intro:"Read the text and label the diagram. Copy words from the text.",
    figure:<WaterFilter />,
    passage:"Many rural homes collect their own drinking water. Rain falls on the roof and runs into a tank, where it is stored until needed. It then passes through a filter beneath the tank, which removes dirt and bacteria. Clean water finally travels along a pipe under the garden and reaches the kitchen tap. Owners should replace the filter every six months. By 2030, experts predict, most new houses in dry regions will have installed a similar system.",
    questions:[
      gap("Label 1: water falls on the ___ .", "roof"),
      gap("Label 2: the part beneath the tank is the ___ .", "filter"),
      gap("Label 3: clean water reaches the kitchen ___ .", "tap"),
      gap("How often should the filter be replaced? Every ___ months.", "six", ["6"]),
      mc("What does the filter remove?", ["Salt and sand","Dirt and bacteria","Rain and heat"], 1),
      gap("Grammar, Future Perfect: By 2030, most houses ___ (install) this system.", "will have installed"),
    ]},
};
