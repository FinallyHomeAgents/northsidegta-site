# Sync Now Deep Dive

## Observed behaviour

- Admin "Sync now" button triggered `/api/sync-now` but GitHub never received a `workflow_dispatch` event.
- CI smoke test attempted to import the API module and failed because the file used ESM syntax without a compatible CommonJS export.
- API responses returned `Missing GH_TOKEN environment variable.` even when `GITHUB_TOKEN` was configured in Vercel.

## Root causes

1. **Token lookup was too narrow.** The API only checked `GH_TOKEN`, so environments that used `GITHUB_TOKEN` never authenticated.
2. **Repository metadata resolution was incomplete.** Only split owner/name variables were supported, but the rest of the codebase relies on the combined `GITHUB_REPO` form. As a result the manual sync silently failed to build a valid GitHub API URL.
3. **Module format mismatch in tests.** The API file used ES module syntax while the Node.js smoke test suite runs under CommonJS. CI imported the file to unit-test `triggerSync` and crashed before executing any assertions.
4. **Ref detection missed common CI variables.** Workflows triggered from branches exposed only `GITHUB_REF`/`GITHUB_HEAD_REF`, so the dispatch defaulted to `main` and ignored the active branch.

## Fix strategy (single task)

- Add resilient helpers in `/api/sync-now.js` to resolve the repo owner/name, Git ref, and GitHub token from every supported environment variable (`GH_TOKEN`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_REPOSITORY`, etc.).
- Convert the API route to CommonJS, expose the handler as both the default export and `module.exports`, and surface `triggerSync` for tests.
- Rework the tests to run under Node's test runner (`tests/sync-now.test.cjs`) so the smoke job can assert success paths without syntax errors.
- Document the manual sync requirements (`GITHUB_TOKEN`/`GH_TOKEN`, `SYNC_SECRET`) in `README.md` for future deploys.

With these updates the admin button immediately reaches GitHub using the configured branch and the smoke test suite exercises the new logic without import failures.
