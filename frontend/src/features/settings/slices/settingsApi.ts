/**
 * Frontend/src/features/settings/slices/settingsApi.ts
 *
 * RTK Query API Slice cho phân hệ Cấu hình hệ thống (Zabbix & Từ điển mã lỗi).
 */

import { baseApi } from '../../../app/api/baseApi';
import { settingsService } from '../../../services';
import { ZabbixConfig } from '../../../types/settings';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getZabbixConfig: builder.query<ZabbixConfig, void>({
      queryFn: async () => {
        try {
          const data = await settingsService.getZabbixConfig();
          return { data };
        } catch (error) {
          return { error: { status: 500, data: (error as Error).message } };
        }
      },
      providesTags: [{ type: 'Settings', id: 'ZABBIX_CONFIG' }],
    }),

    updateZabbixConfig: builder.mutation<ZabbixConfig, Partial<ZabbixConfig>>({
      queryFn: async (config) => {
        try {
          const data = await settingsService.updateZabbixConfig(config);
          return { data };
        } catch (error) {
          return { error: { status: 500, data: (error as Error).message } };
        }
      },
      invalidatesTags: [{ type: 'Settings', id: 'ZABBIX_CONFIG' }],
    }),
  }),
});

export const { useGetZabbixConfigQuery, useUpdateZabbixConfigMutation } = settingsApi;

