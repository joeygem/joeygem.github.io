// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => links.classList.remove("open"))
);

// Project filters
const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".projects .card");
filters.forEach((btn) =>
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    cards.forEach((c) => c.classList.toggle("hidden", f !== "all" && c.dataset.cat !== f));
  })
);

// Animated stat counters
const animateCount = (el) => {
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const start = performance.now();
  const dur = 1200;
  const step = (t) => {
    const p = Math.min((t - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const stats = document.querySelectorAll(".stat-num");

// Reveal on scroll
const revealTargets = document.querySelectorAll(".section-title, .card, .stat, .timeline > li, .skill-group, .pillar");
revealTargets.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        if (e.target.classList.contains("stat")) animateCount(e.target.querySelector(".stat-num"));
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("visible"));
  stats.forEach((el) => (el.textContent = (el.dataset.prefix || "") + el.dataset.count + (el.dataset.suffix || "")));
}
