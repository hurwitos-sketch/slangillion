import { normalize } from "./normalization";
import type { Tier as SourceTier } from "./legacy-data";
import { TIERS, type Tier } from "./tiers";
export type SlangEntry = {
  question: string;
  canonical: string;
  tier: Tier;
  points: number;
  aliases: string[];
  explanation: string;
  reviewStatus: "editorially-reviewed";
  sourceStatus: "pending-web-review" | "community-definition-checked";
  sourceUrls: string[];
};
// Curated slang, idioms and friendly forms of address. No automatic quotas,
// frequency claims, or assumptions that an unfamiliar region merits more points.
// Canonical | aliases. Aliases always inherit the canonical tier and score.
const groups: Record<string, [SourceTier, string[]][]> = {
  money: [
    [
      1,
      [
        "bucks|buck",
        "dough",
        "bread",
        "paper",
        "bands|band",
        "racks|rack",
        "bag|a bag",
      ],
    ],
    [
      2,
      [
        "cheddar",
        "moolah|moola",
        "guap|gwop",
        "scratch",
        "stacks|stack",
        "benjamins|benjis|benji",
        "green|greenbacks",
      ],
    ],
    [
      3,
      [
        "coin|coins",
        "bank",
        "loot",
        "dosh",
        "wonga",
        "quid",
        "fetti|fetty",
        "dead presidents",
      ],
    ],
    [
      4,
      [
        "spondulicks|spondulix",
        "spondoolies",
        "ackers",
        "millis|milli|mil|mill",
        "ducats|duckets",
        "simoleons|simoleon",
        "clams|clam",
      ],
    ],
    [
      5,
      [
        "motion|getting motion",
        "chicken|chicken money",
        "blue faces|bluefaces",
        "lettuce",
        "cabbage",
        "long green",
      ],
    ],
  ],
  friend: [
    [
      1,
      [
        "bro|brah|bruh|bruv|brother",
        "dawg|dog|my dawg",
        "fam|fambo|famalam",
        "homie|homey",
        "bestie",
        "mate",
        "buddy|bud",
      ],
    ],
    [
      2,
      [
        "pal",
        "chum",
        "cuz|cuzz|cousin|cuzzie|cuzzy",
        "my guy|guy",
        "fella|fellas",
        "g|my g",
        "homeslice|home slice",
      ],
    ],
    [
      3,
      [
        "ace|my ace",
        "homeboy|home boy",
        "homegirl|home girl",
        "bredrin|bredren|brethren",
        "blud|blood",
        "mucker",
        "homeskillet|home skillet",
      ],
    ],
    [
      4,
      [
        "day one|day 1|dayone",
        "ride or die|ride-or-die",
        "main man|my main man",
        "amigo|amigos",
        "compadre",
        "marra",
        "butty",
      ],
    ],
    [5, ["jit|jitt", "twin|twinnem", "slime", "woadie|woady", "bromigo"]],
  ],
  attractive: [
    [
      1,
      [
        "fine|fine af|fine as hell",
        "baddie|certified baddie|baddest",
        "bad|bad af",
        "dime|dime piece",
        "ten|10/10|solid ten|a ten",
        "snack|a snack|whole snack|looking like a snack",
        "babe",
        "fit",
      ],
    ],
    [
      2,
      [
        "eye candy|eyecandy",
        "dollface|doll face",
        "looker",
        "foxy|fox",
        "stud",
        "hunk|hunky",
        "bombshell",
      ],
    ],
    [
      3,
      [
        "peng",
        "leng|leng ting",
        "piff",
        "smoke show|smokeshow",
        "heartthrob",
        "dreamboat",
        "dish|dishy",
        "knockout",
      ],
    ],
    [
      4,
      [
        "a sort|sort",
        "banging|bangin",
        "snatched",
        "thicc|thick",
        "stacked",
        "serving face",
        "serving looks",
        "a worldie|worldie",
      ],
    ],
    [
      5,
      [
        "fine shit|fine shyt|fine shii|finshyt",
        "talent|the talent",
        "face card|face card valid|face card lethal|lethal face card|facecard",
        "face card never declines|face card never decline|face card doesnt decline",
        "full course meal|a full course meal",
        "pressure|applying pressure",
      ],
    ],
  ],
  leaving: [
    [
      1,
      [
        "bounce|bouncing",
        "dip|dipping",
        "peace|peace out",
        "later|laters",
        "im out|im outta here",
        "jet|jetting",
        "split|splitting",
      ],
    ],
    [
      2,
      [
        "book it|booking it",
        "make tracks|making tracks",
        "bail|bailing",
        "duck out|ducking out",
        "head out|heading out",
        "roll out|rolling out",
        "ghost|ghosting",
      ],
    ],
    [
      3,
      [
        "skedaddle",
        "scoot|scooting",
        "scram",
        "vamoose",
        "take off|taking off",
        "hit the road|hitting the road",
        "cut out|cutting out",
      ],
    ],
    [
      4,
      [
        "do a runner",
        "do one",
        "leg it|legging it",
        "make like a tree and leave",
        "blow this joint|blowing this joint",
        "hit the bricks|hitting the bricks",
        "beat it",
      ],
    ],
    [
      5,
      [
        "irish goodbye|irish exit",
        "french exit",
        "make like a banana and split",
        "smoke bomb|smoke bombing",
        "pull a houdini",
        "outie|im outie|outie 5000|audi 5000",
        "catch you on the flip side",
        "hasta la vista",
        "exit stage left",
      ],
    ],
  ],
  lying: [
    [
      1,
      [
        "cap|capping|cappin|capper|big cap|straight cap|pure cap|all cap|full of cap|thats cap|that is cap|professional capper|certified capper|generational capper|cap merchant|cap lord|king of cap|queen of cap|cap alert|cap detected|cap city|maximum cap|infinite cap|cap of the century|olympic level capping",
        "bullshit|bs|bullshitting|bsing|talking bs",
        "full of it",
        "fronting|frontin|putting up a front",
        "bluffing|bluffin|bluff",
        "telling porkies|porkies|pork pies",
      ],
    ],
    [
      2,
      [
        "tall tales|telling tall tales",
        "spinning a yarn|spinning yarns",
        "spinning stories|spinning a story",
        "chatting shit|talking shit",
        "lying like a rug",
        "talking through your hat",
        "pulling my leg|pulling your leg",
      ],
    ],
    [
      3,
      [
        "blowing smoke|blowing smoke up my ass|blowing smoke up your ass",
        "talking out your neck|talking out of your neck",
        "talking out your ass|talking out of your ass|talking out your arse",
        "chatting breeze",
        "chatting wass|chatting wassy",
        "feeding me a line|feeding you a line|feeding a line",
        "stretching the truth",
        "bending the truth",
      ],
    ],
    [
      4,
      [
        "economical with the truth|being economical with the truth",
        "cock and bull story|a cock and bull story|spinning a cock and bull story",
        "snow job|giving me a snow job",
        "pulling the wool over your eyes|pulling the wool over my eyes",
        "taking me for a ride|taking you for a ride",
        "lying through your teeth|lying through my teeth|lying through their teeth",
        "selling wolf tickets|wolf tickets",
      ],
    ],
    [
      5,
      [
        "selling dreams|selling a dream",
        "pulling a fast one|trying to pull a fast one",
        "smoke and mirrors",
        "telling whoppers|whopper|telling a whopper",
        "selling me a bill of goods|selling you a bill of goods",
        "pull the other one|pull the other one its got bells on",
        "codswallop|a load of codswallop",
      ],
    ],
  ],
  excellent: [
    [
      1,
      [
        "dope",
        "sick",
        "fire|fye",
        "lit",
        "goated|goat",
        "slaps|slap",
        "bussin|bussing",
      ],
    ],
    [
      2,
      [
        "mint",
        "boss",
        "bangin|banging",
        "ace",
        "rad|radical",
        "wicked",
        "cracking",
      ],
    ],
    [
      3,
      [
        "the bees knees|bees knees",
        "the dogs bollocks|dogs bollocks",
        "top notch|top-notch",
        "the bomb|da bomb",
        "off the chain",
        "off the hook",
        "killer",
      ],
    ],
    [
      4,
      [
        "chef kiss|chefs kiss",
        "gas|straight gas",
        "heat|straight heat",
        "a banger|banger",
        "peak",
        "next level",
      ],
    ],
    [
      5,
      [
        "s tier|s-tier",
        "god tier|god-tier",
        "out of this world",
        "different gravy",
        "the business",
        "a belter|belter",
      ],
    ],
  ],
  angry: [
    [
      1,
      [
        "pissed|pissed off",
        "heated",
        "salty",
        "pressed|pressed over nothing",
        "tight",
        "vexed|vex|vexed up",
        "big mad",
      ],
    ],
    [
      2,
      [
        "tilted|hard tilted",
        "triggered",
        "steamed|steaming",
        "cheesed|cheesed off",
        "ticked off",
        "worked up",
        "riled up",
        "butthurt|butt hurt",
      ],
    ],
    [
      3,
      [
        "bent out of shape",
        "shirty",
        "having the hump|got the hump",
        "hot under the collar",
        "seeing red",
        "blood boiling|my blood is boiling|boiling",
        "malding",
        "losing it|losing my shit|losing my cool",
      ],
    ],
    [
      4,
      [
        "snapping|snapped|about to snap",
        "going off",
        "popping off",
        "flipping out",
        "going ballistic",
        "going nuclear",
        "blowing a fuse",
        "blowing a gasket",
      ],
    ],
    [
      5,
      [
        "crash out|crashing out|crashout|about to crash out|certified crashout|generational crashout|crashout season|crashout mode|crashng out",
        "ready to throw hands|about to throw hands",
        "off the handle|flying off the handle",
        "spitting feathers",
        "spitting nails",
        "on the warpath",
        "rage quitting|rage quit",
      ],
    ],
  ],
  tired: [
    [
      1,
      [
        "beat|beat af",
        "wiped|wiped out",
        "cooked",
        "fried",
        "dead|dead tired",
        "done|im done",
        "burnt out|burned out",
      ],
    ],
    [
      2,
      [
        "knackered",
        "zonked",
        "bushed",
        "pooped",
        "spent",
        "shattered",
        "dog tired|dog-tired",
      ],
    ],
    [
      3,
      [
        "cream crackered",
        "jiggered",
        "out on your feet",
        "running on fumes",
        "running on empty|running on e|running on E",
        "dead on my feet|dead on your feet",
        "done in",
      ],
    ],
    [
      4,
      [
        "tuckered out",
        "shagged|shagged out",
        "buggered|buggered out",
        "clapped",
        "smoked",
        "gassed|gassed out",
        "ready to drop",
      ],
    ],
    [5, ["walking zombie|a walking zombie", "out of juice"]],
  ],
  rich: [
    [
      1,
      [
        "loaded",
        "ballin|balling",
        "minted",
        "flush",
        "rolling in it",
        "made of money",
        "stinking rich",
      ],
    ],
    [
      2,
      [
        "filthy rich",
        "deep pockets",
        "cashed up",
        "well heeled|well-heeled",
        "moneybags|money bags",
        "fat cat",
        "big baller|baller",
      ],
    ],
    [
      3,
      [
        "rolling in dough",
        "swimming in money",
        "sitting pretty",
        "got bank|have bank",
        "stacked|stacked up",
        "breaded up",
        "racked up",
      ],
    ],
    [
      4,
      [
        "bands on bands",
        "money to burn",
        "set for life",
        "living large|livin large",
        "high roller",
        "big spender",
        "in the money",
      ],
    ],
    [
      5,
      [
        "long money",
        "old money",
        "new money",
        "paid|getting paid",
        "laughing all the way to the bank",
      ],
    ],
  ],
  poor: [
    [
      1,
      [
        "broke|broke boy|broke girl|broke af|dead broke|flat broke|stone broke|brokie|brokke",
        "skint",
        "strapped|strapped for cash|cash strapped",
        "hard up",
        "dirt poor",
        "tapped out|tapped",
        "cleaned out",
      ],
    ],
    [
      2,
      [
        "pockets empty|empty pockets",
        "wallet empty|empty wallet",
        "not a dime|not two dimes to rub together",
        "down to my last dollar|down to the last dollar",
        "on the breadline",
        "on your uppers|on my uppers",
        "busted",
      ],
    ],
    [
      3,
      [
        "pockets on E|pockets on empty",
        "wallet on E",
        "pockets dry|dry pockets",
        "pockets light",
        "pockets hurting",
        "counting pennies",
        "living off spare change|living on spare change",
        "living off crumbs|living on crumbs",
      ],
    ],
    [
      4,
      [
        "scraping the barrel|scraping the bottom of the barrel",
        "living on ramen|ramen budget",
        "in the red|account in the negatives|negative balance|overdrawn|overdrafted",
        "financially down bad",
        "boracic|brassic",
        "on the bones of your arse|on the bones of my arse",
        "hand to mouth|living hand to mouth",
        "wallet crying|my wallet is crying",
      ],
    ],
    [
      5,
      [
        "financially cooked|cooked financially",
        "wallet on life support",
        "pockets dusty",
        "in the trenches|financially in the trenches",
        "broke as a joke",
        "potless|not a pot to piss in",
        "more month than money|too much month at the end of the money",
      ],
    ],
  ],
  partying: [
    [
      1,
      [
        "lit|getting lit",
        "turnt|turnt up|getting turnt|turntt",
        "turn up|turning up|turnin up",
        "clubbing|clubbin|hitting the club",
        "raving|rave|raver|rave mode|raving it up",
        "boogie|boogying|boogieing|boogie down",
      ],
    ],
    [
      2,
      [
        "bar hopping",
        "club hopping",
        "we outside|outside|outside tonight",
        "at the function|function|hitting the function",
        "kickback|at a kickback",
        "rager|throwing a rager",
        "afters",
        "pregaming|pregame|pres|pre drinks",
      ],
    ],
    [
      3,
      [
        "hitting the town",
        "letting loose|getting loose",
        "living it up",
        "getting down",
        "moshing|mosh pit",
        "getting rowdy",
        "on the lash",
        "on the razz|on the razzle",
      ],
    ],
    [
      4,
      [
        "painting the town red",
        "cutting loose",
        "getting jiggy|gettin jiggy",
        "busting moves|busting a move|bust a move",
        "cutting a rug|cut a rug",
        "tearing up the dance floor|tearing up the dancefloor",
        "throwing down",
        "raging|rage at the party",
      ],
    ],
    [
      5,
      [
        "having it large|have it large",
        "going on a bender|on a bender|bender",
        "going ham",
        "getting crunk|crunk",
        "turning the function up",
        "shutting the club down|shut the club down",
        "throwing shapes|throw shapes",
        "raising the roof|raise the roof",
      ],
    ],
  ],
  laughing: [
    [
      1,
      [
        "lol|lolz|lolol",
        "lmao|lmfao|laughing my ass off|laughing my arse off",
        "haha|hahaha|ha ha|hahahaha",
        "hehe|he he",
        "teehee|tee hee",
        "bahaha|bwahaha|muahaha",
      ],
    ],
    [
      2,
      [
        "I'm dead|im dead|dead|dead af|nah im dead|got me dead|you got me dead|💀",
        "I'm dying|im dying|dying|dying laughing|you got me dying",
        "I'm crying|im crying|crying|crying laughing|bro im crying|got me crying|😂|😭",
        "I'm weak|im weak|weak|bro im weak|you got me weak|got me weak",
        "cracking up|cracking tf up|cracking me up",
        "rofl|rolling on the floor laughing|on the floor laughing|🤣",
        "roflmao|rolling on the floor laughing my ass off",
      ],
    ],
    [
      3,
      [
        "in stitches|stitches",
        "in tears|tears in my eyes|actual tears|tears rolling|tears streaming",
        "I'm deceased|im deceased|deceased",
        "I can't breathe|i cant breathe|cant breathe|cannot breathe",
        "I'm screaming|im screaming|screaming",
        "I'm finished|im finished|finished",
        "I'm done|im done",
      ],
    ],
    [
      4,
      [
        "kek",
        "kekw",
        "lul|lulw",
        "lel",
        "splitting my sides|side splitting|sides splitting",
        "laughing my head off",
        "laughing my socks off",
        "busting a gut|bust a gut",
        "wheezing|wheeze",
      ],
    ],
    [
      5,
      [
        "omegalul",
        "rolling|rolling laughing",
        "losing it",
        "crease|creasing|creasing up",
        "screaming crying throwing up",
        "sides in orbit|my sides are in orbit",
        "sides have left the chat|my sides have left the chat",
        "on the floor|on the floor wheezing",
      ],
    ],
  ],
  talking: [
    [
      1,
      [
        "yap|yapping|yappin|yapper|yaping|yap session|yapathon|yap fest|yap city|yap central|yap factory|yap merchant|yap lord|yap king|yap queen|certified yapper|professional yapper|generational yapper|elite yapper|olympic yapper|nonstop yapping|yap overload|yap attack|yap explosion",
        "gab|gabbing|gabfest",
        "yak|yakking|yacking",
        "blab|blabbing|blabbering|blabbermouth",
        "chinwag|chinwagging|having a chinwag|chinning",
        "natter|nattering|having a natter",
      ],
    ],
    [
      2,
      [
        "chit chat|chitchat",
        "jaw|jawing",
        "jaw jacking|jawjacking",
        "run your mouth|running your mouth|run my mouth|running my mouth",
        "flap your gums|flapping your gums",
        "flap your jaw|flapping your jaw",
        "talk someones ear off|talking someones ear off|talk your ear off",
      ],
    ],
    [
      3,
      [
        "talk a mile a minute|talking a mile a minute",
        "waffle|waffling|waffler",
        "talk in circles|talking circles|talking in circles",
        "chew the fat|chewing the fat",
        "shoot the breeze|shooting the breeze",
        "shoot the shit|shooting the shit",
        "chop it up|chopping it up|chop session|chopping it up with the gang",
        "spill the beans|spilling the beans",
      ],
    ],
    [
      4,
      [
        "dish the dirt|dishing dirt|dishing the dirt",
        "talk smack|talking smack|smack talking",
        "talk trash|talking trash|trash talking",
        "talk shit|talking shit|chatting shit",
        "word vomit",
        "verbal diarrhea|verbal diarrhoea",
        "spit game|spitting game",
        "rizz|rizzing|rizzing up",
      ],
    ],
    [
      5,
      [
        "spill the tea|spilling tea|spilling the tea|tea session|tea time",
        "chat up|chatting up",
        "spit facts|spitting facts|speaking facts",
        "talk your talk|talking your talk",
        "sweet talk|sweet talking",
        "talk the hind leg off a donkey|talking the hind leg off a donkey",
        "chew the rag|chewing the rag",
        "shoot the bull|shooting the bull",
      ],
    ],
  ],
  "showing off": [
    [
      1,
      [
        "flex|flexing|flexin",
        "showboat|showboating",
        "peacock|peacocking",
        "stunt|stunting|stuntin",
      ],
    ],
    [
      2,
      [
        "big up yourself|bigging yourself up",
        "toot your own horn|tooting your own horn",
        "blow your own trumpet|blowing your own trumpet",
        "humblebrag|humble brag|humblebragging",
        "name drop|name dropping",
      ],
    ],
    [
      3,
      [
        "front|fronting|frontin",
        "swank|swanking",
        "swagger|swagging",
        "strut|strutting",
        "put on airs|putting on airs",
        "hotdog|hotdogging",
      ],
    ],
    [
      4,
      [
        "clout chasing|clout chase",
        "grandstand|grandstanding",
        "act big|acting big",
        "big timing|big time",
        "flash the cash|flashing the cash",
        "throw your weight around|throwing your weight around",
      ],
    ],
    [
      5,
      [
        "swinging your dick|dick swinging",
        "splash the cash|splashing the cash",
        "popping your collar|pop your collar",
        "talking big|talk big",
        "doing the most",
        "main character syndrome",
      ],
    ],
  ],
  embarrassing: [
    [
      1,
      [
        "cringe|cringey|cringy|cringeworthy|cringe worthy|cringe fest|cringefest|cringe fail|cringefail|cringe overload|cringe compilation",
        "awk",
        "yikes|big yikes",
        "ick|the ick|giving me the ick",
        "facepalm|face palm",
        "oof",
        "corny",
        "cheesy",
      ],
    ],
    [
      2,
      [
        "toe curling|toe-curling",
        "secondhand embarrassment|second hand embarrassment",
        "fail|epic fail",
      ],
    ],
    [
      3,
      [
        "taking an l|take an l|caught an l",
        "caught in 4k|caught in 4 k",
        "caught lacking",
        "clown behavior|clown behaviour|clown moment",
        "egg on your face|egg on my face",
      ],
    ],
    [
      4,
      [
        "foot in your mouth|foot in my mouth",
        "ground swallow me up|wish the ground would swallow me up",
        "want to crawl into a hole",
        "social suicide",
        "die of cringe|dying of cringe",
      ],
    ],
    [
      5,
      [
        "this aint it|this isnt it",
        "delete this|delete that",
        "walk of shame",
        "red faced|red-faced",
        "shame job",
      ],
    ],
  ],
};
const scoreReviews: Record<string, SourceTier> = {
  "money:dead presidents": 5,
  "friend:ride or die": 5,
  "friend:jit": 3,
  "friend:twin": 2,
  "friend:slime": 3,
  "friend:woadie": 4,
  "friend:bromigo": 3,
  "friend:my guy": 1,
  "friend:fella": 1,
  "friend:ace": 2,
  "money:motion": 3,
  "money:chicken": 4,
  "money:blue faces": 5,
  "money:lettuce": 2,
  "money:cabbage": 2,
  "money:long green": 3,
  "money:quid": 2,
  "attractive:fine shit": 4,
  "attractive:talent": 3,
  "attractive:face card": 3,
  "rich:old money": 2,
  "rich:new money": 2,
  "rich:paid": 2,
  "tired:cream crackered": 5,
  "tired:out of juice": 3,
};
const meanings: Record<string, string> = {
  "friend:jit":
    "Florida/US regional address for a younger person or acquaintance; included as requested familiar address, not a universal synonym for close friend.",
  "friend:my guy":
    "Friendly form of address; includes the user-requested guy in that intended sense.",
  "friend:fella":
    "Friendly informal address; retained by explicit user request rather than as proof of friendship.",
  "money:motion":
    "Context-dependent financial activity, earning or hustle; included as requested figurative money/income usage, not a literal currency unit.",
  "money:millis": "Informal million/millions money denomination.",
  "attractive:fine shit":
    "Explicit/vulgar appearance slang requested by the user; neutral gameplay acceptance does not recommend using it to address someone.",
  "attractive:talent":
    "British informal collective reference to attractive people, not the ordinary ability sense.",
  "attractive:dollface":
    "Established informal affectionate/appearance address, not a plain adjective synonym.",
};
const communitySources: Record<string, string> = {
  "friend:bro":
    "https://github.com/dinoducktank/slang_dictionary/blob/main/dictionary.py",
  "excellent:peak":
    "https://github.com/dinoducktank/slang_dictionary/blob/main/dictionary.py",
  "embarrassing:cringe":
    "https://github.com/dinoducktank/slang_dictionary/blob/main/dictionary.py",
  "laughing:lol":
    "https://github.com/dinoducktank/slang_dictionary/blob/main/dictionary.py",
};
export const UNDERGROUND_ANSWERS: Record<string, string> = {
  money: "dead presidents",
  friend: "ride or die",
  attractive: "face card never declines",
  leaving: "pull a houdini",
  lying: "selling dreams",
  excellent: "different gravy",
  angry: "crash out",
  tired: "cream crackered",
  rich: "laughing all the way to the bank",
  poor: "financially cooked",
  partying: "getting crunk",
  laughing: "omegalul",
  talking: "spill the tea",
  "showing off": "humblebrag",
  embarrassing: "walk of shame",
};
export const SLANG_BANK: SlangEntry[] = Object.entries(groups).flatMap(
  ([question, tiers]) =>
    tiers.flatMap(([tier, rows]) =>
      rows.map((row) => {
        const [canonical, ...rawAliases] = row.split("|");
        const seen = new Set([normalize(canonical)]);
        const aliases = rawAliases.filter((alias) => {
          const key = normalize(alias);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const source = communitySources[`${question}:${canonical}`];
        const sourceTier = scoreReviews[`${question}:${canonical}`] ?? tier;
        const reviewedTier: Tier =
          UNDERGROUND_ANSWERS[question] === canonical
            ? 4
            : sourceTier === 1
              ? 1
              : sourceTier <= 3
                ? 2
                : 3;
        return {
          question,
          canonical,
          tier: reviewedTier,
          points: TIERS[reviewedTier - 1].points,
          aliases,
          explanation:
            meanings[`${question}:${canonical}`] ??
            `Slang, figurative idiom or familiar address associated with ${question}; editorial sense selection with independent dictionary review pending.`,
          reviewStatus: "editorially-reviewed" as const,
          sourceStatus: source
            ? ("community-definition-checked" as const)
            : ("pending-web-review" as const),
          sourceUrls: source ? [source] : [],
        };
      }),
    ),
);
export const OVERHAULED_QUESTIONS = Object.keys(groups);
