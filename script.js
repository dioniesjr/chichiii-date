const gifStages = [
  "assets/main.gif",
  "assets/stage-pleading.gif",
  "assets/stage-sad.gif",
  "assets/stage-crying.gif",
  "assets/stage-devastated.gif",
  "assets/stage-final.gif",
  "assets/stage-crying.gif",
  "assets/stage-final.gif",
];

const noMessages = [
  "No",
  "Are you sure, chichiii? 🥺",
  "Pretty please... 💕",
  "I'll be so sad... 😢",
  "My heart can't take this 💔",
  "One more chance? 🌸",
  "Please say yes... 🥹",
  "You're breaking my heart 💗",
  "Fine, try to catch me 😜",
];

const yesTeasePokes = [
  "Try saying no first... I dare you 😏",
  "Go on, hit no... just once 👀",
  "You're missing out, chichiii 😈",
  "Click no, I dare you 💕",
];

const romanticNoPokes = [
  "My answer is still you, chichiii 🌻",
  "The No button is shy now. The Yes button brought flowers 💐",
  "Tiny plot twist: Yes is where the date magic lives ✨",
  "I saved the sweetest page for your Yes 💖",
  "Cinnamoroll says the roses are waiting for you 🌸",
];

let yesTeasedCount = 0;
let noClickCount = 0;
let runawayEnabled = false;
let musicEnabled = true;
let suppressNextNoClick = false;
let yesPressStarted = false;

const mainGif = document.getElementById("main-gif");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const music = document.getElementById("bg-music");
const questionScreen = document.getElementById("question-screen");
const celebrationScreen = document.getElementById("celebration-screen");
const musicToggle = document.getElementById("music-toggle");
const introSong = music.dataset.introSrc;
const celebrationSong = music.dataset.celebrationSrc;

music.volume = 0.35;
music.muted = true;

function setMusicIcon(enabled) {
  musicToggle.textContent = enabled ? "🔊" : "🔇";
  musicToggle.setAttribute("aria-pressed", String(enabled));
}

function playMusic(unmute = true) {
  if (!musicEnabled) {
    return Promise.resolve();
  }

  if (unmute) {
    music.muted = false;
  }

  return music.play().catch(() => {});
}

function switchSong(src) {
  if (!src || music.dataset.currentSrc === src) {
    return playMusic(true);
  }

  music.dataset.currentSrc = src;
  music.src = src;
  music.load();
  return playMusic(true);
}

function pauseMusic() {
  music.pause();
}

function unlockMusic() {
  if (musicEnabled) {
    playMusic(true);
  }
}

setMusicIcon(true);
music.dataset.currentSrc = introSong;
playMusic(false);

document.addEventListener("pointerdown", unlockMusic, { once: true });
document.addEventListener("keydown", unlockMusic, { once: true });

musicToggle.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});

musicToggle.addEventListener("click", (event) => {
  event.stopPropagation();

  if (musicEnabled) {
    musicEnabled = false;
    pauseMusic();
    setMusicIcon(false);
    return;
  }

  musicEnabled = true;
  setMusicIcon(true);
  playMusic(true);
});

yesBtn.addEventListener("pointerdown", armYesClick);
yesBtn.addEventListener("click", handleYesClick);
yesBtn.addEventListener("keydown", handleYesKeydown);
noBtn.addEventListener("pointerdown", handleNoPress);
noBtn.addEventListener("click", suppressNoClick);
noBtn.addEventListener("keydown", handleNoKeydown);

function armYesClick(event) {
  yesPressStarted = event.target === yesBtn;
}

function handleYesClick(event) {
  const isKeyboardClick = event && event.detail === 0;
  const isRealYesPress = yesPressStarted || isKeyboardClick;
  yesPressStarted = false;

  if (event && (event.currentTarget !== yesBtn || event.target !== yesBtn || !isRealYesPress)) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (!runawayEnabled) {
    const msg = yesTeasePokes[Math.min(yesTeasedCount, yesTeasePokes.length - 1)];
    yesTeasedCount += 1;
    showTeaseMessage(msg);
    return;
  }
  showCelebration();
}

function handleYesKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  yesPressStarted = true;
}

function handleNoPress(event) {
  event.preventDefault();
  event.stopPropagation();
  suppressNextNoClick = true;

  handleNoClick();
}

function suppressNoClick(event) {
  if (!suppressNextNoClick) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  suppressNextNoClick = false;
}

function handleNoKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  handleNoClick();
}

function showCelebration() {
  questionScreen.classList.add("hidden");
  celebrationScreen.classList.remove("hidden");
  celebrationScreen.setAttribute("aria-hidden", "false");
  spawnConfetti();
  switchSong(celebrationSong);
}

function showTeaseMessage(msg) {
  const toast = document.getElementById("tease-toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function handleNoClick() {
  noClickCount += 1;
  noBtn.style.zIndex = "120";
  yesBtn.style.zIndex = "1";

  const msgIndex = Math.min(noClickCount, noMessages.length - 1);
  noBtn.textContent = noMessages[msgIndex];
  noBtn.setAttribute("aria-label", noMessages[msgIndex]);

  const growthStep = Math.min(noClickCount, 3);
  const yesSize = parseFloat(window.getComputedStyle(yesBtn).fontSize);
  yesBtn.style.fontSize = `${Math.min(yesSize * 1.14, 30)}px`;

  const padY = Math.min(16 + growthStep * 4, 30);
  const padX = Math.min(40 + growthStep * 8, 72);
  yesBtn.style.padding = `${padY}px ${padX}px`;

  const noSize = parseFloat(window.getComputedStyle(noBtn).fontSize);
  const shrinkFactor = Math.pow(0.82, noClickCount);
  noBtn.style.fontSize = `${Math.max(noSize * 0.82, 8)}px`;
  const noPadY = Math.max(12 * shrinkFactor, 4);
  const noPadX = Math.max(28 * shrinkFactor, 8);
  noBtn.style.padding = `${noPadY}px ${noPadX}px`;

  const gifIndex = Math.min(noClickCount, gifStages.length - 1);
  swapGif(gifStages[gifIndex]);

  if (noClickCount >= 3 && !runawayEnabled) {
    runawayEnabled = true;
    enableRunaway();
  }

  if (runawayEnabled) {
    const poke = romanticNoPokes[(noClickCount - 3) % romanticNoPokes.length];
    showTeaseMessage(poke);
    window.requestAnimationFrame(runAway);
  }
}

function swapGif(src) {
  mainGif.style.opacity = "0";
  setTimeout(() => {
    mainGif.src = src;
    mainGif.style.opacity = "1";
  }, 200);
}

function enableRunaway() {
  noBtn.addEventListener("pointerenter", runAway);
}

function runAway() {
  const margin = 16;
  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;
  const maxX = window.innerWidth - btnW - margin;
  const maxY = window.innerHeight - btnH - margin;

  const randomX = Math.random() * maxX + margin / 2;
  const randomY = Math.random() * maxY + margin / 2;

  noBtn.style.position = "fixed";
  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;
  noBtn.style.zIndex = "50";
}

function spawnConfetti() {
  const hearts = ["💕", "💗", "💖", "💝", "🌸", "💓"];
  for (let i = 0; i < 30; i += 1) {
    setTimeout(() => {
      const el = document.createElement("span");
      el.className = "confetti-heart";
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.left = `${Math.random() * 100}vw`;
      el.style.animationDuration = `${2 + Math.random() * 3}s`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }, i * 80);
  }
}
