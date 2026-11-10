(() => {
const bundle = JSON.parse(document.getElementById('book-data').textContent);
const progress = window.UnifiedProgress = {};
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const renderCalculator = window.BookCalculators.renderCalculator;
function renderQuiz(quiz, sample = false) {
 return '<section class="quiz" data-quiz-host data-sample="'+sample+'"></section>';
}
function gateMarkup(chapter) {
 const enterprise = chapter.chapterNumber >= 16;
 return '<section class="gate is-ruled"><h2>'+ (enterprise ? 'From architecture to a working system' : 'Put the field notes to work') +'</h2><p>This is an honest public preview. The full paid manuscript is not present in this bundle. The $59 toolkit contains reusable prompts and templates, not a coaching program or a hidden chapter unlock.</p><div class="bridge-actions"><button class="btn btn--primary" data-go-realm="kiosk">Explore $59 Async Toolkit</button><button class="btn btn--quiet" data-go-realm="studio" data-tier="'+(enterprise?'flagship':'launch')+'">Book Turnkey B2B Sprint ($2,500-$4,500)</button></div>'+(enterprise?'<p class="fineprint">Sovereign cluster deployments are a separate enterprise scope from $5,000. A creative sprint does not include a sovereign infrastructure deployment.</p>':'')+'</section>';
}
function coverMarkup() {
  const meta = bundle.bookMeta;
  return `<div data-reader-document><section class="cover" aria-labelledby="cover-title"><div class="cover__text"><p class="masthead">ColibriOS Press · First Edition</p><hr class="masthead__rule"><h1 class="cover__title" id="cover-title">${e(meta.title)}</h1><p class="cover__subtitle">${e(meta.subtitle)}</p><p class="cover__authors">By Tatiana Colibri &amp; Denys Viet</p><p class="cover__meta mono">2026 · 17 chapters · 2 living study ledgers</p><div class="cover__actions"><a class="btn btn--primary" href="#ch01">Begin Chapter 1</a><button class="btn btn--quiet" data-open="toc" aria-controls="toc-drawer" aria-expanded="false">Explore contents</button></div><p class="fineprint" data-cover-access>Part I · Free Open Access<br>Parts II–IV · Practitioner Vault · Part V · Enterprise B2B</p></div><figure class="cover__plate"><img src="${e(meta.coverIllustration.assetPath)}" alt="${e(meta.coverIllustration.alt)}" width="1024" height="1536" fetchpriority="high"></figure></section><nav class="parts-strip" aria-label="Edition access overview">${bundle.parts.map((part) => `<a class="part-card" href="#part-${part.partNumber}"><span class="mono">PART ${part.partRoman}</span><h2>${e(part.partTitle)}</h2><p>${e(part.accessSummary)} · ${part.chapters.length} chapters</p></a>`).join("")}</nav></div>`;
}

function partMarkup(part) {
  const chapter = bundle.chapters.find(
    (item) => item.chapterId === part.chapters[0],
  );
  const plate = chapter.partOpenerIllustration;
  return `<article class="part-opener" data-reader-document><p class="masthead" data-block-id="part-masthead">ColibriOS Press · Part ${part.partRoman}</p><figure class="part-opener__plate" data-block-id="part-plate"><img src="${e(part.plate)}" alt="${e(plate?.alt ?? part.partTitle)}" width="1536" height="1024"><figcaption>${e(plate?.caption ?? part.partTitle)}</figcaption></figure><h1 class="part-opener__title" data-block-id="part-title">${e(part.partTitle)}</h1><p class="cover__subtitle" data-block-id="part-intro">${e(part.accessSummary)}. ${part.partNumber === 1 ? "Build a calm, practical foundation before adding more tools, subscriptions or agents." : "A practitioner map, a diagnostic preview, and a clearly defined route into the complete material."}</p><ol class="part-opener__list" data-block-id="part-index">${part.chapters
    .map((id) => {
      const ch = bundle.chapters.find((item) => item.chapterId === id);
      return `<li><a href="#${id}"><span class="mono">${String(ch.chapterNumber).padStart(2, "0")}</span> ${e(ch.title)}</a> <span class="fineprint">· ${ch.estimatedReadMinutes} min · ${ch.access.toUpperCase()}</span></li>`;
    })
    .join(
      "",
    )}</ol><a class="btn btn--primary" href="#${part.chapters[0]}" data-block-id="part-begin">Enter Part ${part.partRoman} →</a></article>`;
}

function chapterHeader(chapter, locked) {
  return `<header class="chapter__head" data-block-id="${chapter.chapterId}-title"><p class="chapter__part">Part ${chapter.partRoman} · ${e(chapter.partTitle)}</p><h1 id="chapter-title"><span class="mono">CHAPTER ${String(chapter.chapterNumber).padStart(2, "0")}</span>${e(chapter.title)}</h1><p class="chapter__subtitle">${e(chapter.subtitle)}</p><div class="chapter__meta"><span>${chapter.estimatedReadMinutes} min read</span><span class="badge ${locked ? "badge--locked" : "badge--open"}">${locked ? "Member preview" : chapter.chapterNumber <= 5 ? "Free Open Access" : "Member edition"}</span><span>By ${e(chapter.authors.join(" & "))}</span></div></header>`;
}

const pencil =
  '<svg class="pencil-rule" viewBox="0 0 56 6" aria-hidden="true"><path d="M1 4 C14 2.2 33 5.5 55 2.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/></svg>';
const outcomes = (chapter) =>
  `<section class="study-summary is-ruled" data-atomic="outcomes"><h2><mark class="hl">What you will learn</mark></h2><ul>${chapter.learningOutcomes.map((value) => `<li>${e(value)}</li>`).join("")}</ul></section>`;
const chapterPartPlate = (chapter) =>
  chapter.partOpenerIllustration
    ? `<figure class="part-opener__plate chapter__part-plate" data-atomic="part-plate"><img src="${e(chapter.partOpenerIllustration.assetPath)}" alt="${e(chapter.partOpenerIllustration.alt)}" width="1536" height="1024"><figcaption class="fineprint">${e(chapter.partOpenerIllustration.caption)}</figcaption></figure>`
    : "";

function promptMarkup(prompt, index) {
  const text = e(prompt.promptText).replace(
    /(\{[^{}]+\}|\[[A-Z_ ]+\])/g,
    '<mark class="var">$1</mark>',
  );
  return `<section class="prompt-card" id="${e(prompt.promptId)}" data-atomic="prompt"><header class="prompt-card__head"><span class="prompt-card__id mono">P-${String(index + 1).padStart(2, "0")}</span><h3 class="prompt-card__title">${e(prompt.title)}</h3><span class="prompt-card__tokens mono">~${Math.ceil(prompt.promptText.length / 4)} tokens</span><button class="btn btn--quiet btn--small prompt-card__copy" data-copy-prompt="${e(prompt.promptId)}">Copy prompt</button></header><pre class="prompt-card__body"><code>${text}</code></pre><p class="prompt-card__foot"><strong>Tool:</strong> ${e(prompt.targetTool)} · ${e(prompt.whenToUse ?? prompt.useCase)}</p><details><summary>What good output looks like</summary><p>${e(prompt.expectedDeliverable ?? prompt.expectedOutput)}</p><ul>${(prompt.verificationChecklist ?? []).map((value) => `<li>${e(value)}</li>`).join("")}</ul></details></section>`;
}

function fullChapterMarkup(chapter) {
  const id = chapter.chapterId;
  let promptIndex = 0;
  let html = `<article class="chapter" data-reader-document>${chapterHeader(chapter, false)}<div class="chapter-body prose">${chapterPartPlate(chapter)}<blockquote class="epigraph" data-atomic="epigraph"><p>“${e(chapter.epigraph.quote)}”</p><cite>${e(chapter.epigraph.attribution)}</cite></blockquote>${outcomes(chapter)}`;
  for (const [sectionIndex, section] of chapter.sections.entries()) {
    html += `<h2 id="${e(section.sectionId)}">${e(section.heading)}</h2>`;
    if (section.leadHighlighter)
      html += `<p class="section-principle" data-atomic="principle"><mark class="hl">${e(section.leadHighlighter)}</mark></p>`;
    html += section.paragraphs
      .map(
        (paragraph, index) =>
          `<p id="${section.sectionId}-p${index + 1}" ${sectionIndex === 0 && index === 0 ? 'class="lede"' : ""}>${sectionIndex === 0 && index === 0 ? `<span class="lead-in">${e(paragraph.split(" ").slice(0, 4).join(" "))}</span>${e(" " + paragraph.split(" ").slice(4).join(" "))}` : e(paragraph)}</p>`,
      )
      .join("");
    if (section.bulletList)
      html += `<section data-atomic="list"><h3>${e(section.bulletList.title)}</h3><ul>${(section.bulletList.items ?? section.bulletList).map((value) => `<li>${e(value)}</li>`).join("")}</ul></section>`;
    if (section.comparisonTable) {
      const table = section.comparisonTable;
      html += `<div class="table-wrap" tabindex="0" role="region" aria-label="${e(table.caption)}" data-atomic="table"><table><caption>${e(table.caption)}</caption><thead><tr>${(table.headers ?? table.columns).map((value) => `<th scope="col">${e(value)}</th>`).join("")}</tr></thead><tbody>${table.rows.map((row) => `<tr>${row.map((value, index) => `<${index === 0 ? 'th scope="row"' : "td"}>${e(value)}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    }
    for (const callout of section.marginCallout
      ? [section.marginCallout]
      : []) {
      html += `<aside class="callout is-ruled" data-atomic="callout"><p class="callout__label">${e(callout.title ?? callout.label)}</p>${pencil}<p>${e(callout.body ?? callout.text)}</p><cite class="callout__voice">${e(callout.voice)}</cite></aside>`;
    }
    for (const prompt of chapter.promptCards.filter(
      (item) => item.placementAfterSectionId === section.sectionId,
    ))
      html += promptMarkup(prompt, promptIndex++);
    if (
      chapter.interactiveCalculator?.placementAfterSectionId ===
      section.sectionId
    )
      html += renderCalculator(chapter.interactiveCalculator);
  }
  html += chapter.promptCards
    .filter((item) => !item.placementAfterSectionId)
    .map((prompt, index) => promptMarkup(prompt, index))
    .join("");
  html += `<section class="checklist is-ruled" data-atomic="checklist"><h2><mark class="hl">Your practical field checklist</mark></h2><ol>${chapter.practicalChecklist.map((item, index) => `<li><label><input type="checkbox" data-checklist="${index}" aria-label="Complete step ${item.stepNumber ?? item.step}" ${progress[id]?.checklist?.[index] ? "checked" : ""}><span>${e(item.action)}<span class="checklist__proof"><strong>Evidence:</strong> ${e(item.expectedProof)}</span></span></label></li>`).join("")}</ol></section>${renderQuiz(chapter.quiz, false)}<footer class="chapter-footer" data-atomic="navigation"><button class="btn btn--quiet" data-complete>${progress[id]?.completed ? "✓ Chapter complete" : "Mark chapter complete"}</button>${chapter.chapterNumber < 17 ? `<a class="btn btn--primary" href="#ch${String(chapter.chapterNumber + 1).padStart(2, "0")}">Next chapter →</a>` : '<a class="btn btn--primary" href="#cover">Return to the edition</a>'}</footer></div></article>`;
  return html;
}

function lockedChapterMarkup(chapter) {
  const map = chapter.architectureMap;
  return `<article class="chapter chapter--locked" data-reader-document>${chapterHeader(chapter, true)}<div class="chapter-body prose preview">${chapterPartPlate(chapter)}<p class="preview__label">Executive preview · full body stays in the member service</p><p class="preview__abstract">${e(chapter.executiveAbstract)}</p>${outcomes(chapter)}<section class="architecture-map is-ruled" data-atomic="architecture"><h2>${e(map.title ?? "Architecture map")}</h2><dl><dt>Inputs</dt><dd>${e(map.inputs.join(" · "))}</dd><dt>Operating stages</dt><dd><ol>${(map.stages ?? map.coreMechanism).map((value) => `<li>${e(value)}</li>`).join("")}</ol></dd><dt>Outputs</dt><dd>${e(map.outputs ? map.outputs.join(" · ") : map.verifiedOutput)}</dd><dt>Acceptance gate</dt><dd><mark class="hl">${e(map.acceptanceGate ?? map.problemSolved)}</mark></dd></dl></section><section class="study-summary" data-atomic="outline"><h2>Inside the full chapter</h2><ol>${chapter.sectionHeadingsPreview.map((value) => `<li>${e(value)}</li>`).join("")}</ol><p class="fineprint"><strong>Applied stack:</strong> ${e(chapter.appliedStack.join(" · "))}</p></section>${renderQuiz(chapter.sampleDiagnosticQuestion, true)}${gateMarkup(chapter)}</div></article>`;
}


window.BookMarkup = {bundle, coverMarkup, partMarkup, fullChapterMarkup, lockedChapterMarkup};
})();
