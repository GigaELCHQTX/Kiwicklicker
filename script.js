const totalCoinsEl = document.getElementById('totalCoins');
const totalKiwisEl = document.getElementById('totalKiwis');
const levelValueEl = document.getElementById('levelValue');
const kiwiPerSecondEl = document.getElementById('kiwiPerSecond');
const upgradeCostEl = document.getElementById('upgradeCost');
const clickPowerValueEl = document.getElementById('clickPowerValue');
const kiwiButton = document.getElementById('kiwiButton');
const shopButton = document.getElementById('shopButton');
const soundToggle = document.getElementById('soundToggle');
const notEnoughEl = document.getElementById('notEnough');

const state = {
  coins: 485,
  totalClicks: 0,
  clickPower: 2,
  passivePerSecond: 0,
  level: 0,
  upgradeCost: 25,
  soundOn: true,
};

const STORAGE_KEY = 'kiwiclicker-save';

function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    Object.assign(state, parsed);
  } catch (error) {
    console.warn('Could not restore save', error);
  }
}

function updateScreen() {
  totalCoinsEl.textContent = `${Math.floor(state.coins)} coins`;
  totalKiwisEl.textContent = Math.floor(state.coins);
  levelValueEl.textContent = state.level;
  kiwiPerSecondEl.textContent = Math.floor(state.passivePerSecond);
  upgradeCostEl.textContent = state.upgradeCost;
  clickPowerValueEl.textContent = state.clickPower;
  soundToggle.textContent = state.soundOn ? '🔊' : '🔇';
}

function showNotEnough() {
  const block = document.querySelector('.not-enough');
  if (!block) return;

  block.classList.add('show');
  clearTimeout(showNotEnough.timer);
  showNotEnough.timer = setTimeout(() => block.classList.remove('show'), 900);
}

function addCoins(amount) {
  state.coins += amount;
  state.totalClicks += amount;
  updateScreen();
  saveGame();
}

function animateKiwiPress() {
  kiwiButton.animate(
    [
      { transform: 'translateX(-50%) scale(1)' },
      { transform: 'translateX(-50%) scale(1.04)' },
      { transform: 'translateX(-50%) scale(0.99)' },
    ],
    {
      duration: 140,
      easing: 'ease-out',
    }
  );
}

function playClickSound() {
  if (!state.soundOn) return;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.value = 420 + Math.random() * 90;
  gain.gain.value = 0.04;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

function clickKiwi() {
  addCoins(state.clickPower);
  animateKiwiPress();
  playClickSound();
}

function upgrade() {
  if (state.coins < state.upgradeCost) {
    showNotEnough();
    return;
  }

  state.coins -= state.upgradeCost;
  state.passivePerSecond += 1;
  state.level += 1;
  state.clickPower += 1;
  state.upgradeCost = Math.floor(state.upgradeCost * 1.7 + 12);
  updateScreen();
  saveGame();
}

function tick() {
  if (state.passivePerSecond > 0) {
    state.coins += state.passivePerSecond / 2;
    updateScreen();
    saveGame();
  }
}

kiwiButton.addEventListener('click', clickKiwi);
kiwiButton.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    clickKiwi();
  }
});

shopButton.addEventListener('click', upgrade);

soundToggle.addEventListener('click', () => {
  state.soundOn = !state.soundOn;
  updateScreen();
  saveGame();
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    clickKiwi();
  }
});

loadGame();
updateScreen();
setInterval(tick, 500);
