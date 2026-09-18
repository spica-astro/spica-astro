/**
 * База данни с координати и часови зони за градове в България и света
 */
const CITIES_DATA = [
  // България - Областни, курортни и по-малки градове
  { name: "София", country: "България", lat: 42.6977, lng: 23.3219, tz: 2, nameEn: "Sofia" },
  { name: "Пловдив", country: "България", lat: 42.1354, lng: 24.7453, tz: 2, nameEn: "Plovdiv" },
  { name: "Варна", country: "България", lat: 43.2141, lng: 27.9147, tz: 2, nameEn: "Varna" },
  { name: "Бургас", country: "България", lat: 42.5048, lng: 27.4626, tz: 2, nameEn: "Burgas" },
  { name: "Русе", country: "България", lat: 43.8356, lng: 25.9657, tz: 2, nameEn: "Ruse" },
  { name: "Стара Загора", country: "България", lat: 42.4258, lng: 25.6345, tz: 2, nameEn: "Stara Zagora" },
  { name: "Плевен", country: "България", lat: 43.4170, lng: 24.6067, tz: 2, nameEn: "Pleven" },
  { name: "Сливен", country: "България", lat: 42.6817, lng: 26.3228, tz: 2, nameEn: "Sliven" },
  { name: "Добрич", country: "България", lat: 43.5726, lng: 27.8273, tz: 2, nameEn: "Dobrich" },
  { name: "Шумен", country: "България", lat: 43.2712, lng: 26.9361, tz: 2, nameEn: "Shumen" },
  { name: "Перник", country: "България", lat: 42.6052, lng: 23.0378, tz: 2, nameEn: "Pernik" },
  { name: "Хасково", country: "България", lat: 41.9344, lng: 25.5556, tz: 2, nameEn: "Haskovo" },
  { name: "Ямбол", country: "България", lat: 42.4842, lng: 26.5035, tz: 2, nameEn: "Yambol" },
  { name: "Пазарджик", country: "България", lat: 42.1928, lng: 24.3336, tz: 2, nameEn: "Pazardzhik" },
  { name: "Благоевград", country: "България", lat: 42.0209, lng: 23.0943, tz: 2, nameEn: "Blagoevgrad" },
  { name: "Велико Търново", country: "България", lat: 43.0757, lng: 25.6172, tz: 2, nameEn: "Veliko Tarnovo" },
  { name: "Габрово", country: "България", lat: 42.8742, lng: 25.3187, tz: 2, nameEn: "Gabrovo" },
  { name: "Враца", country: "България", lat: 43.2102, lng: 23.5529, tz: 2, nameEn: "Vratsa" },
  { name: "Казанлък", country: "България", lat: 42.6194, lng: 25.3930, tz: 2, nameEn: "Kazanlak" },
  { name: "Видин", country: "България", lat: 43.9962, lng: 22.8679, tz: 2, nameEn: "Vidin" },
  { name: "Асеновград", country: "България", lat: 42.0089, lng: 24.8772, tz: 2, nameEn: "Asenovgrad" },
  { name: "Кърджали", country: "България", lat: 41.6439, lng: 25.3725, tz: 2, nameEn: "Kardzhali" },
  { name: "Кюстендил", country: "България", lat: 42.2869, lng: 22.6914, tz: 2, nameEn: "Kyustendil" },
  { name: "Монтана", country: "България", lat: 43.4085, lng: 23.2258, tz: 2, nameEn: "Montana" },
  { name: "Търговище", country: "България", lat: 43.2512, lng: 26.5722, tz: 2, nameEn: "Targovishte" },
  { name: "Димитровград", country: "България", lat: 42.0575, lng: 25.5978, tz: 2, nameEn: "Dimitrovgrad" },
  { name: "Силистра", country: "България", lat: 44.1172, lng: 27.2606, tz: 2, nameEn: "Silistra" },
  { name: "Ловеч", country: "България", lat: 43.1370, lng: 24.7142, tz: 2, nameEn: "Lovech" },
  { name: "Дупница", country: "България", lat: 42.2642, lng: 23.1189, tz: 2, nameEn: "Dupnitsa" },
  { name: "Разград", country: "България", lat: 43.5256, lng: 26.5256, tz: 2, nameEn: "Razgrad" },
  { name: "Горна Оряховица", country: "България", lat: 43.1286, lng: 25.7022, tz: 2, nameEn: "Gorna Oryahovitsa" },
  { name: "Свищов", country: "България", lat: 43.6167, lng: 25.3500, tz: 2, nameEn: "Svishtov" },
  { name: "Петрич", country: "България", lat: 41.3986, lng: 23.2072, tz: 2, nameEn: "Petrich" },
  { name: "Смолян", country: "България", lat: 41.5744, lng: 24.7128, tz: 2, nameEn: "Smolyan" },
  { name: "Девин", country: "България", lat: 41.7434, lng: 24.3985, tz: 2, nameEn: "Devin" },
  { name: "Чепеларе", country: "България", lat: 41.7333, lng: 24.6833, tz: 2, nameEn: "Chepelare" },
  { name: "Сандански", country: "България", lat: 41.5647, lng: 23.2797, tz: 2, nameEn: "Sandanski" },
  { name: "Самоков", country: "България", lat: 42.3375, lng: 23.5558, tz: 2, nameEn: "Samokov" },
  { name: "Велинград", country: "България", lat: 42.0275, lng: 23.9914, tz: 2, nameEn: "Velingrad" },
  { name: "Севлиево", country: "България", lat: 43.0258, lng: 25.1136, tz: 2, nameEn: "Sevlievo" },
  { name: "Карлово", country: "България", lat: 42.6433, lng: 24.8058, tz: 2, nameEn: "Karlovo" },
  { name: "Ботевград", country: "България", lat: 42.9075, lng: 23.7933, tz: 2, nameEn: "Botevgrad" },
  { name: "Троян", country: "България", lat: 42.8944, lng: 24.7144, tz: 2, nameEn: "Troyan" },
  { name: "Гоце Делчев", country: "България", lat: 41.5714, lng: 23.7289, tz: 2, nameEn: "Gotse Delchev" },
  { name: "Поморие", country: "България", lat: 42.5589, lng: 27.6431, tz: 2, nameEn: "Pomorie" },
  { name: "Несебър", country: "България", lat: 42.6583, lng: 27.7361, tz: 2, nameEn: "Nessebar" },
  { name: "Созопол", country: "България", lat: 42.4175, lng: 27.6953, tz: 2, nameEn: "Sozopol" },
  { name: "Банско", country: "България", lat: 41.8383, lng: 23.4886, tz: 2, nameEn: "Bansko" },
  { name: "Разлог", country: "България", lat: 41.8864, lng: 23.4672, tz: 2, nameEn: "Razlog" },
  { name: "Балчик", country: "България", lat: 43.4072, lng: 28.1639, tz: 2, nameEn: "Balchik" },
  { name: "Каварна", country: "България", lat: 43.4356, lng: 28.3389, tz: 2, nameEn: "Kavarna" },
  { name: "Панагюрище", country: "България", lat: 42.5056, lng: 24.1864, tz: 2, nameEn: "Panagyurishte" },
  { name: "Пещера", country: "България", lat: 42.0333, lng: 24.3000, tz: 2, nameEn: "Peshtera" },
  { name: "Белоградчик", country: "България", lat: 43.6267, lng: 22.6833, tz: 2, nameEn: "Belogradchik" },

  // Световни градове & Столици
  { name: "Лондон", country: "Великобритания", lat: 51.5074, lng: -0.1278, tz: 0, nameEn: "London" },
  { name: "Париж", country: "Франция", lat: 48.8566, lng: 2.3522, tz: 1, nameEn: "Paris" },
  { name: "Берлин", country: "Германия", lat: 52.5200, lng: 13.4050, tz: 1, nameEn: "Berlin" },
  { name: "Рим", country: "Италия", lat: 41.9028, lng: 12.4964, tz: 1, nameEn: "Rome" },
  { name: "Мадрид", country: "Испания", lat: 40.4168, lng: -3.7038, tz: 1, nameEn: "Madrid" },
  { name: "Виена", country: "Австрия", lat: 48.2082, lng: 16.3738, tz: 1, nameEn: "Vienna" },
  { name: "Атина", country: "Гърция", lat: 37.9838, lng: 23.7275, tz: 2, nameEn: "Athens" },
  { name: "Истанбул", country: "Турция", lat: 41.0082, lng: 28.9784, tz: 3, nameEn: "Istanbul" },
  { name: "Букурещ", country: "Румъния", lat: 44.4268, lng: 26.1025, tz: 2, nameEn: "Bucharest" },
  { name: "Белград", country: "Сърбия", lat: 44.7866, lng: 20.4489, tz: 1, nameEn: "Belgrade" },
  { name: "Скопие", country: "Северна Македония", lat: 41.9981, lng: 21.4254, tz: 1, nameEn: "Skopje" },
  { name: "Прага", country: "Чехия", lat: 50.0755, lng: 14.4378, tz: 1, nameEn: "Prague" },
  { name: "Варшава", country: "Полша", lat: 52.2297, lng: 21.0122, tz: 1, nameEn: "Warsaw" },
  { name: "Амстердам", country: "Нидерландия", lat: 52.3676, lng: 4.9041, tz: 1, nameEn: "Amsterdam" },
  { name: "Брюксел", country: "Белгия", lat: 50.8503, lng: 4.3517, tz: 1, nameEn: "Brussels" },
  { name: "Цюрих", country: "Швейцария", lat: 47.3769, lng: 8.5417, tz: 1, nameEn: "Zurich" },
  { name: "Ню Йорк", country: "САЩ", lat: 40.7128, lng: -74.0060, tz: -5, nameEn: "New York" },
  { name: "Лос Анджелис", country: "САЩ", lat: 34.0522, lng: -118.2437, tz: -8, nameEn: "Los Angeles" },
  { name: "Чикаго", country: "САЩ", lat: 41.8781, lng: -87.6298, tz: -6, nameEn: "Chicago" },
  { name: "Торонто", country: "Канада", lat: 43.6532, lng: -79.3832, tz: -5, nameEn: "Toronto" },
  { name: "Токио", country: "Япония", lat: 35.6762, lng: 139.6503, tz: 9, nameEn: "Tokyo" },
  { name: "Сидни", country: "Австралия", lat: -33.8688, lng: 151.2093, tz: 10, nameEn: "Sydney" },
  { name: "Дубай", country: "ОАЕ", lat: 25.2048, lng: 55.2708, tz: 4, nameEn: "Dubai" },
  { name: "Кайро", country: "Египет", lat: 30.0444, lng: 31.2357, tz: 2, nameEn: "Cairo" },
  { name: "Рио де Жанейро", country: "Бразилия", lat: -22.9068, lng: -43.1729, tz: -3, nameEn: "Rio de Janeiro" }
];

/**
 * Държави, които следват общото европейско правило за лятно часово време (EU DST):
 * последната неделя на Март (02:00 -> 03:00 местно зимно време) до
 * последната неделя на Октомври (03:00 -> 02:00 местно лятно време),
 * с преход точно в 01:00 UTC. Правилото е в сила от 1996 г. насам в целия ЕС
 * (България прилага същите дати от 1979 г., макар и с малко по-различна история преди 1996 г.).
 * Забележка: Турция спря да сменя часа през 2016 г. (остава постоянно UTC+3) и затова
 * умишлено НЕ е включена в списъка. САЩ/Канада/Австралия и др. следват различни
 * национални правила за лятно часово време, които не се изчисляват тук.
 */
const EU_DST_COUNTRIES = new Set([
  "България", "Румъния", "Гърция", // UTC+2 / UTC+3
  "Великобритания", "Франция", "Германия", "Италия", "Испания", "Австрия",
  "Сърбия", "Северна Македония", "Чехия", "Полша", "Нидерландия", "Белгия", "Швейцария" // UTC+0/+1 -> +1/+2
]);

/**
 * Намира деня (число от месеца) на последната неделя за дадени година и месец.
 * Използва UTC изчисления, за да избегне грешки, свързани с локалната часова зона на браузъра.
 */
function getLastSundayOfMonth(year, month) {
  // Последният ден от месеца: денят "0" на следващия месец в UTC.
  const lastDay = new Date(Date.UTC(year, month, 0));
  const weekday = lastDay.getUTCDay(); // 0 = неделя
  lastDay.setUTCDate(lastDay.getUTCDate() - weekday);
  return lastDay.getUTCDate();
}

/**
 * Точно изчисляване на часовото отместване (с коректно автоматично лятно часово време - DST).
 *
 * За България историята на смяната на часа минава през ТРИ различни правила
 * (потвърдени от множество независими източници - БТА, Уикипедия и др.):
 *  - 1979-1996: лятно време от последната неделя на Март (00:00) до последната
 *    неделя на СЕПТЕМВРИ (00:00) - НЕ октомври!
 *  - 1997-1998: от последната неделя на Март (03:00) до последната неделя на
 *    Октомври (03:00)
 *  - 1999 и насам: от последната неделя на Март (03:00) до последната неделя
 *    на Октомври (04:00) - днешното, ЕС-хармонизирано правило.
 * Старата логика прилагаше днешното правило (октомври) за всички години от 1979 г.
 * насам, което даваше грешен UTC offset за раждания между края на септември и
 * края на октомври през 1979-1996 г. (напр. 12 октомври 1993 г. е било вече
 * зимно време, не лятно).
 *
 * За другите европейски държави се прилага само хармонизираното ЕС правило
 * (в сила от 1996 г.) - по-ранна история за тях не се изчислява тук.
 *
 * @param {number} year
 * @param {number} month  1-12
 * @param {number} day    1-31
 * @param {number} baseTz Стандартното (зимно) UTC отместване на мястото
 * @param {string} country
 * @param {number} hour   Час по местно време (0-23), по подразбиране 12 (обед)
 * @param {number} minute Минути по местно време (0-59)
 */
function getAutoTimezoneOffset(year, month, day, baseTz = 2, country = "България", hour = 12, minute = 0) {
  const isBulgaria = country === "България";
  const observesEuDst = isBulgaria || EU_DST_COUNTRIES.has(country);

  if (!observesEuDst) return baseTz;

  const dstStartYear = isBulgaria ? 1979 : 1996;
  if (year < dstStartYear) return baseTz;

  const summerTz = baseTz + 1;
  const toComparable = (mo, da, hh, mi) => ((mo * 100 + da) * 100 + hh) * 100 + mi;
  const current = toComparable(month, day, hour, minute);

  const marchLastSunday = getLastSundayOfMonth(year, 3);

  let springLocalHour, autumnMonth, autumnLastSunday, autumnLocalHour;

  if (isBulgaria && year <= 1996) {
    // Ера 1: 1979-1996 - връщане на зимно време в последната неделя на СЕПТЕМВРИ, в 00:00 ч.
    springLocalHour = 0;
    autumnMonth = 9;
    autumnLastSunday = getLastSundayOfMonth(year, 9);
    autumnLocalHour = 0;
  } else if (isBulgaria && year <= 1998) {
    // Ера 2: 1997-1998 - преход в 03:00 ч., но все още само до последната неделя на Октомври в 03:00 ч.
    springLocalHour = 3;
    autumnMonth = 10;
    autumnLastSunday = getLastSundayOfMonth(year, 10);
    autumnLocalHour = 3;
  } else {
    // Ера 3: 1999 г. и насам - днешното ЕС-хармонизирано правило (важи и за останалите ЕС държави).
    // Преходът е точно в 01:00 UTC, което в местно зимно време отговаря на часа (01:00 + baseTz).
    springLocalHour = (1 + baseTz + 24) % 24;
    autumnMonth = 10;
    autumnLastSunday = getLastSundayOfMonth(year, 10);
    autumnLocalHour = (1 + baseTz + 1 + 24) % 24;
  }

  const springTransition = toComparable(3, marchLastSunday, springLocalHour, 0);
  const autumnTransition = toComparable(autumnMonth, autumnLastSunday, autumnLocalHour, 0);

  if (current >= springTransition && current < autumnTransition) {
    return summerTz;
  }
  return baseTz;
}
