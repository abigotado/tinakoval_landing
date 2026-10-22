# Best practices

Rules for this repository: a static, one-page Astro 7 site in Russian with
`/privacy/` and a 404, hosted on GitHub Pages and portable to Yandex Object
Storage. `AGENTS.md` holds the stack, commands, branches and content rules;
`docs/specs/` holds the acceptance criteria. This file does not repeat them. It
lists engineering rules, each with a source, for writing and auditing code.
Change a rule here in the same PR as the code that departs from it, and record a
significant choice in `docs/decisions.md`.

**Must** marks a requirement: a WCAG 2.2 AA criterion, a security control, a
project rule from `AGENTS.md`, the specs or `docs/decisions.md`, or something
that breaks the build or the site. **Should** marks a recommendation that can be
skipped with a reason. Researched October 2026 against Astro 7.4.

## 1. Astro: structure and components

- **Must** Keep routes in `src/pages/`, shared shells in `src/layouts/`,
  reusable parts in `src/components/`, and processed images in `src/assets/`.
  Put only files that must ship byte-for-byte in `public/` (fonts, favicon,
  `og.jpg`).
  [Project structure](https://docs.astro.build/en/basics/project-structure/)
- **Must** Render every page through `src/layouts/Base.astro` and import global
  CSS only there, before other imports, so it has the lowest precedence.
  [Styling: global styles](https://docs.astro.build/en/guides/styling/)
- **Should** Move a page section into its own component when it has its own
  `<script>`, is used on more than one page, or its markup plus styles no longer
  fit on a screen or two. Keep a one-off small section inline.
  [Astro components](https://docs.astro.build/en/basics/astro-components/)
- **Must** Type every component's props with `interface Props`, or
  `HTMLAttributes<'tag'>` from `astro/types` for wrappers of native elements.
  Use `Record<string, never>` for a component without props.
  [TypeScript: component props](https://docs.astro.build/en/guides/typescript/)
- **Should** Use scoped `<style>` by default and global CSS only for tokens, the
  reset and shared primitives (`.container`, `.btn`, `.visually-hidden`). Delete
  global classes that nothing uses.
  [Styling](https://docs.astro.build/en/guides/styling/)
- **Should** To style a child component, pass it a `class` prop and spread
  `...rest` onto its root element: the parent's scope attribute travels in
  `rest`, so the parent's scoped rule matches. Use `:global()` sparingly: the
  rendered `<img>` of
  `<Image>`/`<Picture>` already carries the parent's scope attribute.
  [Styling: passing a class to a child](https://docs.astro.build/en/guides/styling/)
- **Must** Since Astro 7, `compressHTML: 'jsx'` drops whitespace that spans a
  line break between elements and expressions; spaces within one line stay.
  Where a space must survive a line break, write it explicitly (`{' '}`, a
  template string, or `&nbsp;`), and check the rendered text, not the source.
  [compressHTML](https://docs.astro.build/en/reference/configuration-reference/#compresshtml)
- **Must** Build every internal URL and asset path from
  `import.meta.env.BASE_URL`, because stage is served under `/stage/`. With
  `trailingSlash: 'always'`, `BASE_URL` ends in `/`, so append paths without a
  leading slash.
  [base](https://docs.astro.build/en/reference/configuration-reference/#base)
- **Must** Use `astro:assets` (`<Picture>`/`<Image>`) for every raster image in
  `src/assets/`. Always give `widths` together with `sizes`, and make `sizes`
  match the CSS width at each breakpoint.
  [astro:assets reference](https://docs.astro.build/en/reference/modules/astro-assets/)
- **Should** Mark the hero portrait with the `priority` prop (Astro ≥ 5.10). It
  sets `loading="eager"`, `decoding="sync"` and `fetchpriority="high"` in one
  place, and nothing else on the page gets it.
  [Image `priority`](https://docs.astro.build/en/reference/modules/astro-assets/)
- **Should** Call `getImage()` only in frontmatter, and only for non-`<img>`
  uses: the JSON-LD image and the full-size scans behind the education links.
  [getImage](https://docs.astro.build/en/guides/images/)
- **Must** Write client scripts as plain `<script>` (processed: TypeScript,
  bundled, `type="module"`, deduplicated). Use `is:inline` only for non-executed
  data such as JSON-LD, or for code that must not be bundled.
  [Client-side scripts](https://docs.astro.build/en/guides/client-side-scripts/)
- **Must** Make every script a progressive enhancement: without JS, all content
  and links work (AC-DOCK-2, AC-MOTION-2).
- **Must** Read the `DEPLOY_ENV` build switch in one place only: `src/config.ts`
  reads `process.env` and exports `isStage` and `noindex`. `astro.config.mjs`
  cannot read `import.meta.env`, so the switch module uses `process.env` (or
  Vite's `loadEnv` for `.env` files). Nothing else reads the variable.
  `astro:env` is not available in `astro.config.mjs`, so it would add a second
  way to read the same switch.
  [Environment variables](https://docs.astro.build/en/guides/environment-variables/),
  [Astro 6 upgrade: import.meta.env](https://docs.astro.build/en/guides/upgrade-to/v6/)
- **Must** Avoid removed and deprecated APIs: `Astro.glob()`,
  `<ViewTransitions />`, `Astro.site` inside `getStaticPaths()`, and the
  `getContainerRenderer()` package roots. Read the upgrade guide before every
  major bump.
  [Upgrade to v6](https://docs.astro.build/en/guides/upgrade-to/v6/),
  [Upgrade to v7](https://docs.astro.build/en/guides/upgrade-to/v7/)
- **Must** Write valid HTML. Since Astro 7 the Rust compiler no longer repairs
  it (for example a `<div>` inside a `<p>`), so the markup ships as written.
  [Upgrade to v7](https://docs.astro.build/en/guides/upgrade-to/v7/)

## 2. HTML and CSS

- **Must** Use one `<header>`, `<nav aria-label>`, `<main id="main">` and
  `<footer>` per page. Give a `<section>` an accessible name (`aria-labelledby`)
  only when it should appear as a region landmark.
  [APG landmark regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)
- **Must** Use headings that reflect the structure (WCAG 1.3.1); choose the
  level for structure and set the size with a class.
  [WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)
- **Should** Use exactly one `<h1>` per page and never skip a level. This is
  a common practice, not a WCAG requirement.
- **Must** Use lists for lists (`<ul>` for items, `<ol>` for steps),
  `<blockquote>` for quotes and `<figure>`/`<figcaption>` for the QR code.
  [WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)
- **Must** Keep `lang="ru"` on `<html>`. Russian hyphenation (`hyphens: auto`)
  depends on it.
  [WCAG 3.1.1](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html)
- **Must** Keep colours, fonts, spacing and breakpoint-dependent sizes as custom
  properties on `:root` in `global.css`. Components use the tokens, never a raw
  hex value; a deliberate exception such as the WHO cover gets a comment. (House
  rule: one palette, D-11.)
- **Should** Prefer logical properties (`margin-inline-start`, `inset-inline`,
  `padding-block`) to physical `left`/`right`/`margin-left`. The site is
  left-to-right only, so this is about consistency, not a bug.
  [Logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values)
- **Must** Size text and spacing in `rem` or `clamp()`, never fixed `px` font
  sizes, so large system font sizes work (AC-RWD-8; browser zoom alone would
  pass
  [WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
  even with `px`).
- **Must** Make the layout work at 320 CSS px without horizontal scrolling.
  [WCAG 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- **Should** Write media queries as `min-width`/`max-width` in `em`, and set
  `vite.build.cssTarget` to the oldest engines we serve, naming iOS separately
  (`ios15` next to `safari15`, or iPhone-only prefixes such as
  `-webkit-text-size-adjust` are dropped). Then the minifier
  (Lightning CSS) emits plain `min-`/`max-` queries in `dist/`. Range syntax
  (`width < 53.75em`) needs Safari 16.4+. Lowered for older targets, it becomes
  `not (min-width: …)`, which is newer grammar as well.
  [Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using)
- **Should** Use media queries for page layout (header, hero, grids). Reach for
  a container query only when the same component must adapt to different column
  widths, which this page does not have yet.
  [Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- **Must** Gate every animation and smooth scroll behind
  `prefers-reduced-motion: no-preference`, and keep the global `reduce` override
  as the safety net (AC-MOTION-1; WCAG 2.3.3 is AAA, so this goes beyond AA).
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion),
  [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- **Must** Animate only `transform` and `opacity`, apart from the two exceptions
  in the spec (AC-MOTION-3). Layout properties cause shifts.
  [Optimize CLS](https://web.dev/articles/optimize-cls)
- **Must** Keep text contrast at 4.5:1 or higher (3:1 for large text), and focus
  rings plus any boundary that is the only cue a control is there at 3:1 against
  adjacent colours (a button with a visible label needs no 3:1 border). Recheck
  contrast whenever a token changes.
  [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- **Must** Serve self-hosted WOFF2 only, subset to Cyrillic and Latin, with
  `font-display: swap`, as files in `public/fonts` with the `@font-face` rules
  inlined in `<head>` (AGENTS.md). Astro's built-in `fonts` config is open
  question 3.
  [Font best practices](https://web.dev/articles/font-best-practices)
- **Must** Preload only the font of the first-screen heading, with
  `crossorigin`, because a preload that goes unused competes with the LCP image.
  [Font best practices](https://web.dev/articles/font-best-practices)
- **Should** Give every web font a metric-matched local fallback (`size-adjust`,
  `ascent-override`, `descent-override`) so the swap causes no shift.
  [size-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/size-adjust),
  [Optimize CLS](https://web.dev/articles/optimize-cls)
- **Must** Reserve space for every image and media box with `width`/`height`
  attributes or `aspect-ratio`.
  [Optimize CLS](https://web.dev/articles/optimize-cls)
- **Should** Use `svh`/`dvh` and `env(safe-area-inset-*)` for viewport-high
  blocks and fixed bars (AC-RWD-9), with a fallback value in `env()`.

## 3. Accessibility (WCAG 2.2 AA)

- **Must** Make "Перейти к содержимому" the first focusable element, visible on
  focus, and pointing at `#main`.
  [WCAG 2.4.1](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html)
- **Must** Show a visible focus indicator on every interactive element, using
  `:focus-visible` with `outline` and never `outline: none` without a
  replacement.
  [WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- **Must** Keep focused elements from being fully hidden behind the sticky
  header or the booking bar: `scroll-padding-top` and `scroll-padding-bottom`
  must track their real heights.
  [WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- **Must** Make pointer targets at least 24×24 CSS px (inline links in text are
  exempt). The spec's 44×44 (AC-RWD-2) is stricter, so meet that.
  [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- **Must** Give every control an accessible name that contains its visible text.
  Icon-only links need a text alternative. The "↗" mark is `aria-hidden`; the
  name says "opens in a new tab" in visually hidden text instead.
  [MDN `<a>`: accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a)
- **Must** Hide decorative graphics (the 花永愛 mark, the thread line, the CSS
  book cover) with `aria-hidden="true"`. Give informative SVG (notebook, QR
  code) `role="img"` and an `aria-label`.
  [WAI: decorative images](https://www.w3.org/WAI/tutorials/images/decorative/)
- **Must** Write `alt` text that says what the image shows and why it is there.
  Use `alt=""` only for decoration.
  [WAI: decorative images](https://www.w3.org/WAI/tutorials/images/decorative/)
- **Must** Build the phone menu as a disclosure: a real `<button>` with
  `aria-expanded` and `aria-controls`, closing on Esc (focus back to the button)
  and when focus leaves the header. Do not use `role="menu"` for site
  navigation.
  [APG disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
- **Must** Put `inert` (not just `visibility`/`opacity`) on content that is
  visually hidden but still in the DOM, as the dock does. If the full-screen
  phone menu ever becomes modal, make the content behind it `inert`.
  [inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert)
- **Must** Say in the link text, or in visually hidden text, that a link opens a
  new tab.
  [MDN `<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a)
- **Should** Test by hand before a release: keyboard only (Tab, Shift+Tab, Esc),
  VoiceOver on iOS and macOS, 200% zoom, 320 px width, and reduced motion on.
  Automated checks find only part of the issues: axe-core reports "on average
  57%". [WAI: evaluating accessibility](https://www.w3.org/WAI/test-evaluate/),
  [axe-core](https://github.com/dequelabs/axe-core)

## 4. Performance

- **Must** Meet Core Web Vitals at the 75th percentile: LCP ≤ 2.5 s, CLS ≤ 0.1,
  INP ≤ 200 ms. [Web Vitals](https://web.dev/articles/vitals)
- **Must** Make the LCP image (the hero portrait) discoverable in the initial
  HTML, never lazy-loaded, and the only element with `fetchpriority="high"`.
  [Optimize LCP](https://web.dev/articles/optimize-lcp),
  [Fetch priority](https://web.dev/articles/fetch-priority)
- **Must** Serve photos as AVIF with WebP and JPEG fallbacks
  (`<Picture formats={['avif','webp']}>`). Lazy-load everything below the fold,
  which is the `<Image>` default.
  [Choose the right image format](https://web.dev/articles/choose-the-right-image-format)
- **Should** Inline the site CSS into the HTML
  (`build.inlineStylesheets: 'always'`, on). It removes the render-blocking
  stylesheet requests; the home page grew from 12.6 to 17.8 KB gzipped. On a
  single-page site the extra round trip costs more than the lost caching.
  Lighthouse CI keeps watching LCP.
  [Optimize LCP: render-blocking CSS](https://web.dev/articles/optimize-lcp),
  [build.inlineStylesheets](https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets)
- **Must** Keep client JS within the budget (≤ 5 KB, AC-PERF-2): no frameworks,
  no polyfills, no work on load beyond attaching observers and listeners. Do not
  read layout right after writing styles in the same handler.
  [Optimize INP](https://web.dev/articles/optimize-inp)
- **Must** Keep the first load on a phone at ≤ 500 KB (AC-PERF-4). Check it in
  the Lighthouse network summary whenever an image or font is added.
- **Should** Accept the caching GitHub Pages gives (`Cache-Control: max-age=600`
  on every file, which cannot be configured). On Yandex Object Storage, set
  `public, max-age=31536000, immutable` on `/_astro/*` (the files have hashed
  names) and a short max-age on HTML and `public/` files.
  [HTTP cache](https://web.dev/articles/http-cache)
- **Should** Keep the page eligible for the back/forward cache: no `unload`
  handlers and no `Cache-Control: no-store`.
  [Back/forward cache](https://web.dev/articles/bfcache)

## 5. SEO and sharing

- **Must** Give every indexable page a unique `<title>`, a `meta description`
  and an absolute `rel="canonical"` built from `site` and the path. The 404 has
  no canonical.
  [Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- **Must** Mark preview builds (`/stage/`) `noindex` with a meta tag and never
  disallow them in `robots.txt`, because crawlers must fetch the page to see
  `noindex`. Keep stage out of the sitemap.
  [Block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- **Must** Generate the sitemap with `@astrojs/sitemap` (it needs `site`) and
  reference it from `robots.txt`. Build the `Sitemap:` URL from `site`, not a
  hard-coded string.
  [Sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- **Must** Set the four required Open Graph tags (`og:title`, `og:type`,
  `og:image`, `og:url`), plus `og:image:width`, `og:image:height`,
  `og:image:alt` and `og:locale=ru_RU`, with absolute HTTPS URLs.
  [The Open Graph protocol](https://ogp.me/)
- **Must** Keep JSON-LD truthful and limited to what the page shows (name,
  service, price, area). No made-up reviews or ratings, and connect the nodes
  with `@id`.
  [Structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- **Should** Validate JSON-LD with the Schema.org validator after any change.
  Avoid deprecated types: schema.org marks the generic `ProfessionalService` as
  deprecated (see Open questions).
  [Schema validator](https://validator.schema.org/),
  [schema.org ProfessionalService](https://schema.org/ProfessionalService)
- **Should** Verify the site in Google Search Console and Yandex Webmaster with
  meta tags in `Base.astro`, as spec §9 requires.

## 6. Security and privacy

- **Must** Load nothing from third parties: no CDN, font host, analytics, embed
  or iframe. Every request stays on `tinaksenia.com` (D-6, D-7).
- **Must** Give external links `target="_blank"` and
  `rel="noopener noreferrer"`. `noopener` is implied by modern browsers.
  `noreferrer` keeps the visitor's page URL from reaching t.me and who.int.
  [MDN `<a>`: security](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a)
- **Should** Rely on the browser default referrer policy
  (`strict-origin-when-cross-origin`), or add
  `<meta name="referrer" content="no-referrer">` if no outgoing request should
  carry even the origin. GitHub Pages cannot send the header, but the meta tag
  works.
  [Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)
- **Should** Know what a static host cannot do: GitHub Pages sends no
  configurable headers, so there is no HSTS, `frame-ancestors`,
  `X-Content-Type-Options` or `Permissions-Policy`. A `<meta http-equiv>` CSP is
  possible but cannot carry `frame-ancestors` or report-only mode.
  [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP),
  [OWASP CSP cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- **Should** If a CSP is added, use Astro's stable `security.csp` (since 6.0).
  It writes a hash-based meta CSP for bundled scripts and styles. Inline
  `style=""` attributes and `is:inline` blocks would then need hashes or
  `'unsafe-inline'` for attributes, so remove them first.
  [security.csp](https://docs.astro.build/en/reference/configuration-reference/#securitycsp)
- **Should** Escape `<` as `\u003c` when serialising JSON-LD with `set:html`, so
  a `</script>` in content can never close the tag. Today the data is trusted,
  so this is defence in depth.
  [OWASP HTML5 security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- **Must** Pin every action to a full commit SHA with a version comment, and let
  Dependabot bump them. Dependabot alerts do not cover SHA-pinned actions.
  [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- **Must** Set `permissions: {}` at workflow level and grant per job only what
  that job needs. Use `persist-credentials: false` on checkouts that do not
  push.
  [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- **Must** Never interpolate `${{ … }}` from untrusted context into `run:`. Pass
  it through `env:`. Do not use `pull_request_target`.
  [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- **Must** Keep secrets (the release deploy key) as environment secrets, with
  deployment-branch policies on `release` and `github-pages`. Never echo them,
  and rotate any that leaks.
  [Managing environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- **Must** Do not restore a dependency cache in jobs that build what gets
  deployed. Disable implicit caches per action: `setup-node` gets no `cache`
  input and `package-manager-cache: false`, as in `deploy.yml`. Risks of this
  kind are listed in the
  [OWASP Top 10 CI/CD risks](https://owasp.org/www-project-top-10-ci-cd-security-risks/).
- **Must** Configure a Dependabot `cooldown` on version updates (ours: 7
  days; GitHub's default is 3). Security updates are never delayed. That way a
  freshly published, possibly compromised release is not proposed on its first
  day.
  [Dependabot options: cooldown](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference)
- **Should** Prefer OIDC over long-lived credentials wherever the target
  supports it. The Pages deploy already uses OIDC (`id-token: write`); the
  release deploy key stays only because pushing to `main` needs it.
  [OpenID Connect](https://docs.github.com/en/actions/concepts/security/openid-connect)
- **Should** Verify the custom domain in the account's Pages settings and keep
  "Enforce HTTPS" on, so nobody can take the domain over.
  [Verifying a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages),
  [Securing Pages with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- **Should** Optionally run `zizmor` locally, once per workflow change, as a
  static audit of the workflows. It needs no CI step.
  [zizmor](https://docs.zizmor.sh/)

## 7. TypeScript and code style

- **Must** Extend `astro/tsconfigs/strict` (or `strictest`), include
  `.astro/types.d.ts` and exclude `dist`. Run `astro check` in CI, because
  `astro build` does not type-check.
  [TypeScript guide](https://docs.astro.build/en/guides/typescript/)
- **Must** Use `import type` for types in TypeScript and Astro frontmatter
  (not in `.mjs` files). `verbatimModuleSyntax` in the preset enforces it.
  [TypeScript guide](https://docs.astro.build/en/guides/typescript/)
- **Should** In client scripts, narrow DOM lookups with `instanceof`
  (`el instanceof HTMLButtonElement`) instead of a typed `querySelector<…>`
  generic, which only asserts the type.
- **Should** Avoid non-null assertions (`!`) and `as` casts. Narrow with a check
  instead. A `!` that the current config does not need is dead noise; with
  `noUncheckedIndexedAccess` (part of `strictest`) it hides a real check.
  [noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)
- **Must** Keep all visitor-facing text, URLs and facts in `src/content/ru.ts`,
  and constants derived from it (price strings) there too. Markup never
  hard-codes copy, including separators and assembled strings. (House rule:
  `AGENTS.md` → Specs.)
- **Must** Format with Prettier and `prettier-plugin-astro`. Do not add options
  beyond the existing `singleQuote`, because Prettier no longer accepts option
  requests and every option invites style debate.
  [Option philosophy](https://prettier.io/docs/option-philosophy)
- **Should** Comment only intent the code cannot show, and cite the spec ID
  (`AC-…`, `D-…`). This is already the house style.

## 8. Testing and quality gates

What runs today: `format:check`, `astro check`, `build`, and Lighthouse CI
(mobile, 3 runs, perf ≥ 0.95, a11y/best-practices/SEO = 1) on every page in
`dist/`.

- **Must** Keep all four gates required on PRs into `stage`. Never lower a
  Lighthouse threshold to get a PR through; fix the page instead. (House rule:
  `AGENTS.md` → Commands, `lighthouserc.json`.)
- **Should** Remember what Lighthouse does not cover. Its accessibility score is
  a pass/fail subset of axe-core, and manual audits do not count. It does not
  test keyboard flow, screen readers, zoom, reduced motion, any viewport except
  mobile, the `/stage/` base path, or real-user metrics.
  [Lighthouse a11y scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)

Options, with no tool added without the owner's agreement:

| Option                                                                                                                                              | Covers                                                              | Cost                                     | Trade-off                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| `resource-summary:*:size` assertions in `lighthouserc.json` ([docs](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md)) | AC-PERF-2 (JS ≤ 5 KB) and AC-PERF-4 (≤ 500 KB)                      | A few lines of config, no new dependency | Transfer sizes from lab runs only              |
| A `grep` step in CI for forbidden content (phone patterns, `wa.me`, `instagram`)                                                                    | AC-CONTACT-3 and the privacy rules in `AGENTS.md`                   | One shell line                           | Pattern-based, can miss obfuscated text        |
| Manual checklist in the PR template (keyboard, 320 px, 200% zoom, reduced motion)                                                                   | What automation misses                                              | No tooling                               | Depends on discipline                          |
| PageSpeed Insights / CrUX once traffic exists                                                                                                       | Field LCP/CLS/INP                                                   | No script on the site, no consent needed | Low-traffic sites may have no CrUX data        |
| `@axe-core/cli` or Playwright + axe                                                                                                                 | More axe rules, several viewports                                   | New dev dependency and a browser in CI   | Overlaps with Lighthouse; D-5 kept it out      |
| `lychee` link check ([site](https://lychee.cli.rs/))                                                                                                | Broken external links (who.int PDF, t.me)                           | One action                               | Network flakiness; D-5 rejected it (few links) |
| `html-validate`                                                                                                                                     | Invalid HTML, which matters more since Astro 7 stopped repairing it | New dependency                           | D-5 rejected it                                |

## Known gaps

The audit of 2026-10-20 found the code breaking these rules. They will be
fixed in follow-up PRs; remove an item when its fix lands.

- §1 global CSS order: pages import components before `Base`, so `global.css`
  loads after component CSS.
- §1 media queries: `max-width: 53.6875em` and `min-width: 53.75em` leave a
  1/16em gap (859–860 px at the default font size). Range syntax would close
  it, but lowered for Safari 15 it becomes `not (min-width: …)`.
- §1 child styling: `Mark` takes only `class` and does not spread `...rest`,
  so `Header` and `Hero` style it through `:global()`; `Materials` wraps
  `.book-link` in `:global()` although the scope attribute already reaches it.

## Open questions

These conflict with, or go beyond, current decisions. They are raised here
rather than applied.

1. **`ProfessionalService` in JSON-LD (spec §9).** schema.org marks the generic
   type deprecated "due to confusion with Service". Alternatives: keep `Person`
   and add `Service` with `provider` → `#person` and `offers`, or use
   `Organization`. Changing it needs a spec edit. Google shows no rich result
   for either, so the stake is low.
2. **GitHub Pages terms (D-2).** GitHub says Pages is "not intended for or
   allowed to be used as a free web-hosting service to run your online business"
   ([Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).
   A landing page for paid consultations with no transactions on the site is
   probably fine, but it is a grey area. The Yandex Object Storage fallback
   already covers the risk if GitHub objects.
3. **Fonts API vs hand-written `@font-face` (D-7).** Astro 6 made the `fonts`
   config and `<Font />` stable. With a local provider it generates the
   `@font-face` rules, the preload and the metric fallbacks. Adopting it would
   replace about 25 lines in `Base.astro`. It needs a check that output paths
   respect `/stage/` and that nothing is fetched remotely.
4. **CSP meta (D-5, simplicity).** `security.csp` adds a policy with almost no
   code, but the `style="--delay…"` and `style="object-position…"` attributes
   and the `is:inline` font style block need refactoring first. The value is
   modest on a site with no user input and no third parties.
5. **`strictest` tsconfig.** Stronger guarantees, but more `undefined` handling
   in `ru.ts` lookups. It is only worth it if the code keeps growing.
6. **`font-display: swap` (AC-PERF-3) vs `optional`.** web.dev suggests
   `optional` for body text, so text never swaps after it renders. The
   metric-matched fallbacks already keep CLS low, so `swap` is fine as is.
