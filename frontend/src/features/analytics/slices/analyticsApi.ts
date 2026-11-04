/**
 * Frontend/src/features/analytics/slices/analyticsApi.ts
 *
 * RTK Query API Slice cho phân hệ Analytics (Sản lượng, Dự báo vật tư, SLA & Chi phí).
 */

import { baseApi } from '../../../app/api/baseApi';
import {
  MOCK_PRINTER_DEFINITIONS,
  MOCK_CONSUMABLE_ALERTS,
  MOCK_SLA_OVERVIEW_KPIS,
  MOCK_DEPARTMENT_COSTS,
} from '../../../mocks/mockAnalyticsUIData';
import { AnalyticsTimeframe } from '../../../types/analyticsUI';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFleetAnalyticsSummary: builder.query<{ totalVolume: number }, AnalyticsTimeframe>({
      queryFn: (timeframe) => {
        const total = MOCK_PRINTER_DEFINITIONS.reduce((acc, d) => {
          const vol =
            timeframe === 'hourly'
              ? d.baseHourly.reduce((a, b) => a + b, 0)
              : timeframe === '7days'
              ? d.base7Days.reduce((a, b) => a + b, 0)
              : d.base30Days.reduce((a, b) => a + b, 0);
          return acc + vol;
        }, 0);
        return { data: { totalVolume: total } };
      },
      providesTags: [{ type: 'Analytics', id: 'SUMMARY' }],
    }),

    getConsumablesForecast: builder.query<typeof MOCK_CONSUMABLE_ALERTS, void>({
      queryFn: () => ({ data: MOCK_CONSUMABLE_ALERTS }),
      providesTags: [{ type: 'Analytics', id: 'SUPPLIES' }],
    }),

    getSLACostSummary: builder.query<
      { kpis: typeof MOCK_SLA_OVERVIEW_KPIS; departments: typeof MOCK_DEPARTMENT_COSTS },
      void
    >({
      queryFn: () => ({
        data: {
          kpis: MOCK_SLA_OVERVIEW_KPIS,
          departments: MOCK_DEPARTMENT_COSTS,
        },
      }),
      providesTags: [{ type: 'Analytics', id: 'SLA_COST' }],
    }),
  }),
});

export const {
  useGetFleetAnalyticsSummaryQuery,
  useGetConsumablesForecastQuery,
  useGetSLACostSummaryQuery,
} = analyticsApi;

