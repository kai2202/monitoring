import { Printer, Incident, TimeframeType, SyncResponse, PrinterTelemetryResponse } from '../types/printer';
import { AvailabilityDataPoint } from './fleetService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Tầng dịch vụ dữ liệu máy in (Printer Service).
 * Tuân thủ quy chuẩn printer-data-requirements.md:
 * - Trực tiếp gọi API Backend kết nối Zabbix 7.0 & SNMP Exporter.
 * - Khi Backend chưa sẵn sàng hoặc API lỗi: Trả về mảng rỗng [] an toàn để UI kích hoạt
 *   trạng thái No Data / Not connected / Pending, tuyệt đối không bịa số liệu hay biến dữ liệu thiếu thành 0.
 * - Không fallback âm thầm sang mock data.
 */
export async function getPrinters(): Promise<Printer[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/printers`);
    if (!response.ok) {
      console.warn(`[printerService] Backend phản hồi mã lỗi HTTP: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.info('[printerService] Backend API chưa kết nối. UI kích hoạt trạng thái Chưa có dữ liệu / Chờ kết nối Zabbix.');
    return [];
  }
}

/**
 * Lấy danh sách sự cố từ Backend / Zabbix Problem API
 */
export async function getIncidents(): Promise<Incident[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/incidents`);
    if (!response.ok) {
      console.warn(`[printerService] Backend phản hồi mã lỗi HTTP: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.info('[printerService] Backend API chưa kết nối. UI sự cố ở trạng thái trống.');
    return [];
  }
}

/**
 * Cập nhật trạng thái sự cố thủ công (Active / Resolved).
 */
export async function updateIncidentStatus(
  incidentId: string,
  status: 'Active' | 'Resolved'
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      return {
        success: false,
        message: `Thao tác thất bại: Máy chủ phản hồi mã lỗi ${response.status}.`
      };
    }
    const data = await response.json();
    return {
      success: true,
      message: data.message || `Cập nhật trạng thái sự cố ${incidentId} thành công.`
    };
  } catch (err) {
    return {
      success: false,
      message: 'Không thể kết nối đến Backend API.'
    };
  }
}

/**
 * Gửi yêu cầu xác nhận đã xử lý sự cố (Acknowledge / Close Zabbix Problem).
 */
export async function resolveIncident(incidentId: string): Promise<{ success: boolean; message: string }> {
  return updateIncidentStatus(incidentId, 'Resolved');
}

/**
 * Lấy chuỗi lịch sử khả dụng từ Zabbix Trend / History API
 */
export async function getAvailabilityTimeline(timeframe: TimeframeType): Promise<AvailabilityDataPoint[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/telemetry/availability?timeframe=${timeframe}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Cập nhật vị trí lắp đặt máy in (location).
 */
export async function updatePrinterLocation(
  printerId: string,
  location: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/printers/${printerId}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location })
    });
    if (!response.ok) {
      return {
        success: false,
        message: `Thao tác thất bại: Máy chủ phản hồi mã lỗi ${response.status}.`
      };
    }
    const data = await response.json();
    return {
      success: true,
      message: data.message || `Cập nhật vị trí máy in ${printerId} thành công.`
    };
  } catch (err) {
    return {
      success: false,
      message: 'Không thể kết nối đến Backend API.'
    };
  }
}

/**
 * Kích hoạt đồng bộ Zabbix thủ công tức thì.
 */
export async function syncPrinters(): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sync`, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Mã lỗi HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Đồng bộ thất bại: ${message}`,
      syncedAt: new Date().toISOString(),
      durationMs: 0,
      printerCount: 0,
      incidentCount: 0,
    };
  }
}

/**
 * Lấy chuỗi lịch sử tải in thực tế từ Zabbix (24h hourly, 7d daily, 30d daily).
 */
export async function getPrintVolumeTelemetry(
  range: '24h' | '7d' | '30d',
  printerId?: string
): Promise<PrinterTelemetryResponse[]> {
  try {
    const url = printerId
      ? `${API_BASE_URL}/telemetry/print-volume?range=${range}&printerId=${encodeURIComponent(printerId)}`
      : `${API_BASE_URL}/telemetry/print-volume?range=${range}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export const printerService = {
  getPrinters,
  getIncidents,
  resolveIncident,
  updateIncidentStatus,
  updatePrinterLocation,
  getAvailabilityTimeline,
  syncPrinters,
  getPrintVolumeTelemetry,
};

