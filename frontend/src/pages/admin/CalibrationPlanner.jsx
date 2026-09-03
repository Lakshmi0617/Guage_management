import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, Button, Spin, Modal, List, Tag, Select, Segmented, message, Row, Col, Card, Statistic } from 'antd'
import { LeftOutlined, RightOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, CalendarOutlined, DownloadOutlined, BellOutlined } from '@ant-design/icons'
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
  .planner-container {
    padding: 0;
    margin-top: 64px;
    background: #f5f7fa;
    min-height: calc(100vh - 64px);
  }

  .planner-header {
    background: #ffffff;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .planner-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1f2e;
    margin: 0;
  }

  .legend {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #6b7280;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .content-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin: 24px;
  }

  .btn-primary,
  .ant-btn-primary {
    background: #1a1f2e !important;
    border: none !important;
    color: #fff !important;
  }

  .btn-primary:hover,
  .ant-btn-primary:hover {
    background: #252b3d !important;
  }

  .btn-secondary,
  .ant-btn-default {
    background: #fff !important;
    border: 1px solid #d1d5db !important;
    color: #374151 !important;
  }

  .btn-secondary:hover,
  .ant-btn-default:hover {
    border-color: #9ca3af !important;
    background: #f9fafb !important;
  }

  .kpi-card {
    border-radius: 8px;
    transition: transform 0.2s;
  }

  .kpi-card:hover {
    transform: translateY(-2px);
  }

  .calendar-wrapper {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: visible;
    max-height: calc(100vh - 400px);
    overflow-y: auto;
  }

  .ant-picker-calendar-date-content {
    height: auto !important;
    min-height: 120px;
    padding: 4px;
  }

  .ant-picker-cell-in-view {
    background: #fff;
  }

  .ant-picker-cell:not(.ant-picker-cell-in-view) {
    display: none !important;
  }

  .ant-picker-calendar .ant-picker-panel {
    background: #fff;
  }

  .ant-picker-cell-selected .ant-picker-cell-inner {
    background: transparent !important;
    border: 2px solid #1890ff;
  }

  .ant-picker-cell-selected:hover .ant-picker-cell-inner {
    background: rgba(24, 144, 255, 0.05) !important;
  }

  .ant-picker-calendar-date {
    border-top: 2px solid #f0f0f0;
    min-height: 120px;
    display: flex;
    flex-direction: column;
  }

  .ant-picker-calendar-date-value {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
    text-align: left;
    line-height: 24px;
    margin-bottom: 4px;
  }

  .ant-picker-calendar .ant-picker-body {
    padding: 0;
  }

  .ant-picker-content {
    height: auto !important;
  }

  tbody {
    display: table-row-group;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .event-badge {
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: opacity 0.2s;
  }

  .event-badge:hover {
    opacity: 0.8;
  }

  .event-success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #059669;
  }

  .event-due {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #d97706;
  }

  .event-overdue {
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.35);
    color: #dc2626;
  }

  .ant-modal-header {
    background: #1a1f2e;
    border-bottom: none;
  }

  .ant-modal-title {
    color: #e4e6eb;
    font-size: 18px;
    font-weight: 600;
  }

  .ant-modal-close-x {
    color: #e4e6eb;
  }
`

export default function CalibrationPlanner() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [eventMap, setEventMap] = useState({})
  const [detailModal, setDetailModal] = useState({ open: false, date: '', events: [] })
  const [value, setValue] = useState(dayjs())
  const [mode, setMode] = useState('month')
  const [heldGaugeIds, setHeldGaugeIds] = useState(new Set())
  const [heldByMap, setHeldByMap] = useState({})
  const [userEmailMap, setUserEmailMap] = useState({})

  const kpis = useMemo(() => {
    const today = dayjs()
    const selectedMonth = value.month()
    const selectedYear = value.year()
    let total = 0, completed = 0, due = 0, missed = 0

    items.forEach(item => {
      if (mode === 'year') {
        if (item.date_of_last_calibration && dayjs(item.date_of_last_calibration).year() === selectedYear) completed++
        if (item.calibration_due) {
          const dueDate = dayjs(item.calibration_due)
          if (dueDate.year() === selectedYear) {
            due++
            if (dueDate.isBefore(today, 'day')) missed++
          }
        }
        const hasActivity = (item.date_of_last_calibration && dayjs(item.date_of_last_calibration).year() === selectedYear) ||
                           (item.calibration_due && dayjs(item.calibration_due).year() === selectedYear)
        if (hasActivity) total++
      } else {
        if (item.calibration_due) {
          const dueDate = dayjs(item.calibration_due)
          if (dueDate.month() === selectedMonth && dueDate.year() === selectedYear) {
            due++
            if (dueDate.isBefore(today, 'day')) missed++
          }
        }
        if (item.date_of_last_calibration) {
          const lastCal = dayjs(item.date_of_last_calibration)
          if (lastCal.month() === selectedMonth && lastCal.year() === selectedYear) completed++
        }
        const hasActivity = (item.date_of_last_calibration && dayjs(item.date_of_last_calibration).month() === selectedMonth && dayjs(item.date_of_last_calibration).year() === selectedYear) ||
                           (item.calibration_due && dayjs(item.calibration_due).month() === selectedMonth && dayjs(item.calibration_due).year() === selectedYear)
        if (hasActivity) total++
      }
    })
    return { total, completed, due, missed }
  }, [items, value, mode])

  const buildEvents = (arr) => {
    const map = {}
    arr.forEach(r => {
      const eq = `[${r.idfn_no || '-'}] ${r.name_of_the_equipment || `Gauge ${r.gauge_id}`}`
      const op = heldByMap[r.gauge_id] ? ` — ${heldByMap[r.gauge_id]}` : ''
      if (r.date_of_last_calibration) {
        const key = r.date_of_last_calibration
        if (!map[key]) map[key] = []
        map[key].push({ type: 'success', label: `Last: ${eq}${op}`, eq, gauge_id: r.gauge_id })
      }
      if (r.calibration_due) {
        const key = r.calibration_due
        if (!map[key]) map[key] = []
        map[key].push({ type: 'processing', label: `Due: ${eq}${op}`, eq, gauge_id: r.gauge_id })
      }
    })
    return map
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [equipRes, trackerRes, usersRes] = await Promise.all([
        fetch('/equipment?limit=5000', { headers: getAuthHeaders() }),
        fetch('/gauge-tracker?limit=5000', { headers: getAuthHeaders() }),
        fetch('/users', { headers: getAuthHeaders() })
      ])

      const equipment = await equipRes.json().then(d => d.items || []).catch(() => [])
      const tracker = await trackerRes.json().catch(() => [])
      const users = await usersRes.json().catch(() => [])

      // Build held gauges map
      const active = tracker.filter(r => r.status?.toLowerCase() === 'accepted' && !r.returned_at)
      const ids = new Set(active.map(r => r.gauge_id).filter(id => id))
      const byMap = {}
      active.forEach(r => {
        if (r.gauge_id && !byMap[r.gauge_id]) {
          byMap[r.gauge_id] = r.requested_by || r.accepted_by || ''
        }
      })

      // Build user email map
      const emailMap = {}
      users.forEach(u => {
        const username = String(u.username || '').trim().toLowerCase()
        if (username) emailMap[username] = u.email || ''
      })

      setItems(equipment)
      setHeldGaugeIds(ids)
      setHeldByMap(byMap)
      setUserEmailMap(emailMap)
      setEventMap(buildEvents(equipment))
    } catch (e) {
      message.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])
  useEffect(() => { if (items.length) setEventMap(buildEvents(items)) }, [heldByMap, items])

  const sendReminder = async (gaugeId) => {
    try {
      const res = await fetch('/reminders/email', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          gauge_id: gaugeId, 
          admin_name: localStorage.getItem('username') || 'Admin' 
        })
      })
      if (!res.ok) throw new Error('Failed')
      message.success('Reminder sent')
    } catch {
      message.error('Failed to send reminder')
    }
  }

  const downloadPDF = async () => {
    try {
      const jsPDF = await new Promise((resolve, reject) => {
        if (window.jspdf?.jsPDF) return resolve(window.jspdf.jsPDF)
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
        s.onload = () => resolve(window.jspdf.jsPDF)
        s.onerror = reject
        document.head.appendChild(s)
      })

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
      const today = dayjs()
      const due = [], missed = [], calibrated = []

      const withinPeriod = (dateStr) => {
        const d = dayjs(dateStr)
        return mode === 'year' ? d.year() === value.year() : 
               d.month() === value.month() && d.year() === value.year()
      }

      items.forEach(r => {
        const eq = r.name_of_the_equipment || `Gauge ${r.gauge_id}`
        const idfn = r.idfn_no || ''
        const opUser = heldByMap[r.gauge_id] || '-'
        const opEmail = userEmailMap[opUser.toLowerCase()] || '-'

        if (r.calibration_due && withinPeriod(r.calibration_due)) {
          const dd = dayjs(r.calibration_due)
          const entry = { eq, idfn, opUser, opEmail, date: dd.format('YYYY-MM-DD') }
          if (dd.isBefore(today, 'day')) missed.push(entry)
          else due.push(entry)
        }
        if (r.date_of_last_calibration && withinPeriod(r.date_of_last_calibration)) {
          calibrated.push({ 
            eq, idfn, opUser, opEmail, 
            date: dayjs(r.date_of_last_calibration).format('YYYY-MM-DD') 
          })
        }
      })

      const margin = 28
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Calibration Planner', margin, 36)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(`Period: ${mode === 'year' ? `Year ${value.year()}` : value.format('YYYY MMM')}`, margin, 54)
      doc.text(`Exported: ${dayjs().format('DD/MM/YYYY, h:mm a')}`, margin, 70)

      let y = 92
      const drawTable = (title, rows, color) => {
        if (!rows.length) return y
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(color)
        doc.text(title, margin, y)
        doc.setTextColor(0, 0, 0)
        y += 10
        doc.autoTable({
          startY: y,
          head: [['#', 'Equipment', 'IDFN', 'Operator', 'Email', 'Date']],
          body: rows.map((r, i) => [i + 1, r.eq, r.idfn, r.opUser, r.opEmail, r.date]),
          styles: { fontSize: 9 },
          margin: { left: margin, right: margin }
        })
        return doc.lastAutoTable.finalY + 20
      }

      y = drawTable('Due', due, '#faad14')
      y = drawTable('Missed', missed, '#f5222d')
      y = drawTable('Calibrated', calibrated, '#52c41a')

      const fname = mode === 'year' ? 
        `calibration_${value.year()}.pdf` : 
        `calibration_${value.format('YYYY_MM')}.pdf`
      doc.save(fname)
      message.success('PDF downloaded')
    } catch {
      message.error('PDF generation failed')
    }
  }

  const dateCellRender = (val) => {
    // Only render for dates in the current selected month
    if (mode === 'month' && val.month() !== value.month()) return null
    
    const key = val.format('YYYY-MM-DD')
    const list = eventMap[key] || []
    if (!list.length) return null

    return (
      <div style={{ marginTop: 4, display: 'grid', gap: 3, paddingBottom: 4, flex: 1, overflow: 'auto' }}>
        {list.slice(0, 3).map((ev, idx) => {
          const isDue = ev.type === 'processing'
          const isOverdue = isDue && dayjs(key).isBefore(dayjs(), 'day')
          const className = isDue ? (isOverdue ? 'event-overdue' : 'event-due') : 'event-success'
          return (
            <div
              key={idx}
              className={`event-badge ${className}`}
              onClick={(e) => { e.stopPropagation(); setDetailModal({ open: true, date: key, events: list }) }}
              title={ev.label}
            >
              {ev.label}
            </div>
          )
        })}
        {list.length > 3 && (
          <div 
            style={{ fontSize: 11, color: '#999', cursor: 'pointer', marginTop: 2 }}
            onClick={(e) => { e.stopPropagation(); setDetailModal({ open: true, date: key, events: list }) }}
          >
            +{list.length - 3} more
          </div>
        )}
      </div>
    )
  }

  const monthCellRender = (val) => {
    const ym = val.format('YYYY-MM')
    let last = 0, due = 0, missed = 0
    const today = dayjs()
    items.forEach(r => {
      if (r.date_of_last_calibration && r.date_of_last_calibration.startsWith(ym)) last++
      if (r.calibration_due && r.calibration_due.startsWith(ym)) {
        due++
        if (dayjs(r.calibration_due).isBefore(today, 'day')) missed++
      }
    })
    if (!last && !due && !missed) return null
    return (
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <Tag color="green">Last: {last}</Tag>
        <Tag color="gold">Due: {due}</Tag>
        <Tag color="red">Missed: {missed}</Tag>
      </div>
    )
  }

  return (
    <div className="planner-container">
      <style>{styles}</style>

      <div className="planner-header">
        <div className="header-left">
          <h1 className="planner-title">Calibration Planner</h1>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#059669' }} />
              <span>Last calibration</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#d97706' }} />
              <span>Calibration due</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#dc2626' }} />
              <span>Missed (overdue)</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={downloadPDF}
            style={{ 
              height: '36px',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 500
            }}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <div className="content-card">
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="kpi-card" style={{ background: 'rgba(24, 144, 255, 0.06)', border: '1px solid rgba(24, 144, 255, 0.15)' }}>
              <Statistic 
                title="Total Equipment" 
                value={kpis.total} 
                prefix={<CalendarOutlined style={{ color: '#1890ff' }} />} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="kpi-card" style={{ background: 'rgba(82, 196, 26, 0.06)', border: '1px solid rgba(82, 196, 26, 0.15)' }}>
              <Statistic 
                title="Calibrated" 
                value={kpis.completed}
                suffix={`/ ${kpis.total}`}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="kpi-card" style={{ background: 'rgba(250, 173, 20, 0.06)', border: '1px solid rgba(250, 173, 20, 0.15)' }}>
              <Statistic 
                title="Due for Calibration" 
                value={kpis.due}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} 
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="kpi-card" style={{ background: 'rgba(245, 34, 45, 0.06)', border: '1px solid rgba(245, 34, 45, 0.15)' }}>
              <Statistic 
                title="Missed Calibration" 
                value={kpis.missed}
                prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />} 
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <div className="calendar-wrapper">
            <Calendar
              value={value}
              mode={mode}
              onPanelChange={(v, m) => { setValue(v); setMode(m) }}
              onChange={setValue}
              fullscreen
              dateCellRender={dateCellRender}
              monthCellRender={monthCellRender}
              headerRender={({ value: val, onChange }) => {
                const year = val.year()
                const month = val.month()
                const years = Array.from({ length: 11 }, (_, i) => ({ label: `${year - 5 + i}`, value: year - 5 + i }))
                const months = Array.from({ length: 12 }, (_, i) => ({ label: dayjs().month(i).format('MMM'), value: i }))

                return (
                  <div className="calendar-header">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button icon={<LeftOutlined />} onClick={() => { const nv = val.clone().month(month - 1); onChange(nv); setValue(nv) }} />
                      <Button icon={<RightOutlined />} onClick={() => { const nv = val.clone().month(month + 1); onChange(nv); setValue(nv) }} />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Segmented
                        size="small"
                        options={[{ label: 'Month', value: 'month' }, { label: 'Year', value: 'year' }]}
                        value={mode}
                        onChange={setMode}
                      />
                      <Select size="small" value={year} options={years} onChange={(y) => { const nv = val.clone().year(y); onChange(nv); setValue(nv) }} style={{ width: 96 }} />
                      <Select size="small" value={month} options={months} onChange={(m) => { const nv = val.clone().month(m); onChange(nv); setValue(nv) }} style={{ width: 96 }} />
                    </div>
                  </div>
                )
              }}
            />
          </div>
        </Spin>
      </div>

      <Modal
        title={`Events on ${detailModal.date}`}
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, date: '', events: [] })}
        footer={null}
      >
        <List
          dataSource={detailModal.events}
          renderItem={(ev) => {
            const isDue = ev.type === 'processing'
            const hasHolder = ev.gauge_id && heldGaugeIds.has(ev.gauge_id)
            return (
              <List.Item
                actions={isDue && hasHolder ? [
                  <Button key="remind" type="link" icon={<BellOutlined />} onClick={() => sendReminder(ev.gauge_id)}>
                    Send Reminder
                  </Button>
                ] : undefined}
              >
                <List.Item.Meta
                  avatar={<div style={{ width: 10, height: 10, borderRadius: 3, background: isDue ? '#d97706' : '#059669' }} />}
                  title={ev.eq}
                  description={ev.label}
                />
              </List.Item>
            )
          }}
        />
      </Modal>
    </div>
  )
}