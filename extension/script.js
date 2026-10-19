/**
 * ContraGit Extension v2.0
 * Architecture: Object-Oriented & DRY Domain Services
 * Compliant with Manifest V3 and zero server-side dependency requirement.
 */

// ==========================================
// 1. StorageService (Chrome Storage & Local Storage Abstraction)
// ==========================================
class StorageService {
  static async get(key, defaultValue = null) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] !== undefined ? result[key] : defaultValue);
        });
      });
    }
    const val = localStorage.getItem(key);
    try {
      return val !== null ? JSON.parse(val) : defaultValue;
    } catch {
      return val ?? defaultValue;
    }
  }

  static async set(key, value) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      });
    }
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
}

// ==========================================
// 2. GitHubExtensionClient (Direct Git Data API)
// ==========================================
class GitHubExtensionClient {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.github.com';
  }

  get headers() {
    return {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  async getUser() {
    const res = await fetch(`${this.baseUrl}/user`, { headers: this.headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to authenticate with GitHub.');
    }
    return res.json();
  }

  async getRepositories() {
    const res = await fetch(`${this.baseUrl}/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator`, {
      headers: this.headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch repositories.');
    }
    return res.json();
  }

  async getBranchHead(owner, repo, branch = 'main') {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
      headers: this.headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Branch "${branch}" not found in ${owner}/${repo}`);
    }
    const data = await res.json();
    return data.object.sha;
  }

  async getCommit(owner, repo, commitSha) {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/commits/${commitSha}`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`Failed to read commit ${commitSha}`);
    return res.json();
  }

  async createBlob(owner, repo, content) {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ content, encoding: 'utf-8' }),
    });
    if (!res.ok) throw new Error('Failed to create Git blob.');
    return res.json();
  }

  async createTree(owner, repo, baseTreeSha, path, blobSha) {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: [
          {
            path,
            mode: '100644',
            type: 'blob',
            sha: blobSha,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error('Failed to create Git tree.');
    return res.json();
  }

  async createCommit(owner, repo, message, treeSha, parentSha, isoDate) {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        message,
        tree: treeSha,
        parents: [parentSha],
        author: {
          name: 'ContraGit Engine',
          email: 'agent@contragit.dev',
          date: isoDate,
        },
        committer: {
          name: 'ContraGit Engine',
          email: 'agent@contragit.dev',
          date: isoDate,
        },
      }),
    });
    if (!res.ok) throw new Error('Failed to create Git commit object.');
    return res.json();
  }

  async updateBranchRef(owner, repo, branch, commitSha) {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({
        sha: commitSha,
        force: false,
      }),
    });
    if (!res.ok) throw new Error(`Failed to update branch ref heads/${branch}`);
    return res.json();
  }
}

// ==========================================
// 3. LanguageMasqueradeHelper (Organic Code Scaffolds)
// ==========================================
class LanguageMasqueradeHelper {
  static getPayload(language, commitIndex) {
    const ts = new Date().toISOString();
    switch (language) {
      case 'python':
        return {
          path: 'src/pipeline/analytics.py',
          content: `"""\nData Processing Pipeline\nUpdated: ${ts}\nCommit: #${commitIndex}\n"""\n\ndef calculate_metrics(data):\n    return sum(data) / len(data) if data else 0\n`,
        };
      case 'go':
        return {
          path: 'pkg/router/gateway.go',
          content: `package gateway\n\n// Gateway service router\n// Updated: ${ts}\n\ntype Config struct {\n\tPort int\n\tTimeoutMs int\n}\n`,
        };
      case 'rust':
        return {
          path: 'crates/core/src/cache.rs',
          content: `//! In-memory state cache\n//! Updated: ${ts}\n\npub struct CacheEngine {\n    pub capacity: usize,\n}\n`,
        };
      case 'devops':
        return {
          path: 'infra/terraform/main.tf',
          content: `# Infrastructure as Code\n# Updated: ${ts}\n\nterraform {\n  required_version = ">= 1.5.0"\n}\n`,
        };
      case 'typescript':
      default:
        return {
          path: 'src/algorithms/cache.ts',
          content: `/**\n * LRU Cache Engine\n * Updated: ${ts}\n * Commit: #${commitIndex}\n */\nexport class LRUCache {\n  private capacity: number;\n  constructor(cap: number = 100) {\n    this.capacity = cap;\n  }\n}\n`,
        };
    }
  }

  static getCommitMessage(index) {
    const types = ['feat', 'fix', 'refactor', 'perf', 'docs', 'chore'];
    const scopes = ['core', 'engine', 'pipeline', 'router', 'cache', 'infra'];
    const verbs = [
      'optimize batch processing loop',
      'refactor state serialization',
      'improve throughput metrics',
      'update data interfaces',
      'resolve edge condition',
      'streamline telemetry hooks'
    ];
    const t = types[index % types.length];
    const s = scopes[index % scopes.length];
    const v = verbs[index % verbs.length];
    return `${t}(${s}): ${v} [contra-#${index + 1}]`;
  }
}

// ==========================================
// 4. ExtensionApp (UI Orchestration & Batch Engine)
// ==========================================
class ExtensionApp {
  constructor() {
    this.client = null;
    this.currentUser = null;
    this.userRepos = [];
    this.activeBatch = null;
    this.isPaused = false;
    this.isStopped = false;

    this.cacheDom();
    this.bindEvents();
    this.init();
  }

  cacheDom() {
    this.dom = {
      userAvatar: document.getElementById('userAvatar'),
      userLogin: document.getElementById('userLogin'),
      userBadge: document.getElementById('userBadge'),
      toggleAuthBtn: document.getElementById('toggleAuthBtn'),
      tabBtnSchedule: document.getElementById('tabBtnSchedule'),
      tabBtnSettings: document.getElementById('tabBtnSettings'),
      tabContentSchedule: document.getElementById('tabContentSchedule'),
      tabContentSettings: document.getElementById('tabContentSettings'),
      launchStudioLink: document.getElementById('launchStudioLink'),
      repoSelect: document.getElementById('repoSelect'),
      branchInput: document.getElementById('branchInput'),
      startDate: document.getElementById('startDate'),
      endDate: document.getElementById('endDate'),
      weekdayInputs: document.querySelectorAll('[data-weekday]'),
      langSelect: document.getElementById('langSelect'),
      randomizeToggle: document.getElementById('randomizeToggle'),
      presetChips: document.querySelectorAll('.preset-chip'),
      scheduleForm: document.getElementById('scheduleForm'),
      deployBtn: document.getElementById('deployBtn'),
      progressHub: document.getElementById('progressHub'),
      progressTitle: document.getElementById('progressTitle'),
      progressPercent: document.getElementById('progressPercent'),
      progressFill: document.getElementById('progressFill'),
      progressCounts: document.getElementById('progressCounts'),
      progressBatchText: document.getElementById('progressBatchText'),
      progressControls: document.getElementById('progressControls'),
      pauseResumeBtn: document.getElementById('pauseResumeBtn'),
      stopBatchBtn: document.getElementById('stopBatchBtn'),
      completionActions: document.getElementById('completionActions'),
      viewOnGitHubBtn: document.getElementById('viewOnGitHubBtn'),
      resetHubBtn: document.getElementById('resetHubBtn'),
      patTokenInput: document.getElementById('patTokenInput'),
      studioUrlInput: document.getElementById('studioUrlInput'),
      saveSettingsBtn: document.getElementById('saveSettingsBtn'),
      settingsFeedback: document.getElementById('settingsFeedback'),
      globalBanner: document.getElementById('globalBanner'),
    };
  }

  bindEvents() {
    // Tab switching
    this.dom.tabBtnSchedule.addEventListener('click', () => this.switchTab('schedule'));
    this.dom.tabBtnSettings.addEventListener('click', () => this.switchTab('settings'));
    this.dom.toggleAuthBtn.addEventListener('click', () => this.switchTab('settings'));

    // Date Presets
    this.dom.presetChips.forEach((chip) => {
      chip.addEventListener('click', () => this.applyDatePreset(chip.dataset.span, chip));
    });

    // Settings save
    this.dom.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

    // Schedule submission
    this.dom.scheduleForm.addEventListener('submit', (e) => this.handleScheduleSubmit(e));

    // Execution controls
    this.dom.pauseResumeBtn.addEventListener('click', () => this.togglePauseResume());
    this.dom.stopBatchBtn.addEventListener('click', () => this.stopExecution());
    this.dom.resetHubBtn.addEventListener('click', () => this.resetHub());
  }

  async init() {
    // Default dates: last 30 days
    this.applyDatePreset('30');

    // Load stored settings
    const token = await StorageService.get('contragit_pat', '');
    const studioUrl = await StorageService.get('contragit_studio_url', 'http://localhost:3000');
    
    this.dom.patTokenInput.value = token;
    this.dom.studioUrlInput.value = studioUrl;
    this.dom.launchStudioLink.href = `${studioUrl.replace(/\/$/, '')}/dashboard`;

    if (token) {
      await this.authenticateWithToken(token);
    } else {
      this.showNotice('Please enter a GitHub Personal Access Token in Settings to get started.', 'warning');
      this.switchTab('settings');
    }
  }

  switchTab(tab) {
    if (tab === 'schedule') {
      this.dom.tabBtnSchedule.classList.add('active');
      this.dom.tabBtnSettings.classList.remove('active');
      this.dom.tabContentSchedule.classList.remove('hidden');
      this.dom.tabContentSettings.classList.add('hidden');
    } else {
      this.dom.tabBtnSettings.classList.add('active');
      this.dom.tabBtnSchedule.classList.remove('active');
      this.dom.tabContentSettings.classList.remove('hidden');
      this.dom.tabContentSchedule.classList.add('hidden');
    }
  }

  applyDatePreset(span, activeChip) {
    if (activeChip) {
      this.dom.presetChips.forEach((c) => c.classList.remove('active'));
      activeChip.classList.add('active');
    }

    const today = new Date();
    const toDateString = (d) => d.toISOString().split('T')[0];
    this.dom.endDate.value = toDateString(today);

    if (span === '30') {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      this.dom.startDate.value = toDateString(start);
    } else if (span === '90') {
      const start = new Date(today);
      start.setDate(today.getDate() - 90);
      this.dom.startDate.value = toDateString(start);
    } else if (span === 'year') {
      const start = new Date(today);
      start.setDate(today.getDate() - 364);
      this.dom.startDate.value = toDateString(start);
    }
  }

  async saveSettings() {
    const token = this.dom.patTokenInput.value.trim();
    const studioUrl = this.dom.studioUrlInput.value.trim() || 'http://localhost:3000';

    this.dom.saveSettingsBtn.disabled = true;
    this.dom.saveSettingsBtn.textContent = 'Verifying Token...';

    try {
      if (!token) throw new Error('Personal Access Token cannot be blank.');
      
      const client = new GitHubExtensionClient(token);
      const user = await client.getUser();

      await StorageService.set('contragit_pat', token);
      await StorageService.set('contragit_studio_url', studioUrl);

      this.client = client;
      this.currentUser = user;
      this.dom.launchStudioLink.href = `${studioUrl.replace(/\/$/, '')}/dashboard`;

      this.updateUserCard(user);
      await this.loadRepositories();

      this.showFeedback('Connected successfully to GitHub!', 'success');
      setTimeout(() => this.switchTab('schedule'), 800);
    } catch (err) {
      this.showFeedback(err.message, 'danger');
    } finally {
      this.dom.saveSettingsBtn.disabled = false;
      this.dom.saveSettingsBtn.textContent = 'Save & Connect to GitHub';
    }
  }

  async authenticateWithToken(token) {
    try {
      this.client = new GitHubExtensionClient(token);
      const user = await this.client.getUser();
      this.currentUser = user;
      this.updateUserCard(user);
      await this.loadRepositories();
      this.hideNotice();
    } catch (err) {
      this.showNotice(`Authentication failed: ${err.message}`, 'danger');
      this.switchTab('settings');
    }
  }

  updateUserCard(user) {
    this.dom.userAvatar.src = user.avatar_url;
    this.dom.userLogin.textContent = user.login;
    this.dom.userBadge.innerHTML = `<span class="pulse-dot"></span> Active (${user.public_repos + (user.total_private_repos || 0)} repos)`;
  }

  async loadRepositories() {
    if (!this.client) return;
    try {
      const repos = await this.client.getRepositories();
      this.userRepos = repos;
      this.dom.repoSelect.innerHTML = '';

      if (repos.length === 0) {
        this.dom.repoSelect.innerHTML = '<option value="" disabled>No repositories found</option>';
        return;
      }

      const defaultRepo = await StorageService.get('contragit_last_repo', '');
      repos.forEach((r) => {
        const opt = document.createElement('option');
        opt.value = r.full_name;
        opt.textContent = `${r.name}${r.private ? ' 🔒' : ''}`;
        if (r.full_name === defaultRepo || r.name === 'gitcontra') {
          opt.selected = true;
        }
        this.dom.repoSelect.appendChild(opt);
      });

      if (!this.dom.repoSelect.value && repos[0]) {
        this.dom.repoSelect.value = repos[0].full_name;
      }
    } catch (err) {
      this.showNotice(`Failed to load repositories: ${err.message}`, 'warning');
    }
  }

  // Generate date queue
  generateScheduleQueue() {
    const start = new Date(this.dom.startDate.value);
    const end = new Date(this.dom.endDate.value);
    const isNatural = this.dom.randomizeToggle.value === 'natural';

    const weekdayMap = {};
    this.dom.weekdayInputs.forEach((input) => {
      weekdayMap[input.dataset.weekday] = Number(input.value) || 0;
    });

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const queue = [];

    const current = new Date(start);
    while (current <= end) {
      const dayName = dayNames[current.getDay()];
      const targetCount = weekdayMap[dayName] || 0;

      if (targetCount > 0) {
        let count = targetCount;
        if (isNatural) {
          const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
          count = Math.max(1, targetCount + delta);
        }

        for (let i = 0; i < count; i++) {
          const commitTime = new Date(current);
          commitTime.setHours(10 + Math.floor(i * 2), Math.floor(Math.random() * 59), Math.floor(Math.random() * 59));
          queue.push({
            date: commitTime.toISOString(),
            commitIndex: queue.length,
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return queue;
  }

  async handleScheduleSubmit(e) {
    e.preventDefault();
    if (!this.client || !this.currentUser) {
      this.showNotice('Please configure your GitHub token first.', 'danger');
      this.switchTab('settings');
      return;
    }

    const selectedFullName = this.dom.repoSelect.value;
    if (!selectedFullName) {
      this.showNotice('Please select a target repository.', 'warning');
      return;
    }

    const [owner, repo] = selectedFullName.split('/');
    const branch = this.dom.branchInput.value.trim() || 'main';
    const queue = this.generateScheduleQueue();

    if (queue.length === 0) {
      this.showNotice('No commits generated with current weekday values. Set at least one weekday > 0.', 'warning');
      return;
    }

    // Save defaults
    await StorageService.set('contragit_last_repo', selectedFullName);
    await StorageService.set('contragit_last_branch', branch);

    // Switch to live execution hub
    this.startDeployment(owner, repo, branch, queue);
  }

  async startDeployment(owner, repo, branch, queue) {
    this.isPaused = false;
    this.isStopped = false;
    this.dom.scheduleForm.classList.add('hidden');
    this.dom.progressHub.classList.remove('hidden');
    this.dom.completionActions.classList.add('hidden');
    this.dom.progressControls.classList.remove('hidden');

    this.dom.progressTitle.textContent = `Deploying to ${owner}/${repo}...`;
    this.dom.pauseResumeBtn.textContent = '⏸ Pause';

    const lang = this.dom.langSelect.value;
    const totalCommits = queue.length;
    let completed = 0;

    try {
      // 1. Get initial branch HEAD commit & tree SHA
      const headCommitSha = await this.client.getBranchHead(owner, repo, branch);
      const headCommit = await this.client.getCommit(owner, repo, headCommitSha);
      let currentParentSha = headCommitSha;
      let currentTreeSha = headCommit.tree.sha;

      // 2. Author commits sequentially in micro-batches
      for (let i = 0; i < totalCommits; i++) {
        // Handle Pause state
        while (this.isPaused && !this.isStopped) {
          this.dom.progressTitle.textContent = 'Generation Paused';
          await new Promise((r) => setTimeout(r, 400));
        }

        // Handle Stop state
        if (this.isStopped) {
          this.dom.progressTitle.textContent = 'Stopped (Commits Preserved)';
          this.finishDeployment(owner, repo, branch, completed, totalCommits, true);
          return;
        }

        const item = queue[i];
        const filePayload = LanguageMasqueradeHelper.getPayload(lang, i);
        const msg = LanguageMasqueradeHelper.getCommitMessage(i);

        // Git Data API pipeline: blob -> tree -> commit
        const blob = await this.client.createBlob(owner, repo, filePayload.content);
        const tree = await this.client.createTree(owner, repo, currentTreeSha, filePayload.path, blob.sha);
        const newCommit = await this.client.createCommit(owner, repo, msg, tree.sha, currentParentSha, item.date);

        // Update branch pointer & state
        await this.client.updateBranchRef(owner, repo, branch, newCommit.sha);
        currentParentSha = newCommit.sha;
        currentTreeSha = tree.sha;
        completed++;

        // Update UI
        const pct = Math.round((completed / totalCommits) * 100);
        this.dom.progressFill.style.width = `${pct}%`;
        this.dom.progressPercent.textContent = `${pct}%`;
        this.dom.progressCounts.textContent = `${completed} / ${totalCommits} commits`;
        this.dom.progressBatchText.textContent = `Batch ${Math.ceil(completed / 5)} of ${Math.ceil(totalCommits / 5)}`;

        // Subtle pacing to prevent GitHub secondary rate limits
        await new Promise((r) => setTimeout(r, 200));
      }

      this.dom.progressTitle.textContent = '✓ Schedule Completed!';
      this.finishDeployment(owner, repo, branch, completed, totalCommits, false);
    } catch (err) {
      this.dom.progressTitle.textContent = 'Deployment Error';
      this.showNotice(err.message, 'danger');
      this.dom.progressControls.classList.add('hidden');
      this.dom.completionActions.classList.remove('hidden');
      this.dom.viewOnGitHubBtn.href = `https://github.com/${owner}/${repo}/commits/${branch}`;
    }
  }

  togglePauseResume() {
    this.isPaused = !this.isPaused;
    this.dom.pauseResumeBtn.textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
  }

  stopExecution() {
    this.isStopped = true;
    this.isPaused = false;
  }

  finishDeployment(owner, repo, branch, completed, total, wasStopped) {
    this.dom.progressControls.classList.add('hidden');
    this.dom.completionActions.classList.remove('hidden');
    this.dom.viewOnGitHubBtn.href = `https://github.com/${owner}/${repo}/commits/${branch}`;
    if (!wasStopped) {
      this.dom.progressFill.style.width = '100%';
      this.dom.progressPercent.textContent = '100%';
    }
  }

  resetHub() {
    this.dom.progressHub.classList.add('hidden');
    this.dom.scheduleForm.classList.remove('hidden');
    this.dom.progressFill.style.width = '0%';
    this.dom.progressPercent.textContent = '0%';
    this.dom.progressCounts.textContent = '0 / 0 commits';
    this.hideNotice();
  }

  showNotice(msg, type = 'warning') {
    this.dom.globalBanner.className = `banner banner-${type}`;
    this.dom.globalBanner.textContent = msg;
    this.dom.globalBanner.classList.remove('hidden');
  }

  hideNotice() {
    this.dom.globalBanner.classList.add('hidden');
  }

  showFeedback(msg, type = 'success') {
    this.dom.settingsFeedback.className = `banner banner-${type}`;
    this.dom.settingsFeedback.textContent = msg;
    this.dom.settingsFeedback.classList.remove('hidden');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ExtensionApp();
});
