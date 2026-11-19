import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'Backend/.env') });
import { zabbixApiClient } from '../src/services/zabbix/zabbixApiClient';
import fs from 'fs';

async function main() {
  const problems = await zabbixApiClient.getActiveProblems();
  const triggerIds = problems.map(p => p.objectid);
  const triggers = triggerIds.length ? await zabbixApiClient.getTriggersByIds(triggerIds) : [];
  fs.writeFileSync('Backend/scripts/problems_debug.json', JSON.stringify({ problems, triggers }, null, 2));
}
main().catch(e => fs.writeFileSync('Backend/scripts/problems_debug.json', String(e)));

