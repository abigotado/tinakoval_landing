# tinakoval_landing

Landing page for Ксения Панькова, психолог — https://tinaksenia.com.
Static [Astro](https://astro.build) site, hosted on GitHub Pages.

## Run

Node 24 (`nvm use`), then:

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

Checks used by CI: `npm run format:check`, `npm run check`, and Lighthouse CI
(`npx lhci autorun` after a build; needs Chrome).

## Branch flow

1. Branch from `stage` (`feature/…`, `fix/…`, `chore/…`) and open a PR into
   `stage`. PR title is a Conventional Commit; the PR is squash-merged.
2. `stage` is deployed to https://tinaksenia.com/stage/ (noindex) for review.
3. `main` is production and is only updated by the release workflow.

## Release

Actions → **Release** → Run workflow (on the default branch `stage`) → pick
`patch`, `minor` or `major`, then approve the `release` environment. It needs
green CI and Deploy runs for the `stage` head, fast-forwards `main` to `stage`,
tags `vX.Y.Z`, creates a GitHub Release and deploys production. Details are in
[.github/workflows/release.yml](.github/workflows/release.yml).

Repository settings (Pages, rulesets, branch cleanup) are listed in
[docs/SETTINGS_CHECKLIST.md](docs/SETTINGS_CHECKLIST.md).

For contributors and agents see [AGENTS.md](AGENTS.md).
