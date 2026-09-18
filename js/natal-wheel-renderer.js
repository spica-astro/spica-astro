/**
 * Интерактивен SVG рендерер за Натално Колело (Natal Chart Wheel)
 * Чертае зодиакален пръстен, 12 дома, планетни глифове и аспектни линии с интерактивен ховър.
 */

class NatalWheelRenderer {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.options = Object.assign({
      size: 700,
      center: 350,
      radiusOuter: 330,
      radiusZodiacInner: 275,
      radiusHousesInner: 215,
      radiusPlanets: 245,
      radiusAspects: 180,
      onPlanetClick: null,
      onPlanetHover: null
    }, options);

    this.chartData = null;
    this.aspectFilter = 'all'; // 'all', 'harmonious', 'tense', 'major'
  }

  setAspectFilter(filter) {
    this.aspectFilter = filter;
    if (this.chartData) {
      this.render(this.chartData);
    }
  }

  degToCanvasAngle(deg, ascDeg) {
    // В астрологията Асцендентът (ASC) се позиционира вляво (на 9 часа = 180°).
    // Зодиакът се движи обратно на часовниковата стрелка.
    let canvasAngle = 180 - (deg - ascDeg);
    canvasAngle = (canvasAngle % 360 + 360) % 360;
    return canvasAngle;
  }

  polarToCartesian(cx, cy, r, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 0) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    };
  }

  describeArc(x, y, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", radius, radius, 0, arcSweep, 0, end.x, end.y].join(" ");
  }

  describeDonutSegment(x, y, rInner, rOuter, startAngle, endAngle) {
    const p1 = this.polarToCartesian(x, y, rOuter, startAngle);
    const p2 = this.polarToCartesian(x, y, rOuter, endAngle);
    const p3 = this.polarToCartesian(x, y, rInner, endAngle);
    const p4 = this.polarToCartesian(x, y, rInner, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
  }

  render(chartData) {
    this.chartData = chartData;
    if (!this.container) return;

    const { size, center, radiusOuter, radiusZodiacInner, radiusHousesInner, radiusAspects } = this.options;
    const ascDeg = chartData.angles.asc.totalDegree;

    // Подготвяме SVG
    let svg = `
      <svg id="astro-natal-svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" class="natal-chart-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="center-nebula" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#2E2A5E" stop-opacity="0.95"/>
            <stop offset="60%" stop-color="#1E253A" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#12162A" stop-opacity="0.95"/>
          </radialGradient>
          <linearGradient id="gold-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FCD34D"/>
            <stop offset="50%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#D97706"/>
          </linearGradient>
        </defs>

        <!-- Фон на колелото -->
        <circle cx="${center}" cy="${center}" r="${radiusOuter}" fill="#1A2036" stroke="url(#gold-border)" stroke-width="2" />
        <circle cx="${center}" cy="${center}" r="${radiusAspects}" fill="url(#center-nebula)" stroke="#334155" stroke-width="1" />
    `;

    // 1. ЗОДИАКАЛЕН ПРЪСТЕН (12 знака x 30°)
    svg += `<g class="zodiac-ring">`;
    for (let i = 0; i < 12; i++) {
      const sign = ZODIAC_SIGNS[i];
      const signStartDeg = i * 30;
      const signEndDeg = (i + 1) * 30;

      const angle1 = this.degToCanvasAngle(signStartDeg, ascDeg);
      const angle2 = this.degToCanvasAngle(signEndDeg, ascDeg);

      // В canvas ъглите вървят по часовниковата стрелка
      const startA = Math.min(angle1, angle2);
      const endA = Math.max(angle1, angle2);

      const isEven = i % 2 === 0;
      const fillCol = isEven ? 'rgba(46, 42, 94, 0.4)' : 'rgba(30, 37, 58, 0.6)';

      const d = this.describeDonutSegment(center, center, radiusZodiacInner, radiusOuter, startA, endA);
      svg += `<path d="${d}" fill="${fillCol}" stroke="#2A354F" stroke-width="1" class="zodiac-segment" data-sign="${sign.name}" />`;

      // Зодиакален глиф и градуси в средата на сегмента
      const midZodiacDeg = signStartDeg + 15;
      const midAngle = this.degToCanvasAngle(midZodiacDeg, ascDeg);
      const glyphPos = this.polarToCartesian(center, center, (radiusOuter + radiusZodiacInner) / 2, midAngle);

      svg += `
        <text x="${glyphPos.x}" y="${glyphPos.y + 7}" text-anchor="middle" font-size="20" fill="${sign.color}" class="zodiac-symbol" font-family="'Cinzel Decorative', 'Cinzel', serif">
          ${sign.symbol}
        </text>
      `;

      // Разделителни линии и деления за градуси (на всеки 5 градуса)
      for (let g = 0; g < 30; g += 5) {
        const tickDeg = signStartDeg + g;
        const tickAngle = this.degToCanvasAngle(tickDeg, ascDeg);
        const tickInnerR = g === 0 ? radiusZodiacInner : radiusOuter - (g === 15 ? 10 : 6);
        const t1 = this.polarToCartesian(center, center, tickInnerR, tickAngle);
        const t2 = this.polarToCartesian(center, center, radiusOuter, tickAngle);
        const strokeW = g === 0 ? "1.5" : "0.75";
        const strokeC = g === 0 ? "#F59E0B" : "rgba(148, 163, 184, 0.4)";
        svg += `<line x1="${t1.x}" y1="${t1.y}" x2="${t2.x}" y2="${t2.y}" stroke="${strokeC}" stroke-width="${strokeW}" />`;
      }
    }
    svg += `</g>`;

    // 2. ДОМОВЕ (12 куспиди и номера)
    svg += `<g class="houses-layer">`;
    chartData.houses.forEach((house, idx) => {
      const houseDeg = house.degree;
      const canvasAngle = this.degToCanvasAngle(houseDeg, ascDeg);
      const pInner = this.polarToCartesian(center, center, radiusAspects, canvasAngle);
      const pOuter = this.polarToCartesian(center, center, radiusZodiacInner, canvasAngle);

      // Кардиналните оси (1 - ASC, 4 - IC, 7 - DSC, 10 - MC) са по-плътни
      const isAngleAxis = idx === 0 || idx === 3 || idx === 6 || idx === 9;
      const strokeCol = isAngleAxis ? '#F59E0B' : 'rgba(148, 163, 184, 0.35)';
      const strokeWidth = isAngleAxis ? '2' : '1';
      const strokeDash = isAngleAxis ? 'none' : '3,3';

      svg += `<line x1="${pInner.x}" y1="${pInner.y}" x2="${pOuter.x}" y2="${pOuter.y}" stroke="${strokeCol}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;

      // Номер на дома
      const nextHouseDeg = chartData.houses[(idx + 1) % 12].degree;
      let midHouseDeg = (houseDeg + nextHouseDeg) / 2;
      if (nextHouseDeg < houseDeg) midHouseDeg = (houseDeg + nextHouseDeg + 360) / 2;
      const houseNumAngle = this.degToCanvasAngle(midHouseDeg % 360, ascDeg);
      const numPos = this.polarToCartesian(center, center, (radiusHousesInner + radiusAspects) / 2 + 5, houseNumAngle);

      svg += `
        <text x="${numPos.x}" y="${numPos.y + 4}" text-anchor="middle" font-size="11" fill="#94A3B8" font-family="'Outfit', sans-serif" font-weight="600" class="house-number">
          ${idx + 1}
        </text>
      `;
    });
    svg += `</g>`;

    // 3. ОСИ: ASC - DSC и MC - IC
    const pAsc = this.polarToCartesian(center, center, radiusOuter + 10, this.degToCanvasAngle(chartData.angles.asc.totalDegree, ascDeg));
    const pDsc = this.polarToCartesian(center, center, radiusOuter + 10, this.degToCanvasAngle(chartData.angles.dsc.totalDegree, ascDeg));
    const pMc = this.polarToCartesian(center, center, radiusOuter + 10, this.degToCanvasAngle(chartData.angles.mc.totalDegree, ascDeg));
    const pIc = this.polarToCartesian(center, center, radiusOuter + 10, this.degToCanvasAngle(chartData.angles.ic.totalDegree, ascDeg));

    svg += `
      <g class="axes-labels">
        <!-- ASC -->
        <circle cx="${pAsc.x}" cy="${pAsc.y}" r="14" fill="#2E2A5E" stroke="#F59E0B" stroke-width="1.5" />
        <text x="${pAsc.x}" y="${pAsc.y + 4}" text-anchor="middle" font-size="10" fill="#FCD34D" font-weight="bold">ASC</text>

        <!-- DSC -->
        <circle cx="${pDsc.x}" cy="${pDsc.y}" r="14" fill="#2E2A5E" stroke="#94A3B8" stroke-width="1" />
        <text x="${pDsc.x}" y="${pDsc.y + 4}" text-anchor="middle" font-size="10" fill="#CBD5E1">DSC</text>

        <!-- MC -->
        <circle cx="${pMc.x}" cy="${pMc.y}" r="14" fill="#2E2A5E" stroke="#F59E0B" stroke-width="1.5" />
        <text x="${pMc.x}" y="${pMc.y + 4}" text-anchor="middle" font-size="10" fill="#FCD34D" font-weight="bold">MC</text>

        <!-- IC -->
        <circle cx="${pIc.x}" cy="${pIc.y}" r="14" fill="#2E2A5E" stroke="#94A3B8" stroke-width="1" />
        <text x="${pIc.x}" y="${pIc.y + 4}" text-anchor="middle" font-size="10" fill="#CBD5E1">IC</text>
      </g>
    `;

    // 4. АСПЕКТНИ ЛИНИИ (Вътрешен кръг)
    svg += `<g class="aspects-layer">`;
    const filteredAspects = chartData.aspects.filter(asp => {
      if (this.aspectFilter === 'harmonious') return asp.aspect.type === 'harmonious';
      if (this.aspectFilter === 'tense') return asp.aspect.type === 'tense';
      if (this.aspectFilter === 'major') return asp.aspect.type === 'major' || asp.aspect.type === 'harmonious' || asp.aspect.type === 'tense';
      return true;
    });

    filteredAspects.forEach((asp, idx) => {
      const a1 = this.degToCanvasAngle(asp.planet1.totalDegree, ascDeg);
      const a2 = this.degToCanvasAngle(asp.planet2.totalDegree, ascDeg);
      const pt1 = this.polarToCartesian(center, center, radiusAspects - 4, a1);
      const pt2 = this.polarToCartesian(center, center, radiusAspects - 4, a2);

      const strokeCol = asp.aspect.color || '#94A3B8';
      const strokeW = asp.orb <= 2 ? '2' : (asp.orb <= 4 ? '1.4' : '0.9');
      const opacity = Math.max(0.35, 1 - (asp.orb / 8));

      svg += `
        <line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}"
              stroke="${strokeCol}" stroke-width="${strokeW}" stroke-opacity="${opacity}"
              class="aspect-line aspect-type-${asp.aspect.id}"
              data-aspect-id="${idx}"
              data-tooltip="${asp.planet1.name} ${asp.aspect.symbol} ${asp.planet2.name} (${asp.aspect.name}, орбис ${asp.orb}°)" />
      `;
    });
    svg += `</g>`;

    // 5. ПЛАНЕТИ (Глифове с анти-колизия)
    svg += `<g class="planets-layer">`;
    // Подреждаме планетите по позиция
    const sortedPlanets = [...chartData.planets].sort((a, b) => a.totalDegree - b.totalDegree);

    // Анти-колизионен алгоритъм за струпвания на планети
    const planetPositions = [];
    sortedPlanets.forEach((planet, i) => {
      let r = this.options.radiusPlanets;
      const angle = this.degToCanvasAngle(planet.totalDegree, ascDeg);

      // Проверка за близост с предишни планети
      for (const prev of planetPositions) {
        let diff = Math.abs(angle - prev.angle);
        if (diff > 180) diff = 360 - diff;
        if (diff < 7) {
          r = prev.r === this.options.radiusPlanets ? this.options.radiusPlanets - 22 : this.options.radiusPlanets + 18;
        }
      }

      planetPositions.push({ planet, angle, r });
    });

    planetPositions.forEach(({ planet, angle, r }) => {
      const pos = this.polarToCartesian(center, center, r, angle);
      const tickPos = this.polarToCartesian(center, center, radiusZodiacInner - 2, angle);
      const retroSymbol = planet.isRetrograde ? '<tspan fill="#EF4444" font-size="10" font-weight="bold"> ℞</tspan>' : '';

      svg += `
        <!-- Линия маркер към зодиакалния знак -->
        <line x1="${pos.x}" y1="${pos.y}" x2="${tickPos.x}" y2="${tickPos.y}" stroke="rgba(203, 213, 225, 0.4)" stroke-width="0.8" />

        <!-- Планетен глиф -->
        <g class="planet-marker" data-planet-id="${planet.id}" data-planet-name="${planet.name}"
           data-tooltip="${planet.name} в ${planet.formatted} (${planet.house}-ти дом)${planet.isRetrograde ? ' [Ретрограден]' : ''}"
           style="cursor: pointer;">
          <circle cx="${pos.x}" cy="${pos.y}" r="14" fill="#1E253A" stroke="${planet.planetColor}" stroke-width="1.5" class="planet-circle" />
          <text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle" font-size="14" fill="${planet.planetColor}" font-weight="bold" font-family="'Cinzel Decorative', serif" class="planet-glyph">
            ${planet.symbol}
          </text>
          <text x="${pos.x}" y="${pos.y + 19}" text-anchor="middle" font-size="9" fill="#E2E8F0" font-family="'Outfit', sans-serif" font-weight="500">
            ${planet.deg}°${retroSymbol}
          </text>
        </g>
      `;
    });
    svg += `</g>`;

    // Край на SVG
    svg += `</svg>`;

    this.container.innerHTML = svg;
    this.attachEventListeners();
  }

  /**
   * СИНАСТРИЯ (Двойно Колело / Biwheel): чертае домовете и зодиака на Човек 1 като
   * основа (както в класическата астрологична практика), поставя планетите на Човек 1
   * във вътрешен пръстен (златен контур) и планетите на Човек 2 в отделен, по-външен
   * пръстен (розов контур), и свързва двата набора с реални изчислени аспектни линии
   * между тях - вместо суха текстова информация.
   */
  renderSynastry(dataA, dataB, crossAspects) {
    if (!this.container) return;
    this.chartData = null; // синастрията не ползва единичния tooltip/highlight механизъм

    const { size, center, radiusOuter, radiusZodiacInner, radiusAspects } = this.options;
    const radiusPersonA = this.options.radiusPlanets; // вътрешен пръстен = Човек 1 (базовата карта)
    const radiusPersonB = (radiusZodiacInner + radiusPersonA) / 2 + 10; // отделен, по-външен пръстен = Човек 2
    const ascDeg = dataA.angles.asc.totalDegree;

    const colorA = '#F59E0B'; // злато = Човек 1
    const colorB = '#EC4899'; // розово = Човек 2

    let svg = `
      <svg id="astro-synastry-svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" class="natal-chart-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="center-nebula-syn" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#2E2A5E" stop-opacity="0.95"/>
            <stop offset="60%" stop-color="#1E253A" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#12162A" stop-opacity="0.95"/>
          </radialGradient>
          <linearGradient id="gold-border-syn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FCD34D"/>
            <stop offset="50%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#D97706"/>
          </linearGradient>
        </defs>

        <circle cx="${center}" cy="${center}" r="${radiusOuter}" fill="#1A2036" stroke="url(#gold-border-syn)" stroke-width="2" />
        <circle cx="${center}" cy="${center}" r="${radiusAspects}" fill="url(#center-nebula-syn)" stroke="#334155" stroke-width="1" />
    `;

    // 1. ЗОДИАКАЛЕН ПРЪСТЕН (база: Човек 1)
    svg += `<g class="zodiac-ring">`;
    for (let i = 0; i < 12; i++) {
      const sign = ZODIAC_SIGNS[i];
      const signStartDeg = i * 30;
      const signEndDeg = (i + 1) * 30;
      const angle1 = this.degToCanvasAngle(signStartDeg, ascDeg);
      const angle2 = this.degToCanvasAngle(signEndDeg, ascDeg);
      const startA = Math.min(angle1, angle2);
      const endA = Math.max(angle1, angle2);
      const isEven = i % 2 === 0;
      const fillCol = isEven ? 'rgba(46, 42, 94, 0.4)' : 'rgba(30, 37, 58, 0.6)';
      const d = this.describeDonutSegment(center, center, radiusZodiacInner, radiusOuter, startA, endA);
      svg += `<path d="${d}" fill="${fillCol}" stroke="#2A354F" stroke-width="1" />`;

      const midZodiacDeg = signStartDeg + 15;
      const midAngle = this.degToCanvasAngle(midZodiacDeg, ascDeg);
      const glyphPos = this.polarToCartesian(center, center, (radiusOuter + radiusZodiacInner) / 2, midAngle);
      svg += `<text x="${glyphPos.x}" y="${glyphPos.y + 7}" text-anchor="middle" font-size="18" fill="${sign.color}" font-family="'Cinzel Decorative', 'Cinzel', serif">${sign.symbol}</text>`;
    }
    svg += `</g>`;

    // 2. ДОМОВЕ (база: Човек 1)
    svg += `<g class="houses-layer">`;
    dataA.houses.forEach((house, idx) => {
      const canvasAngle = this.degToCanvasAngle(house.degree, ascDeg);
      const pInner = this.polarToCartesian(center, center, radiusAspects, canvasAngle);
      const pOuter = this.polarToCartesian(center, center, radiusZodiacInner, canvasAngle);
      const isAngleAxis = idx === 0 || idx === 3 || idx === 6 || idx === 9;
      const strokeCol = isAngleAxis ? '#F59E0B' : 'rgba(148, 163, 184, 0.35)';
      const strokeWidth = isAngleAxis ? '2' : '1';
      const strokeDash = isAngleAxis ? 'none' : '3,3';
      svg += `<line x1="${pInner.x}" y1="${pInner.y}" x2="${pOuter.x}" y2="${pOuter.y}" stroke="${strokeCol}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;

      const nextHouseDeg = dataA.houses[(idx + 1) % 12].degree;
      let midHouseDeg = (house.degree + nextHouseDeg) / 2;
      if (nextHouseDeg < house.degree) midHouseDeg = (house.degree + nextHouseDeg + 360) / 2;
      const houseNumAngle = this.degToCanvasAngle(midHouseDeg % 360, ascDeg);
      const numPos = this.polarToCartesian(center, center, radiusAspects + 15, houseNumAngle);
      svg += `<text x="${numPos.x}" y="${numPos.y + 4}" text-anchor="middle" font-size="10" fill="#94A3B8" font-weight="600">${idx + 1}</text>`;
    });
    svg += `</g>`;

    // 3. Оси ASC/DSC/MC/IC (база: Човек 1)
    ['asc', 'dsc', 'mc', 'ic'].forEach(key => {
      const angle = this.degToCanvasAngle(dataA.angles[key].totalDegree, ascDeg);
      const p = this.polarToCartesian(center, center, radiusOuter + 10, angle);
      const isMain = key === 'asc' || key === 'mc';
      svg += `
        <circle cx="${p.x}" cy="${p.y}" r="13" fill="#2E2A5E" stroke="${isMain ? '#F59E0B' : '#94A3B8'}" stroke-width="${isMain ? 1.5 : 1}" />
        <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="9" fill="${isMain ? '#FCD34D' : '#CBD5E1'}" font-weight="bold">${key.toUpperCase()}</text>
      `;
    });

    // 4. Планети на Човек 1 (вътрешен пръстен, златен контур)
    const placeRing = (planets, baseRadius, ringColor) => {
      const sorted = [...planets].sort((a, b) => a.totalDegree - b.totalDegree);
      const positions = [];
      sorted.forEach(planet => {
        let r = baseRadius;
        const angle = this.degToCanvasAngle(planet.totalDegree, ascDeg);
        for (const prev of positions) {
          let diff = Math.abs(angle - prev.angle);
          if (diff > 180) diff = 360 - diff;
          if (diff < 8) {
            r = prev.r === baseRadius ? baseRadius - 20 : baseRadius + 16;
          }
        }
        positions.push({ planet, angle, r, ringColor });
      });
      return positions;
    };

    const mainPlanetsA = dataA.planets.filter(p => ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(p.id));
    const mainPlanetsB = dataB.planets.filter(p => ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(p.id));

    const posA = placeRing(mainPlanetsA, radiusPersonA, colorA);
    const posB = placeRing(mainPlanetsB, radiusPersonB, colorB);
    const posMap = {}; // за прикачване на аспектните линии по-долу

    const drawRing = (positions, personLabel) => {
      let g = `<g class="planets-layer">`;
      positions.forEach(({ planet, angle, r, ringColor }) => {
        const pos = this.polarToCartesian(center, center, r, angle);
        posMap[`${personLabel}_${planet.id}`] = pos;
        const retroSymbol = planet.isRetrograde ? '<tspan fill="#EF4444" font-size="9" font-weight="bold"> ℞</tspan>' : '';
        g += `
          <circle cx="${pos.x}" cy="${pos.y}" r="12" fill="#1E253A" stroke="${ringColor}" stroke-width="1.5" />
          <text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" font-size="12" fill="${planet.planetColor}" font-weight="bold" font-family="'Cinzel Decorative', serif">${planet.symbol}${retroSymbol}</text>
        `;
      });
      g += `</g>`;
      return g;
    };

    svg += drawRing(posA, 'A');
    svg += drawRing(posB, 'B');

    // 5. Аспектни линии между двете карти (показваме до 24 най-силни, за да остане четливо)
    svg += `<g class="synastry-aspects-layer">`;
    (crossAspects || []).slice(0, 24).forEach(asp => {
      const p1 = posMap[`A_${asp.planet1.id}`];
      const p2 = posMap[`B_${asp.planet2.id}`];
      if (!p1 || !p2) return;
      const strokeCol = asp.aspect.color || '#94A3B8';
      const opacity = Math.max(0.35, 1 - (asp.orb / (asp.aspect.orb || 8)));
      svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeCol}" stroke-width="1.1" stroke-opacity="${opacity}" stroke-dasharray="4,3" data-tooltip="${asp.planet1.name} ${asp.aspect.symbol} ${asp.planet2.name} (${asp.aspect.name}, орбис ${asp.orb}°)" class="synastry-aspect-line" />`;
    });
    svg += `</g>`;

    svg += `</svg>`;
    this.container.innerHTML = svg;
    this.attachSynastryTooltips();
  }

  attachSynastryTooltips() {
    const tooltipEl = document.getElementById('astro-tooltip');
    if (!tooltipEl) return;
    this.container.querySelectorAll('.synastry-aspect-line').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        el.setAttribute('stroke-width', '2.4');
        this.showTooltip(tooltipEl, e, el.getAttribute('data-tooltip'));
      });
      el.addEventListener('mousemove', (e) => this.moveTooltip(tooltipEl, e));
      el.addEventListener('mouseleave', () => {
        el.setAttribute('stroke-width', '1.1');
        this.hideTooltip(tooltipEl);
      });
    });
  }

  attachEventListeners() {
    const tooltipEl = document.getElementById('astro-tooltip');
    if (!tooltipEl) return;

    // Ховър върху планети
    const planetMarkers = this.container.querySelectorAll('.planet-marker');
    planetMarkers.forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const tipText = el.getAttribute('data-tooltip');
        const planetId = el.getAttribute('data-planet-id');
        this.highlightPlanetAspects(planetId);
        this.showTooltip(tooltipEl, e, tipText);
      });

      el.addEventListener('mousemove', (e) => {
        this.moveTooltip(tooltipEl, e);
      });

      el.addEventListener('mouseleave', () => {
        this.resetHighlights();
        this.hideTooltip(tooltipEl);
      });
    });

    // Ховър върху аспекти
    const aspectLines = this.container.querySelectorAll('.aspect-line');
    aspectLines.forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const tipText = el.getAttribute('data-tooltip');
        el.setAttribute('stroke-width', '3');
        this.showTooltip(tooltipEl, e, tipText);
      });

      el.addEventListener('mousemove', (e) => {
        this.moveTooltip(tooltipEl, e);
      });

      el.addEventListener('mouseleave', () => {
        el.setAttribute('stroke-width', '1.2');
        this.hideTooltip(tooltipEl);
      });
    });
  }

  highlightPlanetAspects(planetId) {
    if (!this.chartData) return;
    const aspectLines = this.container.querySelectorAll('.aspect-line');
    aspectLines.forEach((line, idx) => {
      const asp = this.chartData.aspects[idx];
      if (asp && (asp.planet1.id === planetId || asp.planet2.id === planetId)) {
        line.style.strokeOpacity = '1';
        line.style.strokeWidth = '2.5';
        line.classList.add('highlighted-aspect');
      } else {
        line.style.strokeOpacity = '0.1';
      }
    });
  }

  resetHighlights() {
    const aspectLines = this.container.querySelectorAll('.aspect-line');
    aspectLines.forEach(line => {
      line.style.strokeOpacity = '';
      line.style.strokeWidth = '';
      line.classList.remove('highlighted-aspect');
    });
  }

  showTooltip(tooltip, event, text) {
    tooltip.innerHTML = text;
    tooltip.style.display = 'block';
    this.moveTooltip(tooltip, event);
  }

  moveTooltip(tooltip, event) {
    tooltip.style.left = (event.pageX + 15) + 'px';
    tooltip.style.top = (event.pageY + 15) + 'px';
  }

  hideTooltip(tooltip) {
    tooltip.style.display = 'none';
  }
}
