import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Table, Button, Input, Space, message, Modal, Pagination, Tabs, AutoComplete, Select, DatePicker, Popover } from 'antd'
import { loadJsPDF, buildAutoTablePageHook, formatNow } from '../../utils/pdfExport.js'
import { FilterOutlined, ReloadOutlined, CheckOutlined, CloseOutlined, DownloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import Analytics from './Analytics'

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
  .gauge-tracker-container {
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
    display: flex;
    flex-direction: column;
    height: calc(100vh - 220px);
  }

  .controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1;
    min-width: 280px;
    max-width: 400px;
  }

  .button-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
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

  .btn-danger {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #dc2626;
    height: 40px;
    padding: 0 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-text {
    background: transparent;
    border: none;
    color: #6b7280;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
  }

  .btn-text-edit {
    color: #3b82f6;
  }

  .btn-text-delete {
    color: #ef4444;
  }

  .gauge-tracker-table .ant-table-thead > tr > th {
    background: #f9fafb;
    color: #1a1f2e;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    padding: 14px 16px;
  }

  .gauge-tracker-table .ant-table-tbody > tr > td {
    padding: 14px 16px;
    color: #1f2937;
  }

  .gauge-tracker-table .ant-table-tbody > tr:hover {
    background: #f9fafb;
  }

  .idfn-badge {
    background: #eff6ff;
    color: #2563eb;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 12px;
    display: inline-block;
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    display: inline-block;
  }

  .status-requested {
    background: #fef3c7;
    color: #92400e;
  }

  .status-accepted {
    background: #d1fae5;
    color: #065f46;
  }

  .status-rejected {
    background: #fee2e2;
    color: #991b1b;
  }

  .status-returned {
    background: #dbeafe;
    color: #1e40af;
  }

  .return-condition-badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 12px;
    display: inline-block;
  }

  .condition-good {
    background: #d1fae5;
    color: #065f46;
  }

  .condition-bad {
    background: #fee2e2;
    color: #991b1b;
  }

  .condition-needs-repair {
    background: #fef3c7;
    color: #92400e;
  }

  .condition-custom {
    background: #e0e7ff;
    color: #3730a3;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    margin-top: 16px;
  }

  .ant-modal-header {
    background: #1a1f2e;
    padding: 20px 24px;
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

  .ant-modal-body {
    padding: 24px;
  }

  .ant-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-direction: row-reverse;
  }

  .btn-cancel {
    background: #fff;
    border: 1px solid #d1d5db;
    color: #374151;
    height: 36px;
    padding: 0 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-submit {
    background: #1a1f2e;
    border: none;
    color: #fff;
    height: 36px;
    padding: 0 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
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

  .filter-popover {
    min-width: 320px;
  }

  .filter-group {
    display: grid;
    gap: 16px;
  }

  .filter-field {
    display: grid;
    gap: 6px;
  }

  .filter-label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }

  @media (max-width: 768px) {
    .controls-row {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-box,
    .button-group {
      width: 100%;
    }
  }
`

export default function GaugeTracker() {
  const [rows, setRows] = useState([])
  const [allRows, setAllRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('returned_at')
  const [sortDir, setSortDir] = useState('desc')
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState(undefined)
  const [dateFilter, setDateFilter] = useState(null)
  const [nameFilter, setNameFilter] = useState('')
  const [nameOptions, setNameOptions] = useState([])
  const nameFetchRef = useRef(0)
  const [exporting, setExporting] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  const fetchRows = async (opts = {}) => {
    setLoading(true)
    try {
      const pageLimit = 500
      let offset = 0
      const acc = []
      for (let i = 0; i < 200; i++) {
        const params = new URLSearchParams({ limit: String(pageLimit), offset: String(offset) })
        if (sortBy) params.set('sort_by', sortBy)
        if (sortDir) params.set('sort_dir', sortDir)
        if (Array.isArray(dateFilter) && dateFilter[0] && dateFilter[1]) {
          params.set('from_date', dateFilter[0].format('YYYY-MM-DD'))
          params.set('to_date', dateFilter[1].format('YYYY-MM-DD'))
        }
        if (nameFilter && nameFilter.trim().length > 0) {
          params.set('name', nameFilter.trim())
        }
        const res = await fetch(`/gauge-tracker?${params.toString()}`, {
          headers: getAuthHeaders()
        })
        if (!res.ok) break
        const data = await res.json().catch(()=>[])
        const arr = Array.isArray(data) ? data : []
        acc.push(...arr)
        if (arr.length < pageLimit) break
        offset += pageLimit
      }
      const mapped = acc.map(r => ({ ...r, key: r.id }))
      setAllRows(mapped)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRows({ page: currentPage - 1 }) }, [currentPage, pageSize, sortBy, sortDir, dateFilter, nameFilter])

  const fetchNameSuggest = async (q) => {
    const cur = ++nameFetchRef.current
    try {
      const qs = new URLSearchParams({ q: q || '', limit: '10' }).toString()
      const res = await fetch(`/equipment/suggest?${qs}`, {
        headers: getAuthHeaders()
      })
      const data = await res.json().catch(()=>[])
      if (nameFetchRef.current !== cur) return
      const opts = (Array.isArray(data) ? data : [])
        .filter(s => s && (s.type === 'name') && typeof s.value === 'string')
        .map(s => ({ value: s.value }))
      setNameOptions(opts)
    } catch {
      if (nameFetchRef.current === cur) setNameOptions([])
    }
  }

  const onAccept = async (row) => {
    try {
      const accepted_by = (()=>{ try { return localStorage.getItem('username') || 'admin' } catch { return 'admin' } })()
      const res = await fetch(`/gauge-tracker/${row.id}/accept`, {
        method: 'POST', 
        headers: getAuthHeaders(),
        body: JSON.stringify({ accepted_by })
      })
      if (!res.ok) throw new Error(await res.text() || 'Failed to accept')
      message.success('Accepted')
      setCurrentPage(1); fetchRows({ page:0, reset:true })
    } catch (e) {
      message.error(typeof e?.message === 'string' ? e.message : 'Failed to accept')
    }
  }

  const onReject = async (row) => {
    try {
      const accepted_by = (()=>{ try { return localStorage.getItem('username') || 'admin' } catch { return 'admin' } })()
      const res = await fetch(`/gauge-tracker/${row.id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ accepted_by })
      })
      if (!res.ok) throw new Error(await res.text() || 'Failed to reject')
      message.success('Rejected')
      setCurrentPage(1); fetchRows({ page:0, reset:true })
    } catch (e) {
      message.error(typeof e?.message === 'string' ? e.message : 'Failed to reject')
    }
  }

  const columns = useMemo(() => [
    { 
      title: 'Sl. No.', 
      key: 'slno', 
      width: 80, 
      align: 'center', 
      render:(_, __, index)=> ((currentPage - 1) * pageSize) + index + 1 
    },
    { 
      title: 'Equipment', 
      dataIndex: 'name_of_the_equipment', 
      key: 'name_of_the_equipment', 
      width: 200, 
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#9ca3af' }}>—</span>
    },
    {
      title: 'Range',
      dataIndex: 'ranges',
      key: 'ranges',
      width: 180,
      ellipsis: true,
      render: (v) => {
        const arr = Array.isArray(v) ? v : []
        return arr.length ? <span title={arr.join(', ')}>{arr.join(', ')}</span> : <span style={{ color: '#9ca3af' }}>—</span>
      }
    },
    { 
      title: 'IDFN', 
      dataIndex: 'idfn_no', 
      key: 'idfn_no', 
      width: 120, 
      align: 'center',
      ellipsis: true,
      render: (text) => text ? <span className="idfn-badge">{text}</span> : <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Location', 
      dataIndex: 'location', 
      key: 'location', 
      width: 140, 
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Make/Model', 
      dataIndex: 'make_model', 
      key: 'make_model', 
      width: 150, 
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Request ID', 
      key: 'request_id', 
      width: 180, 
      render:(_,row)=> {
        try {
          const d = row.requested_at ? new Date(row.requested_at) : null
          if (!d) return <span style={{ color: '#9ca3af' }}>—</span>
          const pad = (n)=> String(n).padStart(2,'0')
          return `REQ_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
        } catch { return <span style={{ color: '#9ca3af' }}>—</span> }
      }
    },
    { 
      title: 'Requested By', 
      dataIndex: 'requested_by', 
      key: 'requested_by', 
      width: 140, 
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Requested At', 
      dataIndex: 'requested_at', 
      key: 'requested_at', 
      width: 180, 
      render:(v)=> v ? new Date(v).toLocaleString() : <span style={{ color: '#9ca3af' }}>—</span> 
    },
    { 
      title: 'Purpose', 
      dataIndex: 'purpose', 
      key: 'purpose', 
      width: 200, 
      ellipsis: true,
      render: (text) => text ? <span title={text}>{text}</span> : <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Return Condition', 
      dataIndex: 'return_status', 
      key: 'return_status', 
      width: 180, 
      align: 'center',
      render: (text, record) => {
        if (!text) return <span style={{ color: '#9ca3af' }}>—</span>
        
        if (text === 'Custom' && record.return_remarks) {
          return (
            <span className="return-condition-badge condition-custom" title={record.return_remarks}>
              {record.return_remarks}
            </span>
          )
        }
        
        const conditionClass = {
          'Good': 'condition-good',
          'Bad': 'condition-bad',
          'Needs Repair': 'condition-needs-repair',
          'Custom': 'condition-custom'
        }[text] || ''
        
        return (
          <span className={`return-condition-badge ${conditionClass}`}>
            {text}
          </span>
        )
      }
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 120, 
      align: 'center',
      render:(v)=> {
        const status = (v||'').toUpperCase()
        const statusClass = {
          'REQUESTED': 'status-requested',
          'ACCEPTED': 'status-accepted',
          'REJECTED': 'status-rejected',
          'RETURNED': 'status-returned'
        }[status] || ''
        
        return (
          <span className={`status-badge ${statusClass}`}>
            {status}
          </span>
        )
      } 
    },
    { 
      title: 'Actions', 
      key: 'holder', 
      width: 240, 
      render:(_,row)=> {
        const s = (row.status||'').toLowerCase()
        if (s === 'accepted') {
          return (
            <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
              <div>Accepted by <span style={{ fontWeight: 600, color: '#1a1f2e' }}>{row.accepted_by || '-'}</span></div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                {row.accepted_at ? new Date(row.accepted_at).toLocaleString() : '-'}
              </div>
            </div>
          )
        }
        if (s === 'rejected') {
          return (
            <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
              <div>Rejected by <span style={{ fontWeight: 600, color: '#1a1f2e' }}>{row.accepted_by || '-'}</span></div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                {row.accepted_at ? new Date(row.accepted_at).toLocaleString() : '-'}
              </div>
            </div>
          )
        }
        if (s === 'returned') {
          return (
            <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
              <div>Returned by <span style={{ fontWeight: 600, color: '#1a1f2e' }}>{row.returned_by || '-'}</span></div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                {row.returned_at ? new Date(row.returned_at).toLocaleString() : '-'}
              </div>
            </div>
          )
        }
        return <span style={{ color: '#9ca3af' }}>Pending action</span>
      }
    },
    { 
      title: '', 
      key: 'actions', 
      width: 100, 
      fixed: 'right', 
      align: 'center', 
      render: (_, row) => {
        const s = (row.status||'').toLowerCase()
        const isNewRequest = s === 'requested'
        const disabled = s === 'accepted' || s === 'rejected' || s === 'returned'
        
        return (
          <Space size="middle">
            <button 
              className={isNewRequest ? "btn-text btn-text-edit" : "btn-text"}
              onClick={()=>onAccept(row)} 
              disabled={disabled}
              title={disabled ? "Action already taken" : "Approve request"}
              style={{
                color: isNewRequest ? "#52c41a" : "#8c8c8c",
                background: isNewRequest ? "#f6ffed" : "transparent",
                border: isNewRequest ? "1px solid #b7eb8f" : "none",
                borderRadius: '4px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.3s',
              }}
            >
              <CheckOutlined />
            </button>
            <button 
              className={isNewRequest ? "btn-text btn-text-delete" : "btn-text"}
              onClick={()=>onReject(row)} 
              disabled={disabled}
              title={disabled ? "Action already taken" : "Reject request"}
              style={{
                color: isNewRequest ? "#ff4d4f" : "#8c8c8c",
                background: isNewRequest ? "#fff1f0" : "transparent",
                border: isNewRequest ? "1px solid #ffa39e" : "none",
                borderRadius: '4px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.3s',
              }}
            >
              <CloseOutlined />
            </button>
          </Space>
        )
      }
    }
  ], [currentPage, pageSize])

  const pageRows = useMemo(() => {
    const out = allRows.filter(r => {
      const sOk = statusFilter ? String(r.status||'').toLowerCase() === String(statusFilter).toLowerCase() : true
      const dOk = Array.isArray(dateFilter) && dateFilter[0] && dateFilter[1]
        ? (() => {
            try {
              const dt = r.requested_at ? dayjs(r.requested_at) : null
              if (!dt) return false
              const fromOk = dt.isSame(dateFilter[0], 'day') || dt.isAfter(dateFilter[0], 'day')
              const toOk = dt.isSame(dateFilter[1], 'day') || dt.isBefore(dateFilter[1], 'day')
              return fromOk && toOk
            } catch { return false }
          })()
        : true
      return sOk && dOk
    })
    
    const getActionTime = (r) => {
      const s = String(r.status||'').toLowerCase()
      if (s === 'returned') return r.returned_at
      if (s === 'rejected') return r.accepted_at
      if (s === 'accepted') return r.accepted_at
      return r.requested_at
    }
    
    const toTs = (t) => {
      try { return t ? new Date(t).getTime() : 0 } catch { return 0 }
    }
    
    out.sort((a,b) => {
      const tb = toTs(getActionTime(b)) - toTs(getActionTime(a))
      if (tb !== 0) return tb
      return (Number(b.id)||0) - (Number(a.id)||0)
    })
    
    const total = out.length
    if (totalItems !== total) setTotalItems(total)
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return out.slice(start, end)
  }, [allRows, statusFilter, dateFilter, currentPage, pageSize, totalItems])

  const handlePageChange = (page, size) => {
    setCurrentPage(page)
    if (size !== pageSize) {
      setPageSize(size)
    }
  }

  const exportTrackerPDF = async () => {
    try {
      setExporting(true)
      const jsPDF = await loadJsPDF()
      const all = []
      let offset = 0
      const pageLimit = 500
      for (let i = 0; i < 200; i++) {
        const params = new URLSearchParams({ limit: String(pageLimit), offset: String(offset) })
        params.set('sort_by', 'requested_at')
        params.set('sort_dir', 'desc')
        if (Array.isArray(dateFilter) && dateFilter[0] && dateFilter[1]) {
          params.set('from_date', dateFilter[0].format('YYYY-MM-DD'))
          params.set('to_date', dateFilter[1].format('YYYY-MM-DD'))
        }
        if (nameFilter && nameFilter.trim()) params.set('name', nameFilter.trim())
        const res = await fetch(`/gauge-tracker?${params.toString()}`, {
          headers: getAuthHeaders()
        })
        if (!res.ok) break
        const data = await res.json().catch(()=>[])
        const arr = Array.isArray(data) ? data : []
        all.push(...arr)
        if (arr.length < pageLimit) break
        offset += pageLimit
      }
      
      const subset = all.filter(r => {
        const sOk = statusFilter ? String(r.status||'').toLowerCase() === String(statusFilter).toLowerCase() : true
        const dOk = Array.isArray(dateFilter) && dateFilter[0] && dateFilter[1]
          ? (() => {
              try {
                const dt = r.requested_at ? dayjs(r.requested_at) : null
                if (!dt) return false
                const fromOk = dt.isSame(dateFilter[0], 'day') || dt.isAfter(dateFilter[0], 'day')
                const toOk = dt.isSame(dateFilter[1], 'day') || dt.isBefore(dateFilter[1], 'day')
                return fromOk && toOk
              } catch { return false }
            })()
          : true
        return sOk && dOk
      })
      
      if (subset.length === 0) { message.info('No records to export'); return }
      
      const getActionTime = (r) => {
        const s = String(r.status||'').toLowerCase()
        if (s === 'returned') return r.returned_at
        if (s === 'rejected') return r.accepted_at
        if (s === 'accepted') return r.accepted_at
        return r.requested_at
      }
      
      const toTs = (t) => { try { return t ? new Date(t).getTime() : 0 } catch { return 0 } }
      subset.sort((a,b) => {
        const tb = toTs(getActionTime(b)) - toTs(getActionTime(a))
        if (tb !== 0) return tb
        return (Number(b.id)||0) - (Number(a.id)||0)
      })
      
      const doc = new jsPDF({ orientation: 'landscape' })
      const filters = []
      if (statusFilter) filters.push(`Status=${String(statusFilter).toUpperCase()}`)
      if (Array.isArray(dateFilter) && dateFilter[0] && dateFilter[1]) filters.push(`Date Range=${dateFilter[0].format('YYYY-MM-DD')}–${dateFilter[1].format('YYYY-MM-DD')}`)
      if (nameFilter && nameFilter.trim()) filters.push(`Name~"${nameFilter.trim()}"`)
      
      if (filters.length) {
        doc.setFontSize(9)
        doc.text(`Filters: ${filters.join(', ')}`, 14, 24)
      }
      
      const head = [[
        'Equipment', 'Range', 'IDFN', 'Location', 'Make/Model', 'Requested By', 'Requested At', 'Status', 'Accepted By', 'Accepted At', 'Returned By', 'Returned At', 'Purpose', 'Return Condition'
      ]]
      
      const body = subset.map(r => [
        String(r.name_of_the_equipment ?? ''),
        (Array.isArray(r.ranges) && r.ranges.length ? r.ranges.join(', ') : ''),
        String(r.idfn_no ?? ''),
        String(r.location ?? ''),
        String(r.make_model ?? ''),
        String(r.requested_by ?? ''),
        r.requested_at ? new Date(r.requested_at).toLocaleString() : '',
        String((r.status||'').toUpperCase()),
        String(r.accepted_by ?? ''),
        r.accepted_at ? new Date(r.accepted_at).toLocaleString() : '',
        String(r.returned_by ?? ''),
        r.returned_at ? new Date(r.returned_at).toLocaleString() : '',
        String(r.purpose ?? ''),
        r.return_status ? (r.return_status === 'Custom' && r.return_remarks ? r.return_remarks : r.return_status) : (r.return_remarks || '')
      ])
      
      const didDrawPage = buildAutoTablePageHook(doc, 'Gauge Tracker')
      const topMargin = filters.length ? 36 : 28
      doc.autoTable({ head, body, margin: { top: topMargin, bottom: 16, left: 14, right: 14 }, styles: { fontSize: 8 }, didDrawPage })
      const anyFilter = Boolean(statusFilter) || (Array.isArray(dateFilter) && dateFilter[0] && dateFilter[1]) || (nameFilter && nameFilter.trim())
      const fname = anyFilter ? `gauge-tracker_filtered_${formatNow()}.pdf` : `gauge-tracker_all_${formatNow()}.pdf`
      doc.save(fname)
    } catch (e) {
      message.error('Failed to generate PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleResetAllTools = async () => {
    try {
      const res = await fetch('/admin/free-all-tools', { 
        method: 'POST',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error(await res.text() || 'Failed to reset')
      const data = await res.json().catch(()=>({}))
      message.success(`All tools freed${data?.gauge_requests_updated!=null?` (${data.gauge_requests_updated})`:''}`)
      fetchRows()
      setResetConfirmOpen(false)
    } catch (e) {
      message.error(typeof e?.message === 'string' ? e.message : 'Failed to reset')
    }
  }

  const FilterContent = () => (
    <div className="filter-group">
      <div className="filter-field">
        <div className="filter-label">Equipment name</div>
        <AutoComplete
          value={nameFilter}
          options={nameOptions}
          onSearch={(text)=>{ setNameFilter(text); fetchNameSuggest(text) }}
          onSelect={(v)=>{ setNameFilter(v) }}
          allowClear
          placeholder="Search equipment names"
          filterOption={false}
          style={{ width: '100%' }}
        />
      </div>
      
      <div className="filter-field">
        <div className="filter-label">Status</div>
        <Select
          allowClear
          placeholder="Select status"
          value={statusFilter}
          onChange={(v)=>setStatusFilter(v)}
          style={{ width: '100%' }}
          options={[
            { label: 'Requested', value: 'requested' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Returned', value: 'returned' },
          ]}
        />
      </div>
      
      <div className="filter-field">
        <div className="filter-label">Requested date range</div>
        <Space.Compact style={{ width: '100%' }}>
          <DatePicker
            style={{ width: '50%' }}
            placeholder="From date"
            value={Array.isArray(dateFilter) ? dateFilter[0] : null}
            onChange={(d)=> setDateFilter(d ? [d, Array.isArray(dateFilter)? dateFilter[1] : null] : (Array.isArray(dateFilter)? [null, dateFilter[1]] : null))}
            allowClear
          />
          <DatePicker
            style={{ width: '50%' }}
            placeholder="To date"
            value={Array.isArray(dateFilter) ? dateFilter[1] : null}
            onChange={(d)=> setDateFilter(d ? [Array.isArray(dateFilter)? dateFilter[0] : null, d] : (Array.isArray(dateFilter)? [dateFilter[0], null] : null))}
            allowClear
          />
        </Space.Compact>
      </div>
      
      <Space style={{ marginTop: 8 }}>
        <button 
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '13px' }}
          onClick={()=>{ 
            setStatusFilter(undefined); 
            setDateFilter(null); 
            setNameFilter(''); 
            setCurrentPage(1); 
            fetchRows({ page: 0 }) 
          }}
        >
          Reset
        </button>
        <button 
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: '13px' }}
          onClick={()=>{ 
            setCurrentPage(1); 
            fetchRows({ page: 0 }); 
            setFilterOpen(false) 
          }}
        >
          Apply
        </button>
      </Space>
    </div>
  )

  const logsTab = (
    <div className="content-card">
      <div className="controls-row">
        <Popover
          title="Filter Options"
          trigger="click"
          open={filterOpen}
          onOpenChange={setFilterOpen}
          content={<FilterContent />}
          placement="bottomLeft"
          overlayClassName="filter-popover"
        >
          <button className="btn-secondary">
            <FilterOutlined />
            <span>Filters</span>
          </button>
        </Popover>
        
        <div className="button-group">
          <button
            className="btn-secondary"
            onClick={() => { setCurrentPage(1); fetchRows({ page:0, reset:true }) }}
          >
            <ReloadOutlined />
            <span>Refresh</span>
          </button>
          <button
            className="btn-danger"
            onClick={() => setResetConfirmOpen(true)}
          >
            <ExclamationCircleOutlined />
            <span>Free All Tools</span>
          </button>
          <button 
            className="btn-primary" 
            onClick={exportTrackerPDF} 
            disabled={exporting}
          >
            <DownloadOutlined />
            <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Table
            columns={columns}
            dataSource={pageRows}
            loading={loading}
            pagination={false}
            bordered
            className="gauge-tracker-table"
            scroll={{ x: 1500, y: 'calc(100vh - 450px)' }}
            style={{ flex: 1, height: '100%' }}
            onChange={() => {
              setCurrentPage(1)
              fetchRows({ page: 0 })
            }}
          />
        </div>
      </div>
      <div className="pagination-wrapper" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <Pagination
          current={currentPage}
          total={totalItems}
          pageSize={pageSize}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
          pageSizeOptions={['10', '20', '50', '100']}
        />
      </div>
    </div>
  )

  return (
    <div className="gauge-tracker-container">
      <style>{styles}</style>

      <div className="page-header">
        <h1 className="page-title">Gauge Tracker</h1>
      </div>
      
      <Tabs
        defaultActiveKey="logs"
        items={[
          {
            key: 'logs',
            label: 'Logs',
            children: logsTab,
          },
          {
            key: 'analytics',
            label: 'Analytics',
            children: <Analytics />,
          },
        ]}
      />

      <Modal
        title="Confirm Reset"
        open={resetConfirmOpen}
        onCancel={() => setResetConfirmOpen(false)}
        footer={
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </button>
            <button 
              className="btn-submit" 
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
              onClick={handleResetAllTools}
            >
              Free All Tools
            </button>
          </div>
        }
        width={440}
        centered
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <ExclamationCircleOutlined style={{ color: '#f59e0b', fontSize: 20, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, marginBottom: 8, fontWeight: 500, color: '#1f2937' }}>
              Are you sure you want to free all tools?
            </p>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              This action will mark all currently accepted/requested tools as returned. 
              This cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}