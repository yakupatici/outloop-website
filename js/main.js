// Landing page motion. Everything is readable without it: when GSAP is missing or the visitor
// prefers reduced motion, the page falls back to plain stacked sections (`.no-pin`).

// Set this once the app is live, e.g. "https://apps.apple.com/app/id1234567890".
const APP_STORE_URL = "";

(function wireAppStoreLinks() {
  document.querySelectorAll("[data-appstore]").forEach((link) => {
    if (APP_STORE_URL) {
      link.href = APP_STORE_URL;
    } else {
      link.href = "#get";
      const label = link.querySelector("[data-appstore-label]");
      if (label) label.textContent = "Coming soon to the App Store";
      else if (link.classList.contains("small")) link.textContent = "Coming soon";
    }
  });
})();

function staticFallback() {
  document.documentElement.classList.add("no-pin");
  document.querySelectorAll("[data-fill] .fill-word").forEach((w) => (w.style.opacity = "1"));
}

// Wraps each word so it can rise out of its own line mask (`[data-split]`)
// or change colour one by one (`[data-fill]`). Keeps inline elements like .serif.
function splitWords(root, className) {
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          const outer = document.createElement("span");
          outer.className = className;
          if (className === "word") {
            const inner = document.createElement("span");
            inner.textContent = part;
            outer.appendChild(inner);
            words.push(inner);
          } else {
            outer.textContent = part;
            words.push(outer);
          }
          frag.appendChild(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  root.setAttribute("aria-label", root.textContent.replace(/\s+/g, " ").trim());
  walk(root);
  return words;
}

if (!window.gsap || !window.ScrollTrigger) {
  staticFallback();
} else {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: reduce)", () => {
    staticFallback();
    return () => document.documentElement.classList.remove("no-pin");
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // ---------- Headlines and intro ----------
    document.querySelectorAll("[data-split]").forEach((el) => {
      const words = splitWords(el, "word");
      const inHero = !!el.closest(".hero");
      gsap.from(words, {
        yPercent: 115, rotate: 4, duration: 1.1, ease: "expo.out", stagger: 0.06, delay: inHero ? 0.15 : 0,
        scrollTrigger: inHero ? undefined : { trigger: el, start: "top 85%" },
      });
    });
    gsap.from(".hero [data-rise]", { y: 26, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.45 });

    // ---------- Hero map grows into the screen ----------
    const frame = document.querySelector(".hero-frame");
    const heroTl = gsap.timeline({
      scrollTrigger: { trigger: ".hero-stage", start: "top 85%", end: "bottom bottom", scrub: 0.6 },
    });
    heroTl
      .fromTo(frame, { scale: 0.8, y: 40, rotateX: 14, transformPerspective: 1400 },
        { scale: 1, y: 0, rotateX: 0, ease: "none", duration: 1 })
      .fromTo(".hero-frame img", { scale: 1.2 }, { scale: 1, ease: "none", duration: 1 }, 0)
      .from(".hero-frame .tag", { opacity: 0, y: 18, scale: 0.9, stagger: 0.18, duration: 0.25, ease: "back.out(2)" }, 0.45);
    gsap.from(frame, { opacity: 0, y: 60, duration: 1.2, ease: "power3.out", delay: 0.6 });

    // ---------- Statement fills in word by word ----------
    document.querySelectorAll("[data-fill]").forEach((el) => {
      const words = splitWords(el, "fill-word");
      gsap.fromTo(words, { opacity: 0.16 }, {
        opacity: 1,
        stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
      });
    });

    // ---------- Moods: one sentence, five afternoons ----------
    const moodWords = gsap.utils.toArray(".mood-word span");
    const moodImages = gsap.utils.toArray(".mood-stack img");
    const moodDots = gsap.utils.toArray(".mood-meta .dots b");
    const moodLabel = document.querySelector("[data-mood-label]");
    const moodNames = ["Coffee loop · 36 min", "Waterfront walk · 45 min", "Golden hour · 40 min", "Quiet streets · 30 min", "River ride · 60 min"];
    gsap.set(moodImages.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(moodWords.slice(1), { yPercent: 100, opacity: 1 });
    const moodTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".moods", start: "top top", end: () => "+=" + window.innerHeight * 3.2, pin: ".moods-pin", scrub: 0.5,
        onUpdate: (self) => {
          const i = Math.min(moodNames.length - 1, Math.round(self.progress * (moodNames.length - 1)));
          if (moodLabel.dataset.i !== String(i)) {
            moodLabel.dataset.i = String(i);
            moodLabel.textContent = moodNames[i];
            moodDots.forEach((d, j) => d.classList.toggle("on", j === i));
          }
        },
      },
    });
    for (let i = 1; i < moodWords.length; i++) {
      const at = i - 1;
      moodTl
        .to(moodWords[i - 1], { yPercent: -100, duration: 0.5, ease: "power2.inOut" }, at + 0.25)
        .to(moodWords[i], { yPercent: 0, duration: 0.5, ease: "power2.inOut" }, at + 0.25)
        .to(moodImages[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" }, at + 0.15)
        .fromTo(moodImages[i], { scale: 1.25 }, { scale: 1, duration: 0.9, ease: "power2.out" }, at + 0.15);
    }
    moodTl.to({}, { duration: 0.3 });

    // ---------- Phone tour ----------
    const steps = gsap.utils.toArray(".tour-step");
    const screens = gsap.utils.toArray(".phone .screen img");
    const marks = gsap.utils.toArray(".tour-progress button");
    gsap.set(steps.slice(1), { opacity: 0, y: 40 });
    gsap.set(screens.slice(1), { opacity: 0, scale: 1.06 });
    const tourTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".tour", start: "top top", end: () => "+=" + window.innerHeight * 2.6, pin: ".tour-pin", scrub: 0.5,
        onUpdate: (self) => {
          const i = Math.min(steps.length - 1, Math.round(self.progress * (steps.length - 1)));
          marks.forEach((m, j) => m.classList.toggle("on", j === i));
        },
      },
    });
    for (let i = 1; i < steps.length; i++) {
      const at = i - 1;
      tourTl
        .to(steps[i - 1], { opacity: 0, y: -40, duration: 0.25 }, at + 0.25)
        .to(steps[i], { opacity: 1, y: 0, duration: 0.3 }, at + 0.5)
        .to(screens[i], { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, at + 0.3);
    }
    tourTl.to({}, { duration: 0.3 });
    gsap.from(".phone", {
      y: 120, rotate: -6, opacity: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: ".tour", start: "top 70%" },
    });

    // ---------- Plus rail slides sideways ----------
    const rail = document.querySelector(".rail");
    const railDistance = () => Math.max(0, rail.scrollWidth - window.innerWidth);
    const railTween = gsap.to(rail, {
      x: () => -railDistance(), ease: "none",
      scrollTrigger: {
        trigger: ".rail-pin", start: "top top", end: () => "+=" + railDistance(), pin: true, scrub: 0.6, invalidateOnRefresh: true,
      },
    });
    gsap.utils.toArray(".card").forEach((card) => {
      const opts = { trigger: card, containerAnimation: railTween, start: "left 85%", toggleActions: "play none none reverse" };
      // Lines draw themselves: a dash as long as the line, slid out of view and back.
      const draw = (el, shown) => {
        const len = el.getTotalLength();
        gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: len * (1 - shown), duration: 1.4, ease: "power2.inOut", scrollTrigger: opts });
      };
      card.querySelectorAll(".art-draw").forEach((el) => draw(el, 1));
      card.querySelectorAll(".art-ring").forEach((el) => draw(el, 0.82));
      const streets = card.querySelectorAll(".art-streets path");
      if (streets.length) gsap.from(streets, { opacity: 0, duration: 0.25, stagger: 0.15, scrollTrigger: opts });
      const days = card.querySelectorAll(".art-days rect");
      if (days.length) gsap.from(days, { scaleY: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(2)", stagger: 0.1, scrollTrigger: opts });
      const photo = card.querySelector("img");
      if (photo) gsap.fromTo(photo, { xPercent: 12, scale: 1.25 }, { xPercent: -12, ease: "none", scrollTrigger: { trigger: card, containerAnimation: railTween, start: "left right", end: "right left", scrub: true } });
    });

    // ---------- Plans and privacy rise in ----------
    gsap.from(".plan", { y: 60, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.15, scrollTrigger: { trigger: ".plans", start: "top 80%" } });
    gsap.from(".vault > div", { y: 50, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".vault", start: "top 85%" } });
    gsap.fromTo(".blur-pin .zone", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: "elastic.out(1, 0.6)", scrollTrigger: { trigger: ".blur-pin", start: "top 80%" } });
    gsap.fromTo(".blur-pin img", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".blur-pin", start: "top bottom", end: "bottom top", scrub: true } });

    // ---------- Finale: the loop draws itself and closes ----------
    const path = document.querySelector(".finale-loop .draw");
    const walker = document.querySelector(".finale-loop .walker");
    const stopsGroup = document.querySelector(".finale-loop .stops");
    const length = path.getTotalLength();
    const stopAt = [0.2, 0.47, 0.74];
    const ns = "http://www.w3.org/2000/svg";
    const stops = stopAt.map((t) => {
      const p = path.getPointAtLength(t * length);
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("class", "stop"); c.setAttribute("r", "10"); c.setAttribute("cx", p.x); c.setAttribute("cy", p.y);
      c.style.transformOrigin = `${p.x}px ${p.y}px`;
      stopsGroup.appendChild(c);
      return c;
    });
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(stops, { scale: 0 });
    const state = { t: 0 };
    gsap.to(state, {
      t: 1, ease: "none",
      scrollTrigger: { trigger: ".finale", start: "top 75%", end: "center 45%", scrub: 0.8 },
      onUpdate: () => {
        const p = path.getPointAtLength(state.t * length);
        walker.setAttribute("cx", p.x); walker.setAttribute("cy", p.y);
        path.style.strokeDashoffset = String(length * (1 - state.t));
        stops.forEach((s, i) => {
          const on = state.t >= stopAt[i];
          if (s.dataset.on !== String(on)) { s.dataset.on = String(on); gsap.to(s, { scale: on ? 1 : 0, duration: 0.45, ease: "back.out(3)" }); }
        });
      },
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
