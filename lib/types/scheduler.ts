export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type WeekdayCounts = Record<Weekday, number>;

export type FilterPreset = 'all' | 'even' | 'odd' | 'custom';
export type FilterOption = 'min' | 'max';

export type CustomCommitMatrix = Record<string, number>; // key: YYYY-MM-DD -> commit count (0..20)

export type CommitMessageStyle = 'conventional' | 'minimal' | 'custom';

export interface ScheduleConfig {
  mode?: 'standard' | 'canvas';
  startDate: string;
  endDate: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  pushToRemote?: boolean;
  weekdayCounts?: Partial<WeekdayCounts>;
  filterPreset?: FilterPreset;
  customMatrix?: CustomCommitMatrix;
  messageStyle?: CommitMessageStyle;
  customMessagePrefix?: string;
}

export interface ScheduleCalculation {
  repository: string;
  dateRange: string;
  eligibleDays: number;
  totalCommits: number;
  dailyBreakdown: WeekdayCounts;
  estimatedSeconds: number;
}

export interface CommitJob {
  id: string;
  userLogin: string;
  repository: string;
  dateRange: string;
  total: number;
  completed: number;
  failed: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  result?: {
    message: string;
    pushResult?: {
      message: string;
    };
  };
  startTime: number;
}
