/* Local interactions for the locked six-realm portal. No remote AI calls. */
(() => {
  "use strict";
  /** @type {any} */
  const state = window;
  const configNode = document.getElementById("portal-v2-data");
  if (!configNode) return;
  const data = JSON.parse(configNode.textContent);
  /** @param {string} selector @param {ParentNode} [scope] @returns {any} */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  /** @param {string} selector @param {ParentNode} [scope] @returns {any[]} */
  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));
  const ui = data.ui;
  const requested = new URLSearchParams(location.search)
    .get("currency")
    ?.toUpperCase();
  const currency = data.allowedCurrencies.includes(requested)
    ? requested
    : data.defaultCurrency;
  const prices = data.geoPricing;
  /** @param {number} amount */
  const format = (amount) =>
    new Intl.NumberFormat(data.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  /** @param {string} key */
  const price = (key) => prices[key]?.[currency]?.formatted || "";
  /** @param {string} key */
  const deposit = (key) => format(Number(prices[key][currency].amount) / 2);
  const replacements = [
    ["$2,500", price("b2bSprintLaunch")],
    ["$4,500", price("b2bSprintFlagship")],
    ["$1,250", deposit("b2bSprintLaunch")],
    ["$2,250", deposit("b2bSprintFlagship")],
    ["$5,000", price("b2bSovereign")],
    ["$3,500", ui.quoteOnly],
    ["$59", price("kiosk")],
  ];
  /** @param {string} value */
  const priceMarkup = (value) => {
    let text = String(value);
    for (const [from, to] of replacements) text = text.split(from).join(to);
    return text
      .replaceAll("[[currency]]", currency)
      .replace(/\[\[price:([A-Za-z]+)\]\]/g, (_, key) => price(key))
      .replace(/\[\[deposit:([A-Za-z]+)\]\]/g, (_, key) => deposit(key));
  };
  state.ColibriPortal = {
    data,
    currency,
    price,
    format,
    priceMarkup,
    prices: [
      price("b2bSprintLaunch"),
      price("b2bSprintFlagship"),
      ui.quoteOnly,
    ],
    deposits: [
      deposit("b2bSprintLaunch"),
      deposit("b2bSprintFlagship"),
      ui.quoteOnly,
    ],
    // Explicit arithmetic, not evaluated catalog expressions.
    /** @param {Record<string, number|string>} values @returns {Record<string, number>} */
    calculateFunnel(values) {
      /** @param {string} key */
      const n = (key) =>
        Math.max(
          0,
          Number.isFinite(Number(values[key])) ? Number(values[key]) : 0,
        );
      /** @param {string} key */
      const rate = (key) => Math.min(100, n(key)) / 100;
      const leadsCaptured = n("monthlyTraffic") * rate("codewordRate");
      const tripwireBuyers = leadsCaptured * rate("tripwireConversion");
      const tripwireRevenue = tripwireBuyers * n("tripwirePrice");
      const coreBuyers = tripwireBuyers * rate("coreOfferConversion");
      const coreRevenue = coreBuyers * n("coreOfferPrice");
      return {
        leadsCaptured,
        tripwireBuyers,
        tripwireRevenue,
        coreBuyers,
        coreRevenue,
        totalGrossRevenue: tripwireRevenue + coreRevenue,
      };
    },
    /** @param {Record<string,string>} fields */
    compilePrompt(fields) {
      return Object.entries(fields)
        .map(
          ([key, value]) =>
            `${key}: ${String(value).trim() || "[not specified]"}`,
        )
        .join("\n\n");
    },
  };
  // Resolve placeholders before the preserved reader/controller reads its copy.
  for (const id of ["portal-copy", "studio-copy"]) {
    const node = document.getElementById(id);
    if (node)
      node.textContent = JSON.stringify(
        JSON.parse(node.textContent),
        (_, value) => (typeof value === "string" ? priceMarkup(value) : value),
      );
  }
  document.documentElement.dataset.currency = currency;
  /** @param {string} message */
  const announce = (message) => {
    const live = $("#realm-live");
    if (live) live.textContent = message;
  };
  /** @param {unknown} value */
  const escape = (value) =>
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
  /** @param {string} text @param {HTMLElement} [button] */
  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      announce(ui.copied);
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      document.body.append(field);
      field.select();
      const ok = document.execCommand("copy");
      field.remove();
      announce(ok ? ui.copied : ui.copyFailed);
    }
    button?.focus();
  }
  /** @param {HTMLDialogElement|null} dialog @param {HTMLElement} [opener] */
  function openDialog(dialog, opener) {
    if (!dialog || dialog.open) return;
    dialog.addEventListener("close", () => opener?.focus(), { once: true });
    dialog.showModal();
  }
  function mount() {
    $$("[data-price-key]").forEach((node) => {
      node.textContent = price(node.dataset.priceKey);
    });
    $$("[data-deposit-key]").forEach((node) => {
      node.textContent = deposit(node.dataset.depositKey);
    });
    $$("[data-currency-label]").forEach((node) => {
      node.textContent = currency;
    });
    const currencySelect = $("#portal-currency");
    if (currencySelect) {
      currencySelect.value = currency;
      currencySelect.addEventListener("change", () => {
        const url = new URL(location.href);
        url.searchParams.set("currency", currencySelect.value);
        location.assign(url.href);
      });
    }
    const rail = $(".realm-pills");
    const syncPanels = () => {
      const realm = document.documentElement.dataset.realm || "academy";
      $$("[data-mobile-realm]").forEach((button) => {
        button.hidden = button.dataset.mobileRealm !== realm;
      });
      $$("[data-realm-panel]").forEach((panel) => {
        panel.inert = panel.dataset.realmPanel !== realm;
      });
      const active = $(`[data-realm-tab="${realm}"]`);
      if (active && innerWidth < 768) {
        const left =
          active.offsetLeft -
          rail.offsetLeft -
          (rail.clientWidth - active.offsetWidth) / 2;
        rail.scrollTo({ left: Math.max(0, left), behavior: "auto" });
      }
      const crumb = $("[data-realm-crumb]");
      if (crumb)
        crumb.textContent = `${String(data.realms.indexOf(realm) + 1).padStart(2, "0")} / ${ui[realm] || realm}`;
    };
    new MutationObserver(syncPanels).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-realm"],
    });
    syncPanels();
    const syncScale = () =>
      document.documentElement.style.setProperty(
        "--lesson-scale",
        document.documentElement.dataset.readerScale || "0",
      );
    new MutationObserver(syncScale).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-reader-scale"],
    });
    syncScale();
    $("[data-mobile-toc]")?.addEventListener(
      "click",
      /** @param {any} event */ (event) =>
        openDialog($("#toc-drawer"), event.currentTarget),
    );
    $("[data-mobile-type]")?.addEventListener("click", () => {
      const scale = Number(document.documentElement.dataset.readerScale || "0");
      if (scale < 2) $('[data-scale="1"]').click();
      else
        for (let index = 0; index < 4; index++) $('[data-scale="-1"]').click();
    });
    addEventListener(
      "keydown",
      /** @param {any} event */ (event) => {
        if (event.altKey && /^[1-6]$/.test(event.key)) {
          event.preventDefault();
          state.Unified?.showRealm(data.realms[Number(event.key) - 1], {
            restore: true,
          });
        }
      },
    );
    $$("[data-locale-switch]").forEach((button) => {
      button.addEventListener("click", () => {
        const locale = button.dataset.localeSwitch;
        const nextCurrency =
          locale === "ru"
            ? "RUB"
            : currency !== "RUB"
              ? currency
              : locale === "es"
                ? "EUR"
                : "USD";
        if (state.ColibriGeoRouter?.switchLocale)
          state.ColibriGeoRouter.switchLocale(locale, nextCurrency);
        else
          location.assign(
            locale === "en"
              ? `/?currency=${nextCurrency}${location.hash}`
              : `/${locale}/?currency=${nextCurrency}${location.hash}`,
          );
      });
    });
    $$(".locale-switch").forEach((group) =>
      group.addEventListener(
        "keydown",
        /** @param {any} event */ (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          const options = $$("button", group);
          const index = options.indexOf(document.activeElement);
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? options.length - 1
                : (index +
                    (event.key === "ArrowRight" ? 1 : -1) +
                    options.length) %
                  options.length;
          options.forEach((button, i) => {
            button.tabIndex = i === next ? 0 : -1;
          });
          options[next].focus();
        },
      ),
    );
    $("[data-locale-menu]")?.addEventListener(
      "click",
      /** @param {any} event */ (event) =>
        openDialog($("#locale-dialog"), event.currentTarget),
    );
    $$("[data-close-dialog]").forEach((button) =>
      button.addEventListener("click", () => button.closest("dialog").close()),
    );
    $("[data-mobile-theme]")?.addEventListener("click", () => {
      const themes = ["paper", "sepia", "dark"];
      const next =
        themes[
          (themes.indexOf(document.documentElement.dataset.theme || "paper") +
            1) %
            3
        ];
      state.Unified?.applyTheme(next, true);
    });
    $$("[data-lessons-open]").forEach((button) =>
      button.addEventListener("click", () =>
        openDialog($("#lesson-dialog"), button),
      ),
    );
    $$("[data-guides-search-focus]").forEach((button) =>
      button.addEventListener("click", () => $("#guides-q").focus()),
    );
    function courseRoute() {
      const match = /^#courses\/([^/]+)(?:\/([^/]+))?$/.exec(location.hash);
      const course =
        match &&
        data.courses.find(
          /** @param {any} item */ (item) => item.slug === match[1],
        );
      const available = !!course && (!match[2] || match[2] === "module-01");
      $$("[data-course-lesson]").forEach((node) => {
        node.hidden = !available || node.dataset.courseLesson !== course.slug;
      });
      $("[data-course-catalog]").hidden = available;
      $("#lesson-dialog")?.close();
      if (match && !available) announce(ui.lessonUnavailable);
    }
    addEventListener("hashchange", courseRoute);
    addEventListener("portalroute", courseRoute);
    courseRoute();
    for (const course of data.courses) {
      const host = $(`[data-trainer="${course.slug}"]`);
      const sim = course.interactiveSimulator;
      if (!host) continue;
      const output = $("[data-trainer-output]", host);
      if (sim.steps) {
        let current = 0;
        const inputs = $$("[data-prompt-field]", host);
        const update = () => {
          const fields = Object.fromEntries(
            inputs.map((input, index) => [sim.steps[index].label, input.value]),
          );
          output.textContent = state.ColibriPortal.compilePrompt(fields);
          $("[data-trainer-score]", host).textContent =
            `${inputs.filter((input) => input.value.trim()).length} / ${inputs.length}`;
          $$("[data-prompt-step]", host).forEach((node, index) => {
            node.hidden = index !== current;
          });
          $("[data-step-count]", host).textContent =
            `${current + 1} / ${inputs.length}`;
          $("[data-step-prev]", host).disabled = current === 0;
          $("[data-step-next]", host).disabled = current === inputs.length - 1;
        };
        inputs.forEach((input) => input.addEventListener("input", update));
        $("[data-step-prev]", host).addEventListener("click", () => {
          current = Math.max(0, current - 1);
          update();
          inputs[current].focus();
        });
        $("[data-step-next]", host).addEventListener("click", () => {
          current = Math.min(inputs.length - 1, current + 1);
          update();
          inputs[current].focus();
        });
        update();
      } else if (sim.parameters) {
        $('[data-funnel-input="tripwirePrice"]', host).value =
          prices.concentrate[currency].amount;
        $('[data-funnel-input="coreOfferPrice"]', host).value =
          prices.courseA[currency].amount;
        $$("[data-funnel-label]", host).forEach((label) => {
          label.textContent = label.textContent.replace(
            /USD|EUR|RUB/g,
            currency,
          );
        });
        const update = () => {
          const inputs = $$("[data-funnel-input]", host);
          const invalid = inputs.some(
            (input) => input.value === "" || !input.validity.valid,
          );
          if (invalid) {
            output.textContent = ui.validNumbers;
            output.dataset.valid = "false";
            return;
          }
          const values = Object.fromEntries(
            inputs.map((input) => [input.dataset.funnelInput, input.value]),
          );
          const result = state.ColibriPortal.calculateFunnel(values);
          output.dataset.valid = "true";
          output.dataset.total = String(result.totalGrossRevenue);
          output.textContent = sim.outputs
            .map(
              /** @param {any} item */ (item) =>
                `${item.name.replace(/USD|\$/g, currency)}: ${/Revenue$/.test(item.id) ? format(result[item.id]) : new Intl.NumberFormat(data.locale, { maximumFractionDigits: 2 }).format(result[item.id])}`,
            )
            .join("\n");
        };
        $$("[data-funnel-input]", host).forEach((input) =>
          input.addEventListener("input", update),
        );
        update();
      } else if (sim.axes) {
        const update = () => {
          /** @type {Record<string,string>} */
          const fields = {};
          fields[ui.subject] = $("[data-visual-subject]", host).value;
          $$("[data-visual-axis]", host).forEach((input, index) => {
            fields[sim.axes[index].name] = input.selectedOptions[0].textContent;
          });
          output.textContent = state.ColibriPortal.compilePrompt(fields);
          $("[data-trainer-score]", host).textContent =
            `${$$("[data-visual-axis]", host).length} / 5`;
        };
        $$("input,select", host).forEach((input) =>
          input.addEventListener("input", update),
        );
        update();
      }
      $("[data-copy-trainer]", host)?.addEventListener(
        "click",
        /** @param {any} event */ (event) =>
          copyText(output.textContent, event.currentTarget),
      );
    }
    let activeCategory = "all";
    let timer = 0;
    const queryInput = $("#guides-q");
    const search = () => {
      const query = queryInput.value.trim().toLocaleLowerCase(data.locale);
      let visible = 0;
      $$("[data-guide-card]").forEach((card) => {
        const guide = data.guides.find(
          /** @param {any} item */ (item) =>
            item.slug === card.dataset.guideCard,
        );
        const haystack = [
          guide.title,
          guide.summary,
          guide.category,
          guide.codeword,
          ...(guide.tags || []),
        ]
          .join(" ")
          .toLocaleLowerCase(data.locale);
        card.hidden =
          !(activeCategory === "all" || guide.category === activeCategory) ||
          !haystack.includes(query);
        if (!card.hidden) visible++;
      });
      const text = ui.showing
        .replace("{visible}", visible)
        .replace("{total}", data.guides.length);
      $("#guides-count").textContent = text;
      $("#guides-empty").hidden = visible !== 0;
      clearTimeout(timer);
      timer = setTimeout(() => announce(text), 300);
    };
    queryInput.addEventListener("input", search);
    $$("[data-guide-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        activeCategory = button.dataset.guideFilter;
        $$("[data-guide-filter]").forEach((node) =>
          node.setAttribute("aria-pressed", String(node === button)),
        );
        search();
      }),
    );
    $("[data-clear-guides]").addEventListener("click", () => {
      queryInput.value = "";
      activeCategory = "all";
      $$("[data-guide-filter]").forEach((node) =>
        node.setAttribute(
          "aria-pressed",
          String(node.dataset.guideFilter === "all"),
        ),
      );
      search();
      queryInput.focus();
    });
    const guideTabs = $$("[data-guides-tab]");
    /** @param {any} button */
    const selectGuideTab = (button) => {
      const tab = button.dataset.guidesTab;
      guideTabs.forEach((node) => {
        node.setAttribute("aria-selected", String(node === button));
        node.tabIndex = node === button ? 0 : -1;
      });
      $("#guides-list-panel").hidden = tab !== "guides";
      $("#glossary-panel").hidden = tab !== "glossary";
    };
    guideTabs.forEach((button) =>
      button.addEventListener("click", () => selectGuideTab(button)),
    );
    const glossaryRoute = () => {
      const match = /^#guides\/glossary(?:\/(\d+))?$/.exec(location.hash);
      if (!match) return;
      selectGuideTab(
        guideTabs.find((button) => button.dataset.guidesTab === "glossary"),
      );
      if (match[1])
        requestAnimationFrame(() =>
          document
            .getElementById(`glossary-letter-${match[1]}`)
            ?.scrollIntoView({ block: "start" }),
        );
    };
    addEventListener("portalroute", glossaryRoute);
    addEventListener("hashchange", glossaryRoute);
    glossaryRoute();
    $(".guide-tabs").addEventListener(
      "keydown",
      /** @param {any} event */ (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        const next =
          event.key === "Home"
            ? guideTabs[0]
            : event.key === "End"
              ? guideTabs[1]
              : guideTabs[0].getAttribute("aria-selected") === "true"
                ? guideTabs[1]
                : guideTabs[0];
        selectGuideTab(next);
        next.focus();
      },
    );
    /** @param {any} guide @param {HTMLElement} target */
    function renderGuide(guide, target) {
      target.innerHTML = `<h2>${escape(guide.title)}</h2>${guide.openPreview60.map(/** @param {any} paragraph */ (paragraph) => `<p>${escape(paragraph)}</p>`).join("")}<h3>${escape(ui.prompt1)}</h3><pre>${escape(guide.prompt1)}</pre><button type="button" class="btn btn--quiet" data-copy-guide>${escape(ui.copyPrompt)}</button><p class="portal-notice">${escape(ui.endPreview)}</p>`;
      $("[data-copy-guide]", target).addEventListener(
        "click",
        /** @param {any} event */ (event) =>
          copyText(guide.prompt1, event.currentTarget),
      );
    }
    $$("[data-open-guide]").forEach((button) =>
      button.addEventListener("click", () => {
        const guide = data.guides.find(
          /** @param {any} item */ (item) =>
            item.slug === button.dataset.openGuide,
        );
        if (innerWidth < 768) {
          renderGuide(guide, $("[data-guide-dialog-body]"));
          openDialog($("#guide-dialog"), button);
        } else {
          renderGuide(guide, $("#guide-preview"));
          $("#guide-preview").focus();
        }
      }),
    );
    if (data.guides[0]) renderGuide(data.guides[0], $("#guide-preview"));
    search();
    $$("[data-consultant]").forEach((host) => {
      const role = data.consultants.find(
        /** @param {any} item */ (item) => item.id === host.dataset.consultant,
      );
      let selected = role.quickStartChips[0];
      const update = () => {
        const context = $("[data-consultant-context]", host).value.trim();
        $("[data-consultant-output]", host).textContent =
          `${ui.localTemplate}\n\n${selected.label}\n\n${selected.prompt}\n\n${ui.outputFormat}\n${role.outputBlueprint}\n\n${ui.context}: ${context || ui.contextPlaceholder}\n\n${ui.templateNote}`;
      };
      $$("[data-scenario]", host).forEach((button) =>
        button.addEventListener("click", () => {
          selected = role.quickStartChips.find(
            /** @param {any} chip */ (chip) =>
              chip.id === button.dataset.scenario,
          );
          $$("[data-scenario]", host).forEach((node) =>
            node.setAttribute("aria-pressed", String(node === button)),
          );
          update();
        }),
      );
      $("[data-consultant-context]", host).addEventListener("input", update);
      $("[data-copy-consultant]", host).addEventListener(
        "click",
        /** @param {any} event */ (event) =>
          copyText(
            $("[data-consultant-output]", host).textContent,
            event.currentTarget,
          ),
      );
      $("[data-preview-consultant]", host).addEventListener(
        "click",
        /** @param {any} event */ (event) => {
          $("[data-template-dialog-body]").textContent = $(
            "[data-consultant-output]",
            host,
          ).textContent;
          openDialog($("#template-dialog"), event.currentTarget);
        },
      );
      update();
    });
    $("#concept-name").addEventListener(
      "input",
      /** @param {any} event */ (event) => {
        const name = event.target.value.trim().slice(0, 40);
        $$("[data-concept-name]").forEach((node) => {
          node.textContent = name || ui.yourName;
        });
      },
    );
    document.documentElement.dataset.portalV2Ready = "true";
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
