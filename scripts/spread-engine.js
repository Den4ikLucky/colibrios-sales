const pageNode = (side) => {
  const page = document.createElement("section");
  page.className = `page page--${side}`;
  page.innerHTML =
    '<header class="page__runhead"></header><div class="page__body prose"></div><footer class="page__folio"></footer>';
  return page;
};

/** Atomic DOM pagination. Original interactive nodes move; controls never duplicate. */
class SpreadEngine {
  constructor(
    main,
    {
      title,
      partTitle,
      blocks,
      anchorId,
      onProgress,
      onRebuild = undefined,
      initialPage = 0,
    },
  ) {
    this.main = main;
    this.title = title;
    this.partTitle = partTitle;
    this.blocks = blocks;
    this.anchorId = anchorId;
    this.onProgress = onProgress;
    this.onRebuild = onRebuild;
    this.index = initialPage;
    this.pages = [];
    this.parking = document.createDocumentFragment();
    this.controller = new AbortController();
    this.stage = document.createElement("div");
    this.stage.className = "spread-stage";
    this.book = document.createElement("div");
    this.book.className = "spread";
    this.book.setAttribute("aria-label", "Paginated reading surface");
    this.stage.append(this.book);
    this.main.replaceChildren(this.stage);
    this.pagebar = /** @type {HTMLElement} */ (
      document.querySelector(".pagebar")
    );
    this.pagebar.hidden = false;
    const signal = this.controller.signal;
    document
      .querySelector("[data-page-prev]")
      .addEventListener("click", () => this.turn(-1), { signal });
    document
      .querySelector("[data-page-next]")
      .addEventListener("click", () => this.turn(1), { signal });
    document.querySelector("[data-page-scrubber]").addEventListener(
      "input",
      (event) => {
        if (event.target instanceof HTMLInputElement)
          this.go(Number(event.target.value) - 1);
      },
      { signal },
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          document.querySelector("dialog[open]") ||
          /INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement?.tagName)
        )
          return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          this.turn(event.key === "ArrowRight" ? 1 : -1);
        }
      },
      { signal },
    );
    this.resizeTimer = 0;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => this.paginate(), 100);
      },
      { signal },
    );
    this.stage.addEventListener(
      "touchstart",
      (event) => {
        this.touchX = event.touches[0].clientX;
        this.touchY = event.touches[0].clientY;
      },
      { passive: true, signal },
    );
    this.stage.addEventListener(
      "touchend",
      (event) => {
        if (
          event.target instanceof Element &&
          event.target.closest(
            ".page__card-scroll, input, button, select, a, label",
          )
        )
          return;
        const dx = event.changedTouches[0].clientX - this.touchX,
          dy = event.changedTouches[0].clientY - this.touchY;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
          this.turn(dx > 0 ? -1 : 1);
      },
      { passive: true, signal },
    );
    this.paginate();
  }

  setViewportPages() {
    this.perSpread = window.innerWidth >= 1240 ? 2 : 1;
    this.book.replaceChildren();
    this.leaves = [pageNode("verso")];
    if (this.perSpread === 2) this.leaves.push(pageNode("recto"));
    this.book.append(...this.leaves);
  }

  paginate() {
    if (!this.stage.isConnected) return;
    const focusedNode = document.activeElement?.closest("[data-block-id]");
    const focusedId =
      focusedNode instanceof HTMLElement ? focusedNode.dataset.blockId : null;
    const firstId = this.pages[this.index]?.[0]?.dataset.blockId;
    this.blocks.forEach((block) => this.parking.append(block));
    this.setViewportPages();
    const rect = this.leaves[0]
      .querySelector(".page__body")
      .getBoundingClientRect();
    const height = Math.max(80, Math.floor(rect.height) - 2);
    this.height = height;
    const measure = document.createElement("div");
    measure.className = "flow-measure";
    measure.setAttribute("aria-hidden", "true");
    measure.inert = true;
    measure.style.width = `${Math.floor(rect.width)}px`;
    measure.innerHTML = '<div class="page__body prose"></div>';
    document.body.append(measure);
    const body = measure.firstElementChild;
    const heights = new Map();
    this.blocks.forEach((block) => {
      block.removeAttribute("data-density");
      const clone = block.cloneNode(true);
      body.replaceChildren(clone);
      let blockHeight = Math.ceil(clone.getBoundingClientRect().height);
      if (blockHeight > height && block.dataset.atomic) {
        clone.dataset.density = "compact";
        block.dataset.density = "compact";
        blockHeight = Math.ceil(clone.getBoundingClientRect().height);
      }
      heights.set(block, blockHeight);
      block.dataset.oversized = String(blockHeight > height);
    });
    measure.remove();
    const pages = [];
    let page = [],
      used = 0;
    const flush = () => {
      if (page.length) pages.push(page);
      page = [];
      used = 0;
    };
    for (let index = 0; index < this.blocks.length; index += 1) {
      const block = this.blocks[index],
        blockHeight = heights.get(block);
      const next = this.blocks[index + 1];
      if (blockHeight > height) {
        flush();
        pages.push([block]);
        continue;
      }
      const reserve =
        /^H[23]$/.test(block.tagName) && next
          ? Math.min(heights.get(next), height) + 16
          : 0;
      const gap = page.length ? 16 : 0;
      if (page.length && used + gap + blockHeight + reserve > height) flush();
      if (page.length) used += 16;
      page.push(block);
      used += blockHeight;
    }
    flush();
    this.pages = pages.length ? pages : [[]];
    const restoreId = focusedId || firstId;
    const restored = restoreId
      ? this.pages.findIndex((items) =>
          items.some((block) => block.dataset.blockId === restoreId),
        )
      : -1;
    if (restored >= 0) this.index = restored;
    if (this.anchorId) {
      const anchor = this.pages.findIndex((items) =>
        items.some(
          (block) =>
            block.id === this.anchorId ||
            block.querySelector(`#${CSS.escape(this.anchorId)}`),
        ),
      );
      if (anchor >= 0) this.index = anchor;
      this.anchorId = null;
    }
    this.index = Math.min(this.index, this.pages.length - 1);
    this.index -= this.index % this.perSpread;
    this.render();
    this.onRebuild?.(this);
  }

  render() {
    this.blocks.forEach((block) => this.parking.append(block));
    this.leaves.forEach((leaf, offset) => {
      const number = this.index + offset;
      const body = leaf.querySelector(".page__body");
      body.replaceChildren();
      leaf.querySelector(".page__runhead").textContent =
        number === 0
          ? "ColibriOS Press · First Edition"
          : offset === 0
            ? this.partTitle
            : this.title;
      leaf.querySelector(".page__folio").textContent =
        number < this.pages.length ? String(number + 1) : "";
      const blocks = this.pages[number];
      if (!blocks) {
        body.innerHTML =
          '<div class="blank-page masthead">ColibriOS Press</div>';
        return;
      }
      if (blocks.length === 1 && blocks[0].dataset.oversized === "true") {
        const shell = document.createElement("div");
        shell.className = "page__oversized";
        shell.innerHTML =
          '<p class="page__scroll-hint">Study card · scroll inside to read the full card ↓</p><div class="page__card-scroll" tabindex="0" role="region" aria-label="Complete study card"></div>';
        shell.querySelector(".page__card-scroll").append(blocks[0]);
        body.append(shell);
      } else body.append(...blocks);
    });
    const end = Math.min(this.index + this.perSpread, this.pages.length);
    document.querySelector(".folio-counter").textContent =
      this.perSpread === 2
        ? `${this.index + 1}–${end} / ${this.pages.length}`
        : `${this.index + 1} / ${this.pages.length}`;
    const slider = /** @type {HTMLInputElement} */ (
      document.querySelector("[data-page-scrubber]")
    );
    slider.max = String(this.pages.length);
    slider.value = String(this.index + 1);
    /** @type {HTMLButtonElement} */ (
      document.querySelector("[data-page-prev]")
    ).disabled = this.index === 0;
    /** @type {HTMLButtonElement} */ (
      document.querySelector("[data-page-next]")
    ).disabled = end >= this.pages.length;
    this.main.dataset.pageCount = String(this.pages.length);
    this.main.dataset.pageIndex = String(this.index);
    this.onProgress?.(
      end / this.pages.length,
      this.pages[this.index]?.[0]?.dataset.blockId,
    );
  }

  turn(delta) {
    this.go(this.index + delta * this.perSpread);
  }
  go(index) {
    const last =
      Math.floor((this.pages.length - 1) / this.perSpread) * this.perSpread;
    this.index = Math.min(last, Math.max(0, index - (index % this.perSpread)));
    this.render();
  }
  findBlock(id) {
    const index = this.pages.findIndex((page) =>
      page.some(
        (block) => block.id === id || block.querySelector(`#${CSS.escape(id)}`),
      ),
    );
    if (index >= 0) this.go(index);
  }
  destroy() {
    this.controller.abort();
    clearTimeout(this.resizeTimer);
    this.blocks.forEach((block) => this.parking.append(block));
    this.pagebar.hidden = true;
  }
}

window.SpreadEngine = SpreadEngine;
