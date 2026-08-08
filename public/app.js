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

  syncYear();
  syncMotionPreference();
  syncVisibility();

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetPointer);
  document.addEventListener("visibilitychange", syncVisibility);
  reducedMotion.addEventListener("change", syncMotionPreference);
  finePointer.addEventListener("change", resetPointer);
})();
