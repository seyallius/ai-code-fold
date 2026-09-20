"use strict";
(() => {
  // src/sites.ts
  var SITES = [
    {
      id: "qwen",
      match: (h) => h.endsWith("qwen.ai") || h.endsWith("tongyi.aliyun.com"),
      blockSelector: "pre.qwen-markdown-code",
      headerSelector: ".qwen-markdown-code-header",
      bodySelector: ".qwen-markdown-code-body"
    },
    {
      id: "deepseek",
      match: (h) => h.endsWith("deepseek.com"),
      blockSelector: "div.md-code-block",
      headerSelector: ".md-code-block-banner",
      bodySelector: "pre"
    }
  ];

  // src/content.ts
  var LOG_PREFIX = "[CodeFold]";
  var MOUNTED = "cfMounted";
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
    icon.textContent = "\u25B8";
    const text = document.createElement("span");
    text.className = "cf-unfold-hint-text";
    text.textContent = "Click to unfold";
    hint.append(icon, text);
    return hint;
  }
  function mountBlock(block, site) {
    const header = block.querySelector(site.headerSelector);
    const body = block.querySelector(site.bodySelector);
    if (!header || !body) return;
    block.dataset[MOUNTED] = "true";
    const button = buildToggleButton();
    const hint = buildUnfoldHint();
    header.appendChild(button);
    body.insertAdjacentElement("beforebegin", hint);
    const render = (expanded) => {
      block.classList.toggle("cf-folded", !expanded);
      const icon = button.querySelector(".cf-toggle-icon");
      const label = button.querySelector(".cf-toggle-label");
      icon.textContent = expanded ? "\u25BE" : "\u25B8";
      label.textContent = expanded ? "Fold" : "Unfold";
      button.setAttribute("aria-expanded", String(expanded));
      button.setAttribute("aria-label", expanded ? "Fold code" : "Unfold code");
      button.title = expanded ? "Collapse code block" : "Expand code block";
    };
    const toggle = () => {
      const nowFolded = !block.classList.contains("cf-folded");
      render(!nowFolded);
      if (!nowFolded) window.dispatchEvent(new Event("resize"));
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
    render(true);
  }
  function scan(site) {
    const blocks = document.querySelectorAll(site.blockSelector);
    for (const block of blocks) {
      if (block.dataset[MOUNTED] === "true") continue;
      mountBlock(block, site);
    }
  }
  function main() {
    const host = window.location.hostname;
    const site = SITES.find((s) => s.match(host));
    if (!site) return;
    console.log(`${LOG_PREFIX} Activated for ${site.id} on ${host}`);
    const runScan = () => scan(site);
    runScan();
    new MutationObserver(runScan).observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  main();
})();
