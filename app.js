//import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
//import { getFirestore, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

document.documentElement.classList.add("js");
window.addEventListener("load", () => {
  document.documentElement.classList.add("is-loaded");
});

// ===========================
// Smooth scroll (anchors)
// ===========================
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href");
  const el = document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
});

// ===========================
// Bidirectional Scroll Reveal
// ===========================

const revealElements = document.querySelectorAll(".reveal");

const ENTER_THRESHOLD = 0.15;
const EXIT_THRESHOLD = 0.08;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      const isVisible = el.classList.contains("is-visible");
      const ratio = entry.intersectionRatio;

      if (!isVisible && ratio >= ENTER_THRESHOLD) {
        el.classList.add("is-visible");
      } else if (isVisible && ratio <= EXIT_THRESHOLD) {
        el.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: [0, 0.18, 0.28, 0.6, 1],
    rootMargin: "0px 0px -8% 0px",
  }
);

revealElements.forEach((el) => observer.observe(el));

// ===========================
// Timeline row reveal
// ===========================
const timelineRows = document.querySelectorAll(".timeline-reveal");

const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const row = entry.target;
      const ratio = entry.intersectionRatio;

      if (ratio >= 0.42) {
        row.classList.add("is-visible");
      } else if (ratio <= 0.16) {
        row.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: [0, 0.16, 0.42, 0.7, 1],
    rootMargin: "-14% 0px -14% 0px",
  }
);

timelineRows.forEach((row) => timelineObserver.observe(row));

// ===========================
// Countdown (premium soft animation)
// ===========================
const WEDDING_DATE = new Date(2026, 8, 9, 12, 0, 0); // 09 September 2026, 12:00 local time
const cdRoot = document.getElementById("countdown");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function setCd(k, val) {
  if (!cdRoot) return;

  const el = cdRoot.querySelector(`[data-k="${k}"]`);
  if (!el || el.textContent === val) return;

  const box = el.closest(".timebox");
  box?.classList.remove("is-ticking");
  void box?.offsetWidth; // restart the tiny tick animation
  box?.classList.add("is-ticking");

  el.animate(
    [
      { opacity: 0, transform: "translateY(10px) scale(0.98)" },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ],
    {
      duration: 260,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)"
    }
  );

  el.textContent = val;
}

function tickCountdown() {
  const now = new Date();
  const diff = WEDDING_DATE - now;

  if (diff <= 0) {
    setCd("days", "00");
    setCd("hours", "00");
    setCd("mins", "00");
    setCd("secs", "00");
    return;
  }

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / (3600 * 24));
  const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  setCd("days", String(days));
  setCd("hours", pad2(hours));
  setCd("mins", pad2(mins));
  setCd("secs", pad2(secs));
}

if (cdRoot) {
  tickCountdown();
  setInterval(tickCountdown, 1000);
}

// ===========================
// Music player
// ===========================
const audio = document.getElementById("audio");
const btnPlay = document.getElementById("btnPlay");
const playIcon = document.getElementById("playIcon");
const player = document.querySelector(".player");
const seek = document.getElementById("seek");
const tCur = document.getElementById("tCur");
const tDur = document.getElementById("tDur");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

const playlist = [
  {
    src: "assets/audio/song-1.mp3",
    title: "Golden Brown - The Stranglers",
  },
];

let trackIndex = 0;

function fmtTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  return `${m}:${String(s).padStart(2, "0")}`;
}

function loadTrack(i) {
  if (!audio || !playlist.length) return;

  trackIndex = (i + playlist.length) % playlist.length;
  const track = playlist[trackIndex];

  audio.src = track.src;
  audio.load();

  if (trackTitle) {
    trackTitle.textContent = track.title;
  }
}

if (audio && btnPlay && playIcon && seek && tCur && tDur) {
  loadTrack(0);

  btnPrev?.addEventListener("click", () => {
    loadTrack(trackIndex - 1);
    audio.play().catch(() => {});
  });

  btnNext?.addEventListener("click", () => {
    loadTrack(trackIndex + 1);
    audio.play().catch(() => {});
  });

  btnPlay.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      // Browser blocked playback.
    }
  });

  audio.addEventListener("play", () => {
    playIcon.textContent = "⏸";
    btnPlay.setAttribute("aria-label", "Pause song");
    player?.classList.add("is-playing");
  });

  audio.addEventListener("pause", () => {
    playIcon.textContent = "▶";
    btnPlay.setAttribute("aria-label", "Play song");
    player?.classList.remove("is-playing");
  });

  audio.addEventListener("loadedmetadata", () => {
    tDur.textContent = fmtTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    tCur.textContent = fmtTime(audio.currentTime);

    if (audio.duration) {
      seek.value = String((audio.currentTime / audio.duration) * 100);
    }
  });

  seek.addEventListener("input", () => {
    if (!audio.duration) return;

    audio.currentTime = (Number(seek.value) / 100) * audio.duration;
  });

  audio.addEventListener("ended", () => {
    if (playlist.length > 1) {
      loadTrack(trackIndex + 1);
      audio.play().catch(() => {});
    } else {
      playIcon.textContent = "▶";
      player?.classList.remove("is-playing");
      seek.value = "0";
      tCur.textContent = "0:00";
    }
  });
}

// ===========================
// RSVP submit (Firebase-ready)
// ===========================
/*const USE_FIREBASE = false;

 const firebaseConfig = {
    apiKey: "AIzaSyDAktKDiz9imJHsIJu6F3gd-evYZRgACSw",
    authDomain: "weddingrsvp-4417b.firebaseapp.com",
    projectId: "weddingrsvp-4417b",
    storageBucket: "weddingrsvp-4417b.firebasestorage.app",
    messagingSenderId: "559696860993",
    appId: "1:559696860993:web:016564b6ffeb1158cbf3c0",
    measurementId: "G-ME39SYYQDK"
  };
  const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

async function submitRSVP(payload) {
  await addDoc(collection(db, "rsvps"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

const form = document.getElementById("rsvpForm");
const msg = document.getElementById("formMsg");
const btn = document.getElementById("rsvpSubmit");

if (form && msg && btn) {
  form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  btn.disabled = true;
  btn.style.opacity = "0.85";

  const fd = new FormData(form);
  const payload = {
    name: String(fd.get("name") || "").trim(),
    attending: String(fd.get("attending") || ""),
    email: String(fd.get("email") || "").trim(),
    phone: String(fd.get("phone") || "").trim(),
    notes: String(fd.get("notes") || "").trim(),
  };
  if (!payload.name || !payload.attending) {
    msg.textContent = "Моля, попълнете име и потвърждение за присъствие.";
    btn.disabled = false;
    btn.style.opacity = "1";
    return;
  }

  try {
    await submitRSVP(payload);
    form.reset();
    msg.textContent = "Благодарим! Вашият отговор беше записан.";
  } catch (err) {
    msg.textContent = "Възникна проблем. Моля, опитайте отново.";
  } finally {
    btn.disabled = false;
    btn.style.opacity = "1";
  }
});

*/