(function () {
  "use strict";

  const LOG_PREFIX = "[CodeFold]";

  const SITES = [
    {
      id: "qwen",
      match: (h) => h.includes("qwen.ai") || h.includes("tongyi.aliyun.com"),
      blockSelector: "pre.qwen-markdown-code",
      buttonAnchorSelector: ".qwen-markdown-code-header",
      bodySelector: ".qwen-markdown-code-body",
    },
    {
      id: "deepseek",
      match: (h) => h.includes("deepseek.com"),
      blockSelector: "div.md-code-block",
      buttonAnchorSelector: ".md-code-block-banner",
      bodySelector: "pre",
    },
  ];

  const currentHost = window.location.hostname;
  const activeSite = SITES.find((s) => s.match(currentHost));
  if (!activeSite) return;

  console.log(`${LOG_PREFIX} Activated for ${activeSite.id} on ${currentHost}`);

  /* ---------------------------------------------------------------- *
   * Builders
   * ---------------------------------------------------------------- */

  function buildToggleButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cf-toggle-btn";

    const icon = document.createElement("span");
    icon.className = "cf-toggle-icon";
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "cf-toggle-label";

    btn.append(icon, label);
    return btn;
  }

  function buildUnfoldHint() {
    const hint = document.createElement("div");
    hint.className = "cf-unfold-hint";
    hint.setAttribute("role", "button");
    hint.setAttribute("tabindex", "0");
    hint.setAttribute("aria-label", "Click to unfold code");

    const icon = document.createElement("span");
    icon.className = "cf-unfold-hint-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "▸";

    const text = document.createElement("span");
    text.className = "cf-unfold-hint-text";
    text.textContent = "Click to unfold";

    hint.append(icon, text);
    return hint;
  }

  /* ---------------------------------------------------------------- *
   * Fold state
   * ---------------------------------------------------------------- */

  function applyFoldedState(block, button, folded) {
    block.classList.toggle("cf-folded", folded);

    const icon = button.querySelector(".cf-toggle-icon");
    const label = button.querySelector(".cf-toggle-label");

    icon.textContent = folded ? "▸" : "▾";
    label.textContent = folded ? "Unfold" : "Fold";

    button.setAttribute("aria-expanded", String(!folded));
    button.setAttribute("aria-label", folded ? "Unfold code" : "Fold code");
    button.title = folded ? "Expand code block" : "Collapse code block";
  }

  /* ---------------------------------------------------------------- *
   * Block processing
   * ---------------------------------------------------------------- */

  function processBlock(block) {
    if (block.dataset.cfProcessed === "true") return;

    const anchor = block.querySelector(activeSite.buttonAnchorSelector);
    const body = block.querySelector(activeSite.bodySelector);
    if (!anchor || !body) return;

    block.dataset.cfProcessed = "true";

    const button = buildToggleButton();
    const hint = buildUnfoldHint();

    // Button sits at the end of the header, alongside copy/download.
    anchor.appendChild(button);

    // Hint is placed right before the body, so it occupies the slot the
    // body leaves behind when folded. Works for both sites because the
    // body is a direct child of the block in both layouts.
    body.insertAdjacentElement("beforebegin", hint);

    const toggle = () => {
      const folded = !block.classList.contains("cf-folded");
      applyFoldedState(block, button, folded);
      // Monaco needs a nudge on Qwen once its body is visible again.
      if (!folded) window.dispatchEvent(new Event("resize"));
    };

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggle();
    });

    hint.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggle();
    });

    hint.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    // Start folded.
    applyFoldedState(block, button, true);
  }

  function scan() {
    document.querySelectorAll(activeSite.blockSelector).forEach(processBlock);
  }

  scan();

  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
})();
