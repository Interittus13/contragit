# Security Policy

At **ContraGit**, we take user security and privacy seriously. Because ContraGit connects directly with GitHub via OAuth to author Git Data commits, maintaining a secure, confidential environment is our highest priority.

---

## 🔒 Supported Versions

We provide security updates and patches for the current major release:

| Version | Supported          |
| :---    | :---               |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |

---

## 🛡️ Core Security Architecture

1. **Zero Database Footprint:** ContraGit does not persist OAuth access tokens, personal source code, or repository metadata in any server database.
2. **Stateless HTTP-Only Sessions:** OAuth sessions are maintained through encrypted, HTTP-only, `SameSite=Lax` cookies directly between your browser and GitHub endpoints.
3. **Least Privilege Scopes:** ContraGit requests only the minimum necessary OAuth permissions (`read:user`, `user:email`, `repo`).
4. **Direct API Authoring:** All commit objects, trees, and blobs are constructed directly in-memory via GitHub's official REST API without local disk cloning.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or potential token leak within ContraGit, **please do not open a public GitHub issue.**

Instead, please report it via one of the following channels:

- **GitHub Private Advisory:** [Report a security advisory](https://github.com/Interittus13/gitcontra/security/advisories/new)
- **Direct Maintainer Contact:** Open a confidential security discussion via GitHub security advisories.

### What to Include in Your Report
Please provide:
- A clear description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or a minimal proof of concept (PoC).
- Any relevant request/response headers, logs, or screenshots.

### Response Timeline
- **Initial Response:** Within 48 hours of receipt.
- **Triage & Assessment:** Within 5 business days.
- **Fix & Public Disclosure:** Coordinated release with reporter acknowledgement once patched.

Thank you for helping keep the developer community secure! ⚡
