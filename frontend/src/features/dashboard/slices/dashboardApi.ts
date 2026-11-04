/**
 * Frontend/src/features/dashboard/slices/dashboardApi.ts
 *
 * RTK Query API Slice cho phân hệ Dashboard:
 * - Cache KPI tổng quan, danh sách cảnh báo cần chú ý.
 */

import { baseApi } from '../../../app/api/baseApi';
import { dashboardService } from '../../../services';
import { DashboardStats } from '../../../types/printer';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      queryFn: async () => {
        try {
          const data = await dashboardService.getStats();
          return { data };
        } catch (error) {
          return { error: { status: 500, data: (error as Error).message } };
        }
      },
      providesTags: [{ type: 'Printers', id: 'DASHBOARD_STATS' }],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;

