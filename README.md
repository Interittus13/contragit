<div align="center">
  <h1>⚡ ContraGit</h1>
  <p><strong>Architect Your GitHub Journey • Precision Contribution Scheduling & Automation</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
  [![GitHub stars](https://img.shields.io/github/stars/Interittus13/gitcontra?style=flat&color=10b981)](https://github.com/Interittus13/gitcontra/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/Interittus13/gitcontra?style=flat&color=0ea5e9)](https://github.com/Interittus13/gitcontra/network/members)
  [![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg?style=flat)](https://github.com/Interittus13/gitcontra/issues)

  <p><em>Lost your GitHub streak due to private repositories or offline coding? Want to accurately map your developer journey? ContraGit is a cloud automation engine and browser tool designed for curating and managing your GitHub profile activity.</em></p>
</div>

---

## 🌟 Why ContraGit?

Your GitHub contribution graph is your developer footprint. But reality doesn't always reflect on your public squares—enterprise firewalls, private repos, or simply forgetting to push can break your streaks.

**ContraGit** provides an intuitive interface to schedule, randomize, and backdate commits directly via the GitHub Git Data API. No terminal hacks, no local git rebasing scripts.

---

## ✨ Features

- **🗓️ Precision Scheduling:** Select any date range and specify exactly how many commits to generate per weekday.
- **🎲 Intelligent Filters & Randomization:** Natural distribution modes (All Days, Even Days, Odd Days, Random) with adjustable min/max densities.
- **⚡ Zero Configuration Required:** No local Git installations or complex rebases needed. Everything executes seamlessly in the cloud.
- **🔒 Secure GitHub OAuth:** Minimal permissions requested (`read:user`, `user:email`, `repo`). Access tokens remain secured in your private session.
- **🛡️ 100% Native Commits:** Commits are crafted directly into the repository tree via GitHub's official Git Data REST API.
- **🧩 Browser Extension Included:** Manifest V3 extension ready to unpack and run directly from Chrome/Edge.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 18
- A GitHub OAuth Application ([Register one here](https://github.com/settings/developers))

### 2. Configure Environment
Create a `.env` file in the root directory:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
REPO_OWNER=Interittus13
REPO_NAME=gitcontra
```

### 3. Run Locally
```bash
# Install dependencies
npm install

# Start local server with Vercel CLI
npm run dev
```

### 4. Deploy to Vercel
Deploy with a single command or connect your repository on [Vercel](https://vercel.com):
```bash
npx vercel --prod
```
Make sure to add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` under Vercel Project Settings &rarr; Environment Variables.

---

## 🧩 Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the [`extension/`](./extension) directory.
4. Open the extension popup from your toolbar!

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 Glassmorphism, Modern ES Modules
- **Backend**: Vercel Serverless Functions (Node.js runtime)
- **API Engine**: GitHub REST API v3 (Git Data Blobs, Trees, Commits, Refs)
- **Browser Extension**: Manifest V3 compliant

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/Interittus13/gitcontra/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
