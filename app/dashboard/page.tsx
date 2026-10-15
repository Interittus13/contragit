'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Compass, 
  GitCommit, 
  Palette, 
  Play, 
  Sparkles, 
  Sliders, 
  Star, 
  UserPlus 
} from 'lucide-react';

import { 
  Weekday, 
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
import { Badge } from '@/app/components/ui/Badge';
import { Card } from '@/app/components/ui/Card';

import { HeatmapCanvas } from '@/app/components/HeatmapCanvas';
import { TargetRepoCard } from '@/app/components/studio/TargetRepoCard';
import { CommitStyleCard } from '@/app/components/studio/CommitStyleCard';
import { QuickRulesCard } from '@/app/components/studio/QuickRulesCard';
import { BatchProgressModal } from '@/app/components/studio/BatchProgressModal';

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

  // Pre-flight calculation & summary modal
  const [calculating, setCalculating] = useState<boolean>(false);
  const [calculation, setCalculation] = useState<ScheduleCalculation | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Execution State & Batch Pipeline
  const [activeJob, setActiveJob] = useState<CommitJob | null>(null);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [startingJob, setStartingJob] = useState<boolean>(false);

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
      if (data.success && Array.isArray(data.repositories)) {
        setRepositories(data.repositories);
        if (data.repositories.length > 0 && !selectedRepo) {
          setSelectedRepo(data.repositories[0].name);
          setBranch(data.repositories[0].defaultBranch || 'main');
        }
      }
    } catch {
      // Fallback repo name if user has no repos yet
      if (!selectedRepo) setSelectedRepo('gitcontra');
    } finally {
      setLoadingRepos(false);
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

  // Pre-flight calculation
  const handleCalculateSchedule = async () => {
    setCalculating(true);
    try {
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
        }),
      });

      const data = await res.json();
      if (data.success && data.calculation) {
        setCalculation(data.calculation);
        setShowSummaryModal(true);
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
    }
  };

  const handleConfirmAndStart = async () => {
    setShowSummaryModal(false);
    setStartingJob(true);
    setShowProgressModal(true);

    try {
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
      setShowProgressModal(false);
    } finally {
      setStartingJob(false);
    }
  };

  const handlePauseGeneration = () => {
    isPausedRef.current = true;
  };

  const handleResumeGeneration = async () => {
    if (!batchStateRef.current) return;
    const { allCommits, currentIndex, lastCommitSha, lastTreeSha } = batchStateRef.current;
    setActiveJob(prev => prev ? { ...prev, status: 'running', error: undefined } : null);
    await runBatchLoop(allCommits, currentIndex, lastCommitSha, lastTreeSha);
  };

  const handleStopAndKeep = () => {
    batchStateRef.current = null;
    setShowProgressModal(false);
    setActiveJob(null);
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
      {/* Universal Responsive Header */}
      <AppHeader user={user} activeNav="dashboard" />

      {/* Main Studio Hub */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', flex: 1 }}>
        {/* Studio Topbar: Mode Switcher & Live Stats */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <Tabs
            items={[
              { id: 'canvas' as const, label: 'Visual Canvas Studio', icon: <Palette size={16} /> },
              { id: 'standard' as const, label: 'Quick Rules Engine', icon: <Sliders size={16} /> },
            ]}
            activeId={activeMode}
            onChange={(m) => setActiveMode(m)}
          />

          {/* Desktop Summary Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(10, 14, 23, 0.75)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Days:</span>
              <span className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
                {activeMode === 'canvas' ? activeDaysInCanvas : (calculation?.eligibleDays || '—')}
              </span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Commits:</span>
              <span className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
                {activeMode === 'canvas' ? totalCommitsInCanvas : (calculation?.totalCommits || '—')}
              </span>
            </div>
          </div>
        </div>

        {/* Studio Canvas Area (when in Canvas mode) */}
        {activeMode === 'canvas' ? (
          <section>
            <HeatmapCanvas
              matrix={customMatrix}
              onChange={(m) => setCustomMatrix(m)}
            />
          </section>
        ) : (
          <section>
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

        {/* Configuration Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <TargetRepoCard
            repoOwner={repoOwner}
            onRepoOwnerChange={setRepoOwner}
            selectedRepo={selectedRepo}
            onSelectedRepoChange={setSelectedRepo}
            branch={branch}
            onBranchChange={setBranch}
            pushToRemote={pushToRemote}
            onPushToRemoteChange={setPushToRemote}
            repositories={repositories}
            loadingRepos={loadingRepos}
            onRefreshRepos={loadRepositories}
          />

          <CommitStyleCard
            messageStyle={messageStyle}
            onMessageStyleChange={setMessageStyle}
            customPrefix={customMessagePrefix}
            onCustomPrefixChange={setCustomMessagePrefix}
          />
        </section>

        {/* Desktop Deploy Action Card */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
            border: '1px solid var(--border-active)',
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Ready to Author Contribution History?
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Target: <code className="mono" style={{ color: 'var(--emerald-400)' }}>{repoOwner}/{selectedRepo}:{branch}</code> • {effectiveTotal} planned commits
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCalculateSchedule}
              disabled={calculating || startingJob || (activeMode === 'canvas' && totalCommitsInCanvas === 0)}
              loading={calculating}
              iconRight={<Play size={16} fill="currentColor" />}
            >
              Review & Deploy
            </Button>
          </div>
        </div>

        {/* Voluntary Support / Social Feedback */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
      </main>

      {/* Pre-Flight Review Modal */}
      {showSummaryModal && calculation && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <GitCommit size={22} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Schedule Pre-Flight Summary</h3>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mode:</span>
                <span className="mono" style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>
                  {activeMode === 'canvas' ? '🎨 Visual Canvas Studio' : '⚡ Quick Rules'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target:</span>
                <span className="mono" style={{ color: 'var(--emerald-400)' }}>{calculation.repository} ({branch})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date Coverage:</span>
                <span>{calculation.dateRange}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Active Days:</span>
                <span>{calculation.eligibleDays} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Commits to Author:</span>
                <strong style={{ color: 'var(--emerald-400)', fontSize: '1rem' }}>{calculation.totalCommits} commits</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Execution Pipeline:</span>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Stateless Micro-Batches (~{Math.ceil(calculation.totalCommits / 5)} requests)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowSummaryModal(false)}
              >
                Back / Edit
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmAndStart}
              >
                Confirm & Deploy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Batched Execution Modal */}
      <BatchProgressModal
        job={activeJob}
        repoOwner={repoOwner || user?.login || 'user'}
        selectedRepo={selectedRepo}
        branch={branch}
        hasBatchState={Boolean(batchStateRef.current)}
        onPause={handlePauseGeneration}
        onResume={handleResumeGeneration}
        onStopAndKeep={handleStopAndKeep}
        onClose={() => {
          setShowProgressModal(false);
          setActiveJob(null);
        }}
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
