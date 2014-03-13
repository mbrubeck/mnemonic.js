/*
 Copyright (c) 2000  Oren Tirosh <oren@hishome.net>
 Copyright (c) 2014  Matt Brubeck <mbrubeck@limpet.net>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
(function(exports) {

var MN_BASE = 1626;                    /* cubic root of 2^32, rounded up */
var MN_REMAINDER = 7;                  /* extra words for 24 bit remainders */
var MN_WORDS = MN_BASE + MN_REMAINDER; /* total number of words */
var MN_WORD_BUFLEN = 25;               /* size for a word buffer+headroom */

/* Sample formats for mn_encode */
var MN_FDEFAULT           = "x-x-x--"
var MN_F64BITSPERLINE     = " x-x-x--x-x-x\n"
var MN_F96BITSPERLINE     = " x-x-x--x-x-x--x-x-x\n"
var MN_F128BITSPERLINE    = " x-x-x--x-x-x--x-x-x--x-x-x\n"
/* Note that the last format does not fit in a standard 80 character line */

var mn_words = [
  undefined,
  "academy",  "acrobat",  "active",   "actor",    "adam",     "admiral",
  "adrian",   "africa",   "agenda",   "agent",    "airline",  "airport",
  "aladdin",  "alarm",    "alaska",   "albert",   "albino",   "album",
  "alcohol",  "alex",     "algebra",  "alibi",    "alice",    "alien",
  "alpha",    "alpine",   "amadeus",  "amanda",   "amazon",   "amber",
  "america",  "amigo",    "analog",   "anatomy",  "angel",    "animal",
  "antenna",  "antonio",  "apollo",   "april",    "archive",  "arctic",
  "arizona",  "arnold",   "aroma",    "arthur",   "artist",   "asia",
  "aspect",   "aspirin",  "athena",   "athlete",  "atlas",    "audio",
  "august",   "austria",  "axiom",    "aztec",    "balance",  "ballad",
  "banana",   "bandit",   "banjo",    "barcode",  "baron",    "basic",
  "battery",  "belgium",  "berlin",   "bermuda",  "bernard",  "bikini",
  "binary",   "bingo",    "biology",  "block",    "blonde",   "bonus",
  "boris",    "boston",   "boxer",    "brandy",   "bravo",    "brazil",
  "bronze",   "brown",    "bruce",    "bruno",    "burger",   "burma",
  "cabinet",  "cactus",   "cafe",     "cairo",    "cake",     "calypso",
  "camel",    "camera",   "campus",   "canada",   "canal",    "cannon",
  "canoe",    "cantina",  "canvas",   "canyon",   "capital",  "caramel",
  "caravan",  "carbon",   "cargo",    "carlo",    "carol",    "carpet",
  "cartel",   "casino",   "castle",   "castro",   "catalog",  "caviar",
  "cecilia",  "cement",   "center",   "century",  "ceramic",  "chamber",
  "chance",   "change",   "chaos",    "charlie",  "charm",    "charter",
  "chef",     "chemist",  "cherry",   "chess",    "chicago",  "chicken",
  "chief",    "china",    "cigar",    "cinema",   "circus",   "citizen",
  "city",     "clara",    "classic",  "claudia",  "clean",    "client",
  "climax",   "clinic",   "clock",    "club",     "cobra",    "coconut",
  "cola",     "collect",  "colombo",  "colony",   "color",    "combat",
  "comedy",   "comet",    "command",  "compact",  "company",  "complex",
  "concept",  "concert",  "connect",  "consul",   "contact",  "context",
  "contour",  "control",  "convert",  "copy",     "corner",   "corona",
  "correct",  "cosmos",   "couple",   "courage",  "cowboy",   "craft",
  "crash",    "credit",   "cricket",  "critic",   "crown",    "crystal",
  "cuba",     "culture",  "dallas",   "dance",    "daniel",   "david",
  "decade",   "decimal",  "deliver",  "delta",    "deluxe",   "demand",
  "demo",     "denmark",  "derby",    "design",   "detect",   "develop",
  "diagram",  "dialog",   "diamond",  "diana",    "diego",    "diesel",
  "diet",     "digital",  "dilemma",  "diploma",  "direct",   "disco",
  "disney",   "distant",  "doctor",   "dollar",   "dominic",  "domino",
  "donald",   "dragon",   "drama",    "dublin",   "duet",     "dynamic",
  "east",     "ecology",  "economy",  "edgar",    "egypt",    "elastic",
  "elegant",  "element",  "elite",    "elvis",    "email",    "energy",
  "engine",   "english",  "episode",  "equator",  "escort",   "ethnic",
  "europe",   "everest",  "evident",  "exact",    "example",  "exit",
  "exotic",   "export",   "express",  "extra",    "fabric",   "factor",
  "falcon",   "family",   "fantasy",  "fashion",  "fiber",    "fiction",
  "fidel",    "fiesta",   "figure",   "film",     "filter",   "final",
  "finance",  "finish",   "finland",  "flash",    "florida",  "flower",
  "fluid",    "flute",    "focus",    "ford",     "forest",   "formal",
  "format",   "formula",  "fortune",  "forum",    "fragile",  "france",
  "frank",    "friend",   "frozen",   "future",   "gabriel",  "galaxy",
  "gallery",  "gamma",    "garage",   "garden",   "garlic",   "gemini",
  "general",  "genetic",  "genius",   "germany",  "global",   "gloria",
  "golf",     "gondola",  "gong",     "good",     "gordon",   "gorilla",
  "grand",    "granite",  "graph",    "green",    "group",    "guide",
  "guitar",   "guru",     "hand",     "happy",    "harbor",   "harmony",
  "harvard",  "havana",   "hawaii",   "helena",   "hello",    "henry",
  "hilton",   "history",  "horizon",  "hotel",    "human",    "humor",
  "icon",     "idea",     "igloo",    "igor",     "image",    "impact",
  "import",   "index",    "india",    "indigo",   "input",    "insect",
  "instant",  "iris",     "italian",  "jacket",   "jacob",    "jaguar",
  "janet",    "japan",    "jargon",   "jazz",     "jeep",     "john",
  "joker",    "jordan",   "jumbo",    "june",     "jungle",   "junior",
  "jupiter",  "karate",   "karma",    "kayak",    "kermit",   "kilo",
  "king",     "koala",    "korea",    "labor",    "lady",     "lagoon",
  "laptop",   "laser",    "latin",    "lava",     "lecture",  "left",
  "legal",    "lemon",    "level",    "lexicon",  "liberal",  "libra",
  "limbo",    "limit",    "linda",    "linear",   "lion",     "liquid",
  "liter",    "little",   "llama",    "lobby",    "lobster",  "local",
  "logic",    "logo",     "lola",     "london",   "lotus",    "lucas",
  "lunar",    "machine",  "macro",    "madam",    "madonna",  "madrid",
  "maestro",  "magic",    "magnet",   "magnum",   "major",    "mama",
  "mambo",    "manager",  "mango",    "manila",   "marco",    "marina",
  "market",   "mars",     "martin",   "marvin",   "master",   "matrix",
  "maximum",  "media",    "medical",  "mega",     "melody",   "melon",
  "memo",     "mental",   "mentor",   "menu",     "mercury",  "message",
  "metal",    "meteor",   "meter",    "method",   "metro",    "mexico",
  "miami",    "micro",    "million",  "mineral",  "minimum",  "minus",
  "minute",   "miracle",  "mirage",   "miranda",  "mister",   "mixer",
  "mobile",   "model",    "modem",    "modern",   "modular",  "moment",
  "monaco",   "monica",   "monitor",  "mono",     "monster",  "montana",
  "morgan",   "motel",    "motif",    "motor",    "mozart",   "multi",
  "museum",   "music",    "mustang",  "natural",  "neon",     "nepal",
  "neptune",  "nerve",    "neutral",  "nevada",   "news",     "ninja",
  "nirvana",  "normal",   "nova",     "novel",    "nuclear",  "numeric",
  "nylon",    "oasis",    "object",   "observe",  "ocean",    "octopus",
  "olivia",   "olympic",  "omega",    "opera",    "optic",    "optimal",
  "orange",   "orbit",    "organic",  "orient",   "origin",   "orlando",
  "oscar",    "oxford",   "oxygen",   "ozone",    "pablo",    "pacific",
  "pagoda",   "palace",   "pamela",   "panama",   "panda",    "panel",
  "panic",    "paradox",  "pardon",   "paris",    "parker",   "parking",
  "parody",   "partner",  "passage",  "passive",  "pasta",    "pastel",
  "patent",   "patriot",  "patrol",   "patron",   "pegasus",  "pelican",
  "penguin",  "pepper",   "percent",  "perfect",  "perfume",  "period",
  "permit",   "person",   "peru",     "phone",    "photo",    "piano",
  "picasso",  "picnic",   "picture",  "pigment",  "pilgrim",  "pilot",
  "pirate",   "pixel",    "pizza",    "planet",   "plasma",   "plaster",
  "plastic",  "plaza",    "pocket",   "poem",     "poetic",   "poker",
  "polaris",  "police",   "politic",  "polo",     "polygon",  "pony",
  "popcorn",  "popular",  "postage",  "postal",   "precise",  "prefix",
  "premium",  "present",  "price",    "prince",   "printer",  "prism",
  "private",  "product",  "profile",  "program",  "project",  "protect",
  "proton",   "public",   "pulse",    "puma",     "pyramid",  "queen",
  "radar",    "radio",    "random",   "rapid",    "rebel",    "record",
  "recycle",  "reflex",   "reform",   "regard",   "regular",  "relax",
  "report",   "reptile",  "reverse",  "ricardo",  "ringo",    "ritual",
  "robert",   "robot",    "rocket",   "rodeo",    "romeo",    "royal",
  "russian",  "safari",   "salad",    "salami",   "salmon",   "salon",
  "salute",   "samba",    "sandra",   "santana",  "sardine",  "school",
  "screen",   "script",   "second",   "secret",   "section",  "segment",
  "select",   "seminar",  "senator",  "senior",   "sensor",   "serial",
  "service",  "sheriff",  "shock",    "sierra",   "signal",   "silicon",
  "silver",   "similar",  "simon",    "single",   "siren",    "slogan",
  "social",   "soda",     "solar",    "solid",    "solo",     "sonic",
  "soviet",   "special",  "speed",    "spiral",   "spirit",   "sport",
  "static",   "station",  "status",   "stereo",   "stone",    "stop",
  "street",   "strong",   "student",  "studio",   "style",    "subject",
  "sultan",   "super",    "susan",    "sushi",    "suzuki",   "switch",
  "symbol",   "system",   "tactic",   "tahiti",   "talent",   "tango",
  "tarzan",   "taxi",     "telex",    "tempo",    "tennis",   "texas",
  "textile",  "theory",   "thermos",  "tiger",    "titanic",  "tokyo",
  "tomato",   "topic",    "tornado",  "toronto",  "torpedo",  "total",
  "totem",    "tourist",  "tractor",  "traffic",  "transit",  "trapeze",
  "travel",   "tribal",   "trick",    "trident",  "trilogy",  "tripod",
  "tropic",   "trumpet",  "tulip",    "tuna",     "turbo",    "twist",
  "ultra",    "uniform",  "union",    "uranium",  "vacuum",   "valid",
  "vampire",  "vanilla",  "vatican",  "velvet",   "ventura",  "venus",
  "vertigo",  "veteran",  "victor",   "video",    "vienna",   "viking",
  "village",  "vincent",  "violet",   "violin",   "virtual",  "virus",
  "visa",     "vision",   "visitor",  "visual",   "vitamin",  "viva",
  "vocal",    "vodka",    "volcano",  "voltage",  "volume",   "voyage",
  "water",    "weekend",  "welcome",  "western",  "window",   "winter",
  "wizard",   "wolf",     "world",    "xray",     "yankee",   "yoga",
  "yogurt",   "yoyo",     "zebra",    "zero",     "zigzag",   "zipper",
  "zodiac",   "zoom",     "abraham",  "action",   "address",  "alabama",
  "alfred",   "almond",   "ammonia",  "analyze",  "annual",   "answer",
  "apple",    "arena",    "armada",   "arsenal",  "atlanta",  "atomic",
  "avenue",   "average",  "bagel",    "baker",    "ballet",   "bambino",
  "bamboo",   "barbara",  "basket",   "bazaar",   "benefit",  "bicycle",
  "bishop",   "blitz",    "bonjour",  "bottle",   "bridge",   "british",
  "brother",  "brush",    "budget",   "cabaret",  "cadet",    "candle",
  "capitan",  "capsule",  "career",   "cartoon",  "channel",  "chapter",
  "cheese",   "circle",   "cobalt",   "cockpit",  "college",  "compass",
  "comrade",  "condor",   "crimson",  "cyclone",  "darwin",   "declare",
  "degree",   "delete",   "delphi",   "denver",   "desert",   "divide",
  "dolby",    "domain",   "domingo",  "double",   "drink",    "driver",
  "eagle",    "earth",    "echo",     "eclipse",  "editor",   "educate",
  "edward",   "effect",   "electra",  "emerald",  "emotion",  "empire",
  "empty",    "escape",   "eternal",  "evening",  "exhibit",  "expand",
  "explore",  "extreme",  "ferrari",  "first",    "flag",     "folio",
  "forget",   "forward",  "freedom",  "fresh",    "friday",   "fuji",
  "galileo",  "garcia",   "genesis",  "gold",     "gravity",  "habitat",
  "hamlet",   "harlem",   "helium",   "holiday",  "house",    "hunter",
  "ibiza",    "iceberg",  "imagine",  "infant",   "isotope",  "jackson",
  "jamaica",  "jasmine",  "java",     "jessica",  "judo",     "kitchen",
  "lazarus",  "letter",   "license",  "lithium",  "loyal",    "lucky",
  "magenta",  "mailbox",  "manual",   "marble",   "mary",     "maxwell",
  "mayor",    "milk",     "monarch",  "monday",   "money",    "morning",
  "mother",   "mystery",  "native",   "nectar",   "nelson",   "network",
  "next",     "nikita",   "nobel",    "nobody",   "nominal",  "norway",
  "nothing",  "number",   "october",  "office",   "oliver",   "opinion",
  "option",   "order",    "outside",  "package",  "pancake",  "pandora",
  "panther",  "papa",     "patient",  "pattern",  "pedro",    "pencil",
  "people",   "phantom",  "philips",  "pioneer",  "pluto",    "podium",
  "portal",   "potato",   "prize",    "process",  "protein",  "proxy",
  "pump",     "pupil",    "python",   "quality",  "quarter",  "quiet",
  "rabbit",   "radical",  "radius",   "rainbow",  "ralph",    "ramirez",
  "ravioli",  "raymond",  "respect",  "respond",  "result",   "resume",
  "retro",    "richard",  "right",    "risk",     "river",    "roger",
  "roman",    "rondo",    "sabrina",  "salary",   "salsa",    "sample",
  "samuel",   "saturn",   "savage",   "scarlet",  "scoop",    "scorpio",
  "scratch",  "scroll",   "sector",   "serpent",  "shadow",   "shampoo",
  "sharon",   "sharp",    "short",    "shrink",   "silence",  "silk",
  "simple",   "slang",    "smart",    "smoke",    "snake",    "society",
  "sonar",    "sonata",   "soprano",  "source",   "sparta",   "sphere",
  "spider",   "sponsor",  "spring",   "acid",     "adios",    "agatha",
  "alamo",    "alert",    "almanac",  "aloha",    "andrea",   "anita",
  "arcade",   "aurora",   "avalon",   "baby",     "baggage",  "balloon",
  "bank",     "basil",    "begin",    "biscuit",  "blue",     "bombay",
  "brain",    "brenda",   "brigade",  "cable",    "carmen",   "cello",
  "celtic",   "chariot",  "chrome",   "citrus",   "civil",    "cloud",
  "common",   "compare",  "cool",     "copper",   "coral",    "crater",
  "cubic",    "cupid",    "cycle",    "depend",   "door",     "dream",
  "dynasty",  "edison",   "edition",  "enigma",   "equal",    "eric",
  "event",    "evita",    "exodus",   "extend",   "famous",   "farmer",
  "food",     "fossil",   "frog",     "fruit",    "geneva",   "gentle",
  "george",   "giant",    "gilbert",  "gossip",   "gram",     "greek",
  "grille",   "hammer",   "harvest",  "hazard",   "heaven",   "herbert",
  "heroic",   "hexagon",  "husband",  "immune",   "inca",     "inch",
  "initial",  "isabel",   "ivory",    "jason",    "jerome",   "joel",
  "joshua",   "journal",  "judge",    "juliet",   "jump",     "justice",
  "kimono",   "kinetic",  "leonid",   "lima",     "maze",     "medusa",
  "member",   "memphis",  "michael",  "miguel",   "milan",    "mile",
  "miller",   "mimic",    "mimosa",   "mission",  "monkey",   "moral",
  "moses",    "mouse",    "nancy",    "natasha",  "nebula",   "nickel",
  "nina",     "noise",    "orchid",   "oregano",  "origami",  "orinoco",
  "orion",    "othello",  "paper",    "paprika",  "prelude",  "prepare",
  "pretend",  "profit",   "promise",  "provide",  "puzzle",   "remote",
  "repair",   "reply",    "rival",    "riviera",  "robin",    "rose",
  "rover",    "rudolf",   "saga",     "sahara",   "scholar",  "shelter",
  "ship",     "shoe",     "sigma",    "sister",   "sleep",    "smile",
  "spain",    "spark",    "split",    "spray",    "square",   "stadium",
  "star",     "storm",    "story",    "strange",  "stretch",  "stuart",
  "subway",   "sugar",    "sulfur",   "summer",   "survive",  "sweet",
  "swim",     "table",    "taboo",    "target",   "teacher",  "telecom",
  "temple",   "tibet",    "ticket",   "tina",     "today",    "toga",
  "tommy",    "tower",    "trivial",  "tunnel",   "turtle",   "twin",
  "uncle",    "unicorn",  "unique",   "update",   "valery",   "vega",
  "version",  "voodoo",   "warning",  "william",  "wonder",   "year",
  "yellow",   "young",    "absent",   "absorb",   "accent",   "alfonso",
  "alias",    "ambient",  "andy",     "anvil",    "appear",   "apropos",
  "archer",   "ariel",    "armor",    "arrow",    "austin",   "avatar",
  "axis",     "baboon",   "bahama",   "bali",     "balsa",    "bazooka",
  "beach",    "beast",    "beatles",  "beauty",   "before",   "benny",
  "betty",    "between",  "beyond",   "billy",    "bison",    "blast",
  "bless",    "bogart",   "bonanza",  "book",     "border",   "brave",
  "bread",    "break",    "broken",   "bucket",   "buenos",   "buffalo",
  "bundle",   "button",   "buzzer",   "byte",     "caesar",   "camilla",
  "canary",   "candid",   "carrot",   "cave",     "chant",    "child",
  "choice",   "chris",    "cipher",   "clarion",  "clark",    "clever",
  "cliff",    "clone",    "conan",    "conduct",  "congo",    "content",
  "costume",  "cotton",   "cover",    "crack",    "current",  "danube",
  "data",     "decide",   "desire",   "detail",   "dexter",   "dinner",
  "dispute",  "donor",    "druid",    "drum",     "easy",     "eddie",
  "enjoy",    "enrico",   "epoxy",    "erosion",  "except",   "exile",
  "explain",  "fame",     "fast",     "father",   "felix",    "field",
  "fiona",    "fire",     "fish",     "flame",    "flex",     "flipper",
  "float",    "flood",    "floor",    "forbid",   "forever",  "fractal",
  "frame",    "freddie",  "front",    "fuel",     "gallop",   "game",
  "garbo",    "gate",     "gibson",   "ginger",   "giraffe",  "gizmo",
  "glass",    "goblin",   "gopher",   "grace",    "gray",     "gregory",
  "grid",     "griffin",  "ground",   "guest",    "gustav",   "gyro",
  "hair",     "halt",     "harris",   "heart",    "heavy",    "herman",
  "hippie",   "hobby",    "honey",    "hope",     "horse",    "hostel",
  "hydro",    "imitate",  "info",     "ingrid",   "inside",   "invent",
  "invest",   "invite",   "iron",     "ivan",     "james",    "jester",
  "jimmy",    "join",     "joseph",   "juice",    "julius",   "july",
  "justin",   "kansas",   "karl",     "kevin",    "kiwi",     "ladder",
  "lake",     "laura",    "learn",    "legacy",   "legend",   "lesson",
  "life",     "light",    "list",     "locate",   "lopez",    "lorenzo",
  "love",     "lunch",    "malta",    "mammal",   "margo",    "marion",
  "mask",     "match",    "mayday",   "meaning",  "mercy",    "middle",
  "mike",     "mirror",   "modest",   "morph",    "morris",   "nadia",
  "nato",     "navy",     "needle",   "neuron",   "never",    "newton",
  "nice",     "night",    "nissan",   "nitro",    "nixon",    "north",
  "oberon",   "octavia",  "ohio",     "olga",     "open",     "opus",
  "orca",     "oval",     "owner",    "page",     "paint",    "palma",
  "parade",   "parent",   "parole",   "paul",     "peace",    "pearl",
  "perform",  "phoenix",  "phrase",   "pierre",   "pinball",  "place",
  "plate",    "plato",    "plume",    "pogo",     "point",    "polite",
  "polka",    "poncho",   "powder",   "prague",   "press",    "presto",
  "pretty",   "prime",    "promo",    "quasi",    "quest",    "quick",
  "quiz",     "quota",    "race",     "rachel",   "raja",     "ranger",
  "region",   "remark",   "rent",     "reward",   "rhino",    "ribbon",
  "rider",    "road",     "rodent",   "round",    "rubber",   "ruby",
  "rufus",    "sabine",   "saddle",   "sailor",   "saint",    "salt",
  "satire",   "scale",    "scuba",    "season",   "secure",   "shake",
  "shallow",  "shannon",  "shave",    "shelf",    "sherman",  "shine",
  "shirt",    "side",     "sinatra",  "sincere",  "size",     "slalom",
  "slow",     "small",    "snow",     "sofia",    "song",     "sound",
  "south",    "speech",   "spell",    "spend",    "spoon",    "stage",
  "stamp",    "stand",    "state",    "stella",   "stick",    "sting",
  "stock",    "store",    "sunday",   "sunset",   "support",  "sweden",
  "swing",    "tape",     "think",    "thomas",   "tictac",   "time",
  "toast",    "tobacco",  "tonight",  "torch",    "torso",    "touch",
  "toyota",   "trade",    "tribune",  "trinity",  "triton",   "truck",
  "trust",    "type",     "under",    "unit",     "urban",    "urgent",
  "user",     "value",    "vendor",   "venice",   "verona",   "vibrate",
  "virgo",    "visible",  "vista",    "vital",    "voice",    "vortex",
  "waiter",   "watch",    "wave",     "weather",  "wedding",  "wheel",
  "whiskey",  "wisdom",   "deal",     "null",     "nurse",    "quebec",
  "reserve",  "reunion",  "roof",     "singer",   "verbal",   "amen",
  "ego",      "fax",      "jet",      "job",      "rio",      "ski",
  "yes"
];

var mn_word_index_map; /* object mapping words to array indices */

function mn_word_index (word) {
  if (!mn_word_index_map)
    {
      mn_word_index_map = {};
      for (var i = 1; i < mn_words.length; i++)
        mn_word_index_map[mn_words[i]] = i;
    }

  return mn_word_index_map[word.toLowerCase()];
}

/*
 * isalpha
 *
 * Description:
 *  Returns true if the provided string is a single ASCII letter.
 *
 * Parameters:
 *  c - String
 *
 * Return value:
 *  Boolean
 */
function isalpha (c) {
  return /^[a-zA-Z]$/.test(c);
}

/*
 * uint32
 *
 * Description:
 *  Coerce a signed 32-bit integer to an unsigned 32-bit integer.
 *
 * Parameters:
 *  n - Number
 *
 * Return value:
 *  32-bit unsigned number
 */
function uint32 (n) {
  return (n < 0 ? 0x100000000 + n : n);
}

/*
 * mn_words_required
 *
 * Description:
 *  Calculate the number of words required to encode data using mnemonic
 *  encoding.
 *
 * Parameters:
 *  size - Size in bytes of data to be encoded
 *
 * Return value:
 *  number of words required for the encoding
 */
function mn_words_required (size) {
  return Math.floor(((size + 1) * 3) / 4);
}

/*
 * mn_encode_word
 *
 * Description:
 *  Perform one step of encoding binary data into words. Returns pointer
 *  to word.
 *
 * Parameters:
 *   src - array of bytes to encode
 *   n - Sequence number of word to encode.
 *       0 <= n < mn_words_required(src.length)
 *
 * Return value:
 *   undefined - no more words to encode / n is out of range
 *   string - lowercase word, length<=7
 */
function mn_encode_word (src, n)
{
  return mn_words[mn_encode_word_index (src, n)];
}

/*
 * mn_encode_word_index
 *
 * Description:
 *  Perform one step of encoding binary data into words. Returns word index.
 *
 * Parameters:
 *   src - Array of bytes to encode
 *   n - Sequence number of word to encode
 *       0 <= n < mn_words_required(src.length)
 *
 * Return value:
 *   0 - no more words to encode / n is out of range
 *   1..MN_WORDS - word index. May be used as index to the mn_words[] array
 */
function mn_encode_word_index (src, n)
{
  var x = 0;                    /* Temporary for MN_BASE arithmetic */
  var offset;                   /* Offset into src */
  var remaining;                /* Octets remaining to end of src */
  var extra = 0;                /* Index 7 extra words for 24 bit data */
  var i;

  if (n < 0 || n >= mn_words_required (src.length))
    return 0;                   /* word out of range */
  offset = Math.floor(n / 3) * 4;         /* byte offset into src */
  remaining = src.length - offset;
  if (remaining <= 0)
    return 0;
  if (remaining >= 4)
    remaining = 4;
  for (i = 0; i < remaining; i++)
    x = uint32 (x | (src[offset + i] << (i * 8)));      /* endianness-agnostic */

  switch (n % 3)
    {
    case 2:                     /* Third word of group */
      if (remaining == 3)       /*  special case for 24 bits */
        extra = MN_BASE;        /*  use one of the 7 3-letter words */
      x = Math.floor(x / (MN_BASE * MN_BASE));
      break;
    case 1:                     /* Second word of group */
      x = Math.floor(x / MN_BASE);
    }
  return x % MN_BASE + extra + 1;
}

/*
 * mn_split
 *
 * Description:
 *  Split a string into an array of words.
 *
 * Parameters:
 *  src      - String to split
 *
 * Return value:
 *  Array of strings containing exactly one word each
 */

function mn_split (src)
{
  /* split on non-alphabetic characters and ignore empty strings */
  return src.split(/[^a-zA-Z]+/).filter(function(x) { return x; });
}

/*
 * mn_decode_word_index
 *
 * Description:
 *  Perform one step of decoding a sequence of words into binary data.
 *
 * Parameters:
 *  index    - Index of word, e.g. return value of mn_word_index. Use
 *             the value MN_EOF(=0) to signal the end of input.
 *  dest     - Array to receive decoded binary result.
 *  offset   - Integer offset into the destination buffer for
 *             next data byte. Initialize offset to 0 before first call to
 *             function.
 *
 * Return value:
 *  Amount of data actually decoded.
 *
 *  Throws an exception if the string cannot be decoded.
 */

function mn_decode_word_index (index, dest, offset)
{
  var x;                  /* Temporary for MN_BASE arithmetic */
  var groupofs;
  var i;

  if (offset < 0)
    throw "Negative offset in mn_decode_word_index";

  if (index > MN_WORDS)
    throw "Word index out of range";

  if (index > MN_BASE && offset % 4 != 2)
    throw "Unexpected 24 bit remainder word"

  groupofs = offset & ~3;      /* Offset of 4 byte group containing offet */
  x = 0;
  for (i = 0; i < 4; i++)
    {
      x = uint32 (x | (dest[groupofs + i] << (i * 8))); /* assemble number */
    }

  if (index == 0)          /* Got EOF signal */
    {
      switch (offset % 4)
        {
        case 3:         /* group was three words and the last */
          return offset;         /*  word was a 24 bit remainder */
        case 2:         /* last group has two words */
          if (x <= 0xFFFF)      /*  should encode 16 bit data */
            return offset;
          else
            throw "Unexpected remainder (possible truncated string)";
        case 1:         /* last group has just one word */
          if (x <= 0xFF)        /*  should encode 8 bits */
            return offset;
          else
            throw "Unexpected remainder (possible truncated string)";

        case 0:         /* last group was full 3 words */
          return offset;
        }
    }

  index--;                      /* 1 based to 0 based index */

  switch (offset % 4)
    {
    case 3:
      throw "Got data past 24 bit remainder";
    case 2:
      if (index >= MN_BASE)
        {                       /* 24 bit remainder */
          x += (index - MN_BASE) * MN_BASE * MN_BASE;
          offset++;          /* *offset%4 == 3 for next time */
        }
      else
        {                       /* catch invalid encodings */
          if (index >= 1625 || (index == 1624 && x > 1312671))
            throw "Invalid encoding";
          x += index * MN_BASE * MN_BASE;
          offset += 2;       /* *offset%4 == 0 for next time */
        }
      break;
    case 1:
      x += index * MN_BASE;
      offset++;
      break;
    case 0:
      x = index;
      offset++;
      break;
    }

  for (i = 0; i < 4; i++)
    {
      dest[groupofs + i] = x % 256;
      x = Math.floor(x / 256);
    }
  return offset;
}

/*
 * mn_encode
 *
 * Description:
 *  Encode a binary data buffer into a string of words.
 *  The word separators are taken from the format string.
 *
 * Parameters:
 *  src      - Array of bytes to encode
 *  format   - (optional) String describing the output format.
 *             In the format string any letter or sequence of letters
 *             acts as a placeholder for the encoded words. The word
 *             placeholders are separated by one or more non-letter
 *             characters. When the encoder reaches the end of the
 *             format string it starts reading it again.
 *             For sample formats see the MN_F* constants above.
 *             If format is empty or undefined, the format MN_FDEFAULT
 *             is used.
 *
 * This function enforces formats which will result in a string which
 * can be successfully decoded by the mn_decode function.  It throws
 * an exception if the format string does not meet this requirement.
 */

function mn_encode (src, format)
{
  var n;
  var dest = "";
  var i = 0; /* index within format */
  var word;

  if (!format || format == "")
    format = MN_FDEFAULT;

  for (n = 0; n < mn_words_required (src.length); n++)
    {
      while (i < format.length && !isalpha (format[i]))
        dest += format[i++];
      if (i == format.length)
        {
          if (isalpha (format[i-1]) && isalpha (format[0]))
            throw "Invalid format string";
          i = 0;
          while (i < format.length && !isalpha (format[i]))
            dest += format[i++];
          if (!isalpha (format[i]))
            throw "Invalid format string";
        }
      word = mn_encode_word (src, n);
      if (!word)
        throw "Encoding error";     /* shouldn't happen, actually */

      while (isalpha (format[i]))
        i++;
      dest += word;
    }
  return dest;
}

/*
 * mn_decode
 *
 * Description:
 *  Decode a text representation to an array of bytes
 *
 * Parameters:
 *  src      - String to decode
 *
 * Return value:
 *  Array of bytes
 *
 *  Throws an exception if the string cannot be decoded.
 */

function mn_decode (src)
{
  var index;
  var offset = 0;
  var words = mn_split (src);

  if (!words.length)
    return [];

  var dest = [];
  for (var i = 0; i < words.length; i++)
    {
      index = mn_word_index(words[i]);
      if (index == 0)
        break;
      if (typeof index == "undefined")
        throw "Unrecognized word";
      offset = mn_decode_word_index (index, dest, offset);
    }
  offset = mn_decode_word_index (0, dest, offset);
  return dest.slice (0, offset);
}

/*
 * int32_to_bytes
 *
 * Description:
 *  Convert a number to a big-endian array of bytes.
 *
 * Parameters:
 *  n - Positive integer
 *
 * Return value:
 *  Array of bytes
 */
function int32_to_bytes(n) {
  var bytes = [];
  for (var i = 3; i >= 0 && n; i--) {
    bytes.unshift(n & 0xFF);
    n >>= 8;
  }
  return bytes;
}

/*
 * bytes_to_int32
 *
 * Description:
 *  Convert a big-endian array of bytes to a number.
 *
 * Parameters:
 *  bytes - Array of up to 4 bytes
 *
 * Return value:
 *  32-bit number
 */
function bytes_to_int32(bytes) {
  if (bytes.length > 4)
    throw "Too many bytes";
  var n = 0;
  for (var i = 0; i < bytes.length; i++) {
    n <<= 8;
    n |= bytes[i];
  }
  return n;
}

/*
 * Encode a 32-bit number.
 */
function encode_int32(n) {
  return mn_encode(int32_to_bytes(n));
}

/*
 * Decode a 32-bit number.
 */
function decode_int32(src) {
  return bytes_to_int32(mn_decode(src));
}

exports.encode = mn_encode;
exports.decode = mn_decode;
exports.encode_int32 = encode_int32;
exports.decode_int32 = decode_int32;

})(typeof exports == "undefined" ? this["mnemonic"]={} : exports);
