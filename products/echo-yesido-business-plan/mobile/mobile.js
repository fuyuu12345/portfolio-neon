(() => {
  const chips = document.getElementById("chips");
  if (!chips) return;

  const links = [...chips.querySelectorAll("a[data-section]")];
  const sections = links
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      const on = link.dataset.section === id;
      link.classList.toggle("is-active", on);
      if (on) {
        const left = link.offsetLeft - 24;
        chips.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    },
    {
      rootMargin: "-30% 0px -55% 0px",
      threshold: [0.08, 0.2, 0.4],
    }
  );

  sections.forEach((section) => observer.observe(section));
  setActive("hero");

  links.forEach((link) => {
    link.addEventListener("click", () => {
      setActive(link.dataset.section);
    });
  });
})();
