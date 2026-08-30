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
let invitationStarted = false;

const mainGif = document.getElementById("main-gif");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const noSlot = document.querySelector(".no-slot");
const continueBtn = document.getElementById("continue-btn");
const music = document.getElementById("bg-music");
const introScreen = document.getElementById("intro-screen");
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

continueBtn.addEventListener("pointerdown", handleContinuePress);
continueBtn.addEventListener("click", handleContinueClick);
continueBtn.addEventListener("touchend", (event) => {
  event.preventDefault();
  event.stopPropagation();
  startInvitation();
});
continueBtn.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  startInvitation();
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

function handleContinuePress(event) {
  event.preventDefault();
  event.stopPropagation();
  startInvitation();
}

function handleContinueClick(event) {
  event.preventDefault();
  event.stopPropagation();
  startInvitation();
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

function startInvitation() {
  if (invitationStarted) {
    return;
  }

  invitationStarted = true;
  introScreen.classList.add("hidden");
  introScreen.setAttribute("aria-hidden", "true");
  questionScreen.classList.remove("hidden");
  questionScreen.setAttribute("aria-hidden", "false");
  unlockMusic();
}

function showCelebration() {
  questionScreen.classList.add("hidden");
  questionScreen.setAttribute("aria-hidden", "true");
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
  const hideNo = noClickCount >= 10;

  if (!hideNo) {
    noSlot.classList.remove("empty");
    noBtn.style.position = "absolute";
    noBtn.style.left = "50%";
    noBtn.style.top = "50%";
    noBtn.style.transform = "translate(-50%, -50%)";
  }

  yesBtn.style.zIndex = "1";
  noBtn.style.zIndex = hideNo ? "140" : "120";
  noBtn.classList.toggle("no-hidden", hideNo);
  noSlot.classList.toggle("empty", hideNo);
  document.documentElement.style.setProperty("--no-count", String(noClickCount));

  const msgIndex = Math.min(noClickCount, noMessages.length - 1);
  const noLabel = hideNo ? "no" : noMessages[msgIndex];
  noBtn.textContent = noLabel;
  noBtn.setAttribute("aria-label", noLabel);

  const growthStep = Math.min(noClickCount, 10);
  const targetWidth = Math.min(150 + growthStep * 24, window.innerWidth * 0.84);
  const targetHeight = Math.min(58 + growthStep * 7, 132);
  const targetScale = Math.min(1 + growthStep * 0.055, 1.55);
  yesBtn.style.width = `${targetWidth}px`;
  yesBtn.style.minHeight = `${targetHeight}px`;
  yesBtn.style.fontSize = `${Math.min(22 + growthStep * 1.55, 38)}px`;
  yesBtn.style.setProperty("--yes-scale", String(targetScale));

  const shrinkStep = Math.min(noClickCount, 10);
  noBtn.style.fontSize = `${Math.max(16 - shrinkStep * 0.85, hideNo ? 7 : 9)}px`;
  noBtn.style.padding = `${Math.max(12 - shrinkStep, hideNo ? 2 : 4)}px ${Math.max(28 - shrinkStep * 2, hideNo ? 5 : 8)}px`;

  const gifIndex = Math.min(noClickCount, gifStages.length - 1);
  swapGif(gifStages[gifIndex]);

  if (noClickCount >= 10 && !runawayEnabled) {
    runawayEnabled = true;
    enableRunaway();
  }

  if (runawayEnabled) {
    const poke = romanticNoPokes[(noClickCount - 3) % romanticNoPokes.length];
    showTeaseMessage(poke);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(runAway);
    });
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
  if (noClickCount >= 10) {
    hideNoInsideYes();
    return;
  }

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
  noBtn.style.zIndex = "140";
}

function hideNoInsideYes() {
  const yesRect = yesBtn.getBoundingClientRect();
  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;
  const jitterX = (Math.random() - 0.5) * Math.min(yesRect.width * 0.35, 80);
  const jitterY = (Math.random() - 0.5) * Math.min(yesRect.height * 0.35, 42);
  const x = yesRect.left + yesRect.width / 2 - btnW / 2 + jitterX;
  const y = yesRect.top + yesRect.height / 2 - btnH / 2 + jitterY;

  noBtn.style.position = "fixed";
  noBtn.style.left = `${Math.max(8, Math.min(window.innerWidth - btnW - 8, x))}px`;
  noBtn.style.top = `${Math.max(8, Math.min(window.innerHeight - btnH - 8, y))}px`;
  noBtn.style.transform = "none";
  noBtn.style.zIndex = "140";
  showTeaseMessage("It hid in Yes because even No knows the answer 💕");
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
