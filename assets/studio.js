/* Local-first interaction layer. All purchase actions generate a brief, never a fake checkout. */
(() => {
  "use strict";
  const root = document.documentElement;
  /** @type {import("./studio-contracts").StudioCopy} */
  const copy = JSON.parse(
    document.getElementById("studio-copy")?.textContent || "{}",
  );
  /** @param {string} selector @returns {any} Dynamic selectors are checked by browser contracts. */
  const $ = (selector) => document.querySelector(selector);
  /** @param {string} selector @returns {any[]} */
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const keys = ["launch", "flagship", "monthly", "kiosk"];
  const prices = ["$2,500", "$4,500", "$3,500", "$59"];
  const deposits = ["$1,250", "$2,250", "$3,500", "$59"];
  let activePackage = 0;
  let readerIndex = 0;
  let activePhone = 2;
  let priorTheme = "dark";
  let storedScroll = 0;
  /** @type {HTMLElement | null} */
  let previousOpener = null;
  const dialog = $("#qualifier");
  const audio = window.StudioAudio;
  audio.setEnabled(false);

  function updateVideoPolicy() {
    const pause =
      reduced.matches ||
      root.dataset.theme === "reader" ||
      document.hidden ||
      root.dataset.motion === "paused";
    $$("video").forEach((video) => {
      if (pause) video.pause();
      else
        video.play().catch(() => {
          video.dataset.autoplay = "blocked";
        });
    });
  }
  /** @param {string} theme */
  function applyTheme(theme, persist = true) {
    if (!["dark", "paper", "reader"].includes(theme)) return;
    const before = root.dataset.theme;
    if (theme === "reader" && before !== "reader") {
      storedScroll = window.scrollY;
      priorTheme = before || "dark";
    }
    root.dataset.theme = theme;
    root.style.colorScheme = theme !== "dark" ? "light" : "dark";
    $('meta[name="theme-color"]').content =
      theme === "paper" ? "#F6F0E2" : "#09090B";
    if (theme === "reader") window.scrollTo({ top: 0, behavior: "instant" });
    if (before === "reader" && theme !== "reader")
      window.scrollTo({ top: storedScroll, behavior: "instant" });
    $$("[data-theme-choice]").forEach((button) => {
      const active = button.dataset.themeChoice === theme;
      button.setAttribute("aria-pressed", String(active));
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (persist) {
      try {
        localStorage.setItem("ng-studio-theme", theme);
      } catch (_) {
        /* Storage is optional for offline use. */
      }
    }
    updateVideoPolicy();
    audio.toggle();
  }
  $$("[data-theme-choice]").forEach((button) =>
    button.addEventListener("click", () =>
      applyTheme(button.dataset.themeChoice),
    ),
  );
  installNavIndicator($(".theme-toggle"));
  applyTheme(root.dataset.theme || "dark", false);
  document.addEventListener("visibilitychange", updateVideoPolicy);
  reduced.addEventListener("change", updateVideoPolicy);
  $("[data-sound-toggle]").addEventListener(
    "click",
    async (/** @type {MouseEvent} */ event) => {
      const enabled = !audio.isEnabled();
      audio.setEnabled(enabled);
      if (enabled) {
        await audio.unlock();
        audio.toggle();
      }
      const button = /** @type {HTMLButtonElement} */ (event.currentTarget);
      button.setAttribute("aria-pressed", String(enabled));
      button.textContent = enabled ? copy.soundOn : copy.sound;
      button.setAttribute("aria-label", button.textContent);
    },
  );
  // Explicit pause control for autoplay accessibility, separate from opt-in sound.
  const motion = document.createElement("button");
  motion.type = "button";
  motion.className = "sound-chip motion-toggle";
  motion.dataset.motionToggle = "";
  motion.textContent = copy.videoPause;
  motion.setAttribute("aria-label", copy.videoPause);
  motion.setAttribute("aria-pressed", "false");
  $(".hero-bottom").prepend(motion);
  motion.addEventListener("click", () => {
    const paused = root.dataset.motion !== "paused";
    root.dataset.motion = paused ? "paused" : "playing";
    motion.textContent = paused ? copy.videoPlay : copy.videoPause;
    motion.setAttribute("aria-label", motion.textContent);
    motion.setAttribute("aria-pressed", String(paused));
    updateVideoPolicy();
  });

  const phones = $$("[data-phone]");
  function positionPhones() {
    const compact = innerWidth < 768;
    phones.forEach((phone, index) => {
      let delta = index - activePhone;
      if (delta > 2) delta -= 5;
      if (delta < -2) delta += 5;
      const distance = Math.abs(delta);
      const x = delta * (compact ? 61 : 119);
      const z = distance === 0 ? 55 : -distance * (compact ? 100 : 160);
      const angle =
        delta === 0 ? 0 : -Math.sign(delta) * (distance === 1 ? 35 : 45);
      const y = distance * (compact ? 6 : 12);
      phone.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${angle}deg) scale(${distance === 0 ? 1 : 1 - distance * 0.035})`;
      phone.style.opacity = String(
        distance === 0 ? 1 : distance === 1 ? 0.78 : 0.5,
      );
      phone.style.zIndex = String(5 - distance);
      phone.setAttribute("aria-pressed", String(delta === 0));
      phone.tabIndex = delta === 0 ? 0 : -1;
    });
    $(".coverflow-track").dataset.activeIndex = String(activePhone);
    $(".coverflow-status").textContent =
      `${String(activePhone + 1).padStart(2, "0")} / 05`;
  }
  /** @param {number} delta */
  function shiftPhone(delta) {
    activePhone = (activePhone + delta + 5) % 5;
    positionPhones();
    audio.select();
  }
  $("[data-coverflow-prev]").classList.add("paddle");
  $("[data-coverflow-next]").classList.add("paddle");
  $("[data-coverflow-prev]").addEventListener("click", () => shiftPhone(-1));
  $("[data-coverflow-next]").addEventListener("click", () => shiftPhone(1));
  $("[data-reel-next]").addEventListener("click", () => {
    shiftPhone(1);
    $(".coverflow-shell").scrollIntoView({ block: "nearest" });
  });
  phones.forEach((phone, index) => {
    const activate = () => {
      activePhone = index;
      positionPhones();
      audio.select();
    };
    phone.addEventListener("click", activate);
    phone.addEventListener("keydown", (/** @type {KeyboardEvent} */ event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        shiftPhone(1);
        phones[activePhone].focus();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        shiftPhone(-1);
        phones[activePhone].focus();
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
  let touchX = 0;
  $(".coverflow-track").addEventListener(
    "touchstart",
    (/** @type {TouchEvent} */ event) => {
      touchX = event.touches[0].clientX;
    },
    { passive: true },
  );
  $(".coverflow-track").addEventListener(
    "touchend",
    (/** @type {TouchEvent} */ event) => {
      const dx = event.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 28) shiftPhone(dx < 0 ? 1 : -1);
    },
    { passive: true },
  );
  window.addEventListener("resize", positionPhones, { passive: true });
  positionPhones();

  window.SLNavigationInstance = window.MatteNavigation.mount($(".nav-demo"));
  const tabs = $$(".sl-nav .nav-btn");
  /** @param {number} index */
  function selectPackage(index) {
    activePackage = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(index === i));
      tab.tabIndex = index === i ? 0 : -1;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      selectPackage(index);
      audio.select();
    });
    // SL UI owns arrow-key selection; reflect its selected tab in the brief model.
    tab.addEventListener("focus", () => {
      if (tab.getAttribute("aria-selected") === "true") activePackage = index;
    });
  });
  $$("[data-configure]").forEach((button) =>
    button.addEventListener("click", () => {
      const index = keys.indexOf(button.dataset.configure);
      tabs[index].click();
      $("#workbench").scrollIntoView({
        behavior: reduced.matches ? "instant" : "smooth",
        block: "start",
      });
    }),
  );
  const openerButtons = $$("[data-open-brief]");
  openerButtons.forEach((button) =>
    button.addEventListener("click", () => {
      if (button.dataset.selectPackage)
        tabs[keys.indexOf(button.dataset.selectPackage)].click();
      previousOpener = button;
      $("#brief-form-view").hidden = false;
      $("#brief-result").hidden = true;
      dialog.showModal();
      $("#question-0").focus();
      audio.click();
    }),
  );
  $("[data-close-dialog]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (/** @type {MouseEvent} */ event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () =>
    previousOpener?.focus({ preventScroll: true }),
  );
  $("#qualifier-form").addEventListener(
    "submit",
    (/** @type {SubmitEvent} */ event) => {
      event.preventDefault();
      if (!$("#qualifier-form").reportValidity()) return;
      const values = [0, 1, 2].map(
        (i) => $(`#question-${i}`).selectedOptions[0].textContent,
      );
      const text = [
        copy.brand + " / Studio",
        "",
        copy.names[activePackage],
        `${copy.total}: ${prices[activePackage]}${activePackage === 2 ? " " + copy.perMonth : ""}`,
        `${copy.briefDue}: ${deposits[activePackage]}`,
        activePackage < 2
          ? copy.depositNote
          : activePackage === 2
            ? copy.monthlyNote
            : copy.kioskNote,
        "",
        `${copy.briefBusiness}: ${values[0]}`,
        `${copy.briefDeadline}: ${values[1]}`,
        `${copy.briefRail}: ${values[2]}`,
        "",
        ...copy.deliverables[activePackage].map((value) => "- " + value),
        "",
        copy.briefTerms,
      ].join("\n");
      $("#brief-text").value = text;
      $("[data-share-brief]").href =
        "https://t.me/share/url?url=&text=" + encodeURIComponent(text);
      $("#brief-form-view").hidden = true;
      $("#brief-result").hidden = false;
      $(".status-message").textContent = "";
      $("#result-heading").focus();
      audio.success();
    },
  );
  $("[data-edit-brief]").addEventListener("click", () => {
    $("#brief-form-view").hidden = false;
    $("#brief-result").hidden = true;
    $("#question-0").focus();
  });
  $("[data-copy-brief]").addEventListener("click", async () => {
    const field = $("#brief-text");
    try {
      await navigator.clipboard.writeText(field.value);
    } catch (_) {
      field.select();
      if (!document.execCommand("copy")) {
        field.focus();
        return;
      }
    }
    $(".status-message").textContent = copy.copied;
    audio.success();
  });

  /** @param {number} index */
  function showReader(index) {
    readerIndex = Math.max(0, Math.min(2, index));
    $$("[data-reader-slide]").forEach((slide, i) => {
      slide.hidden = i !== readerIndex;
      slide.setAttribute("aria-hidden", String(i !== readerIndex));
    });
    $$("[data-reader-to]").forEach((button, i) =>
      button.setAttribute("aria-current", String(i === readerIndex)),
    );
    $(".reader-count").textContent =
      `${String(readerIndex + 1).padStart(2, "0")} / 03`;
    $("[data-reader-prev]").disabled = readerIndex === 0;
    $("[data-reader-next]").disabled = readerIndex === 2;
  }
  $("[data-reader-prev]").addEventListener("click", () =>
    showReader(readerIndex - 1),
  );
  $("[data-reader-next]").addEventListener("click", () =>
    showReader(readerIndex + 1),
  );
  $$("[data-reader-to]").forEach((button) =>
    button.addEventListener("click", () =>
      showReader(Number(button.dataset.readerTo)),
    ),
  );
  document.addEventListener("keydown", (/** @type {KeyboardEvent} */ event) => {
    if (root.dataset.theme !== "reader" || dialog.open) return;
    if (event.key === "ArrowRight") showReader(readerIndex + 1);
    if (event.key === "ArrowLeft") showReader(readerIndex - 1);
    if (event.key === "Escape") applyTheme(priorTheme);
  });
  showReader(0);

  function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0;
    $(".hud-progress").style.transform = `scaleX(${progress})`;
    $(".hud-track").setAttribute(
      "aria-valuenow",
      String(Math.round(progress * 100)),
    );
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  $$(".liquid-btn").forEach((button) => {
    button.addEventListener(
      "pointermove",
      (/** @type {PointerEvent} */ event) => {
        if (root.dataset.input === "touch" || reduced.matches) return;
        const rect = button.getBoundingClientRect();
        button.style.setProperty(
          "--spot-x",
          `${((event.clientX - rect.left) / rect.width) * 100}%`,
        );
        button.style.setProperty(
          "--spot-y",
          `${((event.clientY - rect.top) / rect.height) * 100}%`,
        );
      },
    );
    button.addEventListener("pointerleave", () => {
      button.style.removeProperty("--spot-x");
      button.style.removeProperty("--spot-y");
    });
    button.addEventListener("pointerenter", () => audio.hover());
  });
  $$(".sprint-card").forEach((card) => {
    card.addEventListener(
      "pointermove",
      (/** @type {PointerEvent} */ event) => {
        if (root.dataset.input === "touch" || reduced.matches) return;
        const rect = card.getBoundingClientRect();
        const rx = -((event.clientY - rect.top) / rect.height - 0.5) * 4;
        const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
        card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      },
    );
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
  // Pure time motion hook lets tests and reviewers replay a deterministic scene.
  window.renderAtTime = (seconds) => {
    $$(".breakout-object").forEach((image, index) => {
      const offset = reduced.matches
        ? 0
        : Math.sin(seconds * 1.3 + index * 1.7) * 6;
      image.style.transform = `translate3d(0,${offset}px,56px) rotateZ(${reduced.matches ? 0 : Math.sin(seconds * 0.75 + index) * 1.5}deg)`;
    });
  };
  /** @param {number} ms */
  function renderFrame(ms) {
    if (
      !window.studioFreeze &&
      !document.hidden &&
      root.dataset.theme !== "reader"
    )
      window.renderAtTime(ms / 1000);
    requestAnimationFrame(renderFrame);
  }
  if (!reduced.matches) requestAnimationFrame(renderFrame);
  const mainVideo = $(".hero-cinema");
  const glowVideo = $(".hero-ambilight");
  mainVideo.addEventListener("timeupdate", () => {
    if (
      !glowVideo.seeking &&
      Math.abs(mainVideo.currentTime - glowVideo.currentTime) > 0.75
    )
      glowVideo.currentTime = mainVideo.currentTime;
  });
  window.Studio = {
    applyTheme,
    shiftPhone,
    showReader,
    updateProgress,
    updateVideoPolicy,
    get activePackage() {
      return keys[activePackage];
    },
  };
  document.fonts.ready.then(() => {
    positionPhones();
    updateProgress();
    root.dataset.ready = "true";
  });
})();
