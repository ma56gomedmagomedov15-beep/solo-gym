// ===== SOLO LEVELING: СПОРТИВНАЯ СИСТЕМА =====
const EXERCISES = [
  { id: 'pushups',   name: 'Отжимания',        unit: 'повторов',    xpPerUnit: 1,   icon: '💪' },
  { id: 'pullups',   name: 'Подтягивания',     unit: 'повторов',    xpPerUnit: 3,   icon: '🧗' },
  { id: 'squats',    name: 'Приседания',       unit: 'повторов',    xpPerUnit: 0.5, icon: '🦵' },
  { id: 'abs',       name: 'Пресс',            unit: 'повторов',    xpPerUnit: 0.5, icon: '🔥' },
  { id: 'plank',     name: 'Планка',           unit: 'секунд',      xpPerUnit: 0.2, icon: '⏱️' },
  { id: 'run',       name: 'Бег',              unit: 'метров',      xpPerUnit: 0.05, icon: '🏃' },
  { id: 'dumbbell',  name: 'Гантели',          unit: 'повторов',    xpPerUnit: 1,   icon: '🏋️' },
  { id: 'burpee',    name: 'Бёрпи',            unit: 'повторов',    xpPerUnit: 2,   icon: '💥' },
];

const QUEST_XP = { easy: 50, medium: 150, hard: 400 };

const RANKS = [
  { name: 'E', minLevel: 1 },
  { name: 'D', minLevel: 5 },
  { name: 'C', minLevel: 10 },
  { name: 'B', minLevel: 20 },
  { name: 'A', minLevel: 35 },
  { name: 'S', minLevel: 50 },
];

const STAT_DEFS = [
  { key: 'str', name: 'СИЛА',       icon: '💪' },
  { key: 'vit', name: 'ВЫНОСЛИВОСТЬ', icon: '❤️' },
  { key: 'agi', name: 'ЛОВКОСТЬ',   icon: '⚡' },
  { key: 'wil', name: 'ВОЛЯ',       icon: '🔥' },
];

const DEFAULT_STATE = {
  name: '',
  level: 1,
  xp: 0,
  totalXp: 0,
  totalWorkouts: 0,
  statPoints: 0,
  stats: { str: 10, vit: 10, agi: 10, wil: 10 },
  quests: [],
  history: [],
  log: [],
};

let state = loadState();

// ===== УТИЛИТЫ =====
function xpNeeded(level) {
  return Math.floor(100 * Math.pow(level, 1.4));
}
function getRank(level) {
  let r = RANKS[0];
  for (const rank of RANKS) if (level >= rank.minLevel) r = rank;
  return r.name;
}
function calcXp(exerciseId, units) {
  const ex = EXERCISES.find(e => e.id === exerciseId);
  return Math.max(1, Math.round(ex.xpPerUnit * units));
}
function loadState() {
  try {
    const raw = localStorage.getItem('soloLevelingGym');
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_STATE));
  } catch { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
}
function saveState() {
  localStorage.setItem('soloLevelingGym', JSON.stringify(state));
}
function addLog(msg) {
  const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  state.log.unshift(`[${time}] ${msg}`);
  if (state.log.length > 60) state.log.pop();
}
function notify(text, isLevelUp = false) {
  const n = document.getElementById('notification');
  n.textContent = text;
  n.className = 'notification' + (isLevelUp ? ' level-up' : '');
  clearTimeout(n._t);
  n._t = setTimeout(() => n.classList.add('hidden'), 3500);
}

// ===== УРОВНИ =====
function addXP(amount) {
  state.xp += amount;
  state.totalXp += amount;
  let leveled = false;
  while (state.xp >= xpNeeded(state.level)) {
    state.xp -= xpNeeded(state.level);
    state.level++;
    state.statPoints += 3;
    leveled = true;
  }
  if (leveled) {
    const rank = getRank(state.level);
    notify(`⚡ LEVEL UP! Уровень ${state.level} · Ранг ${rank} · +3 очка характеристик`, true);
    addLog(`ПОВЫШЕНИЕ УРОВНЯ! Уровень ${state.level}, ранг ${rank}.`);
  }
}

// ===== РЕНДЕР =====
function render() {
  document.getElementById('player-name').textContent = state.name;
  document.getElementById('player-level').textContent = state.level;
  const rank = getRank(state.level);
  document.getElementById('player-rank').textContent = rank;
  const badge = document.getElementById('rank-badge');
  badge.textContent = rank;
  const sColor = rank === 'S' ? 'var(--gold)' : 'var(--cyan)';
  badge.style.borderColor = sColor;
  badge.style.color = sColor;

  const need = xpNeeded(state.level);
  document.getElementById('xp-current').textContent = state.xp;
  document.getElementById('xp-needed').textContent = need;
  document.getElementById('xp-fill').style.width = Math.min(100, (state.xp / need) * 100) + '%';
  document.getElementById('total-workouts').textContent = state.totalWorkouts;
  document.getElementById('total-xp').textContent = state.totalXp;
  document.getElementById('stat-points').textContent = state.statPoints;

  renderStats();
  renderQuests();
  renderHistory();
  renderLog();
}

function renderStats() {
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';
  for (const def of STAT_DEFS) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <span class="stat-name">${def.icon} ${def.name}</span>
      <span style="display:flex;align-items:center">
        <span class="stat-value">${state.stats[def.key]}</span>
        <button class="stat-add" data-stat="${def.key}" ${state.statPoints <= 0 ? 'disabled' : ''}>+</button>
      </span>`;
    grid.appendChild(row);
  }
  grid.querySelectorAll('.stat-add').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.statPoints <= 0) return;
      state.stats[btn.dataset.stat]++;
      state.statPoints--;
      saveState(); render();
    });
  });
}

function renderQuests() {
  const list = document.getElementById('quest-list');
  list.innerHTML = '';
  document.getElementById('empty-quests').style.display = state.quests.length ? 'none' : 'block';
  for (const q of state.quests) {
    const li = document.createElement('li');
    li.className = `quest-item diff-${q.diff}`;
    li.innerHTML = `
      <button class="quest-check ${q.done ? 'done' : ''}" title="Выполнить">${q.done ? '✓' : ''}</button>
      <span class="quest-title" style="${q.done ? 'text-decoration:line-through;opacity:.5' : ''}">${q.title}</span>
      <span class="quest-xp">+${q.xp} XP</span>
      <button class="quest-del" title="Удалить">✕</button>`;
    li.querySelector('.quest-check').addEventListener('click', () => completeQuest(q.id));
    li.querySelector('.quest-del').addEventListener('click', () => {
      state.quests = state.quests.filter(x => x.id !== q.id);
      saveState(); render();
    });
    list.appendChild(li);
  }
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (!state.history.length) {
    list.innerHTML = '<li class="empty-msg">Тренировок пока не было.</li>';
    return;
  }
  list.innerHTML = state.history.slice(0, 10).map(h => `
    <li class="history-item">
      <span>${h.icon} ${h.name} — ${h.units} ${h.unit}</span>
      <span class="quest-xp">+${h.xp} XP</span>
    </li>`).join('');
}

function renderLog() {
  const list = document.getElementById('log-list');
  list.innerHTML = state.log.map(e => `<li>${e}</li>`).join('') || '<li>Журнал пуст.</li>';
}

// ===== ДЕЙСТВИЯ =====
function completeQuest(id) {
  const q = state.quests.find(x => x.id === id);
  if (!q || q.done) return;
  q.done = true;
  addXP(q.xp);
  addLog(`Цель достигнута: «${q.title}» +${q.xp} XP`);
  notify(`🎯 Цель достигнута: «${q.title}» +${q.xp} XP`);
  saveState(); render();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initExerciseSelect() {
  const sel = document.getElementById('exercise-select');
  sel.innerHTML = EXERCISES.map(e =>
    `<option value="${e.id}">${e.icon} ${e.name}</option>`).join('');
  const hint = document.getElementById('exercise-hint');
  const updateHint = () => {
    const ex = EXERCISES.find(e => e.id === sel.value);
    hint.textContent = `1 ${ex.unit.slice(0, -1)} = ${ex.xpPerUnit} XP. Например, 20 повторов → ${calcXp(ex.id, 20)} XP`;
  };
  sel.addEventListener('change', updateHint);
  updateHint();
}

document.getElementById('workout-form').addEventListener('submit', e => {
  e.preventDefault();
  const exId = document.getElementById('exercise-select').value;
  const units = parseInt(document.getElementById('reps-input').value, 10);
  if (!units || units < 1) return;
  const ex = EXERCISES.find(e => e.id === exId);
  const xp = calcXp(exId, units);
  state.totalWorkouts++;
  state.history.unshift({ name: ex.name, icon: ex.icon, unit: ex.unit, units, xp, ts: Date.now() });
  if (state.history.length > 100) state.history.pop();
  addXP(xp);
  addLog(`Тренировка: ${ex.name} — ${units} ${ex.unit} +${xp} XP`);
  notify(`${ex.icon} ${ex.name}: ${units} ${ex.unit} → +${xp} XP`);
  document.getElementById('reps-input').value = '';
  saveState(); render();
});

document.getElementById('quest-form').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('quest-title').value.trim();
  const diff = document.getElementById('quest-difficulty').value;
  if (!title) return;
  state.quests.unshift({ id: Date.now(), title, diff, xp: QUEST_XP[diff], done: false });
  document.getElementById('quest-title').value = '';
  saveState(); render();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Система: весь прогресс будет удалён. Продолжить?')) {
    localStorage.removeItem('soloLevelingGym');
    location.reload();
  }
});

document.getElementById('start-btn').addEventListener('click', () => {
  state.name = document.getElementById('player-name-input').value.trim() || 'Безымянный';
  addLog(`Охотник «${state.name}» зарегистрирован. Ранг E. Вперёд, качайся!`);
  saveState();
  showMain();
  notify('[ СИСТЕМА ] Добро пожаловать. Время стать сильнее.');
});

function showMain() {
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  render();
}

initExerciseSelect();
if (state.name) showMain();
else document.getElementById('setup-screen').classList.remove('hidden');
