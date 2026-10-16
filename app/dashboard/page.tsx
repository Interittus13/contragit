'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Palette,
  Sliders,
  Star,
  UserPlus
} from 'lucide-react';

import {
  WeekdayCounts,
  FilterPreset,
  FilterOption,
  ScheduleCalculation,
  CommitJob,
  CustomCommitMatrix,
  CommitMessageStyle,
  CommitBatchItem
} from '@/lib/types/scheduler';
import { GitHubUser, GitHubRepository } from '@/lib/types/github';
import { scheduleEngine } from '@/lib/services/ScheduleEngine';

import { AppHeader } from '@/app/components/layout/AppHeader';
import { MobileBottomBar } from '@/app/components/layout/MobileBottomBar';
import { Tabs } from '@/app/components/ui/Tabs';
import { Button } from '@/app/components/ui/Button';

import { HeatmapCanvas } from '@/app/components/HeatmapCanvas';
import { TargetLanguageConfig } from '@/lib/types/language';
import { LanguageSelectorCard } from '@/app/components/studio/LanguageSelectorCard';
import { TargetRepoCard } from '@/app/components/studio/TargetRepoCard';
import { CommitStyleCard } from '@/app/components/studio/CommitStyleCard';
import { QuickRulesCard } from '@/app/components/studio/QuickRulesCard';
import { DeploymentControlHub, DeploymentStage } from '@/app/components/studio/DeploymentControlHub';
import { AmbientDeployIsland } from '@/app/components/studio/AmbientDeployIsland';

export default function DashboardPage() {
  const router = useRouter();

  // User & Repo State
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);

  // Studio Mode: 'canvas' (Visual 52-week Studio) vs 'standard' (Quick Rules)
  const [activeMode, setActiveMode] = useState<'canvas' | 'standard'>('canvas');

  // Schedule Configuration
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [repoOwner, setRepoOwner] = useState<string>('');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [branch, setBranch] = useState<string>('main');
  const [pushToRemote, setPushToRemote] = useState<boolean>(true);

  // Commit Message Customization
  const [messageStyle, setMessageStyle] = useState<CommitMessageStyle>('conventional');
  const [customMessagePrefix, setCustomMessagePrefix] = useState<string>('feat: ContraGit update');

  // Target Language & Linguist Masquerade Configuration
  const [languageConfig, setLanguageConfig] = useState<TargetLanguageConfig>({
    mode: 'preset',
    preset: 'fullstack',
  });

  // Weekday counts for Quick Rules mode
  const [weekdayCounts, setWeekdayCounts] = useState<WeekdayCounts>({
    monday: 5,
    tuesday: 5,
    wednesday: 5,
    thursday: 5,
    friday: 5,
    saturday: 0,
    sunday: 0,
  });

  // Canvas Matrix for Visual Studio mode
  const [customMatrix, setCustomMatrix] = useState<CustomCommitMatrix>({});

  const [activeFilter, setActiveFilter] = useState<FilterPreset>('all');
  const [activeOption, setActiveOption] = useState<FilterOption>('max');

  // Pre-flight calculation & deployment lifecycle state machine
  const [calculating, setCalculating] = useState<boolean>(false);
  const [calculation, setCalculation] = useState<ScheduleCalculation | null>(null);
  const [deploymentStage, setDeploymentStage] = useState<DeploymentStage>('idle');

  // Execution State & Batch Pipeline
  const [activeJob, setActiveJob] = useState<CommitJob | null>(null);
  const [startingJob, setStartingJob] = useState<boolean>(false);

  // Original GitHub contributions & protection
  const [existingContributions, setExistingContributions] = useState<Record<string, number>>({});
  const [protectExisting, setProtectExisting] = useState<boolean>(true);

  const isPausedRef = useRef<boolean>(false);
  const cancelRef = useRef<boolean>(false);
  const batchStateRef = useRef<{
    allCommits: CommitBatchItem[];
    currentIndex: number;
    lastCommitSha: string | null;
    lastTreeSha: string | null;
  } | null>(null);

  // Voluntary Social actions
  const [socialMessage, setSocialMessage] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Auth verification on load
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
          loadContributions();
        } else {
          router.replace('/auth');
        }
      })
      .catch(() => router.replace('/auth'));
  }, [router]);

  const loadRepositories = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch('/api/repos');
      const data = await res.json();
      const list = data.repositories || data.repos;
      if (data.success && Array.isArray(list) && list.length > 0) {
        setRepositories(list);
        if (!selectedRepo) {
          setSelectedRepo(list[0].name);
          setBranch(list[0].defaultBranch || 'main');
          if (list[0].owner) setRepoOwner(list[0].owner);
        }
      }
    } catch {
      // Fallback repo name if user has no repos yet
      if (!selectedRepo) setSelectedRepo('gitcontra');
    } finally {
      setLoadingRepos(false);
    }
  };

  const loadContributions = async () => {
    try {
      const res = await fetch('/api/contributions');
      const data = await res.json();
      if (data.success && data.contributions) {
        setExistingContributions(data.contributions);
      }
    } catch (err) {
      console.warn('Failed to load contributions:', err);
    }
  };

  const handleSelectRepo = (repoName: string) => {
    setSelectedRepo(repoName);
    const found = repositories.find((r) => r.name === repoName);
    if (found) {
      if (found.defaultBranch) setBranch(found.defaultBranch);
      if (found.owner) setRepoOwner(found.owner);
    }
  };

  const handleApplyFilter = (preset: FilterPreset, opt: FilterOption = 'max') => {
    setActiveFilter(preset);
    setActiveOption(opt);
    const newCounts = scheduleEngine.getFilterPresetCounts(preset, opt);
    setWeekdayCounts(newCounts);
  };

  // Live Stats calculations
  const totalCommitsInCanvas = useMemo(() => {
    return Object.values(customMatrix).reduce((acc, c) => acc + (c || 0), 0);
  }, [customMatrix]);

  const activeDaysInCanvas = useMemo(() => {
    return Object.values(customMatrix).filter(c => (c || 0) > 0).length;
  }, [customMatrix]);

  const originalActiveDays = useMemo(() => {
    return Object.keys(existingContributions).filter(d => (existingContributions[d] || 0) > 0).length;
  }, [existingContributions]);

  // Pre-flight calculation
  const handleCalculateSchedule = async () => {
    setCalculating(true);
    try {
      const lockedDates = Object.keys(existingContributions).filter(d => (existingContributions[d] || 0) > 0);
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          startDate,
          endDate,
          repoOwner: repoOwner || user?.login,
          repoName: selectedRepo,
          branch,
          pushToRemote,
          weekdayCounts,
          customMatrix,
          lockedDates,
          protectExisting,
        }),
      });

      const data = await res.json();
      const calcResult = data.calculation || data;
      if (data.success && calcResult) {
        setCalculation(calcResult);
        setDeploymentStage('review');
        // Smoothly bring the deployment cockpit into view
        const hubEl = document.getElementById('deployment-hub');
        if (hubEl) {
          hubEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        alert(data.message || 'Failed to calculate schedule');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to calculate schedule');
    } finally {
      setCalculating(false);
    }
  };

  // Batched Client Execution Loop
  const runBatchLoop = async (
    allCommits: CommitBatchItem[],
    startIndex: number,
    initialCommitSha: string | null,
    initialTreeSha: string | null
  ) => {
    const BATCH_SIZE = 5;
    let currentCommitSha = initialCommitSha;
    let currentTreeSha = initialTreeSha;
    let completed = startIndex;

    isPausedRef.current = false;
    cancelRef.current = false;

    try {
      for (let i = startIndex; i < allCommits.length; i += BATCH_SIZE) {
        if (cancelRef.current) {
          setActiveJob(prev => prev ? { ...prev, status: 'failed', error: 'Generation stopped by user.' } : null);
          return;
        }

        if (isPausedRef.current) {
          batchStateRef.current = {
            allCommits,
            currentIndex: completed,
            lastCommitSha: currentCommitSha,
            lastTreeSha: currentTreeSha,
          };
          setActiveJob(prev => prev ? { ...prev, status: 'paused', completed } : null);
          return;
        }

        const batch = allCommits.slice(i, i + BATCH_SIZE);

        const res = await fetch('/api/commit-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoOwner: repoOwner || user?.login,
            repoName: selectedRepo,
            branch,
            pushToRemote,
            parentCommitSha: currentCommitSha,
            baseTreeSha: currentTreeSha,
            batchIndex: Math.floor(i / BATCH_SIZE),
            totalCommits: allCommits.length,
            commits: batch,
            languageConfig,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Server error (status ${res.status}) on batch`);
        }

        completed += batch.length;
        currentCommitSha = data.lastCommitSha;
        currentTreeSha = data.lastTreeSha;

        // Keep batch checkpoint updated in ref
        batchStateRef.current = {
          allCommits,
          currentIndex: completed,
          lastCommitSha: currentCommitSha,
          lastTreeSha: currentTreeSha,
        };

        setActiveJob(prev => prev ? {
          ...prev,
          completed,
        } : null);
      }

      // Finished!
      setActiveJob(prev => prev ? {
        ...prev,
        status: 'completed',
        completed: allCommits.length,
        result: {
          message: `Successfully generated ${allCommits.length} commits!`,
          pushResult: {
            message: pushToRemote
              ? `Pushed ${allCommits.length} commits to ${repoOwner || user?.login}/${selectedRepo}:${branch}`
              : `Created ${allCommits.length} commits locally in tree (push disabled).`,
          },
        },
      } : null);
      setDeploymentStage('completed');
      batchStateRef.current = null;
    } catch (err: any) {
      console.warn('[ContraGit] Batch error or sleep interruption:', err);
      batchStateRef.current = {
        allCommits,
        currentIndex: completed,
        lastCommitSha: currentCommitSha,
        lastTreeSha: currentTreeSha,
      };

      setActiveJob(prev => prev ? {
        ...prev,
        status: 'paused',
        completed,
        error: `Connection paused or interrupted (${err.message || 'network drop'}). Saved ${completed} commits to GitHub.`,
      } : null);
      setDeploymentStage('paused');
    }
  };

  const handleConfirmAndStart = async () => {
    setStartingJob(true);
    setDeploymentStage('deploying');

    try {
      const lockedDates = Object.keys(existingContributions).filter(d => (existingContributions[d] || 0) > 0);
      const config = {
        mode: activeMode,
        startDate,
        endDate,
        repoOwner: repoOwner || user?.login,
        repoName: selectedRepo,
        branch,
        pushToRemote,
        weekdayCounts,
        customMatrix,
        messageStyle,
        customMessagePrefix,
        languageConfig,
        lockedDates,
        protectExisting,
      };

      const timestamps = scheduleEngine.generateCommitTimestamps(config);
      if (timestamps.length === 0) {
        throw new Error('No eligible commits found in configuration.');
      }

      const sampleMessages = [
        'feat: implement core workflow updates',
        'refactor: streamline data pipeline',
        'fix: resolve edge condition in event loop',
        'docs: update usage notes and api references',
        'perf: improve rendering efficiency',
        'chore: update workspace dependencies',
        'style: format code according to styleguide',
        'test: add regression test cases',
        'ci: optimize deployment workflow pipeline',
      ];

      const allCommits: CommitBatchItem[] = timestamps.map((date, i) => {
        const isoString = date.toISOString();
        const commitNum = i + 1;
        let message = '';
        if (config.messageStyle === 'minimal') {
          message = `Commit #${commitNum} — ${isoString.split('T')[0]}`;
        } else if (config.messageStyle === 'custom') {
          const prefix = config.customMessagePrefix?.trim() || 'update';
          message = `${prefix} #${commitNum} — ${isoString.split('T')[0]}`;
        } else {
          const randomMsg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
          message = `${randomMsg} [contra-#${commitNum}]`;
        }
        return {
          timestamp: isoString,
          message,
          fileIndex: commitNum,
        };
      });

      setActiveJob({
        id: `batch_${Date.now()}`,
        userLogin: user?.login || 'user',
        repository: `${repoOwner || user?.login}/${selectedRepo}`,
        dateRange: `${startDate} to ${endDate}`,
        total: allCommits.length,
        completed: 0,
        failed: 0,
        status: 'running',
        startTime: Date.now(),
      });

      await runBatchLoop(allCommits, 0, null, null);
    } catch (err: any) {
      alert(err.message || 'Failed to start generation job');
      setDeploymentStage('failed');
    } finally {
      setStartingJob(false);
    }
  };

  const handlePauseGeneration = () => {
    isPausedRef.current = true;
    setDeploymentStage('paused');
  };

  const handleResumeGeneration = async () => {
    if (!batchStateRef.current) return;
    const { allCommits, currentIndex, lastCommitSha, lastTreeSha } = batchStateRef.current;
    setActiveJob(prev => prev ? { ...prev, status: 'running', error: undefined } : null);
    setDeploymentStage('deploying');
    await runBatchLoop(allCommits, currentIndex, lastCommitSha, lastTreeSha);
  };

  const handleStopAndKeep = () => {
    batchStateRef.current = null;
    setDeploymentStage('idle');
    setActiveJob(null);
  };

  const handleCancelReview = () => {
    setDeploymentStage('idle');
  };

  const handleResetHub = () => {
    setDeploymentStage('idle');
    setActiveJob(null);
    setCalculation(null);
  };

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
      setSocialMessage(data.message || (action === 'star' ? 'Starred!' : 'Followed!'));
    } catch {
      setSocialMessage('Action failed or token lacked write permissions.');
    } finally {
      setSocialLoading(null);
      setTimeout(() => setSocialMessage(null), 5000);
    }
  };

  if (loadingAuth) {
    return (
      <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="brand-icon" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>⚡</div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Authenticating ContraGit session...
          </span>
        </div>
      </div>
    );
  }

  const effectiveTotal = activeMode === 'canvas' ? totalCommitsInCanvas : (calculation?.totalCommits || 0);
  const effectiveDays = activeMode === 'canvas' ? activeDaysInCanvas : (calculation?.eligibleDays || 0);

  return (
    <div className="page-container">
      {/* Ambient background atmosphere */}
      <div className="ambient-glow" />
      <div className="ambient-grid" />

      {/* Universal Responsive Header */}
      <AppHeader user={user} activeNav="dashboard" />

      {/* Main Studio Hub */}
      <main style={{ flex: 1 }}>
        {/* Studio Topbar: Mode Switcher & Live Stats */}
        <div className="cluster-between" style={{ marginBottom: '1.25rem' }}>
          <Tabs
            items={[
              { id: 'canvas' as const, label: 'Visual Canvas Studio', icon: <Palette size={16} /> },
              { id: 'standard' as const, label: 'Quick Rules Engine', icon: <Sliders size={16} /> },
            ]}
            activeId={activeMode}
            onChange={(m) => setActiveMode(m)}
          />

          {/* Desktop Summary Pill */}
          <div className="cluster" style={{ gap: '0.65rem' }}>
            {protectExisting && originalActiveDays > 0 && (
              <div className="stat-pill" style={{ borderColor: 'rgba(6, 182, 212, 0.4)', background: 'rgba(6, 182, 212, 0.08)' }}>
                <span className="stat-pill-label" style={{ color: 'var(--cyan-400)' }}>🔒 Preserved</span>
                <span className="stat-pill-val" style={{ color: 'var(--cyan-400)' }}>
                  {originalActiveDays} days
                </span>
              </div>
            )}
            <div className="stat-pill">
              <span className="stat-pill-label">Active Days</span>
              <span className="stat-pill-val" style={{ color: 'var(--emerald-400)' }}>
                {activeMode === 'canvas' ? activeDaysInCanvas : (calculation?.eligibleDays || '—')}
              </span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-label">Total Commits</span>
              <span className="stat-pill-val" style={{ color: 'var(--emerald-400)' }}>
                {activeMode === 'canvas' ? totalCommitsInCanvas : (calculation?.totalCommits || '—')}
              </span>
            </div>
          </div>
        </div>

        {/* Main Studio Stack */}
        <div className="studio-deck">
          {/* STEP 1: Top Context Panel — Target Repository Setup */}
          <TargetRepoCard
            repoOwner={repoOwner}
            onRepoOwnerChange={setRepoOwner}
            selectedRepo={selectedRepo}
            onSelectedRepoChange={handleSelectRepo}
            branch={branch}
            onBranchChange={setBranch}
            pushToRemote={pushToRemote}
            onPushToRemoteChange={setPushToRemote}
            repositories={repositories}
            loadingRepos={loadingRepos}
            onRefreshRepos={loadRepositories}
          />

          {/* STEP 2: Full-Width Centerpiece — The Contribution Canvas / Quick Rules */}
          <div style={{ width: '100%', minWidth: 0 }}>
            {activeMode === 'canvas' ? (
              <section aria-label="Visual Canvas Studio">
                <HeatmapCanvas
                  matrix={customMatrix}
                  onChange={(m) => setCustomMatrix(m)}
                  existingContributions={existingContributions}
                  protectExisting={protectExisting}
                  onToggleProtectExisting={setProtectExisting}
                />
              </section>
            ) : (
              <section aria-label="Quick Rules Engine">
                <QuickRulesCard
                  startDate={startDate}
                  onStartDateChange={setStartDate}
                  endDate={endDate}
                  onEndDateChange={setEndDate}
                  weekdayCounts={weekdayCounts}
                  onWeekdayCountsChange={setWeekdayCounts}
                  activeFilter={activeFilter}
                  onApplyFilter={handleApplyFilter}
                  activeOption={activeOption}
                />
              </section>
            )}
          </div>

          {/* STEP 3: Target Language & Linguist Masquerade Generator */}
          <LanguageSelectorCard
            config={languageConfig}
            onChange={setLanguageConfig}
          />

          {/* STEP 4: Configuration & Deploy Center (Balanced 2-Column Responsive Grid) */}
          <div className="studio-config-grid">
            {/* Left Column: Commit Message Styling */}
            <CommitStyleCard
              messageStyle={messageStyle}
              onMessageStyleChange={setMessageStyle}
              customPrefix={customMessagePrefix}
              onCustomPrefixChange={setCustomMessagePrefix}
            />

            {/* Right Column: Integrated Stateful Deployment Control Hub */}
            <DeploymentControlHub
              stage={deploymentStage}
              repoOwner={repoOwner || user?.login || 'user'}
              selectedRepo={selectedRepo}
              branch={branch}
              effectiveTotal={effectiveTotal}
              effectiveDays={effectiveDays}
              originalPreservedDays={originalActiveDays}
              activeMode={activeMode}
              languageConfig={languageConfig}
              calculation={calculation}
              calculating={calculating}
              job={activeJob}
              hasBatchState={Boolean(batchStateRef.current)}
              onReviewPlan={handleCalculateSchedule}
              onCancelReview={handleCancelReview}
              onConfirmAndDeploy={handleConfirmAndStart}
              onPause={handlePauseGeneration}
              onResume={handleResumeGeneration}
              onStopAndKeep={handleStopAndKeep}
              onReset={handleResetHub}
            />
          </div>

          {/* Voluntary Support / Social Feedback */}
          <div
            className="cluster-between"
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(10, 14, 23, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>ContraGit is open-source. Enjoying the tool? </span>
              {socialMessage && (
                <span className="mono" style={{ color: 'var(--emerald-400)', marginLeft: '0.5rem', fontWeight: 600 }}>
                  {socialMessage}
                </span>
              )}
            </div>

            <div className="cluster" style={{ gap: '0.5rem' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => triggerSocialAction('star')}
                disabled={socialLoading === 'star'}
                icon={<Star size={14} color="#f59e0b" fill="#f59e0b" />}
              >
                Star Project
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => triggerSocialAction('follow')}
                disabled={socialLoading === 'follow'}
                icon={<UserPlus size={14} />}
              >
                Follow Author
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Ambient Floating Mini-Island (visible when scrolled away during execution) */}
      <AmbientDeployIsland
        stage={deploymentStage}
        job={activeJob}
        repoOwner={repoOwner || user?.login || 'user'}
        selectedRepo={selectedRepo}
        branch={branch}
        onPause={handlePauseGeneration}
        onResume={handleResumeGeneration}
      />

      {/* Mobile Sticky Bottom Bar */}
      <MobileBottomBar
        totalCommits={effectiveTotal}
        activeDays={effectiveDays}
        onDeploy={handleCalculateSchedule}
        disabled={calculating || startingJob}
      />
    </div>
  );
}
