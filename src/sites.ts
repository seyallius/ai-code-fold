/**
 * Everything the fold engine needs to know about a single AI chat site.
 * Adding a new site = adding one object here. Nothing else changes.
 */
export interface SiteDescriptor {
  readonly id: string;
  readonly match: (hostname: string) => boolean;
  /** The whole code block. Gets `.cf-folded` when collapsed. */
  readonly blockSelector: string;
  /** Where the fold toggle button is appended. */
  readonly headerSelector: string;
  /** The element hidden while folded (the code body). */
  readonly bodySelector: string;
}

export const SITES: readonly SiteDescriptor[] = [
  {
    id: "qwen",
    match: (h) => h.endsWith("qwen.ai") || h.endsWith("tongyi.aliyun.com"),
    blockSelector: "pre.qwen-markdown-code",
    headerSelector: ".qwen-markdown-code-header",
    bodySelector: ".qwen-markdown-code-body",
  },
  {
    id: "deepseek",
    match: (h) => h.endsWith("deepseek.com"),
    blockSelector: "div.md-code-block",
    headerSelector: ".md-code-block-banner",
    bodySelector: "pre",
  },
];
