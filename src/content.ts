import { SITES, type SiteDescriptor } from "./sites";

const LOG_PREFIX = "[CodeFold]";
const MOUNTED = "cfMounted";

interface BlockController {
  readonly block: HTMLElement;
  fold(): void;
  unfold(): void;
}

/**
 * Registry of every mounted code block on the page. Global toolbar
 * buttons iterate this. Entries are skipped when their block has been
 * detached (e.g. after navigating to a different chat).
 */
const controllers = new Set<BlockController>();

/* ------------------------------------------------------------------ *
 * UI builders
 * ------------------------------------------------------------------ */

function buildToggleButton(): HTMLButtonElement {
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

function buildUnfoldHint(): HTMLDivElement {
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

function buildGlobalToolbar(): HTMLDivElement {
  const bar = document.createElement("div");
  bar.className = "cf-global-toolbar";

  const foldAll = document.createElement("button");
  foldAll.type = "button";
  foldAll.className = "cf-global-btn";
  foldAll.textContent = "Fold all";
  foldAll.title = "Collapse every code block on this page";
  foldAll.addEventListener("click", () => {
    for (const c of controllers) if (c.block.isConnected) c.fold();
  });

  const unfoldAll = document.createElement("button");
  unfoldAll.type = "button";
  unfoldAll.className = "cf-global-btn";
  unfoldAll.textContent = "Unfold all";
  unfoldAll.title = "Expand every code block on this page";
  unfoldAll.addEventListener("click", () => {
    for (const c of controllers) if (c.block.isConnected) c.unfold();
    // One resize for the whole page is enough — Monaco redraws all
    // visible viewports from a single event.
    window.dispatchEvent(new Event("resize"));
  });

  bar.append(foldAll, unfoldAll);
  return bar;
}

/* ------------------------------------------------------------------ *
 * Per-block wiring
 * ------------------------------------------------------------------ */

function mountBlock(block: HTMLElement, site: SiteDescriptor): void {
  const header = block.querySelector<HTMLElement>(site.headerSelector);
  const body = block.querySelector<HTMLElement>(site.bodySelector);
  if (!header || !body) return;

  block.dataset[MOUNTED] = "true";

  const button = buildToggleButton();
  const hint = buildUnfoldHint();
  header.appendChild(button);
  body.insertAdjacentElement("beforebegin", hint);

  const render = (expanded: boolean): void => {
    block.classList.toggle("cf-folded", !expanded);

    const icon = button.querySelector(".cf-toggle-icon")!;
    const label = button.querySelector(".cf-toggle-label")!;
    icon.textContent = expanded ? "▾" : "▸";
    label.textContent = expanded ? "Fold" : "Unfold";

    button.setAttribute("aria-expanded", String(expanded));
    button.setAttribute("aria-label", expanded ? "Fold code" : "Unfold code");
    button.title = expanded ? "Collapse code block" : "Expand code block";
  };

  const toggle = (): void => {
    const currentlyExpanded = !block.classList.contains("cf-folded");
    const nowExpanded = !currentlyExpanded;
    render(nowExpanded);
    if (nowExpanded) window.dispatchEvent(new Event("resize"));
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

  render(true); // start expanded

  controllers.add({
    block,
    fold: () => render(false),
    unfold: () => render(true),
  });
}

function scan(site: SiteDescriptor): void {
  const blocks = document.querySelectorAll<HTMLElement>(site.blockSelector);
  for (const block of blocks) {
    if (block.dataset[MOUNTED] === "true") continue;
    mountBlock(block, site);
  }
}

/* ------------------------------------------------------------------ *
 * Bootstrap
 * ------------------------------------------------------------------ */

function main(): void {
  const host = window.location.hostname;
  const site = SITES.find((s) => s.match(host));
  if (!site) return;

  console.log(`${LOG_PREFIX} Activated for ${site.id} on ${host}`);

  // Mount the toolbar once, up front. It works even when there are no
  // blocks yet (both buttons simply no-op).
  document.body.appendChild(buildGlobalToolbar());

  const runScan = (): void => scan(site);
  runScan();
  new MutationObserver(runScan).observe(document.body, {
    childList: true,
    subtree: true,
  });
}
main();
