/* One local-first state machine for the three approved realms. */
(() => {
  "use strict";
  const root = document.documentElement;
  /** @param {string} selector @param {ParentNode} [scope] @returns {any} */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  /** @param {string} selector @param {ParentNode} [scope] @returns {any[]} */
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const copy = JSON.parse($("#portal-copy").textContent);
  const studioCopy = JSON.parse($("#studio-copy").textContent);
  const book = window.BookMarkup.bundle;
  const lang = root.lang;
  const prefix = `unified.portal.v1.${lang}.`;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const defaults = { academy: "paper", courses: "paper", guides: "sepia", kiosk: "sepia", club: "dark", studio: "dark" };
  const e = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c] || c,
    );
  const read = (key, fallback) => {
    try {
      return (
        JSON.parse(localStorage.getItem(prefix + key) || "null") ?? fallback
      );
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(prefix + key, JSON.stringify(value));
    } catch {
      /* Storage is optional. */
    }
  };
  const progress = Object.assign(window.UnifiedProgress, read("progress", {}));
  const ledger = read("calculators", {});
  let manualTheme = read("manualTheme", null);
  if (!["paper", "sepia", "dark"].includes(manualTheme)) manualTheme = null;
  let currentRoute = read("chapter", "cover");
  if (!/^(cover|part-[1-5]|ch(?:0[1-9]|1[0-7]))$/.test(currentRoute))
    currentRoute = "cover";
  let mode = read("viewMode", "scroll") === "spread" ? "spread" : "scroll";
  let scale = Math.max(-2, Math.min(2, Number(read("scale", 0)) || 0));
  let activePhone = 2;
  let selectedPack = 0;
  let motionPaused = false;
  let soundEnabled = false;
  let audioContext;
  /** @type {SpreadController | null} */
  let spread = null;
  let routeRevision = 0;
  /** @type {HTMLElement | undefined} */
  let previousOpener;
  let toastTimer;
  const scrollPositions = { academy: 0, courses: 0, guides: 0, kiosk: 0, club: 0, studio: 0 };
  const switchTimings = [];
  const keys = ["launch", "flagship", "monthly"];
  const prices = window.ColibriPortal.prices;
  const deposits = window.ColibriPortal.deposits;
  const main = $("#book-main");
  const drawer = $("#toc-drawer");
  const briefDialog = $("#qualifier");
  const packAssets = $("#packed-assets")
    ? JSON.parse($("#packed-assets").textContent)
    : null;

  function hydrateAssets(scope = document) {
    if (!packAssets) return;
    $$(
      "[src], [poster], [srcset], [data-pack-src], [data-pack-poster], [data-pack-srcset]",
      scope,
    ).forEach((node) => {
      for (const attr of ["src", "poster", "srcset"]) {
        const key =
          node.getAttribute(`data-pack-${attr}`) || node.getAttribute(attr);
        if (key && packAssets[key]) node.setAttribute(attr, packAssets[key]);
      }
    });
  }
  hydrateAssets();
  if (packAssets) $$("video").forEach((video) => video.load());

  function toast(message) {
    const node = $(".toast");
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (node.hidden = true), 2200);
  }
  function tap() {
    if (!soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume();
      const oscillator = audioContext.createOscillator(),
        gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 640;
      gain.gain.setValueAtTime(0.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.055,
      );
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.06);
    } catch {
      /* Audio cannot block navigation. */
    }
  }
  function updateVideoPolicy() {
    const pause =
      root.dataset.realm !== "studio" ||
      document.hidden ||
      reduced.matches ||
      motionPaused;
    $$("video").forEach((video) => {
      if (pause) video.pause();
      else video.play().catch(() => (video.dataset.autoplay = "blocked"));
    });
  }
  function applyTheme(theme, manual = false) {
    if (!["paper", "sepia", "dark"].includes(theme)) return;
    root.dataset.theme = theme;
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    $('meta[name="theme-color"]').content = {
      paper: "#F6F0E2",
      sepia: "#F4ECD8",
      dark: "#09090B",
    }[theme];
    $$("[data-theme-set]").forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.themeSet === theme),
      ),
    );
    if (manual) {
      manualTheme = theme;
      write("manualTheme", theme);
    }
  }
  function setHash(hash) {
    try {
      history.replaceState(null, "", hash);
      window.dispatchEvent(new Event("portalroute"));
    } catch {
      /* Embedded viewers may not expose history. */
    }
  }
  /** @param {string} realm @param {RealmSwitchOptions} [options] */
  function showRealm(realm, options = {}) {
    if (!Object.hasOwn(defaults, realm)) return;
    const start = performance.now();
    const before = root.dataset.realm;
    scrollPositions[before || "academy"] = scrollY;
    root.dataset.realm = realm;
    root.dataset.viewMode = realm === "academy" ? mode : "scroll";
    $$("[data-realm-panel]").forEach(
      (panel) => (panel.hidden = panel.dataset.realmPanel !== realm),
    );
    $$("[data-utilities]").forEach(
      (panel) => (panel.hidden = panel.dataset.utilities !== realm),
    );
    $$("[data-realm-tab]").forEach((button) => {
      const selected = button.dataset.realmTab === realm;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    applyTheme(manualTheme || defaults[realm]);
    if (drawer.open) drawer.close();
    if (options.hash !== false) setHash(`#${realm}`);
    root.dataset.lastSwitchMs = String(performance.now() - start);
    switchTimings.push({
      from: before,
      to: realm,
      ms: Number(root.dataset.lastSwitchMs),
    });
    if (options.tier) selectTier(options.tier);
    requestAnimationFrame(() => {
      if (root.dataset.realm !== realm) return;
      if (options.tier)
        $("#workbench").scrollIntoView({ block: "start", behavior: "instant" });
      else
        window.scrollTo({
          top: options.restore ? scrollPositions[realm] : 0,
          behavior: "instant",
        });
      if (realm === "studio") positionPhones();
      if (realm === "academy" && mode === "spread") spread?.paginate();
      updateProgress();
      updateVideoPolicy();
    });
    tap();
  }
  $$("[data-realm-tab]").forEach((button) =>
    button.addEventListener("click", () =>
      showRealm(button.dataset.realmTab, { restore: true }),
    ),
  );
  $(".realm-pills").addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const buttons = $$("[data-realm-tab]");
    const index = buttons.findIndex(
      (button) => button.getAttribute("aria-selected") === "true",
    );
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].click();
    buttons[next].focus();
  });
  $$("[data-theme-set]").forEach((button) =>
    button.addEventListener("click", () => {
      applyTheme(button.dataset.themeSet, true);
      tap();
    }),
  );
  $("[data-theme-reset]").addEventListener("click", () => {
    manualTheme = null;
    write("manualTheme", null);
    applyTheme(defaults[root.dataset.realm || "academy"]);
  });

  function tocMarkup() {
    const done = Object.values(progress).filter(
      (value) => value.completed,
    ).length;
    return `<a class="masthead" href="#cover">ColibriOS Press / Field Book</a><h2 class="toc__book">${e(copy.banner)}</h2><p class="toc__progress mono">${done} / 17</p>${book.parts
      .map(
        (part) =>
          `<section class="toc-part"><h3 class="toc-part__title"><a href="#part-${part.partNumber}">${lang === "ru" ? "\u0427\u0430\u0441\u0442\u044c" : "Part"} ${part.partRoman}</a></h3><ol class="toc-part__list">${part.chapters
            .map((id) => {
              const ch = book.chapters.find((item) => item.chapterId === id);
              if (!ch)
                throw new Error(
                  "Book navigation references a missing chapter: " + id,
                );
              return `<li class="toc-ch"><a href="#${id}" ${id === currentRoute ? 'aria-current="page"' : ""}><span class="toc-ch__num mono">${String(ch.chapterNumber).padStart(2, "0")}</span><span class="toc-ch__title">${e(copy.chapterTitles[ch.chapterNumber - 1] || ch.title)}</span><span class="toc-ch__meta">${e(ch.chapterNumber <= 5 ? copy.public : copy.previewLabel)}${progress[id]?.completed ? " / OK" : ""}</span></a></li>`;
            })
            .join("")}</ol></section>`,
      )
      .join("")}`;
  }
  function syncToc() {
    const html = tocMarkup();
    $("#toc").innerHTML = html;
    $("[data-drawer-contents]").innerHTML = html;
  }
  function chapterByRoute() {
    return book.chapters.find((ch) => ch.chapterId === currentRoute);
  }
  function localizeMarkup(html) {
    if (lang !== "ru") return window.ColibriPortal.priceMarkup(html);
    const replacements = [
      [
        "Begin Chapter 1",
        "\u041d\u0430\u0447\u0430\u0442\u044c \u0441 \u043f\u0435\u0440\u0432\u043e\u0439 \u0433\u043b\u0430\u0432\u044b",
      ],
      ["Explore contents", copy.contents],
      [
        "Explore $59 Async Toolkit",
        "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u0430\u0431\u043e\u0440 \u0437\u0430 $59",
      ],
      [
        "Book Turnkey B2B Sprint ($2,500-$4,500)",
        "\u0417\u0430\u043a\u0430\u0437\u0430\u0442\u044c B2B-\u0441\u043f\u0440\u0438\u043d\u0442 ($2,500-$4,500)",
      ],
      ["Mark chapter complete", copy.mark],
      ["Chapter complete", copy.complete],
      [
        "Next chapter",
        "\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f \u0433\u043b\u0430\u0432\u0430",
      ],
      [
        "Copy prompt",
        "\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u043c\u043f\u0442",
      ],
    ];
    replacements.forEach(([from, to]) => (html = html.split(from).join(to)));
    return window.ColibriPortal.priceMarkup(html);
  }
  function initCalculators(scope) {
    const config = chapterByRoute()?.interactiveCalculator;
    if (!config) return;
    window.BookCalculators.mountCalculators(scope, config, {
      read: (key, fallback) => ledger[key] ?? fallback,
      write: (key, values) => {
        ledger[key] = values;
        write("calculators", ledger);
      },
    });
  }
  function initQuiz(scope) {
    const chapter = chapterByRoute();
    if (!chapter) return;
    $$("[data-quiz-host]", scope).forEach((host) => {
      const quiz = chapter.quiz || {
        title: copy.check,
        questions: [chapter.sampleDiagnosticQuestion],
      };
      const saved = read(`quiz.${chapter.chapterId}`, null);
      host.innerHTML = `<h2 class="quiz__title">${e(copy.check)}</h2><form data-scored-quiz>${quiz.questions.map((q, index) => `<fieldset class="quiz__q"><legend>${index + 1}. ${e(q.scenario)}</legend>${q.options.map((option) => `<label class="quiz__opt"><input type="radio" required name="${q.questionId}" value="${option.optionId}" ${saved?.answers?.[q.questionId] === option.optionId ? "checked" : ""}><span>${e(option.label)}</span></label>`).join("")}<p class="quiz__why" data-feedback="${q.questionId}"></p></fieldset>`).join("")}<div class="quiz__actions"><button class="btn btn--primary" type="submit">${e(copy.check)}</button><button class="btn btn--quiet" type="reset">${e(copy.tryAgain)}</button></div><p role="status" data-score></p></form>`;
      const form = $("form", host);
      const showScore = (answers) => {
        const score = quiz.questions.filter(
          (q) => answers[q.questionId] === q.correctOptionId,
        ).length;
        $("[data-score]", host).textContent =
          `${copy.score}: ${score}/${quiz.questions.length}`;
        quiz.questions.forEach((q) => {
          const selected = q.options.find(
            (option) => option.optionId === answers[q.questionId],
          );
          $(`[data-feedback="${q.questionId}"]`, host).textContent =
            selected?.feedback || "";
        });
        host.dataset.score = String(score);
      };
      if (saved) showScore(saved.answers);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const answers = Object.fromEntries(new FormData(form));
        showScore(answers);
        write(`quiz.${chapter.chapterId}`, { answers });
        tap();
      });
      form.addEventListener("reset", () => {
        write(`quiz.${chapter.chapterId}`, null);
        $("[data-score]", host).textContent = "";
        $$("[data-feedback]", host).forEach((node) => (node.textContent = ""));
        delete host.dataset.score;
      });
    });
  }
  /** @param {string} [route] @param {{scroll?: boolean}} [options] */
  async function renderBook(route = currentRoute, options = {}) {
    if (!/^(cover|part-[1-5]|ch(?:0[1-9]|1[0-7]))$/.test(route))
      route = "cover";
    currentRoute = route;
    write("chapter", route);
    const revision = ++routeRevision;
    spread?.destroy();
    spread = null;
    root.dataset.bookReady = "false";
    const chapter = chapterByRoute();
    let html;
    if (route === "cover") html = window.BookMarkup.coverMarkup();
    else if (route.startsWith("part-"))
      html = window.BookMarkup.partMarkup(
        book.parts[Number(route.slice(-1)) - 1],
      );
    else if (chapter)
      html =
        chapter.chapterNumber <= 5
          ? window.BookMarkup.fullChapterMarkup(chapter)
          : window.BookMarkup.lockedChapterMarkup(chapter);
    else throw new Error("Missing chapter data for " + route);
    main.innerHTML = localizeMarkup(html);
    if (lang === "ru") {
      const title = $("#cover-title", main);
      if (title)
        title.textContent =
          "\u0418\u0418: \u043e\u0442 \u043f\u0435\u0440\u0432\u043e\u0433\u043e \u043f\u0440\u043e\u043c\u043f\u0442\u0430 \u043a \u0441\u0432\u043e\u0438\u043c \u0430\u0433\u0435\u043d\u0442\u0430\u043c";
      const sub = $(".cover__subtitle", main);
      if (sub) sub.textContent = copy.overview;
      if (chapter) {
        const overview = document.createElement("aside");
        overview.className = "chapter-overview";
        overview.innerHTML = `<b>${e(copy.overviewTitle)} ${String(chapter.chapterNumber).padStart(2, "0")} / ${e(copy.chapterTitles[chapter.chapterNumber - 1])}</b><p>${e(copy.bookNotice)}</p>`;
        main.prepend(overview);
        $(".chapter-body", main)?.setAttribute("lang", "en");
      }
    }
    if (route === "cover" || (chapter && chapter.chapterNumber <= 5)) {
      const bridge = document.createElement("aside");
      bridge.className = "book-bridge is-ruled";
      bridge.innerHTML = localizeMarkup(
        '<h2>From field notes to your next launch.</h2><div class="bridge-actions"><button class="btn btn--primary" data-go-realm="kiosk">Explore $59 Async Toolkit</button><button class="btn btn--quiet" data-go-realm="studio" data-tier="launch">Book Turnkey B2B Sprint ($2,500-$4,500)</button></div>',
      );
      main.append(bridge);
    }
    hydrateAssets(main);
    initCalculators(main);
    initQuiz(main);
    syncToc();
    $("[data-chapter-status]").textContent = chapter
      ? `${String(chapter.chapterNumber).padStart(2, "0")} / 17`
      : "17 / FIELD BOOK";
    const button = $("[data-complete]", main);
    if (button && progress[route]?.completed)
      button.textContent = copy.complete;
    $$("[data-checklist]", main).forEach((input) =>
      input.addEventListener("change", () => {
        progress[route] ||= {};
        progress[route].checklist ||= {};
        progress[route].checklist[input.dataset.checklist] = input.checked;
        write("progress", progress);
      }),
    );
    await document.fonts.ready;
    await Promise.all(
      $$("img", main).map((img) => img.decode().catch(() => {})),
    );
    if (revision !== routeRevision) return;
    root.dataset.bookReady = "true";
    if (mode === "spread") setViewMode("spread", false);
    if (options.scroll !== false && root.dataset.realm === "academy")
      window.scrollTo({ top: 0, behavior: "instant" });
  }
  function setViewMode(next, persist = true) {
    mode = next === "spread" ? "spread" : "scroll";
    if (persist) write("viewMode", mode);
    root.dataset.viewMode = root.dataset.realm === "academy" ? mode : "scroll";
    $$("[data-view-set]").forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.viewSet === mode),
      ),
    );
    $(".unified-pagebar").hidden = mode !== "spread";
    if (mode === "scroll") {
      if (spread) {
        spread.destroy();
        spread = null;
        renderBook(currentRoute, { scroll: false });
      }
      return;
    }
    if (spread) {
      spread.paginate();
      return;
    }
    const documentNode = $("[data-reader-document]", main);
    if (!documentNode) return;
    const chapter = chapterByRoute();
    let blocks;
    if (chapter)
      blocks = [
        $(".chapter__head", documentNode),
        ...$(".chapter-body", documentNode).children,
      ];
    else if (currentRoute.startsWith("part-"))
      blocks = [...documentNode.children];
    else
      blocks = [
        ...$(".cover__text", documentNode).children,
        $(".cover__plate", documentNode),
        $(".parts-strip", documentNode),
      ];
    blocks = blocks.filter(Boolean);
    blocks.forEach(
      (block, index) =>
        (block.dataset.blockId ||= block.id || `${currentRoute}-b${index}`),
    );
    spread = new window.SpreadEngine(main, {
      title: chapter?.title || book.bookMeta.title,
      partTitle: chapter
        ? `Part ${chapter.partRoman} / ${chapter.partTitle}`
        : "ColibriOS Press / Field Book",
      blocks,
      onProgress: (fraction) => {
        $(".portal-progress > span").style.transform = `scaleX(${fraction})`;
        $(".portal-progress").setAttribute(
          "aria-valuenow",
          String(Math.round(fraction * 100)),
        );
      },
    });
  }
  $$("[data-view-set]").forEach((button) =>
    button.addEventListener("click", () => setViewMode(button.dataset.viewSet)),
  );
  $$("[data-scale]").forEach((button) =>
    button.addEventListener("click", () => {
      scale = Math.max(-2, Math.min(2, scale + Number(button.dataset.scale)));
      root.dataset.readerScale = String(scale);
      write("scale", scale);
      if (mode === "spread") requestAnimationFrame(() => spread?.paginate());
    }),
  );
  $("[data-close-toc]").addEventListener("click", () => drawer.close());
  drawer.addEventListener("close", () =>
    $$('[data-open="toc"]').forEach((button) =>
      button.setAttribute("aria-expanded", "false"),
    ),
  );
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) {
      const r = drawer.getBoundingClientRect();
      if (event.clientX > r.right) drawer.close();
    }
  });

  function kioskBrief() {
    const text = [
      copy.brand,
      window.ColibriPortal.price("kiosk") + " / 100% ASYNC",
      `${copy.selected}: ${copy.packTitles[selectedPack]}`,
      `${copy.rail}: ${$("#kiosk-rail").value}`,
      copy.kioskText,
      "",
      copy.noCharge,
    ].join("\n");
    $("#kiosk-brief").value = text;
    $("[data-selected-pack]").textContent = copy.packTitles[selectedPack];
    $$("[data-select-pack]").forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.selectPack) === selectedPack),
      ),
    );
    return text;
  }
  $$("[data-pack-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      const filter = button.dataset.packFilter;
      $$("[data-pack-filter]").forEach((node) =>
        node.setAttribute("aria-pressed", String(node === button)),
      );
      $$("[data-pack-category]").forEach(
        (card) =>
          (card.hidden =
            filter !== "all" && card.dataset.packCategory !== filter),
      );
      const visible = $$("[data-pack-category]").filter((card) => !card.hidden);
      if (
        !visible.some((card) => Number(card.dataset.packIndex) === selectedPack)
      )
        selectedPack = Number(visible[0].dataset.packIndex);
      kioskBrief();
      tap();
    }),
  );
  $$("[data-select-pack]").forEach((button) =>
    button.addEventListener("click", () => {
      selectedPack = Number(button.dataset.selectPack);
      kioskBrief();
      tap();
    }),
  );
  $("#kiosk-rail").addEventListener("change", kioskBrief);
  $("[data-kiosk-generate]").addEventListener("click", () => {
    kioskBrief();
    $("#kiosk-brief").dataset.generated = "true";
    $("[data-kiosk-status]").textContent = copy.noCharge;
    tap();
  });
  async function copyText(field) {
    try {
      await navigator.clipboard.writeText(field.value);
    } catch {
      field.select();
      document.execCommand("copy");
    }
    toast(copy.copied);
  }
  $("[data-kiosk-copy]").addEventListener("click", () =>
    copyText($("#kiosk-brief")),
  );
  $("[data-kiosk-save]").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([kioskBrief()], { type: "text/plain;charset=utf-8" }),
    );
    a.download = `${lang}-async-toolkit-brief.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  kioskBrief();

  const config = $(".config-panel");
  window.SLNavigationInstance = window.MatteNavigation.mount(config);
  function activeTier() {
    return (
      $('[role="tab"][aria-selected="true"]', config)?.dataset.package ||
      "launch"
    );
  }
  function syncTier() {
    config.dataset.selectedTier = activeTier();
  }
  function selectTier(tier) {
    const button = $(`[data-package="${tier}"]`, config);
    if (button) {
      button.click();
      syncTier();
    }
  }
  $(".sl-nav").addEventListener("click", () => {
    syncTier();
    tap();
  });
  $(".sl-nav").addEventListener("keydown", () => queueMicrotask(syncTier));
  syncTier();
  function positionPhones() {
    const compact = innerWidth < 768;
    $$("[data-phone]").forEach((phone, index) => {
      let delta = index - activePhone;
      if (delta > 2) delta -= 5;
      if (delta < -2) delta += 5;
      const distance = Math.abs(delta),
        angle =
          delta === 0 ? 0 : -Math.sign(delta) * (distance === 1 ? 35 : 45);
      phone.style.transform = `translate3d(${delta * (compact ? 61 : 119)}px,${distance * (compact ? 6 : 12)}px,${distance === 0 ? 55 : -distance * (compact ? 100 : 160)}px) rotateY(${angle}deg) scale(${distance === 0 ? 1 : 1 - distance * 0.035})`;
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
  function shiftPhone(delta) {
    activePhone = (activePhone + delta + 5) % 5;
    positionPhones();
    tap();
  }
  $("[data-coverflow-prev]").classList.add("paddle");
  $("[data-coverflow-next]").classList.add("paddle");
  $("[data-coverflow-prev]").addEventListener("click", () => shiftPhone(-1));
  $("[data-coverflow-next]").addEventListener("click", () => shiftPhone(1));
  $("[data-reel-next]").addEventListener("click", () => {
    shiftPhone(1);
    $(".coverflow-shell").scrollIntoView({ block: "center" });
  });
  $$("[data-phone]").forEach((phone, index) => {
    phone.addEventListener("click", () => {
      activePhone = index;
      positionPhones();
    });
    phone.addEventListener("keydown", (event) => {
      if (["ArrowLeft", "ArrowRight", " ", "Enter"].includes(event.key)) {
        event.preventDefault();
        if (event.key.startsWith("Arrow"))
          shiftPhone(event.key === "ArrowRight" ? 1 : -1);
        else {
          activePhone = index;
          positionPhones();
        }
        $$("[data-phone]")[activePhone].focus();
      }
    });
  });
  let touchX = 0;
  $(".coverflow-track").addEventListener(
    "touchstart",
    (event) => (touchX = event.touches[0].clientX),
    { passive: true },
  );
  $(".coverflow-track").addEventListener(
    "touchend",
    (event) => {
      const dx = event.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 28) shiftPhone(dx < 0 ? 1 : -1);
    },
    { passive: true },
  );
  $("[data-sound-toggle]").addEventListener("click", (event) => {
    soundEnabled = !soundEnabled;
    event.currentTarget.setAttribute("aria-pressed", String(soundEnabled));
    event.currentTarget.textContent = soundEnabled ? copy.soundOn : copy.sound;
    tap();
  });
  $("[data-motion-toggle]").addEventListener("click", (event) => {
    motionPaused = !motionPaused;
    event.currentTarget.setAttribute("aria-pressed", String(motionPaused));
    event.currentTarget.textContent = motionPaused ? copy.play : copy.pause;
    updateVideoPolicy();
  });
  function openBrief(opener) {
    if (opener?.dataset.selectPackage) selectTier(opener.dataset.selectPackage);
    previousOpener = opener;
    $("#brief-form-view").hidden = false;
    $("#brief-result").hidden = true;
    briefDialog.showModal();
    $("#question-0").focus();
    tap();
  }
  $("[data-close-dialog]").addEventListener("click", () => briefDialog.close());
  briefDialog.addEventListener("close", () =>
    previousOpener?.focus({ preventScroll: true }),
  );
  briefDialog.addEventListener("click", (event) => {
    if (event.target === briefDialog) {
      const r = briefDialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        briefDialog.close();
    }
  });
  $("#qualifier-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const index = keys.indexOf(activeTier());
    const values = [0, 1, 2].map(
      (i) => $(`#question-${i}`).selectedOptions[0].textContent,
    );
    const text = [
      copy.brand + " / Studio",
      studioCopy.names[index],
      `${studioCopy.total}: ${prices[index]}`,
      `${studioCopy.briefDue}: ${deposits[index]}`,
      index < 2 ? studioCopy.depositNote : studioCopy.monthlyNote,
      "",
      `${studioCopy.briefBusiness}: ${values[0]}`,
      `${studioCopy.briefDeadline}: ${values[1]}`,
      `${studioCopy.briefRail}: ${values[2]}`,
      "",
      ...studioCopy.deliverables[index].map((item) => "- " + item),
      "",
      studioCopy.briefTerms,
    ].join("\n");
    $("#brief-text").value = text;
    $("[data-share-brief]").href =
      "https://t.me/share/url?url=&text=" + encodeURIComponent(text);
    $("#brief-form-view").hidden = true;
    $("#brief-result").hidden = false;
    $(".payment-notice").textContent = copy.noCharge;
    $("#result-heading").focus();
    tap();
  });
  $("[data-copy-brief]").addEventListener("click", () =>
    copyText($("#brief-text")),
  );
  $("[data-edit-brief]").addEventListener("click", () => {
    $("#brief-form-view").hidden = false;
    $("#brief-result").hidden = true;
    $("#question-0").focus();
  });

  document.addEventListener("click", (event) => {
    const target = /** @type {HTMLElement | null} */ (
      /** @type {Element | null} */ (event.target)?.closest("button,a") || null
    );
    if (!target) return;
    if (target.matches("[data-go-realm]")) {
      event.preventDefault();
      showRealm(target.dataset.goRealm || "academy", {
        tier: target.dataset.tier,
      });
      return;
    }
    if (target.matches("[data-configure]")) {
      showRealm("studio", { tier: target.dataset.configure });
      return;
    }
    if (target.matches("[data-open-brief]")) {
      openBrief(target);
      return;
    }
    if (target.matches('[data-open="toc"]')) {
      drawer.showModal();
      target.setAttribute("aria-expanded", "true");
      return;
    }
    if (target.matches("[data-complete]")) {
      progress[currentRoute] ||= {};
      progress[currentRoute].completed = true;
      write("progress", progress);
      target.textContent = copy.complete;
      syncToc();
      return;
    }
    if (target.matches("[data-copy-prompt]")) {
      const prompt = book.chapters
        .flatMap((ch) => ch.promptCards || [])
        .find((item) => item.promptId === target.dataset.copyPrompt);
      if (prompt) {
        const field = document.createElement("textarea");
        field.value = prompt.promptText;
        document.body.append(field);
        copyText(field).finally(() => field.remove());
      }
      return;
    }
    const hash = target.getAttribute("href");
    if (hash?.startsWith("#")) {
      event.preventDefault();
      navigate(hash.slice(1));
    }
  });
  function navigate(hash) {
    const match = /^(academy|courses|guides|kiosk|club|studio)\/(.+)$/.exec(hash);
    if (match) {
      showRealm(match[1], {hash: false});
      setHash("#" + hash);
      return;
    }
    if (Object.hasOwn(defaults, hash)) {
      showRealm(hash, { restore: true });
      return;
    }
    if (/^(cover|part-[1-5]|ch(?:0[1-9]|1[0-7]))$/.test(hash)) {
      if (drawer.open) drawer.close();
      showRealm("academy", { hash: false });
      setHash("#" + hash);
      renderBook(hash);
      return;
    }
    if (
      ["sprints", "workbench", "studio-founders", "studio-home"].includes(hash)
    ) {
      showRealm("studio", { hash: false });
      setHash("#" + hash);
      requestAnimationFrame(() =>
        document
          .getElementById(hash)
          ?.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    }
  }
  window.addEventListener("hashchange", () => navigate(location.hash.slice(1)));
  function updateProgress() {
    const max = root.scrollHeight - innerHeight;
    const fraction = max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0;
    const value = Math.round(fraction * 100);
    $(".hud-progress").style.transform = `scaleX(${fraction})`;
    $(".hud-track").setAttribute("aria-valuenow", String(value));
    $(".portal-progress > span").style.transform = `scaleX(${fraction})`;
    $(".portal-progress").setAttribute("aria-valuenow", String(value));
    if (root.dataset.realm === "academy" && chapterByRoute()) {
      progress[currentRoute] ||= {};
      progress[currentRoute].percent = value;
    }
  }
  let scrollQueued = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(() => {
          scrollQueued = false;
          updateProgress();
        });
      }
    },
    { passive: true },
  );
  window.addEventListener(
    "resize",
    () => {
      positionPhones();
      if (mode === "spread" && root.dataset.realm === "academy")
        spread?.paginate();
      updateProgress();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", updateVideoPolicy);
  reduced.addEventListener("change", updateVideoPolicy);
  window.addEventListener("pagehide", () => write("progress", progress));
  window.renderAtTime = (seconds) => {
    $$(".breakout-object").forEach((image, index) => {
      const offset = reduced.matches
        ? 0
        : Math.sin(seconds * 1.3 + index * 1.7) * 6;
      image.style.transform = `translate3d(0,${offset}px,56px) rotateZ(${reduced.matches ? 0 : Math.sin(seconds * 0.75 + index) * 1.5}deg)`;
    });
  };
  function frame(ms) {
    if (
      root.dataset.realm === "studio" &&
      !window.studioFreeze &&
      !reduced.matches &&
      !document.hidden
    )
      window.renderAtTime(ms / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.renderAtTime(0);
  $(".hero-cinema").addEventListener("timeupdate", () => {
    const hero = $(".hero-cinema"),
      glow = $(".hero-ambilight");
    if (!glow.seeking && Math.abs(hero.currentTime - glow.currentTime) > 0.75)
      glow.currentTime = hero.currentTime;
  });
  $$(".liquid-btn").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (reduced.matches || innerWidth < 768) return;
      const r = button.getBoundingClientRect();
      button.style.setProperty(
        "--spot-x",
        `${((event.clientX - r.left) / r.width) * 100}%`,
      );
      button.style.setProperty(
        "--spot-y",
        `${((event.clientY - r.top) / r.height) * 100}%`,
      );
    });
    button.addEventListener("pointerleave", () => {
      button.style.removeProperty("--spot-x");
      button.style.removeProperty("--spot-y");
    });
  });
  window.Unified = {
    showRealm,
    applyTheme,
    navigateBook: renderBook,
    setViewMode,
    selectTier,
    shiftPhone,
    hydrateAssets,
    updateVideoPolicy,
    get switchTimings() {
      return [...switchTimings];
    },
    get activeTier() {
      return activeTier();
    },
    get bookRoute() {
      return currentRoute;
    },
    get manualTheme() {
      return manualTheme;
    },
  };
  root.dataset.readerScale = String(scale);
  positionPhones();
  applyTheme(manualTheme || "paper");
  const initialHash = location.hash.slice(1);
  renderBook(currentRoute, { scroll: false }).then(() => {
    setViewMode(mode, false);
    if (initialHash) navigate(initialHash);
    else showRealm("academy", { hash: false });
    document.fonts.ready.then(() => {
      root.dataset.ready = "true";
      updateProgress();
    });
  });
})();
