(() => {
  const links = [...document.querySelectorAll("#sideNav a[data-section]")];
  const sections = links
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.section === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.25, 0.4] }
  );

  sections.forEach((section) => observer.observe(section));
  setActive("hero");
})();
