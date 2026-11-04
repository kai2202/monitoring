/**
 * Frontend/src/features/printers/slices/printersApi.ts
 *
 * RTK Query API Slice cho phân hệ Máy in & Task công việc:
 * - Tự động cache & tag invalidation khi tạo/cập nhật task.
 */

import { baseApi } from '../../../app/api/baseApi';
import { Printer } from '../../../types/printer';
import { Task } from '../../../types/task';
import { printerService, taskService } from '../../../services';

export const printersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrinters: builder.query<Printer[], void>({
      queryFn: async () => {
        try {
          const data = await printerService.getPrinters();
          return { data };
        } catch (error) {
          return { error: { status: 500, data: (error as Error).message } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Printers' as const, id })), { type: 'Printers', id: 'LIST' }]
          : [{ type: 'Printers', id: 'LIST' }],
    }),

    getPrinterById: builder.query<Printer | null, string>({
      queryFn: async (id) => {
        try {
          const data = await printerService.getPrinterById(id);
          return { data };
        } catch (error) {
          return { error: { status: 404, data: (error as Error).message } };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Printers', id }],
    }),

    getTasks: builder.query<Task[], void>({
      queryFn: async () => {
        try {
          const data = await taskService.getTasks();
          return { data };
        } catch (error) {
          return { error: { status: 500, data: (error as Error).message } };
        }
      },
      providesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),

    createTask: builder.mutation<Task, Partial<Task>>({
      queryFn: async (taskPayload) => {
        try {
          const data = await taskService.createTask(taskPayload as any);
          return { data };
        } catch (error) {
          return { error: { status: 500, data: (error as Error).message } };
        }
      },
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPrintersQuery,
  useGetPrinterByIdQuery,
  useGetTasksQuery,
  useCreateTaskMutation,
} = printersApi;

