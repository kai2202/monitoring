import { describe, it, expect, vi } from 'vitest';
import { PrinterDataService, classifyProblem, isPaperMissingAlert } from '../printerDataService.js';

describe('classifyProblem - Severity and Category classification', () => {
  it('classifies out-of-paper alerts as Warning ("cảnh báo") and Paper / Tray category', () => {
    const result1 = classifyProblem('Printer Hardware Error: No Paper: Tray 3 {13400}', '4');
    expect(result1.alertSeverity).toBe('warning');
    expect(result1.incidentSeverity).toBe('Warning');
    expect(result1.category).toBe('Paper / Tray');
    expect(result1.cleanName).toBe('No Paper: Tray 3 {13400}');

    const result2 = classifyProblem('Printer Warning: Tray 1 empty', '3');
    expect(result2.alertSeverity).toBe('warning');
    expect(result2.incidentSeverity).toBe('Warning');
    expect(result2.category).toBe('Paper / Tray');

    const result3 = classifyProblem('Out of paper: Bypass Tray', '4');
    expect(result3.alertSeverity).toBe('warning');
    expect(result3.incidentSeverity).toBe('Warning');
    expect(result3.category).toBe('Paper / Tray');

    const result4 = classifyProblem('Máy in hết giấy khay 2', '4');
    expect(result4.alertSeverity).toBe('warning');
    expect(result4.incidentSeverity).toBe('Warning');
    expect(result4.category).toBe('Paper / Tray');
  });

  it('classifies toner and supply alerts as Warning ("cảnh báo") and Supply Alert category', () => {
    const result1 = classifyProblem('Waste toner container is almost full (Waste Toner >= 90%)', '4');
    expect(result1.alertSeverity).toBe('warning');
    expect(result1.incidentSeverity).toBe('Warning');
    expect(result1.category).toBe('Supply Alert');

    const result2 = classifyProblem('Supply is empty: Black Toner (<= 2%)', '4');
    expect(result2.alertSeverity).toBe('warning');
    expect(result2.incidentSeverity).toBe('Warning');
    expect(result2.category).toBe('Supply Alert');

    const result3 = classifyProblem('Supply level is low: Cyan Toner (< 15%)', '2');
    expect(result3.alertSeverity).toBe('warning');
    expect(result3.incidentSeverity).toBe('Warning');
    expect(result3.category).toBe('Supply Alert');

    const result4 = classifyProblem('Sắp hết mực thải', '3');
    expect(result4.alertSeverity).toBe('warning');
    expect(result4.incidentSeverity).toBe('Warning');
    expect(result4.category).toBe('Supply Alert');
  });

  it('classifies other hardware components as Critical ("khẩn cấp")', () => {
    // SC service codes
    const result1 = classifyProblem('Printer Hardware Error: SC542 Fusing temperature warm-up error {15000}', '4');
    expect(result1.alertSeverity).toBe('critical');
    expect(result1.incidentSeverity).toBe('Critical');
    expect(result1.category).toBe('Hardware Error');
    expect(result1.cleanName).toBe('SC542 Fusing temperature warm-up error {15000}');

    // Scanner error
    const result2 = classifyProblem('Printer Hardware Error: Scanner Error {16000}', '4');
    expect(result2.alertSeverity).toBe('critical');
    expect(result2.incidentSeverity).toBe('Critical');
    expect(result2.category).toBe('Hardware Error');

    // Motor error
    const result3 = classifyProblem('Printer Hardware Error: Polygon motor failure', '4');
    expect(result3.alertSeverity).toBe('critical');
    expect(result3.incidentSeverity).toBe('Critical');
    expect(result3.category).toBe('Hardware Error');

    // Laser / optical error
    const result4 = classifyProblem('Printer Hardware Error: Laser diode malfunction', '4');
    expect(result4.alertSeverity).toBe('critical');
    expect(result4.incidentSeverity).toBe('Critical');
    expect(result4.category).toBe('Hardware Error');

    // Door / cover open
    const result5 = classifyProblem('Printer Hardware Error: Cover Open: Front Door {10100}', '4');
    expect(result5.alertSeverity).toBe('critical');
    expect(result5.incidentSeverity).toBe('Critical');
    expect(result5.category).toBe('Hardware Error');
  });

  it('classifies paper jams as Critical and Paper Jam category', () => {
    const result = classifyProblem('Printer Hardware Error: Paper Jam: Duplex Unit {11000}', '4');
    expect(result.alertSeverity).toBe('critical');
    expect(result.incidentSeverity).toBe('Critical');
    expect(result.category).toBe('Paper Jam');
    expect(result.cleanName).toBe('Paper Jam: Duplex Unit {11000}');
  });

  it('classifies connectivity failures as Critical and Connectivity category', () => {
    const result = classifyProblem('Printer is unreachable (ICMP ping failed)', '5');
    expect(result.alertSeverity).toBe('critical');
    expect(result.incidentSeverity).toBe('Critical');
    expect(result.category).toBe('Connectivity');
  });

  it('classifies informational alerts (reboot, info) as clear / Info', () => {
    const result = classifyProblem('Printer has just rebooted', '1');
    expect(result.alertSeverity).toBe('clear');
    expect(result.incidentSeverity).toBe('Info');
    expect(result.category).toBe('System');
  });
});

describe('PrinterDataService - Background Sync and Historical Telemetry', () => {
  it('correctly calculates cumulative delta and protects against counter reset', async () => {
    const mockClient = {} as any;
    const { PrinterDataService } = await import('../printerDataService.js');
    const service = new (class extends PrinterDataService {
      public testDelta(points: any[]) {
        return (this as any).calculateDeltaFromHistory(points);
      }
    })(mockClient);

    // Empty -> null
    expect(service.testDelta([])).toBeNull();

    // Single point -> 0
    expect(service.testDelta([{ clock: '1000', value: '759683' }])).toBe(0);

    // Multiple points with increase: 759683 -> 759683 -> 759751 (+68) -> 759752 (+1) = 69
    const samples = [
      { clock: '1000', value: '759683' },
      { clock: '2000', value: '759683' },
      { clock: '3000', value: '759751' },
      { clock: '4000', value: '759752' },
    ];
    expect(service.testDelta(samples)).toBe(69);

    // Counter reset / rollover: 759752 -> reset to 10 -> 25 (+15). Must not produce negative delta!
    const resetSamples = [
      { clock: '1000', value: '759752' },
      { clock: '2000', value: '10' }, // reset/board replaced
      { clock: '3000', value: '25' }, // 15 pages printed
    ];
    expect(service.testDelta(resetSamples)).toBe(15);
  });

  it('aggregates history points into chronological hourly buckets with quality status', async () => {
    const { PrinterDataService } = await import('../printerDataService.js');
    const mockClient = {
      getHosts: vi.fn().mockResolvedValue([
        {
          hostid: '10683',
          name: 'Ricoh MP C6004',
          status: '0',
          available: '1',
          error: '',
          interfaces: [{ interfaceid: '1', ip: '10.48.3.252', port: '161', type: '2', main: '1' }],
          inventory: { location: 'Lầu 2', model: 'MP C6004', vendor: 'Ricoh', serialno_a: 'G736M860609' },
        },
      ]),
      getLatestItems: vi.fn().mockResolvedValue([
        { itemid: '50761', hostid: '10683', key_: 'printer.counter.total', lastvalue: '759752', lastclock: '1792998931' },
      ]),
      getActiveProblems: vi.fn().mockResolvedValue([]),
      getProblemsInRange: vi.fn().mockResolvedValue([]),
      getHistory: vi.fn().mockImplementation((_itemids, timeFrom, _timeTill) => {
        // Return 2 points around timeFrom + 3600
        return Promise.resolve([
          { itemid: '50761', clock: String(timeFrom + 1800), value: '759683' },
          { itemid: '50761', clock: String(timeFrom + 5400), value: '759751' },
        ]);
      }),
    } as any;

    const service = new PrinterDataService(mockClient);
    const telemetry = await service.getPrintVolumeTelemetry('24h', '10683');

    expect(telemetry.length).toBe(1);
    expect(telemetry[0].printerId).toBe('10683');
    expect(telemetry[0].range).toBe('24h');
    expect(telemetry[0].buckets.length).toBe(24);
    expect(['complete', 'partial', 'no_data']).toContain(telemetry[0].dataQuality);
  });

  it('prevents overlapping synchronization cycles and preserves last cache on error', async () => {
    const { PrinterDataService } = await import('../printerDataService.js');
    let resolveFirst: any;
    const firstCallPromise = new Promise(res => {
      resolveFirst = res;
    });

    const mockClient = {
      getHosts: vi.fn().mockReturnValueOnce(firstCallPromise),
      getLatestItems: vi.fn().mockResolvedValue([]),
      getActiveProblems: vi.fn().mockResolvedValue([]),
      getProblemsInRange: vi.fn().mockResolvedValue([]),
      getHistory: vi.fn().mockResolvedValue([]),
    } as any;

    const service = new PrinterDataService(mockClient);

    // Start first sync (in flight)
    const sync1 = service.syncNow();

    // Call sync2 while sync1 is in flight -> must detect isSyncing and not start second getHosts call
    const sync2 = await service.syncNow();
    expect(sync2.message).toContain('đang chạy ngầm');
    expect(mockClient.getHosts).toHaveBeenCalledTimes(1);

    // Resolve first sync
    resolveFirst([
      {
        hostid: '10683',
        name: 'Ricoh MP C6004',
        status: '0',
        available: '1',
        interfaces: [{ ip: '10.48.3.252', main: '1' }],
      },
    ]);
    const res1 = await sync1;
    expect(res1.success).toBe(true);
    expect(res1.printerCount).toBe(1);

    // Subsequent failure: with stale-while-revalidate, syncNow now RESOLVES with success=false
    // instead of throwing, so that the last known-good cache is NOT wiped and all printers
    // are not falsely reported as Offline during a transient Zabbix blip.
    mockClient.getHosts.mockRejectedValueOnce(new Error('Zabbix network timeout'));
    const staleResult = await service.syncNow();
    expect(staleResult.success).toBe(false);
    expect(staleResult.message).toContain('dữ liệu cũ');

    // Cached data is still preserved
    const cachedPrinters = await service.getPrinters();
    expect(cachedPrinters.length).toBe(1);
    expect(cachedPrinters[0].name).toBe('Ricoh MP C6004');

    // getPrinterById retrieves by ID, IP, or returns null
    const printerById = await service.getPrinterById('10683');
    expect(printerById).not.toBeNull();
    expect(printerById?.name).toBe('Ricoh MP C6004');

    const printerByIp = await service.getPrinterById('10.48.3.252');
    expect(printerByIp).not.toBeNull();
    expect(printerByIp?.id).toBe('10683');

    const notFound = await service.getPrinterById('non-existent');
    expect(notFound).toBeNull();
  });

  describe('isPaperMissingAlert and paper-empty suppression', () => {
    it('correctly identifies out-of-paper alerts and excludes paper jams', () => {
      // Paper empty / tray empty patterns -> true
      expect(isPaperMissingAlert('Printer Hardware Error: No Paper: Tray 3 {13400}')).toBe(true);
      expect(isPaperMissingAlert('Printer Warning: Tray 1 empty')).toBe(true);
      expect(isPaperMissingAlert('Out of paper: Bypass Tray')).toBe(true);
      expect(isPaperMissingAlert('Máy in hết giấy khay 2')).toBe(true);
      expect(isPaperMissingAlert('Khay 4 rỗng - Nạp giấy A4')).toBe(true);
      expect(isPaperMissingAlert('Load paper in tray 1')).toBe(true);
      expect(isPaperMissingAlert('Paper missing in feeder')).toBe(true);

      // Hardware Paper Jam -> MUST BE FALSE (never filter physical jams)
      expect(isPaperMissingAlert('Printer Hardware Error: Paper Jam: Duplex Unit {11000}')).toBe(false);
      expect(isPaperMissingAlert('Kẹt giấy khay nạp 1')).toBe(false);
      expect(isPaperMissingAlert('Paper Jam in Tray 2')).toBe(false);

      // Other hardware & supply alerts -> FALSE
      expect(isPaperMissingAlert('SC542 Fusing temperature warm-up error')).toBe(false);
      expect(isPaperMissingAlert('Waste toner container is almost full')).toBe(false);
      expect(isPaperMissingAlert('Cover Open: Front Door')).toBe(false);
      expect(isPaperMissingAlert('')).toBe(false);
      expect(isPaperMissingAlert(null)).toBe(false);
      expect(isPaperMissingAlert(undefined)).toBe(false);
    });

    it('suppresses paper-empty warnings in mapHostToPrinter, preserving clear alert severity', () => {
      const mockClient = {
        getHosts: vi.fn(),
        getLatestItems: vi.fn(),
        getActiveProblems: vi.fn(),
        getProblemsInRange: vi.fn(),
        getHistory: vi.fn(),
        getTrends: vi.fn(),
        getHistoryBoundary: vi.fn(),
        updateHostInventory: vi.fn(),
        authenticate: vi.fn(),
        reAuthenticate: vi.fn(),
      } as unknown as ZabbixClient;

      const service = new PrinterDataService(mockClient);

      const host: ZabbixHost = {
        hostid: '10683',
        host: 'ricoh_mp_c6004',
        name: 'Ricoh MP C6004',
        status: '0',
        available: '1',
        error: '',
        interfaces: [{ interfaceid: '1', ip: '10.48.3.252', port: '161', type: '2', main: '1' }],
      };

      // Case 1: Host has a "No Paper: Tray 3" problem -> Must be suppressed completely
      const paperProblem: ZabbixProblem = {
        eventid: '9901',
        objectid: '8801',
        name: 'Printer Warning: No Paper: Tray 3 {13400}',
        severity: '3',
        clock: '1700000000',
        acknowledged: '0',
      };

      const itemsWithPaperDesc: ZabbixItem[] = [
        {
          itemid: '1',
          hostid: '10683',
          key_: 'icmpping',
          name: 'ICMP ping',
          lastvalue: '1',
          lastclock: '1700000000',
          units: '',
        },
        {
          itemid: '2',
          hostid: '10683',
          key_: 'printer.alert.description[1]',
          name: 'Alert Description',
          lastvalue: 'No Paper: Tray 3 {13400}',
          lastclock: '1700000000',
          units: '',
        },
      ];

      const mapped1 = service.mapHostToPrinter(host, [paperProblem], itemsWithPaperDesc);
      // Alert severity MUST be 'clear' (not 'warning')
      expect(mapped1.alertSeverity).toBe('clear');
      // Incidents array must be empty (paper empty suppressed)
      expect(mapped1.incidents).toHaveLength(0);
      // alertText must not contain paper alert
      expect(mapped1.alertText).not.toContain('No Paper');

      // Case 2: Host has a real Paper Jam -> Must NOT be suppressed
      const jamProblem: ZabbixProblem = {
        eventid: '9902',
        objectid: '8802',
        name: 'Printer Hardware Error: Paper Jam: Duplex Unit {11000}',
        severity: '4',
        clock: '1700000000',
        acknowledged: '0',
      };

      const mapped2 = service.mapHostToPrinter(host, [jamProblem], itemsWithPaperDesc);
      expect(mapped2.alertSeverity).toBe('critical');
      expect(mapped2.incidents).toHaveLength(1);
      expect(mapped2.incidents[0].desc).toContain('Kẹt giấy');
    });
  });
});

