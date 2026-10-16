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

Until step 5 is done the Deploy workflow cannot publish (Pages is still on the
legacy `gh-pages` source), and any Deploy run before step 3 fails at setup-node
because `main` has no `.nvmrc` or lockfile yet. Both are expected: after step 5,
run **Deploy** once by hand.

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

The environment already exists and currently allows only `gh-pages`. Deploys
run from `main` and `stage`, so allow both (list first with
`gh api repos/$REPO/environments/github-pages/deployment-branch-policies`):

```bash
for b in main stage; do
  gh api -X POST "repos/$REPO/environments/github-pages/deployment-branch-policies" \
    -f name=$b -f type=branch
done
```

Remove the `gh-pages` policy after step 8 (use the policy id from the list).

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
is a deploy key used by `release.yml` to fast-forward `main`. A deploy key is
needed instead of `GITHUB_TOKEN` because that token can never update commits
touching `.github/workflows/` (Dependabot bumps do), and its pushes would not
trigger Deploy.

First create the key and the secret (the private key never leaves your machine
except into the secret):

```bash
ssh-keygen -t ed25519 -N '' -C release-deploy-key -f ./release_key
gh api -X POST "repos/$REPO/keys" -f title=release-deploy-key \
  -f key="$(cat ./release_key.pub)" -F read_only=false
gh secret set RELEASE_DEPLOY_KEY --repo "$REPO" < ./release_key
rm ./release_key ./release_key.pub
```

Then the ruleset:

```bash
gh api -X POST "repos/$REPO/rulesets" --input - <<'JSON'
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "bypass_actors": [{ "actor_type": "DeployKey", "bypass_mode": "always" }],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    { "type": "update", "parameters": { "update_allows_fetch_and_merge": false } }
  ]
}
JSON
```

Not verified end to end: that GitHub accepts a `DeployKey` bypass actor without
an `actor_id` for this repository. If the API rejects the payload, add the deploy
key as a bypass actor in Settings → Rules → main instead. The first **Release**
run is the real test.

Also note: Dependabot _security_ updates ignore `target-branch` and open PRs
against the default branch (`main`), where the ruleset blocks them. Either turn
off Dependabot security updates (Settings → Advanced Security) or make `stage`
the default branch (Settings → Branches).

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
