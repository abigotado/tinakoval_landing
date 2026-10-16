# Repository settings checklist

One-time setup that lives outside the code. Run the steps in order, as the
repo owner (`gh auth status` should show `abigotado`). `REPO=abigotado/tinakoval_landing`.

## 0. Bootstrap order

`release.yml` and `deploy.yml` must exist on `main` before they can be
dispatched, and the rulesets would block the first sync. So:

1. Create `stage` from `main`.
2. Merge the harness PR (`chore/astro-harness`) into `stage`.
3. Fast-forward `main` to `stage` once by hand (step 3 below).
4. Only then apply the `main` ruleset and switch Pages.

## 1. Create `stage`

```bash
gh api "repos/$REPO/git/refs" -f ref=refs/heads/stage \
  -f sha="$(gh api repos/$REPO/git/ref/heads/main --jq .object.sha)"
```

## 2. Merge settings (squash only, tidy branches)

```bash
gh api -X PATCH "repos/$REPO" -F allow_squash_merge=true -F allow_merge_commit=false \
  -F allow_rebase_merge=false -F delete_branch_on_merge=true \
  -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=BLANK
```

## 3. One-time bootstrap of `main` (after the harness PR is in `stage`)

Fast-forward only, never force. Done through the API so it works without a
local checkout; it fails if `main` is not an ancestor of `stage`.

```bash
gh api -X PATCH "repos/$REPO/git/refs/heads/main" \
  -f sha="$(gh api repos/$REPO/git/ref/heads/stage --jq .object.sha)" -F force=false
```

## 4. Allow `stage` to deploy to the `github-pages` environment

The environment only accepts `main` by default; the deploy workflow also runs
on `stage`.

```bash
gh api -X POST "repos/$REPO/environments/github-pages/deployment-branch-policies" \
  -f name=stage -f type=branch
```

(If the environment does not exist yet, run step 5 first and retry.)

## 5. Pages: GitHub Actions + custom domain

Do this after the DNS records from the header of `deploy.yml` are in place
(the domain is being bought, so this may wait).

```bash
gh api -X PUT "repos/$REPO/pages" -f build_type=workflow -f cname=tinaksenia.com
# once the certificate is issued:
gh api -X PUT "repos/$REPO/pages" -F https_enforced=true
```

Then run **Deploy** once (Actions tab, or `gh workflow run deploy.yml --ref main`).
Until DNS exists, send `-f build_type=workflow` alone. The site is then served
under `https://abigotado.github.io/tinakoval_landing/`, where the root-absolute
asset paths do not match, so verify on the real domain.

## 6. Ruleset: `stage`

PR required, squash only, `ci` required, no deletion or force push.

```bash
gh api -X POST "repos/$REPO/rulesets" --input - <<'JSON'
{
  "name": "stage",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/stage"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [{ "context": "ci" }]
      }
    }
  ]
}
JSON
```

## 7. Ruleset: `main`

No direct pushes, no deletion, no force push, linear history. The only bypass
is the GitHub Actions app (id 15368, confirmed via `gh api apps/github-actions`),
so `release.yml` can fast-forward `main`.

```bash
gh api -X POST "repos/$REPO/rulesets" --input - <<'JSON'
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "bypass_actors": [
    { "actor_id": 15368, "actor_type": "Integration", "bypass_mode": "always" }
  ],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    { "type": "update", "parameters": { "update_allows_fetch_and_merge": false } }
  ]
}
JSON
```

Not verified end to end: whether GitHub accepts the Actions app as a bypass
actor on a personal repository, and whether a `GITHUB_TOKEN` push honours it.
If the API rejects the ruleset, or the first **Release** run fails with a
protected-branch error, fall back to a deploy key: generate a key pair, add the
public key under Settings → Deploy keys with write access, add it as a ruleset
bypass actor (`DeployKey`), store the private key as the secret
`RELEASE_DEPLOY_KEY`, and give the checkout step in `release.yml`
`ssh-key: ${{ secrets.RELEASE_DEPLOY_KEY }}`.

## 8. Remove the legacy `gh-pages` branch

Only after the Actions deploy is serving the site.

```bash
gh api -X DELETE "repos/$REPO/git/refs/heads/gh-pages"
```

## Launch checklist (later)

- Set `indexable = true` in `src/config.ts`.
- Remove `skipAudits` from `lighthouserc.json` (the placeholder is noindex, so
  Lighthouse `is-crawlable` is skipped to keep the SEO score at 1).
- Run **Release** with `major` for `v1.0.0`.
