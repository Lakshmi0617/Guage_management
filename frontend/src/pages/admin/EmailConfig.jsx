import React, { useEffect, useMemo, useState } from 'react'
import { Table, Button, Input, Space, message, Pagination, Card, Tabs } from 'antd'
import { ReloadOutlined, ClockCircleOutlined, PlayCircleOutlined, SettingOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

const styles = `
  .email-config-container {
    padding: 24px;
    background: #f5f7fa;
    min-height: calc(100vh - 64px);
    margin-top: 64px;
  }

  .page-header {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1f2e;
    margin: 0;
  }

  .content-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 200px);
  }

  .controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .button-group {
    display: flex;
    gap: 12px;
  }

  .btn-primary {
    background: #1a1f2e;
    border: none;
    color: #fff;
    height: 40px;
    padding: 0 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-secondary {
    background: #fff;
    border: 1px solid #d1d5db;
    color: #374151;
    height: 40px;
    padding: 0 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .email-table .ant-table-thead > tr > th {
    background: #f9fafb;
    color: #1a1f2e;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    padding: 14px 16px;
  }

  .email-table .ant-table-tbody > tr > td {
    padding: 14px 16px;
    color: #1f2937;
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    display: inline-block;
  }

  .status-sent {
    background: #d1fae5;
    color: #065f46;
  }

  .status-failed {
    background: #fee2e2;
    color: #991b1b;
  }

  .config-section {
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fafafa;
  }

  .config-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1f2e;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .config-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .config-label {
    font-weight: 500;
    color: #374151;
    min-width: 120px;
  }

  .config-input {
    height: 36px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
  }

  .config-message {
    margin-top: 12px;
    padding: 8px 12px;
    border-radius: 6px;
    background: #eff6ff;
    color: #1e40af;
    font-size: 13px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    margin-top: 16px;
  }

  .ant-tabs-nav {
    margin-bottom: 24px;
  }

  .ant-tabs-tab {
    padding: 12px 24px !important;
    font-weight: 500;
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #1a1f2e !important;
    font-weight: 600;
  }

  .ant-tabs-ink-bar {
    background: #1a1f2e;
  }

  @media (max-width: 768px) {
    .controls-row {
      flex-direction: column;
      align-items: stretch;
    }
  }
`

export default function EmailConfig() {
  const [logs, setLogs] = useState([])
  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState(100)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [schedTz, setSchedTz] = useState('')
  const [schedMsg, setSchedMsg] = useState('')
  const [offsetDays, setOffsetDays] = useState('')
  const [offsetMsg, setOffsetMsg] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = async (signal) => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      if (status) qs.set('status', status)
      if (limit) qs.set('limit', String(limit))
      if (fromDate) qs.set('from_date', fromDate)
      if (toDate) qs.set('to_date', toDate)
      const url = `/admin/email-logs?${qs.toString()}`
      const res = await fetch(url, { 
        signal, 
        headers: { 
          'Accept': 'application/json',
          ...getAuthHeaders()
        } 
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setLogs(Array.isArray(data) ? data : [])
    } catch (e) {
      if (e.name !== 'AbortError') setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    const id = setInterval(() => load(ctrl.signal), 15000)
    return () => { ctrl.abort(); clearInterval(id) }
  }, [status, limit, fromDate, toDate])

  const getSchedule = async () => {
    try {
      const res = await fetch(`/admin/due-reminder/time`, { 
        headers: { 
          'Accept':'application/json',
          ...getAuthHeaders()
        } 
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setSchedTime(data?.time || '')
      setSchedTz(data?.timezone || '')
    } catch (e) {
      message.error(String(e.message || e))
    }
  }

  const setSchedule = async () => {
    setSchedMsg('')
    try {
      const res = await fetch(`/admin/due-reminder/time`, {
        method: 'PUT',
        headers: { 
          'Content-Type':'application/json', 
          'Accept':'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ time: schedTime })
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`)
      setSchedMsg(`Updated to ${data.time} (${data.timezone})`)
      message.success('Schedule updated successfully')
    } catch (e) {
      message.error(String(e.message || e))
    }
  }

  const runNow = async () => {
    try {
      message.loading({ content: 'Triggering reminder job...', key: 'runNow' })
      const res = await fetch(`/admin/due-reminder/run`, { 
        method: 'POST',
        headers: getAuthHeaders()
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`)
      
      // Show detailed feedback
      const emailCount = data?.emails_sent || 0
      message.success({ 
        content: `Reminder triggered successfully! ${emailCount} email(s) queued.`, 
        key: 'runNow',
        duration: 4
      })
      
      // Refresh logs after a short delay to see new emails
      setTimeout(() => load(), 2000)
    } catch (e) {
      message.error({ content: String(e.message || e), key: 'runNow' })
    }
  }

  const getOffset = async () => {
    try {
      const res = await fetch(`/admin/due-reminder/offset`, { 
        headers: { 
          'Accept':'application/json',
          ...getAuthHeaders()
        } 
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setOffsetDays((data?.days ?? 0).toString())
    } catch (e) {
      message.error(String(e.message || e))
    }
  }

  const setOffset = async () => {
    setOffsetMsg('')
    try {
      const daysNum = Math.max(0, parseInt(offsetDays || '0') || 0)
      const res = await fetch(`/admin/due-reminder/offset`, {
        method: 'PUT',
        headers: { 
          'Content-Type':'application/json', 
          'Accept':'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ days: daysNum })
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`)
      setOffsetDays(String(data.days))
      setOffsetMsg(`Offset set to ${data.days} day(s)`)
      message.success('Offset updated successfully')
    } catch (e) {
      message.error(String(e.message || e))
    }
  }

  useEffect(() => {
    getOffset()
    getSchedule()
  }, [])

  const columns = [
    { 
      title: 'Sl. No.', 
      key: 'slno', 
      width: 80, 
      align: 'center', 
      render: (_, __, index) => ((currentPage - 1) * pageSize) + index + 1 
    },
    { 
      title: 'Date', 
      dataIndex: 'sent_at', 
      key: 'date', 
      width: 120,
      render: (v) => v ? dayjs(v).format('YYYY-MM-DD') : <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Time', 
      dataIndex: 'sent_at', 
      key: 'time', 
      width: 100,
      render: (v) => v ? dayjs(v).format('HH:mm:ss') : <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Recipient', 
      dataIndex: 'to_email', 
      key: 'to_email', 
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Subject', 
      dataIndex: 'subject', 
      key: 'subject', 
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 120, 
      align: 'center',
      render: (v) => {
        const status = (v || '').toLowerCase()
        const isSent = status === 'sent'
        return (
          <span className={`status-badge ${isSent ? 'status-sent' : 'status-failed'}`}>
            {status.toUpperCase()}
          </span>
        )
      }
    },
    { 
      title: 'Error', 
      dataIndex: 'error', 
      key: 'error', 
      ellipsis: true,
      render: (text) => text ? <span style={{ color: '#dc2626' }}>{text}</span> : <span style={{ color: '#9ca3af' }}>—</span>
    }
  ]

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return logs.slice(start, start + pageSize)
  }, [logs, currentPage, pageSize])

  const settingsTab = (
    <div>
      <div className="content-card">
        <div className="config-section">
          <div className="config-title">
            <ClockCircleOutlined />
            Schedule Time
          </div>
          <div className="config-row">
            <span className="config-label">Schedule Time:</span>
            <input 
              className="config-input"
              style={{ width: 120 }}
              placeholder="HH:MM" 
              value={schedTime} 
              onChange={e => setSchedTime(e.target.value)} 
            />
            {schedTz && <span style={{ color: '#6b7280', fontSize: 13 }}>Timezone: {schedTz}</span>}
            <button className="btn-primary" onClick={setSchedule}>
              <SettingOutlined />
              Update
            </button>
            <button className="btn-secondary" onClick={runNow}>
              <PlayCircleOutlined />
              Run Now
            </button>
          </div>
          {schedMsg && <div className="config-message">{schedMsg}</div>}
        </div>
      </div>

      <div className="content-card">
        <div className="config-section">
          <div className="config-title">
            <SettingOutlined />
            Days Before Due
          </div>
          <div className="config-row">
            <span className="config-label">Days Before Due:</span>
            <input 
              type="number" 
              min={0} 
              className="config-input"
              style={{ width: 120 }}
              placeholder="0" 
              value={offsetDays} 
              onChange={e => setOffsetDays(e.target.value)} 
            />
            <button className="btn-primary" onClick={setOffset}>
              <SettingOutlined />
              Update
            </button>
          </div>
          {offsetMsg && <div className="config-message">{offsetMsg}</div>}
        </div>
      </div>
    </div>
  )

  const logsTab = (
    <div className="content-card">
      <div className="controls-row">
        <div className="filter-group">
          <span style={{ fontWeight: 500, color: '#374151' }}>From:</span>
          <input 
            type="date" 
            className="config-input"
            value={fromDate} 
            onChange={e => setFromDate(e.target.value)} 
          />
          <span style={{ fontWeight: 500, color: '#374151' }}>To:</span>
          <input 
            type="date" 
            className="config-input"
            value={toDate} 
            onChange={e => setToDate(e.target.value)} 
          />
          <span style={{ fontWeight: 500, color: '#374151' }}>Status:</span>
          <select 
            className="config-input"
            value={status} 
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
          <span style={{ fontWeight: 500, color: '#374151' }}>Limit:</span>
          <input 
            type="number" 
            min={1} 
            max={500}
            className="config-input"
            style={{ width: 80 }}
            value={limit} 
            onChange={e => setLimit(Math.max(1, Math.min(500, parseInt(e.target.value || '0') || 100)))} 
          />
        </div>
        <button className="btn-secondary" onClick={() => load()}>
          <ReloadOutlined />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: 12, 
          marginBottom: 16, 
          background: '#fee2e2', 
          color: '#991b1b', 
          borderRadius: 6,
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Table
            columns={columns}
            dataSource={paginatedLogs}
            loading={loading}
            pagination={false}
            bordered
            className="email-table"
            scroll={{ x: 1000, y: 'calc(100vh - 450px)' }}
            style={{ flex: 1, height: '100%' }}
          />
        </div>
      </div>
      <div className="pagination-wrapper" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <Pagination
          current={currentPage}
          total={logs.length}
          pageSize={pageSize}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} logs`}
          onChange={(page, size) => {
            setCurrentPage(page)
            setPageSize(size)
          }}
          pageSizeOptions={['10', '20', '50', '100']}
        />
      </div>
    </div>
  )

  return (
    <div className="email-config-container">
      <style>{styles}</style>

      <div className="page-header">
        <h1 className="page-title">Email Configuration</h1>
      </div>

      <Tabs
        defaultActiveKey="logs"
        items={[
          {
            key: 'logs',
            label: 'Email Logs',
            children: logsTab,
          },
          {
            key: 'settings',
            label: 'Settings',
            children: settingsTab,
          },
        ]}
      />
    </div>
  )
}