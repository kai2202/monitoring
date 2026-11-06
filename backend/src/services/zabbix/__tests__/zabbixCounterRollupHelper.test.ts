/**
 * Backend/src/services/zabbix/__tests__/zabbixCounterRollupHelper.test.ts
 *
 * Unit tests kiểm thử bộ xử lý tràn bộ đếm SNMP 32-bit (`Counter32` rollover),
 * reset bo mạch formatter và ánh xạ chính xác Zabbix Trigger Host sang thiết bị đích.
 */

import { describe, expect, it } from 'vitest';
import { computeSafeCounterDelta, resolveProblemPrinter } from '../zabbixCounterRollupHelper';
import { ZabbixProblem, ZabbixTrigger } from '../../../types/zabbixTypes';

describe('zabbixCounterRollupHelper', () => {
  describe('computeSafeCounterDelta', () => {
    it('trả về 0 khi chưa có mốc đối chiếu trước đó (prevVal = null)', () => {
      expect(computeSafeCounterDelta(12500, null)).toBe(0);
    });

    it('tính chính xác độ lệch dương khi bộ đếm tăng tuyến tính', () => {
      expect(computeSafeCounterDelta(15450, 15200)).toBe(250);
    });

    it('xử lý chính xác hiện tượng tràn bộ đếm SNMP 32-bit unsigned (Counter32 Rollover)', () => {
      // 4,294,967,296 - 4,294,967,000 + 320 = 296 + 320 = 616 trang
      expect(computeSafeCounterDelta(320, 4_294_967_000)).toBe(616);
    });

    it('trả về 0 an toàn khi thay bo mạch formatter làm reset bộ đếm về nhỏ (không âm)', () => {
      expect(computeSafeCounterDelta(120, 850_000)).toBe(0);
    });
  });

  describe('resolveProblemPrinter', () => {
    const samplePrinters = [
      {
        id: 'PRN-RICOH-01',
        name: 'Ricoh IM C4500 Tầng 1',
        ip: '10.10.1.11',
        mfr: 'RICOH',
        zabbixHostId: '10501',
      },
      {
        id: 'PRN-CANON-02',
        name: 'Canon iR-ADV C5550i Tầng 3',
        ip: '10.10.3.22',
        mfr: 'CANON',
        zabbixHostId: '10502',
      },
    ];

    it('ánh xạ chính xác sự cố về đúng máy in thứ 2 qua Trigger zabbixHostId (không gán nhầm máy đầu tiên)', () => {
      const problem: ZabbixProblem = {
        eventid: '9901',
        objectid: '5002',
        name: 'Fuser Unit Error E000007-0000',
        severity: '4',
        clock: '1762400000',
      };
      const triggerMap = new Map<string, ZabbixTrigger>([
        [
          '5002',
          {
            triggerid: '5002',
            description: 'Fuser Unit Error',
            priority: '4',
            value: '1',
            lastchange: '1762400000',
            hosts: [{ hostid: '10502', host: 'PRN-CANON-02', name: 'Canon iR-ADV C5550i Tầng 3' }],
          },
        ],
      ]);

      const resolved = resolveProblemPrinter(problem, triggerMap, samplePrinters);
      expect(resolved).not.toBeNull();
      expect(resolved?.id).toBe('PRN-CANON-02');
      expect(resolved?.mfr).toBe('CANON');
    });

    it('trả về null thay vì gán bừa cho dbPrinters[0] khi sự cố thuộc thiết bị ngoài danh mục', () => {
      const problem: ZabbixProblem = {
        eventid: '9902',
        objectid: '5999',
        name: 'Core Switch Port Gi0/1 Down',
        severity: '5',
        clock: '1762400100',
      };
      const triggerMap = new Map<string, ZabbixTrigger>([
        [
          '5999',
          {
            triggerid: '5999',
            description: 'Switch Port Down',
            priority: '5',
            value: '1',
            lastchange: '1762400100',
            hosts: [{ hostid: '99999', host: 'SW-CORE-01', name: 'Core Switch' }],
          },
        ],
      ]);

      const resolved = resolveProblemPrinter(problem, triggerMap, samplePrinters);
      expect(resolved).toBeNull();
    });
  });
});

