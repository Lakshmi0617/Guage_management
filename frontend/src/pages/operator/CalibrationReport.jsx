import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Table, Button, Space, message, Input, Modal, List, Divider, Spin } from 'antd'
import { DownloadOutlined, FolderOutlined, SearchOutlined, ReloadOutlined, FileOutlined, EyeOutlined, CloseOutlined } from '@ant-design/icons'

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
  .calibration-report-container {
    padding: 16px;
    background: #f5f7fa;
    min-height: calc(100vh - 64px);
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1f2e;
    margin: 0;
  }

  .content-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 16px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    height: calc(100vh - 150px);
  }

  .controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;
  }

  .search-box {
    width: 280px;
  }

  .search-box .ant-input-affix-wrapper {
    border-radius: 4px;
    border: 1px solid #d1d5db;
    height: 32px;
  }

  .search-box .ant-input {
    font-size: 13px;
  }

  .search-box .ant-input-group-addon button {
    height: 32px;
    font-size: 13px;
  }

  .btn-secondary {
    background: #fff;
    border: 1px solid #d1d5db;
    color: #374151;
    height: 32px;
    padding: 0 12px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .table-container {
    overflow-x: auto;
  }

  .table-scroll-container {
    max-height: 500px;
    overflow: auto;
  }

  .load-message {
    text-align: center;
    padding: 8px;
    color: #6b7280;
    font-size: 12px;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }

  .idfn-tag {
    background: #eff6ff;
    color: #2563eb;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 600;
    font-size: 11px;
    display: inline-block;
  }

  .professional-table .ant-table-thead > tr > th {
    background: #f9fafb;
    color: #374151;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 1px solid #e5e7eb;
    padding: 8px 10px;
  }

  .professional-table .ant-table-tbody > tr > td {
    padding: 8px 10px;
    font-size: 12px;
    color: #1f2937;
  }

  .professional-table .ant-table-tbody > tr:hover {
    background: #f3f4f6;
  }

  .table-row-light {
    background: #ffffff;
  }

  .table-row-dark {
    background: #f9fafb;
  }

  .file-action-btn {
    font-size: 11px;
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
  }

  .file-action-btn-view {
    color: #3b82f6;
    border-color: #3b82f6;
  }

  .file-action-btn-zip {
    color: #10b981;
    border-color: #10b981;
  }

  .ant-modal-header {
    background: #1a1f2e;
    padding: 12px 16px;
    border-bottom: none;
  }

  .ant-modal-title {
    color: #e4e6eb;
    font-size: 16px;
    font-weight: 600;
  }

  .ant-modal-close-x {
    color: #e4e6eb;
    font-size: 16px;
    width: 28px;
    height: 28px;
    line-height: 28px;
  }

  .ant-modal-content {
    border-radius: 6px;
  }

  .ant-modal-body {
    padding: 16px;
  }

  .folder-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    margin-bottom: 4px;
  }

  .folder-icon {
    color: #f59e0b;
    font-size: 14px;
  }

  .folder-name {
    font-weight: 600;
    font-size: 14px;
    color: #1f2937;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-list .ant-list-item {
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .file-list .ant-list-item:last-child {
    border-bottom: none;
  }

  .file-list .ant-list-item-meta-title {
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .file-list .ant-list-item-meta-description {
    font-size: 11px;
    color: #6b7280;
  }

  .file-actions {
    display: flex;
    gap: 6px;
  }

  .file-action-link {
    font-size: 12px;
    color: #3b82f6;
    cursor: pointer;
  }

  .file-action-link:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  .preview-modal .ant-modal {
    top: 20px;
    padding-bottom: 0;
  }

  .preview-modal .ant-modal-content {
    height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
  }

  .preview-modal .ant-modal-body {
    flex: 1;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f5f5f5;
  }

  .preview-iframe {
    flex: 1;
    border: none;
    background: white;
  }

  .preview-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
  }

  .preview-error {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: #fafafa;
    color: #6b7280;
  }

  .preview-error-icon {
    font-size: 48px;
    color: #dc2626;
    margin-bottom: 16px;
  }

  .preview-error-text {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .preview-error-subtext {
    font-size: 14px;
    color: #9ca3af;
  }

  .no-files-message {
    text-align: center;
    padding: 20px;
    color: #6b7280;
    font-size: 13px;
  }

  .checking-files {
    font-size: 12px;
    color: #6b7280;
  }

  .no-reports {
    font-size: 12px;
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    .controls-row {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-box {
      width: 100%;
    }

    .preview-modal .ant-modal {
      max-width: 100%;
      margin: 0;
      top: 0;
    }

    .preview-modal .ant-modal-content {
      height: 100vh;
    }
  }
`

export default function CalibrationReport() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(null)
  const [filesModalOpen, setFilesModalOpen] = useState(false)
  const [filesModalGauge, setFilesModalGauge] = useState(null)
  const [filesModalData, setFilesModalData] = useState([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [hasFilesMap, setHasFilesMap] = useState({})
  const [hasFilesLoading, setHasFilesLoading] = useState(false)
  const scrollRef = useRef(null)
  const objectUrlRef = useRef(null)
  const username = (()=>{ try { return localStorage.getItem('username') || '' } catch { return '' } })()
  const qDebounceRef = useRef(null)

  const fetchRows = async (opts = {}) => {
    if (!username) return
    setLoading(true)
    try {
      const cur = typeof opts.page === 'number' ? opts.page : page
      const limit = 50
      const offset = cur * limit
      
      const tr = await fetch(`/gauge-tracker?requested_by=${encodeURIComponent(username)}`, {
          headers: getAuthHeaders()
        })
      if (!tr.ok) throw new Error('Failed to load tracker')
      const tdata = await tr.json()
      const heldIds = new Set(
        (Array.isArray(tdata) ? tdata : [])
          .filter(r => String(r.status||'').toLowerCase() === 'accepted' && !r.returned_at)
          .map(r => r.gauge_id)
      )
      if (heldIds.size === 0) { setRows([]); return }

      const res = await fetch(`/reports?limit=${limit}&offset=${offset}${q ? `&q=${encodeURIComponent(q)}` : ''}`, {
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error('Failed to load reports')
      const data = await res.json()
      const items = Array.isArray(data.items) ? data.items : []
      const filtered = items.filter(r => heldIds.has(r.gauge_id))
      const batch = filtered.map(r => ({ ...r, key: r.gauge_id }))
      setHasMore(items.length === limit)
      if (cur === 0 || opts.reset) setRows(batch)
      else setRows(prev => [...prev, ...batch])
      
      try {
        const ids = (cur === 0 || opts.reset) ? batch.map(r=>r.gauge_id) : [...new Set([...(rows||[]).map(r=>r.gauge_id), ...batch.map(r=>r.gauge_id)])]
        await prefetchHasFiles(ids)
      } catch {}
    } catch (e) {
      message.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const normalizeFolderName = (s) => {
    try {
      const v = String(s||'').trim().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9-_]/g, '_')
        .replace(/_+/g, '_')
      return v || 'untitled'
    } catch { return 'untitled' }
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
        reports = Array.isArray(reports) ? reports : []
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
          return an.localeCompare(bn)
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

  const openPreview = async (gauge_id, reportId, file) => {
    const fileName = file?.original_name || '';
    setPreviewTitle(fileName || 'Report Preview');
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewOpen(true);
    
    try {
      // Fetch the file as blob and create object URL
      const timestamp = new Date().getTime();
      const response = await fetch(`/gauges/${gauge_id}/reports/${reportId}/files/${file.id}/stream?view=1&t=${timestamp}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to load file');
      }
      
      const blob = await response.blob();
      
      // Revoke previous object URL if exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      
      // Create new object URL
      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;
      
      setPreviewUrl(objectUrl);
      setPreviewLoading(false);
    } catch (error) {
      setPreviewLoading(false);
      setPreviewError('Failed to load preview. Try downloading the file instead.');
      console.error('Preview error:', error);
    }
  }

  const handleDownload = (gauge_id, reportId, file) => {
    const url = `/gauges/${gauge_id}/reports/${reportId}/files/${file.id}/stream?download=1`;
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.original_name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const prefetchHasFiles = async (gaugeIds=[]) => {
    const unique = Array.from(new Set((Array.isArray(gaugeIds)?gaugeIds:[]).filter(Boolean)))
    if (!unique.length) return
    setHasFilesLoading(true)
    try {
      const updates = {}
      await Promise.all(unique.map(async (gid) => {
        try {
          const reps = await fetch(`/gauges/${gid}/reports`, {
            headers: getAuthHeaders()
          })
          const reports = reps.ok ? await reps.json().catch(()=>[]) : []
          let anyFiles = false
          if (Array.isArray(reports) && reports.length) {
            for (const r of reports) {
              try {
                const fr = await fetch(`/gauges/${gid}/reports/${r.id}/files`, {
                  headers: getAuthHeaders()
                })
                if (!fr.ok) continue
                const files = await fr.json().catch(()=>[])
                if (Array.isArray(files) && files.length) { anyFiles = true; break }
              } catch {}
            }
          }
          updates[gid] = anyFiles
        } catch { updates[gid] = false }
      }))
      setHasFilesMap(prev => ({ ...prev, ...updates }))
    } finally {
      setHasFilesLoading(false)
    }
  }

  useEffect(() => { fetchRows({ page: 0 }) }, [username])

  useEffect(() => {
    if (!username) return
    if (qDebounceRef.current) clearTimeout(qDebounceRef.current)
    qDebounceRef.current = setTimeout(() => {
      setPage(0)
      setHasMore(true)
      fetchRows({ page: 0, reset: true })
    }, 300)
    return () => { if (qDebounceRef.current) clearTimeout(qDebounceRef.current) }
  }, [q, username])

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const onScroll = (e) => {
    const el = e.currentTarget
    if (!hasMore || loading) return
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24
    if (nearBottom) { const nxt = page + 1; setPage(nxt); fetchRows({ page: nxt }) }
  }

  const columns = useMemo(() => [
    { 
      title: '#', 
      key: 'sl_no', 
      width: 50, 
      align: 'center', 
      render: (_val, _row, index) => index + 1 
    },
    { 
      title: 'Equipment', 
      dataIndex: 'name_of_the_equipment', 
      key: 'name', 
      width: 180,
      ellipsis: true,
      render: (text) => text ? <span title={text}>{text}</span> : <span className="no-reports">—</span>
    },
    { 
      title: 'IDFN', 
      dataIndex: 'idfn_no', 
      key: 'idfn', 
      width: 100, 
      align: 'center',
      render:(v)=> v ? <span className="idfn-tag">{v}</span> : <span className="no-reports">—</span> 
    },
    { 
      title: 'Last Cal', 
      dataIndex: 'date_of_last_calibration', 
      key: 'last', 
      width: 100, 
      render:(v)=> v ? new Date(v).toLocaleDateString() : <span className="no-reports">—</span> 
    },
    { 
      title: 'Freq', 
      dataIndex: 'calibration_freq_months', 
      key: 'freq', 
      width: 70,
      align: 'center',
      render: (v) => v ? `${v}m` : <span className="no-reports">—</span>
    },
    { 
      title: 'Due', 
      dataIndex: 'calibration_due', 
      key: 'due', 
      width: 100, 
      render:(v)=> v ? new Date(v).toLocaleDateString() : <span className="no-reports">—</span> 
    },
    { 
      title: 'Reports', 
      key: 'report', 
      width: 140, 
      fixed: 'right', 
      align:'center', 
      render:(_,row)=> {
        const val = hasFilesMap[row.gauge_id]
        if (typeof val === 'undefined') {
          return <span className="checking-files">Checking…</span>
        }
        if (val === false) return <span className="no-reports">No files</span>
        return (
          <Space size="small">
            <Button 
              className="file-action-btn file-action-btn-view"
              size="small"
              onClick={()=> openFilesModal(row)}
            >
              <FileOutlined />
            </Button>
            <Button 
              className="file-action-btn file-action-btn-zip"
              size="small"
              icon={<DownloadOutlined />}
              onClick={()=> window.open(`/gauges/${row.gauge_id}/reports/zip`, '_self')}
              title="Download ZIP"
            />
          </Space>
        )
      }
    },
  ], [hasFilesMap, hasFilesLoading])

  return (
    <div className="calibration-report-container">
      <style>{styles}</style>
      
      <div className="page-header">
        <h1 className="page-title">My Calibration Reports</h1>
      </div>

      <div className="content-card">
        <div className="controls-row">
          <div className="search-box">
            <Input.Search
              placeholder="Search equipment..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onSearch={() => { setPage(0); setHasMore(true); fetchRows({ page: 0, reset: true }) }}
              allowClear
              size="small"
              className="custom-search-input"
              enterButton={<Button type="default" size="small" icon={<SearchOutlined />} style={{ background: '#f0f0f0', borderColor: '#d9d9d9', color: '#595959' }} />}
            />
          </div>
          
          <button
            className="btn-secondary"
            onClick={() => { setPage(0); setHasMore(true); fetchRows({ page: 0, reset: true }) }}
          >
            <ReloadOutlined />
            <span>Refresh</span>
          </button>
        </div>

        <div className="table-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'auto' }} onScroll={onScroll} ref={scrollRef}>
              <Table
                columns={columns}
                dataSource={rows}
                loading={loading}
                pagination={false}
                size="small"
                bordered
                className="professional-table"
                rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
                scroll={{ x: 700, y: 'calc(100vh - 350px)' }}
                style={{ minHeight: '300px' }}
              />
              <div className="load-message" style={{ textAlign: 'center', padding: '8px', color: '#666' }}>
                {loading ? 'Loading…' : (hasMore ? '' : 'End of list')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Files Modal */}
      <Modal
        title={filesModalGauge ? `Files - ${filesModalGauge.name_of_the_equipment || ''}` : 'Files'}
        open={filesModalOpen}
        onCancel={() => { setFilesModalOpen(false); setFilesModalGauge(null); setFilesModalData([]) }}
        footer={null}
        width={700}
        destroyOnClose
      >
        {filesLoading ? (
          <div className="no-files-message">Loading files...</div>
        ) : (
          filesModalData.length === 0 ? (
            <div className="no-files-message">No files found for this gauge</div>
          ) : (
            <div>
              {filesModalData.map((group) => (
                <div key={`folder-${group.folder}`} style={{ marginBottom: 16 }}>
                  <div className="folder-header">
                    <FolderOutlined className="folder-icon" />
                    <span className="folder-name">{group.folder}</span>
                  </div>
                  <Divider style={{ margin: '4px 0 12px 0' }} />
                  <List
                    className="file-list"
                    size="small"
                    dataSource={group.items}
                    bordered
                    renderItem={(it) => (
                      <List.Item
                        actions={[
                          <a
                            key="preview"
                            className="file-action-link"
                            onClick={(e) => { 
                              e.preventDefault();
                              openPreview(filesModalGauge.gauge_id, it.reportId, it.file);
                            }}
                            title="Preview file"
                          >
                            <EyeOutlined /> Preview
                          </a>,
                          <a
                            key="download"
                            className="file-action-link"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDownload(filesModalGauge.gauge_id, it.reportId, it.file);
                            }}
                            title="Download file"
                          >
                            <DownloadOutlined /> Download
                          </a>,
                        ]}
                      >
                        <List.Item.Meta
                          title={it.file.original_name || it.file.content_type || 'file'}
                          description={
                            <span>
                              {(it.file.size_bytes||0).toLocaleString()} bytes • {it.file.content_type || ''}
                            </span>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={previewTitle}
        open={previewOpen}
        onCancel={() => { 
          setPreviewOpen(false); 
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
          setPreviewUrl(null); 
          setPreviewTitle('');
          setPreviewLoading(false);
          setPreviewError(null);
        }}
        footer={null}
        width="95%"
        className="preview-modal"
        destroyOnClose
        centered
      >
        <div className="preview-container">
          {previewLoading && !previewError && (
            <div className="preview-loading">
              <Spin size="large" tip="Loading preview..." />
            </div>
          )}
          {previewError && (
            <div className="preview-error">
              <CloseOutlined className="preview-error-icon" />
              <div className="preview-error-text">Failed to load preview</div>
              <div className="preview-error-subtext">{previewError}</div>
            </div>
          )}
          {previewUrl && !previewError && (
            <iframe
              src={previewUrl}
              className="preview-iframe"
              title="File Preview"
            />
          )}
        </div>
      </Modal>
    </div>
  )
}