import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FontAwesomeIcon, faBolt, faFloppyDisk, faCircleCheck } from '../../../shared/icons';
import { zabbixConfigSchema, ZabbixConfigFormData } from '../schemas/zabbixConfigSchema';

interface ZabbixConfigFormProps {
  initialValues?: Partial<ZabbixConfigFormData>;
  onSave?: (data: ZabbixConfigFormData) => void;
}

export const ZabbixConfigForm: React.FC<ZabbixConfigFormProps> = ({ initialValues, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ZabbixConfigFormData>({
    resolver: zodResolver(zabbixConfigSchema),
    defaultValues: {
      apiUrl: initialValues?.apiUrl || 'http://192.168.1.100/zabbix/api_jsonrpc.php',
      apiToken: initialValues?.apiToken || '0123456789abcdef0123456789abcdef',
      scrapeIntervalSeconds: initialValues?.scrapeIntervalSeconds || 30,
      requestTimeoutSeconds: initialValues?.requestTimeoutSeconds || 10,
      enableSnmpDiscovery: initialValues?.enableSnmpDiscovery ?? true,
      autoCreateTasks: initialValues?.autoCreateTasks ?? true,
    },
  });

  const onSubmit = (data: ZabbixConfigFormData) => {
    if (onSave) onSave(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <FontAwesomeIcon icon={faBolt} style={{ fontSize: '16px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Cấu Hình Kết Nối Zabbix API (React Hook Form + Zod)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Xác thực định dạng Endpoint JSON-RPC, Token phân quyền và chu kỳ cào dữ liệu SNMP
            </p>
          </div>
        </div>

        {isSubmitSuccessful && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '14px' }} />
            Đã lưu cấu hình thành công
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Zabbix API URL
          </label>
          <input
            {...register('apiUrl')}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${errors.apiUrl ? '#ef4444' : 'var(--border-color)'}`,
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
          {errors.apiUrl && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.apiUrl.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Zabbix API Token
          </label>
          <input
            type="password"
            {...register('apiToken')}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${errors.apiToken ? '#ef4444' : 'var(--border-color)'}`,
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
          {errors.apiToken && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.apiToken.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Chu kỳ cào dữ liệu (giây)
          </label>
          <input
            type="number"
            {...register('scrapeIntervalSeconds', { valueAsNumber: true })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${errors.scrapeIntervalSeconds ? '#ef4444' : 'var(--border-color)'}`,
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
          {errors.scrapeIntervalSeconds && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.scrapeIntervalSeconds.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Thời gian chờ Timeout (giây)
          </label>
          <input
            type="number"
            {...register('requestTimeoutSeconds', { valueAsNumber: true })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${errors.requestTimeoutSeconds ? '#ef4444' : 'var(--border-color)'}`,
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
          {errors.requestTimeoutSeconds && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.requestTimeoutSeconds.message}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            border: 'none',
          }}
        >
          <FontAwesomeIcon icon={faFloppyDisk} style={{ fontSize: '13px' }} />
          <span>Lưu Cấu Hình</span>
        </button>
      </div>
    </form>
  );
};
