/**
 * ContraGit Extension — In-Page GitHub Profile Injector
 * Object-Oriented DOM Injector & Real-time Graph Scanner
 */

class GitHubProfileInjector {
  constructor() {
    this.injectedWrapId = 'contragit-profile-wrap';
    this.flyoutId = 'contragit-profile-flyout';
    this.flyoutOpen = false;
    this.debounceTimer = null;

    this.init();
  }

  init() {
    // Initial evaluation
    this.checkAndInject();

    // Listen to GitHub SPA navigation events (Turbo & PJAX)
    document.addEventListener('turbo:load', () => this.checkAndInject());
    document.addEventListener('pjax:end', () => this.checkAndInject());
    document.addEventListener('DOMContentLoaded', () => this.checkAndInject());

    // Fallback MutationObserver to survive dynamic graph updates
    const observer = new MutationObserver(() => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.checkAndInject(), 350);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Close flyout on click outside or Escape
    document.addEventListener('click', (e) => {
      if (this.flyoutOpen && !e.target.closest(`#${this.injectedWrapId}`)) {
        this.closeFlyout();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.flyoutOpen) {
        this.closeFlyout();
      }
    });
  }

  getTargetUsername() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length === 1 && !['settings', 'marketplace', 'explore', 'topics', 'trending', 'notifications'].includes(pathParts[0])) {
      return pathParts[0];
    }
    const calendarUserEl = document.querySelector('[data-calendar-user]');
    return calendarUserEl?.getAttribute('data-calendar-user') || pathParts[0] || '';
  }

  isProfilePage() {
    return Boolean(
      document.querySelector('.js-yearly-contributions') ||
      document.querySelector('.js-calendar-graph') ||
      document.querySelector('[data-calendar-user]')
    );
  }

  scanGraph() {
    const dayCells = Array.from(document.querySelectorAll('.ContributionCalendar-day'));
    if (dayCells.length === 0) {
      return { totalActive: 0, currentStreak: 0, recentGaps: 0 };
    }

    // Sort cells by date attribute
    const parsedDays = dayCells
      .map((cell) => {
        const dateStr = cell.getAttribute('data-date');
        const level = Number(cell.getAttribute('data-level') || 0);
        return { dateStr, level };
      })
      .filter((d) => Boolean(d.dateStr))
      .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());

    let totalActive = 0;
    parsedDays.forEach((d) => {
      if (d.level > 0) totalActive++;
    });

    // Compute streak scanning backwards from most recent
    let currentStreak = 0;
    for (let i = parsedDays.length - 1; i >= 0; i--) {
      if (parsedDays[i].level > 0) {
        currentStreak++;
      } else {
        // Stop streak if gap encountered (allow 1 day grace for today if early morning)
        if (i < parsedDays.length - 1) break;
      }
    }

    // Gaps in last 30 days
    const last30 = parsedDays.slice(-30);
    let recentGaps = 0;
    last30.forEach((d) => {
      if (d.level === 0) recentGaps++;
    });

    return {
      totalActive,
      currentStreak,
      recentGaps,
    };
  }

  checkAndInject() {
    if (!this.isProfilePage()) return;
    if (document.getElementById(this.injectedWrapId)) return; // Already injected

    // Locate mounting anchor in GitHub's contribution header
    const anchor =
      document.querySelector('#contribution-settings-menu')?.closest('.float-right') ||
      document.querySelector('.js-yearly-contributions .float-right') ||
      document.querySelector('.js-yearly-contributions h2') ||
      document.querySelector('.js-calendar-graph');

    if (!anchor) return;

    this.mount(anchor);
  }

  mount(anchor) {
    const username = this.getTargetUsername();
    const stats = this.scanGraph();

    const wrap = document.createElement('div');
    wrap.id = this.injectedWrapId;
    wrap.className = 'contragit-injected-wrap';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'contragit-injected-btn';
    btn.title = 'Open ContraGit Studio Inspection';
    btn.innerHTML = `
      <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="" class="contragit-injected-icon" />
      <span>⚡ ContraGit Studio</span>
      ${stats.recentGaps > 0 ? `<span class="contragit-injected-badge">${stats.recentGaps} gaps</span>` : ''}
    `;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFlyout(wrap, username, stats);
    });

    wrap.appendChild(btn);

    // Insert smoothly beside anchor
    if (anchor.tagName === 'H2') {
      anchor.style.display = 'inline-flex';
      anchor.style.alignItems = 'center';
      anchor.appendChild(wrap);
    } else {
      anchor.parentElement.insertBefore(wrap, anchor.nextSibling);
    }
  }

  toggleFlyout(wrap, username, stats) {
    const existing = document.getElementById(this.flyoutId);
    if (existing) {
      this.closeFlyout();
      return;
    }

    this.flyoutOpen = true;
    const flyout = document.createElement('div');
    flyout.id = this.flyoutId;
    flyout.className = 'contragit-injected-flyout';

    flyout.innerHTML = `
      <div class="contragit-flyout-header">
        <div class="contragit-flyout-brand">
          <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="" class="contragit-injected-icon" />
          <div>Contra<span>Git</span> Telemetry</div>
        </div>
        <button type="button" class="contragit-flyout-close" aria-label="Close">✕</button>
      </div>

      <div class="contragit-telemetry-grid">
        <div class="contragit-telemetry-card">
          <span class="contragit-telemetry-label">Active Days</span>
          <span class="contragit-telemetry-val" style="color: #34d399;">${stats.totalActive}</span>
        </div>
        <div class="contragit-telemetry-card">
          <span class="contragit-telemetry-label">Current Streak</span>
          <span class="contragit-telemetry-val" style="color: #22d3ee;">${stats.currentStreak} d</span>
        </div>
      </div>

      ${stats.recentGaps > 0 ? `
        <div class="contragit-gap-alert">
          ⚠️ <strong>${stats.recentGaps} inactive days</strong> detected in trailing 30 days.
        </div>
      ` : `
        <div style="color: #34d399; font-size: 11px;">
          ✓ Rhythm steady. No recent gaps detected.
        </div>
      `}

      <div class="contragit-flyout-actions">
        <button type="button" class="contragit-action-btn-primary" id="launchStudioBtn">
          ⚡ Launch 52-Week Studio ↗
        </button>
      </div>
    `;

    flyout.querySelector('.contragit-flyout-close')?.addEventListener('click', () => {
      this.closeFlyout();
    });

    flyout.querySelector('#launchStudioBtn')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        action: 'OPEN_STUDIO',
        payload: {
          targetUser: username,
          gapCount: stats.recentGaps,
          source: 'github-profile-button',
        },
      });
      this.closeFlyout();
    });

    wrap.appendChild(flyout);
  }

  closeFlyout() {
    this.flyoutOpen = false;
    document.getElementById(this.flyoutId)?.remove();
  }
}

// Instantiate injector
new GitHubProfileInjector();
