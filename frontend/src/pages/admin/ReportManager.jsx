import React, { useEffect, useMemo, useRef, useState } from 'react'
import PdfJsViewer from '../../components/PdfViewer/PdfJsViewer'
import '../../components/PdfViewer/pdf-viewer.css'
import { Table, Button, Input, Space, DatePicker, InputNumber, Upload, message, Modal, Form, Pagination, AutoComplete, List, Divider, Popconfirm, Tabs, Spin, Card, Tag } from 'antd'
import { ReloadOutlined, UploadOutlined, DownloadOutlined, EyeOutlined, FolderOutlined, FileTextOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

// Helper function to get auth headers
const getAuthHeaders = (contentType = 'application/json') => {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (contentType) {
    headers['Content-Type'] = contentType
  }
  return headers
}

const styles = `
  .report-manager-container {
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

  .btn-text-view {
    color: #3b82f6;
  }

  .btn-text-download {
    color: #10b981;
  }

  .btn-text-delete {
    color: #ef4444;
  }

  .report-table .ant-table-thead > tr > th {
    background: #f9fafb;
    color: #1a1f2e;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    padding: 14px 16px;
  }

  .report-table .ant-table-tbody > tr > td {
    padding: 14px 16px;
    color: #1f2937;
  }

  .report-table .ant-table-tbody > tr:hover {
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
    font-weight: 500;
    font-size: 12px;
    display: inline-block;
  }

  .status-updated {
    background: #d1fae5;
    color: #065f46;
  }

  .status-pending {
    background: #fef3c7;
    color: #92400e;
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

  .file-item {
    transition: all 0.2s ease;
  }

  .file-item:hover {
    background: #f9fafb;
  }

  .folder-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 6px;
    margin-bottom: 12px;
  }

  .folder-icon {
    color: #f59e0b;
    font-size: 16px;
  }

  .folder-name {
    font-weight: 600;
    color: #1f2937;
    flex: 1;
  }

  .upload-zone {
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    background: #f9fafb;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .upload-zone:hover {
    border-color: #1a1f2e;
    background: #f0f9ff;
  }

  .upload-icon {
    font-size: 48px;
    color: #9ca3af;
    margin-bottom: 16px;
  }

  .ant-form-item-label > label {
    font-weight: 500;
    color: #374151;
  }

  .ant-input,
  .ant-input-number,
  .ant-picker {
    border-radius: 6px;
    border-color: #d1d5db !important;
  }

  .ant-input:hover,
  .ant-input-number:hover,
  .ant-picker:hover {
    border-color: #9ca3af !important;
  }

  .ant-input:focus,
  .ant-input-number:focus,
  .ant-picker-focused {
    border-color: #1a1f2e !important;
    box-shadow: 0 0 0 2px rgba(26, 31, 46, 0.1);
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
    
    .report-manager-container {
      padding: 16px;
    }
    
    .content-card {
      padding: 16px;
    }
  }
`

export default function ReportManager() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [activeRow, setActiveRow] = useState(null)
  const [form] = Form.useForm()
  const folderWatch = Form.useWatch ? Form.useWatch('folder', form) : undefined
  const [selectedFiles, setSelectedFiles] = useState([])
  const [reportTitle, setReportTitle] = useState('')
  const [titleOptions, setTitleOptions] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('name_of_the_equipment')
  const [sortDir, setSortDir] = useState('asc')
  const [uploadPrefilledFolder, setUploadPrefilledFolder] = useState('')
  const [filesModalOpen, setFilesModalOpen] = useState(false)
  const [filesModalGauge, setFilesModalGauge] = useState(null)
  const [filesModalData, setFilesModalData] = useState([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerGauge, setViewerGauge] = useState(null)
  const [viewerData, setViewerData] = useState({ reports: [] })
  const [viewerLoading, setViewerLoading] = useState(false)
  const [viewerTitle, setViewerTitle] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const qDebounceRef = useRef(null)
  const bcRef = useRef(null)

  const normalizeFolderName = (s) => {
    try {
      const v = String(s||'').trim().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9-_]/g, '_')
        .replace(/_+/g, '_')
      return v || 'untitled'
    } catch { return 'untitled' }
  }

  const hasAnyFilesForGauge = async (gauge_id) => {
    try {
      const reps = await fetch(`/gauges/${gauge_id}/reports`, {
        headers: getAuthHeaders()
      })
      const arr = reps.ok ? await reps.json().catch(()=>[]) : []
      const reports = Array.isArray(arr) ? arr : []
      for (const r of reports) {
        const fr = await fetch(`/gauges/${gauge_id}/reports/${r.id}/files`, {
          headers: getAuthHeaders()
        })
        if (!fr.ok) continue
        const files = await fr.json().catch(()=>[])
        if (Array.isArray(files) && files.length) return true
      }
      return false
    } catch { return false }
  }

  const openUploadForFolder = (folderName) => {
    if (!filesModalGauge) return
    try {
      setActiveRow(filesModalGauge)
      setSelectedFiles([])
      setReportTitle(folderName || '')
      setUploadPrefilledFolder(folderName || '')
      setModalOpen(true)
      try { form.setFieldsValue({ folder: folderName || '' }) } catch {}
      setTimeout(() => { try { form.setFieldsValue({ folder: folderName || '' }) } catch {} }, 0)
    } catch {}
  }

  const openFilesModal = async (row) => {
    setFilesModalGauge(row)
    setFilesModalOpen(true)
    setFilesLoading(true)
    try {
      const reps = await fetch(`/gauges/${row.gauge_id}/reports`, {
        headers: getAuthHeaders()
      })
      let reports = []
      if (reps.ok) {
        reports = await reps.json().catch(()=>[])
      }
      const all = []
      for (const r of reports) {
        const fr = await fetch(`/gauges/${row.gauge_id}/reports/${r.id}/files`, {
          headers: getAuthHeaders()
        })
        if (fr.ok) {
          const files = await fr.json().catch(()=>[])
          if (Array.isArray(files) && files.length) {
            all.push({ report: r, files })
          }
        }
      }
      const groupMap = new Map()
      for (const entry of all) {
        const folder = normalizeFolderName((entry.report?.title || `report_${entry.report?.id}`))
        if (!groupMap.has(folder)) groupMap.set(folder, [])
        for (const f of entry.files) {
          groupMap.get(folder).push({ reportId: entry.report.id, file: f })
        }
      }
      const grouped = Array.from(groupMap.entries()).map(([folder, items]) => {
        const sorted = [...items].sort((a,b) => {
          const an = (a.file?.original_name||'').toLowerCase()
          const bn = (b.file?.original_name||'').toLowerCase()
          const byName = an.localeCompare(bn)
          if (byName !== 0) return byName
          const ad = new Date(a.file?.uploaded_at||0).getTime()||0
          const bd = new Date(b.file?.uploaded_at||0).getTime()||0
          return ad - bd
        })
        return ({ folder, items: sorted })
      })
      grouped.sort((a,b) => String(a.folder).localeCompare(String(b.folder)))
      setFilesModalData(grouped)
    } catch {
      message.error('Failed to load files')
      setFilesModalData([])
    } finally {
      setFilesLoading(false)
    }
  }

  const openViewer = async (row) => {
    setViewerGauge(row)
    setViewerOpen(true)
    setViewerLoading(true)
    setViewerTitle('')
    try {
      const reps = await fetch(`/gauges/${row.gauge_id}/reports`, {
        headers: getAuthHeaders()
      })
      let reports = []
      if (reps.ok) {
        reports = await reps.json().catch(()=>[])
        reports = Array.isArray(reports) ? reports : []
      }
      const all = []
      for (const r of reports) {
        const fr = await fetch(`/gauges/${row.gauge_id}/reports/${r.id}/files`, {
          headers: getAuthHeaders()
        })
        const files = fr.ok ? await fr.json().catch(()=>[]) : []
        const arr = Array.isArray(files) ? files : []
        if (arr.length) {
          all.push({ report: r, files: arr })
        }
      }
      const totalFiles = all.reduce((n, it) => n + (Array.isArray(it.files) ? it.files.length : 0), 0)
      if (totalFiles <= 1) {
        const single = all.find(it => (it.files||[]).length)
        setViewerData({ reports: single ? [{ report: { id: (single.report?.id), title: `Report for ${row.gauge_id}` }, files: single.files }] : [] })
        try { const f = single && Array.isArray(single.files) ? (single.files[0] || null) : null; if (f) setViewerTitle(f.original_name || '') } catch {}
      } else {
        setViewerData({ reports: all })
        try {
          const firstEntry = all[0]
          const f = firstEntry && Array.isArray(firstEntry.files) ? (firstEntry.files[0] || null) : null
          setViewerTitle((f && f.original_name) || (firstEntry?.report?.title) || '')
        } catch {}
      }
    } catch {
      setViewerData({ reports: [] })
    } finally {
      setViewerLoading(false)
    }
  }

  const openFileInViewer = (gauge_id, reportEntry, file) => {
    try {
      setViewerGauge({ gauge_id, name_of_the_equipment: filesModalGauge?.name_of_the_equipment })
    } catch {
      setViewerGauge({ gauge_id })
    }
    setViewerData({ reports: [{ report: { id: reportEntry.id, title: reportEntry.title }, files: [file] }] })
    setViewerOpen(true)
    setViewerLoading(false)
    try { setViewerTitle(file?.original_name || '') } catch {}
  }

  const deleteFile = async (gauge_id, report_id, file_id) => {
    try {
      const res = await fetch(`/gauges/${gauge_id}/reports/${report_id}/files/${file_id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error(await res.text() || 'Delete failed')
      if (filesModalGauge) await openFilesModal(filesModalGauge)
      message.success('File deleted')
    } catch (e) {
      message.error(typeof e?.message === 'string' ? e.message : 'Delete failed')
    }
  }

  useEffect(() => {
    if (qDebounceRef.current) clearTimeout(qDebounceRef.current)
    qDebounceRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchRows({ page: 0, reset: true })
    }, 300)
    return () => { if (qDebounceRef.current) clearTimeout(qDebounceRef.current) }
  }, [q])

  useEffect(() => {
    if (modalOpen && activeRow) {
      try { form.resetFields() } catch {}
      const freqVal = (activeRow.calibration_freq_months != null)
        ? Number(activeRow.calibration_freq_months)
        : (activeRow.freq != null ? Number(activeRow.freq) : undefined)
      form.setFieldsValue({
        last: activeRow.date_of_last_calibration ? dayjs(activeRow.date_of_last_calibration) : null,
        freq: isNaN(freqVal) ? undefined : freqVal,
        folder: (uploadPrefilledFolder || reportTitle || '')
      })
      if (freqVal == null || isNaN(freqVal)) {
        (async () => {
          try {
            const r1 = await fetch(`/reports?limit=1&offset=0&q=${encodeURIComponent(activeRow.idfn_no || activeRow.name_of_the_equipment || '')}`)
            if (r1.ok) {
              const d1 = await r1.json()
              const item = Array.isArray(d1.items) ? d1.items.find(x => x.gauge_id === activeRow.gauge_id) : null
              const f1 = item && item.calibration_freq_months != null ? Number(item.calibration_freq_months) : undefined
              if (f1 != null && !isNaN(f1)) { form.setFieldsValue({ freq: f1 }); return }
            }
          } catch {}
          try {
            const r2 = await fetch(`/equipment?limit=1&offset=0&q=${encodeURIComponent(activeRow.idfn_no || activeRow.name_of_the_equipment || '')}`)
            if (r2.ok) {
              const d2 = await r2.json()
              const item2 = Array.isArray(d2.items) ? d2.items.find(x => x.gauge_id === activeRow.gauge_id) : null
              const f2 = item2 && item2.calibration_freq_months != null ? Number(item2.calibration_freq_months) : undefined
              if (f2 != null && !isNaN(f2)) { form.setFieldsValue({ freq: f2 }) }
            }
          } catch {}
        })()
      }
    }
  }, [modalOpen, activeRow])

  useEffect(() => {
    if (modalOpen) {
      try { form.setFieldsValue({ folder: (uploadPrefilledFolder || reportTitle || '') }) } catch {}
    }
  }, [modalOpen, reportTitle, uploadPrefilledFolder])

  useEffect(() => {
    let cancelled = false
    const loadTitles = async () => {
      if (!modalOpen || !activeRow?.gauge_id) { setTitleOptions([]); return }
      try {
        const res = await fetch(`/gauges/${activeRow.gauge_id}/reports`)
        const arr = res.ok ? await res.json().catch(()=>[]) : []
        const titles = Array.isArray(arr) ? Array.from(new Set(arr.map(it => (it.title || '').trim()).filter(Boolean))) : []
        if (!cancelled) setTitleOptions(titles.map(t => ({ value: t })))
      } catch {
        if (!cancelled) setTitleOptions([])
      }
    }
    loadTitles()
    return () => { cancelled = true }
  }, [modalOpen, activeRow])

  const fetchRows = async (opts = {}) => {
    setLoading(true)
    try {
      const cur = typeof opts.page === 'number' ? opts.page : (currentPage - 1)
      const limit = pageSize
      const offset = cur * limit
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
      if (q?.trim()) params.set('q', q.trim())
      if (sortBy) params.set('sort_by', sortBy)
      if (sortDir) params.set('sort_dir', sortDir)
      let items = []
      let total = 0
      try {
        const res = await fetch(`/reports?${params.toString()}`, {
          headers: getAuthHeaders()
        })
        if (res.ok) {
          const data = await res.json()
          items = Array.isArray(data.items) ? data.items : []
          total = data.total || items.length
        }
      } catch {}
      if (!items.length) {
        const eres = await fetch(`/equipment?${params.toString()}`, {
          headers: getAuthHeaders()
        })
        if (!eres.ok) throw new Error(await eres.text() || 'Failed to load equipment')
        const edata = await eres.json()
        const eq = Array.isArray(edata.items) ? edata.items : []
        items = eq.map(r => ({
          gauge_id: r.gauge_id,
          name_of_the_equipment: r.name_of_the_equipment,
          idfn_no: r.idfn_no,
          location: r.location,
          make_model: r.make_model,
          date_of_last_calibration: r.date_of_last_calibration,
          calibration_due: r.calibration_due,
          calibration_freq_months: r.calibration_freq_months,
          object_key: null,
          updated_by: null,
          updated_at: null,
        }))
        total = edata.total || items.length
      }
      let batch = items.map(r => ({ ...r, key: r.gauge_id }))
      try {
        const cache = JSON.parse(localStorage.getItem('gaugeUpdated') || '{}')
        if (cache && typeof cache === 'object') {
          batch = batch.map(row => {
            const hit = cache[String(row.gauge_id)]
            return hit ? { ...row, updated_by: hit.updated_by, updated_at: hit.updated_at } : row
          })
        }
      } catch {}
      setTotalItems(total)
      setRows(batch)
    } catch (e) {
      message.error(typeof e?.message === 'string' ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRows({ page: currentPage - 1 }) }, [currentPage, pageSize, sortBy, sortDir])

  useEffect(() => {
    try { bcRef.current = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('equipment-events') : null } catch { bcRef.current = null }
    const onMsg = (ev) => {
      try { if (ev && ev.data && ev.data.type === 'equipment:changed') { setCurrentPage(1); fetchRows({ page: 0 }) } } catch {}
    }
    try { bcRef.current && bcRef.current.addEventListener('message', onMsg) } catch {}
    return () => { try { bcRef.current && bcRef.current.removeEventListener('message', onMsg); bcRef.current.close() } catch {} }
  }, [])

  const handlePageChange = (page, size) => {
    setCurrentPage(page)
    if (size !== pageSize) {
      setPageSize(size)
    }
  }

  const fetchSuggest = async (text) => {
    const s = (text || '').trim()
    if (!s) { setSuggestions([]); return }
    setSuggestLoading(true)
    try {
      const res = await fetch(`/equipment/suggest?q=${encodeURIComponent(s)}&limit=10`, {
        headers: getAuthHeaders()
      })
      const data = await res.json().catch(()=>[])
      const opts = Array.isArray(data) ? data.map((it, idx) => ({
        value: it.value,
        label: (
          <div key={`${it.type}-${idx}`} style={{ display:'flex', justifyContent:'space-between' }}>
            <span>{it.value}</span>
            <Tag color={it.type === 'idfn' ? 'blue' : 'default'} style={{ marginLeft: 8, fontSize: '11px' }}>{it.type}</Tag>
          </div>
        )
      })) : []
      setSuggestions(opts)
    } catch { setSuggestions([]) }
    finally { setSuggestLoading(false) }
  }

  const onUpload = async (row, state) => {
    try {
      if (!Array.isArray(state.files) || state.files.length === 0) { 
        message.warning('Select at least one file'); return 
      }
      if (!state.last || !state.freq) { 
        message.warning('Provide last calibration date and frequency'); return 
      }
      const MAX_BYTES = 20 * 1024 * 1024
      const tooBig = (state.files || []).find(f => (f && typeof f.size === 'number' && f.size > MAX_BYTES))
      if (tooBig) {
        message.error('File size must not exceed 20 MB')
        return
      }
      const fd = new FormData()
      const titleValue = (state.folder || reportTitle || `Report for ${row.gauge_id}` || `Report-${Date.now()}`)
      fd.append('title', titleValue)
      fd.append('notes', '')
      fd.append('last_calibration_date', dayjs(state.last).format('YYYY-MM-DD'))
      fd.append('calibration_freq_months', String(state.freq))
      state.files.forEach(f => { if (f) fd.append('files', f) })
      
      const res = await fetch(`/gauges/${row.gauge_id}/reports`, { 
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type for FormData - browser sets it automatically
        },
        body: fd 
      })
      if (!res.ok) {
        const raw = await res.text()
        let msg = raw || 'Upload failed'
        try {
          const j = JSON.parse(raw)
          msg = j?.detail || msg
        } catch {}
        const norm = /413|exceeds\s*20\s*MB/i.test(msg) ? 'File size must not exceed 20 MB' : msg
        throw new Error(norm)
      }
      message.success('Reports uploaded successfully')
      try {
        await openFilesModal(row)
      } catch {}
      try { await fetchRows() } catch {}
      try {
        const uname = (()=>{ try { return localStorage.getItem('username') || 'admin' } catch { return 'admin' } })()
        const nowIso = new Date().toISOString()
        setRows(prev => prev.map(r => r.gauge_id === row.gauge_id ? { ...r, updated_by: uname, updated_at: nowIso } : r))
        const cache = (()=>{ try { return JSON.parse(localStorage.getItem('gaugeUpdated')||'{}') } catch { return {} } })()
        cache[String(row.gauge_id)] = { updated_by: uname, updated_at: nowIso }
        try { localStorage.setItem('gaugeUpdated', JSON.stringify(cache)) } catch {}
      } catch {}
      setModalOpen(false)
      setActiveRow(null)
      setSelectedFiles([])
      setReportTitle('')
      try { form.resetFields() } catch {}
    } catch (e) {
      const m = typeof e?.message === 'string' ? e.message : 'Upload failed'
      const friendly = /413|exceeds\s*20\s*MB/i.test(m) ? 'File size must not exceed 20 MB' : m
      message.error(friendly)
    }
  }

  const columns = useMemo(() => [
    { 
      title: 'Sl. No.', 
      key: 'sl_no', 
      width: 80, 
      align: 'center',
      render: (_val, _row, index) => ((currentPage - 1) * pageSize) + index + 1,
    },
    { 
      title: 'Equipment', 
      dataIndex: 'name_of_the_equipment', 
      key: 'name', 
      ellipsis: true,
      width: 200,
      sorter: (a,b) => String(a.name_of_the_equipment||'').localeCompare(String(b.name_of_the_equipment||'')),
      defaultSortOrder: 'ascend',
      sortDirections: ['ascend', 'descend']
    },
    { 
      title: 'IDFN', 
      dataIndex: 'idfn_no', 
      key: 'idfn', 
      width: 120, 
      align: 'center',
      render:(v)=> v ? <span className="idfn-badge">{v}</span> : <span style={{ color: '#9ca3af' }}>—</span> 
    },
    { 
      title: 'Last Calibration', 
      dataIndex: 'date_of_last_calibration', 
      key: 'last', 
      width: 140, 
      align: 'center',
      render:(v)=> v ? new Date(v).toLocaleDateString() : <span style={{ color: '#9ca3af' }}>—</span> 
    },
    { 
      title: 'Freq (months)', 
      dataIndex: 'calibration_freq_months', 
      key: 'freq', 
      width: 120, 
      align: 'center',
      sorter: (a,b) => (a.calibration_freq_months || 0) - (b.calibration_freq_months || 0)
    },
    { 
      title: 'Due', 
      dataIndex: 'calibration_due', 
      key: 'due', 
      width: 140, 
      align: 'center',
      render:(v)=> v ? new Date(v).toLocaleDateString() : <span style={{ color: '#9ca3af' }}>—</span> 
    },
    { 
      title: 'Updated By', 
      dataIndex: 'updated_by', 
      key: 'updated_by', 
      width: 140, 
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Updated At', 
      dataIndex: 'updated_at', 
      key: 'updated_at', 
      width: 160, 
      align: 'center',
      render:(v)=> v ? new Date(v).toLocaleString() : <span style={{ color: '#9ca3af' }}>—</span> 
    },
    { 
      title: '', 
      key: 'actions', 
      width: 240, 
      align: 'center', 
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <button
            className="btn-text btn-text-view"
            onClick={() => openViewer(row)}
            title="View files"
          >
            <EyeOutlined />
          </button>
          <button
            className="btn-text btn-text-download"
            onClick={async () => { 
              const ok = await hasAnyFilesForGauge(row.gauge_id); 
              if (!ok) { 
                message.info('No files to download'); 
                return 
              } 
              window.open(`/gauges/${row.gauge_id}/reports/zip`, '_self') 
            }}
            title="Download ZIP"
          >
            <DownloadOutlined />
          </button>
          <button
            className="btn-primary"
            style={{ padding: '4px 12px', fontSize: '13px', height: 'auto' }}
            onClick={() => {
              setActiveRow(row)
              setSelectedFiles([])
              setReportTitle('')
              setUploadPrefilledFolder('')
              setModalOpen(true)
            }}
          >
            Upload
          </button>
        </Space>
      )
    },
  ], [currentPage, pageSize])

  return (
    <div className="report-manager-container">
      <style>{styles}</style>

      <div className="page-header">
        <h1 className="page-title">Report Manager</h1>
      </div>

      <div className="content-card">
        <div className="controls-row">
          <div className="search-box">
            <AutoComplete
              options={suggestions}
              value={q}
              onChange={(val)=> setQ(val)}
              onSearch={fetchSuggest}
              onSelect={(val)=> { setQ(val); setCurrentPage(1); fetchRows({ page:0, reset: true }) }}
              style={{ width: '100%' }}
            >
              <Input.Search
                allowClear
                loading={suggestLoading}
                placeholder="Search by name, IDFN, or location"
                onChange={(e)=> setQ(e.target.value)}
                onSearch={()=>{ setCurrentPage(1); fetchRows({ page:0, reset: true }) }}
                enterButton
                className="custom-search-input"
              />
            </AutoComplete>
          </div>
          
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Table
              columns={columns}
              dataSource={rows}
              loading={loading}
              pagination={false}
              bordered
              className="report-table"
              scroll={{ x: 1200, y: 'calc(100vh - 450px)' }}
              style={{ flex: 1, height: '100%' }}
              onChange={(_, __, sorter) => {
                const s = Array.isArray(sorter) ? sorter[0] : sorter
                const field = s && s.field ? s.field : null
                const order = s && s.order ? (s.order === 'descend' ? 'desc' : 'asc') : null
                setSortBy(field)
                setSortDir(order)
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

      {/* Upload Modal */}
      <Modal
        title={activeRow ? `Upload Report - ${activeRow.name_of_the_equipment || ''}` : 'Upload Report'}
        open={modalOpen}
        onCancel={() => { 
          setModalOpen(false); 
          setActiveRow(null); 
          setSelectedFiles([]); 
          setUploadPrefilledFolder(''); 
          try { form.resetFields() } catch {} 
        }}
        footer={
          <div className="modal-footer">
            <button 
              className="btn-cancel" 
              onClick={() => { 
                setModalOpen(false); 
                setActiveRow(null); 
                setSelectedFiles([]); 
                setUploadPrefilledFolder(''); 
                try { form.resetFields() } catch {} 
              }}
            >
              Cancel
            </button>
            <button
              className="btn-submit"
              onClick={async () => {
                try {
                  const values = await form.validateFields()
                  const folderVal = (uploadPrefilledFolder || values.folder || '')
                  try { setReportTitle(folderVal) } catch {}
                  const state = { 
                    last: values.last, 
                    freq: values.freq, 
                    files: selectedFiles, 
                    folder: folderVal 
                  }
                  await onUpload(activeRow, state)
                } catch {}
              }}
            >
              Upload Files
            </button>
          </div>
        }
        width={600}
        centered
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          preserve={false}
          initialValues={{
            last: activeRow && activeRow.date_of_last_calibration ? dayjs(activeRow.date_of_last_calibration) : null,
            freq: (() => {
              if (!activeRow) return undefined
              const v = activeRow.calibration_freq_months ?? activeRow.freq
              const n = Number(v)
              return isNaN(n) ? undefined : n
            })()
          }}
        >
          {!uploadPrefilledFolder && (
            <Form.Item 
              label="Folder Name" 
              name="folder"
              rules={[{ required: true, message: 'Please enter folder name' }]}
              required
            >
              <AutoComplete
                options={titleOptions}
                placeholder="Enter folder name for these files"
                style={{ width: '100%' }}
                allowClear
                filterOption={(input, option) => 
                  (option?.value || '').toLowerCase().includes((input||'').toLowerCase())
                }
              />
            </Form.Item>
          )}
          
          <Form.Item label="Report Files" required>
            <div className="upload-zone">
              <Upload.Dragger
                beforeUpload={(file)=>{ 
                  const MAX_BYTES = 20 * 1024 * 1024
                  if (file && typeof file.size === 'number' && file.size > MAX_BYTES) {
                    message.error('File size must not exceed 20 MB')
                    return Upload.LIST_IGNORE
                  }
                  setSelectedFiles(prev=>[...prev, file]); 
                  return false 
                }}
                maxCount={10}
                accept=".pdf,.png,.jpg,.jpeg,.docx,.csv,.txt"
                multiple
                onChange={(info)=>{
                  const MAX_BYTES = 20 * 1024 * 1024
                  const list = (info?.fileList || []).map(it => it.originFileObj || it.file || it)
                  const filtered = list.filter(f => f && (typeof f.size !== 'number' || f.size <= MAX_BYTES))
                  setSelectedFiles(filtered.filter(Boolean))
                }}
                showUploadList={false}
              >
                <div className="upload-icon">
                  <UploadOutlined />
                </div>
                <p style={{ margin: 0, fontWeight: 500, color: '#374151' }}>
                  Click or drag files to upload
                </p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                  PDF, PNG, JPG, DOCX, CSV, TXT • Max 10 files • 20 MB each
                </p>
                {selectedFiles.length > 0 && (
                  <div style={{ marginTop: 16, textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#059669' }}>
                      {selectedFiles.length} file(s) selected
                    </p>
                  </div>
                )}
              </Upload.Dragger>
            </div>
          </Form.Item>
          
          <Form.Item 
            name="last" 
            label="Last Calibration Date" 
            rules={[{ required: true, message: 'Please select last calibration date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          
          <Form.Item 
            name="freq" 
            label="Calibration Frequency (months)" 
            rules={[{ required: true, message: 'Please enter frequency in months' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }} 
              placeholder="Enter frequency in months"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Files Modal */}
      <Modal
        title={filesModalGauge ? `Files - ${filesModalGauge.name_of_the_equipment || ''}` : 'Files'}
        open={filesModalOpen}
        onCancel={() => { 
          setFilesModalOpen(false); 
          setFilesModalGauge(null); 
          setFilesModalData([]) 
        }}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        {filesLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          filesModalData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FileTextOutlined style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
              <p style={{ color: '#6b7280', marginBottom: 24 }}>No files found for this gauge</p>
              <button
                className="btn-primary"
                onClick={() => openUploadForFolder('')}
              >
                <UploadOutlined />
                <span>Upload New Files</span>
              </button>
            </div>
          ) : (
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {filesModalData.map((group) => (
                <div key={`folder-${group.folder}`} style={{ marginBottom: 24 }}>
                  <div className="folder-header">
                    <FolderOutlined className="folder-icon" />
                    <span className="folder-name">{group.folder}</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '4px 12px', fontSize: '13px', height: 'auto' }}
                      onClick={()=> openUploadForFolder(group.folder)}
                    >
                      <UploadOutlined />
                      <span>Add Files</span>
                    </button>
                  </div>
                  
                  <List
                    size="small"
                    dataSource={group.items}
                    renderItem={(item) => (
                      <List.Item className="file-item">
                        <List.Item.Meta
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <FileTextOutlined style={{ color: '#6b7280', fontSize: 14 }} />
                              <span style={{ fontSize: '14px' }}>
                                {item.file.original_name || 'Unnamed file'}
                              </span>
                            </div>
                          }
                          description={
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {item.file.size_bytes ? `${(item.file.size_bytes / 1024).toFixed(1)} KB` : 'Unknown size'} • 
                              {item.file.uploaded_at ? ` ${new Date(item.file.uploaded_at).toLocaleDateString()}` : ''}
                            </div>
                          }
                        />
                        <Space size="small">
                          <a 
                            href="#" 
                            onClick={(e)=>{ 
                              e.preventDefault(); 
                              openFileInViewer(filesModalGauge.gauge_id, { id: item.reportId, title: group.folder }, item.file) 
                            }}
                            style={{ fontSize: '13px' }}
                          >
                            Open
                          </a>
                          <a 
                            href={`/gauges/${filesModalGauge.gauge_id}/reports/${item.reportId}/files/${item.file.id}/stream?download=1`}
                            style={{ fontSize: '13px' }}
                          >
                            Download
                          </a>
                          <Popconfirm 
                            title="Delete this file?" 
                            onConfirm={() => deleteFile(filesModalGauge.gauge_id, item.reportId, item.file.id)}
                            okText="Delete"
                            cancelText="Cancel"
                            okType="danger"
                          >
                            <a style={{ fontSize: '13px', color:'#ef4444' }}>Delete</a>
                          </Popconfirm>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </Modal>

      {/* Viewer Modal */}
      <Modal
        title={viewerTitle || (viewerGauge ? `Reports - ${viewerGauge.name_of_the_equipment || ''}` : 'Reports')}
        open={viewerOpen}
        onCancel={() => { 
          setViewerOpen(false); 
          setViewerGauge(null); 
          setViewerData({ reports: [] }); 
          setViewerTitle('') 
        }}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', height: '90vh' }}
        destroyOnClose
        centered
      >
        {viewerLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin size="large" />
          </div>
        ) : (
          (Array.isArray(viewerData.reports) && viewerData.reports.length) ? (
            (() => {
              const items = viewerData.reports
              const ext = (name='') => String(name).toLowerCase().split('.').pop()
              const isPdf = (f) => (f?.content_type||'').startsWith('application/pdf') || ['pdf'].includes(ext(f?.original_name||''))
              const isImg = (f) => (f?.content_type||'').startsWith('image/') || ['png','jpg','jpeg','gif','webp','bmp'].includes(ext(f?.original_name||''))
              
              const renderPreviewForFile = (entry, file) => {
                const previewUrl = file ? `/gauges/${viewerGauge.gauge_id}/reports/${entry.report.id}/files/${file.id}/stream?download=0` : null
                return (
                  <div style={{ flex:1, minHeight:0, height:'100%', display:'flex' }}>
                    {file ? (
                      isPdf(file) ? (
                        <div style={{ flex:1, minHeight:0 }}>
                          <PdfJsViewer url={previewUrl} height={'calc(90vh - 56px)'} initialScale={1.0} />
                        </div>
                      ) : (
                        isImg(file) ? (
                          <img 
                            src={previewUrl} 
                            alt={file.original_name||'preview'} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f9fafb' }} 
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
                            <FileTextOutlined style={{ fontSize: 48, color: '#d1d5db' }} />
                            <p style={{ color: '#6b7280' }}>Preview not available for this file type</p>
                            <a 
                              href={previewUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn-secondary"
                              style={{ padding: '8px 16px' }}
                            >
                              Open in new tab
                            </a>
                          </div>
                        )
                      )
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height:'100%', color:'#888' }}>
                        No preview available
                      </div>
                    )}
                  </div>
                )
              }
              
              if (items.length === 1) {
                const entry = items[0]
                const files = Array.isArray(entry.files) ? entry.files : []
                if (files.length > 1) {
                  return (
                    <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', height:'100%' }}>
                      <Tabs
                        style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', height:'100%' }}
                        tabBarStyle={{ padding: '0 16px', marginBottom: 0 }}
                        onChange={(activeKey) => {
                          try {
                            const f = files.find(ff => String(ff.id ?? '') === String(activeKey) || String(files.indexOf(ff)) === String(activeKey))
                            if (f) setViewerTitle(f.original_name || '')
                          } catch {}
                        }}
                        items={files.map((file, idx) => ({
                          key: String(file.id || idx),
                          label: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {isPdf(file) ? '📄' : isImg(file) ? '🖼️' : '📎'}
                              <span>{file.original_name || `File ${idx+1}`}</span>
                            </div>
                          ),
                          children: (
                            <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', height:'100%' }}>
                              {renderPreviewForFile(entry, file)}
                            </div>
                          )
                        }))}
                      />
                    </div>
                  )
                }
                const first = files[0] || null
                return (
                  <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', height:'100%' }}>
                    {renderPreviewForFile(entry, first)}
                  </div>
                )
              }
              
              return (
                <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', height:'100%' }}>
                  <Tabs
                    style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', height:'100%' }}
                    tabBarStyle={{ padding: '0 16px', marginBottom: 0 }}
                    onChange={(activeKey) => {
                      try {
                        const sel = items.find(en => String(en.report.id || '') === String(activeKey))
                        if (sel) {
                          const fs = Array.isArray(sel.files) ? sel.files : []
                          const first = fs.find(isPdf) || fs.find(isImg) || fs[0] || null
                          setViewerTitle((first && first.original_name) || (sel.report?.title) || '')
                        }
                      } catch {}
                    }}
                    items={items.map((entry, idx) => ({
                      key: String(entry.report.id || idx),
                      label: (() => {
                        const files = Array.isArray(entry.files) ? entry.files : []
                        const first = files.find(isPdf) || files.find(isImg) || files[0] || null
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FolderOutlined style={{ fontSize: 12, color: '#f59e0b' }} />
                            <span>{(first?.original_name) || (entry.report.title) || `Report ${idx+1}`}</span>
                          </div>
                        )
                      })(),
                      children: (
                        <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', height:'100%' }}>
                          {(() => {
                            const files = Array.isArray(entry.files) ? entry.files : []
                            const first = files.find(isPdf) || files.find(isImg) || files[0] || null
                            return renderPreviewForFile(entry, first)
                          })()}
                        </div>
                      )
                    }))}
                  />
                </div>
              )
            })()
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
                <p style={{ color: '#6b7280' }}>No reports/files for this gauge</p>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  )
}