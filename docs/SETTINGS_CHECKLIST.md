# Repository settings checklist

One-time setup that lives outside the code. Run the steps in order, as the
repo owner (`gh auth status` should show `abigotado`).

```bash
REPO=abigotado/tinakoval_landing
```

## 0. State and bootstrap order

Already done:

- [x] `stage` exists and is the default branch. This also covers Dependabot
      _security_ updates, which ignore `target-branch` and open PRs against
      the default branch, so they land on `stage` like every other PR.

`release.yml` and `deploy.yml` must exist on `main` before production can
deploy, and the `main` rulesets would block the one-time sync. So: settings and
Pages first (steps 1–5), then merge the harness into `stage`, fast-forward
`main` once by hand (step 6), and only then apply the `main` rulesets (step 7).

Any Deploy run before step 6 fails at `build-main` (`main` has no `.nvmrc` or
lockfile yet) and any run before step 4 cannot publish. Both are expected; step
6 ends with a Deploy run that the first Release needs.

## 1. Merge settings (squash only, tidy branches)

```bash
gh api -X PATCH "repos/$REPO" -F allow_squash_merge=true -F allow_merge_commit=false \
  -F allow_rebase_merge=false -F delete_branch_on_merge=true \
  -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=BLANK
```

## 2. `release` environment and its deploy key

`release.yml` pushes `main` with a deploy key, because `GITHUB_TOKEN` can never
update commits touching `.github/workflows/` (Dependabot bumps do) and its
pushes would not trigger Deploy. The key is an environment secret of `release`,
so only a job in that environment can read it: the environment only accepts
runs from `stage` (Release is dispatched from the default branch) and waits for
the owner's approval. A repository-level secret would be readable by any
workflow on any branch, so it must not exist.

```bash
OWNER_ID=$(gh api users/abigotado --jq .id)
gh api -X PUT "repos/$REPO/environments/release" --input - <<JSON
{
  "reviewers": [{ "type": "User", "id": $OWNER_ID }],
  "deployment_branch_policy": { "protected_branches": false, "custom_branch_policies": true }
}
JSON
gh api -X POST "repos/$REPO/environments/release/deployment-branch-policies" \
  -f name=stage -f type=branch
```

Create the key and store it as the environment secret (the private key never
leaves your machine except into the secret):

```bash
ssh-keygen -t ed25519 -N '' -C release-deploy-key -f ./release_key
gh api -X POST "repos/$REPO/keys" -f title=release-deploy-key \
  -f key="$(cat ./release_key.pub)" -F read_only=false
gh secret set RELEASE_DEPLOY_KEY --repo "$REPO" --env release < ./release_key
rm ./release_key ./release_key.pub
```

Delete any repository-level copy and check where the secret lives:

```bash
gh secret delete RELEASE_DEPLOY_KEY --repo "$REPO"   # only if it exists
gh secret list --repo "$REPO"                        # must NOT list it
gh secret list --repo "$REPO" --env release          # must list it
```

## 3. Allow `main` and `stage` to deploy to `github-pages`

The environment already exists and currently allows only `gh-pages`. Deploys
run from `main` and `stage`, so allow both (list first with
`gh api repos/$REPO/environments/github-pages/deployment-branch-policies`):

```bash
for b in main stage; do
  gh api -X POST "repos/$REPO/environments/github-pages/deployment-branch-policies" \
    -f name=$b -f type=branch
done
```

Remove the `gh-pages` policy in step 8 (use the policy id from the list).

## 4. Pages: GitHub Actions + custom domain

Needs the DNS records from the header of `deploy.yml` (the domain is being
bought, so the custom domain part may wait).

```bash
gh api -X PUT "repos/$REPO/pages" -f build_type=workflow -f cname=tinaksenia.com
# once the certificate is issued:
gh api -X PUT "repos/$REPO/pages" -F https_enforced=true
```

Until DNS exists, send `-f build_type=workflow` alone. The site is then served
under `https://abigotado.github.io/tinakoval_landing/`, where the root-absolute
asset paths do not match, so verify on the real domain.

## 5. Ruleset: `stage`

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

## 6. One-time bootstrap of `main` (after the harness PR is merged into `stage`)

Fast-forward only, never force. Done through the API so it works without a
local checkout; it fails if `main` is not an ancestor of `stage`.

```bash
gh api -X PATCH "repos/$REPO/git/refs/heads/main" \
  -f sha="$(gh api repos/$REPO/git/ref/heads/stage --jq .object.sha)" -F force=false
```

This push triggers Deploy for `main`. Then run Deploy once more on `stage`, so
the `stage` head has the green Deploy run that Release checks for:

```bash
gh workflow run deploy.yml --repo "$REPO" --ref stage
```

## 7. Rulesets: `main`

Two rulesets, so the deploy key can bypass only the "no updates" rule:

- `main`: no deletion, no force push, linear history. **No bypass**, so even
  the release key can only fast-forward.
- `main-release`: no updates at all, except by the deploy key from step 2.

```bash
gh api -X POST "repos/$REPO/rulesets" --input - <<'JSON'
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" }
  ]
}
JSON
gh api -X POST "repos/$REPO/rulesets" --input - <<'JSON'
{
  "name": "main-release",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "bypass_actors": [{ "actor_type": "DeployKey", "bypass_mode": "always" }],
  "rules": [{ "type": "update", "parameters": { "update_allows_fetch_and_merge": false } }]
}
JSON
```

Classic branch protection cannot be bypassed by a deploy key, so `main` must
have none (rulesets replace it):

```bash
gh api "repos/$REPO/branches/main/protection"   # expect: Branch not protected (HTTP 404)
# if it prints a rule instead, remove it:
gh api -X DELETE "repos/$REPO/branches/main/protection"
```

Not verified end to end: that GitHub accepts a `DeployKey` bypass actor on a
personal repository. If the API rejects the payload, try adding the deploy key
as a bypass actor in Settings → Rules → main-release. The first **Release** run
is the real test. If its push to `main` is rejected, fast-forward by hand with
`main-release` switched off, then re-run Release: it resumes when `main`
already equals `stage` (tags, publishes the release, deploys).

```bash
RID=$(gh api "repos/$REPO/rulesets" --jq '.[] | select(.name=="main-release") | .id')
gh api -X PUT "repos/$REPO/rulesets/$RID" -f enforcement=disabled
gh api -X PATCH "repos/$REPO/git/refs/heads/main" \
  -f sha="$(gh api repos/$REPO/git/ref/heads/stage --jq .object.sha)" -F force=false
gh api -X PUT "repos/$REPO/rulesets/$RID" -f enforcement=active
gh workflow run release.yml --repo "$REPO" --ref stage -f bump=patch
```

## 8. Remove the legacy `gh-pages` branch

Only after the Actions deploy is serving the site. Also remove the `gh-pages`
deployment branch policy from step 3.

```bash
gh api -X DELETE "repos/$REPO/git/refs/heads/gh-pages"
```

## Launch checklist (later)

- Set `indexable = true` in `src/launch.ts`.
- Remove `skipAudits` from `lighthouserc.json` (the placeholder is noindex, so
  Lighthouse `is-crawlable` is skipped to keep the SEO score at 1).
- Run **Release** with `major` for `v1.0.0`.
