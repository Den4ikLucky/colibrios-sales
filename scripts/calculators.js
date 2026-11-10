const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const finite = (value, fallback = 0) =>
  Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (number, places = 0) =>
  Math.round((number + Number.EPSILON) * 10 ** places) / 10 ** places;
const money = (number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(number);
const integer = (number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(number);

function calculateRoutineROI(input = {}) {
  const activePaidSeats = finite(input.activePaidSeats);
  const avgSeatMonthlyUsd = finite(input.avgSeatMonthlyUsd);
  const monthlyApiSpendUsd = finite(input.monthlyApiSpendUsd);
  const weeklyHoursSaved = finite(input.weeklyHoursSaved);
  const hourlyValueUsd = finite(input.hourlyValueUsd);
  const monthlyToolCostUsd =
    activePaidSeats * avgSeatMonthlyUsd + monthlyApiSpendUsd;
  const monthlyValueCreatedUsd = weeklyHoursSaved * 4.33 * hourlyValueUsd;
  return {
    monthlyToolCostUsd,
    annualToolCostUsd: monthlyToolCostUsd * 12,
    monthlyValueCreatedUsd,
    netMonthlyBenefitUsd: monthlyValueCreatedUsd - monthlyToolCostUsd,
    roiMultiple:
      monthlyToolCostUsd > 0 ? monthlyValueCreatedUsd / monthlyToolCostUsd : 0,
    consolidationSavingsAnnualUsd:
      Math.max(0, activePaidSeats - 1) * avgSeatMonthlyUsd * 12,
  };
}

function calculateContextBudget(input = {}) {
  const modelWindowTokens = Math.max(
    1,
    finite(input.modelWindowTokens, 200000),
  );
  const standingInstructionsWords = finite(input.standingInstructionsWords);
  const attachedDocsWords = finite(input.attachedDocsWords);
  const connectedToolCount = finite(input.connectedToolCount);
  const chatTurnsElapsed = finite(input.chatTurnsElapsed);
  const instructionTokens = standingInstructionsWords * 1.25;
  const documentTokens = attachedDocsWords * 1.35;
  const toolSchemaTokens = connectedToolCount * 240;
  const conversationTokens = chatTurnsElapsed * 420;
  const promptTokensPerTurn =
    2100 +
    instructionTokens +
    documentTokens +
    toolSchemaTokens +
    conversationTokens +
    960;
  const windowUtilizationPct = round(
    Math.min(100, (promptTokensPerTurn / modelWindowTokens) * 100),
    1,
  );
  const attentionRetentionScore = Math.round(
    clamp(
      100 -
        Math.max(0, windowUtilizationPct - 18) * 0.65 -
        Math.max(0, connectedToolCount - 8) * 0.7 -
        Math.max(0, chatTurnsElapsed - 18) * 0.55,
      25,
      100,
    ),
  );
  const estimatedSessionCostUsd = round(
    ((promptTokensPerTurn * chatTurnsElapsed) / 1000000) * 1.5 +
      0.018 * chatTurnsElapsed * 0.4 +
      0.028,
    3,
  );
  return {
    promptTokensPerTurn,
    windowUtilizationPct,
    attentionRetentionScore,
    estimatedSessionCostUsd,
    effectivePracticalCeilingTokens: modelWindowTokens * 0.55,
    instructionTokens,
    documentTokens,
    toolSchemaTokens,
    conversationTokens,
  };
}

function calculateAnnualLedger({
  monthlySpend = 0,
  hourlyRate = 0,
  hoursSaved = 0,
} = {}) {
  const monthly = finite(monthlySpend),
    annual = monthly * 12,
    value = finite(hoursSaved) * 48 * finite(hourlyRate);
  return {
    monthly,
    annual,
    value,
    net: value - annual,
    multiple: annual ? value / annual : 0,
    breakEven: hourlyRate > 0 ? monthly / hourlyRate : null,
  };
}

function calculateTokenModel({
  W = 128000,
  S = 1200,
  T = 30,
  K = 350,
  F = 8000,
  N = 6,
  P = 250,
  p = 3,
} = {}) {
  const context =
    finite(S) + finite(T) * finite(K) + finite(F) + finite(N) * finite(P);
  const utilization = context / Math.max(1, finite(W));
  return {
    context,
    utilization,
    latestCost: (context * finite(p)) / 1000000,
    cumulativeCost:
      (((finite(S) + finite(F) + finite(N) * finite(P)) * finite(T) +
        (finite(K) * finite(T) * (finite(T) + 1)) / 2) *
        finite(p)) /
      1000000,
    health: clamp(
      Math.round(
        100 -
          (100 * Math.max(0, utilization - 0.4)) / 0.6 -
          0.6 * Math.max(0, T - 30) -
          2 * Math.max(0, N - 8),
      ),
      0,
      100,
    ),
  };
}

const ROI_PRESETS = [
  {
    label: "Solo learning stack",
    values: {
      activePaidSeats: 2,
      avgSeatMonthlyUsd: 20,
      monthlyApiSpendUsd: 0,
      weeklyHoursSaved: 2,
      hourlyValueUsd: 25,
    },
  },
  {
    label: "Creator automation stack",
    values: {
      activePaidSeats: 4,
      avgSeatMonthlyUsd: 22,
      monthlyApiSpendUsd: 25,
      weeklyHoursSaved: 6,
      hourlyValueUsd: 40,
    },
  },
  {
    label: "Small team with API",
    values: {
      activePaidSeats: 8,
      avgSeatMonthlyUsd: 25,
      monthlyApiSpendUsd: 100,
      weeklyHoursSaved: 16,
      hourlyValueUsd: 60,
    },
  },
];
const CONTEXT_PRESETS = [
  {
    label: "Lean task session",
    values: {
      modelWindowTokens: 128000,
      standingInstructionsWords: 600,
      attachedDocsWords: 1000,
      connectedToolCount: 3,
      chatTurnsElapsed: 6,
    },
  },
  {
    label: "Overloaded workspace",
    values: {
      modelWindowTokens: 128000,
      standingInstructionsWords: 1500,
      attachedDocsWords: 24000,
      connectedToolCount: 24,
      chatTurnsElapsed: 54,
    },
  },
  {
    label: "Agent with many tool schemas",
    values: {
      modelWindowTokens: 200000,
      standingInstructionsWords: 1200,
      attachedDocsWords: 8000,
      connectedToolCount: 32,
      chatTurnsElapsed: 30,
    },
  },
];

const outputs = [
  ["monthlyToolCostUsd", "Monthly stack cost", "currency"],
  ["annualToolCostUsd", "Annual stack cost", "currency"],
  ["monthlyValueCreatedUsd", "Monthly time value", "currency"],
  ["netMonthlyBenefitUsd", "Net monthly benefit", "currency"],
  ["roiMultiple", "Value / cost", "multiple"],
  [
    "consolidationSavingsAnnualUsd",
    "Potential consolidation saving / year",
    "currency",
  ],
];
const contextOutputs = [
  ["promptTokensPerTurn", "Prompt footprint / turn", "tokens"],
  ["windowUtilizationPct", "Window utilization", "percent"],
  ["attentionRetentionScore", "Context health heuristic", "score"],
  ["estimatedSessionCostUsd", "Estimated session cost", "preciseCurrency"],
  ["effectivePracticalCeilingTokens", "Practical working ceiling", "tokens"],
];
const format = (value, type) =>
  type === "currency"
    ? money(value)
    : type === "preciseCurrency"
      ? `$${value.toFixed(3)}`
      : type === "multiple"
        ? `${value.toFixed(1)}×`
        : type === "percent"
          ? `${integer(value)}%`
          : type === "score"
            ? `${value}/100`
            : `${integer(value)} tokens`;

function normalizeCalculator(source) {
  const id = source.id ?? source.calculatorId;
  return {
    ...source,
    id,
    description: source.description ?? source.subtitle,
    inputs: source.inputs.map((input) => ({
      ...input,
      key: input.key ?? input.id,
      min: input.min ?? Math.min(...input.options),
      max: input.max ?? Math.max(...input.options),
      step: input.step ?? 1000,
    })),
    presets: source.presets?.map((preset) => ({
      ...preset,
      label: preset.label ?? preset.name,
    })),
    note:
      source.note ??
      "Illustrative study estimate. Validate saved time and model behavior against your own work.",
    persist: source.persist ?? {
      key:
        id === "ai_subscription_routine_roi_v1"
          ? "colibri.book.v1.calc.sub_roi"
          : "colibri.book.v1.calc.ctx_budget",
    },
  };
}

function renderCalculator(config) {
  config = normalizeCalculator(config);
  const roi = config.id === "ai_subscription_routine_roi_v1";
  const id = roi ? "roi" : "context";
  const resultFields = roi ? outputs : contextOutputs;
  const controls = config.inputs
    .map((input) => {
      const control = input.options
        ? `<select id="${id}-${esc(input.key)}" class="num" data-calc-field="${esc(input.key)}">${input.options.map((value) => `<option value="${value}" ${value === input.default ? "selected" : ""}>${integer(value)} tokens</option>`).join("")}</select>`
        : `<input id="${id}-${esc(input.key)}" class="num" type="number" inputmode="decimal" min="${input.min}" max="${input.max}" step="${input.step}" value="${input.default}" data-calc-field="${esc(input.key)}"><input type="range" aria-label="${esc(input.label)} slider" min="${input.min}" max="${input.max}" step="${input.step}" value="${input.default}" data-calc-range="${esc(input.key)}">`;
      return `<label class="calc__input" for="${id}-${esc(input.key)}"><span class="calc__input-label"><span>${esc(input.label)}</span><output data-range-value="${esc(input.key)}"></output></span>${control}<span class="fineprint">${esc(input.unit)} · ${input.min}–${integer(input.max)}</span></label>`;
    })
    .join("");
  const presets = config.presets?.length
    ? config.presets
    : roi
      ? ROI_PRESETS
      : CONTEXT_PRESETS;
  return `<section class="calc is-ruled" data-atomic="calculator" data-calculator="${esc(config.id)}" aria-labelledby="${id}-title"><p class="calc__kicker mono">STUDY LEDGER · ${roi ? "01" : "02"}</p><h2 class="calc__title" id="${id}-title">${esc(config.title)}</h2><p class="calc__subtitle">${esc(config.description)}</p><div class="calc__body"><div class="calc__inputs">${controls}</div><div class="calc__outputs" aria-live="polite" aria-atomic="true">${resultFields.map(([key, label]) => `<div class="calc__result"><span>${label}</span><output class="num" data-calc-result="${key}"></output></div>`).join("")}</div></div><div class="calc__presets" role="group" aria-label="Calculator presets">${presets.map((preset, index) => `<button class="btn btn--quiet btn--small" data-calc-preset="${index}" aria-pressed="false">${preset.label}</button>`).join("")}<button class="btn btn--quiet btn--small" data-calc-reset>Reset defaults</button></div>${roi ? "" : '<svg class="calc__chart" viewBox="0 0 520 145" role="img" aria-label="Illustrative context health against conversation turns"><path d="M40 10V112H505" stroke="currentColor" fill="none" opacity="0.6"/><polyline data-context-chart points="" stroke="currentColor" fill="none" stroke-width="3"/><text x="4" y="20">100</text><text x="20" y="114">25</text><text x="40" y="137">0 turns</text><text x="430" y="137">100 turns</text></svg>'}<p class="calc__verdict" data-calc-verdict></p><p class="calc__note">${esc(config.note)} ${roi ? "Monthly value uses 4.33 weeks. The separate ledger below uses 48 working weeks per year; the two assumptions are intentionally labeled." : "Model-window capacity is not a guarantee of attention. Prices are illustrative inputs, not live provider rates."}</p>${roi ? renderAnnualLedger() : renderTokenNative()}</section>`;
}

function renderAnnualLedger() {
  const rows = [
    ["ChatGPT", 20, true],
    ["Claude", 20, true],
    ["Image / Video", 5, true],
    ["Codex / Coding", 0, false],
    ["Gamma / Slides", 0, false],
    ["Other", 0, false],
  ];
  return `<details class="calc__advanced"><summary>Annual subscription ledger · 48 working weeks</summary><p class="fineprint">Cost ledger with tool roles. Totals are independent of the curriculum model above.</p><div class="ledger-rows">${rows.map(([label, price, enabled], index) => `<div class="ledger-row"><input type="checkbox" data-ledger-enabled="${index}" aria-label="Include ${label}" ${enabled ? "checked" : ""}><label for="ledger-${index}">${label}</label><input class="num" type="number" id="ledger-${index}" aria-label="${label} monthly USD" min="0" max="9999" value="${price}" data-ledger-cost="${index}"><select aria-label="${label} usage role"><option>Routine</option><option>Specific task</option><option>Unused</option></select></div>`).join("")}</div><label class="calc__input">Your hourly rate, USD<input class="num" type="number" min="0" max="1000" value="40" data-ledger-rate></label><label class="calc__input">Hours saved per week<input class="num" type="number" min="0" max="80" value="3" step="0.5" data-ledger-hours></label><div class="calc__outputs" aria-live="polite">${[
    ["monthly", "Monthly burn"],
    ["annual", "Annual burn"],
    ["value", "Annual time value"],
    ["net", "Net annual value"],
    ["multiple", "Value / cost"],
    ["breakEven", "Break-even hours / month"],
  ]
    .map(
      ([key, label]) =>
        `<div class="calc__result"><span>${label}</span><output class="num" data-ledger-result="${key}"></output></div>`,
    )
    .join("")}</div></details>`;
}

function renderTokenNative() {
  const fields = [
    ["W", "Model window tokens", 128000, 8192, 1000000],
    ["S", "System and standing-instruction tokens", 1200, 0, 10000],
    ["T", "Dialogue turns", 30, 1, 200],
    ["K", "Mean tokens per turn", 350, 50, 2000],
    ["F", "Attached file tokens", 8000, 0, 250000],
    ["N", "Enabled tools", 6, 0, 40],
    ["P", "Tokens per tool schema", 250, 50, 2000],
    ["p", "Input price per million tokens, USD", 3, 0, 50],
  ];
  return `<details class="calc__advanced"><summary>Token-native budget model · configurable price</summary><p class="fineprint">A second, token-native model using explicit S + T × K + F + N × P. Its inputs and prices are independent.</p><div class="calc__inputs">${fields.map(([key, label, value, min, max]) => `<label class="calc__input">${label}<input type="number" class="num" min="${min}" max="${max}" step="${key === "p" ? "0.1" : "1"}" value="${value}" data-native-field="${key}"></label>`).join("")}</div><div class="calc__presets"><button class="btn btn--quiet btn--small" data-native-preset="clean">Clean task session</button><button class="btn btn--quiet btn--small" data-native-preset="overloaded">Overloaded everything</button></div><div class="calc__outputs" aria-live="polite">${[
    ["context", "Estimated context footprint"],
    ["utilization", "Context-window utilization"],
    ["latestCost", "Latest-turn input cost"],
    ["cumulativeCost", "Cumulative input cost"],
    ["health", "Context health heuristic"],
  ]
    .map(
      ([key, label]) =>
        `<div class="calc__result"><span>${label}</span><output class="num" data-native-result="${key}"></output></div>`,
    )
    .join(
      "",
    )}</div><p class="calc__note">Heuristic illustration - not a model benchmark. Degradation depends on task, retrieval, model, and instruction conflict. Above 55% utilization or 40 tools, start a fresh task session or remove unused tool schemas.</p></details>`;
}

function mountCalculators(root, config, storage, options = {}) {
  if (!config) return;
  config = normalizeCalculator(config);
  const element = root.querySelector("[data-calculator]");
  if (!element) return;
  const roi = config.id === "ai_subscription_routine_roi_v1";
  const storageKey = config.persist.key;
  const defaults = Object.fromEntries(
    config.inputs.map((input) => [input.key, input.default]),
  );
  const saved = storage.read(storageKey, defaults);
  const values = { ...defaults, ...saved };
  const fields = new Map(config.inputs.map((input) => [input.key, input]));
  const update = () => {
    for (const [key, spec] of fields) {
      values[key] = clamp(
        finite(values[key], spec.default),
        spec.min,
        spec.max,
      );
      element.querySelector(`[data-calc-field="${key}"]`).value = values[key];
      const range = element.querySelector(`[data-calc-range="${key}"]`);
      if (range) range.value = values[key];
      element.querySelector(`[data-range-value="${key}"]`).textContent =
        integer(values[key]);
    }
    const result = roi
      ? calculateRoutineROI(values)
      : calculateContextBudget(values);
    for (const [key, , type] of roi ? outputs : contextOutputs) {
      const output = element.querySelector(`[data-calc-result="${key}"]`);
      output.value = format(result[key], type);
      output.dataset.value = String(result[key]);
      if (key === "netMonthlyBenefitUsd")
        output.className = result[key] >= 0 ? "num positive" : "num negative";
    }
    element.querySelector("[data-calc-verdict]").textContent = roi
      ? result.monthlyToolCostUsd === 0
        ? "No paid cost entered. A value-to-cost multiple is not meaningful yet."
        : result.netMonthlyBenefitUsd >= 0
          ? "Positive time-value estimate. Measure saved hours with real work before increasing spend."
          : "The entered stack costs more than the estimated time it returns. Consolidate before adding a seat."
      : result.windowUtilizationPct > 55 ||
          values.connectedToolCount >= 40 ||
          result.attentionRetentionScore < 60
        ? "Practical ceiling reached: hand off the task, retrieve only relevant excerpts, and disable unused tools."
        : result.attentionRetentionScore < 80
          ? "Approaching the working ceiling. Save an evidence-backed handoff before adding more context."
          : "Room for focused work. Keep sources task-specific and measure outcomes, not just window size.";
    if (!roi) {
      const points = Array.from({ length: 51 }, (_, index) => {
        const health = calculateContextBudget({
          ...values,
          chatTurnsElapsed: index * 2,
        }).attentionRetentionScore;
        return `${40 + index * 9.2},${12 + ((100 - health) / 75) * 100}`;
      });
      element
        .querySelector("[data-context-chart]")
        .setAttribute("points", points.join(" "));
    }
    storage.write(storageKey, values);
    options.onChange?.();
  };
  element.addEventListener("input", (event) => {
    const key =
      event.target.dataset.calcField || event.target.dataset.calcRange;
    if (key) {
      values[key] = event.target.value;
      update();
    }
  });
  element.addEventListener("click", (event) => {
    const preset = event.target.closest("[data-calc-preset]");
    if (preset) {
      Object.assign(
        values,
        (config.presets?.length
          ? config.presets
          : roi
            ? ROI_PRESETS
            : CONTEXT_PRESETS)[Number(preset.dataset.calcPreset)].values,
      );
      element
        .querySelectorAll("[data-calc-preset]")
        .forEach((button) =>
          button.setAttribute("aria-pressed", String(button === preset)),
        );
      update();
    }
    if (event.target.closest("[data-calc-reset]")) {
      Object.assign(values, defaults);
      update();
    }
  });
  if (roi) mountLedger(element, storage);
  else mountNative(element, storage);
  update();
}

function mountLedger(element, storage) {
  const details = element.querySelector(".calc__advanced");
  const key = "colibri.book.v1.calc.roi";
  const saved = storage.read(key, null);
  if (saved) {
    details.querySelectorAll("[data-ledger-cost]").forEach((input, index) => {
      input.value = saved.costs?.[index] ?? input.value;
    });
    details
      .querySelectorAll("[data-ledger-enabled]")
      .forEach((input, index) => {
        input.checked = saved.enabled?.[index] ?? input.checked;
      });
    details.querySelector("[data-ledger-rate]").value = saved.rate ?? 40;
    details.querySelector("[data-ledger-hours]").value = saved.hours ?? 3;
  }
  const update = () => {
    const costs = [...details.querySelectorAll("[data-ledger-cost]")].map(
      (input) => finite(input.value),
    );
    const enabled = [...details.querySelectorAll("[data-ledger-enabled]")].map(
      (input) => input.checked,
    );
    const rate = finite(details.querySelector("[data-ledger-rate]").value),
      hours = finite(details.querySelector("[data-ledger-hours]").value);
    const result = calculateAnnualLedger({
      monthlySpend: costs.reduce(
        (sum, value, index) => sum + (enabled[index] ? value : 0),
        0,
      ),
      hourlyRate: rate,
      hoursSaved: hours,
    });
    details.querySelectorAll("[data-ledger-result]").forEach((output) => {
      const field = output.dataset.ledgerResult,
        value = result[field];
      output.value =
        field === "multiple"
          ? `${value.toFixed(1)}×`
          : field === "breakEven"
            ? value === null
              ? " - "
              : `${value.toFixed(2)} h`
            : money(value);
      output.dataset.value = String(value);
    });
    storage.write(key, { costs, enabled, rate, hours });
  };
  details.addEventListener("input", update);
  update();
}

function mountNative(element, storage) {
  const details = element.querySelector(".calc__advanced");
  const key = "colibri.book.v1.calc.context";
  const saved = storage.read(key, {});
  const read = () =>
    Object.fromEntries(
      [...details.querySelectorAll("[data-native-field]")].map((input) => [
        input.dataset.nativeField,
        finite(input.value),
      ]),
    );
  const update = () => {
    const values = read(),
      result = calculateTokenModel(values);
    details.querySelectorAll("[data-native-result]").forEach((output) => {
      const field = output.dataset.nativeResult,
        value = result[field];
      output.value =
        field === "context"
          ? `${integer(value)} tokens`
          : field === "utilization"
            ? `${(value * 100).toFixed(1)}%`
            : field === "health"
              ? `${value}/100`
              : `$${value.toFixed(4)}`;
      output.dataset.value = String(value);
    });
    storage.write(key, values);
  };
  const set = (values) =>
    details.querySelectorAll("[data-native-field]").forEach((input) => {
      if (values[input.dataset.nativeField] !== undefined)
        input.value = values[input.dataset.nativeField];
    });
  set(saved);
  details.addEventListener("input", update);
  details.addEventListener("click", (event) => {
    const preset = event.target.closest("[data-native-preset]");
    if (!preset) return;
    set(
      preset.dataset.nativePreset === "clean"
        ? { W: 128000, S: 1200, T: 8, K: 350, F: 1200, N: 3, P: 250, p: 3 }
        : { W: 128000, S: 6000, T: 90, K: 700, F: 60000, N: 30, P: 350, p: 3 },
    );
    update();
  });
  update();
}

window.BookCalculators = { renderCalculator, mountCalculators, calculateRoutineROI, calculateContextBudget, calculateAnnualLedger, calculateTokenModel };
