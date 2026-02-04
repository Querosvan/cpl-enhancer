// ===== FORCE VERSION RENDER (ISOLATED) =====

// ===== END FORCE VERSION =====
// Icons para MAX HEART POSSIBLE
const ICON_TINY_HTML = '<span class="heart-small3">&#x2764;&#xFE0F;</span>';
const ICON_SMALL_HTML = '<span class="heart-small2">&#x2764;&#xFE0F;</span>';
const ICON_BIG_HTML   = '&#x2764;&#xFE0F;';
const ICON_GOLD_HTML  = '&#x1F49B;';
const ICON_PLAT_HTML  = '&#x1F499;';

const GEAR_ICON_BY_SKILL = {
  Aim: "https://i.postimg.cc/349bq0ZG/aim.png",
  Awareness: "https://i.postimg.cc/xJgFZNPL/awarness.png",
  Determination: "https://i.postimg.cc/C5VTzjBP/determination.png",
  Gamesense: "https://i.postimg.cc/Vr4Hh0Fj/gamesense.png",
  Handling: "https://i.postimg.cc/njTwW914/handling.png",
  Movement: "https://i.postimg.cc/4HdFR48K/movement.png",
  Quickness: "https://i.postimg.cc/kR4hPMjB/quickness.png",
  Teamplay: "https://i.postimg.cc/V06HPs7J/teamplay.png"
};

let missingPopupOpen = false;

const boostTooltip = document.getElementById("boost-tooltip");

function showBoostTooltip(e, finalValue) {
  if (!boostTooltip) return;

const capped = Math.min(120, finalValue);

  boostTooltip.textContent = capped;
  boostTooltip.style.left = e.pageX + 12 + "px";
  boostTooltip.style.top  = e.pageY + 12 + "px";
  boostTooltip.classList.add("visible");
}


function hideBoostTooltip() {
  if (!boostTooltip) return;
  boostTooltip.classList.remove("visible");
}

// backup of the initial skills to allow LOAD (empty) to fully restore initial state
let skills = [
  { name: "Aim", value: 100, max: 100 },
  { name: "Handling", value: 100, max: 100 },
  { name: "Quickness", value: 100, max: 100 },
  { name: "Determination", value: 100, max: 100 },
  { name: "Awareness", value: 100, max: 100 },
  { name: "Teamplay", value: 100, max: 100 },
  { name: "Gamesense", value: 100, max: 100 },
  { name: "Movement", value: 100, max: 100 }
];

const initialSkillsBackup = JSON.parse(JSON.stringify(skills));


// backup do ÃƒÂºltimo LOAD
let loadedSkillsBackup = JSON.parse(JSON.stringify(skills));
let loadedName = "Spidevil";
let loadedAge = "15yo (day 1)";

const skillsList = document.getElementById("skills-list");
const totalCurrent = document.getElementById("total-skill-current");
const totalMax = document.getElementById("total-skill-max");

const heartBtn = document.querySelector(".heart-grey-btn");
const moraleBtn = document.querySelector(".morale-btn");
const maxBtn = document.querySelector(".max-btn");

const START_DATE = new Date(2025, 3, 28);
const SEASON_LENGTH = 35;

function whenGamesReached(currentSeason, currentDay, gamesAlready, gamesRequired) {
  let games = gamesAlready;
  let day = currentDay;
  let season = currentSeason;

  if (games >= gamesRequired) {
    return { season, day };
  }

  while (true) {
    const gamesToday = GAMES_PER_DAY[day] || 0;
    games += gamesToday;

    if (games >= gamesRequired) {
      return { season, day };
    }

    day++;

    if (day > SEASON_LENGTH) {
      day = 1;
      season++;
    }
  }
}


const GAMES_PER_DAY = {
  4: 2,
  5: 2,
  6: 1,
  7: 1,
  8: 2,
  9: 2,
  10: 2,
  11: 2,
  12: 2,
  13: 1,
  14: 1,
  15: 2,
  16: 2,
  17: 2,
  18: 2,
  19: 2,
  20: 1,
  21: 1,
  22: 2,
  23: 2,
  24: 2,
  25: 2,
  26: 2,
  27: 1,
  28: 1,
  29: 2,
  32: 7
};

let extendedCareer = false; // OFF por defeito
function getMaxCareerAge() {
  return extendedCareer ? 42 : 40;
}
let heartState = 0;
let moraleState = 0;
let maxMode = false;
let fraggerActive = false;
const heartBoosts = {
  0: 0,     // None
  1: 0.5,   // Small
  2: 1,     // Medium
  3: 3,     // Big
  4: 5,     // Gold
  5: 8      // Platinum
};
const moraleBoosts = { 0: 0, 1: 1, 2: 2, 3: 3 };

function updateBoostLabels() {
  const heartLabel = document.getElementById("heart-boost-label");
  const moraleLabel = document.getElementById("morale-boost-label");

  if (heartLabel) {
    const val = heartBoosts[heartState] || 0;
    heartLabel.textContent = `+${val}%`;
  }

  if (moraleLabel) {
    const val = moraleBoosts[moraleState] || 0;
    moraleLabel.textContent = `+${val}%`;
  }
}


const equipped = { mousepad: null, mouse: null, keyboard: null, headset: null };
let equipmentBoosts = {};

/* ---------------- DATE & CLOCK ---------------- */
function calculateGameDate() {

  const now = new Date();
  const diffMs = now - START_DATE;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 0) return { season: 1, day: 1 };
  return {
    season: Math.floor(diffDays / SEASON_LENGTH) + 1,
    day: (diffDays % SEASON_LENGTH) + 1
  };
}
function updateGameDay() {
  const gd = calculateGameDate();
  const el = document.getElementById("game-day");
  if (el) el.textContent = `S${gd.season} - ${gd.day}/${SEASON_LENGTH}`;

  updateRetireDisplayIfNeeded();
  computeMaxCareerHeart();
}

updateGameDay();
setInterval(updateGameDay, 60000);

function renderMiniGear() {
  const svg = document.getElementById("gear-minimap");
  if (!svg) return;

  svg.innerHTML = "";

  const CELL = 14;
  const GAP = 2;
  const DOT = 6;

  // desenha grelha 4x4
  const OUTER_W = 4 * CELL + 3 * GAP;
const OUTER_H = 4 * CELL + 3 * GAP;

const outer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
outer.setAttribute("x", 0);
outer.setAttribute("y", 0);
outer.setAttribute("width", OUTER_W);
outer.setAttribute("height", OUTER_H);
outer.setAttribute("fill", "none");
outer.setAttribute("stroke", "rgba(255,255,255,0.25)");
outer.setAttribute("stroke-width", "2");

svg.appendChild(outer);
for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = col * (CELL + GAP);
      const y = row * (CELL + GAP);

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", CELL);
      rect.setAttribute("height", CELL);
      rect.setAttribute("fill", "none");
      rect.setAttribute("stroke", "rgba(255, 255, 255, 0.44)");
      rect.setAttribute("stroke-width", "1");

      svg.appendChild(rect);
    }
  }

  const order = ["mousepad", "mouse", "keyboard", "headset"];

  order.forEach((cat, row) => {
    const item = equipped[cat];
    if (!item) return;

    const col = EQUIPMENT[cat].findIndex(e => e.name === item.name);
    if (col === -1) return;

    const cx =
      col * (CELL + GAP) + CELL / 2;
    const cy =
      row * (CELL + GAP) + CELL / 2;

    const dot = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    dot.setAttribute("x", cx - DOT / 2);
    dot.setAttribute("y", cy - DOT / 2);
    dot.setAttribute("width", DOT);
    dot.setAttribute("height", DOT);
    dot.setAttribute("rx", "1");
    dot.setAttribute("fill", "#ff7a00");

    svg.appendChild(dot);
  });
}



/* ---------------- CALCS ---------------- */
function computeSkillValues(s) {
  const equipBoost = equipmentBoosts[s.name] || 0;
  const base = maxMode ? s.max : s.value;
let pctTotal = heartBoosts[heartState] + moraleBoosts[moraleState];



const pct = pctTotal / 100;  const pctBoost = base * pct;
  const afterPercent = base + pctBoost;
  const final = afterPercent + equipBoost;
  return { base, equipBoost, pctBoost, afterPercent, final };
}

/**
 * updateTotals
 * - totalCurrent shows the sum of base values (or max values when maxMode)
 * - intentionally does NOT include heart/morale/gear (per requirement)
 * - totalMax shows sum of all skill maximums
 */
function updateTotals() {
    let totalCurrentValue = 0;
    let totalMaxValue = 0;

    skills.forEach(s => {
        totalCurrentValue += maxMode ? s.max : s.value;
        totalMaxValue += s.max;
    });

    if (totalCurrent) totalCurrent.textContent = totalCurrentValue;
    if (totalMax) totalMax.textContent = "/" + totalMaxValue;
}

function alignEditColumn() {
    const editColumn = document.querySelector(".skill-edit-column");
    if (!editColumn || !skillsList) return;
    editColumn.style.top = skillsList.offsetTop + "px";
}






    function parseCardText(txt) {
    const lines = txt
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0); // remove vazios

    const skillNames = [
        "Aim", "Handling", "Quickness", "Determination",
        "Awareness", "Teamplay", "Gamesense", "Movement"
    ];

    const parsed = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // -----------------------------------
        // 1) FORMATO INLINE: "Skill 42/?"
        // -----------------------------------
        const inlineMatch = line.match(/^(\w+)\s+(\d+)\s*\/\s*(\d+|\?)$/i);
        if (inlineMatch && skillNames.includes(inlineMatch[1])) {
            const name = inlineMatch[1];
            const value = parseInt(inlineMatch[2], 10);
            const rawMax = inlineMatch[3];
            const max = rawMax === "?" ? null : parseInt(rawMax, 10);

            parsed.push({ name, value, max });
            continue;
        }

        // -----------------------------------
        // 2) FORMATO 3 LINHAS:
        // Skill
        // 42
        // /93   ou   / ?   ou   ?
        // -----------------------------------
        if (skillNames.includes(line)) {
            const name = line;

            const valLine = lines[i + 1] || "";
            const maxLine = lines[i + 2] || "";

            const value = parseInt(valLine, 10) || 0;

            // extrai apenas nÃƒÂºmero ou ?
            let rawMax = maxLine.replace("/", "").trim();
            let max = null;

            if (/^\d+$/.test(rawMax)) {
                max = parseInt(rawMax, 10);
            }

            parsed.push({ name, value, max });
        }
    }

    return {
        playerName: lines[0] || "Unknown",
        playerAge: lines.find(l => /yo/.test(l)) || "",
        skills: parsed
    };
}







/* ---------------- PLAYER AGE PARSING & RETIRE CALC ---------------- */
function parseAgeString(ageStr) {
  if (!ageStr || typeof ageStr !== "string") return { age: null, birthdayDay: null };
  const ageMatch = ageStr.match(/(\d+)\s*yo/);
  const bdayMatch = ageStr.match(/day\s*(\d+)/i);
  const age = ageMatch ? parseInt(ageMatch[1], 10) : null;
  const birthdayDay = bdayMatch ? parseInt(bdayMatch[1], 10) : null;
  return { age, birthdayDay };
}

function computeRetireSeasonFrom(age, birthdayDay) {
  const gd = calculateGameDate();
  const currentSeason = gd.season;
  const currentDay = gd.day;

  if (age === null) {
    return { remainingSeasons: null, finalSeason: null, reason: "unknown age" };
  }

  const maxAge = getMaxCareerAge();

if (age >= maxAge) {
  return { remainingSeasons: 0, finalSeason: currentSeason, reason: "already max age" };
}

let remaining = maxAge - age;
  if (birthdayDay !== null && typeof birthdayDay === "number") {
    if (birthdayDay > currentDay) {
      remaining = remaining - 1;
    }
  }

  if (remaining < 0) remaining = 0;
  const finalSeason = currentSeason + remaining;
  return { remainingSeasons: remaining, finalSeason, reason: "ok" };
}

function updateRetireElement(ageStr) {
  const retireEl = document.getElementById("retire-at");
  if (!retireEl) return;

  const { age, birthdayDay } = parseAgeString(ageStr);
  const r = computeRetireSeasonFrom(age, birthdayDay);
  if (r.remainingSeasons === null) {
    retireEl.textContent = "\u2014";
    return;
  }
  const maxAge = getMaxCareerAge();
retireEl.textContent = `S${r.finalSeason} (${maxAge}yo)`;
}

function updateRetireDisplayIfNeeded() {
  const ageEl = document.querySelector(".player-age");
  if (!ageEl) return;
  updateRetireElement(ageEl.textContent || "");
}

/* ---------------- RENDER SKILLS ---------------- */
function renderSkills() {
  if (!skillsList) return;
  skillsList.innerHTML = "";

  skills.forEach(s => {
    const v = computeSkillValues(s);

    const baseVal = v.base;
    const finalVal = v.final;

    // ------------------------------
    // WIDTHS (apenas 2 segmentos)
    // ------------------------------
    const baseW = Math.min(baseVal, 100);
    const boostW = Math.max(0, Math.min(finalVal, 100) - baseW);

    const row = document.createElement("div");
    row.className = "skill-row";

    const name = document.createElement("div");
    name.className = "skill-name";
    name.textContent = s.name;
    name.style.color = finalVal >= 100 ? "#f7f8c9" : "#ffffff";

    // LIMIT REACHED (value == max, mas nÃƒÂ£o 100)
if (s.value === s.max && s.max < 100 && finalVal < 100) {
    name.style.color = "#ffffffff"; // verde premium
    
}
    // ===============================
// LIMIT REACHED (value === max, mas < 100)
// ===============================
if (s.value === s.max && s.max < 100) {
    name.classList.add("limit-reached");
} else {
    name.classList.remove("limit-reached");
}

    const bar = document.createElement("div");
    bar.className = "skill-bar";

    const limit = document.createElement("div");
    limit.className = "skill-limit";
    limit.style.width = s.max + "%";

    // Se o limite ÃƒÂ© 100 \\u2192 arredondado dos dois lados
    if (s.max === 100) {
        limit.style.borderRadius = "999px";
    } else {
        limit.style.borderRadius = "999px 0 0 999px";
}

bar.appendChild(limit); 

    // ----------------------------------
    // BASE (sempre laranja)
    // ----------------------------------
    const baseF = document.createElement("div");
    baseF.className = "skill-fill";
    baseF.style.left = "0";
    baseF.style.width = baseW + "%";
    baseF.style.zIndex = 1;
    baseF.style.backgroundColor = "#ff7a00"; // laranja
    baseF.style.borderRadius = "999px 0 0 999px";
    bar.appendChild(baseF);

    // ----------------------------------
    // BOOST TOTAL (HM + morale + gear)
    // ----------------------------------
let boostF = null;

// BOOST (HM + morale + gear) como ÃƒÂºnico segmento de boost
if (boostW > 0) {
  boostF = document.createElement("div");
  boostF.className = "skill-fill-boost";
  boostF.style.left = baseW + "%";
  boostF.style.width = boostW + "%";
  boostF.style.zIndex = 2;
  
  

  // Se final >= 100 \\u2192 dourado + brilho + canto redondo
  if (finalVal >= 100) {
    boostF.style.backgroundColor = "#f7e395";
    boostF.style.borderRadius = "0 999px 999px 0";
    boostF.style.boxShadow = "0 0 10px rgba(238,223,192,0.75)";
  } else {
    boostF.style.backgroundColor = "#f5be9e";
    boostF.style.borderRadius = "0";
  }

  bar.appendChild(boostF);
}

// SE NÃƒÆ’O EXISTIR BOOST \\u2192 base atinge 100 sozinha
if (finalVal >= 100 && boostW === 0) {
  baseF.style.backgroundColor = "#edeec0";
  baseF.style.borderRadius = "999px";
  baseF.style.boxShadow = "0 0 10px rgba(238,223,192,0.80)";
}

if (finalVal >= 100) {
  baseF.style.backgroundColor = "#edeec0";
  baseF.style.boxShadow =
    "0 0 12px rgba(238,223,192,0.25), 0 0 28px rgba(255, 255, 255, 0.15)";

  if (boostF) {
    boostF.style.backgroundColor = "#f5be9e";
    boostF.style.boxShadow = "none";
  }

} else {
  baseF.style.backgroundColor = "#f56e0e";
  baseF.style.boxShadow = "none";

  if (boostF) {
    boostF.style.backgroundColor = "#f5be9e";
    boostF.style.boxShadow = "none";
  }
}



    // ----------------------------------
    // VALORES
    // ----------------------------------
    const val = document.createElement("div");
    val.className = "skill-value";

    const cur = document.createElement("span");
    cur.className = "skill-current";
    cur.textContent = maxMode ? s.max : Math.round(v.base);
    if (finalVal >= 100) cur.style.color = "#ee6b0e";
    // LIMIT REACHED (value == max, mas nÃƒÂ£o 100)
    if (s.value === s.max && s.max < 100 && finalVal < 100) {
        cur.style.color = "#ffffffff";
    }

    const mx = document.createElement("span");
    mx.className = "skill-max";
    mx.textContent = "/" + s.max;

    val.appendChild(cur);
    val.appendChild(mx);

    row.appendChild(name);
    row.appendChild(bar);
    row.appendChild(val);

bar.addEventListener("mouseenter", e => {
  showTooltipForSkill(s, e);
});

bar.addEventListener("mousemove", e => {
  showTooltipForSkill(s, e);
});

bar.addEventListener("mouseleave", () => {
  hideTooltip();
});


row.addEventListener("mouseleave", hideTooltip);


    skillsList.appendChild(row);
  });
// ===== UPDATE RIGHT COLUMN BUTTONS (ONLY IMAGE BUTTONS) =====
if (globalButtonsContainer) {
    globalButtonsContainer.innerHTML = "";

    skills.forEach((s, index) => {

        const v = computeSkillValues(s);

        // LINHA DA COLUNA DIREITA
        const row = document.createElement("div");
        row.className = "edit-row";

        // BOTÃƒÆ’O -
        const minus = document.createElement("img");
        minus.src = "https://i.postimg.cc/qBCQ18DZ/button.png";
        minus.className = "edit-btn-img";
        minus.addEventListener("click", () => applySkillChange(index, -1));

        // BOTÃƒÆ’O +
        const plus = document.createElement("img");
        plus.src = "https://i.postimg.cc/SQzVgW1v/button.png";
        plus.className = "edit-btn-img";
        plus.addEventListener("click", () => applySkillChange(index, +1));

        // BARRA 100-120
        const boostContainer = document.createElement("div");
        boostContainer.style.display = "flex";
        boostContainer.style.flexDirection = "column";
        boostContainer.style.alignItems = "center";

        const boostWrap = document.createElement("div");
boostWrap.className = "skill-boost-wrap";

boostWrap.addEventListener("mouseenter", e => {
  showBoostTooltip(e, v.final);
});

boostWrap.addEventListener("mousemove", e => {
  showBoostTooltip(e, v.final);
});

boostWrap.addEventListener("mouseleave", hideBoostTooltip);

        const boostFill = document.createElement("div");
        boostFill.className = "skill-boost-fill";

        const hiddenBoost = Math.max(0, Math.min(v.final - 100, 20));
        const pct = (hiddenBoost / 20) * 100;
        boostFill.style.width = pct + "%";

        boostWrap.appendChild(boostFill);



        // ORDEM IMPORTANTE
        row.appendChild(minus);
        row.appendChild(plus);
        boostContainer.appendChild(boostWrap);
row.appendChild(boostContainer);

        globalButtonsContainer.appendChild(row);
    });
}




  updateTotals();
  alignEditColumn();
}

/* ==========================
   GLOBAL EDIT COLUMN LOGIC
========================== */

let globalMode = "S"; // S = editar value, L = editar max
const globalModeBtn = document.getElementById("mode-btn");
const globalButtonsContainer = document.getElementById("edit-buttons-container");

function updateModeButton() {
    if (globalMode === "S") {
        globalModeBtn.style.backgroundImage =
            "url('https://i.postimg.cc/BQFFWpxs/Sbutton.png')";
    } else {
        globalModeBtn.style.backgroundImage =
            "url('https://i.postimg.cc/vHnnRhWy/Lbutton.png')";
    }
}

globalModeBtn.addEventListener("click", () => {
    globalMode = globalMode === "S" ? "L" : "S";
    updateModeButton();
});

updateModeButton();





function applySkillChange(idx, delta) {
    const s = skills[idx];

    let turnMaxModeOffAfterChange = false;

    /* ================================
       SE MAX MODE ESTIVER ATIVO
       ================================ */
if (maxMode) {
    // guardar valor real original apenas 1 vez
    if (s._backupValue === undefined) s._backupValue = s.value;

    // valor a editar passa a ser o MAX (valor visÃƒÂ­vel em MAX MODE)
    s.value = s.max;

    turnMaxModeOffAfterChange = true;
}

    /* ================================
       REGRAS S
       ================================ */
    if (globalMode === "S") {

        if (delta === 1 && s.value === s.max && s.value < 100) {
            // S+ quando value == max \\u2192 sobem ambos
            s.value++;
            s.max++;
        }

        else if (delta === -1 && s.value === s.max) {
            // S- quando value == max \\u2192 desce sÃƒÂ³ o value
            if (s.value > 0) s.value--;
        }

        else if (delta === 1 && s.value < s.max && s.value < 100) {
            // S+ normal
            s.value++;
        }

        else if (delta === -1 && s.value > 0) {
            // S- normal
            s.value--;
        }
    }

    /* ================================
       REGRAS L
       ================================ */
    else {

        if (delta === 1 && s.max === s.value && s.max < 100) {
            // L+ quando max == value \\u2192 sÃƒÂ³ sobe max
            s.max++;
        }

        else if (delta === -1 && s.max === s.value && s.max > 0) {
            // L- quando max == value \\u2192 descem ambos
            s.max--;
            s.value--;
        }

        else if (delta === 1 && s.max < 100) {
            // L+ normal
            s.max++;
        }

        else if (delta === -1 && s.max > s.value) {
            // L- normal
            s.max--;
        }
    }

    /* ================================
       LIMITE FINAL (0-100)
       ================================ */
    s.value = Math.max(0, Math.min(100, s.value));
    s.max   = Math.max(0, Math.min(100, s.max));

    /* ================================
       SE FIZ CLICK EM +/- NO MAX MODE
       \\u2192 DESLIGAR MAX MODE AUTOMATICAMENTE
       ================================ */
    if (turnMaxModeOffAfterChange) {
        maxMode = false;
        maxBtn.classList.remove("max-active");

        // atualizar o backup para o novo valor real
        s._backupValue = s.value;
    }
    updateTotals();
    renderSkills();
    computeMaxCareerHeart();
    renderMiniGear();
}





/* ---------------- TOOLTIP ---------------- */
const tooltip = document.getElementById("skill-tooltip");
function showTotalSkillTooltip(e) {
  if (!tooltip) return;

  document.getElementById("tooltip-skill-name").textContent = "TOTAL SKILL";

  let baseTotal = 0;
  let limitTotal = 0;
  let gearBoostTotal = 0;
  let percentBoostTotal = 0;

  skills.forEach(s => {
    const v = computeSkillValues(s);
    baseTotal += maxMode ? s.max : s.value;
    limitTotal += s.max;
    gearBoostTotal += v.equipBoost || 0;
    percentBoostTotal += v.pctBoost || 0;
  });

  const boostTotal = percentBoostTotal + gearBoostTotal;
  const totalFinal = baseTotal + boostTotal;

  document.getElementById("tooltip-base").textContent  = baseTotal.toFixed(0);
  document.getElementById("tooltip-boost").textContent = boostTotal.toFixed(2);
  document.getElementById("tooltip-limit").textContent = limitTotal;
  document.getElementById("tooltip-total").textContent = totalFinal.toFixed(2);

  document.getElementById("tooltip-heart").textContent  = `+${heartBoosts[heartState]}%`;
  document.getElementById("tooltip-morale").textContent = `+${moraleBoosts[moraleState]}%`;
  document.getElementById("tooltip-gear").textContent   = `+${gearBoostTotal}`;

  tooltip.style.left = e.pageX + 15 + "px";
  tooltip.style.top  = e.pageY + 15 + "px";
  tooltip.classList.add("visible");
  tooltip.classList.remove("hidden");
}

function showTooltipForSkill(s, e) {
  const v = computeSkillValues(s);
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };



  set("tooltip-skill-name", s.name);
  set("tooltip-base", Math.round(v.base));
  set("tooltip-limit", s.max);
  set("tooltip-boost", v.pctBoost.toFixed(2));
  set("tooltip-total", v.final.toFixed(2));
  set("tooltip-heart", "+" + heartBoosts[heartState] + "%");
  set("tooltip-morale", "+" + moraleBoosts[moraleState] + "%");
  set("tooltip-gear", "+" + (v.equipBoost || 0));

  if (!tooltip) return;
  tooltip.style.left = e.pageX + 15 + "px";
  tooltip.style.top = e.pageY + 15 + "px";
  tooltip.classList.add("visible");
  tooltip.classList.remove("hidden");
}
function hideTooltip() {
  if (!tooltip) return;
  tooltip.classList.remove("visible");
  tooltip.classList.add("hidden");
}

/* ---------------- LOAD ---------------- */
function loadFromText(loadTextRaw) {
  extendedCareer = false;
  const careerBtn = document.getElementById("career-plus-btn");
  if (careerBtn) careerBtn.classList.remove("active");

  // FULL RESET - same as RUBBER (clears UI state and temp values)
  heartState = 0;
  moraleState = 0;
  maxMode = false;

  if (heartBtn)  heartBtn.className = "action-btn heart-grey-btn";
  if (moraleBtn) moraleBtn.className = "action-btn morale-btn";
  if (maxBtn)    maxBtn.classList.remove("max-active");

  // RESET GEAR
  Object.keys(equipped).forEach(k => equipped[k] = null);
  updateBoostLabels();
  recomputeEquipmentBoosts();
  renderAllEquipmentUI();
  updateGearButtonState();

  // RESET POPUPS
  gearLocked = false;
  if (lockBtn) lockBtn.textContent = "\uD83D\uDD13";
  if (gearPopup) gearPopup.classList.add("hidden");

  gameLocked = false;
  const gameLockBtn = document.getElementById("game-lock-btn");
  if (gameLockBtn) gameLockBtn.textContent = "\uD83D\uDD13";
  if (gamePopup) gamePopup.classList.add("hidden");

  // RESET GAMES
  const gameInput = document.getElementById("game-input");
  const gamesPlayedEl = document.getElementById("games-played");

  if (gameInput) gameInput.value = "0";
  if (gamesPlayedEl) gamesPlayedEl.textContent = "0";
  const gameOkBtn = document.getElementById("game-ok");
  if (gameOkBtn) {
    setTimeout(() => gameOkBtn.click(), 0);
  }

  // FORCE BASE STATE
  updateHeartsBasedOnGames(0);
  computeMaxCareerHeart();
  updateGamesButtonState();

  // RESET HEART SEASONS
  const tiny  = document.querySelector(".season-tiny");
  const small = document.querySelector(".season-small");
  const big   = document.querySelector(".season-big");
  const gold  = document.querySelector(".season-gold");
  const plat  = document.querySelector(".season-plat");

  if (tiny)  { tiny.textContent  = ""; tiny.style.color  = ""; }
  if (small) { small.textContent = "S9";  small.style.color = ""; }
  if (big)   { big.textContent   = "S11"; big.style.color   = ""; }
  if (gold)  { gold.textContent  = "S15"; gold.style.color  = ""; }
  if (plat)  { plat.textContent  = "S23"; plat.style.color  = ""; }

  // RESET LOYAL
  const gameImgBtn = document.getElementById("game-img-btn");
  const loyalStatusEl = document.getElementById("loyal-status");

  if (gameImgBtn)   gameImgBtn.classList.remove("active");
  if (loyalStatusEl) loyalStatusEl.textContent = "NO";

  updateGamesButtonState();

  const loadText = typeof loadTextRaw === "string" ? loadTextRaw.trim() : "";
  missingPopupOpen = false;
  if (loadText.length === 0) {
    // restore name + age defaults (initial view)
    const nameEl = document.querySelector(".player-name");
    const ageEl = document.querySelector(".player-age");
    if (nameEl) nameEl.textContent = "Spidevil";
    if (ageEl) ageEl.textContent  = "15yo (day 1)";

    // restore skills to the initial backup (deep copy)
    skills = JSON.parse(JSON.stringify(initialSkillsBackup));
    loadedSkillsBackup = JSON.parse(JSON.stringify(skills));
    loadedName = "Spidevil";
    loadedAge = "15yo (day 1)";

    // recompute and refresh UI
    recomputeEquipmentBoosts();
    renderAllEquipmentUI();
    updateGearButtonState();
    renderSkills();
    computeMaxCareerHeart();
    updateGamesButtonState();
    updateRetireDisplayIfNeeded();
    renderMiniGear();
    return;
  }

  // NORMAL LOAD (text present)
  const data = parseCardText(loadText);

  const nameEl = document.querySelector(".player-name");
  const ageEl = document.querySelector(".player-age");

  if (nameEl) nameEl.textContent = data.playerName;
  if (ageEl)  ageEl.textContent  = data.playerAge;

  if (data.skills.length) {
    skills = data.skills;
  }

  // detectar skills com max = null
  const incomplete = skills.filter(s => s.max === null);
  if (incomplete.length > 0 && !missingPopupOpen) {
    openMissingSkillPopup(incomplete);
    return;
  }

  loadedSkillsBackup = JSON.parse(JSON.stringify(skills));
  loadedName = data.playerName;
  loadedAge = data.playerAge;

  // ensure UI and calculations updated
  recomputeEquipmentBoosts();
  renderAllEquipmentUI();
  updateGearButtonState();
  updateRetireDisplayIfNeeded();
  computeMaxCareerHeart();
  renderSkills();
  renderMiniGear();
}

/* ---------------- HEART / MORALE / MAX ---------------- */
if (heartBtn) {
  heartBtn.addEventListener("click", () => {
    heartState = (heartState + 1) % 6;
    heartBtn.className = "action-btn heart-grey-btn";
    if (heartState > 0) heartBtn.classList.add(`heart-active-${heartState}`);
    renderSkills();
    updateBoostLabels();
  });
}
if (moraleBtn) {
  moraleBtn.addEventListener("click", () => {
    moraleState = (moraleState + 1) % 4;
    moraleBtn.className = "action-btn morale-btn";
    if (moraleState > 0) moraleBtn.classList.add(`morale-active-${moraleState}`);
    renderSkills();
    updateBoostLabels();
  });
}
if (maxBtn) {
  maxBtn.addEventListener("click", () => {
    maxMode = !maxMode;
    maxBtn.classList.toggle("max-active");

    skills.forEach(s => {
      if (maxMode) {
        // guardar valor original
        s._backupValue = s.value;

        // value passa a ser igual ao max
        s.value = s.max;
      } else {
        // restaurar o valor original
        if (s._backupValue !== undefined) {
          s.value = s._backupValue;
        }
      }
    });

    renderSkills();
  });
}

/* ---------------- EQUIPMENT ICONS ---------------- */
const GEAR_ICONS = {
  mousepad: "https://i.postimg.cc/W4SQ1NJV/mp1.png",
  mouse: "https://i.postimg.cc/pdPwvhyr/m1.png",
  keyboard: "https://i.postimg.cc/BvJr3Ltt/k1.png",
  headset: "https://i.postimg.cc/5tfhJYj6/h1.png"
};

/* ---------------- EQUIPMENT DATA & UI ---------------- */
const EQUIPMENT = {
  mousepad: [
    { name: "AJ Pad", boosts: { Handling: 2, Quickness: 1 }, tokens: "H2 Q1" },
    { name: "Noctron", boosts: { Aim: 1, Quickness: 2 }, tokens: "A1 Q2" },
    { name: "Citus", boosts: { Aim: 1, Handling: 1, Quickness: 1 }, tokens: "A1 H1 Q1" },
    { name: "Armageddon", boosts: { Aim: 1, Handling: 2 }, tokens: "A1 H2" }
  ],
  mouse: [
    { name: "Aquila Fly", boosts: { Aim: 2, Handling: 1 }, tokens: "A2 H1" },
    { name: "Aurora 3330", boosts: { Aim: 1, Quickness: 2 }, tokens: "A1 Q2" },
    { name: "Hero", boosts: { Aim: 1, Handling: 1, Quickness: 1 }, tokens: "A1 H1 Q1" },
    { name: "Cyborg", boosts: { Handling: 1, Quickness: 2 }, tokens: "H1 Q2" }
  ],
  keyboard: [
    { name: "Mintaka", boosts: { Determination: 1, Movement: 2 }, tokens: "D1 M2" },
    { name: "Quasar RGB", boosts: { Determination: 3 }, tokens: "D3" },
    { name: "Alnitak", boosts: { Determination: 3, Movement: 1 }, tokens: "D3 M1" },
    { name: "Pulsar", boosts: { Movement: 3 }, tokens: "M3" }
  ],
  headset: [
    { name: "Pentagon", boosts: { Teamplay: 1, Gamesense: 2 }, tokens: "T1 G2" },
    { name: "Enigma", boosts: { Awareness: 2, Teamplay: 1 }, tokens: "Aw2 T1" },
    { name: "Gemini", boosts: { Awareness: 2, Gamesense: 1 }, tokens: "Aw2 G1" },
    { name: "Singularity", boosts: { Awareness: 1, Teamplay: 1, Gamesense: 1 }, tokens: "Aw1 T1 G1" }
  ]
};

function renderCategory(id, items) {
  const cont = document.getElementById(id);
  if (!cont) return;

  cont.innerHTML = "";
  cont.classList.add("gear-row");

  const cat = id.replace("gear-", "");

  const img = document.createElement("img");
  img.src = GEAR_ICONS[cat];
  img.className = "gear-row-icon";

  const grid = document.createElement("div");
  grid.className = "gear-grid";

  items.forEach(it => {
    const b = document.createElement("div");
    b.className = "gear-item";

    if (equipped[cat] && equipped[cat].name === it.name) {
      b.classList.add("equipped");
    }

const boostsHtml = Object.entries(it.boosts)
  .map(([skill, val]) => `
    <span class="gear-boost">
      +${val}
      <img
        class="gear-boost-icon"
        src="${GEAR_ICON_BY_SKILL[skill]}"
        alt="${skill}"
      />
    </span>
  `)
  .join(" ");

b.innerHTML = `
  <div class="gear-name">${it.name}</div>
  <div class="gear-boosts">
    ${boostsHtml}
  </div>
`;


    b.addEventListener("click", () => {
      equipped[cat] =
        equipped[cat] && equipped[cat].name === it.name ? null : it;

      recomputeEquipmentBoosts();
      updateGearButtonState();
      renderAllEquipmentUI();
      renderSkills();
      renderMiniGear();
    });

    grid.appendChild(b);
  });

// highlight icon when any item is equipped
if (equipped[cat]) {
    img.classList.add("icon-equipped");
} else {
    img.classList.remove("icon-equipped");
}
 

cont.appendChild(img);
cont.appendChild(grid);
}



function renderAllEquipmentUI() {
  renderCategory("gear-mousepad", EQUIPMENT.mousepad);
  renderCategory("gear-mouse", EQUIPMENT.mouse);
  renderCategory("gear-keyboard", EQUIPMENT.keyboard);
  renderCategory("gear-headset", EQUIPMENT.headset);
}

function recomputeEquipmentBoosts() {
  equipmentBoosts = {};
  Object.values(equipped).forEach(it => {
    if (!it) return;
    Object.entries(it.boosts).forEach(([skill, val]) => {
      equipmentBoosts[skill] = (equipmentBoosts[skill] || 0) + val;
    });
  });
}

/* Updates gear button visual (brightness) if at least one item is equipped */
function updateGearButtonState() {
  const gearBtn = document.querySelector(".gear-btn");
  const hasGear = Object.values(equipped).some(v => v !== null);
  if (!gearBtn) return;
  if (hasGear) gearBtn.classList.add("gear-active");
  else gearBtn.classList.remove("gear-active");
}

/* ---------------- GAMES BUTTON ACTIVE STATE ---------------- */
function updateGamesButtonState() {
  const gamesBtn = document.querySelector(".games-btn");
  if (!gamesBtn) return;
  const gamesPlayedEl = document.getElementById("games-played");
  const gamesPlayed = gamesPlayedEl ? parseInt(gamesPlayedEl.textContent, 10) || 0 : 0;
  const loyalEl = document.getElementById("loyal-status");
  const loyal = loyalEl && loyalEl.textContent === "YES";

  if (gamesPlayed > 0 || loyal) {
    gamesBtn.classList.add("games-active");
  } else {
    gamesBtn.classList.remove("games-active");
  }
}
function openMissingSkillPopup(list) {
  if (missingPopupOpen) return; // Ã¢â€ºâ€ impede abrir de novo
    missingPopupOpen = true;      // \\uD83D\\uDD12 marca como aberto
    const popup = document.getElementById("missing-skill-popup");
    const container = document.getElementById("missing-skill-fields");

    container.innerHTML = "";

    list.forEach(s => {
        const div = document.createElement("div");
        div.className = "missing-row";

        div.innerHTML = `
            <span>${s.name}</span>
            <input
                type="text"
                class="missing-input"
                inputmode="numeric"
                id="miss-${s.name}"
                placeholder="70-100"
            >
        `;

        container.appendChild(div);
    });

    document.getElementById("modal-overlay").classList.remove("hidden");
    popup.classList.remove("hidden");

    // ===== INPUT AUTO-VALIDATION (70-100) =====
    const inputs = [...document.querySelectorAll('.missing-input')];

    inputs.forEach((input, index) => {

        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '');
            const value = input.value;

            // mÃƒÂ¡ximo 3 dÃƒÂ­gitos
            if (value.length > 3) {
                input.value = '';
                return;
            }

            // standby 10
            if (value === '10') return;

            // 3 dÃƒÂ­gitos
            if (value.length === 3) {
                if (value === '100') {
                    inputs[index + 1]?.focus();
                    return;
                }
                input.value = '';
                return;
            }

            // 2 dÃƒÂ­gitos
            if (value.length === 2) {
                const num = Number(value);

                if (num >= 70 && num <= 99) {
                    inputs[index + 1]?.focus();
                    return;
                }

                input.value = '';
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '') {
                inputs[index - 1]?.focus();
            }
        });

    });

    document.getElementById("missing-skill-confirm").onclick = () => {
        let allGood = true;

        list.forEach(s => {
            const field = document.getElementById(`miss-${s.name}`);
            const val = parseInt(field.value, 10);

            if (!(val >= 70 && val <= 100)) {
                allGood = false;
                field.style.border = "1px solid red";
            } else {
                field.style.border = "";
                s.max = val;
                s.max = Number(val); // forÃƒÂ§a nÃƒÂºmero, nunca null
            }
        });

        if (!allGood) return;

        popup.classList.add("hidden");
        document.getElementById("modal-overlay").classList.add("hidden");
missingPopupOpen = false; // \\uD83D\\uDD13 permite novo popup num prÃƒÂ³ximo LOAD
        loadedSkillsBackup = JSON.parse(JSON.stringify(skills));
        loadedName = document.querySelector(".player-name").textContent;
        loadedAge  = document.querySelector(".player-age").textContent;

        recomputeEquipmentBoosts();
        renderAllEquipmentUI();
        updateGearButtonState();
        renderSkills();
        computeMaxCareerHeart();
        updateGamesButtonState();
        updateRetireDisplayIfNeeded();
        renderMiniGear();
    };
}



/* ---------------- POPUP (open / apply / drag / lock / outside click) ---------------- */
const gearPopup = document.getElementById("gear-popup");
const gearBtn = document.querySelector(".gear-btn");
const gearApplyBtn = document.getElementById("gear-apply-btn");
const lockBtn = document.getElementById("gear-lock-btn");

/* --- GEAR BUTTON TOGGLE (respeita lock) --- */
if (gearBtn) {
  gearBtn.addEventListener("click", () => {
    if (!gearLocked) {
      if (gearPopup.classList.contains("hidden")) gearPopup.classList.remove("hidden");
      else gearPopup.classList.add("hidden");
      return;
    }
    if (gearLocked) gearPopup.classList.remove("hidden");
  });
}

if (gearApplyBtn) {
  gearApplyBtn.addEventListener("click", () => {
    if (!gearPopup) return;
    gearPopup.classList.add("hidden");
    recomputeEquipmentBoosts();
    updateGearButtonState();
    renderSkills();
    renderMiniGear();
  });
}

/* GAME POPUP */
const gamePopup = document.getElementById("game-popup");
const gamesBtn = document.querySelector(".games-btn");
const gameLockBtn = document.getElementById("game-lock-btn");
const gameDrag = document.getElementById("game-drag");

let gameLocked = false;
if (gameLockBtn) gameLockBtn.textContent = "\uD83D\uDD13";

if (gamesBtn) {
  gamesBtn.addEventListener("click", () => {
    if (!gameLocked) {
      if (gamePopup.classList.contains("hidden")) gamePopup.classList.remove("hidden");
      else gamePopup.classList.add("hidden");
      return;
    }
    gamePopup.classList.remove("hidden");
  });
}

if (gameLockBtn) {
  gameLockBtn.addEventListener("click", () => {
    gameLocked = !gameLocked;
    gameLockBtn.textContent = gameLocked ? "\uD83D\uDD12" : "\uD83D\uDD13";
  });
}

document.addEventListener("mousedown", (e) => {
  if (!gamePopup || gamePopup.classList.contains("hidden")) return;
  if (gameLocked) return;
  const inner = gamePopup.querySelector(".game-popup-inner");
  const isBtn = e.target.closest(".games-btn");
  const inside = inner && inner.contains(e.target);
  if (!inside && !isBtn) gamePopup.classList.add("hidden");
});

/* DRAG for game popup */
(function () {
  if (!gamePopup || !gameDrag) return;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  function getEvent(e) { return e.touches ? e.touches[0] : e; }
  function onDown(e) { const ev = getEvent(e); dragging = true; const rect = gamePopup.getBoundingClientRect(); offsetX = ev.clientX - rect.left; offsetY = ev.clientY - rect.top; document.body.style.userSelect = "none"; if (e.cancelable) e.preventDefault(); }
  function onUp() { dragging = false; document.body.style.userSelect = "auto"; }
  function onMove(e) { if (!dragging) return; const ev = getEvent(e); gamePopup.style.left = (ev.clientX - offsetX) + "px"; gamePopup.style.top = (ev.clientY - offsetY) + "px"; if (e.cancelable) e.preventDefault(); }
  gameDrag.addEventListener("mousedown", onDown);
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
  gameDrag.addEventListener("touchstart", onDown, { passive: false });
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onUp);
})();

/* DRAG for gear popup */
(function () {
  const popup = document.getElementById("gear-popup");
  const dragArea = document.getElementById("gear-drag");
  if (!popup || !dragArea) return;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  function getClientEvent(e) { return e.touches ? e.touches[0] : e; }
  function onDown(e) { const ev = getClientEvent(e); dragging = true; const rect = popup.getBoundingClientRect(); offsetX = ev.clientX - rect.left; offsetY = ev.clientY - rect.top; document.body.style.userSelect = "none"; dragArea.style.cursor = "grabbing"; if (e.cancelable) e.preventDefault(); }
  function onUp() { dragging = false; document.body.style.userSelect = "auto"; dragArea.style.cursor = "grab"; }
  function onMove(e) { if (!dragging) return; const ev = getClientEvent(e); let newLeft = ev.clientX - offsetX; let newTop = ev.clientY - offsetY; const pad = 8; const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0); const rect = popup.getBoundingClientRect(); const w = rect.width; if (newLeft < pad) newLeft = pad; if (newTop < pad) newTop = pad; if (newLeft + w > vw - pad) newLeft = vw - w - pad; popup.style.left = newLeft + "px"; popup.style.top = newTop + "px"; if (e.cancelable) e.preventDefault(); }
  dragArea.addEventListener("mousedown", onDown);
  document.addEventListener("mouseup", onUp);
  document.addEventListener("mousemove", onMove);
  dragArea.addEventListener("touchstart", onDown, { passive: false });
  document.addEventListener("touchend", onUp);
  document.addEventListener("touchmove", onMove, { passive: false });
})();

/* LOCK button toggles whether outside clicks close the popup */
let gearLocked = false;
if (lockBtn) {
  lockBtn.textContent = "\uD83D\uDD13";
  lockBtn.addEventListener("click", () => {
    gearLocked = !gearLocked;
    lockBtn.textContent = gearLocked ? "\uD83D\uDD12" : "\uD83D\uDD13";
    lockBtn.classList.toggle("locked", gearLocked);
  });
}

document.addEventListener("mousedown", (e) => {
  if (!gearPopup || gearPopup.classList.contains("hidden")) return;
  if (gearLocked) return;
  const inner = gearPopup.querySelector(".gear-popup-inner");
  if (!inner) return;
  const inside = inner.contains(e.target);
  const isGearBtn = e.target.closest(".gear-btn");
  if (!inside && !isGearBtn) {
    gearPopup.classList.add("hidden");
    updateGearButtonState();
  }
});

/* ---------------- RUBBER RESET ---------------- */
const rubber = document.querySelector(".rubber-btn");
missingPopupOpen = false;
if (rubber) {
  rubber.addEventListener("click", () => {

    // RESET HEART / MORALE / MAX
    heartState = 0;
    moraleState = 0;
    maxMode = false;
extendedCareer = false;
const careerBtn = document.getElementById("career-plus-btn");
if (careerBtn) careerBtn.classList.remove("active");
    if (heartBtn)  heartBtn.className = "action-btn heart-grey-btn";
    if (moraleBtn) moraleBtn.className = "action-btn morale-btn";
    if (maxBtn)    maxBtn.classList.remove("max-active");

    // RESET GEAR
    Object.keys(equipped).forEach(k => equipped[k] = null);
    updateBoostLabels();
    recomputeEquipmentBoosts();
    renderAllEquipmentUI();
    updateGearButtonState();

    // RESET POPUPS
    gearLocked = false;
    if (lockBtn) lockBtn.textContent = "\uD83D\uDD13";
    if (gearPopup) gearPopup.classList.add("hidden");

    gameLocked = false;
    const gameLockBtn = document.getElementById("game-lock-btn");
    if (gameLockBtn) gameLockBtn.textContent = "\uD83D\uDD13";
    if (gamePopup) gamePopup.classList.add("hidden");

    // RESET GAMES
    const gameInput = document.getElementById("game-input");
    const gamesPlayedEl = document.getElementById("games-played");

    if (gameInput) gameInput.value = "0";
    if (gamesPlayedEl) gamesPlayedEl.textContent = "0";
const gameOkBtn = document.getElementById("game-ok");
if (gameOkBtn) {
  setTimeout(() => gameOkBtn.click(), 0);
}
    updateGamesButtonState();

    // RESET HEART SEASONS
    const tiny  = document.querySelector(".season-tiny");
const small = document.querySelector(".season-small");
const big   = document.querySelector(".season-big");
const gold  = document.querySelector(".season-gold");
const plat  = document.querySelector(".season-plat");

if (tiny)  { tiny.textContent  = ""; tiny.style.color  = ""; }
if (small) { small.textContent = "S9";  small.style.color = ""; }
if (big)   { big.textContent   = "S11"; big.style.color   = ""; }
if (gold)  { gold.textContent  = "S15"; gold.style.color  = ""; }
if (plat)  { plat.textContent  = "S23"; plat.style.color  = ""; }

    // RESET LOYAL
    const gameImgBtn = document.getElementById("game-img-btn");
    const loyalStatusEl = document.getElementById("loyal-status");

    if (gameImgBtn)   gameImgBtn.classList.remove("active");
    if (loyalStatusEl) loyalStatusEl.textContent = "NO";

  // RESTAURAR ESTADO BASE DO ÃƒÅ¡LTIMO LOAD
skills = JSON.parse(JSON.stringify(loadedSkillsBackup));

const nameEl = document.querySelector(".player-name");
const ageEl  = document.querySelector(".player-age");

if (nameEl) nameEl.textContent = loadedName;
if (ageEl)  ageEl.textContent  = loadedAge;


    // REFRESH UI
    renderSkills();
    renderMiniGear();
    computeMaxCareerHeart();
    updateRetireDisplayIfNeeded();
  });
}
function updateHeartRequirementLabels(loyal) {
  const rows = document.querySelectorAll(".heart-row");

 const base = [50, 100, 200, 400, 800];
const loyalVals = [37, 75, 150, 300, 600];

  rows.forEach((row, i) => {
    const span = row.querySelector("span:nth-child(2)");
    if (!span) return;

    const value = loyal ? loyalVals[i] : base[i];
    span.textContent = `${value} games \u2192 `;
  });
}
function updateHeartsBasedOnGames(games) {
  const tinyEl  = document.querySelector(".season-tiny");
  const smallEl = document.querySelector(".season-small");
  const bigEl   = document.querySelector(".season-big");
  const goldEl  = document.querySelector(".season-gold");
  const platEl  = document.querySelector(".season-plat");

  if (!tinyEl || !smallEl || !bigEl || !goldEl || !platEl) return;

  const loyal = document.getElementById("loyal-status").textContent === "YES";

  let tinyReq  = 50;
  let smallReq = 100;
  let bigReq   = 200;
  let goldReq  = 400;
  let platReq  = 800;

  if (loyal) {
    tinyReq  = Math.floor(50 * 0.75);
    smallReq = Math.floor(100 * 0.75);
    bigReq   = Math.floor(200 * 0.75);
    goldReq  = Math.floor(400 * 0.75);
    platReq  = Math.floor(800 * 0.75);
  }

  const ageText = document.querySelector(".player-age")?.textContent || "";
  const { age, birthdayDay } = parseAgeString(ageText);

  const gd = calculateGameDate();
  const currentSeason = gd.season;
  const retireSeason = computeRetireSeasonFrom(age, birthdayDay).finalSeason;

function targetMoment(req) {
  return whenGamesReached(
    currentSeason,
    gd.day,
    games,
    req
  );
}



function label(req) {
  const moment = targetMoment(req);

  // impossÃƒÂ­vel antes de reformar
  if (moment.season > retireSeason) return "\u274C";

  if (games < req) {
    const ageAtSeason = age + (moment.season - currentSeason);

    const maxAge = getMaxCareerAge();
if (ageAtSeason >= maxAge) return "\u274C";

    return `S${moment.season} D${moment.day} (${ageAtSeason}yo)`;
  }

  return "\u2705";
}



  tinyEl.textContent  = label(tinyReq);
  smallEl.textContent = label(smallReq);
  bigEl.textContent   = label(bigReq);
  goldEl.textContent  = label(goldReq);
  platEl.textContent  = label(platReq);

  [
    [tinyEl, tinyReq],
    [smallEl, smallReq],
    [bigEl, bigReq],
    [goldEl, goldReq],
    [platEl, platReq]
  ].forEach(([el, req]) => {
    el.style.color = games >= req ? "#76ff76" : "";
  });
}


/* --- DOM READY: setup loyal + games input listeners --- */
document.addEventListener('DOMContentLoaded', () => {
  const careerBtn = document.getElementById("career-plus-btn");

if (careerBtn) {
  careerBtn.addEventListener("click", () => {
    // toggle ON / OFF
    extendedCareer = !extendedCareer;

    // estado visual
    careerBtn.classList.toggle("active", extendedCareer);

    // Ã°Å¸â€Â¥ recalcular tudo o que depende da idade
    updateRetireDisplayIfNeeded();

    const gamesPlayed =
      parseInt(document.getElementById("games-played")?.textContent, 10) || 0;

    updateHeartsBasedOnGames(gamesPlayed);
    computeMaxCareerHeart();
  });
}

  const gameImgBtn = document.getElementById('game-img-btn');
  const loyalStatusEl = document.getElementById('loyal-status');

  if (!gameImgBtn) console.warn('game-img-btn not found in DOM');
  else {
    gameImgBtn.classList.remove('active');
    if (loyalStatusEl) loyalStatusEl.textContent = 'NO';

    let originalGamesBeforeLoyal = null;

gameImgBtn.addEventListener('click', () => {
  const isOn = gameImgBtn.classList.toggle('active');
  const loyalStatusEl = document.getElementById("loyal-status");
  const gamesPlayedEl = document.getElementById("games-played");

  if (loyalStatusEl) loyalStatusEl.textContent = isOn ? 'YES' : 'NO';

  let games = parseInt(gamesPlayedEl.textContent, 10) || 0;

  if (isOn) {
    originalGamesBeforeLoyal = games;
    const reduced = Math.floor(games * 0.75);
    gamesPlayedEl.textContent = reduced;

    updateHeartRequirementLabels(true);   // Ã°Å¸â€Â¥ AQUI
    updateHeartsBasedOnGames(reduced);
  } else {
    if (originalGamesBeforeLoyal !== null) {
      gamesPlayedEl.textContent = originalGamesBeforeLoyal;

      updateHeartRequirementLabels(false); // Ã°Å¸â€Â¥ AQUI
      updateHeartsBasedOnGames(originalGamesBeforeLoyal);
    }
  }

  computeMaxCareerHeart();
  updateGamesButtonState();
});


  }

  const gameInput = document.getElementById("game-input");
  const gameOkBtn = document.getElementById("game-ok");
  const gamesPlayedEl = document.getElementById("games-played");
  const smallSeason = document.querySelector(".season-small");
  const bigSeason   = document.querySelector(".season-big");
  const goldSeason  = document.querySelector(".season-gold");
  const platSeason  = document.querySelector(".season-plat");






    


  if (gameOkBtn) {
    gameOkBtn.addEventListener("click", () => {
      const value = parseInt(gameInput.value, 10);
      if (isNaN(value) || value < 0) return;
      if (gamesPlayedEl) gamesPlayedEl.textContent = value;
      updateHeartsBasedOnGames(value);
      computeMaxCareerHeart();
      updateGamesButtonState();
    });
  }
updateHeartsBasedOnGames(0);
  updateRetireDisplayIfNeeded();
  updateGamesButtonState();
});

/* ---------------- MAX HEART CALC ---------------- */
function computeMaxCareerHeart() {
  const ageEl = document.querySelector(".player-age");
  const gamesPlayedEl = document.getElementById("games-played");
  if (!ageEl || !gamesPlayedEl) return;

  const { age, birthdayDay } = parseAgeString(ageEl.textContent);
  const gamesPlayed = parseInt(gamesPlayedEl.textContent, 10) || 0;

  const gd = calculateGameDate();
  const currentSeason = gd.season;
  const loyal = document.getElementById("loyal-status").textContent === "YES";

let tinyReq  = 50;
let smallReq = 100;
let bigReq   = 200;
let goldReq  = 400;
let platReq  = 800;

if (loyal) {
    tinyReq  = Math.floor(tinyReq * 0.75);
    smallReq = Math.floor(smallReq * 0.75);
    bigReq = Math.floor(bigReq * 0.75);
    goldReq = Math.floor(goldReq * 0.75);
    platReq = Math.floor(platReq * 0.75);
  }

function seasonGainFor(req) {
  return whenGamesReached(
    currentSeason,
    gd.day,
    gamesPlayed,
    req
  );
}



const tinySeason = seasonGainFor(tinyReq);
  const smallSeason = seasonGainFor(smallReq);
  const bigSeason   = seasonGainFor(bigReq);
  const goldSeason  = seasonGainFor(goldReq);
  const platSeason  = seasonGainFor(platReq);

  const maxAge = getMaxCareerAge();
let seasonsLeft = maxAge - age;
  if (birthdayDay && birthdayDay > gd.day) seasonsLeft -= 1;
  const retireSeason = currentSeason + Math.max(seasonsLeft, 0);

  let icon = null;
  let finalSeason = null;

  if (platSeason.season <= retireSeason) {
  icon = ICON_PLAT_HTML;
  finalSeason = "S" + platSeason.season;

} else if (goldSeason.season <= retireSeason) {
  icon = ICON_GOLD_HTML;
  finalSeason = "S" + goldSeason.season;

} else if (bigSeason.season <= retireSeason) {
  icon = ICON_BIG_HTML;
  finalSeason = "S" + bigSeason.season;

} else if (smallSeason.season <= retireSeason) {
  icon = ICON_SMALL_HTML;
  finalSeason = "S" + smallSeason.season;

} else if (tinySeason.season <= retireSeason) {
  icon = ICON_TINY_HTML; // ou ICON_TINY_HTML
  finalSeason = "S" + tinySeason.season;
}



  const maxLine = document.querySelector(".max-heart-final");
  if (!maxLine) return;

  // Se NÃƒÆ’O consegue nenhum \\u2192 mostrar "\\u2014"
  if (!icon) {
    maxLine.innerHTML = `MAX HEART POSSIBLE: \u2014`;
    return;
  }

  maxLine.innerHTML = `MAX HEART POSSIBLE: ${icon} (${finalSeason})`;
}
/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  
  renderAllEquipmentUI();
  recomputeEquipmentBoosts();
  updateGearButtonState();
  renderSkills();
  renderMiniGear();
  updateHeartRequirementLabels(false); 
  updateHeartsBasedOnGames(0);
  computeMaxCareerHeart();
  updateGamesButtonState();
});
document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById("export-card-btn");
const totalBox = document.querySelector(".total-skill-box");

  if (!totalBox) return;

  totalBox.addEventListener("mouseenter", showTotalSkillTooltip);
  totalBox.addEventListener("mousemove", showTotalSkillTooltip);
  totalBox.addEventListener("mouseleave", hideTooltip);
  if (!exportBtn) {
    console.error("EXPORT BUTTON NOT FOUND");
    return;
  }

  exportBtn.addEventListener("click", async () => {
    const card = document.querySelector(".card");
    if (!card) return;

    const nameEl = document.querySelector(".player-name");
    let filename = "skillwhat";

    if (nameEl && nameEl.textContent.trim()) {
      filename = nameEl.textContent
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");
    }

    try {
      // Clona o card para evitar afetar o DOM
      const clone = card.cloneNode(true);
      clone.style.margin = "0";
      clone.style.boxShadow = "none";

      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.top = "-9999px";
      wrapper.style.left = "-9999px";
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const dataUrl = await htmlToImage.toPng(clone, {
        backgroundColor: null,
        width: clone.offsetWidth,
        height: clone.offsetHeight,
        pixelRatio: 2
      });

      document.body.removeChild(wrapper);

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${filename}.png`;
      link.click();
    } catch (e) {
      console.error("EXPORT FAILED", e);
    }
    
  });
});

window.addEventListener("message", (event) => {
  const data = event && event.data;
  if (!data || data.type !== "CPLE_SKILLWHAT_LOAD") return;

  const text = typeof data.text === "string" ? data.text : "";
  loadFromText(text);
});



