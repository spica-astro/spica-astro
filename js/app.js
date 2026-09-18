/**
 * Главен скрипт на Spica Astro
 * Управлява звездния фон, формата за раждане, изчисленията, табовете, Лунния календар, Нумерологията и Пълния Доклад.
 */

let currentNatalData = null;
let natalWheelInstance = null;
let synastryWheelInstance = null;

// Инициализация при зареждане
document.addEventListener('DOMContentLoaded', () => {
  initSelectOptions();
  initStarfield();
  initCityAutocomplete();
  initPresetProfiles();
  initFormHandler();
  initTabs();
  initHeaderNavTabLinks();
  initSynastry();
  initDailyHoroscope();
  initTransitHoroscope();
  initArticles();
  initWheelFilters();
  initGotoCalculatorButton();
  initShareButton();
  initNewChartButton();
  renderMoonPhase(); // Лунният календар не зависи от лична натална карта - показва се веднага

  // Зареждаме данни само ако линкът съдържа споделени параметри (виж loadInitialData) -
  // при обикновено отваряне на сайта формата остава празна.
  loadInitialData();
});

/* --------------------------------------------------------------------------
   0. Попълване на падащите списъци за Ден, Час, Минути
   -------------------------------------------------------------------------- */

/**
 * Връща броя дни в даден месец/година (отчита коректно високосните години).
 * month: 1-12
 */
function getDaysInMonth(month, year) {
  const m = parseInt(month) || 1;
  // Ако годината още не е въведена коректно, ползваме безопасна невисокосна година,
  // за да не позволим "29" по подразбиране за Февруари, когато годината не е известна.
  const y = parseInt(year);
  const safeYear = !isNaN(y) && y > 0 ? y : 2001;
  return new Date(safeYear, m, 0).getDate();
}

/**
 * Преизчислява опциите на падащото меню за "Ден" спрямо избрания Месец/Година,
 * така че никога да не позволява невалидни дати (напр. 30 Февруари или 31 Април).
 * Запазва текущо избрания ден, ако все още е валиден за новия месец/година,
 * иначе го "прищипва" до последния валиден ден от месеца.
 */
function updateDayOptions(dayId = 'birth-day', monthId = 'birth-month', yearId = 'birth-year', fallbackDay = 13) {
  const daySelect = document.getElementById(dayId);
  const monthSelect = document.getElementById(monthId);
  const yearInput = document.getElementById(yearId);
  if (!daySelect || !monthSelect) return;

  const month = monthSelect.value;
  const year = yearInput ? yearInput.value : undefined;
  const maxDays = getDaysInMonth(month, year);

  const previousValue = parseInt(daySelect.value) || fallbackDay;
  const newValue = Math.min(previousValue, maxDays);

  let dayOptions = '';
  for (let d = 1; d <= maxDays; d++) {
    dayOptions += `<option value="${d}" ${d === newValue ? 'selected' : ''}>${d}</option>`;
  }
  daySelect.innerHTML = dayOptions;
  syncCustomDaySelect(dayId);
}

/**
 * Синхронизира визуалния "custom" избирател за Ден (бутон + падащ панел) с
 * реалния (скрит) <select>, така че падащото меню за дни ВИНАГИ да се отваря
 * надолу и да не прескача нагоре, както прави нативният <select> при 31 опции.
 */
function syncCustomDaySelect(dayId) {
  const daySelect = document.getElementById(dayId);
  const trigger = document.getElementById(dayId + '-trigger');
  const panel = document.getElementById(dayId + '-panel');
  if (!daySelect || !trigger || !panel) return;

  trigger.textContent = daySelect.value || (daySelect.options[0] ? daySelect.options[0].value : '');
  panel.innerHTML = Array.from(daySelect.options).map(opt =>
    `<div class="custom-select-option${opt.selected ? ' active' : ''}" data-value="${opt.value}">${opt.value}</div>`
  ).join('');
}

/**
 * Свързва бутона + падащия панел за избор на Ден с логиката за клик/избор.
 * Отваря се винаги надолу (позиционирано през CSS с top:100%), без изключение.
 */
function initCustomDaySelect(dayId) {
  const daySelect = document.getElementById(dayId);
  const trigger = document.getElementById(dayId + '-trigger');
  const panel = document.getElementById(dayId + '-panel');
  if (!daySelect || !trigger || !panel) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.style.display === 'block';
    document.querySelectorAll('.custom-select-panel').forEach(p => { p.style.display = 'none'; });
    panel.style.display = isOpen ? 'none' : 'block';
  });

  panel.addEventListener('click', (e) => {
    const opt = e.target.closest('.custom-select-option');
    if (!opt) return;
    daySelect.value = opt.dataset.value;
    daySelect.dispatchEvent(new Event('change'));
    syncCustomDaySelect(dayId);
    panel.style.display = 'none';
  });

  document.addEventListener('click', () => { panel.style.display = 'none'; });
}

function initSelectOptions() {
  const daySelect = document.getElementById('birth-day');
  const monthSelect = document.getElementById('birth-month');
  const yearInput = document.getElementById('birth-year');
  const hourSelect = document.getElementById('birth-hour');
  const minuteSelect = document.getElementById('birth-minute');
  const unknownCheckbox = document.getElementById('unknown-time-checkbox');

  if (daySelect) {
    // Първоначално попълване спрямо избрания по подразбиране месец/година,
    // а не фиксирани 31 дни за всеки месец.
    updateDayOptions();
    initCustomDaySelect('birth-day');
  }

  // При промяна на Месец или Година, преизчисляваме броя валидни дни
  // (напр. 30 дни за Април, 28/29 за Февруари спрямо високосна година).
  if (monthSelect) {
    monthSelect.addEventListener('change', updateDayOptions);
  }
  if (yearInput) {
    yearInput.addEventListener('input', updateDayOptions);
    yearInput.addEventListener('change', updateDayOptions);
  }

  if (hourSelect) {
    let hourOptions = '';
    for (let h = 0; h < 24; h++) {
      const formatted = String(h).padStart(2, '0');
      hourOptions += `<option value="${h}" ${h === 4 ? 'selected' : ''}>${formatted}:00 ч.</option>`;
    }
    hourSelect.innerHTML = hourOptions;
  }

  if (minuteSelect) {
    let minOptions = '';
    for (let m = 0; m < 60; m += 1) {
      const formatted = String(m).padStart(2, '0');
      minOptions += `<option value="${m}" ${m === 10 ? 'selected' : ''}>${formatted} мин.</option>`;
    }
    minuteSelect.innerHTML = minOptions;
  }

  if (unknownCheckbox) {
    unknownCheckbox.addEventListener('change', (e) => {
      const timeContainer = document.getElementById('time-inputs-container');
      if (e.target.checked) {
        hourSelect.value = "12";
        minuteSelect.value = "0";
        if (timeContainer) timeContainer.style.opacity = '0.4';
      } else {
        if (timeContainer) timeContainer.style.opacity = '1';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   1. Звезден Canvas фон с анимирани звезди и метеори
   -------------------------------------------------------------------------- */
function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const stars = [];
  const starCount = Math.min(180, Math.floor((width * height) / 8000));

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
      color: Math.random() > 0.3 ? '#FFF' : (Math.random() > 0.5 ? '#FCD34D' : '#C4B5FD')
    });
  }

  let meteor = null;
  function triggerMeteor() {
    meteor = {
      x: Math.random() * width * 0.7,
      y: Math.random() * height * 0.4,
      length: Math.random() * 90 + 40,
      speed: Math.random() * 12 + 8,
      angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
      alpha: 1
    };
    setTimeout(triggerMeteor, Math.random() * 8000 + 4000);
  }
  setTimeout(triggerMeteor, 3000);

  function animateStars() {
    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      star.alpha += star.speed;
      if (star.alpha > 1 || star.alpha < 0.2) star.speed = -star.speed;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
      ctx.fill();
    }

    if (meteor) {
      ctx.beginPath();
      const endX = meteor.x + Math.cos(meteor.angle) * meteor.length;
      const endY = meteor.y + Math.sin(meteor.angle) * meteor.length;
      const gradient = ctx.createLinearGradient(meteor.x, meteor.y, endX, endY);
      gradient.addColorStop(0, 'rgba(253, 230, 138, 0.8)');
      gradient.addColorStop(1, 'rgba(253, 230, 138, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      meteor.x += Math.cos(meteor.angle) * meteor.speed;
      meteor.y += Math.sin(meteor.angle) * meteor.speed;
      meteor.alpha -= 0.02;

      if (meteor.alpha <= 0 || meteor.x > width || meteor.y > height) {
        meteor = null;
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateStars);
  }

  animateStars();
}

/* --------------------------------------------------------------------------
   2. Търсене на градове и автодовършване
   -------------------------------------------------------------------------- */
function initCityAutocomplete() {
  const cityInput = document.getElementById('birth-city');
  const cityDropdown = document.getElementById('city-dropdown');
  const latInput = document.getElementById('birth-lat');
  const lngInput = document.getElementById('birth-lng');
  const tzInput = document.getElementById('birth-tz');

  if (!cityInput || !cityDropdown) return;

  function lookupCity(name) {
    if (!name) return null;
    const clean = name.trim().toLowerCase();
    return CITIES_DATA.find(c => 
      c.name.toLowerCase() === clean || 
      (c.nameEn && c.nameEn.toLowerCase() === clean) ||
      clean.startsWith(c.name.toLowerCase()) ||
      c.name.toLowerCase().startsWith(clean)
    );
  }

  cityInput.addEventListener('input', () => {
    const val = cityInput.value.trim().toLowerCase();
    if (val.length < 1) {
      cityDropdown.style.display = 'none';
      return;
    }

    const matches = CITIES_DATA.filter(c => 
      c.name.toLowerCase().includes(val) || 
      (c.nameEn && c.nameEn.toLowerCase().includes(val))
    ).slice(0, 8);

    if (matches.length === 0) {
      cityDropdown.style.display = 'none';
      return;
    }

    cityDropdown.innerHTML = matches.map(c => `
      <div class="city-option" data-lat="${c.lat}" data-lng="${c.lng}" data-tz="${c.tz}" data-name="${c.name}">
        <span><strong>${c.name}</strong> <span class="city-option-country">(${c.country})</span></span>
        <span class="city-option-country">Коорд: ${c.lat.toFixed(2)}°, ${c.lng.toFixed(2)}°</span>
      </div>
    `).join('');

    cityDropdown.style.display = 'block';

    const exact = lookupCity(cityInput.value);
    if (exact) {
      latInput.value = exact.lat;
      lngInput.value = exact.lng;
      tzInput.value = exact.tz;
    }
  });

  cityDropdown.addEventListener('click', (e) => {
    const option = e.target.closest('.city-option');
    if (!option) return;

    cityInput.value = option.dataset.name;
    latInput.value = option.dataset.lat;
    lngInput.value = option.dataset.lng;
    tzInput.value = option.dataset.tz;
    cityDropdown.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !cityDropdown.contains(e.target)) {
      cityDropdown.style.display = 'none';
    }
  });
}

/* --------------------------------------------------------------------------
   3. Примерни профили и URL Парсване
   -------------------------------------------------------------------------- */
function initPresetProfiles() {
  const presets = {
    now: () => {
      const now = new Date();
      return {
        name: "Сегашно Звездно Небе",
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        city: "София",
        lat: 42.6977,
        lng: 23.3219,
        tz: 3
      };
    },
    einstein: () => ({
      name: "Алберт Айнщайн",
      day: 14,
      month: 3,
      year: 1879,
      hour: 11,
      minute: 30,
      city: "Улм (Германия)",
      lat: 48.4011,
      lng: 9.9876,
      tz: 1
    }),
    tesla: () => ({
      name: "Никола Тесла",
      day: 10,
      month: 7,
      year: 1856,
      hour: 0,
      minute: 0,
      city: "Смилян (Хърватия)",
      lat: 44.5614,
      lng: 15.3189,
      tz: 1
    }),
    davinci: () => ({
      name: "Леонардо да Винчи",
      day: 15,
      month: 4,
      year: 1452,
      hour: 21,
      minute: 40,
      city: "Винчи (Италия)",
      lat: 43.7844,
      lng: 10.9255,
      tz: 1
    })
  };

  document.querySelectorAll('.profile-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const profileKey = chip.dataset.profile;
      if (presets[profileKey]) {
        const p = presets[profileKey]();
        fillForm(p);
        calculateAndDisplay();
      }
    });
  });
}

function fillForm(data) {
  if (data.name) document.getElementById('user-name').value = data.name;
  // Важно: първо задаваме Месец и Година, и едва след това преизчисляваме
  // валидните опции за Ден (spisъка се променя спрямо месеца/годината),
  // защото иначе стойността на деня може да бъде презаписана некоректно.
  if (data.month) document.getElementById('birth-month').value = data.month;
  if (data.year) document.getElementById('birth-year').value = data.year;
  updateDayOptions();
  if (data.day) document.getElementById('birth-day').value = data.day;
  syncCustomDaySelect('birth-day');
  if (data.hour !== undefined) document.getElementById('birth-hour').value = data.hour;
  if (data.minute !== undefined) document.getElementById('birth-minute').value = data.minute;
  if (data.city) document.getElementById('birth-city').value = data.city;
  if (data.lat) document.getElementById('birth-lat').value = data.lat;
  if (data.lng) document.getElementById('birth-lng').value = data.lng;
  if (data.tz) document.getElementById('birth-tz').value = data.tz;
}

/**
 * При отваряне на сайта БЕЗ параметри в линка (обикновен, "чист" посетител),
 * НЕ зареждаме никакви лични/демо данни автоматично и НЕ изчисляваме карта -
 * формата остава празна и резултатите скрити, докато потребителят сам не въведе
 * своите данни и не натисне бутона. Само при отваряне на СПОДЕЛЕН линк (създаден
 * през бутона "Копирай Линк", съдържащ ?name=&birthday=&birthplace=...) зареждаме
 * автоматично съответните данни от него.
 */
function loadInitialData() {
  const urlParams = new URLSearchParams(window.location.search);

  const nameParam = urlParams.get('name');
  const bdayParam = urlParams.get('birthday');
  const bplaceParam = urlParams.get('birthplace');
  const latParam = urlParams.get('latitude') || urlParams.get('lat');
  const lngParam = urlParams.get('longitude') || urlParams.get('lng');

  if (nameParam || bdayParam) {
    let day = 1, month = 1, year = 2000, hour = 12, minute = 0;
    if (bdayParam) {
      const parts = bdayParam.replace('T', ' ').split(' ');
      if (parts[0]) {
        const dParts = parts[0].split('-');
        year = parseInt(dParts[0]) || 2000;
        month = parseInt(dParts[1]) || 1;
        day = parseInt(dParts[2]) || 1;
      }
      if (parts[1]) {
        const tParts = parts[1].split(':');
        const hourParsed = parseInt(tParts[0]);
        hour = Number.isNaN(hourParsed) ? 12 : hourParsed;
        minute = parseInt(tParts[1]) || 0;
      }
    }

    let city = "София";
    if (bplaceParam) {
      city = bplaceParam.split(' - ')[0] || bplaceParam;
    }

    fillForm({
      name: nameParam ? decodeURIComponent(nameParam).trim() : "",
      day,
      month,
      year,
      hour,
      minute,
      city,
      lat: latParam ? parseFloat(latParam) : 42.6977,
      lng: lngParam ? parseFloat(lngParam) : 23.3219,
      tz: getAutoTimezoneOffset(year, month, day, 2, "България", hour, minute)
    });

    calculateAndDisplay();
  }
  // Ако няма параметри в линка - оставяме формата празна и не изчисляваме нищо.
}

/* --------------------------------------------------------------------------
   4. Форма и Изчисление
   -------------------------------------------------------------------------- */
function initFormHandler() {
  const form = document.getElementById('natal-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateAndDisplay();
    
    const resultsSec = document.getElementById('results-section');
    if (resultsSec) {
      resultsSec.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

function calculateAndDisplay() {
  const name = document.getElementById('user-name').value.trim();
  const day = parseInt(document.getElementById('birth-day').value) || 1;
  const month = parseInt(document.getElementById('birth-month').value) || 1;
  const year = parseInt(document.getElementById('birth-year').value) || 2000;
  const hourRaw = parseInt(document.getElementById('birth-hour').value);
  const hour = Number.isNaN(hourRaw) ? 12 : hourRaw;
  const minute = parseInt(document.getElementById('birth-minute').value) || 0;
  const cityName = document.getElementById('birth-city').value.trim() || "София";
  
  let lat = parseFloat(document.getElementById('birth-lat').value);
  let lng = parseFloat(document.getElementById('birth-lng').value);

  const matchedCity = CITIES_DATA.find(c => 
    c.name.toLowerCase() === cityName.toLowerCase() || 
    (c.nameEn && c.nameEn.toLowerCase() === cityName.toLowerCase()) ||
    cityName.toLowerCase().includes(c.name.toLowerCase()) ||
    c.name.toLowerCase().includes(cityName.toLowerCase())
  );

  let tz = getAutoTimezoneOffset(year, month, day, 2, "България", hour, minute);

  if (matchedCity) {
    lat = matchedCity.lat;
    lng = matchedCity.lng;
    tz = getAutoTimezoneOffset(year, month, day, matchedCity.tz, matchedCity.country, hour, minute);
  } else if (isNaN(lat) || isNaN(lng)) {
    lat = 42.6977;
    lng = 23.3219;
    tz = getAutoTimezoneOffset(year, month, day, 2, "България", hour, minute);
  }

  const houseSystem = document.getElementById('house-system') ? document.getElementById('house-system').value : "placidus";

  currentNatalData = AstroCalc.generateNatalChart({
    name,
    year,
    month,
    day,
    hour,
    minute,
    lat,
    lng,
    tz,
    cityName,
    houseSystem
  });

  renderResults(currentNatalData);
}

/* --------------------------------------------------------------------------
   5. Рендериране на резултатите
   -------------------------------------------------------------------------- */
function renderResults(data) {
  const resultsSec = document.getElementById('results-section');
  if (resultsSec) resultsSec.style.display = 'block';

  const chartHeaderBlock = document.getElementById('chart-header-block');
  if (chartHeaderBlock) chartHeaderBlock.style.display = 'block';

  // Ако потребителят е разглеждал таб, изискващ данни, преди да изчисли карта,
  // съобщението "Все още нямаш изчислена карта" е блокирало показването на панела.
  // Сега, след като вече има данни, презактивираме текущо избрания таб, за да се
  // покаже реалното му съдържание вместо съобщението.
  const activeTabBtn = document.querySelector('.tab-btn.active');
  if (activeTabBtn && activeTabBtn.dataset.tab) {
    activateTab(activeTabBtn.dataset.tab);
  }

  // 0. Заглавие и банер
  const nameEl = document.getElementById('chart-owner-name');
  if (nameEl) nameEl.textContent = `Натална Карта на ${data.user.name}`;

  const metaEl = document.getElementById('chart-meta-info');
  if (metaEl) {
    metaEl.textContent = `Рождени данни: ${data.user.birthFormattedDate}, ${data.user.birthTime} ч. | ${data.user.cityName} (UTC+${data.user.tz}, ${data.user.lat.toFixed(2)}°N, ${data.user.lng.toFixed(2)}°E)`;
  }

  const bannerText = document.getElementById('banner-text');
  if (bannerText) {
    bannerText.textContent = `✨ Наталната карта за ${data.user.name} (${data.user.birthFormattedDate}, ${data.user.cityName}) е успешно изчислена!`;
  }

  // 1. Голямата Тройка
  renderBigThree(data);

  // 1b. Информационно каре над колелото
  renderChartInfoBox(data);

  // 2. Интерактивно колело
  if (!natalWheelInstance) {
    natalWheelInstance = new NatalWheelRenderer('natal-wheel-container');
  }
  natalWheelInstance.render(data);

  // 3. Планети и Домове
  renderPlanetsTable(data);
  renderHousesTable(data);
  renderPlanetSignInterpretations(data);
  renderHouseSignInterpretations(data);
  renderHouseAxesSection(data);

  // 4. Аспекти
  renderAspectsSection(data);

  // 5. Стихии и Модалности
  renderBalance(data);

  // 6. Лунен Календар
  renderMoonPhase();

  // 6b. Реални Лични Транзити (спрямо текущата дата)
  renderPersonalTransits(data);

  // 7. Нумерология
  renderNumerology(data);

  // 8. Пълен Доклад
  renderFullReport(data);
}

/**
 * Преобразува десетична географска координата в градуси-минути формат
 * (напр. 41.7434 -> "41°N45'"), както се показва в професионалните
 * астрологични софтуери.
 */
function formatCoordDM(decimalValue, positiveLetter, negativeLetter) {
  const letter = decimalValue >= 0 ? positiveLetter : negativeLetter;
  const abs = Math.abs(decimalValue);
  const degrees = Math.floor(abs);
  const minutes = Math.round((abs - degrees) * 60);
  return `${degrees}°${letter}${minutes}'`;
}

/**
 * Информационно каре над колелото с всички рождени данни на един поглед -
 * дата, точен час, UTC еквивалент, локация, координати, зодиак и система на домовете.
 */
function renderChartInfoBox(data) {
  const box = document.getElementById('natal-wheel-info-box');
  if (!box) return;

  const [y, m, d] = data.user.birthDate.split('-').map(Number);
  const [hh, mm] = data.user.birthTime.split(':').map(Number);

  // Изчисляваме еквивалентното Универсално време (UTC) от локалното време и часовата зона.
  let utcHour = hh - data.user.tz;
  let utcDay = d;
  if (utcHour < 0) { utcHour += 24; utcDay -= 1; }
  if (utcHour >= 24) { utcHour -= 24; utcDay += 1; }
  const utcTimeStr = `${String(utcHour).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

  const monthNames = ["Януари","Февруари","Март","Април","Май","Юни","Юли","Август","Септември","Октомври","Ноември","Декември"];
  const tzSign = data.user.tz >= 0 ? '+' : '';
  const latDM = formatCoordDM(data.user.lat, 'N', 'S');
  const lngDM = formatCoordDM(data.user.lng, 'E', 'W');
  const houseSystemLabel = data.houseSystem === 'placidus' ? 'Плацидус' : data.houseSystem;

  box.innerHTML = `
    <strong class="chart-info-title">Данни за наталната карта на ${data.user.name}</strong>
    <p class="info-row">${d} ${monthNames[m - 1]} ${y} г. в ${data.user.birthTime} ч. (часова зона = UTC ${tzSign}${data.user.tz})</p>
    <p class="info-row">Универсално време / по Гринуич (UTC): ${utcTimeStr}</p>
    <p class="info-row">${data.user.cityName}</p>
    <p class="info-row">${latDM} ${lngDM}</p>
    <p class="info-row">Тропически зодиак</p>
    <p class="info-row">${houseSystemLabel} Домове</p>
  `;
}

function renderBigThree(data) {
  const sun = data.planets.find(p => p.id === 'sun') || data.planets[0];
  const moon = data.planets.find(p => p.id === 'moon') || data.planets[1];
  const asc = data.angles.asc;

  const sunInterp = (ASTRO_INTERPRETATIONS.sun && ASTRO_INTERPRETATIONS.sun[sun.signId]) || {};
  const moonInterp = (ASTRO_INTERPRETATIONS.moon && ASTRO_INTERPRETATIONS.moon[moon.signId]) || {};
  const ascInterp = (ASTRO_INTERPRETATIONS.asc && ASTRO_INTERPRETATIONS.asc[asc.signId]) || {};

  // Sun
  const sunSignEl = document.getElementById('sun-sign-name');
  const sunDegEl = document.getElementById('sun-degree');
  const sunDescEl = document.getElementById('sun-desc');
  if (sunSignEl) sunSignEl.textContent = `${sun.signName} ${sun.signSymbol}`;
  if (sunDegEl) sunDegEl.textContent = `${sun.deg}° ${sun.min}' (${sun.house}-ти дом)`;
  if (sunDescEl) sunDescEl.textContent = sunInterp.summary || "Творчески център на вашата личност.";

  // Moon
  const moonSignEl = document.getElementById('moon-sign-name');
  const moonDegEl = document.getElementById('moon-degree');
  const moonDescEl = document.getElementById('moon-desc');
  if (moonSignEl) moonSignEl.textContent = `${moon.signName} ${moon.signSymbol}`;
  if (moonDegEl) moonDegEl.textContent = `${moon.deg}° ${moon.min}' (${moon.house}-ти дом)`;
  if (moonDescEl) moonDescEl.textContent = moonInterp.summary || "Емоционален свят и подсъзнание.";

  // ASC
  const ascSignEl = document.getElementById('asc-sign-name');
  const ascDegEl = document.getElementById('asc-degree');
  const ascDescEl = document.getElementById('asc-desc');
  if (ascSignEl) ascSignEl.textContent = `${asc.signName} ${asc.signSymbol}`;
  if (ascDegEl) ascDegEl.textContent = `${asc.deg}° ${asc.min}' (1-ви дом)`;
  if (ascDescEl) ascDescEl.textContent = ascInterp.summary || "Първо впечатление и житейски път.";
}

function renderPlanetsTable(data) {
  const tbody = document.getElementById('planets-table-body');
  if (!tbody) return;

  tbody.innerHTML = data.planets.map(p => {
    const retroBadge = p.isRetrograde ? '<span style="color:#EF4444; font-weight:bold; margin-left:4px;" title="Ретроградна планета">℞</span>' : '';

    return `
      <tr>
        <td>
          <span style="color:${p.planetColor}; font-size:1.15rem; margin-right:6px; font-weight:bold;">${p.symbol}</span>
          <strong>${p.name}</strong> ${retroBadge}
        </td>
        <td>
          <span style="color:${p.color}; font-size:1.05rem; margin-right:4px;">${p.signSymbol}</span>
          ${p.signName} ${p.deg}°${String(p.min).padStart(2, '0')}'
        </td>
        <td><strong style="color:var(--accent-gold-light);">${p.house}</strong></td>
      </tr>`;
  }).join('') + `
      <tr>
        <td><span style="color:#10B981; font-size:1.15rem; margin-right:6px; font-weight:bold;">ASC</span><strong>Асцендент</strong></td>
        <td><span style="margin-right:4px;">${data.angles.asc.signSymbol}</span>${data.angles.asc.signName} ${data.angles.asc.deg}°${String(data.angles.asc.min).padStart(2, '0')}'</td>
        <td><strong style="color:var(--accent-gold-light);">1</strong></td>
      </tr>
      <tr>
        <td><span style="color:#F59E0B; font-size:1.15rem; margin-right:6px; font-weight:bold;">MC</span><strong>Медиум Цели</strong></td>
        <td><span style="margin-right:4px;">${data.angles.mc.signSymbol}</span>${data.angles.mc.signName} ${data.angles.mc.deg}°${String(data.angles.mc.min).padStart(2, '0')}'</td>
        <td><strong style="color:var(--accent-gold-light);">10</strong></td>
      </tr>`;
}

/**
 * Чиста таблица с домовите върхове (кой знак пада на кой дом) - по подобие на
 * класическите астрологични софтуери, отделно от таблицата с планетите.
 */
function renderHousesTable(data) {
  const tbody = document.getElementById('houses-table-body');
  if (!tbody) return;

  tbody.innerHTML = data.houses.map(h => `
      <tr>
        <td><strong style="color:var(--accent-gold-light);">${h.houseNumber}</strong></td>
        <td><span style="margin-right:4px;">${h.signSymbol}</span>${h.signName} ${h.deg}°${String(h.min).padStart(2, '0')}'</td>
      </tr>`).join('');
}

/**
 * Генерира персонализирано описание "X-ти дом в Y знак" - комбинира основното
 * значение на дома (какво управлява) с "аромата" на знака (стихия+модалност),
 * за да обясни КАК точно се преживяват темите на този дом за конкретния човек -
 * вместо само да изброи домовете като голи факти.
 */
function generateHouseInSignText(houseNumber, sign) {
  const houseDesc = ASTRO_INTERPRETATIONS.houses[houseNumber] || '';
  const houseCore = houseDesc.includes(':') ? houseDesc.split(':').slice(1).join(':').trim() : houseDesc;
  const elementPhrase = ELEMENT_FLAVOR[sign.element] || '';
  const modalityPhrase = MODALITY_FLAVOR[sign.modality] || '';
  return `${houseCore} Тъй като върхът на дома пада в ${sign.name}, тези теми при теб се преживяват през ${elementPhrase}, ${modalityPhrase}.`;
}

/**
 * Показва тълкувание на Асцендента (богат, ръчно написан текст) и на всички
 * останали 11 домови върха (комбинаторно генериран текст) - отговаря директно
 * на въпроса "какво означава Асцендент в Лъв" / "4-ти дом в Скорпион" и т.н.
 */
/**
 * Показва тълкувание "Планета в Знак" за всяка планета - четлив размер шрифт
 * (не тесен като стара версия), с изрично отбелязано достойнство (владение/
 * екзалтация/изгнание/падение), когато има такова - точно отговаря на въпроса
 * "какво означава Марс в Скорпион, на трона си ли е".
 */
function renderPlanetSignInterpretations(data) {
  const container = document.getElementById('planet-signs-interpretations');
  if (!container || typeof generatePlanetInSignText !== 'function') return;

  container.innerHTML = data.planets.map(p => {
    const signObj = { id: p.signId, name: p.signName, element: p.element, modality: p.modality };
    const text = generatePlanetInSignText(p, signObj);
    const dignity = (typeof getPlanetDignity === 'function') ? getPlanetDignity(p.id, p.signId) : null;
    const highlightColor = dignity === 'domicile' || dignity === 'exaltation' ? '#10B981' : (dignity ? '#EF4444' : 'var(--border-glass)');
    const retroBadge = p.isRetrograde ? ' <span style="color:#EF4444; font-weight:bold;" title="Ретроградна планета">℞</span>' : '';

    return `
      <div style="border-left:4px solid ${highlightColor}; padding:12px 16px; background:rgba(245,158,11,0.03); border-radius:8px;">
        <h4 style="margin:0 0 6px; color:${p.planetColor}; font-size:0.98rem;">${p.symbol} ${p.name} в ${p.signSymbol} ${p.signName}${retroBadge} <span style="color:var(--text-muted); font-weight:normal; font-size:0.82rem;">(${p.house}-ти дом)</span></h4>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin:0; line-height:1.65;">${text}</p>
      </div>`;
  }).join('');
}

function renderHouseSignInterpretations(data) {
  const container = document.getElementById('house-signs-interpretations');
  if (!container) return;

  const asc = data.angles.asc;
  const ascInterp = (ASTRO_INTERPRETATIONS.asc && ASTRO_INTERPRETATIONS.asc[asc.signId]) || {};

  let html = `
    <div style="border-left:4px solid #10B981; padding:12px 16px; background:rgba(16,185,129,0.06); border-radius:8px;">
      <h4 style="margin:0 0 6px; color:#10B981; font-size:1rem;">🌅 ${ascInterp.title || `Асцендент в ${asc.signName}`}</h4>
      <p style="font-size:0.88rem; color:var(--text-secondary); margin:0; line-height:1.6;">${ascInterp.summary || `Първото впечатление и начинът, по който тръгвате напред в живота, са оцветени от ${asc.signName}.`}</p>
    </div>`;

  for (let houseNum = 2; houseNum <= 12; houseNum++) {
    const house = data.houses[houseNum - 1];
    const signObj = { name: house.signName, element: house.element, modality: house.modality };
    const text = generateHouseInSignText(houseNum, signObj);
    const isMC = houseNum === 10;
    html += `
      <div style="border-left:4px solid ${isMC ? '#F59E0B' : 'var(--border-glass)'}; padding:12px 16px; background:rgba(245,158,11,0.03); border-radius:8px;">
        <h4 style="margin:0 0 6px; color:var(--accent-gold-light); font-size:0.95rem;">${isMC ? '🏔️ ' : ''}${houseNum}-ти дом в ${house.signSymbol} ${house.signName}</h4>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin:0; line-height:1.6;">${text}</p>
      </div>`;
  }

  container.innerHTML = html;
}

/**
 * "Домовете по двойки" — за всяка от шестте оси (1-7, 2-8, 3-9, 4-10, 5-11, 6-12)
 * обяснява ЗАЩО се случват нещата по определен начин в живота на човека,
 * не просто изрежда голи факти. Персонализира общия философски текст с
 * конкретните знаци и планети в двата дома на всяка ос за тази карта.
 */
function renderHouseAxesSection(data) {
  const introEl = document.getElementById('house-axes-intro');
  const container = document.getElementById('house-axes-container');
  if (!introEl || !container || typeof HOUSE_AXES === 'undefined') return;

  introEl.textContent = HOUSE_AXES_INTRO;

  const listPlanets = (arr) => arr.length
    ? arr.map(p => `${p.symbol} ${p.name}`).join(', ')
    : 'няма планета тук — домът говори по-тихо, само през знака си';

  container.innerHTML = HOUSE_AXES.map(axis => {
    const [hA, hB] = axis.houses;
    const houseA = data.houses[hA - 1];
    const houseB = data.houses[hB - 1];
    const planetsA = data.planets.filter(p => p.house === hA);
    const planetsB = data.planets.filter(p => p.house === hB);

    return `
      <div class="sidebar-card" style="border-left: 4px solid var(--accent-gold);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
          <h4 style="margin:0; color:var(--accent-gold-light); font-size:1.05rem;">${axis.symbol} ${axis.title}</h4>
          <span style="font-size:0.78rem; color:var(--text-muted);">${axis.subtitle}</span>
        </div>
        <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin-bottom:12px;">${axis.essay}</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:0.82rem;">
          <div style="background:rgba(245,158,11,0.06); border-radius:8px; padding:10px 12px;">
            <strong style="color:var(--text-primary);">${hA}-ти дом: ${houseA.signSymbol} ${houseA.signName}</strong>
            <div style="color:var(--text-muted); margin-top:4px;">${listPlanets(planetsA)}</div>
          </div>
          <div style="background:rgba(245,158,11,0.06); border-radius:8px; padding:10px 12px;">
            <strong style="color:var(--text-primary);">${hB}-ти дом: ${houseB.signSymbol} ${houseB.signName}</strong>
            <div style="color:var(--text-muted); margin-top:4px;">${listPlanets(planetsB)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAspectsSection(data) {
  const container = document.getElementById('aspects-list-container');
  if (!container) return;

  if (!data.aspects || data.aspects.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); padding:1rem;">Няма намерени мажорни аспекти в зададените орбиси.</p>`;
    return;
  }

  container.innerHTML = data.aspects.map(asp => {
    const p1 = asp.planet1;
    const p2 = asp.planet2;
    const interpKey = `${p1.id}_${p2.id}`;
    const reverseInterpKey = `${p2.id}_${p1.id}`;
    let interpText = "";

    if (ASTRO_INTERPRETATIONS.aspects && ASTRO_INTERPRETATIONS.aspects[interpKey] && ASTRO_INTERPRETATIONS.aspects[interpKey][asp.aspect.id]) {
      interpText = ASTRO_INTERPRETATIONS.aspects[interpKey][asp.aspect.id];
    } else if (ASTRO_INTERPRETATIONS.aspects && ASTRO_INTERPRETATIONS.aspects[reverseInterpKey] && ASTRO_INTERPRETATIONS.aspects[reverseInterpKey][asp.aspect.id]) {
      interpText = ASTRO_INTERPRETATIONS.aspects[reverseInterpKey][asp.aspect.id];
    } else {
      interpText = generateNatalAspectText(p1, p2, asp.aspect);
    }

    return `
      <div class="sidebar-card" style="margin-bottom:14px; border-left: 4px solid ${asp.aspect.color};">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="margin:0; font-size:1rem; color:var(--text-primary);">
            <span style="color:${p1.planetColor || '#FFF'};">${p1.symbol || ''} ${p1.name}</span>
            <span style="color:${asp.aspect.color}; margin:0 6px; font-weight:bold;">${asp.aspect.symbol} ${asp.aspect.name}</span>
            <span style="color:${p2.planetColor || '#FFF'};">${p2.symbol || ''} ${p2.name}</span>
          </h4>
          <span style="font-size:0.8rem; color:var(--accent-gold-light); background:rgba(245,158,11,0.1); padding:2px 8px; border-radius:10px;">
            орбис ${asp.orb}°
          </span>
        </div>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin:0;">${interpText}</p>
      </div>
    `;
  }).join('');
}

/* --------------------------------------------------------------------------
   4b. Реален Транзитен Хороскоп (текущи планети спрямо личната натална карта)
   -------------------------------------------------------------------------- */

/**
 * Генерира богато, персонализирано тълкувание на НАТАЛЕН аспект - комбинира
 * знаците на двете планети, достойнството им там (владение/екзалтация/
 * изгнание/падение), природата на аспекта и ключовите им думи. За разлика
 * от статичен текст, всяка комбинация от планета+знак+аспект дава различен
 * резултат - точно каквото беше поискано: "Марс в Скорпион е на трона си,
 * това дава аспекти на..." вместо еднакъв текст за всеки аспект.
 */
/**
 * Родов член ("този"/"тази") за имената на аспектите на български -
 * "Квадратура" и "Опозиция" са от женски род, останалите от мъжки.
 */
const ASPECT_GENDER_ARTICLE = {
  conjunction: "този",
  sextile: "този",
  square: "тази",
  trine: "този",
  quincunx: "този",
  opposition: "тази"
};

/**
 * Асцендентът/MC нямат статичен списък ключови думи (за разлика от истинските
 * планети) - тук са резервни думи за тях, за да не остават празни в текста.
 */
const ANGLE_KEYWORDS = {
  asc: "Първо впечатление, инстинкт, начин на тръгване напред",
  mc: "Кариера, репутация, обществено призвание",
  dsc: "Партньорство, огледало в другия",
  ic: "Корен, семейство, вътрешна основа"
};

function getKeywordsFor(point) {
  return point.keywords || ANGLE_KEYWORDS[point.id] || "личната му тема";
}

function generateNatalAspectText(p1, p2, aspect) {
  const intro = getAspectNatureIntro(aspect);
  const dign1 = (typeof getPlanetDignity === 'function') ? getPlanetDignity(p1.id, p1.signId) : null;
  const dign2 = (typeof getPlanetDignity === 'function') ? getPlanetDignity(p2.id, p2.signId) : null;
  const dignNote1 = (dign1 && typeof DIGNITY_INFO !== 'undefined') ? `, ${DIGNITY_INFO[dign1].label}` : '';
  const dignNote2 = (dign2 && typeof DIGNITY_INFO !== 'undefined') ? `, ${DIGNITY_INFO[dign2].label}` : '';
  const article = ASPECT_GENDER_ARTICLE[aspect.id] || 'този';

  const kw1 = getKeywordsFor(p1);
  const kw2 = getKeywordsFor(p2);

  let dignitySentence = '';
  if (dign1 && typeof DIGNITY_INFO !== 'undefined') {
    dignitySentence += ` ${p1.name} тук е ${DIGNITY_INFO[dign1].label}, което засилва пряко влиянието на този аспект.`;
  }
  if (dign2 && typeof DIGNITY_INFO !== 'undefined') {
    dignitySentence += ` ${p2.name} тук е ${DIGNITY_INFO[dign2].label}, което също оставя своя отпечатък.`;
  }

  return `${p1.symbol} ${p1.name} в ${p1.signName}${dignNote1} ${aspect.symbol} ${p2.symbol} ${p2.name} в ${p2.signName}${dignNote2}: ${article} ${aspect.name.toLowerCase()} ${intro}. Темата на <em>${kw1}</em> (${p1.name}) се среща с <em>${kw2}</em> (${p2.name}), оцветена през призмата на ${p1.signName} и ${p2.signName}.${dignitySentence}`;
}

/**
 * Генерира кратко, но смислено тълкувание на аспект между две точки, базирано
 * на реалната природа на аспекта (хармоничен/напрегнат/мажорен/минорен) и
 * ключовите думи на двете планети/точки. Използва се както за транзити, така
 * и за синастрия, вместо статичен твърд текст.
 */
function getAspectNatureIntro(aspect) {
  switch (aspect.type) {
    case 'harmonious': return 'носи лекота и естествен, подкрепящ поток на енергията';
    case 'tense': return 'създава напрежение и триене, които обаче тласкат към растеж и промяна';
    case 'minor': return 'изисква фина адаптация и малки корекции в поведението';
    default: return 'е мощна точка на сливане и засилен фокус';
  }
}

function generateGenericAspectText(pointA, pointB, aspect) {
  const intro = getAspectNatureIntro(aspect);
  const kwA = pointA.keywords || '';
  const kwB = pointB.keywords || '';
  const themes = (kwA && kwB) ? ` Теми в игра: <em>${kwA}</em> среща <em>${kwB}</em>.` : '';
  return `${aspect.symbol} ${aspect.name} ${intro}.${themes}`;
}

/**
 * Изчислява позициите на планетите ("небето точно сега") за дадена дата, на обед
 * UTC като представителен момент за деня — достатъчно за дневен транзитен хороскоп.
 */
function computeTransitsForDate(dateObj) {
  const jd = AstroCalc.getJulianDate(
    dateObj.getUTCFullYear(), dateObj.getUTCMonth() + 1, dateObj.getUTCDate(),
    12, 0, 0, 0
  );
  return AstroCalc.calcPlanetPositions(jd);
}

/**
 * Рендерира "Твоите Лични Транзити" — сравнява днешните (или избрани от потребителя)
 * реални позиции на планетите с НЕГОВАТА конкретна натална карта, вместо общ текст
 * по слънчев знак. Това е истински, изчислен хороскоп, а не статичен placeholder.
 */
function renderPersonalTransits(natalData) {
  const card = document.getElementById('personal-transits-card');
  const dateInput = document.getElementById('transit-date-input');
  if (!card || !natalData) return;

  card.style.display = 'block';

  const dateVal = (dateInput && dateInput.value) ? new Date(dateInput.value + 'T12:00:00Z') : new Date();
  const transits = computeTransitsForDate(dateVal);
  const natalPoints = [...natalData.planets, natalData.angles.asc, natalData.angles.mc];
  const crossAspects = AstroCalc.calcCrossAspects(transits, natalPoints);

  const transitMoon = transits.find(p => p.id === 'moon');
  const moonHighlightEl = document.getElementById('transit-moon-highlight');
  if (moonHighlightEl && transitMoon) {
    moonHighlightEl.innerHTML = `
      <div style="background:rgba(129,140,248,0.1); border-left:4px solid #818CF8; border-radius:8px; padding:12px 16px;">
        <strong style="color:#818CF8;">${transitMoon.symbol} Луната днес е в ${transitMoon.signName}</strong>
        <span style="color:var(--text-secondary); font-size:0.9rem;"> — емоционалният климат на деня е оцветен от ${(transitMoon.keywords || '').toLowerCase()}.</span>
      </div>`;
  }

  const listEl = document.getElementById('transit-aspects-list');
  if (!listEl) return;

  if (crossAspects.length === 0) {
    listEl.innerHTML = `<p style="color:var(--text-muted); padding:1rem;">Няма активни мажорни транзитни аспекти в зададените орбиси за тази дата.</p>`;
    return;
  }

  // Показваме до 12-те най-точни (най-тесен орбис = най-силен) аспекта, за да не претрупваме.
  listEl.innerHTML = crossAspects.slice(0, 12).map(asp => {
    const t = asp.planet1; // транзитна планета
    const n = asp.planet2; // натална точка
    const text = generateGenericAspectText(t, n, asp.aspect);
    return `
      <div class="sidebar-card" style="margin-bottom:10px; border-left:4px solid ${asp.aspect.color}; padding:12px 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
          <h4 style="margin:0; font-size:0.95rem; color:var(--text-primary);">
            <span style="color:${t.planetColor};">Транзитен ${t.symbol} ${t.name}</span>
            <span style="color:${asp.aspect.color}; margin:0 4px; font-weight:bold;">${asp.aspect.symbol} ${asp.aspect.name}</span>
            <span style="color:${n.planetColor || '#FFF'};">твоят натален ${n.symbol || ''} ${n.name}</span>
          </h4>
          <span style="font-size:0.75rem; color:var(--accent-gold-light); background:rgba(245,158,11,0.1); padding:2px 8px; border-radius:10px;">орбис ${asp.orb}°</span>
        </div>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">${text}</p>
      </div>`;
  }).join('');
}

function initTransitHoroscope() {
  const dateInput = document.getElementById('transit-date-input');
  const refreshBtn = document.getElementById('btn-refresh-transits');

  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (currentNatalData) renderPersonalTransits(currentNatalData);
    });
  }
}

function renderBalance(data) {
  const { elements, modalities } = data.balance;

  const elConfig = [
    { id: 'fire', name: 'Огън (Страст и Енергия)', val: elements.fire, col: '#F59E0B' },
    { id: 'earth', name: 'Земя (Практичност и Стабилност)', val: elements.earth, col: '#10B981' },
    { id: 'air', name: 'Въздух (Интелект и Общуване)', val: elements.air, col: '#818CF8' },
    { id: 'water', name: 'Вода (Емоции и Интуиция)', val: elements.water, col: '#38BDF8' }
  ];

  const elementsContainer = document.getElementById('elements-balance-bars');
  if (elementsContainer) {
    elementsContainer.innerHTML = elConfig.map(e => `
      <div class="progress-bar-group">
        <div class="progress-label">
          <span>${e.name}</span>
          <strong>${e.val}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${e.val}%; background: ${e.col};"></div>
        </div>
      </div>
    `).join('');
  }

  const modConfig = [
    { id: 'cardinal', name: 'Кардинални (Инициатива)', val: modalities.cardinal, col: '#EC4899' },
    { id: 'fixed', name: 'Неподвижни (Устойчивост)', val: modalities.fixed, col: '#F59E0B' },
    { id: 'mutable', name: 'Подвижни (Адаптивност)', val: modalities.mutable, col: '#06B6D4' }
  ];

  const modContainer = document.getElementById('modalities-balance-bars');
  if (modContainer) {
    modContainer.innerHTML = modConfig.map(m => `
      <div class="progress-bar-group">
        <div class="progress-label">
          <span>${m.name}</span>
          <strong>${m.val}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${m.val}%; background: ${m.col};"></div>
        </div>
      </div>
    `).join('');
  }
}

/* --------------------------------------------------------------------------
   6. Лунен Календар
   -------------------------------------------------------------------------- */
function renderMoonPhase() {
  if (typeof MoonCalc === 'undefined') return;
  const moon = MoonCalc.getMoonPhase(new Date());

  const symEl = document.getElementById('moon-phase-symbol');
  const nameEl = document.getElementById('moon-phase-name');
  const descEl = document.getElementById('moon-phase-desc');
  const illEl = document.getElementById('moon-illumination');
  const ageEl = document.getElementById('moon-age-text');
  const signEl = document.getElementById('moon-transit-sign');

  if (symEl) symEl.textContent = moon.phaseSymbol;
  if (nameEl) nameEl.textContent = moon.phaseName;
  if (descEl) descEl.textContent = moon.phaseDescription;
  if (illEl) illEl.textContent = `${moon.illumination}%`;
  if (ageEl) ageEl.textContent = `Възраст на Луната: ${moon.ageInDays} дни от новолунието`;
  if (signEl) signEl.textContent = `${moon.moonSign.symbol} Луна в ${moon.moonSign.name}`;

  const bTip = document.getElementById('moon-beauty-tip');
  const hTip = document.getElementById('moon-health-tip');
  const gTip = document.getElementById('moon-garden-tip');

  if (bTip) bTip.innerHTML = moon.tips.beauty;
  if (hTip) hTip.innerHTML = moon.tips.health;
  if (gTip) gTip.innerHTML = moon.tips.garden;
}

/* --------------------------------------------------------------------------
   7. Нумерология
   -------------------------------------------------------------------------- */
function renderNumerology(data) {
  if (typeof NumerologyCalc === 'undefined') return;
  const [y, m, d] = data.user.birthDate.split('-').map(Number);
  
  const lifePath = NumerologyCalc.getLifePathNumber(d, m, y);
  const personalYear = NumerologyCalc.getPersonalYear(d, m, new Date().getFullYear());
  const destiny = NumerologyCalc.getDestinyNumber(data.user.name);

  // Life Path
  const lpBadge = document.getElementById('num-lifepath-badge');
  const lpTitle = document.getElementById('num-lifepath-title');
  const lpSum = document.getElementById('num-lifepath-summary');
  if (lpBadge) {
    lpBadge.textContent = lifePath.number;
    lpBadge.style.borderColor = lifePath.color;
    lpBadge.style.color = lifePath.color;
  }
  if (lpTitle) lpTitle.textContent = lifePath.title;
  if (lpSum) lpSum.textContent = lifePath.summary;

  // Personal Year
  const pyBadge = document.getElementById('num-personalyear-badge');
  const pyDesc = document.getElementById('num-personalyear-desc');
  if (pyBadge) pyBadge.textContent = personalYear.number;
  if (pyDesc) pyDesc.textContent = personalYear.description;

  // Destiny Number
  const destBadge = document.getElementById('num-destiny-badge');
  const destDesc = document.getElementById('num-destiny-desc');
  if (destBadge) destBadge.textContent = destiny.number;
  if (destDesc) destDesc.textContent = destiny.meaning;
}

/* --------------------------------------------------------------------------
   8. Пълен Доклад (Report)
   -------------------------------------------------------------------------- */
function renderFullReport(data) {
  const container = document.getElementById('report-full-content');
  const titleHeader = document.getElementById('report-user-title');
  const metaHeader = document.getElementById('report-meta-header');

  if (titleHeader) titleHeader.textContent = `Астрологичен Доклад за ${data.user.name}`;
  if (metaHeader) metaHeader.textContent = `Рождена дата: ${data.user.birthFormattedDate}, ${data.user.birthTime} ч. | ${data.user.cityName}`;

  if (!container) return;

  const sun = data.planets.find(p => p.id === 'sun') || data.planets[0];
  const moon = data.planets.find(p => p.id === 'moon') || data.planets[1];
  const asc = data.angles.asc;

  const [y, m, d] = data.user.birthDate.split('-').map(Number);
  const lifePath = NumerologyCalc.getLifePathNumber(d, m, y);

  container.innerHTML = `
    <div>
      <h3 style="color:var(--accent-gold-light); margin-bottom:8px;">1. Въведение & Космически Портрет</h3>
      <p>В мига на вашето раждане в ${data.user.cityName}, звездите и планетите образуват уникален енергиен печат, който задава вашите вродени таланти, емоционални стремежи и житейски път.</p>
    </div>

    <div style="background:rgba(30,37,58,0.6); padding:16px; border-radius:12px; border-left:4px solid #F59E0B;">
      <h4 style="color:#F59E0B; margin-bottom:6px;">☀️ Слънце в ${sun.signName} (${sun.deg}° ${sun.min}', ${sun.house}-ти дом)</h4>
      <p>${(ASTRO_INTERPRETATIONS.sun[sun.signId] && ASTRO_INTERPRETATIONS.sun[sun.signId].summary) || ""}</p>
    </div>

    <div style="background:rgba(30,37,58,0.6); padding:16px; border-radius:12px; border-left:4px solid #818CF8;">
      <h4 style="color:#818CF8; margin-bottom:6px;">🌙 Луна в ${moon.signName} (${moon.deg}° ${moon.min}', ${moon.house}-ти дом)</h4>
      <p>${(ASTRO_INTERPRETATIONS.moon[moon.signId] && ASTRO_INTERPRETATIONS.moon[moon.signId].summary) || ""}</p>
    </div>

    <div style="background:rgba(30,37,58,0.6); padding:16px; border-radius:12px; border-left:4px solid #34D399;">
      <h4 style="color:#34D399; margin-bottom:6px;">🌅 Асцендент в ${asc.signName} (${asc.deg}° ${asc.min}')</h4>
      <p>${(ASTRO_INTERPRETATIONS.asc[asc.signId] && ASTRO_INTERPRETATIONS.asc[asc.signId].summary) || ""}</p>
    </div>

    <div style="background:rgba(30,37,58,0.6); padding:16px; border-radius:12px; border-left:4px solid #EC4899;">
      <h4 style="color:#EC4899; margin-bottom:6px;">🔢 Нумерологичен Път: Число ${lifePath.number} (${lifePath.title})</h4>
      <p>${lifePath.summary}</p>
    </div>

    <div>
      <h3 style="color:var(--accent-gold-light); margin-bottom:8px;">2. Планетарни Сили & Кармична Посока</h3>
      <p>Вашата Венера в ${data.planets.find(p=>p.id==='venus')?.signName || 'знак'} носи дълбочина в любовта, Марс в ${data.planets.find(p=>p.id==='mars')?.signName || 'знак'} направлява вашата активна воля, а Юпитер в ${data.planets.find(p=>p.id==='jupiter')?.signName || 'знак'} разширява вашите възможности за растеж.</p>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   8b. Пълен Доклад в НОВА СТРАНИЦА (заменя предишното "Свали PDF" / window.print())
   -------------------------------------------------------------------------- */

/**
 * Генерира статичен SVG маркъп на пълното зодиакално колело, БЕЗ филтър на аспектите
 * (винаги показва всички аспекти), независимо от филтъра, зададен от потребителя
 * в основната страница на калкулатора.
 */
function buildFullWheelSvgMarkup(data) {
  if (typeof NatalWheelRenderer === 'undefined') return '';
  const tempHolder = document.createElement('div');
  tempHolder.style.position = 'absolute';
  tempHolder.style.left = '-9999px';
  document.body.appendChild(tempHolder);

  try {
    const tempRenderer = new NatalWheelRenderer(tempHolder);
    tempRenderer.setAspectFilter('all');
    tempRenderer.render(data);
    return tempHolder.innerHTML;
  } catch (err) {
    console.error('Грешка при генериране на колелото за доклада:', err);
    return '';
  } finally {
    document.body.removeChild(tempHolder);
  }
}

function buildFullPlanetsTableRows(data) {
  return data.planets.map(p => {
    const retroBadge = p.isRetrograde ? '<span style="color:#EF4444; font-weight:bold; margin-left:4px;" title="Ретроградна планета">℞</span>' : '';
    return `
      <tr>
        <td><span style="color:${p.planetColor}; font-size:1.1rem; margin-right:6px; font-weight:bold;">${p.symbol}</span><strong>${p.name}</strong> ${retroBadge}</td>
        <td><span style="color:${p.color}; font-size:1.05rem; margin-right:4px;">${p.signSymbol}</span>${p.signName} ${p.deg}°${String(p.min).padStart(2, '0')}'</td>
        <td><strong style="color:var(--accent-gold-light);">${p.house}</strong></td>
      </tr>`;
  }).join('') + `
      <tr>
        <td><span style="color:#10B981; font-size:1.1rem; margin-right:6px; font-weight:bold;">ASC</span><strong>Асцендент</strong></td>
        <td><span style="margin-right:4px;">${data.angles.asc.signSymbol}</span>${data.angles.asc.signName} ${data.angles.asc.deg}°${String(data.angles.asc.min).padStart(2, '0')}'</td>
        <td><strong style="color:var(--accent-gold-light);">1</strong></td>
      </tr>
      <tr>
        <td><span style="color:#F59E0B; font-size:1.1rem; margin-right:6px; font-weight:bold;">MC</span><strong>Медиум Цели</strong></td>
        <td><span style="margin-right:4px;">${data.angles.mc.signSymbol}</span>${data.angles.mc.signName} ${data.angles.mc.deg}°${String(data.angles.mc.min).padStart(2, '0')}'</td>
        <td><strong style="color:var(--accent-gold-light);">10</strong></td>
      </tr>`;
}

/**
 * Богата секция "Планета в Знак" за пълния доклад - същия формат като в
 * основната карта, четлив размер шрифт, с отбелязано достойнство.
 */
function buildPlanetSignInterpretationsMarkup(data) {
  if (typeof generatePlanetInSignText !== 'function') return '';
  return data.planets.map(p => {
    const signObj = { id: p.signId, name: p.signName, element: p.element, modality: p.modality };
    const text = generatePlanetInSignText(p, signObj);
    const dignity = (typeof getPlanetDignity === 'function') ? getPlanetDignity(p.id, p.signId) : null;
    const highlightColor = dignity === 'domicile' || dignity === 'exaltation' ? '#10B981' : (dignity ? '#EF4444' : 'var(--border-glass)');
    const retroBadge = p.isRetrograde ? ' <span style="color:#EF4444; font-weight:bold;" title="Ретроградна планета">℞</span>' : '';
    return `
      <div style="border-left:4px solid ${highlightColor}; padding:12px 16px; background:rgba(245,158,11,0.03); border-radius:8px; margin-bottom:10px;">
        <h4 style="margin:0 0 6px; color:${p.planetColor}; font-size:0.98rem;">${p.symbol} ${p.name} в ${p.signSymbol} ${p.signName}${retroBadge} <span style="color:var(--text-muted); font-weight:normal; font-size:0.82rem;">(${p.house}-ти дом)</span></h4>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin:0; line-height:1.65;">${text}</p>
      </div>`;
  }).join('');
}

/**
 * Пълен вариант на "Домовете по двойки" за самостоятелната страница с доклада -
 * същата философия и персонализация, каквато е и в основната карта.
 */
/**
 * Тълкувания на Асцендента и всички домови върхове за пълния доклад -
 * същото съдържание като в основната карта, само форматирано за отделната страница.
 */
function buildHouseSignInterpretationsMarkup(data) {
  const asc = data.angles.asc;
  const ascInterp = (ASTRO_INTERPRETATIONS.asc && ASTRO_INTERPRETATIONS.asc[asc.signId]) || {};

  let html = `
    <div style="border-left:4px solid #10B981; padding:12px 16px; background:rgba(16,185,129,0.06); border-radius:8px; margin-bottom:12px;">
      <h4 style="margin:0 0 6px; color:#10B981; font-size:1rem;">🌅 ${ascInterp.title || `Асцендент в ${asc.signName}`}</h4>
      <p style="font-size:0.88rem; color:var(--text-secondary); margin:0; line-height:1.6;">${ascInterp.summary || ''}</p>
    </div>`;

  for (let houseNum = 2; houseNum <= 12; houseNum++) {
    const house = data.houses[houseNum - 1];
    const signObj = { name: house.signName, element: house.element, modality: house.modality };
    const text = generateHouseInSignText(houseNum, signObj);
    const isMC = houseNum === 10;
    html += `
      <div style="border-left:4px solid ${isMC ? '#F59E0B' : 'var(--border-glass)'}; padding:12px 16px; background:rgba(245,158,11,0.03); border-radius:8px; margin-bottom:10px;">
        <h4 style="margin:0 0 6px; color:var(--accent-gold-light); font-size:0.95rem;">${isMC ? '🏔️ ' : ''}${houseNum}-ти дом в ${house.signSymbol} ${house.signName}</h4>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin:0; line-height:1.6;">${text}</p>
      </div>`;
  }
  return html;
}

function buildHouseAxesMarkup(data) {
  if (typeof HOUSE_AXES === 'undefined') return '';

  const listPlanets = (arr) => arr.length
    ? arr.map(p => `${p.symbol} ${p.name}`).join(', ')
    : 'няма планета тук — домът говори по-тихо, само през знака си';

  const cards = HOUSE_AXES.map(axis => {
    const [hA, hB] = axis.houses;
    const houseA = data.houses[hA - 1];
    const houseB = data.houses[hB - 1];
    const planetsA = data.planets.filter(p => p.house === hA);
    const planetsB = data.planets.filter(p => p.house === hB);

    return `
      <div class="sidebar-card" style="border-left: 4px solid var(--accent-gold); margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
          <h4 style="margin:0; color:var(--accent-gold-light); font-size:1.05rem;">${axis.symbol} ${axis.title}</h4>
          <span style="font-size:0.78rem; color:var(--text-muted);">${axis.subtitle}</span>
        </div>
        <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin-bottom:12px;">${axis.essay}</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:0.82rem;">
          <div style="background:rgba(245,158,11,0.06); border-radius:8px; padding:10px 12px;">
            <strong style="color:var(--text-primary);">${hA}-ти дом: ${houseA.signSymbol} ${houseA.signName}</strong>
            <div style="color:var(--text-muted); margin-top:4px;">${listPlanets(planetsA)}</div>
          </div>
          <div style="background:rgba(245,158,11,0.06); border-radius:8px; padding:10px 12px;">
            <strong style="color:var(--text-primary);">${hB}-ти дом: ${houseB.signSymbol} ${houseB.signName}</strong>
            <div style="color:var(--text-muted); margin-top:4px;">${listPlanets(planetsB)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `<p style="color:var(--text-secondary); font-size:0.95rem; line-height:1.75; margin-bottom:1.2rem;">${HOUSE_AXES_INTRO}</p>${cards}`;
}

function buildFullHousesTableRows(data) {
  return data.houses.map(h => `
      <tr>
        <td><strong>${h.houseNumber}-ти Дом</strong></td>
        <td><span style="margin-right:6px;">${h.signSymbol}</span><strong>${h.signName}</strong></td>
        <td>${h.deg}° ${h.min}' ${h.sec}"</td>
      </tr>`).join('');
}

/**
 * Генерира списък с ВСИЧКИ аспекти (без филтриране), с пълните им тълкувания —
 * същата логика като renderAspectsSection, но за самостоятелна страница.
 */
function buildFullAspectsMarkup(data) {
  if (!data.aspects || data.aspects.length === 0) {
    return `<p style="color:var(--text-muted); padding:1rem;">Няма намерени мажорни аспекти в зададените орбиси.</p>`;
  }
  return data.aspects.map(asp => {
    const p1 = asp.planet1;
    const p2 = asp.planet2;
    const interpKey = `${p1.id}_${p2.id}`;
    const reverseInterpKey = `${p2.id}_${p1.id}`;
    let interpText = "";
    if (ASTRO_INTERPRETATIONS.aspects && ASTRO_INTERPRETATIONS.aspects[interpKey] && ASTRO_INTERPRETATIONS.aspects[interpKey][asp.aspect.id]) {
      interpText = ASTRO_INTERPRETATIONS.aspects[interpKey][asp.aspect.id];
    } else if (ASTRO_INTERPRETATIONS.aspects && ASTRO_INTERPRETATIONS.aspects[reverseInterpKey] && ASTRO_INTERPRETATIONS.aspects[reverseInterpKey][asp.aspect.id]) {
      interpText = ASTRO_INTERPRETATIONS.aspects[reverseInterpKey][asp.aspect.id];
    } else {
      interpText = generateNatalAspectText(p1, p2, asp.aspect);
    }
    return `
      <div class="sidebar-card" style="margin-bottom:14px; border-left: 4px solid ${asp.aspect.color};">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
          <h4 style="margin:0; font-size:1rem; color:var(--text-primary);">
            <span style="color:${p1.planetColor || '#FFF'};">${p1.symbol || ''} ${p1.name}</span>
            <span style="color:${asp.aspect.color}; margin:0 6px; font-weight:bold;">${asp.aspect.symbol} ${asp.aspect.name}</span>
            <span style="color:${p2.planetColor || '#FFF'};">${p2.symbol || ''} ${p2.name}</span>
          </h4>
          <span style="font-size:0.8rem; color:var(--accent-gold-light); background:rgba(245,158,11,0.1); padding:2px 8px; border-radius:10px;">орбис ${asp.orb}°</span>
        </div>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin:0;">${interpText}</p>
      </div>`;
  }).join('');
}

function buildBalanceBarsMarkup(data) {
  const { elements, modalities } = data.balance;
  const elConfig = [
    { name: 'Огън (Страст и Енергия)', val: elements.fire, col: '#F59E0B' },
    { name: 'Земя (Практичност и Стабилност)', val: elements.earth, col: '#10B981' },
    { name: 'Въздух (Интелект и Общуване)', val: elements.air, col: '#818CF8' },
    { name: 'Вода (Емоции и Интуиция)', val: elements.water, col: '#38BDF8' }
  ];
  const modConfig = [
    { name: 'Кардинални (Инициатива)', val: modalities.cardinal, col: '#EC4899' },
    { name: 'Неподвижни (Устойчивост)', val: modalities.fixed, col: '#F59E0B' },
    { name: 'Подвижни (Адаптивност)', val: modalities.mutable, col: '#06B6D4' }
  ];
  const bar = (b) => `
      <div class="progress-bar-group">
        <div class="progress-label"><span>${b.name}</span><strong>${b.val}%</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:${b.val}%; background:${b.col};"></div></div>
      </div>`;
  return `
    <div class="balance-grid">
      <div class="balance-card">
        <h3 class="font-serif" style="color:#F59E0B; margin-bottom:1.2rem;">Баланс на Четирите Стихии</h3>
        ${elConfig.map(bar).join('')}
      </div>
      <div class="balance-card">
        <h3 class="font-serif" style="color:#06B6D4; margin-bottom:1.2rem;">Баланс на Трите Модалности</h3>
        ${modConfig.map(bar).join('')}
      </div>
    </div>`;
}

/**
 * Разширен наративен доклад — обхваща всички основни планети (не само Голямата Тройка),
 * за да представи "цялата индивидуална карта", както е поискано.
 */
function buildExtendedNarrativeMarkup(data) {
  const [y, m, d] = data.user.birthDate.split('-').map(Number);
  const lifePath = NumerologyCalc.getLifePathNumber(d, m, y);
  const sun = data.planets.find(p => p.id === 'sun');
  const moon = data.planets.find(p => p.id === 'moon');
  const asc = data.angles.asc;

  const planetBlock = (id, icon, color, title) => {
    const p = data.planets.find(pl => pl.id === id);
    if (!p) return '';
    const interp = (ASTRO_INTERPRETATIONS[id] && ASTRO_INTERPRETATIONS[id][p.signId]) || {};
    return `
    <div style="background:rgba(30,37,58,0.6); padding:16px; border-radius:12px; border-left:4px solid ${color};">
      <h4 style="color:${color}; margin-bottom:6px;">${icon} ${title} в ${p.signName} (${p.deg}° ${p.min}', ${p.house}-ти дом)</h4>
      <p>${interp.summary || `${title} оформя личния ви подход в тази сфера на живота.`}</p>
    </div>`;
  };

  return `
    <div>
      <h3 style="color:var(--accent-gold-light); margin-bottom:8px;">1. Въведение & Космически Портрет</h3>
      <p>В мига на вашето раждане в ${data.user.cityName}, звездите и планетите образуват уникален енергиен печат, който задава вашите вродени таланти, емоционални стремежи и житейски път.</p>
    </div>

    ${planetBlock('sun', '☀️', '#F59E0B', 'Слънце')}
    ${planetBlock('moon', '🌙', '#818CF8', 'Луна')}
    <div style="background:rgba(30,37,58,0.6); padding:16px; border-radius:12px; border-left:4px solid #34D399;">
      <h4 style="color:#34D399; margin-bottom:6px;">🌅 Асцендент в ${asc.signName} (${asc.deg}° ${asc.min}')</h4>
      <p>${(ASTRO_INTERPRETATIONS.asc[asc.signId] && ASTRO_INTERPRETATIONS.asc[asc.signId].summary) || ""}</p>
    </div>
    <div style="background:rgba(30,37,58,0.6); padding:16px; border-radius:12px; border-left:4px solid #EC4899;">
      <h4 style="color:#EC4899; margin-bottom:6px;">🔢 Нумерологичен Път: Число ${lifePath.number} (${lifePath.title})</h4>
      <p>${lifePath.summary}</p>
    </div>

    <div>
      <h3 style="color:var(--accent-gold-light); margin-bottom:8px;">2. Планетарни Сили & Кармична Посока</h3>
    </div>
    ${planetBlock('mercury', '☿', '#38BDF8', 'Меркурий')}
    ${planetBlock('venus', '♀', '#F472B6', 'Венера')}
    ${planetBlock('mars', '♂', '#EF4444', 'Марс')}
    ${planetBlock('jupiter', '♃', '#FBBF24', 'Юпитер')}
    ${planetBlock('saturn', '♄', '#A8A29E', 'Сатурн')}
    ${planetBlock('uranus', '♅', '#22D3EE', 'Уран')}
    ${planetBlock('neptune', '♆', '#818CF8', 'Нептун')}
    ${planetBlock('pluto', '♇', '#94A3B8', 'Плутон')}
  `;
}

/**
 * Съставя пълен, самостоятелен HTML документ с цялата индивидуална натална карта:
 * колело (с всички аспекти), таблица с планети и домове, таблица с всички домови върхове,
 * пълен списък с ВСИЧКИ аспекти, баланс на стихии/модалности и разширен наратив.
 * Ползва същите CSS файлове като основния сайт (чрез <base href>), за да изглежда еднакво.
 */
function buildFullReportDocument(data) {
  const wheelSvg = buildFullWheelSvgMarkup(data);
  const baseHref = new URL('.', window.location.href).href;
  const generatedOn = new Date().toLocaleString('bg-BG');

  return `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="${baseHref}">
<title>Пълен Астрологичен Доклад — ${data.user.name}</title>
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/natal-wheel.css">
<style>
  body { background: var(--bg-primary); padding: 30px 5vw 80px; }
  .report-page-wrap { max-width: 1100px; margin: 0 auto; }
  .report-section { margin-bottom: 2.5rem; }
  .wheel-svg-box svg { width: 100%; height: auto; max-width: 650px; display: block; margin: 0 auto; }
  @media print {
    body { background: #FFF !important; color: #000 !important; }
  }
</style>
</head>
<body>
  <div class="report-page-wrap">
    <div style="text-align:center; margin-bottom:2rem; border-bottom:1px solid var(--border-glass); padding-bottom:1.5rem;">
      <div style="font-size:2rem; margin-bottom:8px;">✧ ✦ ✧</div>
      <p style="color:var(--accent-gold-light); letter-spacing:2px; text-transform:uppercase; font-size:0.85rem; margin-bottom:10px;">Spica Astro</p>
      <h1 class="font-serif gold-gradient-text" style="font-size:2.4rem; margin-bottom:6px;">Пълен Астрологичен Доклад</h1>
      <h2 class="font-serif" style="color:var(--accent-gold-light); font-size:1.4rem; margin-bottom:6px;">${data.user.name}</h2>
      <p style="color:var(--text-secondary);">Рождени данни: ${data.user.birthFormattedDate}, ${data.user.birthTime} ч. | ${data.user.cityName} (UTC+${data.user.tz}, ${data.user.lat.toFixed(2)}°N, ${data.user.lng.toFixed(2)}°E)</p>
      <p style="color:var(--text-muted); font-size:0.85rem; margin-top:6px;">Генериран на ${generatedOn}</p>
    </div>

    <div class="report-section">
      <h3 class="font-serif gold-gradient-text" style="margin-bottom:1rem;">🪐 Пълно Натално Колело (всички аспекти)</h3>
      <div class="wheel-svg-box">${wheelSvg}</div>
    </div>

    <div class="report-section sidebar-card">
      <h3 class="font-serif gold-gradient-text" style="margin-bottom:1.2rem;">🌌 Позиции на Планетите, Ъглите и Домовете</h3>
      <div class="table-responsive">
        <table class="astro-table">
          <thead><tr><th>Планета / Точка</th><th>Зодиакален Знак & Градуси</th><th>Дом</th><th>Астрологично Влияние</th></tr></thead>
          <tbody>${buildFullPlanetsTableRows(data)}</tbody>
        </table>
      </div>
    </div>

    <div class="report-section sidebar-card">
      <h3 class="font-serif gold-gradient-text" style="margin-bottom:1.2rem;">🏠 Домови Върхове (Система: ${data.user.name ? 'Плацидус' : ''})</h3>
      <div class="table-responsive">
        <table class="astro-table">
          <thead><tr><th>Дом</th><th>Знак</th><th>Градус на Върха</th></tr></thead>
          <tbody>${buildFullHousesTableRows(data)}</tbody>
        </table>
      </div>
    </div>

    <div class="report-section sidebar-card">
      <h3 class="font-serif gold-gradient-text" style="margin-bottom:1.2rem;">🪐 Планетите в Знаците — Какво Означават</h3>
      ${buildPlanetSignInterpretationsMarkup(data)}
    </div>

    <div class="report-section sidebar-card">
      <h3 class="font-serif gold-gradient-text" style="margin-bottom:1.2rem;">📖 Тълкувания на Асцендента и Домовите Върхове</h3>
      ${buildHouseSignInterpretationsMarkup(data)}
    </div>

    <div class="report-section">
      <h3 class="font-serif gold-gradient-text" style="margin-bottom:1.2rem;">🏛️ Домовете по Двойки — Защо Стават Нещата</h3>
      ${buildHouseAxesMarkup(data)}
    </div>

    <div class="report-section">
      <h3 class="font-serif gold-gradient-text" style="margin-bottom:1.2rem;">📐 Всички Аспекти между Планетите (${data.aspects.length})</h3>
      ${buildFullAspectsMarkup(data)}
    </div>

    <div class="report-section">
      ${buildBalanceBarsMarkup(data)}
    </div>

    <div class="report-section sidebar-card" style="line-height:1.8; display:flex; flex-direction:column; gap:20px;">
      <h3 class="font-serif gold-gradient-text" style="margin-bottom:0.5rem;">📄 Пълен Наративен Анализ</h3>
      ${buildExtendedNarrativeMarkup(data)}
    </div>

    <div style="text-align:center; margin-top:2rem; padding-top:1.5rem; border-top:1px solid var(--border-glass-subtle);">
      <button type="button" onclick="window.print()" class="btn-submit-astro" style="padding:12px 30px;">
        <span>🖨️ Отпечатай тази страница</span>
      </button>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Отваря пълния доклад като НОВА СТРАНИЦА в браузъра (нов таб), вместо да предизвиква
 * директно PDF/системния диалог за печат. Съдържа цялата индивидуална карта — колело
 * с всички аспекти, пълни таблици и наратив. Потребителят може по избор да разпечата
 * или запази тази нова страница като PDF от собствения си браузър, ако желае.
 */
function openFullReportPage() {
  if (!currentNatalData) {
    alert('Моля, първо изчислете натална карта.');
    return;
  }
  const html = buildFullReportDocument(currentNatalData);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const reportWindow = window.open(url, '_blank');

  if (!reportWindow) {
    alert('Моля, разрешете изскачащи прозорци (pop-ups) за този сайт, за да видите пълния доклад на нова страница.');
  }

  // Освобождаваме паметта на Blob URL-а малко след отварянето, за да не изтече паметта.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* --------------------------------------------------------------------------
   9. Навигационни табове
   -------------------------------------------------------------------------- */
/**
 * Табовете по-долу изискват реално изчислена натална карта - показването им
 * без данни би оставило само статичните заглавия видими, а генерираното
 * съдържание празно, което изглежда като бъг. DATA_INDEPENDENT_TABS са
 * единствените, които имат смислено съдържание и без изчислена карта.
 */
const DATA_INDEPENDENT_TABS = ['moon', 'daily', 'articles'];

function activateTab(tabId) {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  const targetPanel = document.getElementById(`panel-${tabId}`);

  if (!targetBtn || !targetPanel) return false;

  tabBtns.forEach(b => b.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));

  targetBtn.classList.add('active');

  const needsData = !DATA_INDEPENDENT_TABS.includes(tabId);
  const noticeEl = document.getElementById('needs-chart-notice');

  if (needsData && !currentNatalData) {
    // Няма изчислена карта - показваме ясно съобщение вместо празно съдържание.
    if (noticeEl) noticeEl.style.display = 'block';
  } else {
    if (noticeEl) noticeEl.style.display = 'none';
    targetPanel.classList.add('active');
  }

  // Някои раздели (Лунен Календар, Дневен Хороскоп, Статии) не изискват изчислена
  // лична карта - показваме резултатната секция дори преди първо изчисление,
  // за да не изглежда сякаш нищо не се случва при клик от главното меню.
  const publicPanels = ['moon', 'daily', 'articles'];
  if (publicPanels.includes(tabId)) {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) resultsSection.style.display = 'block';
  }

  return true;
}

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(btn.dataset.tab);
    });
  });
}

/**
 * Линковете в главното меню (Лунен Календар, Нумерология, Съвместимост, Дневен Хороскоп)
 * сочат директно към #panel-moon / #panel-numerology / #panel-synastry / #panel-daily.
 * Тези панели по подразбиране са скрити (display:none), докато не се активира
 * съответният таб бутон — обикновен "#" линк само скролваше, без реално да превключи
 * таба, затова визуално не се случваше нищо. Тук прихващаме клика, активираме
 * правилния таб (както бутоните горе в резултатите) и чак след това скролваме.
 */
function initHeaderNavTabLinks() {
  document.querySelectorAll('.nav-links a[href^="#panel-"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const tabId = link.getAttribute('href').replace('#panel-', '');
      const activated = activateTab(tabId);
      if (activated) {
        e.preventDefault();
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        const targetPanel = document.getElementById(`panel-${tabId}`);
        targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Ако по някаква причина табът не бъде намерен, оставяме нормалния "#" преход.
    });
  });
}

function initWheelFilters() {
  const wheelControls = document.querySelector('.wheel-controls');
  if (!wheelControls) return;

  wheelControls.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      wheelControls.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      if (natalWheelInstance) {
        natalWheelInstance.setAspectFilter(filter);
      }
    });
  });
}

function initGotoCalculatorButton() {
  const btn = document.getElementById('btn-goto-calculator');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const calcSection = document.getElementById('calculator');
    if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* --------------------------------------------------------------------------
   10. Споделяне на натална карта с линк
   -------------------------------------------------------------------------- */
/**
 * "Нова Карта" - изчиства формата за раждане до празно състояние и скролва
 * обратно към калкулатора, така че потребителят може веднага да въведе
 * данните на друг човек, без да отваря нов таб или да трие ръчно полетата.
 * Резултатите от предишната карта не се трият от екрана, докато не се подаде
 * нова - потребителят просто попълва и натиска "Изчисли" отново.
 */
function initNewChartButton() {
  const btn = document.getElementById('btn-new-chart');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const nameInput = document.getElementById('user-name');
    const cityInput = document.getElementById('birth-city');
    const yearInput = document.getElementById('birth-year');
    const monthSelect = document.getElementById('birth-month');
    const hourSelect = document.getElementById('birth-hour');
    const minuteSelect = document.getElementById('birth-minute');
    const unknownCheckbox = document.getElementById('unknown-time-checkbox');

    if (nameInput) nameInput.value = '';
    if (cityInput) cityInput.value = '';
    if (yearInput) yearInput.value = '';
    if (monthSelect) monthSelect.value = '1';
    updateDayOptions();
    if (hourSelect) hourSelect.value = '12';
    if (minuteSelect) minuteSelect.value = '0';
    if (unknownCheckbox) unknownCheckbox.checked = false;

    const calcSection = document.getElementById('calculator');
    if (calcSection) {
      calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (nameInput) nameInput.focus();
  });
}

function initShareButton() {
  const shareBtn = document.getElementById('btn-share-chart');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', () => {
    if (!currentNatalData) return;
    const u = currentNatalData.user;
    const shareUrl = `${window.location.origin}${window.location.pathname}?name=${encodeURIComponent(u.name)}&birthday=${u.birthDate}%20${u.birthTime}:00&birthplace=${encodeURIComponent(u.cityName)}&latitude=${u.lat}&longitude=${u.lng}&timezone=Europe/Sofia`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      shareBtn.innerHTML = "✓ Линкът е копиран!";
      setTimeout(() => {
        shareBtn.innerHTML = "🔗 Копирай Линк";
      }, 2500);
    }).catch(() => {
      prompt("Копирайте линка към вашата натална карта:", shareUrl);
    });
  });
}

/* --------------------------------------------------------------------------
   11. Синастрия (Съвместимост) — ПЪЛНО НАЛАГАНЕ на ДВЕ РЕАЛНИ НАТАЛНИ КАРТИ
   -------------------------------------------------------------------------- */

/**
 * Изчислява числова оценка (0-100%) за съвместимост на база РЕАЛНИТЕ аспекти
 * между двете карти — не произволно число. Хармоничните аспекти (тригон/секстил)
 * между лични планети вдигат резултата, напрегнатите (квадратура/опозиция) го свалят,
 * а по-точният орбис (по-силният аспект) тежи повече.
 */
/**
 * Групиране на аспектите в СИНАСТРИЯТА по житейска тема, вместо плосък списък
 * от голи числа. Всяка тема показва до 4-те най-силни (най-тесен орбис)
 * аспекта в нея, с богато тълкувание (знаци, достойнства, ключови думи) -
 * вместо еднословно обяснение.
 */
const SYNASTRY_THEME_GROUPS = [
  { id: 'identity', title: '🌅 Идентичност и Житейска Посока', planets: ['sun', 'northnode', 'southnode'] },
  { id: 'emotional', title: '🌙 Емоционална Връзка', planets: ['moon'] },
  { id: 'romance', title: '💕 Романтика, Привличане и Страст', planets: ['venus', 'mars', 'lilith'] },
  { id: 'communication', title: '🗣️ Комуникация и Разбирателство', planets: ['mercury'] },
  { id: 'stability', title: '⚓ Стабилност и Дългосрочен Ангажимент', planets: ['saturn', 'jupiter'] },
  { id: 'transformation', title: '⚡ Трансформация и Дълбочина', planets: ['uranus', 'neptune', 'pluto', 'chiron'] }
];

function categorizeSynastryAspect(asp) {
  for (const group of SYNASTRY_THEME_GROUPS) {
    if (group.planets.includes(asp.planet1.id) || group.planets.includes(asp.planet2.id)) {
      return group.id;
    }
  }
  return 'other';
}

/**
 * Богато тълкувание на СИНАСТРИЕН аспект - комбинира знаците на двете
 * планети, достойнството им (владение/екзалтация/изгнание/падение) и
 * ключовите им думи, надписани с имената на двамата хора.
 */
function generateSynastryAspectText(nameA, p1, nameB, p2, aspect) {
  const intro = getAspectNatureIntro(aspect);
  const dign1 = (typeof getPlanetDignity === 'function') ? getPlanetDignity(p1.id, p1.signId) : null;
  const dign2 = (typeof getPlanetDignity === 'function') ? getPlanetDignity(p2.id, p2.signId) : null;
  const article = (typeof ASPECT_GENDER_ARTICLE !== 'undefined' ? ASPECT_GENDER_ARTICLE[aspect.id] : null) || 'този';
  const articleCap = article.charAt(0).toUpperCase() + article.slice(1);

  let dignitySentence = '';
  if (dign1 && typeof DIGNITY_INFO !== 'undefined') {
    dignitySentence += ` ${p1.name} на ${nameA} тук е ${DIGNITY_INFO[dign1].label}, което засилва тази тема в двойката.`;
  }
  if (dign2 && typeof DIGNITY_INFO !== 'undefined') {
    dignitySentence += ` ${p2.name} на ${nameB} тук е ${DIGNITY_INFO[dign2].label}, което оставя допълнителен отпечатък.`;
  }

  return `${articleCap} ${aspect.name.toLowerCase()} ${intro}. Темата на <em>${getKeywordsFor(p1)}</em> (${p1.name} на ${nameA}, в ${p1.signName}) се среща с <em>${getKeywordsFor(p2)}</em> (${p2.name} на ${nameB}, в ${p2.signName}).${dignitySentence}`;
}

function renderSynastryThemedSections(nameA, nameB, crossAspects) {
  const container = document.getElementById('synastry-themed-sections');
  if (!container) return;

  if (crossAspects.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); padding:1rem; text-align:center;">Няма намерени мажорни аспекти между двете карти в зададените орбиси.</p>`;
    return;
  }

  const grouped = {};
  crossAspects.forEach(asp => {
    const cat = categorizeSynastryAspect(asp);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(asp);
  });

  const sections = SYNASTRY_THEME_GROUPS
    .filter(group => grouped[group.id] && grouped[group.id].length > 0)
    .map(group => {
      const aspectsInGroup = grouped[group.id].slice(0, 4); // топ 4 най-силни (най-тесен орбис) в темата
      const cardsHtml = aspectsInGroup.map(asp => {
        const p1 = asp.planet1, p2 = asp.planet2;
        const text = generateSynastryAspectText(nameA, p1, nameB, p2, asp.aspect);
        return `
          <div style="border-left:3px solid ${asp.aspect.color}; padding:10px 14px; margin-bottom:10px; background:rgba(245,158,11,0.04); border-radius:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
              <strong style="font-size:0.9rem;">
                <span style="color:${p1.planetColor || '#FFF'};">${nameA}: ${p1.symbol || ''} ${p1.name}</span>
                <span style="color:${asp.aspect.color}; margin:0 4px;">${asp.aspect.symbol} ${asp.aspect.name}</span>
                <span style="color:${p2.planetColor || '#FFF'};">${nameB}: ${p2.symbol || ''} ${p2.name}</span>
              </strong>
              <span style="font-size:0.72rem; color:var(--accent-gold-light); background:rgba(245,158,11,0.1); padding:2px 8px; border-radius:10px;">орбис ${asp.orb}°</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0; line-height:1.6;">${text}</p>
          </div>`;
      }).join('');

      return `
        <div class="sidebar-card">
          <h4 style="color:var(--accent-gold-light); margin-bottom:12px;">${group.title}</h4>
          ${cardsHtml}
        </div>`;
    });

  container.innerHTML = sections.join('');
}

function renderSynastryPersonCard(natalData) {
  const sun = natalData.planets.find(p => p.id === 'sun');
  const moon = natalData.planets.find(p => p.id === 'moon');
  const asc = natalData.angles.asc;
  return `
    <div class="sidebar-card">
      <h4 style="color:var(--accent-gold-light); margin-bottom:8px;">${natalData.user.name}</h4>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 4px;">${sun.symbol} Слънце: <strong>${sun.signName}</strong></p>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 4px;">${moon.symbol} Луна: <strong>${moon.signName}</strong></p>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">🌅 Асцендент: <strong>${asc.signName}</strong></p>
    </div>`;
}

function initSynastry() {
  const dayS = document.getElementById('synastry-b-day');
  const monthS = document.getElementById('synastry-b-month');
  const yearS = document.getElementById('synastry-b-year');
  const hourS = document.getElementById('synastry-b-hour');
  const minS = document.getElementById('synastry-b-minute');
  const calcBtn = document.getElementById('btn-calc-synastry');
  const nameInput = document.getElementById('synastry-b-name');
  const cityInput = document.getElementById('synastry-b-city');
  const summaryAEl = document.getElementById('synastry-person-a-summary');

  if (!dayS || !monthS || !yearS || !hourS || !minS || !calcBtn) return;

  let hourOptions = '';
  for (let h = 0; h < 24; h++) {
    hourOptions += `<option value="${h}" ${h === 12 ? 'selected' : ''}>${String(h).padStart(2, '0')}:00 ч.</option>`;
  }
  hourS.innerHTML = hourOptions;

  let minOptions = '';
  for (let m = 0; m < 60; m++) {
    minOptions += `<option value="${m}" ${m === 0 ? 'selected' : ''}>${String(m).padStart(2, '0')} мин.</option>`;
  }
  minS.innerHTML = minOptions;

  updateDayOptions('synastry-b-day', 'synastry-b-month', 'synastry-b-year', 15);
  initCustomDaySelect('synastry-b-day');
  const refreshBDays = () => updateDayOptions('synastry-b-day', 'synastry-b-month', 'synastry-b-year', 15);
  monthS.addEventListener('change', refreshBDays);
  yearS.addEventListener('input', refreshBDays);
  yearS.addEventListener('change', refreshBDays);

  function refreshPersonASummary() {
    if (!summaryAEl) return;
    if (currentNatalData) {
      summaryAEl.innerHTML = `👤 <strong>Човек 1:</strong> ${currentNatalData.user.name} — ${currentNatalData.user.birthFormattedDate}, ${currentNatalData.user.cityName}`;
    } else {
      summaryAEl.innerHTML = `⚠️ Все още нямаш изчислена натална карта по-горе в калкулатора. Изчисли първо своята карта (Човек 1), за да проверим съвместимостта.`;
    }
  }
  refreshPersonASummary();
  // Обновяваме резюмето на Човек 1 всеки път, когато табът за Съвместимост се отваря
  // (в случай, че потребителят е преизчислил основната си карта междувременно).
  document.querySelector('.tab-btn[data-tab="synastry"]')?.addEventListener('click', refreshPersonASummary);

  calcBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (!currentNatalData) {
      alert('Моля, първо изчисли натална карта в горната част на страницата (Човек 1).');
      return;
    }

    const bName = (nameInput.value || '').trim() || 'Партньор';
    const bCityRaw = (cityInput.value || '').trim() || 'София';
    const bDay = parseInt(dayS.value) || 15;
    const bMonth = parseInt(monthS.value) || 6;
    const bYear = parseInt(yearS.value) || 1992;
    const bHourRaw = parseInt(hourS.value);
    const bHour = Number.isNaN(bHourRaw) ? 12 : bHourRaw;
    const bMinute = parseInt(minS.value) || 0;

    const matchedCity = CITIES_DATA.find(c =>
      c.name.toLowerCase() === bCityRaw.toLowerCase() ||
      (c.nameEn && c.nameEn.toLowerCase() === bCityRaw.toLowerCase()) ||
      bCityRaw.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(bCityRaw.toLowerCase())
    );

    let bLat = 42.6977, bLng = 23.3219, bTz = 2, bCityName = bCityRaw;
    if (matchedCity) {
      bLat = matchedCity.lat;
      bLng = matchedCity.lng;
      bTz = getAutoTimezoneOffset(bYear, bMonth, bDay, matchedCity.tz, matchedCity.country, bHour, bMinute);
      bCityName = matchedCity.name;
    } else {
      bTz = getAutoTimezoneOffset(bYear, bMonth, bDay, 2, "България", bHour, bMinute);
    }

    const personB = AstroCalc.generateNatalChart({
      name: bName, year: bYear, month: bMonth, day: bDay, hour: bHour, minute: bMinute,
      lat: bLat, lng: bLng, tz: bTz, cityName: bCityName
    });

    const pointsA = [...currentNatalData.planets, currentNatalData.angles.asc, currentNatalData.angles.mc];
    const pointsB = [...personB.planets, personB.angles.asc, personB.angles.mc];
    const crossAspects = AstroCalc.calcCrossAspects(pointsA, pointsB);

    document.getElementById('synastry-both-summary').innerHTML =
      renderSynastryPersonCard(currentNatalData) + renderSynastryPersonCard(personB);

    // Визуално двойно колело (biwheel): домовете на Човек 1 като база, планетите на
    // двамата в отделни пръстени, свързани с реални аспектни линии - вместо суха информация.
    if (!synastryWheelInstance) {
      synastryWheelInstance = new NatalWheelRenderer('synastry-wheel-container');
    }
    synastryWheelInstance.renderSynastry(currentNatalData, personB, crossAspects);
    const legendEl = document.getElementById('synastry-wheel-legend');
    if (legendEl) {
      legendEl.innerHTML = `
        <span style="color:#F59E0B;">●</span> ${currentNatalData.user.name} (вътрешен пръстен, домове)
        &nbsp;&nbsp;
        <span style="color:#EC4899;">●</span> ${personB.user.name} (външен пръстен)
        <br>Показани са до 24-те най-силни аспекта визуално, разбити по теми по-долу.
      `;
    }

    renderSynastryThemedSections(currentNatalData.user.name, personB.user.name, crossAspects);

    document.getElementById('synastry-results').style.display = 'block';
    document.getElementById('synastry-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* --------------------------------------------------------------------------
   12. Дневен Хороскоп
   -------------------------------------------------------------------------- */
function initDailyHoroscope() {
  const grid = document.getElementById('daily-horoscope-signs');
  if (!grid) return;

  grid.innerHTML = ZODIAC_SIGNS.map((s, idx) => `
    <div class="zodiac-btn ${idx === 5 ? 'active' : ''}" data-sign-id="${s.id}">
      <span class="zodiac-btn-symbol" style="color:${s.color}">${s.symbol}</span>
      <span class="zodiac-btn-name">${s.name}</span>
    </div>
  `).join('');

  const horoscopes = {
    aries: "Днес Лунният транзит активира вашата решителност. Прекрасен момент за смели бизнес ходове и спорт.",
    taurus: "Земната енергия ви носи стабилност и финансов нюх. Отделете време за почивка и уют в дома.",
    gemini: "Комуникациите ви вървят с лекота. Вдъхновяващ ден за нови контакти, учене и креативно писане.",
    cancer: "Интуицията ви днес е безпогрешна. Доверете се на вътрешния си глас при важно семейно решение.",
    leo: "Вие сте в светлината на прожекторите. Харизмата ви отваря врати както в кариерата, така и в любовта.",
    virgo: "Днес вашият остър ум и прецизност ще ви донесат страхотен успех и признание. Перфектен момент за подреждане на важни проекти и грижа за здравето.",
    libra: "Хармонията и дипломацията са вашата сила днес. Очаква ви приятно събитие или романтична изненада.",
    scorpio: "Магнетизмът ви е непреодолим. Дълбоките прозрения ще ви помогнат да разкриете важна тайна.",
    sagittarius: "Оптимизмът и късметът са на ваша страна. Чудесен ден за планиране на пътувания или нови проекти.",
    capricorn: "Дисциплината и упоритостта ви носят заслужено признание от ръководители или клиенти.",
    aquarius: "Оригиналните ви идеи срещат подкрепа от съмишленици. Бъдете смели и нестандартни.",
    pisces: "Вдъхновението и сънищата ви носят ценни послания. Отдайте се на изкуство, музика и медитация."
  };

  function showDaily(signId) {
    const sign = ZODIAC_SIGNS.find(s => s.id === signId);
    if (!sign) return;

    document.getElementById('daily-sign-title').textContent = `${sign.symbol} Дневен хороскоп за ${sign.name}`;
    document.getElementById('daily-sign-text').textContent = horoscopes[signId] || "Звездите вещаят хармония и успех във вашите начинания.";
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.zodiac-btn');
    if (!btn) return;

    document.querySelectorAll('.zodiac-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showDaily(btn.dataset.signId);
  });

  showDaily('virgo');
}

/* --------------------------------------------------------------------------
   12. Статии (Астро Блог)
   -------------------------------------------------------------------------- */
function initArticles() {
  if (typeof ARTICLES_DATA === 'undefined') return;

  renderArticlesCategoryFilters();
  renderArticlesGrid('all');

  const goBackToArticles = () => {
    document.getElementById('article-reading-view').style.display = 'none';
    document.getElementById('articles-list-view').style.display = 'block';
    document.getElementById('articles-list-view').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const backBtn = document.getElementById('btn-back-to-articles');
  if (backBtn) backBtn.addEventListener('click', goBackToArticles);

  const backBtnBottom = document.getElementById('btn-back-to-articles-bottom');
  if (backBtnBottom) backBtnBottom.addEventListener('click', goBackToArticles);
}

function renderArticlesCategoryFilters() {
  const container = document.getElementById('articles-category-filters');
  if (!container) return;

  const categories = [{ id: 'all', name: 'Всички' }];
  const seen = new Set();
  ARTICLES_DATA.forEach(a => {
    if (!seen.has(a.category)) {
      seen.add(a.category);
      categories.push({ id: a.category, name: a.categoryName });
    }
  });

  container.innerHTML = categories.map(c =>
    `<button type="button" class="btn-filter article-cat-filter ${c.id === 'all' ? 'active' : ''}" data-category="${c.id}">${c.name}</button>`
  ).join('');

  container.querySelectorAll('.article-cat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.article-cat-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderArticlesGrid(btn.dataset.category);
    });
  });
}

function renderArticlesGrid(categoryFilter) {
  const grid = document.getElementById('articles-grid');
  if (!grid) return;

  const filtered = categoryFilter === 'all'
    ? ARTICLES_DATA
    : ARTICLES_DATA.filter(a => a.category === categoryFilter);

  grid.innerHTML = filtered.map(a => `
    <div class="sidebar-card article-card" data-article-id="${a.id}" style="cursor:pointer; display:flex; flex-direction:column;">
      <div style="font-size:2rem; margin-bottom:8px;">${a.icon}</div>
      <span style="font-size:0.72rem; color:var(--accent-gold-light); text-transform:uppercase; letter-spacing:0.5px;">${a.categoryName}</span>
      <h4 style="margin:6px 0 8px; font-size:1.05rem; color:var(--text-primary); line-height:1.4;">${a.title}</h4>
      <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.55; flex-grow:1;">${a.summary}</p>
      <div style="margin-top:12px; font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between;">
        <span>${a.readTime}</span>
        <span>${a.date}</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.article-card').forEach(card => {
    card.addEventListener('click', () => openArticle(card.dataset.articleId));
  });
}

function openArticle(articleId) {
  const article = ARTICLES_DATA.find(a => a.id === articleId);
  if (!article) return;

  document.getElementById('articles-list-view').style.display = 'none';
  const readingView = document.getElementById('article-reading-view');
  readingView.style.display = 'block';

  document.getElementById('article-reading-meta').innerHTML = `
    <span style="font-size:0.75rem; color:var(--accent-gold-light); text-transform:uppercase; letter-spacing:0.5px;">${article.categoryName}</span>
    <span style="font-size:0.75rem; color:var(--text-muted); margin-left:10px;">${article.readTime} · ${article.date}</span>
  `;
  document.getElementById('article-reading-title').innerHTML = `${article.icon} ${article.title}`;
  document.getElementById('article-reading-content').innerHTML = article.content;

  readingView.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
