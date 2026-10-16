# Contributing to ContraGit

Thank you for your interest in contributing to **ContraGit**! Community contributions are what make open source tools incredible.

This document outlines the guidelines, development workflow, and coding standards for contributing to the project.

---

## 📜 Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it to understand our community standards and pledge of a welcoming, inclusive environment.

---

## 🧭 Guiding Engineering Principles

When writing code for ContraGit, adhere to the following gold-standard tenets:

1. **Object-Oriented & DRY Design:** Keep business and calculation logic inside dedicated domain classes (e.g., [`ScheduleEngine`](lib/services/ScheduleEngine.ts), [`GitHubApiClient`](lib/services/GitHubApiClient.ts), [`SessionManager`](lib/services/SessionManager.ts)) rather than spreading logic into React components or route handlers.
2. **Strict TypeScript:** Avoid `any` and `unknown` type assertions wherever possible. Define explicit interfaces and types in [`lib/types/`](lib/types/).
3. **Design Language:** ContraGit prioritizes world-class visual aesthetics. Use curated tokens, smooth spring micro-animations, glassmorphism backdrop filters, specular rims, and zero layout shift.
4. **Mobile-First Experience:** Every screen, card, and modal must be fully responsive, ergonomic, and thumb-friendly on iOS/Android devices (touch-action manipulation, safe-area insets, and docked controls).
5. **Privacy & Statelessness:** ContraGit is intentionally designed with **zero server-side database**. Never introduce persistent server-side token or code storage.

---

## 🛠️ Development Workflow

### 1. Prerequisites
- **Node.js**: `>= 18.18.0` (Node 20+ LTS recommended)
- **npm**: `>= 9.0.0`
- A free [GitHub OAuth Application](https://github.com/settings/developers)

### 2. Fork & Clone
```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/gitcontra.git
cd gitcontra

# Add upstream remote
git remote add upstream https://github.com/Interittus13/gitcontra.git
```

### 3. Branch Naming Conventions
Always create a descriptive branch off `main`. Follow this naming schema:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feat/` | A new feature or enhancement | `feat/stencil-eraser-tool` |
| `fix/` | A bug fix | `fix/mobile-canvas-scrolling` |
| `docs/` | Documentation improvements | `docs/oauth-setup-troubleshooting` |
| `refactor/` | Code refactoring without behavioral change | `refactor/schedule-engine-steppers` |
| `perf/` | Performance optimizations | `perf/matrix-memoization` |
| `test/` | Adding or updating unit tests | `test/batch-commit-retries` |
| `chore/` | Tooling, dependencies, or config updates | `chore/upgrade-vitest` |

```bash
git checkout -b feat/my-new-feature
```

### 4. Setup Environment
```bash
# Copy the example environment configuration
cp .env.example .env

# Install dependencies
npm install
```

Configure your `.env` with your GitHub OAuth App credentials:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
REPO_OWNER=Interittus13
REPO_NAME=gitcontra
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Commit Message Guidelines (Conventional Commits)

ContraGit enforces the [Conventional Commits](https://www.conventionalcommits.org/) specification via automated GitHub Actions PR linting.

### Format
```
<type>(<scope>): <subject>
```
*(Scope is optional, but subject must begin with a lowercase letter.)*

### Examples
- `feat(studio): add 1.5x zoom mode for mobile heatmap drawing`
- `fix(auth): handle expired oauth state parameter gracefully`
- `docs(readme): add detailed system architecture diagram`
- `refactor(engine): streamline weekday stepper clamping logic`
- `test(api): add mock tests for atomic micro-batch commit failures`

---

## 🧪 Testing & Pre-Flight Quality Checks

Before submitting any Pull Request, ensure that all automated checks pass locally.

```bash
# 1. Typecheck the entire project with TypeScript
npm run typecheck

# 2. Run automated test suites with Vitest
npm test

# 3. Verify production Next.js build succeeds
npm run build

# 4. Run the full unified check
npm run check
```

---

## 📬 Submitting a Pull Request

1. **Keep PRs Focused:** Aim for single-responsibility PRs. Small, targeted PRs get reviewed and merged significantly faster.
2. **Follow the PR Template:** Fill out all sections of [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md), including motivation, visual evidence/screenshots for UI changes, and testing notes.
3. **Rebase Before Submitting:** Keep your branch up to date with `upstream/main`:
   ```bash
   git fetch upstream
   git rebase upstream/main
   git push origin feat/my-new-feature --force-with-lease
   ```
4. **CI Checks:** Ensure all GitHub Actions checks (TypeScript, Vitest, Next.js Build, Secret Scan, PR Lint) pass.

---

## 🐞 Reporting Issues & Bugs

- Check [existing issues](https://github.com/Interittus13/gitcontra/issues) before opening a new one to avoid duplicates.
- Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) or [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).
- Include full reproduction steps, browser/OS versions, and console error logs when reporting bugs.

---

Thank you for helping make ContraGit the gold standard of GitHub profile engineering! ⚡
