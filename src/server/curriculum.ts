/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CurriculumSubject {
  name: string;
  hindiName: string;
  icon: string;
  topics: {
    id: string;
    title: string;
    hindiTitle: string;
    content: string;
  }[];
}

export interface ClassCurriculum {
  className: string;
  hindiClassName: string;
  subjects: CurriculumSubject[];
}

export const CLASSES_1_TO_12: string[] = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

export const CURRICULUM_DATA: Record<string, CurriculumSubject[]> = {
  'Class 1': [
    {
      name: 'EVS',
      hindiName: 'पर्यावरण अध्ययन (EVS)',
      icon: 'Leaf',
      topics: [
        {
          id: 'c1_evs_1',
          title: 'My Family and Home',
          hindiTitle: 'मेरा परिवार और मेरा घर',
          content: 'Section 1: Our Family\nOur family is our first school. Parents love and care for us. Grandparents tell sweet stories.\n\nSection 2: Keeping Home Clean\nWe keep our room clean and throw waste in dustbins. Helping parents brings joy.'
        },
        {
          id: 'c1_evs_2',
          title: 'Plants and Animals Around Us',
          hindiTitle: 'हमारे आस-पास के पौधे और पशु',
          content: 'Section 1: Green Friends\nPlants give us fresh air, flowers and fruits. Trees like neem and peepal give cool shade.\n\nSection 2: Animal Friends\nCows give milk. Birds fly in the sky. We must be kind to all living beings.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Maths)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c1_math_1',
          title: 'Numbers 1 to 50 & Shapes',
          hindiTitle: 'संख्या ज्ञान 1 से 50 और आकृतियाँ',
          content: 'Section 1: Counting Numbers\nNumbers help us count objects. 1, 2, 3, 4, 5... up to 50.\n\nSection 2: Shapes Around Us\nCircle is round like a roti. Triangle has three corners. Square has four equal sides.'
        }
      ]
    },
    {
      name: 'Hindi',
      hindiName: 'हिंदी (Hindi)',
      icon: 'BookOpen',
      topics: [
        {
          id: 'c1_hindi_1',
          title: 'वर्णमाला और सरल शब्द',
          hindiTitle: 'वर्णमाला और सरल शब्द',
          content: 'अनुभाग 1: स्वर और व्यंजन\nअ से अनार, आ से आम, इ से इमली, ई से ईख। क, ख, ग, घ से वर्णमाला बनती है।\n\nअनुभाग 2: बिना मात्रा के शब्द\nघर, जल, फल, नल, हल। दो अक्षर जोड़कर सुंदर शब्द बनते हैं।'
        }
      ]
    },
    {
      name: 'English',
      hindiName: 'अंग्रेजी (English)',
      icon: 'Languages',
      topics: [
        {
          id: 'c1_eng_1',
          title: 'Alphabet Phonics & Rhymes',
          hindiTitle: 'वर्णमाला ध्वनि एवं कविताएं',
          content: 'Section 1: Alphabet Sounds\nA is for Apple, B is for Ball, C is for Cat, D is for Dog.\n\nSection 2: Greeting Friends\nWe say Good Morning to our teacher, Thank You when helped, and Please when asking.'
        }
      ]
    }
  ],
  'Class 2': [
    {
      name: 'EVS',
      hindiName: 'पर्यावरण अध्ययन (EVS)',
      icon: 'Leaf',
      topics: [
        {
          id: 'c2_evs_1',
          title: 'Water: Liquid of Life',
          hindiTitle: 'जल: जीवन की धारा',
          content: 'Section 1: Sources of Water\nRain, rivers, ponds, wells and tube-wells give us water. Rain is the main source.\n\nSection 2: Save Every Drop\nTurn off taps while brushing. Never waste water in school or at home.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Maths)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c2_math_1',
          title: 'Addition and Subtraction of 2-digit numbers',
          hindiTitle: 'दो अंकों का जोड़ और घटाव',
          content: 'Section 1: Adding Numbers\nWhen we put objects together, we add. 25 + 14 = 39.\n\nSection 2: Taking Away (Subtraction)\nWhen we give away items, we subtract. 48 - 12 = 36.'
        }
      ]
    },
    {
      name: 'Hindi',
      hindiName: 'हिंदी (Hindi)',
      icon: 'BookOpen',
      topics: [
        {
          id: 'c2_hindi_1',
          title: 'मात्राओं का ज्ञान और नटखट चूहा',
          hindiTitle: 'मात्राओं का ज्ञान और नटखट चूहा',
          content: 'अनुभाग 1: मात्राओं का अभ्यास\nआ की मात्रा (राजा), इ की मात्रा (दिन), ई की मात्रा (दीदी)।\n\nअनुभाग 2: सीख देने वाली कहानी\nएक नटखट चूहा था। उसने दर्जी से सुंदर टोपी सिलवाई और खुश हुआ।'
        }
      ]
    }
  ],
  'Class 3': [
    {
      name: 'Science',
      hindiName: 'सामान्य विज्ञान (General Science)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c3_sci_1',
          title: 'Living and Non-Living Things',
          hindiTitle: 'सजीव और निर्जीव वस्तुएं',
          content: 'Section 1: Characteristics of Living Things\nLiving things breathe, grow, eat food, move and reproduce. Plants and animals are living.\n\nSection 2: Non-Living Things\nChairs, stones, pencils and books do not breathe or grow. They are non-living.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Maths)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c3_math_1',
          title: 'Multiplication Tables & Division',
          hindiTitle: 'पहाड़े और भाग की समझ',
          content: 'Section 1: Repeated Addition\nMultiplication is repeated addition. 4 times 5 is 20.\n\nSection 2: Equal Sharing (Division)\nDivision means sharing equally among friends. 20 divided by 4 gives 5.'
        }
      ]
    },
    {
      name: 'Social Science',
      hindiName: 'सामाजिक अध्ययन (Social Studies)',
      icon: 'Globe',
      topics: [
        {
          id: 'c3_soc_1',
          title: 'Our Beautiful Bihar: Rivers & Towns',
          hindiTitle: 'हमारा प्यारा बिहार: नदियाँ और नगर',
          content: 'Section 1: The Holy Ganga\nThe Ganga river flows through the heart of Bihar, nourishing fertile agricultural plains.\n\nSection 2: Historic Towns\nPatna (ancient Pataliputra), Gaya, Nalanda and Vaishali are world-renowned historic sites.'
        }
      ]
    }
  ],
  'Class 4': [
    {
      name: 'Science',
      hindiName: 'विज्ञान (Science)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c4_sci_1',
          title: 'How Plants Make Food (Leaves & Sunlight)',
          hindiTitle: 'पत्तियों का काम: भोजन निर्माण',
          content: 'Section 1: The Leaf Kitchen\nGreen leaves prepare food using sunlight, air (carbon dioxide) and water. Chlorophyll gives leaves their green color.\n\nSection 2: Stomata\nTiny pores called stomata on leaf surfaces breathe in air for the plant.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Maths)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c4_math_1',
          title: 'Fractions: Halves and Quarters',
          hindiTitle: 'भिन्न: आधा, तिहाई और चौथाई',
          content: 'Section 1: What is a Fraction?\nA fraction represents equal parts of a whole. 1/2 means half of the whole apple.\n\nSection 2: Comparing Fractions\n1/2 is greater than 1/4. Two quarters make one half.'
        }
      ]
    },
    {
      name: 'Social Science',
      hindiName: 'सामाजिक विज्ञान (Social Science)',
      icon: 'Globe',
      topics: [
        {
          id: 'c4_soc_1',
          title: 'India: Mountains, Plains & Plateaus',
          hindiTitle: 'भारत: पर्वत, मैदान और पठार',
          content: 'Section 1: The Great Himalayas\nThe Northern Himalayas protect India and are the source of perennial rivers.\n\nSection 2: The Northern Plains\nThe fertile plains of Ganga and Brahmaputra are the food bowl of our country.'
        }
      ]
    }
  ],
  'Class 5': [
    {
      name: 'Science',
      hindiName: 'विज्ञान (Science)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c5_sci_1',
          title: 'Human Digestion & Healthy Nutrition',
          hindiTitle: 'मानव पाचन तंत्र एवं पौष्टिक आहार',
          content: 'Section 1: The Digestive Journey\nFood starts in the mouth with saliva, travels down the food pipe into the stomach and small intestine.\n\nSection 2: Balanced Diet\nCarbohydrates provide energy, proteins build muscles, and vitamins protect us from diseases.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Maths)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c5_math_1',
          title: 'Area and Perimeter',
          hindiTitle: 'क्षेत्रफल और परिमाप',
          content: 'Section 1: Perimeter\nPerimeter is the total boundary distance around a 2D shape. Perimeter of rectangle = 2 * (length + breadth).\n\nSection 2: Area\nArea is the surface enclosed inside the boundary. Area of rectangle = length * breadth.'
        }
      ]
    },
    {
      name: 'Social Science',
      hindiName: 'सामाजिक विज्ञान (Social Science)',
      icon: 'Globe',
      topics: [
        {
          id: 'c5_soc_1',
          title: 'India\'s Freedom Movement & Bihar Martyrs',
          hindiTitle: 'स्वतंत्रता संग्राम और बिहार के वीर सपूत',
          content: 'Section 1: Champaran Satyagraha 1917\nMahatma Gandhi launched his first satyagraha in Champaran, Bihar, fighting for indigo farmers.\n\nSection 2: 1942 Quit India Movement\nSeven brave young students became martyrs in Patna secretariat while hoisting the national flag.'
        }
      ]
    }
  ],
  'Class 6': [
    {
      name: 'Science',
      hindiName: 'विज्ञान (Science)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'water_cycle_en',
          title: 'The Water Cycle (जल चक्र)',
          hindiTitle: 'जल चक्र (The Water Cycle)',
          content: 'Section 1: Where does water go?\nWater disappears from wet roads and puddles when heated by the sun.\n\nSection 2: Evaporation\nWhen the sun heats water in rivers, ponds and seas, the water changes into water vapour and rises into the air. This is called evaporation.\n\nSection 3: Condensation and Clouds\nAs water vapour rises high, it cools down. Tiny droplets of water join together to form clouds. This process is called condensation.\n\nSection 4: Precipitation (Rain)\nWhen cloud droplets become too heavy, they fall as rain or snow.\n\nSection 5: Water returns to Earth\nRainwater flows into streams, rivers, and groundwater, completing the continuous water cycle.'
        },
        {
          id: 'c6_sci_comp',
          title: 'Components of Food (भोजन के घटक)',
          hindiTitle: 'भोजन के घटक (Components of Food)',
          content: 'Section 1: Major Nutrients\nThe main nutrients in food are carbohydrates, fats, proteins, vitamins and minerals.\n\nSection 2: Energy Givers\nCarbohydrates and fats provide energy to our body. Fats give much more energy than carbohydrates.\n\nSection 3: Body Builders\nProteins are needed for the growth and repair of our body. Foods containing proteins are called body-building foods.\n\nSection 4: Deficiency Diseases\nLack of vitamin A causes night blindness. Lack of vitamin C causes scurvy.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Maths)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c6_math_integers',
          title: 'Integers & Number Line (पूर्णांक)',
          hindiTitle: 'पूर्णांक और संख्या रेखा (Integers)',
          content: 'Section 1: Negative and Positive Numbers\nNumbers greater than zero are positive. Numbers less than zero are negative.\n\nSection 2: The Number Line\nOn the number line, numbers to the right of 0 are positive (+1, +2), and numbers to the left are negative (-1, -2).'
        }
      ]
    },
    {
      name: 'Social Science',
      hindiName: 'सामाजिक विज्ञान (Social Science)',
      icon: 'Globe',
      topics: [
        {
          id: 'c6_soc_nalanda',
          title: 'Ancient Kingdoms & Nalanda University',
          hindiTitle: 'प्राचीन साम्राज्य और नालंदा विश्वविद्यालय',
          content: 'Section 1: Magadha Empire\nMagadha was the most powerful kingdom in ancient India, with capitals at Rajgir and Pataliputra.\n\nSection 2: Nalanda Mahavihara\nNalanda was the ancient world\'s premier residential university, hosting scholars from China, Korea, and Tibet.'
        }
      ]
    },
    {
      name: 'Hindi',
      hindiName: 'हिंदी (Hindi)',
      icon: 'BookOpen',
      topics: [
        {
          id: 'c6_hindi_1',
          title: 'वह चिड़िया जो (केदारनाथ अग्रवाल)',
          hindiTitle: 'वह चिड़िया जो (कविता)',
          content: 'अनुभाग 1: चिड़िया का संतोष\nवह चिड़िया जो चोंच मार कर, दूध भरे जुंडी के दाने रुचि से, रस से खा लेती है। वह छोटी संतोषी चिड़िया नीले पंखों वाली है।\n\nअनुभाग 2: वन से प्रेम\nवह चिड़िया जो कंठ खोलकर, बूढ़े वन-बाबा की खातिर रस उड़ेलकर गा लेती है। उसे एकांत से बहुत प्यार है।'
        }
      ]
    },
    {
      name: 'Sanskrit',
      hindiName: 'संस्कृत (Sanskrit)',
      icon: 'Languages',
      topics: [
        {
          id: 'c6_sanskrit_1',
          title: 'शब्दपरिचयः (संस्कृत वर्ण एवं वाक्य)',
          hindiTitle: 'शब्दपरिचयः प्रथमः पाठः',
          content: 'Section 1: एषः कः? (यह कौन है?)\nएषः कः? एषः चषकः। किम् एषः बृहत्? न, एषः लघुः।\n\nSection 2: सः कः? (वह कौन है?)\nसः कः? सः सौचिकः। सौचिकः किं करोति? किं सः खेलति? न, सः वस्त्रं सीव्यति।'
        }
      ]
    }
  ],
  'Class 7': [
    {
      name: 'Science',
      hindiName: 'विज्ञान (Science)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'photosynthesis_en',
          title: 'How Plants Make Their Food (English)',
          hindiTitle: 'How Plants Make Their Food (English)',
          content: 'Section 1: What is nutrition?\nNutrition is the mode of taking food by an organism and its utilization by the body. Green plants make their own food through photosynthesis.\n\nSection 2: What a plant needs for photosynthesis\nWater and minerals: absorbed from the soil by roots.\nCarbon dioxide: taken from the air through tiny pores on the leaf called stomata.\nChlorophyll: the green pigment in leaves that traps sunlight.\nSunlight: energy needed to combine water and carbon dioxide.\n\nSection 3: The equation\nCarbon dioxide + Water + Sunlight + Chlorophyll = Glucose + Oxygen.\n\nSection 4: Why stomata matter\nStomata are tiny pores mostly on the underside of leaves, guarded by guard cells.\n\nSection 5: Testing for starch (activity)\nA blue-black colour shows that starch is present.\n\nSection 6: Other ways plants get food\nFungi such as mushrooms are saprotrophs: they take food from dead and decaying matter.\n\nSection 7: How nutrients return to soil\nFertilisers contain nitrogen, potassium, and phosphorus. Rhizobium bacteria fix nitrogen for pulses.'
        },
        {
          id: 'photosynthesis_hi',
          title: 'पौधे अपना भोजन कैसे बनाते हैं (हिंदी)',
          hindiTitle: 'पौधे अपना भोजन कैसे बनाते हैं (हिंदी)',
          content: 'अनुभाग 1: पोषण क्या है?\nसजीवों द्वारा भोजन ग्रहण करने और इसके उपयोग की विधि को पोषण कहते हैं। हरे पौधे प्रकाश संश्लेषण द्वारा अपना भोजन स्वयं बनाते हैं।\n\nअनुभाग 2: प्रकाश संश्लेषण के लिए क्या चाहिए\nजल और खनिज: जड़ों द्वारा मिट्टी से सोखे जाते हैं।\nकार्बन डाइऑक्साइड: हवा से, पत्ती के छोटे छिद्रों (रंध्र / stomata) द्वारा।\nक्लोरोफिल (पर्णहरित): पत्तियों का हरा पदार्थ जो सूर्य का प्रकाश पकड़ता है।\nसूर्य का प्रकाश: भोजन बनाने के लिए आवश्यक ऊर्जा।\n\nअनुभाग 3: प्रकाश संश्लेषण का समीकरण\nकार्बन डाइऑक्साइड + जल + सूर्य का प्रकाश + क्लोरोफिल = ग्लूकोज + ऑक्सीजन।\n\nअनुभाग 4: रंध्र (Stomata) क्यों महत्वपूर्ण हैं\nपत्तियों की निचली सतह पर छोटे-छोटे छिद्र होते हैं जिन्हें रंध्र कहते हैं।\n\nअनुभाग 5: स्टार्च की जाँच (गतिविधि)\nनीला-काला रंग स्टार्च की उपस्थिति दिखाता है।\n\nअनुभाग 6: पौधों में पोषण के अन्य तरीके\nकवक जैसे मशरूम मृत और सड़ी-गली चीज़ों से भोजन लेते हैं (मृतजीवी)। अमरबेल एक परजीवी है।\n\nअनुभाग 7: मिट्टी में पोषक तत्व कैसे वापस आते हैं\nउर्वरकों में नाइट्रोजन, पोटाश और फॉस्फोरस होता है। राइजोबियम जीवाणु हवा से नाइट्रोजन लेकर पौधों को देते हैं।'
        },
        {
          id: 'c7_sci_acids',
          title: 'Acids, Bases and Salts (अम्ल, क्षारक और लवण)',
          hindiTitle: 'अम्ल, क्षारक और लवण',
          content: 'Section 1: Acids and Their Taste\nAcids are sour in taste. Lemon contains citric acid, vinegar contains acetic acid.\n\nSection 2: Bases and Indicators\nBases are bitter in taste and soapy to touch. Baking soda is a base. Litmus turns red in acid and blue in base.\n\nSection 3: Neutralisation\nWhen an acid and a base react, they neutralise each other forming salt and water, releasing heat.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Maths)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c7_math_equations',
          title: 'Simple Equations (सरल समीकरण)',
          hindiTitle: 'सरल समीकरण (Simple Equations)',
          content: 'Section 1: Algebraic Expressions & Equality\nAn equation is a condition on a variable where two expressions have equal value (e.g. 2x + 5 = 15).\n\nSection 2: Transposition Method\nWhen moving a term from LHS to RHS, its sign inverts: + becomes -, and * becomes /.'
        }
      ]
    },
    {
      name: 'Social Science',
      hindiName: 'सामाजिक विज्ञान (Social Science)',
      icon: 'Globe',
      topics: [
        {
          id: 'c7_soc_delhi',
          title: 'The Delhi Sultans & Medieval Bihar',
          hindiTitle: 'दिल्ली के सुल्तान और मध्यकालीन बिहार',
          content: 'Section 1: Rise of the Delhi Sultanate\nIn the early 13th century, Qutbuddin Aibak founded the Sultanate. Sher Shah Suri later revitalized administrative governance from Sasaram, Bihar.\n\nSection 2: Grand Trunk Road\nSher Shah Suri built the Sadak-e-Azam (Grand Trunk Road) connecting Bengal to Peshawar with postal sarais.'
        }
      ]
    }
  ],
  'Class 8': [
    {
      name: 'Science',
      hindiName: 'विज्ञान (Science)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c8_sci_crop',
          title: 'Crop Production & Management (फसल उत्पादन एवं प्रबंध)',
          hindiTitle: 'फसल उत्पादन एवं प्रबंध',
          content: 'Section 1: Agricultural Practices\nSoil preparation, sowing high-yield seeds, applying manure/fertilisers, irrigation, weeding and harvesting.\n\nSection 2: Drip Irrigation\nDrip and sprinkler systems save water in water-scarce regions by delivering water drop by drop near the roots.'
        },
        {
          id: 'c8_sci_cell',
          title: 'Cell: Structure & Functions (कोशिका: संरचना एवं प्रकार्य)',
          hindiTitle: 'कोशिका: जीवन की मूल इकाई',
          content: 'Section 1: The Discovery of Cell\nRobert Hooke discovered cells in 1665 in a slice of cork. The cell is the basic structural and functional unit of life.\n\nSection 2: Plant vs Animal Cell\nPlant cells have a rigid cell wall and chloroplasts; animal cells have only a cell membrane.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Maths)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c8_math_rational',
          title: 'Rational Numbers & Linear Equations',
          hindiTitle: 'परिमेय संख्याएं एवं रैखिक समीकरण',
          content: 'Section 1: Rational Numbers\nA number which can be written in the form p/q, where p and q are integers and q != 0 is a rational number.\n\nSection 2: Closure and Distributive Properties\nRational numbers are closed under addition, subtraction and multiplication.'
        }
      ]
    }
  ],
  'Class 9': [
    {
      name: 'Science',
      hindiName: 'विज्ञान (Physics, Chemistry, Biology)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c9_sci_motion',
          title: 'Motion and Laws of Force (गति और बल के नियम)',
          hindiTitle: 'गति और न्यूटन के नियम',
          content: 'Section 1: Distance and Displacement\nDistance is total path length, while displacement is the shortest directed distance from initial to final position.\n\nSection 2: Newton\'s Laws of Motion\n1st Law: Inertia. An object remains at rest unless acted on by an external net force.\n2nd Law: F = m * a (Force equals mass times acceleration).\n3rd Law: To every action there is an equal and opposite reaction.'
        },
        {
          id: 'c9_sci_atoms',
          title: 'Atoms and Molecules (परमाणु एवं अणु)',
          hindiTitle: 'परमाणु एवं अणु (Atoms and Molecules)',
          content: 'Section 1: Law of Conservation of Mass\nMass can neither be created nor destroyed in a chemical reaction (Lavoisier).\n\nSection 2: Dalton\'s Atomic Theory\nAll matter is made of indivisible atoms. Atoms of a given element are identical in mass and chemical properties.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Mathematics)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c9_math_poly',
          title: 'Polynomials & Coordinate Geometry',
          hindiTitle: 'बहुपद और निर्देशांक ज्यामिति',
          content: 'Section 1: Polynomials\nAn algebraic expression of the form a_n*x^n + ... + a_0 with non-negative integer exponents is a polynomial.\n\nSection 2: The Cartesian Plane\nRené Descartes introduced the coordinate system: horizontal X-axis and vertical Y-axis intersecting at the origin (0,0).'
        }
      ]
    }
  ],
  'Class 10': [
    {
      name: 'Science',
      hindiName: 'विज्ञान (Class 10 Board Science)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c10_sci_chem',
          title: 'Chemical Reactions & Equations (रासायनिक अभिक्रियाएं)',
          hindiTitle: 'रासायनिक अभिक्रियाएं एवं समीकरण',
          content: 'Section 1: Balancing Chemical Equations\nThe number of atoms of each element must remain the same before and after a chemical reaction.\n\nSection 2: Types of Reactions\nCombination, Decomposition, Displacement, Double Displacement, and Redox (Reduction-Oxidation) reactions.'
        },
        {
          id: 'c10_sci_elec',
          title: 'Electricity & Ohm\'s Law (विद्युत धारा एवं ओम का नियम)',
          hindiTitle: 'विद्युत धारा और ओम का नियम',
          content: 'Section 1: Electric Current & Potential Difference\nCurrent I = Q / t. Potential difference V = W / Q (work done per unit charge in Volts).\n\nSection 2: Ohm\'s Law\nAt constant temperature, V = I * R. Resistance R depends on length, cross-sectional area, and resistivity of conductor.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Board Mathematics)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c10_math_trig',
          title: 'Introduction to Trigonometry (त्रिकोणमिति का परिचय)',
          hindiTitle: 'त्रिकोणमिति का परिचय',
          content: 'Section 1: Trigonometric Ratios\nIn a right-angled triangle: sin(theta) = Opposite / Hypotenuse, cos(theta) = Adjacent / Hypotenuse, tan(theta) = Opposite / Adjacent.\n\nSection 2: Fundamental Identity\nsin^2(theta) + cos^2(theta) = 1, 1 + tan^2(theta) = sec^2(theta).'
        }
      ]
    }
  ],
  'Class 11': [
    {
      name: 'Physics',
      hindiName: 'भौतिक विज्ञान (Physics)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c11_phy_kinematics',
          title: 'Kinematics & Vectors in 2D',
          hindiTitle: 'गतिकी एवं सदिश विश्लेषण',
          content: 'Section 1: Vectors and Scalars\nScalars possess only magnitude; vectors possess both magnitude and direction and follow the triangle law of vector addition.\n\nSection 2: Projectile Motion\nA projectile launched with velocity u at angle theta has trajectory y = x*tan(theta) - (g*x^2)/(2*u^2*cos^2(theta)).'
        }
      ]
    },
    {
      name: 'Chemistry',
      hindiName: 'रसायन विज्ञान (Chemistry)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c11_chem_bonding',
          title: 'Chemical Bonding & Molecular Structure',
          hindiTitle: 'रासायनिक आबंधन एवं आणविक संरचना',
          content: 'Section 1: Ionic and Covalent Bonds\nIonic bonds form through electrostatic electron transfer, while covalent bonds form through mutual sharing of electron pairs.\n\nSection 2: VSEPR and Hybridization\nValence Shell Electron Pair Repulsion theory predicts geometry: sp3 (tetrahedral, 109.5°), sp2 (trigonal planar), sp (linear).'
        }
      ]
    },
    {
      name: 'Biology',
      hindiName: 'जीव विज्ञान (Biology)',
      icon: 'Leaf',
      topics: [
        {
          id: 'c11_bio_cellcycle',
          title: 'Cell Cycle & Cell Division (Mitosis / Meiosis)',
          hindiTitle: 'कोशिका चक्र एवं कोशिका विभाजन',
          content: 'Section 1: Interphase\nThe cell prepares for division through G1, S (DNA replication) and G2 phases.\n\nSection 2: M Phase (Mitosis)\nProphase, Metaphase, Anaphase and Telophase ensure equal genetic distribution to daughter cells.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Mathematics)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c11_math_calc',
          title: 'Limits & Introduction to Calculus',
          hindiTitle: 'सीमा और अवकलन का परिचय',
          content: 'Section 1: Concept of Limit\nLimit of f(x) as x approaches c represents the value f(x) approaches from left and right.\n\nSection 2: Derivative from First Principles\nf\'(x) = lim (h -> 0) [f(x + h) - f(x)] / h.'
        }
      ]
    }
  ],
  'Class 12': [
    {
      name: 'Physics',
      hindiName: 'भौतिक विज्ञान (Physics)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c12_phy_electro',
          title: 'Electrostatics & Coulomb\'s Law',
          hindiTitle: 'स्थिरवैद्युतिकी एवं कूलॉम का नियम',
          content: 'Section 1: Coulomb\'s Law\nThe electrostatic force between two point charges q1, q2 separated by distance r is F = (1 / 4*pi*epsilon_0) * (q1 * q2 / r^2).\n\nSection 2: Gauss\'s Law\nThe total electric flux through a closed Gaussian surface equals the enclosed charge divided by epsilon_0.'
        }
      ]
    },
    {
      name: 'Chemistry',
      hindiName: 'रसायन विज्ञान (Chemistry)',
      icon: 'Sparkles',
      topics: [
        {
          id: 'c12_chem_organic',
          title: 'Haloalkanes, Alcohols and Organic Chemistry',
          hindiTitle: 'हैलोएल्केन, ऐल्कोहॉल एवं कार्बनिक रसायन',
          content: 'Section 1: Nucleophilic Substitution (SN1 vs SN2)\nSN2 is a concerted bimolecular pathway with inversion of configuration. SN1 is a two-step unimolecular carbocation pathway.\n\nSection 2: Acidity of Phenols\nPhenols are more acidic than alcohols because phenoxide ion is resonance stabilized by the aromatic ring.'
        }
      ]
    },
    {
      name: 'Biology',
      hindiName: 'जीव विज्ञान (Biology)',
      icon: 'Leaf',
      topics: [
        {
          id: 'c12_bio_genetics',
          title: 'Principles of Inheritance & DNA Replication',
          hindiTitle: 'आनुवंशिकी एवं डीएनए प्रतिकृतियन',
          content: 'Section 1: Mendel\'s Laws\nLaw of Segregation and Law of Independent Assortment govern genetic inheritance in diploid organisms.\n\nSection 2: The Double Helix\nWatson and Crick deduced DNA structure with anti-parallel strands paired by A=T and G#C hydrogen bonds.'
        }
      ]
    },
    {
      name: 'Mathematics',
      hindiName: 'गणित (Mathematics)',
      icon: 'Calculator',
      topics: [
        {
          id: 'c12_math_diff',
          title: 'Differential Equations & Definite Integrals',
          hindiTitle: 'अवकल समीकरण एवं निश्चित समाकलन',
          content: 'Section 1: Fundamental Theorem of Calculus\nIntegral from a to b of f(x) dx = F(b) - F(a), representing net accumulated area under the curve.\n\nSection 2: Differential Equations\nFirst-order linear differential equations are solved using the integrating factor IF = exp(integral P(x) dx).'
        }
      ]
    }
  ]
};
