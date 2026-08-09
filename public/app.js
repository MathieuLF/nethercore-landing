(() => {
  const root = document.documentElement;
  const year = document.querySelector("#current-year");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  let frame = 0;
  let targetX = 0;
  let targetY = 0;
  let targetPercentX = 50;
  let targetPercentY = 50;
  let currentX = 0;
  let currentY = 0;
  let currentPercentX = 50;
  let currentPercentY = 50;

  function syncYear() {
    if (!year) {
      return;
    }

    const currentYear = String(new Date().getFullYear());
    year.textContent = currentYear;
    year.dateTime = currentYear;
  }

  function renderPointer() {
    currentX += (targetX - currentX) * 0.075;
    currentY += (targetY - currentY) * 0.075;
    currentPercentX += (targetPercentX - currentPercentX) * 0.055;
    currentPercentY += (targetPercentY - currentPercentY) * 0.055;

    root.style.setProperty("--pointer-x", currentX.toFixed(3));
    root.style.setProperty("--pointer-y", currentY.toFixed(3));
    root.style.setProperty("--pointer-px", `${currentPercentX.toFixed(2)}%`);
    root.style.setProperty("--pointer-py", `${currentPercentY.toFixed(2)}%`);

    const stillMoving =
      Math.abs(targetX - currentX) > 0.002 ||
      Math.abs(targetY - currentY) > 0.002 ||
      Math.abs(targetPercentX - currentPercentX) > 0.02 ||
      Math.abs(targetPercentY - currentPercentY) > 0.02;

    if (stillMoving && !document.hidden) {
      frame = requestAnimationFrame(renderPointer);
    } else {
      frame = 0;
    }
  }

  function queuePointerFrame() {
    if (!frame && !document.hidden) {
      frame = requestAnimationFrame(renderPointer);
    }
  }

  function resetPointer() {
    targetX = 0;
    targetY = 0;
    targetPercentX = 50;
    targetPercentY = 50;
    queuePointerFrame();
  }

  function handlePointerMove(event) {
    if (reducedMotion.matches || !finePointer.matches) {
      return;
    }

    targetPercentX = (event.clientX / window.innerWidth) * 100;
    targetPercentY = (event.clientY / window.innerHeight) * 100;
    targetX = targetPercentX / 50 - 1;
    targetY = targetPercentY / 50 - 1;
    queuePointerFrame();
  }

  function syncMotionPreference() {
    root.dataset.motionPreference = reducedMotion.matches ? "reduced" : "standard";
    if (reducedMotion.matches) {
      resetPointer();
    }
  }

  function syncVisibility() {
    root.dataset.visibility = document.hidden ? "hidden" : "visible";

    if (document.hidden && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!document.hidden) {
      queuePointerFrame();
    }
  }

  function initProjectHub() {
    const projectControls = document.querySelector(".project-controls");
    const searchInput = document.querySelector("#project-search");
    const searchClear = document.querySelector("#search-clear");
    const filterButtons = document.querySelectorAll(".filter-tab");
    const projectItems = document.querySelectorAll(".utility-link[data-project]");
    const visibleCounter = document.querySelector(".counter-visible");
    const totalCounter = document.querySelector(".counter-total");
    const noResults = document.querySelector("#no-results");

    if (!projectItems.length) {
      return;
    }

    if (projectControls) {
      projectControls.hidden = false;
    }

    let activeFilter = "all";
    const totalCount = projectItems.length;

    if (totalCounter) {
      totalCounter.textContent = String(totalCount).padStart(2, "0");
    }

    function applyFilter() {
      const normalizeText = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const query = normalizeText((searchInput?.value || "").trim());
      let visibleCount = 0;

      projectItems.forEach((item) => {
        const name = normalizeText(item.dataset.name || item.querySelector(".utility-name")?.textContent || "");
        const desc = normalizeText(item.querySelector(".utility-desc")?.textContent || "");
        const status = normalizeText(item.dataset.status || item.dataset.category || "");

        const matchesCategory = activeFilter === "all" || status === activeFilter;
        const matchesQuery = !query || name.includes(query) || desc.includes(query) || status.includes(query);

        const isVisible = matchesCategory && matchesQuery;
        item.hidden = !isVisible;

        if (isVisible) {
          visibleCount++;
        }
      });

      if (visibleCounter) {
        visibleCounter.textContent = String(visibleCount).padStart(2, "0");
      }

      if (noResults) {
        noResults.hidden = visibleCount > 0;
      }

      if (searchClear) {
        searchClear.hidden = !query;
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        applyFilter();
      });
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((item) => {
          item.classList.remove("active");
          item.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
        activeFilter = button.dataset.filter || "all";
        applyFilter();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && document.activeElement !== searchInput && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        event.preventDefault();
        searchInput?.focus();
      } else if (event.key === "Escape" && document.activeElement === searchInput) {
        searchInput.value = "";
        searchInput.blur();
        applyFilter();
      }
    });

    applyFilter();
  }

  syncYear();
  syncMotionPreference();
  syncVisibility();
  initProjectHub();

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetPointer);
  document.addEventListener("visibilitychange", syncVisibility);
  reducedMotion.addEventListener("change", syncMotionPreference);
  finePointer.addEventListener("change", resetPointer);
})();
