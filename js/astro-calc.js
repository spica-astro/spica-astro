/**
 * Астрономически и Астрологичен Двигател (AstroCalc)
 * Изчислява Юлиански ден, звездно време, позиции на планетите, Асцендент, Домове и Аспекти.
 */

const ZODIAC_SIGNS = [
  { id: "aries", name: "Овен", symbol: "♈", element: "fire", modality: "cardinal", ruler: "Марс", color: "#FF5252" },
  { id: "taurus", name: "Телец", symbol: "♉", element: "earth", modality: "fixed", ruler: "Венера", color: "#66BB6A" },
  { id: "gemini", name: "Близнаци", symbol: "♊", element: "air", modality: "mutable", ruler: "Меркурий", color: "#FFEE58" },
  { id: "cancer", name: "Рак", symbol: "♋", element: "water", modality: "cardinal", ruler: "Луна", color: "#42A5F5" },
  { id: "leo", name: "Лъв", symbol: "♌", element: "fire", modality: "fixed", ruler: "Слънце", color: "#FFA726" },
  { id: "virgo", name: "Дева", symbol: "♍", element: "earth", modality: "mutable", ruler: "Меркурий", color: "#8D6E63" },
  { id: "libra", name: "Везни", symbol: "♎", element: "air", modality: "cardinal", ruler: "Венера", color: "#AB47BC" },
  { id: "scorpio", name: "Скорпион", symbol: "♏", element: "water", modality: "fixed", ruler: "Плутон / Марс", color: "#EC407A" },
  { id: "sagittarius", name: "Стрелец", symbol: "♐", element: "fire", modality: "mutable", ruler: "Юпитер", color: "#7E57C2" },
  { id: "capricorn", name: "Козирог", symbol: "♑", element: "earth", modality: "cardinal", ruler: "Сатурн", color: "#78909C" },
  { id: "aquarius", name: "Водолей", symbol: "♒", element: "air", modality: "fixed", ruler: "Уран / Сатурн", color: "#26C6DA" },
  { id: "pisces", name: "Риби", symbol: "♓", element: "water", modality: "mutable", ruler: "Нептун / Юпитер", color: "#29B6F6" }
];

const PLANETS_CONFIG = [
  { id: "sun", name: "Слънце", symbol: "☉", color: "#F59E0B", orb: 8, keywords: "Същност, Его, Воля, Жизнена сила" },
  { id: "moon", name: "Луна", symbol: "☽", color: "#E0E7FF", orb: 8, keywords: "Емоции, Подсъзнание, Интуиция, Майчинство" },
  { id: "mercury", name: "Меркурий", symbol: "☿", color: "#FCD34D", orb: 7, keywords: "Интелект, Общуване, Логика, Мисъл" },
  { id: "venus", name: "Венера", symbol: "♀", color: "#F472B6", orb: 7, keywords: "Любов, Хармония, Красота, Финанси" },
  { id: "mars", name: "Марс", symbol: "♂", color: "#EF4444", orb: 7, keywords: "Действие, Страст, Енергия, Амбиция" },
  { id: "jupiter", name: "Юпитер", symbol: "♃", color: "#A78BFA", orb: 6, keywords: "Експанзия, Късмет, Мъдрост, Философия" },
  { id: "saturn", name: "Сатурн", symbol: "♄", color: "#9CA3AF", orb: 6, keywords: "Дисциплина, Карма, Структура, Уроци" },
  { id: "uranus", name: "Уран", symbol: "♅", color: "#38BDF8", orb: 5, keywords: "Иновации, Свобода, Прозрение, Бунт" },
  { id: "neptune", name: "Нептун", symbol: "♆", color: "#818CF8", orb: 5, keywords: "Мечти, Духовност, Илюзии, Вдъхновение" },
  { id: "pluto", name: "Плутон", symbol: "♇", color: "#C084FC", orb: 5, keywords: "Трансформация, Сила, Прераждане, Дълбочина" },
  { id: "northnode", name: "Северен Възел (Раху)", symbol: "☊", color: "#FBBF24", orb: 4, keywords: "Кармичен път, Еволюция, Посока" },
  { id: "southnode", name: "Южен Възел (Кету)", symbol: "☋", color: "#F87171", orb: 4, keywords: "Минал опит, Вродени таланти, Зона на комфорт" },
  { id: "chiron", name: "Хирон", symbol: "⚷", color: "#34D399", orb: 4, keywords: "Раненият лечител, Изцеление, Мъдрост" },
  { id: "lilith", name: "Черна Луна (Лилит)", symbol: "⚸", color: "#FB7185", orb: 4, keywords: "Първична женственост, Сянка, Скрита страст" }
];

const ASPECT_TYPES = [
  { id: "conjunction", name: "Съвпад", angle: 0, orb: 8, type: "major", color: "#F59E0B", symbol: "☌", nature: "Неутрален / Силен" },
  { id: "sextile", name: "Секстил", angle: 60, orb: 6, type: "harmonious", color: "#10B981", symbol: "⚹", nature: "Хармоничен / Възможност" },
  { id: "square", name: "Квадратура", angle: 90, orb: 7, type: "tense", color: "#EF4444", symbol: "□", nature: "Предизвикателен / Растеж" },
  { id: "trine", name: "Тригон", angle: 120, orb: 8, type: "harmonious", color: "#3B82F6", symbol: "△", nature: "Много благоприятен / Талант" },
  { id: "quincunx", name: "Квинконс", angle: 150, orb: 3, type: "minor", color: "#8B5CF6", symbol: "⚻", nature: "Корекция / Адаптация" },
  { id: "opposition", name: "Опозиция", angle: 180, orb: 8, type: "tense", color: "#EC4899", symbol: "☍", nature: "Полярност / Осъзнаване" }
];

class AstroCalc {
  static degToRad(deg) {
    return (deg * Math.PI) / 180.0;
  }

  static radToDeg(rad) {
    return (rad * 180.0) / Math.PI;
  }

  static normDeg(deg) {
    if (isNaN(deg)) return 0;
    let d = deg % 360.0;
    if (d < 0) d += 360.0;
    return d;
  }

  /**
   * Превръща дата и час в Julian Day (JD)
   */
  static getJulianDate(year, month, day, hour = 0, minute = 0, second = 0, tzOffsetHours = 0) {
    let y = parseInt(year) || 2000;
    let m = parseInt(month) || 1;
    let d = parseInt(day) || 1;
    let h = parseFloat(hour) || 0;
    let min = parseFloat(minute) || 0;
    let tz = parseFloat(tzOffsetHours) || 0;

    if (m <= 2) {
      y -= 1;
      m += 12;
    }

    const decimalDay = d + (h - tz + min / 60.0 + second / 3600.0) / 24.0;
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);

    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + decimalDay + b - 1524.5;
    return jd;
  }

  static getGMST(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
    return this.normDeg(gmst);
  }

  static getObliquity(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    return 23.4392911 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T;
  }

  static solveKepler(M, e) {
    const Mrad = this.degToRad(M);
    let E = Mrad;
    let delta = 1;
    let iter = 0;
    while (Math.abs(delta) > 1e-7 && iter < 100) {
      delta = (E - e * Math.sin(E) - Mrad) / (1 - e * Math.cos(E));
      E -= delta;
      iter++;
    }
    return this.radToDeg(E);
  }

  static calcSun(T) {
    const L0 = this.normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    const M = this.normDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    const Mrad = this.degToRad(M);

    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
            + 0.000289 * Math.sin(3 * Mrad);

    const sunTrueLong = this.normDeg(L0 + C);

    // Реалното разстояние Земя-Слънце (в AU) - варира ±1.7% през годината заради
    // ексцентричността на земната орбита (~0.0167). По-рано тук се ползваше
    // ФИКСИРАНА константа (1.0000010178) за всяка дата, което даваше видима грешка
    // в геоцентричните позиции на близките планети (особено Венера, чиято позиция
    // е геометрично най-чувствителна към грешки в тази стойност).
    const earthEcc = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
    const v = M + C; // истинска аномалия на Слънцето
    const vRad = this.degToRad(v);
    const r = (1.000001018 * (1 - earthEcc * earthEcc)) / (1 + earthEcc * Math.cos(vRad));

    return { lon: sunTrueLong, speed: 0.9856, r };
  }

  static calcMoon(T) {
    const L_prime = this.normDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
    const D = this.normDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
    const M = this.normDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
    const M_prime = this.normDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
    const F = this.normDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T);

    const Drad = this.degToRad(D);
    const Mrad = this.degToRad(M);
    const Mp_rad = this.degToRad(M_prime);
    const Frad = this.degToRad(F);

    let lSum = 6.288774 * Math.sin(Mp_rad)
             + 1.274027 * Math.sin(2 * Drad - Mp_rad)
             + 0.658314 * Math.sin(2 * Drad)
             + 0.213618 * Math.sin(2 * Mp_rad)
             - 0.185116 * Math.sin(Mrad)
             - 0.114332 * Math.sin(2 * Frad)
             + 0.058793 * Math.sin(2 * Drad - 2 * Mp_rad)
             + 0.057066 * Math.sin(2 * Drad - Mrad - Mp_rad)
             + 0.053322 * Math.sin(2 * Drad + Mp_rad)
             + 0.045758 * Math.sin(2 * Drad - Mrad)
             - 0.040923 * Math.sin(Mrad - Mp_rad)
             - 0.034720 * Math.sin(Drad)
             - 0.030383 * Math.sin(Mrad + Mp_rad)
             + 0.015327 * Math.sin(2 * Drad - 2 * Frad);

    const moonLon = this.normDeg(L_prime + lSum);
    return { lon: moonLon, speed: 13.176 };
  }

  static calcPlanet(name, T, jd) {
    /**
     * Кеплерови елементи и техните темпове на промяна, спрямо средната еклиптика
     * и равноденствие на J2000, валидни за периода 1800-2050 г. Източник: E.M.
     * Standish & J.G. Williams (1992), "Orbital Ephemerides of the Sun, Moon and
     * Planets" - официалната таблица на NASA JPL Solar System Dynamics Group
     * (ssd.jpl.nasa.gov/planets/approx_pos.html, Table 1). Точността тук е от порядъка
     * на 15-40 ъглови секунди за вътрешните планети в рамките на този период -
     * значително по-прецизно от предишния набор стойности, който имаше грешка от
     * над 25 ъглови минути специфично за Венера заради неточен коефициент на
     * дължината на перихелия.
     */
    const elements = {
      mercury: { a: 0.38709927 + 0.00000037 * T, e: 0.20563593 + 0.00001906 * T, i: 7.00497902 - 0.00594749 * T, L: 252.25032350 + 149472.67411175 * T, w: 77.45779628 + 0.16047689 * T, node: 48.33076593 - 0.12534081 * T },
      venus:   { a: 0.72333566 + 0.00000390 * T, e: 0.00677672 - 0.00004107 * T, i: 3.39467605 - 0.00078890 * T, L: 181.97909950 + 58517.81538729 * T, w: 131.60246718 + 0.00268329 * T, node: 76.67984255 - 0.27769418 * T },
      mars:    { a: 1.52371034 + 0.00001847 * T, e: 0.09339410 + 0.00007882 * T, i: 1.84969142 - 0.00813131 * T, L: -4.55343205 + 19140.30268499 * T, w: -23.94362959 + 0.44441088 * T, node: 49.55953891 - 0.29257343 * T },
      jupiter: { a: 5.20288700 - 0.00011607 * T, e: 0.04838624 - 0.00013253 * T, i: 1.30439695 - 0.00183714 * T, L: 34.39644051 + 3034.74612775 * T, w: 14.72847983 + 0.21252668 * T, node: 100.47390909 + 0.20469106 * T },
      saturn:  { a: 9.53667594 - 0.00125060 * T, e: 0.05386179 - 0.00050991 * T, i: 2.48599187 + 0.00193609 * T, L: 49.95424423 + 1222.49362201 * T, w: 92.59887831 - 0.41897216 * T, node: 113.66242448 - 0.28867794 * T },
      uranus:  { a: 19.18916464 - 0.00196176 * T, e: 0.04725744 - 0.00004397 * T, i: 0.77263783 - 0.00242939 * T, L: 313.23810451 + 428.48202785 * T, w: 170.95427630 + 0.40805281 * T, node: 74.01692503 + 0.04240589 * T },
      neptune: { a: 30.06992276 + 0.00026291 * T, e: 0.00859048 + 0.00005105 * T, i: 1.77004347 + 0.00035372 * T, L: -55.12002969 + 218.45945325 * T, w: 44.96476227 - 0.32241464 * T, node: 131.78422574 - 0.00508664 * T },
      pluto:   { a: 39.48168677, e: 0.24880766 + 0.00006465 * T, i: 17.14175 + 0.003075 * T, L: 238.92881 + 145.20780 * T, w: 224.06676 - 0.04063 * T, node: 110.30347 - 0.01053 * T }
    };

    const el = elements[name];
    if (!el) return { lon: 0, isRetrograde: false };

    const M = this.normDeg(el.L - el.w);
    const E = this.solveKepler(M, el.e);
    const Erad = this.degToRad(E);

    const xv = el.a * (Math.cos(Erad) - el.e);
    const yv = el.a * (Math.sqrt(1.0 - el.e * el.e) * Math.sin(Erad));

    const v = this.normDeg(this.radToDeg(Math.atan2(yv, xv)));
    const r = Math.sqrt(xv * xv + yv * yv);

    const l_rad = this.degToRad(v + el.w);
    const i_rad = this.degToRad(el.i);
    const node_rad = this.degToRad(el.node);

    const xh = r * (Math.cos(node_rad) * Math.cos(l_rad - node_rad) - Math.sin(node_rad) * Math.sin(l_rad - node_rad) * Math.cos(i_rad));
    const yh = r * (Math.sin(node_rad) * Math.cos(l_rad - node_rad) + Math.cos(node_rad) * Math.sin(l_rad - node_rad) * Math.cos(i_rad));
    const zh = r * (Math.sin(l_rad - node_rad) * Math.sin(i_rad));

    const sun = this.calcSun(T);
    const earthSunDist = sun.r; // реалното разстояние Земя-Слънце за тази дата (вместо фиксирана константа)
    const earthLonRad = this.degToRad(sun.lon + 180);
    const xs = earthSunDist * Math.cos(earthLonRad);
    const ys = earthSunDist * Math.sin(earthLonRad);

    const xg = xh - xs;
    const yg = yh - ys;

    let geocentricLon = this.normDeg(this.radToDeg(Math.atan2(yg, xg)));

    const T_next = T + 0.01 / 36525.0;
    const M_next = this.normDeg(el.L + (el.L - (el.L - 100 * T)) * (0.01 / 36525.0) - el.w);
    const sun_next = this.calcSun(T_next);
    const xs_next = sun_next.r * Math.cos(this.degToRad(sun_next.lon + 180));
    const ys_next = sun_next.r * Math.sin(this.degToRad(sun_next.lon + 180));
    const xg_next = xh - xs_next;
    const yg_next = yh - ys_next;
    const geocentricLonNext = this.normDeg(this.radToDeg(Math.atan2(yg_next, xg_next)));

    let diff = geocentricLonNext - geocentricLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const isRetrograde = diff < 0;

    return { lon: geocentricLon, isRetrograde };
  }

  static calcLunarNodes(T) {
    const northNode = this.normDeg(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
    const southNode = this.normDeg(northNode + 180);
    return { northNode, southNode };
  }

  static calcChiron(T) {
    const L = this.normDeg(200.0 + 7.14 * (T * 100));
    const e = 0.383;
    const w = 339.6;
    const M = this.normDeg(L - w);
    const E = this.solveKepler(M, e);
    const Erad = this.degToRad(E);
    const xv = 13.7 * (Math.cos(Erad) - e);
    const yv = 13.7 * (Math.sqrt(1 - e * e) * Math.sin(Erad));
    const v = this.normDeg(this.radToDeg(Math.atan2(yv, xv)));
    const lon = this.normDeg(v + w);
    return { lon };
  }

  static calcLilith(T) {
    const lilithLon = this.normDeg(40.66 + 4069.0137 * T + 0.0103 * T * T);
    return { lon: lilithLon };
  }

  static calcHouses(jd, lat, lng, houseSystem = "placidus") {
    const gmst = this.getGMST(jd);
    const ramc = this.normDeg(gmst + (parseFloat(lng) || 23.32));
    const eps = this.getObliquity(jd);

    const ramcRad = this.degToRad(ramc);
    const epsRad = this.degToRad(eps);
    const latRad = this.degToRad(parseFloat(lat) || 42.7);

    // Medium Coeli (MC)
    let mc = this.radToDeg(Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad)));
    mc = this.normDeg(mc);
    if (Math.abs(mc - ramc) > 90 && Math.abs(mc - ramc) < 270) {
      mc = this.normDeg(mc + 180);
    }

    // Ascendant (ASC)
    const y = Math.cos(ramcRad);
    const x = - (Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
    let asc = this.radToDeg(Math.atan2(y, x));
    asc = this.normDeg(asc);

    const ic = this.normDeg(mc + 180);
    const dsc = this.normDeg(asc + 180);

    const cusps = [];

    if (houseSystem === "equal") {
      for (let i = 0; i < 12; i++) {
        cusps.push(this.normDeg(asc + i * 30));
      }
    } else {
      const h11 = this.normDeg(ramc + 30);
      const h12 = this.normDeg(ramc + 60);
      const h2 = this.normDeg(ramc + 120);
      const h3 = this.normDeg(ramc + 150);

      const cusp11 = this.calcPlacidusCusp(h11, lat, eps, 3);
      const cusp12 = this.calcPlacidusCusp(h12, lat, eps, 1.5);
      const cusp2  = this.calcPlacidusCusp(h2,  lat, eps, 1.5);
      const cusp3  = this.calcPlacidusCusp(h3,  lat, eps, 3);

      const house2 = isNaN(cusp2) ? this.normDeg(asc + 30) : cusp2;
      const house3 = isNaN(cusp3) ? this.normDeg(asc + 60) : cusp3;
      const house11 = isNaN(cusp11) ? this.normDeg(mc + 30) : cusp11;
      const house12 = isNaN(cusp12) ? this.normDeg(mc + 60) : cusp12;

      // В квадрантните домови системи (Плацидус, Кох и др.) противоположните домове
      // ВИНАГИ се различават с точно 180°: (1,7) (2,8) (3,9) (4,10) (5,11) (6,12).
      // Старата логика тук объркваше кои двойки са противоположни (напр. смяташе
      // дом 8 = дом 1 + 180°, което на практика го дублираше с дом 7/DSC), заради
      // което домовете излизаха разбъркани и се застъпваха по колелото.
      cusps[0] = asc;             // 1
      cusps[1] = house2;          // 2
      cusps[2] = house3;          // 3
      cusps[3] = ic;              // 4
      cusps[4] = this.normDeg(house11 + 180); // 5  (противоположен на 11)
      cusps[5] = this.normDeg(house12 + 180); // 6  (противоположен на 12)
      cusps[6] = dsc;              // 7  (противоположен на 1)
      cusps[7] = this.normDeg(house2 + 180);  // 8  (противоположен на 2)
      cusps[8] = this.normDeg(house3 + 180);  // 9  (противоположен на 3)
      cusps[9] = mc;               // 10 (противоположен на 4)
      cusps[10] = house11;         // 11
      cusps[11] = house12;         // 12
    }

    return { asc, mc, dsc, ic, cusps, ramc, obliquity: eps };
  }

  static calcPlacidusCusp(ramcTarget, lat, eps, factor) {
    const ramcRad = this.degToRad(ramcTarget);
    const epsRad = this.degToRad(eps);
    const latRad = this.degToRad(parseFloat(lat) || 42.7);
    const f = factor || 2.0;

    const y = Math.sin(ramcRad);
    const x = Math.cos(ramcRad) * Math.cos(epsRad) - Math.tan(latRad / f) * Math.sin(epsRad);
    let cusp = this.normDeg(this.radToDeg(Math.atan2(y, x)));
    return cusp;
  }

  static getZodiacPosition(lon) {
    const normalized = this.normDeg(lon);
    const signIndex = Math.min(11, Math.max(0, Math.floor(normalized / 30)));
    const sign = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
    const degreeInSign = normalized % 30;
    const deg = Math.floor(degreeInSign);
    const min = Math.floor((degreeInSign - deg) * 60);
    const sec = Math.floor((((degreeInSign - deg) * 60) - min) * 60);

    return {
      totalDegree: normalized,
      signIndex,
      signId: sign.id,
      signName: sign.name,
      signSymbol: sign.symbol,
      element: sign.element,
      modality: sign.modality,
      ruler: sign.ruler,
      color: sign.color,
      deg,
      min,
      sec,
      formatted: `${deg}° ${min.toString().padStart(2, '0')}' ${sign.name} ${sign.symbol}`
    };
  }

  static getHouseForLongitude(lon, cusps) {
    if (!cusps || cusps.length < 12) return 1;
    const pLon = this.normDeg(lon);
    for (let i = 0; i < 12; i++) {
      const c1 = cusps[i];
      const c2 = cusps[(i + 1) % 12];
      if (c1 <= c2) {
        if (pLon >= c1 && pLon < c2) return i + 1;
      } else {
        if (pLon >= c1 || pLon < c2) return i + 1;
      }
    }
    return 1;
  }

  static calcAspects(planets) {
    const aspects = [];
    const n = planets.length;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const p1 = planets[i];
        const p2 = planets[j];
        if (!p1 || !p2) continue;

        let diff = Math.abs(p1.totalDegree - p2.totalDegree);
        if (diff > 180) diff = 360 - diff;

        for (const aspectType of ASPECT_TYPES) {
          const maxOrb = Math.min(p1.orb || 6, p2.orb || 6, aspectType.orb);
          const orb = Math.abs(diff - aspectType.angle);

          if (orb <= maxOrb) {
            aspects.push({
              planet1: p1,
              planet2: p2,
              aspect: aspectType,
              angle: diff,
              orb: parseFloat(orb.toFixed(2)),
              isApplying: true
            });
            break;
          }
        }
      }
    }

    return aspects;
  }

  /**
   * Изчислява аспекти МЕЖДУ ДВА РАЗЛИЧНИ набора точки (напр. транзитни срещу натални
   * планети, или планетите на двама различни хора при синастрия). За разлика от
   * calcAspects (която сравнява всяка точка само с точките СЛЕД нея в един и същи
   * списък), тук се сравнява всяка точка от setA с ВСЯКА точка от setB.
   */
  static calcCrossAspects(setA, setB) {
    const aspects = [];
    for (const p1 of setA) {
      for (const p2 of setB) {
        if (!p1 || !p2) continue;

        let diff = Math.abs(p1.totalDegree - p2.totalDegree);
        if (diff > 180) diff = 360 - diff;

        for (const aspectType of ASPECT_TYPES) {
          const maxOrb = Math.min(p1.orb || 6, p2.orb || 6, aspectType.orb);
          const orb = Math.abs(diff - aspectType.angle);

          if (orb <= maxOrb) {
            aspects.push({
              planet1: p1,
              planet2: p2,
              aspect: aspectType,
              angle: diff,
              orb: parseFloat(orb.toFixed(2))
            });
            break;
          }
        }
      }
    }
    // Подреждаме по точност на орбиса (най-точните/силните аспекти най-отгоре).
    aspects.sort((a, b) => a.orb - b.orb);
    return aspects;
  }

  /**
   * Изчислява позициите на основните 10 планети (Слънце-Плутон) за даден Юлиански ден,
   * БЕЗ домове (домовете изискват географско местоположение, а за транзитен хороскоп
   * ни трябват само еклиптичните позиции "точно сега" - те са едни и same навсякъде по Земята).
   * Използва се за транзитен хороскоп.
   */
  static calcPlanetPositions(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    const sunData = this.calcSun(T);
    const moonData = this.calcMoon(T);

    const raw = [
      { id: "sun", ...this.getZodiacPosition(sunData.lon), orb: 8, isRetrograde: false },
      { id: "moon", ...this.getZodiacPosition(moonData.lon), orb: 8, isRetrograde: false },
      { id: "mercury", ...this.getZodiacPosition(this.calcPlanet("mercury", T, jd).lon), orb: 7, isRetrograde: this.calcPlanet("mercury", T, jd).isRetrograde },
      { id: "venus", ...this.getZodiacPosition(this.calcPlanet("venus", T, jd).lon), orb: 7, isRetrograde: this.calcPlanet("venus", T, jd).isRetrograde },
      { id: "mars", ...this.getZodiacPosition(this.calcPlanet("mars", T, jd).lon), orb: 7, isRetrograde: this.calcPlanet("mars", T, jd).isRetrograde },
      { id: "jupiter", ...this.getZodiacPosition(this.calcPlanet("jupiter", T, jd).lon), orb: 6, isRetrograde: this.calcPlanet("jupiter", T, jd).isRetrograde },
      { id: "saturn", ...this.getZodiacPosition(this.calcPlanet("saturn", T, jd).lon), orb: 6, isRetrograde: this.calcPlanet("saturn", T, jd).isRetrograde },
      { id: "uranus", ...this.getZodiacPosition(this.calcPlanet("uranus", T, jd).lon), orb: 5, isRetrograde: this.calcPlanet("uranus", T, jd).isRetrograde },
      { id: "neptune", ...this.getZodiacPosition(this.calcPlanet("neptune", T, jd).lon), orb: 5, isRetrograde: this.calcPlanet("neptune", T, jd).isRetrograde },
      { id: "pluto", ...this.getZodiacPosition(this.calcPlanet("pluto", T, jd).lon), orb: 5, isRetrograde: this.calcPlanet("pluto", T, jd).isRetrograde }
    ];

    return raw.map(p => {
      const cfg = PLANETS_CONFIG.find(c => c.id === p.id) || {};
      return { ...p, name: cfg.name || p.id, symbol: cfg.symbol || "•", planetColor: cfg.color || "#FCD34D", keywords: cfg.keywords || "" };
    });
  }

  static generateNatalChart(userData) {
    const { name, year, month, day, hour = 12, minute = 0, lat = 42.6977, lng = 23.3219, tz = 2, houseSystem = "placidus", cityName = "София" } = userData;

    const y = parseInt(year) || 1995;
    const m = parseInt(month) || 5;
    const d = parseInt(day) || 15;
    const h = parseInt(hour) || 12;
    const min = parseInt(minute) || 0;
    const latitude = parseFloat(lat) || 42.6977;
    const longitude = parseFloat(lng) || 23.3219;
    const timezone = parseFloat(tz) || 2;

    const jd = this.getJulianDate(y, m, d, h, min, 0, timezone);
    const T = (jd - 2451545.0) / 36525.0;

    const housesData = this.calcHouses(jd, latitude, longitude, houseSystem);

    const sunData = this.calcSun(T);
    const moonData = this.calcMoon(T);
    const nodes = this.calcLunarNodes(T);
    const chiron = this.calcChiron(T);
    const lilith = this.calcLilith(T);

    const calculatedPlanets = [
      { id: "sun", ...this.getZodiacPosition(sunData.lon), orb: 8, isRetrograde: false },
      { id: "moon", ...this.getZodiacPosition(moonData.lon), orb: 8, isRetrograde: false },
      { id: "mercury", ...this.getZodiacPosition(this.calcPlanet("mercury", T, jd).lon), orb: 7, isRetrograde: this.calcPlanet("mercury", T, jd).isRetrograde },
      { id: "venus", ...this.getZodiacPosition(this.calcPlanet("venus", T, jd).lon), orb: 7, isRetrograde: this.calcPlanet("venus", T, jd).isRetrograde },
      { id: "mars", ...this.getZodiacPosition(this.calcPlanet("mars", T, jd).lon), orb: 7, isRetrograde: this.calcPlanet("mars", T, jd).isRetrograde },
      { id: "jupiter", ...this.getZodiacPosition(this.calcPlanet("jupiter", T, jd).lon), orb: 6, isRetrograde: this.calcPlanet("jupiter", T, jd).isRetrograde },
      { id: "saturn", ...this.getZodiacPosition(this.calcPlanet("saturn", T, jd).lon), orb: 6, isRetrograde: this.calcPlanet("saturn", T, jd).isRetrograde },
      { id: "uranus", ...this.getZodiacPosition(this.calcPlanet("uranus", T, jd).lon), orb: 5, isRetrograde: this.calcPlanet("uranus", T, jd).isRetrograde },
      { id: "neptune", ...this.getZodiacPosition(this.calcPlanet("neptune", T, jd).lon), orb: 5, isRetrograde: this.calcPlanet("neptune", T, jd).isRetrograde },
      { id: "pluto", ...this.getZodiacPosition(this.calcPlanet("pluto", T, jd).lon), orb: 5, isRetrograde: this.calcPlanet("pluto", T, jd).isRetrograde },
      { id: "northnode", ...this.getZodiacPosition(nodes.northNode), orb: 4, isRetrograde: true },
      { id: "southnode", ...this.getZodiacPosition(nodes.southNode), orb: 4, isRetrograde: true },
      { id: "chiron", ...this.getZodiacPosition(chiron.lon), orb: 4, isRetrograde: false },
      { id: "lilith", ...this.getZodiacPosition(lilith.lon), orb: 4, isRetrograde: false }
    ];

    const planets = calculatedPlanets.map(p => {
      const cfg = PLANETS_CONFIG.find(c => c.id === p.id) || {};
      const house = this.getHouseForLongitude(p.totalDegree, housesData.cusps);
      return {
        ...p,
        name: cfg.name || p.id,
        symbol: cfg.symbol || "•",
        planetColor: cfg.color || "#FCD34D",
        keywords: cfg.keywords || "",
        house
      };
    });

    const asc = { id: "asc", name: "Асцендент (ASC)", symbol: "ASC", planetColor: "#10B981", ...this.getZodiacPosition(housesData.asc), house: 1 };
    const mc = { id: "mc", name: "Медиум Цели (MC)", symbol: "MC", planetColor: "#F59E0B", ...this.getZodiacPosition(housesData.mc), house: 10 };
    const dsc = { id: "dsc", name: "Десцендент (DSC)", symbol: "DSC", planetColor: "#94A3B8", ...this.getZodiacPosition(housesData.dsc), house: 7 };
    const ic = { id: "ic", name: "Имум Цели (IC)", symbol: "IC", planetColor: "#94A3B8", ...this.getZodiacPosition(housesData.ic), house: 4 };

    const pointsForAspects = [...planets, asc, mc];
    const aspects = this.calcAspects(pointsForAspects);

    const formattedHouses = housesData.cusps.map((cuspDeg, idx) => ({
      houseNumber: idx + 1,
      degree: cuspDeg,
      ...this.getZodiacPosition(cuspDeg)
    }));

    const elementsCount = { fire: 0, earth: 0, air: 0, water: 0 };
    const modalitiesCount = { cardinal: 0, fixed: 0, mutable: 0 };

    planets.forEach(p => {
      const weight = (p.id === 'sun' || p.id === 'moon') ? 2 : 1;
      if (elementsCount[p.element] !== undefined) elementsCount[p.element] += weight;
      if (modalitiesCount[p.modality] !== undefined) modalitiesCount[p.modality] += weight;
    });
    if (elementsCount[asc.element] !== undefined) elementsCount[asc.element] += 2;
    if (modalitiesCount[asc.modality] !== undefined) modalitiesCount[asc.modality] += 2;

    const totalWeight = Math.max(1, Object.values(elementsCount).reduce((a, b) => a + b, 0));

    const elementsPercent = {
      fire: Math.round((elementsCount.fire / totalWeight) * 100),
      earth: Math.round((elementsCount.earth / totalWeight) * 100),
      air: Math.round((elementsCount.air / totalWeight) * 100),
      water: Math.round((elementsCount.water / totalWeight) * 100)
    };

    const modalitiesPercent = {
      cardinal: Math.round((modalitiesCount.cardinal / totalWeight) * 100),
      fixed: Math.round((modalitiesCount.fixed / totalWeight) * 100),
      mutable: Math.round((modalitiesCount.mutable / totalWeight) * 100)
    };

    return {
      user: {
        name: name || "Търсач на звездите",
        birthDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        birthFormattedDate: `${d}.${m}.${y} г.`,
        birthTime: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
        cityName: cityName || "София",
        lat: latitude,
        lng: longitude,
        tz: timezone
      },
      jd,
      planets,
      angles: { asc, mc, dsc, ic },
      houses: formattedHouses,
      aspects,
      balance: {
        elements: elementsPercent,
        modalities: modalitiesPercent
      },
      houseSystem
    };
  }
}
