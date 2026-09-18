/**
 * Лунен Календар & Фази на Луната (MoonCalc)
 * Изчислява точната фаза на луната, процент на осветеност, лунен ден и съвети за здраве и красота.
 */

class MoonCalc {
  /**
   * Изчислява фазата на Луната за дадена дата
   */
  static getMoonPhase(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Пресмятане на Юлиански ден
    let y = year;
    let m = month;
    if (m <= 2) {
      y -= 1;
      m += 12;
    }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

    // Известно новолуние: 6 Януари 2000, 18:14 UTC (JD 2451549.5)
    // Синодичен месец = 29.530588853 дни
    const synodicMonth = 29.530588853;
    const daysSinceNew = (jd - 2451549.5) % synodicMonth;
    const normalizedDays = daysSinceNew < 0 ? daysSinceNew + synodicMonth : daysSinceNew;

    const phaseRatio = normalizedDays / synodicMonth; // 0 до 1
    const ageInDays = parseFloat(normalizedDays.toFixed(1));

    // Процент осветеност (0% при новолуние, 100% при пълнолуние)
    const illumination = Math.round((1 - Math.cos(phaseRatio * 2 * Math.PI)) / 2 * 100);

    let phaseName = "";
    let phaseSymbol = "";
    let phaseDescription = "";

    if (phaseRatio < 0.03 || phaseRatio > 0.97) {
      phaseName = "Новолуние (Тъмна Луна)";
      phaseSymbol = "🌑";
      phaseDescription = "Време за ново начало, поставяне на цели, пречистване и планиране.";
    } else if (phaseRatio < 0.22) {
      phaseName = "Растящ полумесец";
      phaseSymbol = "🌒";
      phaseDescription = "Енергията расте. Време за предприемане на първи стъпки и стартиране на идеи.";
    } else if (phaseRatio < 0.28) {
      phaseName = "Първа четвърт";
      phaseSymbol = "🌓";
      phaseDescription = "Време за преодоляване на препятствия, смелост и решителни действия.";
    } else if (phaseRatio < 0.47) {
      phaseName = "Растяща Луна (Към пълнолуние)";
      phaseSymbol = "🌔";
      phaseDescription = "Кулминация на силите. Подходящ период за развитие и разгръщане на проекти.";
    } else if (phaseRatio < 0.53) {
      phaseName = "Пълнолуние";
      phaseSymbol = "🌕";
      phaseDescription = "Максимална енергия, интуиция и страст. Време за жътва, празник и осъзнаване.";
    } else if (phaseRatio < 0.72) {
      phaseName = "Намаляваща Луна";
      phaseSymbol = "🌖";
      phaseDescription = "Време за споделяне на плодовете, благодарност, анализ и освобождаване от излишното.";
    } else if (phaseRatio < 0.78) {
      phaseName = "Последна четвърт";
      phaseSymbol = "🌗";
      phaseDescription = "Преоценка, прошка, разчистване на пространството и освобождаване от стари навици.";
    } else {
      phaseName = "Намаляващ полумесец";
      phaseSymbol = "🌘";
      phaseDescription = "Почивка, възстановяване, медитация, сън и подготовка за следващия цикъл.";
    }

    // Лунен знак за деня
    const moonSignIndex = Math.floor((normalizedDays / synodicMonth * 12 + 8) % 12);
    const moonSign = ZODIAC_SIGNS[moonSignIndex] || ZODIAC_SIGNS[0];

    // Съвети според фазата
    const isWaxing = phaseRatio > 0.03 && phaseRatio < 0.53; // Растяща

    const beautyTips = isWaxing 
      ? "💇‍♀️ **Коса и Красота**: Луната расте! Перфектен момент за подстригване за по-бърз растеж и гъстота на косата. Хидратиращите маски се усвояват отлично."
      : "💇‍♀️ **Коса и Красота**: Луната намалява. Подстригването сега запазва формата на прическата за по-дълго. Идеален момент за почистване на кожата и пилинг.";

    const healthTips = isWaxing
      ? "🧘‍♀️ **Здраве и Тяло**: Организмът натрупва енергия и усвоява витамините по-бързо. Препоръчва се питателна храна и активен спорт."
      : "🧘‍♀️ **Здраве и Тяло**: Чудесен период за детоксикация, пречистване на организма, намаляване на захарта и освобождаване от токсини.";

    const gardenTips = isWaxing
      ? "🌿 **Градина и Растения**: Соковете на растенията се издигат нагоре. Засаждайте цветя и зеленчуци, които дават плод над земята."
      : "🌿 **Градина и Растения**: Соковете се спускат към корените. Подходящо време за торене, подрязване и засаждане на кореноплодни.";

    return {
      date: `${day}.${month}.${year} г.`,
      ageInDays,
      phaseRatio,
      phaseName,
      phaseSymbol,
      phaseDescription,
      illumination,
      isWaxing,
      moonSign,
      tips: {
        beauty: beautyTips,
        health: healthTips,
        garden: gardenTips
      }
    };
  }
}
