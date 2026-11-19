import { z } from 'zod';

export const zabbixConfigSchema = z.object({
  apiUrl: z.string().url('URL Zabbix API không đúng định dạng (ví dụ: http://zabbix.lan/api_jsonrpc.php)'),
  apiToken: z.string().min(10, 'API Token phải chứa ít nhất 10 ký tự'),
  scrapeIntervalSeconds: z.number().min(10, 'Tần suất thu thập tối thiểu 10 giây').max(3600, 'Tần suất tối đa 3600 giây'),
  requestTimeoutSeconds: z.number().min(3, 'Thời gian timeout tối thiểu 3 giây').max(60, 'Timeout tối đa 60 giây'),
  enableSnmpDiscovery: z.boolean().default(true),
  autoCreateTasks: z.boolean().default(true),
});

export type ZabbixConfigFormData = z.infer<typeof zabbixConfigSchema>;

