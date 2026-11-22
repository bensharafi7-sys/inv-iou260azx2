/* Maor Yosef Miara invitation — original interaction (no third-party code). */
(function () {
  "use strict";

  // Flip these when Meital sends the venue and the day's schedule.
  const CONFIG = {
    showVenue: false,
    showSchedule: false,
    venueName: "",
    venueAddress: "",
    wazeUrl: "",
    // Start of the day in Asia/Jerusalem. On 18.3.2027 Israel is still IST (UTC+2);
    // DST begins 26.3.2027. Replace with a precise time when we have one.
    eventDate: "2027-03-18T00:00:00+02:00",
    timeZone: "Asia/Jerusalem",
    schedule: [
      // { time: "17:00", title: "קבלת פנים", note: "" },
    ]
  };

  const envelope = document.getElementById("envelope-stage");
  const invitation = document.getElementById("invitation");
  const sealBtn = document.getElementById("seal-hit");
  const audio = document.getElementById("bg-music");
  const muteBtn = document.getElementById("mute-btn");
  const body = document.body;

  if (CONFIG.showVenue) body.classList.add("show-venue");
  if (CONFIG.showSchedule) body.classList.add("show-schedule");
  fillVenue();
  fillSchedule();

  const alreadyOpen = /[?&]open=1(?:&|$)/.test(location.search);
  if (alreadyOpen) {
    openImmediate();
  } else if (sealBtn) {
    sealBtn.addEventListener("click", onOpen, { once: true });
  }

  if (muteBtn && audio) {
    muteBtn.addEventListener("click", function () {
      audio.muted = !audio.muted;
      muteBtn.classList.toggle("is-muted", audio.muted);
      muteBtn.setAttribute("aria-pressed", audio.muted ? "true" : "false");
      muteBtn.setAttribute("aria-label", audio.muted ? "הפעלת מוזיקה" : "השתקת מוזיקה");
    });
  }

  startCountdown();
  setupReveal();

  function onOpen() {
    startMusic();
    body.classList.add("is-opening");
    envelope.classList.add("is-opening");
    invitation.setAttribute("aria-hidden", "false");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doneAt = reduce ? 400 : 3600;
    window.setTimeout(function () {
      envelope.classList.add("is-done");
      body.classList.remove("is-opening");
      body.classList.add("is-open");
      revealVisible();
    }, doneAt);
  }

  function openImmediate() {
    body.classList.add("is-open");
    if (envelope) {
      envelope.classList.add("is-opening", "is-done");
    }
    if (invitation) invitation.setAttribute("aria-hidden", "false");
    revealVisible();
  }

  function startMusic() {
    if (!audio) return;
    audio.volume = 0;
    const play = audio.play();
    if (play && play.catch) play.catch(function () { /* autoplay blocked; user already tapped, retry */ audio.play().catch(function () {}); });
    fadeVolume(audio, 0.28, 1400);
  }

  function fadeVolume(el, target, ms) {
    const steps = 20;
    const step = target / steps;
    const dt = ms / steps;
    let i = 0;
    const t = window.setInterval(function () {
      i += 1;
      el.volume = Math.min(target, step * i);
      if (i >= steps) window.clearInterval(t);
    }, dt);
  }

  function startCountdown() {
    const root = document.getElementById("countdown");
    if (!root) return;
    const target = new Date(CONFIG.eventDate).getTime();
    const daysEl = root.querySelector("[data-unit=days]");
    const hoursEl = root.querySelector("[data-unit=hours]");
    const minsEl = root.querySelector("[data-unit=minutes]");
    const secsEl = root.querySelector("[data-unit=seconds]");

    function tick() {
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff / 86400000);
      diff -= days * 86400000;
      const hours = Math.floor(diff / 3600000);
      diff -= hours * 3600000;
      const mins = Math.floor(diff / 60000);
      diff -= mins * 60000;
      const secs = Math.floor(diff / 1000);
      daysEl.textContent = String(days);
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(mins);
      secsEl.textContent = pad(secs);
    }
    tick();
    window.setInterval(tick, 1000);
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (n) { io.observe(n); });
    window._inviteReveal = function () { revealVisible(); };
  }

  function revealVisible() {
    document.querySelectorAll(".reveal").forEach(function (n) {
      const r = n.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) n.classList.add("is-visible");
    });
  }

  function fillVenue() {
    const name = document.getElementById("venue-name");
    const addr = document.getElementById("venue-address");
    const waze = document.getElementById("waze-btn");
    if (name && CONFIG.venueName) name.textContent = CONFIG.venueName;
    if (addr && CONFIG.venueAddress) addr.textContent = CONFIG.venueAddress;
    if (waze) {
      if (CONFIG.wazeUrl) waze.href = CONFIG.wazeUrl;
      else waze.hidden = true;
    }
  }

  function fillSchedule() {
    const list = document.getElementById("schedule-list");
    if (!list || !CONFIG.schedule.length) return;
    list.innerHTML = "";
    CONFIG.schedule.forEach(function (item) {
      const li = document.createElement("li");
      const time = document.createElement("time");
      time.textContent = item.time || "";
      const wrap = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = item.title || "";
      wrap.appendChild(title);
      if (item.note) {
        const note = document.createElement("div");
        note.textContent = item.note;
        wrap.appendChild(note);
      }
      li.appendChild(time);
      li.appendChild(wrap);
      list.appendChild(li);
    });
  }
})();
