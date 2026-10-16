import { describe, it, expect } from 'vitest';
import { ScheduleEngine } from '../lib/services/ScheduleEngine';

describe('ScheduleEngine', () => {
  const engine = new ScheduleEngine();

  describe('getDefaultWeekdayCounts', () => {
    it('provides standard Monday-Friday 5 commits each, 0 on weekends', () => {
      const defaults = engine.getDefaultWeekdayCounts();
      expect(defaults.monday).toBe(5);
      expect(defaults.tuesday).toBe(5);
      expect(defaults.wednesday).toBe(5);
      expect(defaults.thursday).toBe(5);
      expect(defaults.friday).toBe(5);
      expect(defaults.saturday).toBe(0);
      expect(defaults.sunday).toBe(0);
    });
  });

  describe('getFilterPresetCounts', () => {
    it('returns 5 for all days with preset "all" and option "max"', () => {
      const counts = engine.getFilterPresetCounts('all', 'max');
      expect(counts.monday).toBe(5);
      expect(counts.sunday).toBe(5);
    });

    it('returns 1 for all days with preset "all" and option "min"', () => {
      const counts = engine.getFilterPresetCounts('all', 'min');
      expect(counts.monday).toBe(1);
      expect(counts.friday).toBe(1);
    });

    it('returns even day counts with preset "even"', () => {
      // tuesday (2), thursday (4), saturday (6)
      const counts = engine.getFilterPresetCounts('even', 'max');
      expect(counts.tuesday).toBe(5);
      expect(counts.thursday).toBe(5);
      expect(counts.saturday).toBe(5);
      expect(counts.monday).toBe(0);
      expect(counts.wednesday).toBe(0);
    });

    it('returns randomized counts within ceiling for preset "random"', () => {
      const countsMax = engine.getFilterPresetCounts('random', 'max');
      Object.values(countsMax).forEach(val => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(10);
      });

      const countsMin = engine.getFilterPresetCounts('random', 'min');
      Object.values(countsMin).forEach(val => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('calculate', () => {
    it('calculates total commits and eligible days accurately for weekday mode', () => {
      const config = {
        startDate: '2024-01-01', // Mon
        endDate: '2024-01-07',   // Sun
        weekdayCounts: {
          monday: 3,
          tuesday: 2,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0,
        },
      };

      const result = engine.calculate(config);
      expect(result.eligibleDays).toBe(2);
      expect(result.totalCommits).toBe(5);
      expect(result.dailyBreakdown.monday).toBe(3);
      expect(result.dailyBreakdown.tuesday).toBe(2);
      expect(result.estimatedSeconds).toBeGreaterThan(0);
    });

    it('calculates stats for canvas matrix mode correctly', () => {
      const matrix = {
        '2024-01-01': 4,
        '2024-01-02': 2,
        '2024-01-03': 0,
      };

      const result = engine.calculate({
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        mode: 'canvas',
        customMatrix: matrix,
      });

      expect(result.eligibleDays).toBe(2);
      expect(result.totalCommits).toBe(6);
    });
  });

  describe('generateCommitTimestamps', () => {
    it('generates the exact count of timestamps matching the schedule', () => {
      const config = {
        startDate: '2024-01-01', // Mon
        endDate: '2024-01-02',   // Tue
        weekdayCounts: {
          monday: 2,
          tuesday: 3,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0,
        },
      };

      const timestamps = engine.generateCommitTimestamps(config);
      expect(timestamps).toHaveLength(5);
      timestamps.forEach(ts => {
        expect(ts).toBeInstanceOf(Date);
        expect(ts.getHours()).toBeGreaterThanOrEqual(9);
      });
    });

    it('generates timestamps correctly from canvas matrix', () => {
      const timestamps = engine.generateCommitTimestamps({
        startDate: '',
        endDate: '',
        mode: 'canvas',
        customMatrix: {
          '2024-05-10': 3,
          '2024-05-11': 2,
        },
      });

      expect(timestamps).toHaveLength(5);
    });
  });
});
