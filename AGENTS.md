# Repository Guidelines

## Project Structure & Module Organization
- `apps/web`: Vite-powered React/TypeScript SPA. Keep feature logic in `src/pages`, reusable UI in `src/components`, and shared helpers under `src/utils` and `src/config`.
- `workers-backend`: Cloudflare Worker using Hono with route handlers in `routes`. Update `wrangler.toml` when adding bindings, secrets, or new environments.
- `sql` & `debug-*.js`: Ad hoc migration scripts and flow validators. Annotate additions with purpose, date, and rollback guidance.
- Deployment helpers (`deploy-github-pages.sh`, `deploy-production.sh`, `quick-start.sh`) document release tasks—revise them whenever the process changes.

## Build, Test, and Development Commands
- `cd apps/web && npm install && npm run dev`: Serve the SPA on `http://localhost:5173`.
- `cd apps/web && npm run build`: Create the production bundle in `dist`.
- `cd apps/web && npm run preview`: Locally verify the built bundle before deploying.
- `cd apps/web && npm run deploy`: Publish the current build to GitHub Pages through `gh-pages`.
- `cd workers-backend && npm install && npm run dev`: Run the Worker with local D1 bindings for API development.
- `cd workers-backend && npm run deploy` or `npm run deploy:prod`: Release staging or production variants—double-check secrets before pushing.

## Coding Style & Naming Conventions
- Use 2-space indentation and TypeScript `.tsx` modules for React screens. Favor arrow functions and keep exports named unless interop requires otherwise.
- Components are PascalCase (e.g., `UserCenter.tsx`), hooks are camelCase with the `use` prefix, and route files align with URL segments in `pages/`.
- Lean on Tailwind utility classes; scoped overrides belong in `src/styles`. Keep translation keys organized within `locales` and wire them through `i18n.ts`.

## Testing Guidelines
- Automated coverage is minimal today—follow `VERIFICATION_TEST_GUIDE.md` and scripted flows like `node test-application-flow.js` for regression checks.
- When introducing automated tests, colocate `*.test.ts(x)` files with their subjects and script them via Vitest (compatible with Vite). Document manual steps in the relevant `*_GUIDE.md`.

## Commit & Pull Request Guidelines
- Follow the Conventional Commit pattern seen in history (`fix:`, `feat:`, `fix(frontend):`), keeping each commit focused on a single change-set.
- Include the affected surface (e.g., `frontend`, `backend`, `sql`) in the scope when helpful, and mention tracking IDs in the body.
- PRs should summarize intent, link issues, attach UI screenshots when visual changes occur, and note any deployment or config updates.
- Before requesting review, ensure `npm run build` (web) and `wrangler deploy --dry-run` (backend) succeed, and update documentation impacted by the change.

## Security & Configuration Tips
- Manage secrets through Wrangler environment variables; never commit real `JWT_SECRET` values.
- Consult `setup-secrets.md` and `DEPLOYMENT.md` before rotating credentials, and keep Worker endpoints and SPA API clients in sync.
