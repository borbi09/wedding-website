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

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.25) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: [0, 0.25, 0.6, 1],
    rootMargin: "0px 0px -8% 0px",
  }
);

revealElements.forEach((el) => observer.observe(el));

// ===========================
// Countdown (premium soft animation)
// ===========================
const WEDDING_DATE = new Date(2026, 9, 9, 14, 0, 0); // Local time
const cdRoot = document.getElementById("countdown");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function setCd(k, val) {
  const el = cdRoot.querySelector(`[data-k="${k}"]`);
  if (!el) return;
  if (el.textContent === val) return;

  el.animate(
    [
      { opacity: 0, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    {
      duration: 220,
      easing: "ease-out"
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

tickCountdown();
setInterval(tickCountdown, 1000);

// ===========================
// Music player (simple)
// ===========================
const audio = document.getElementById("audio");
const btnPlay = document.getElementById("btnPlay");
const playIcon = document.getElementById("playIcon");
const seek = document.getElementById("seek");
const tCur = document.getElementById("tCur");
const tDur = document.getElementById("tDur");

// Optional playlist support (add more files if you want)
const playlist = [
  "assets/audio/song.mp3",
  // "assets/audio/song2.mp3",
];
let trackIndex = 0;

function fmtTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function loadTrack(i) {
  trackIndex = (i + playlist.length) % playlist.length;
  audio.src = playlist[trackIndex];
  audio.load();
}

document.getElementById("btnPrev").addEventListener("click", () => {
  loadTrack(trackIndex - 1);
  audio.play().catch(() => {});
});

document.getElementById("btnNext").addEventListener("click", () => {
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
    // Autoplay restrictions: user must interact first (they did by clicking)
  }
});

audio.addEventListener("play", () => (playIcon.textContent = "⏸"));
audio.addEventListener("pause", () => (playIcon.textContent = "▶"));

audio.addEventListener("loadedmetadata", () => {
  tDur.textContent = fmtTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  tCur.textContent = fmtTime(audio.currentTime);
  if (audio.duration) {
    seek.value = (audio.currentTime / audio.duration) * 100;
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
  }
});

// Ensure first track is loaded
loadTrack(0);

// ===========================
// RSVP submit (Firebase-ready)
// ===========================

// Option 1: Firebase Firestore (recommended)
// - Fill firebaseConfig + enable imports below.
// - Then call submitRSVP(payload).

// --- START FIREBASE (disabled by default) ---
const USE_FIREBASE = false;

/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function submitRSVP(payload) {
  await addDoc(collection(db, "rsvps"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}
*/
// --- END FIREBASE ---

// Option 2: Form endpoint (Formspree/Getform/etc.)
// Put your endpoint here and set USE_FIREBASE=false
const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxx"

async function submitRSVPFallback(payload) {
  if (!FORM_ENDPOINT) {
    // local “fake success” so you can test UI before backend is ready
    await new Promise((r) => setTimeout(r, 700));
    return;
  }
  const res = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit RSVP.");
}

const form = document.getElementById("rsvpForm");
const msg = document.getElementById("formMsg");
const btn = document.getElementById("rsvpSubmit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  btn.disabled = true;
  btn.style.opacity = "0.85";

  const fd = new FormData(form);
  const payload = {
    name: String(fd.get("name") || "").trim(),
    attending: String(fd.get("attending") || ""),
    guests: Number(fd.get("guests") || 0),
    phone: String(fd.get("phone") || "").trim(),
    notes: String(fd.get("notes") || "").trim(),
  };

  if (!payload.name || !payload.attending) {
    msg.textContent = "Please fill in your name and attendance.";
    btn.disabled = false;
    btn.style.opacity = "1";
    return;
  }

  try {
    if (USE_FIREBASE) {
      // submitRSVP(payload);
      throw new Error("Firebase is disabled. Enable it in app.js.");
    } else {
      await submitRSVPFallback(payload);
    }
    form.reset();
    msg.textContent = "Thank you! Your RSVP was received.";
  } catch (err) {
    msg.textContent = "Sorry — something went wrong. Please try again.";
  } finally {
    btn.disabled = false;
    btn.style.opacity = "1";
  }
});