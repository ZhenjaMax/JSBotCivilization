const DEBUG = 1;

const Discord = require('discord.js');
const schedule = require('node-schedule');

const civilizations = new Map([
  ["<:australia:701066628523098183>", "Австралия <:Australia:701066628523098183> Джон Кэртин"],
  ["<:america:701066550412836894>",   "Америка <:America:701066550412836894> Теодор Рузвельт (Прогрессивист)"],
  ["<:england:701066628489674772>",   "Англия <:England:701066628489674772> Виктория"],
  ["a<:england:701066628489674772>",   "Англия <:England:701066628489674772> Алиенора Аквитанская"],
  ["<:arabia:701066550442065970>",    "Аравия <:Arabia:701066550442065970> Саладин"],
  ["<:aztecs:701066550169436302>",    "Ацтеки <:Aztecs:701066550169436302> Монтесума"],
  ["<:brazil:701066699537121281>",    "Бразилия <:Brazil:701066699537121281> Педру II"],
  ["<:hungary:701066628674224128>",   "Венгрия <:Hungary:701066628674224128> Матьяш I"],
  ["<:germany:701066628653252658>",   "Германия <:Germany:701066628653252658> Фридрих Барбаросса"],
  ["<:greece:701900974108835900>",    "Греция <:Greece:701900974108835900> Горго"],
  ["p<:greece:701900974108835900>",   "Греция <:Greece:701900974108835900>  Перикл"],
  ["<:georgia:701066628518903848>",   "Грузия <:Georgia:701066628518903848> Тамара"],
  ["<:egypt:701066550265774162>",     "Египет <:Egypt:701066550265774162> Клеопатра"],
  ["<:zulu:701066699553767465>",      "Зулусы <:Zulu:701066699553767465> Чака"],
  ["<:india:701066628640800838>",     "Индия <:IndiaG:701066628640800838> Ганди"],
  ["c<:india:701066628640800838>",    "Индия <:IndiaG:701066628640800838> Чандрагупта"],
  ["<:indonesia:701066550425288754>", "Индонезия <:Indonesia:701066550425288754> Трибхувана"],
  ["<:inca:701066628737007666>",      "Инки <:Inca:701066628737007666> Пачакутек"],
  ["<:spain:701066699704893460>",     "Испания <:Spain:701066699704893460> Филипп II"],
  ["<:canada:701066699557961829>",    "Канада <:Canada:701066699557961829> Уилфрид Лорье"],
  ["<:china:701066550433677382>",     "Китай <:China:701066550433677382> Цинь Шихуанди"],
  ["<:kongo:701066628661641293>",     "Конго <:Kongo:701066628661641293> Мвемба а Нзинга"],
  ["<:korea:701066550232219801>",     "Корея <:Korea:701066550232219801> Сондок"],
  ["<:cree:701066550504980480>",      "Кри <:Cree:701066550504980480> Паундмейкер"],
  ["<:khmer:701066628150067302>",     "Кхмеры <:Khmer:701066628150067302> Джайаварман VII"],
  ["<:macedonia:701066628540006470>", "Македония <:Macedonia:701066628540006470> Александр"],
  ["<:mali:701066699490852914>",      "Мали <:Mali:701066699490852914> Манса Муса"],
  ["<:maori:701066699801231460>",     "Маори <:Maori:701066699801231460> Купе"],
  ["<:mongolia:701066699482464276>",  "Монголия <:Mongolia:701066699482464276> Чингисхан"],
  ["<:mapuche:701066724036050974>",   "Мапуче <:Mapuche:701066724036050974> Лаутаро"],
  ["<:nederlands:701066724111548476>","Нидерланды <:Nederlands:701066724111548476> Вильгельмина"],
  ["<:norway:701066723721216011>",    "Норвегия <:Norway:701066723721216011> Харальд Суровый"],
  ["<:nubia:701066699700699136>",     "Нубия <:Nubia:701066699700699136> Аманиторе"],
  ["<:ottoman:701066699230674976>",   "Оттоманы <:Ottoman:701066699230674976> Сулейман"],
  ["<:persia:701066723713089608>",    "Персия <:Persia:701066723713089608> Кир"],
  ["<:poland:701066699486789752>",    "Польша <:Poland:701066699486789752> Ядвига"],
  ["<:rome:701066699499372615>",      "Рим <:Rome:701066699499372615> Траян"],
  ["<:russia:701066723868147734>",    "Россия <:Russia:701066723868147734> Петр Великий"],
  ["<:scythia:701066699608162334>",   "Скифия <:Scythia:701066699608162334> Томирис"],
  ["<:phoenicia:701066628141678623>", "Финикия <:Phoenicia:701066628141678623> Дидона"],
  ["<:france:701066550051864628>",    "Франция <:France:701066550051864628> Екатерина Медичи (Черная королева)"],
  ["a<:france:701066550051864628>",   "Франция <:France:701066550051864628> Алиенора Аквитанская"],
  ["<:sweden:701066699608293376>",    "Швеция <:Sweden:701066699608293376> Кристина"],
  ["<:scotland:701066724031594566>",  "Шотландия <:Scotland:701066724031594566> Роберт I Брюс"],
  ["<:sumeria:701066699516018688>",   "Шумерия <:Sumeria:701066699516018688> Гильгамеш"],
  ["<:japan:701066628498063380>",     "Япония <:Japan:701066628498063380> Ходзе Токимунэ"],
  ["<:maya:713789628829663283>",      "Майя <:Maya:713789628829663283> Госпожа Шести Небес"],
  ["<:colombia:713789628590850149>",  "Колумбия <:Colombia:713789628590850149> Симон Боливар"],
  ["<:ethiopia:736271149159284807>",  "Эфиопия <:Ethiopia:736271149159284807> Менелик II"],
  ["r<:america:701066550412836894>",  "Америка <:America:701066550412836894> Мужественный всадник Тедди"],
  ["m<:france:701066550051864628>",   "Франция <:France:701066550051864628> Великолепная Екатерина"],
  ["<:byzantium:759396923382956043>", "Византия <:Byzantium:759396923382956043> Василий II"],
  ["<:gaul:759396911206629386>",      "Галлия <:Gaul:759396911206629386> Амбиорикс"],
  ["<:babylon:779706266062815242>",   "Вавилон <:Babylon:779706266062815242> Хаммурапи"],
  ["k<:china:701066550433677382>",    "Китай <:China:701066550433677382> Хубилай"],
  ["k<:mongolia:701066699482464276>", "Монголия <:Mongolia:701066699482464276> Хубилай"],
  ["<:vietnam:804417073140334603>",   "Вьетнам <:Vietnam:804417073140334603> Госпожа Чьеу"],
  ["<:portugal:825055292629844001>",  "Португалия <:Portugal:825055292629844001> Жуан III"],
]);

indexNationPairArray = [
  [2, 39],    // Англия (Виктория), Финикия
  [31, 45],   // Норвегия, Япония
  [19, 37],   // Канада, Россия
  [23, 34],   // Кри, Персия
  [40, 28],   // Екатерина Медичи (Чёрная королева), Чингисхан
  [26, 57],   // Мали, Португалия

  [40, 41],   // Екатерина Медичи (Чёрная Королева), Алиенора Французская
  [2, 3],     // Алиенора Английская, Виктория

  [9, 10],    // Греция (2)
  [14, 15],   // Индия (2)
  [1, 49],    // Америка (2)
  [28, 55],   // Монголия (2)
  [20, 54],   // Китай (2)
];

const numbersEmoji = [
  "0️⃣",
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
  "<:eleven:840562913492074496>",
  "<:twelve:840562913496399902>",
  "<:thirteen:840562913487749160>",
  "<:fourteen:840562913270038549>",
  "<:fifteen:840562913492074516>",
  "<:sixteen:840562913449213982>",
];

const achievementsName = [
  "🚀 Учёный I",
  "🚀 Учёный II",
  "🚀 Учёный III",
  "🚀 Учёный IV",
  "🚀 Учёный V",
  "🖌️ Художник I",
  "🖌️ Художник II",
  "🖌️ Художник III",
  "🖌️ Художник IV",
  "🖌️ Художник V",
  "⚔️ Полководец I",
  "⚔️ Полководец II",
  "⚔️ Полководец III",
  "⚔️ Полководец IV",
  "⚔️ Полководец V",
  "🙏 Пророк I",
  "🙏 Пророк II",
  "🙏 Пророк III",
  "🙏 Пророк IV",
  "🙏 Пророк V",
  "🕊️ Дипломат I",
  "🕊️ Дипломат II",
  "🕊️ Дипломат III",
  "🕊️ Дипломат IV",
  "🕊️ Дипломат V",

  "⏳ Испытание временем",
  "⛱️ Египетский поход",
  "🏞️ Национальное богатство",
  "✝️ Крестовый поход",
  //"☢️ Прогульщик!",
  "🗡️ Жертвы Кетцалькоатлю",
  "🌳 БлицКРИг",
  "🥶 Послезавтра",
  "🏃 Олимпийские игры",
  "🦅 Американская мечта",
  "🌨️ Генерал Мороз",
  "⛵ Воспоминания о мореплавании",
  "🛡️ И кто из нас варвар?",
];
const achievementsRequirement = [
  "Одержите научную победу над 7 игроками в течение нескольких игр.",
  "Одержите научную победу над 14 игроками в течение нескольких игр.",
  "Одержите научную победу над 21 игроком в течение нескольких игр.",
  "Одержите научную победу над 28 игроками в течение нескольких игр.",
  "Одержите научную победу над 35 игроками в течение нескольких игр.",
  "Одержите культурную победу над 7 игроками в течение нескольких игр.",
  "Одержите культурную победу над 14 игроками в течение нескольких игр.",
  "Одержите культурную победу над 21 игроком в течение нескольких игр.",
  "Одержите культурную победу над 28 игроками в течение нескольких игр.",
  "Одержите культурную победу над 35 игроками в течение нескольких игр.",
  "Одержите военную победу над 7 игроками в течение нескольких игр.",
  "Одержите военную победу над 14 игроками в течение нескольких игр.",
  "Одержите военную победу над 21 игроком в течение нескольких игр.",
  "Одержите военную победу над 28 игроками в течение нескольких игр.",
  "Одержите военную победу над 35 игроками в течение нескольких игр.",
  "Одержите религиозную победу над 7 игроками в течение нескольких игр.",
  "Одержите религиозную победу над 14 игроками в течение нескольких игр.",
  "Одержите религиозную победу над 21 игроком в течение нескольких игр.",
  "Одержите религиозную победу над 28 игроками в течение нескольких игр.",
  "Одержите религиозную победу над 35 игроками в течение нескольких игр.",
  "Одержите дипломатическую победу над 7 игроками в течение нескольких игр.",
  "Одержите дипломатическую победу над 14 игроками в течение нескольких игр.",
  "Одержите дипломатическую победу над 21 игроком в течение нескольких игр.",
  "Одержите дипломатическую победу над 28 игроками в течение нескольких игр.",
  "Одержите дипломатическую победу над 35 игроками в течение нескольких игр.",

  "Одержите победу по очкам (не раньше 170 хода)",  // ???
  "Играя за Францию, имейте Наполеона Бонапарта (великий генерал), находящегося на чуде Пирамиды.",
  "Играя за Монголию, создайте национальный парк с помощью Канадской конной полиции.",
  "Играя за Германию, захватите город-государство Иерусалим и поместите в храм Иерусалима реликвию.",
  //"Играя за Рим, очистите радиацию легионом.",
  "Играя за Ацтеков, полностью захватите врага, имея перед объявлением войны лишь собственную столицу.",
  "Играя за Кри, захватите столицу любой цивилизации до 20 хода включительно.",  // ??? 20?
  "Играя за Россию или Канаду, потеряете по крайней мере 15 жителей в результате одной снежной бури.",
  "Играя за Грецию, займите призовое место в соревновании \"Всемирные Игры\"",
  "Играя за Америку, постройте в одном городе Пригород с любым зданием на клетке с престижем \"Потрясающий\" и Заповедник со всеми зданиями.",
  "Играя за Германию, объявите войну России и потеряйте по крайней мере 10 юнитов в результате снежной бури.",
  "Играя за Маори, имейте юнит Тоа с боевой мощью 75 и более (учитываются все модификаторы).",
  "Играя за Галлов, мобилизируйте у города-государства Легионера.",
];

const achievementsAward = [
  ["750 🪙 монет ",  "+1% к рейтингу при одержании вами научной победы"],
  ["1500 🪙 монет ", "+2% к рейтингу при одержании вами научной победы"],
  ["2250 🪙 монет ", "+3% к рейтингу при одержании вами научной победы"],
  ["3000 🪙 монет ", "+4% к рейтингу при одержании вами научной победы"],
  ["4000 🪙 монет ", "+5% к рейтингу при одержании вами научной победы"],
  ["750 🪙 монет ",  "+1% к рейтингу при одержании вами культурной победы"],
  ["1500 🪙 монет ", "+2% к рейтингу при одержании вами культурной победы"],
  ["2250 🪙 монет ", "+3% к рейтингу при одержании вами культурной победы"],
  ["3000 🪙 монет ", "+4% к рейтингу при одержании вами культурной победы"],
  ["4000 🪙 монет ", "+5% к рейтингу при одержании вами культурной победы"],
  ["750 🪙 монет ",  "+1% к рейтингу при одержании вами военный победы"],
  ["1500 🪙 монет ", "+2% к рейтингу при одержании вами военной победы"],
  ["2250 🪙 монет ", "+3% к рейтингу при одержании вами военной победы"],
  ["3000 🪙 монет ", "+4% к рейтингу при одержании вами военной победы"],
  ["4000 🪙 монет ", "+5% к рейтингу при одержании вами военной победы"],
  ["750 🪙 монет ",  "+1% к рейтингу при одержании вами религиозной победы"],
  ["1500 🪙 монет ", "+2% к рейтингу при одержании вами религиозной победы"],
  ["2250 🪙 монет ", "+3% к рейтингу при одержании вами религиозной победы"],
  ["3000 🪙 монет ", "+4% к рейтингу при одержании вами религиозной победы"],
  ["4000 🪙 монет ", "+5% к рейтингу при одержании вами религиозной победы"],
  ["750 🪙 монет ",  "+1% к рейтингу при одержании вами дипломатической победы"],
  ["1500 🪙 монет ", "+2% к рейтингу при одержании вами дипломатической победы"],
  ["2250 🪙 монет ", "+3% к рейтингу при одержании вами дипломатической победы"],
  ["3000 🪙 монет ", "+4% к рейтингу при одержании вами дипломатической победы"],
  ["4000 🪙 монет ", "+5% к рейтингу при одержании вами дипломатической победы"],

  ["+1% к рейтингу при одержании вами любой победы"],
  ["Я хз пока что..."],
  ["Я хз пока что..."],
  ["Я хз пока что..."],
  ["Я хз пока что..."],
]

const guildID = '663144077818331186';
const chatChannelID = '698294019331063908';
const botChannelID = '698295115063492758';
const welcomeChannelID = '806267897658998834';

const roleAdministratorID = '698297099367874620';
const roleModeratorID = '699003139105488936';
const roleSupportID = '803537817497501716';
const ownerID = '352051709649879053';

const ratingReportsChannelID = '817163438655537173';
const bansReportsChannelID = '817162797594968094';
const achievementReportsChannelID = '817164450166734868';
const proposalChannelID = '817346967067426816';

const roleRanksID = [
  '817181568388562984',
  '817181566722768907',
  '817181565381509131',
  '817181564122955776',
  '817181561837060117',
  '817181559412752397',
  '817181555247022080',
  '817181552156082263',
  '817181330088787989'
];

const roleRanksValue = [
            //   0 ...  849 - строитель (0)
  850,      // 850 ...  899 - поселенец (1)
  900,      // 900 ...  999 - вождь (2)
  1000,     //1000 ... 1099 - военачальник (3)       
  1100,     //1100 ... 1189 - князь (4)
  1190,     //1190 ... 1269 - король (5)
  1270,     //1270 ... 1339 - император (6)
  1340,     //1340 ... 1399 - бессмертный (7)
  1400,     //1400 ... +inf - божество (8)
]

const roleBannedID = '700353744226746408';
const roleMutedChatID = '700354723236282370';
const roleMutedVoiceID = '700355053269155963';

const clanCreateCost = 2500;
const clanRenameCost = 750;
const clanChangeColorCost = 750;
const clanNameLength = 64;
const descriptionLength = 128;
const urlLength = 192;

const FFARoleID = '820789027518021642';
const teamersRoleID = '819672819990003754';
const tableTopRoleID = '821871088412786688';
const dotaRoleID = '845633047003922442';

if(DEBUG)
  token = "ODE0MDQzOTQ1OTM1MTc1NzIw.YDYHgA.FaZvJTHJdIqia_yjtvaU0wowZCM";
else
  token = "Nzk1MjkyMDgyMTg0NjUwODEz.X_HPeA.fq7JiC9-b2uZs3lEsn70ataVV1o";

const prefix = "!";
const bot = new Discord.Client();

module.exports = {
  civilizations,
  indexNationPairArray,
  numbersEmoji, 
  chatChannelID,
  botChannelID,
  welcomeChannelID,
  guildID,

  ratingReportsChannelID,
  bansReportsChannelID,
  achievementReportsChannelID,
  proposalChannelID,

  roleBannedID,
  roleMutedChatID,
  roleMutedVoiceID,
  roleAdministratorID,
  roleModeratorID,
  roleSupportID,
  ownerID,

  roleRanksID,
  roleRanksValue,
  clanCreateCost,
  clanRenameCost,
  clanChangeColorCost,
  clanNameLength,
  descriptionLength,
  urlLength,

  token,
  prefix,
  bot,
  schedule,
  DEBUG,

  achievementsName,
  achievementsRequirement,
  achievementsAward,

  FFARoleID,
  teamersRoleID,
  tableTopRoleID,
  dotaRoleID,
}
