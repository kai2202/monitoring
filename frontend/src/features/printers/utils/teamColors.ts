/**
 * Frontend/src/features/printers/utils/teamColors.ts
 *
 * Bảng màu đại diện chuẩn cho 5 Ban/Team quản lý thiết bị:
 * - Dùng chung cho Dãy bàn trên Sơ đồ tầng, Khung tên màu Team, và Badge người/team chịu trách nhiệm máy in.
 */

export const MANAGING_TEAMS = [
  'Ban Quản trị Tổng vụ',
  'Đội Kỹ thuật CNTT (IT)',
  'Phòng Hành chính - Nhân sự',
  'Khối Vận hành Kinh doanh',
  'Phòng Kế toán Tài chính',
] as const;

export interface TeamStyle {
  name: string;
  shortName: string;
  color: string;
  bg: string;
  border: string;
  badgeBg: string;
}

const TEAM_STYLE_MAP: Record<string, TeamStyle> = {
  'Ban Quản trị Tổng vụ': {
    name: 'Ban Quản trị Tổng vụ',
    shortName: 'Tổng vụ',
    color: '#2563eb',
    bg: '#dbeafe',
    border: '#60a5fa',
    badgeBg: 'rgba(37, 99, 235, 0.14)',
  },
  'Đội Kỹ thuật CNTT (IT)': {
    name: 'Đội Kỹ thuật CNTT (IT)',
    shortName: 'CNTT (IT)',
    color: '#7c3aed',
    bg: '#ede9fe',
    border: '#a78bfa',
    badgeBg: 'rgba(124, 58, 237, 0.14)',
  },
  'Phòng Hành chính - Nhân sự': {
    name: 'Phòng Hành chính - Nhân sự',
    shortName: 'Hành chính - NS',
    color: '#0d9488',
    bg: '#ccfbf1',
    border: '#2dd4bf',
    badgeBg: 'rgba(13, 148, 136, 0.14)',
  },
  'Khối Vận hành Kinh doanh': {
    name: 'Khối Vận hành Kinh doanh',
    shortName: 'Kinh doanh',
    color: '#ea580c',
    bg: '#ffedd5',
    border: '#fb923c',
    badgeBg: 'rgba(234, 88, 12, 0.14)',
  },
  'Phòng Kế toán Tài chính': {
    name: 'Phòng Kế toán Tài chính',
    shortName: 'Kế toán TC',
    color: '#db2777',
    bg: '#fce7f3',
    border: '#f472b6',
    badgeBg: 'rgba(219, 39, 119, 0.14)',
  },
};

const FALLBACK_TEAM_STYLE: TeamStyle = {
  name: 'Chưa gán Team',
  shortName: 'Chưa gán',
  color: '#64748b',
  bg: '#f8fafc',
  border: '#cbd5e1',
  badgeBg: 'rgba(100, 116, 139, 0.12)',
};

export function getTeamStyle(teamName?: string | null): TeamStyle {
  if (!teamName) return FALLBACK_TEAM_STYLE;
  if (TEAM_STYLE_MAP[teamName]) return TEAM_STYLE_MAP[teamName];
  return {
    ...FALLBACK_TEAM_STYLE,
    name: teamName,
    shortName: teamName,
  };
}
