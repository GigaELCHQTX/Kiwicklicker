const totalKiwisEl = document.getElementById('totalKiwis');
const levelValueEl = document.getElementById('levelValue');
const kiwiPerSecondEl = document.getElementById('kiwiPerSecond');
const kiwiButton = document.getElementById('kiwiButton');
const soundToggle = document.getElementById('soundToggle');
const shopButton = document.getElementById('shopButton');
const notEnoughEl = document.getElementById('notEnough');

const state = {
  kiwis: 25,
  totalClicks: 0,
  clicksPerTap: 1,
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
    console.warn('Could not load save file', error);
  }
}

function updateScreen() {
  totalKiwisEl.textContent = Math.floor(state.kiwis);
  levelValueEl.textContent = state.level;
  kiwiPerSecondEl.textContent = Math.floor(state.passivePerSecond);
  soundToggle.textContent = state.soundOn ? '🔊' : '🔇';
}

function showNotEnough() {
  notEnoughEl.classList.add('show');
  clearTimeout(showNotEnough.timeout);
  showNotEnough.timeout = setTimeout(() => {
    notEnoughEl.classList.remove('show');
  }, 800);
}

function addKiwis(amount) {
  state.kiwis += amount;
  state.totalClicks += amount;
  updateScreen();
  saveGame();
}

function clickKiwi() {
  addKiwis(state.clicksPerTap);
  animateButton();
  playSound();
}

function animateButton() {
  kiwiButton.animate(
    [
      { transform: 'translateX(-50%) scale(1)' },
      { transform: 'translateX(-50%) scale(1.05)' },
      { transform: 'translateX(-50%) scale(0.99)' },
    ],
    {
      duration: 140,
      easing: 'ease-out',
    }
  );
}

function playSound() {
  if (!state.soundOn) return;

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.value = 420 + Math.random() * 80;
  gainNode.gain.value = 0.04;

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.08);
}

function upgrade() {
  if (state.kiwis < state.upgradeCost) {
    showNotEnough();
    return;
  }

  state.kiwis -= state.upgradeCost;
  state.passivePerSecond += 1;
  state.level += 1;
  state.upgradeCost = Math.floor(state.upgradeCost * 1.7 + 10);
  updateScreen();
  saveGame();
}

function tick() {
  if (state.passivePerSecond > 0) {
    state.kiwis += state.passivePerSecond / 2;
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

soundToggle.addEventListener('click', () => {
  state.soundOn = !state.soundOn;
  updateScreen();
  saveGame();
});

shopButton.addEventListener('click', upgrade);
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    clickKiwi();
  }
});

loadGame();
updateScreen();
setInterval(tick, 500);
