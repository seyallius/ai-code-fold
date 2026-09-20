# Code Fold for AI Chats

Adds a **Fold** / **Unfold** button to every code block in AI chat
interfaces, so long snippets stop pushing the conversation off the
screen. Code blocks are **expanded by default** — one click collapses
them.

## Supported sites

- **[chat.qwen.ai](https://chat.qwen.ai)** (also `qwen.ai`, `tongyi.aliyun.com`)
- **[chat.deepseek.com](https://chat.deepseek.com)**

Adding a new site is a one-object change to `src/sites.ts`. See
[Adding a site](#adding-a-site) below.

## What it looks like

- A pill-shaped **▾ Fold** button appears in each code block's header,
  next to Copy / Download.
- Clicking it hides the code body and replaces it with a dimmed
  **▸ Click to unfold** line.
- Clicking that line — or the button again — expands the block.
- On Qwen, expanding dispatches a `resize` event so the Monaco editor
  redraws its virtual viewport correctly.

## Build from source

**Requirements:** Node.js 18 or newer. [`just`](https://github.com/casey/just)
is optional but makes the final step one command.

```bash
git clone https://github.com/seyallius/ai-code-fold
cd ai-code-fold
npm install
npm run build          # bundles src/content.ts → content.js
```

That produces `content.js`, which `manifest.json` loads.

### Install it in Firefox / Zen / LibreWolf

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select **`manifest.json`** from the cloned folder.

> **Flatpak users (Firefox / Zen):** the file picker only exposes the
> single file you choose, not its siblings, so loading `manifest.json`
> directly fails with `Unable to load script: moz-extension://…/content.js`.
> Package the folder first and load the archive instead:
>
> ```bash
> zip -r ../code-fold.zip manifest.json content.js styles.css
> ```
>
> Then pick `../code-fold.zip` in step 3.

> **Note:** temporary add-ons are removed when the browser closes. Reload
> them each session, or sign and install it permanently via
> [addons.mozilla.org](https://addons.mozilla.org) if you'd rather.

### One-command build (with `just`)

If you have [`just`](https://github.com/casey/just) installed, the recipe
type-checks, builds, and zips in one go:

```bash
just zip           # → ../code-fold.zip
```

Then load `../code-fold.zip` in `about:debugging` (works for Flatpak and
non-Flatpak alike).

## Development

```
src/
├── sites.ts      # per-site descriptor table — the only file you edit
│                 # to add a new AI chat host
└── content.ts    # the fold engine: UI builders, mount, scan, observer
```

### Commands

```bash
npm run build     # one-shot bundle (src/content.ts → content.js)
npm run watch     # rebuild on save
npx tsc --noEmit  # type-check only; esbuild does not type-check
just zip          # type-check + build + zip for loading
```

### Adding a site

1. Open DevTools on the target site, inspect a code block, and note:
    - the outer element wrapping the whole block
    - the header row (language label + copy button)
    - the code body element
2. Add one entry to `SITES` in `src/sites.ts`:

   ```ts
   {
     id: "mysite",
     match: (h) => h.endsWith("mysite.com"),
     blockSelector: "...",       // outer block
     headerSelector: "...",      // header row
     bodySelector: "...",        // code body
   }
   ```

3. Add the host to `matches` in `manifest.json`.
4. `npm run build`, reload the add-on, hard-reload the tab.

Nothing else in the codebase changes — that's the point.

### A note on Monaco (Qwen)

Qwen renders code through a virtualized Monaco editor. Hiding the body
with `display: none` (rather than clamping height) keeps it intact;
Monaco's `ResizeObserver` re-lays out the viewport when the body is
shown again. That's why the extension dispatches a `resize` event on
expand.

## Privacy

The extension runs entirely in your browser. It reads code blocks to
inject a button, and it stores nothing. It makes no network requests,
has no telemetry, and has no analytics.

## License

MIT — see [LICENSE](LICENSE).
