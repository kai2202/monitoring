import { z } from 'zod';

export const taskCreateSchema = z.object({
  title: z.string().min(3, 'Tiêu đề công việc phải có ít nhất 3 ký tự'),
  type: z.enum(['maintenance', 'incident', 'inspection', 'toner_replace'], {
    errorMap: () => ({ message: 'Vui lòng chọn loại công việc hợp lệ' }),
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Vui lòng chọn mức độ ưu tiên' }),
  }),
  assignedTo: z.string().min(2, 'Vui lòng nhập tên kỹ sư tiếp nhận'),
  printerId: z.string().min(1, 'Vui lòng chọn máy in áp dụng'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Vui lòng chọn ngày đến hạn'),
});

export type TaskCreateFormData = z.infer<typeof taskCreateSchema>;

