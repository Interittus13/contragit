import { 
  Weekday, 
  WeekdayCounts, 
  ScheduleConfig, 
  ScheduleCalculation, 
  FilterPreset, 
  FilterOption 
} from '../types/scheduler';

export class ScheduleEngine {
  public static readonly WEEKDAY_INDEX_MAP: Record<Weekday, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  public static readonly INDEX_TO_WEEKDAY: Record<number, Weekday> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  public getDefaultWeekdayCounts(): WeekdayCounts {
    return {
      monday: 5,
      tuesday: 5,
      wednesday: 5,
      thursday: 5,
      friday: 5,
      saturday: 0,
      sunday: 0,
    };
  }

  public getFilterPresetCounts(preset: FilterPreset, option: FilterOption = 'max'): WeekdayCounts {
    const value = option === 'min' ? 1 : 5;
    const result: WeekdayCounts = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    const days: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    days.forEach(day => {
      const dayNum = ScheduleEngine.WEEKDAY_INDEX_MAP[day];
      let match = false;

      if (preset === 'all') {
        match = true;
      } else if (preset === 'even') {
        match = dayNum !== 0 && dayNum % 2 === 0;
      } else if (preset === 'odd') {
        match = dayNum === 0 || dayNum % 2 === 1;
      } else if (preset === 'custom') {
        // Random 0 to 5
        result[day] = Math.floor(Math.random() * 6);
        return;
      }

      result[day] = match ? value : 0;
    });

    return result;
  }

  public calculate(config: ScheduleConfig): ScheduleCalculation {
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);

    const counts: WeekdayCounts = {
      ...this.getDefaultWeekdayCounts(),
      ...(config.weekdayCounts || {}),
    };

    let totalCommits = 0;
    let eligibleDays = 0;
    const dailyBreakdown: WeekdayCounts = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dayName = ScheduleEngine.INDEX_TO_WEEKDAY[cur.getDay()];
      const dayCount = Math.max(0, counts[dayName] || 0);

      if (dayCount > 0) {
        eligibleDays++;
        dailyBreakdown[dayName] += dayCount;
        totalCommits += dayCount;
      }

      cur.setDate(cur.getDate() + 1);
    }

    const estimatedSeconds = Math.max(3, Math.round(totalCommits * 1.5));
    const repoLabel = `${config.repoOwner || 'user'}/${config.repoName || 'repository'}`;

    return {
      repository: repoLabel,
      dateRange: `${startDate.toDateString()} to ${endDate.toDateString()}`,
      eligibleDays,
      totalCommits,
      dailyBreakdown,
      estimatedSeconds,
    };
  }

  public generateCommitTimestamps(config: ScheduleConfig): Date[] {
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);

    const counts: WeekdayCounts = {
      ...this.getDefaultWeekdayCounts(),
      ...(config.weekdayCounts || {}),
    };

    const timestamps: Date[] = [];
    const cur = new Date(startDate);

    while (cur <= endDate) {
      const dayName = ScheduleEngine.INDEX_TO_WEEKDAY[cur.getDay()];
      const dayCount = Math.max(0, counts[dayName] || 0);

      for (let i = 0; i < dayCount; i++) {
        const commitDate = new Date(cur);
        // Distribute commit hours between 09:00 and 20:00 organically
        const hour = 9 + Math.floor((11 / Math.max(1, dayCount)) * i);
        const minute = Math.floor(Math.random() * 59);
        const second = Math.floor(Math.random() * 59);

        commitDate.setHours(hour, minute, second, 0);
        timestamps.push(commitDate);
      }

      cur.setDate(cur.getDate() + 1);
    }

    return timestamps;
  }
}

export const scheduleEngine = new ScheduleEngine();
