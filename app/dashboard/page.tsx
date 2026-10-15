'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle,
  ExternalLink,
  GitBranch,
  GitCommit,
  Loader2,
  LogOut,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  X
} from 'lucide-react';
import { GitHubIcon } from '@/app/components/GitHubIcon';
import { Weekday, WeekdayCounts, FilterPreset, FilterOption, ScheduleCalculation, CommitJob } from '@/lib/types/scheduler';
import { GitHubRepository } from '@/lib/types/github';

const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

export default function DashboardPage() {
  const router = useRouter();

  // User state
  const [user, setUser] = useState<{ login: string; id: number | null; email: string | null } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Repos state
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);

  // Form inputs
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState<string>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<string>(today);
  const [repoOwner, setRepoOwner] = useState<string>('');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [branch, setBranch] = useState<string>('main');
  const [pushToRemote, setPushToRemote] = useState<boolean>(true);

  const [weekdayCounts, setWeekdayCounts] = useState<WeekdayCounts>({
    monday: 5,
    tuesday: 5,
    wednesday: 5,
    thursday: 5,
    friday: 5,
    saturday: 0,
    sunday: 0,
  });

  const [activeFilter, setActiveFilter] = useState<FilterPreset>('all');
  const [activeOption, setActiveOption] = useState<FilterOption>('max');

  // Modals state
  const [calculating, setCalculating] = useState<boolean>(false);
  const [calculation, setCalculation] = useState<ScheduleCalculation | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Job execution state
  const [activeJob, setActiveJob] = useState<CommitJob | null>(null);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [startingJob, setStartingJob] = useState<boolean>(false);

  // Community support feedback
  const [socialMessage, setSocialMessage] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Check Auth on load
  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          setRepoOwner(data.user.login);
          setLoadingAuth(false);
          loadRepositories();
        } else {
          router.replace('/auth');
        }
      })
      .catch(() => {
        router.replace('/auth');
      });
  }, [router]);

  const loadRepositories = () => {
    setLoadingRepos(true);
    fetch('/api/repos')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.repos)) {
          setRepos(data.repos);
          if (data.repos.length > 0) {
            setSelectedRepo(data.repos[0].name);
            setBranch(data.repos[0].defaultBranch || 'main');
          }
        }
        setLoadingRepos(false);
      })
      .catch(() => setLoadingRepos(false));
  };

  const handleRepoChange = (repoName: string) => {
    setSelectedRepo(repoName);
    const found = repos.find((r) => r.name === repoName);
    if (found && found.defaultBranch) {
      setBranch(found.defaultBranch);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
  };

  const handleStepCount = (day: Weekday, delta: number) => {
    setWeekdayCounts((prev) => {
      const nextVal = Math.max(0, Math.min(15, (prev[day] || 0) + delta));
      return { ...prev, [day]: nextVal };
    });
  };

  const applyPreset = (preset: FilterPreset, opt: FilterOption = activeOption) => {
    setActiveFilter(preset);
    setActiveOption(opt);
    const value = opt === 'min' ? 1 : 5;
    const days: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const newCounts: WeekdayCounts = {
      monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
      friday: 0, saturday: 0, sunday: 0,
    };

    days.forEach((d, idx) => {
      const dayNum = (idx + 1) % 7; // Monday = 1, Sunday = 0
      let match = false;
      if (preset === 'all') match = true;
      else if (preset === 'even') match = dayNum !== 0 && dayNum % 2 === 0;
      else if (preset === 'odd') match = dayNum === 0 || dayNum % 2 === 1;
      else if (preset === 'custom') {
        newCounts[d] = Math.floor(Math.random() * 6);
        return;
      }
      newCounts[d] = match ? value : 0;
    });

    setWeekdayCounts(newCounts);
  };

  // Date Range Quick Shortcuts
  const setRangeShortcuts = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Pre-flight calculation
  const handleCalculateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepo) {
      alert('Please select or specify a repository name.');
      return;
    }

    setCalculating(true);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          repoOwner: repoOwner || user?.login,
          repoName: selectedRepo,
          branch,
          weekdayCounts,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Calculation failed');
      }

      setCalculation(data);
      setShowSummaryModal(true);
    } catch (err: any) {
      alert(err.message || 'Failed to calculate schedule');
    } finally {
      setCalculating(false);
    }
  };

  // Start commit generation job
  const handleConfirmAndStart = async () => {
    setShowSummaryModal(false);
    setStartingJob(true);
    setShowProgressModal(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          repoOwner: repoOwner || user?.login,
          repoName: selectedRepo,
          branch,
          pushToRemote,
          weekdayCounts,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Job startup failed');
      }

      const jobId = data.jobId;

      // Poll status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/status?jobId=${jobId}`);
          const statusData = await statusRes.json();
          if (statusData.success && statusData.job) {
            setActiveJob(statusData.job);
            if (statusData.job.status === 'completed' || statusData.job.status === 'failed') {
              clearInterval(pollInterval);
            }
          }
        } catch {
          // ignore transient poll error
        }
      }, 500);
    } catch (err: any) {
      alert(err.message || 'Failed to start generation job');
      setShowProgressModal(false);
    } finally {
      setStartingJob(false);
    }
  };

  // Voluntary Social actions
  const triggerSocialAction = async (action: 'star' | 'follow') => {
    setSocialLoading(action);
    setSocialMessage(null);
    try {
      const res = await fetch('/api/social-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Action failed');
      setSocialMessage(data.message);
    } catch (err: any) {
      setSocialMessage(err.message);
    } finally {
      setSocialLoading(null);
    }
  };

  if (loadingAuth) {
    return (
      <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={32} color="var(--emerald-400)" />
          <span>Authenticating ContraGit session...</span>
        </div>
      </div>
    );
  }

  const progressPercent = activeJob && activeJob.total > 0
    ? Math.min(100, Math.round((activeJob.completed / activeJob.total) * 100))
    : 0;

  return (
    <div className="page-container">
      {/* Top Header */}
      <header className="header-nav">
        <Link href="/" className="brand-badge">
          <div className="brand-icon">⚡</div>
          <span className="brand-title">Contra<span className="accent">Git</span></span>
        </Link>
        <div className="user-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitHubIcon size={16} />
            <span className="user-tag">@{user?.login}</span>
          </div>
          <button onClick={handleSignOut} className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Main Scheduler Form Panel */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={22} color="var(--emerald-400)" /> Schedule Contributions
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Select your target date range, configure commit densities per day, and deploy to your repository.
              </p>
            </div>
            <div className="status-pill">
              <span className="status-dot"></span> System Ready
            </div>
          </div>

          <form onSubmit={handleCalculateSchedule}>
            {/* Date Pickers */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Quick Range Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem', marginTop: '-0.5rem' }}>
              <button type="button" onClick={() => setRangeShortcuts(30)} className="filter-chip">Last 30 Days</button>
              <button type="button" onClick={() => setRangeShortcuts(90)} className="filter-chip">Last 90 Days</button>
              <button type="button" onClick={() => setRangeShortcuts(180)} className="filter-chip">Last 6 Months</button>
              <button type="button" onClick={() => setRangeShortcuts(365)} className="filter-chip">Full Year (365 Days)</button>
            </div>

            {/* Target Repository */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Repository Owner</label>
                <input
                  type="text"
                  className="form-input"
                  value={repoOwner}
                  onChange={(e) => setRepoOwner(e.target.value)}
                  placeholder="e.g. your GitHub username"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Repository</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {loadingRepos ? (
                    <input type="text" className="form-input" value="Loading repositories..." disabled />
                  ) : repos.length > 0 ? (
                    <select
                      className="form-select"
                      value={selectedRepo}
                      onChange={(e) => handleRepoChange(e.target.value)}
                      required
                    >
                      {repos.map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.name} {r.private ? '(Private)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      placeholder="e.g. gitcontra"
                      required
                    />
                  )}
                  <button
                    type="button"
                    onClick={loadRepositories}
                    className="btn-ghost"
                    title="Refresh repositories"
                    style={{ padding: '0.6rem' }}
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Target Branch */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Target Branch</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  required
                />
                <GitBranch size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            {/* Weekday Stepper Grid */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Commits Per Weekday</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>0 = Skip Day, 1 to 15 = Density</span>
              </div>
              <div className="weekday-grid">
                {WEEKDAYS.map(({ key, label }) => {
                  const count = weekdayCounts[key] || 0;
                  return (
                    <div key={key} className={`weekday-card ${count > 0 ? 'has-commits' : ''}`}>
                      <span className="weekday-name">{label}</span>
                      <div className="weekday-stepper">
                        <button type="button" onClick={() => handleStepCount(key, -1)}>-</button>
                        <span className="weekday-val">{count}</span>
                        <button type="button" onClick={() => handleStepCount(key, 1)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter Modes */}
            <div className="filter-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={16} color="var(--emerald-400)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>PRESETS:</span>
                <div className="filter-btn-group">
                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
                  >
                    ALL DAYS
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('even')}
                    className={`filter-chip ${activeFilter === 'even' ? 'active' : ''}`}
                  >
                    EVEN DAYS
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('odd')}
                    className={`filter-chip ${activeFilter === 'odd' ? 'active' : ''}`}
                  >
                    ODD DAYS
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('custom')}
                    className={`filter-chip ${activeFilter === 'custom' ? 'active' : ''}`}
                  >
                    RANDOM
                  </button>
                </div>
              </div>

              <div className="filter-btn-group">
                <button
                  type="button"
                  onClick={() => applyPreset(activeFilter, 'min')}
                  className={`filter-chip ${activeOption === 'min' ? 'active' : ''}`}
                >
                  MIN (1)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(activeFilter, 'max')}
                  className={`filter-chip ${activeOption === 'max' ? 'active' : ''}`}
                >
                  MAX (5)
                </button>
              </div>
            </div>

            {/* Push to remote toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <input
                type="checkbox"
                id="pushRemoteToggle"
                checked={pushToRemote}
                onChange={(e) => setPushToRemote(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--emerald-500)', cursor: 'pointer' }}
              />
              <label htmlFor="pushRemoteToggle" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                <strong>Push to Remote:</strong> Automatically update branch reference on GitHub
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={calculating}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
            >
              {calculating ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Calculating Schedule...
                </>
              ) : (
                <>
                  <Play size={18} /> Review & Generate Schedule
                </>
              )}
            </button>
          </form>
        </div>

        {/* Community Voluntary Support Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <Sparkles size={16} color="var(--emerald-400)" /> Support ContraGit
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Open-source developer tool. Star the repo or follow on GitHub to stay tuned for upcoming visual heatmap painter!
            </p>
            {socialMessage && (
              <p style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', marginTop: '0.4rem' }}>
                {socialMessage}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => triggerSocialAction('star')}
              disabled={socialLoading === 'star'}
              className="btn-ghost"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
            >
              <Star size={15} color="var(--warning)" fill="var(--warning)" /> Star Repo
            </button>
            <button
              onClick={() => triggerSocialAction('follow')}
              disabled={socialLoading === 'follow'}
              className="btn-ghost"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
            >
              <UserPlus size={15} /> Follow Developer
            </button>
          </div>
        </div>
      </main>

      {/* Modal 1: Summary Pre-flight Review */}
      {showSummaryModal && calculation && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitCommit size={20} color="var(--emerald-400)" /> Schedule Pre-Flight Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Target Repository:</span>
                <span className="mono" style={{ color: 'var(--emerald-400)' }}>{calculation.repository} ({branch})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Date Range:</span>
                <span>{calculation.dateRange}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Eligible Days:</span>
                <span>{calculation.eligibleDays} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Total Commits to Generate:</span>
                <strong style={{ color: 'var(--emerald-400)', fontSize: '1.05rem' }}>{calculation.totalCommits} commits</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Estimated Execution Time:</span>
                <span>~{calculation.estimatedSeconds}s</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="btn-ghost"
              >
                Back / Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmAndStart}
                className="btn-primary"
              >
                Confirm & Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Live Execution Progress */}
      {showProgressModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeJob?.status === 'completed' ? (
                <>
                  <CheckCircle size={22} color="var(--emerald-400)" /> Schedule Completed!
                </>
              ) : activeJob?.status === 'failed' ? (
                <>
                  <X size={22} color="var(--danger)" /> Generation Failed
                </>
              ) : (
                <>
                  <Loader2 className="animate-spin" size={22} color="var(--emerald-400)" /> Deploying Commits...
                </>
              )}
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Target: <code style={{ color: 'var(--emerald-400)' }}>{repoOwner}/{selectedRepo}:{branch}</code>
            </p>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)' }}>
              <span>Completed: {activeJob ? activeJob.completed : 0} / {activeJob ? activeJob.total : 0}</span>
              <span>{progressPercent}%</span>
            </div>

            {activeJob?.status === 'failed' && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <strong>Error:</strong> {activeJob.error}
              </div>
            )}

            {activeJob?.status === 'completed' && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--border-active)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--emerald-400)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                {activeJob.result?.message}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {activeJob.result?.pushResult?.message}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {(activeJob?.status === 'completed' || activeJob?.status === 'failed') ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setShowProgressModal(false); setActiveJob(null); }}
                    className="btn-ghost"
                  >
                    Close
                  </button>
                  {activeJob?.status === 'completed' && (
                    <a
                      href={`https://github.com/${repoOwner}/${selectedRepo}/commits/${branch}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                    >
                      View on GitHub <ExternalLink size={16} />
                    </a>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Please do not close this window while generating commits...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
