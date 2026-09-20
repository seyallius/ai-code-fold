(function () {
  "use strict";

  const LOG_PREFIX = "[CodeFold]";

  const SITES = [
    {
      id: "qwen",
      match: (h) => h.includes("qwen.ai") || h.includes("tongyi.aliyun.com"),
      blockSelector: "pre.qwen-markdown-code",
      headerSelector: ".qwen-markdown-code-header-wrapper",
      bodySelector: ".qwen-markdown-code-body",
    },
    {
      id: "deepseek",
      match: (h) => h.includes("deepseek.com"),
      blockSelector: "div.md-code-block",
      headerSelector: ".md-code-block-banner",
      bodySelector: "pre",
    },
  ];

  const currentHost = window.location.hostname;
  const activeSite = SITES.find((s) => s.match(currentHost));

  if (!activeSite) return;

  console.log(`${LOG_PREFIX} Activated for ${activeSite.id} on ${currentHost}`);

  function createFoldButton(block, body) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cf-toggle-btn";
    btn.textContent = "Fold";
    btn.setAttribute("aria-label", "Toggle code visibility");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      const isFolded = block.classList.toggle("cf-folded");
      btn.textContent = isFolded ? "Unfold" : "Fold";

      // If unfolding on Qwen, dispatch resize so Monaco virtual scroll redraws
      if (!isFolded) {
        window.dispatchEvent(new Event("resize"));
      }
    });

    return btn;
  }

  function processBlock(block) {
    // Prevent duplicate processing
    if (block.dataset.cfProcessed === "true") return;

    const header = block.querySelector(activeSite.headerSelector);
    const body = block.querySelector(activeSite.bodySelector);

    if (!header || !body) return;

    block.dataset.cfProcessed = "true";

    // Insert toggle button into the header
    const toggleBtn = createFoldButton(block, body);
    header.appendChild(toggleBtn);

    // Fold by default
    block.classList.add("cf-folded");
    toggleBtn.textContent = "Unfold";
  }

  function scan() {
    const blocks = document.querySelectorAll(activeSite.blockSelector);
    blocks.forEach((block) => processBlock(block));
  }

  // Initial scan
  scan();

  // Handle SPA DOM updates and streaming tokens
  const observer = new MutationObserver(() => {
    scan();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
