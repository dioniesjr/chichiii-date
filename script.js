const CELEBRATION_SONG_ID = "Ju9X2HMMid4";

const gifStages = [
  "assets/main.gif",
  "https://media1.tenor.com/m/uDugCXK4vI4AAAAd/chiikawa-hachiware.gif",
  "https://media.tenor.com/f_rkpJbH1s8AAAAj/somsom1012.gif",
  "https://media.tenor.com/OGY9zdREsVAAAAAj/somsom1012.gif",
  "https://media1.tenor.com/m/WGfra-Y_Ke0AAAAd/chiikawa-sad.gif",
  "https://media.tenor.com/CivArbX7NzQAAAAj/somsom1012.gif",
  "https://media.tenor.com/5_tv1HquZlcAAAAj/chiikawa.gif",
  "https://media1.tenor.com/m/uDugCXK4vI4AAAAC/chiikawa-hachiware.gif",
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

let yesTeasedCount = 0;
let noClickCount = 0;
let runawayEnabled = false;
let musicPlaying = false;
let musicStarted = false;
let onCelebrationScreen = false;
let ytPlayer = null;

const mainGif = document.getElementById("main-gif");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const music = document.getElementById("bg-music");
const questionScreen = document.getElementById("question-screen");
const celebrationScreen = document.getElementById("celebration-screen");
const musicToggle = document.getElementById("music-toggle");

mainGif.referrerPolicy = "no-referrer";
music.volume = 0.35;

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("yt-player", {
    videoId: CELEBRATION_SONG_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      loop: 1,
      playlist: CELEBRATION_SONG_ID,
      modestbranding: 1,
      rel: 0,
    },
  });
};

function setMusicIcon(playing) {
  musicPlaying = playing;
  musicToggle.textContent = playing ? "🔊" : "🔇";
}

function startMusic() {
  if (onCelebrationScreen) {
    return startCelebrationMusic();
  }

  if (musicStarted && !music.paused) {
    return Promise.resolve();
  }

  musicStarted = true;
  return music.play().then(() => {
    setMusicIcon(true);
  }).catch(() => {
    musicStarted = false;
    setMusicIcon(false);
  });
}

function startCelebrationMusic() {
  music.pause();

  if (!ytPlayer || typeof ytPlayer.playVideo !== "function") {
    return;
  }

  ytPlayer.setVolume(50);
  ytPlayer.playVideo();
  musicStarted = true;
  setMusicIcon(true);
}

function pauseAllMusic() {
  music.pause();
  if (ytPlayer && typeof ytPlayer.pauseVideo === "function") {
    ytPlayer.pauseVideo();
  }
  setMusicIcon(false);
}

setMusicIcon(false);

document.addEventListener("click", () => {
  if (!musicStarted && !onCelebrationScreen) {
    startMusic();
  }
}, { once: true });

musicToggle.addEventListener("click", (event) => {
  event.stopPropagation();

  if (musicPlaying) {
    pauseAllMusic();
    return;
  }

  startMusic();
});

yesBtn.addEventListener("click", handleYesClick);
noBtn.addEventListener("click", handleNoClick);

function handleYesClick() {
  if (!runawayEnabled) {
    const msg = yesTeasePokes[Math.min(yesTeasedCount, yesTeasePokes.length - 1)];
    yesTeasedCount += 1;
    showTeaseMessage(msg);
    return;
  }
  showCelebration();
}

function showCelebration() {
  onCelebrationScreen = true;
  questionScreen.classList.add("hidden");
  celebrationScreen.classList.remove("hidden");
  celebrationScreen.setAttribute("aria-hidden", "false");
  spawnConfetti();
  switchToCelebrationMusic();
}

function switchToCelebrationMusic() {
  music.pause();
  music.currentTime = 0;

  if (ytPlayer && typeof ytPlayer.playVideo === "function") {
    startCelebrationMusic();
    return;
  }

  const waitForYt = setInterval(() => {
    if (ytPlayer && typeof ytPlayer.playVideo === "function") {
      clearInterval(waitForYt);
      startCelebrationMusic();
    }
  }, 200);

  setTimeout(() => clearInterval(waitForYt), 10000);
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

  const msgIndex = Math.min(noClickCount, noMessages.length - 1);
  noBtn.textContent = noMessages[msgIndex];

  const yesSize = parseFloat(window.getComputedStyle(yesBtn).fontSize);
  yesBtn.style.fontSize = `${yesSize * 1.3}px`;

  const padY = Math.min(16 + noClickCount * 6, 70);
  const padX = Math.min(40 + noClickCount * 12, 140);
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
    enableRunaway();
    runawayEnabled = true;
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
  noBtn.addEventListener("mouseover", runAway);
  noBtn.addEventListener("touchstart", runAway, { passive: true });
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
