import React, { useEffect, useRef, useState } from 'react'
import { Card, Button, Space, Table, Input, message, Modal, Image, Tag, Pagination, AutoComplete, Select } from 'antd'
import { ReloadOutlined, DownloadOutlined, EyeOutlined, QrcodeOutlined, BarcodeOutlined, IdcardOutlined, DownOutlined } from '@ant-design/icons'

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
  .label-manager-container {
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

  .page-subtitle {
    margin: 8px 0 0 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
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

  .controls-group {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .label-type-dropdown {
    min-width: 160px;
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

  .label-table .ant-table-thead > tr > th {
    background: #f9fafb;
    color: #1a1f2e;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    padding: 14px 16px;
  }

  .label-table .ant-table-tbody > tr > td {
    padding: 14px 16px;
    color: #1f2937;
  }

  .label-table .ant-table-tbody > tr:hover {
    background: #f9fafb;
  }

  .idfn-badge {
    background: #eff6ff;
    color: #2563eb;
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    display: inline-block;
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
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
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

  .preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .preview-label {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
  }

  .preview-image {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    background: #f9fafb;
  }

  @media (max-width: 768px) {
    .controls-row {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-box,
    .controls-group {
      width: 100%;
    }
    
    .label-type-dropdown {
      width: 100%;
    }
    
    .label-manager-container {
      padding: 16px;
    }
    
    .content-card {
      padding: 16px;
    }
  }
`

export default function LabelManager() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState(null)
  const [preview, setPreview] = useState({ open: false, idfn: '', imgUrl: '' })
  const [labelType, setLabelType] = useState('qr')
  const [suggestions, setSuggestions] = useState([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const qDebounceRef = useRef(null)
  const bcRef = useRef(null)

  // Label type options for dropdown
  const labelTypeOptions = [
    {
      value: 'qr',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QrcodeOutlined />
          <span>QR Code</span>
        </div>
      ),
    },
    {
      value: 'barcode',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarcodeOutlined />
          <span>Barcode</span>
        </div>
      ),
    },
    {
      value: 'rfid',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IdcardOutlined />
          <span>RFID Card</span>
        </div>
      ),
    },
  ]

  async function fetchEquipment(params = {}) {
    setLoading(true)
    const current = params.current ?? currentPage
    const limit = params.pageSize ?? pageSize
    const offset = (current - 1) * limit
    const qs = new URLSearchParams()
    qs.set('limit', String(limit))
    qs.set('offset', String(offset))
    if (q?.trim()) qs.set('q', q.trim())
    if (sortBy) qs.set('sort_by', sortBy)
    if (sortDir) qs.set('sort_dir', sortDir)
    try {
      const res = await fetch(`/equipment?${qs.toString()}`, {
        headers: getAuthHeaders()
      })
      const json = await res.json()
      const batch = json.items ?? []
      setItems(batch)
      setTotalItems(json.total || 0)
    } catch (e) {
      message.error('Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment({ current: currentPage, pageSize: pageSize })
  }, [currentPage, pageSize, sortBy, sortDir])

  useEffect(() => {
    if (qDebounceRef.current) clearTimeout(qDebounceRef.current)
    qDebounceRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchEquipment({ current: 1, pageSize })
    }, 300)
    return () => { if (qDebounceRef.current) clearTimeout(qDebounceRef.current) }
  }, [q])

  useEffect(() => {
    try { bcRef.current = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('equipment-events') : null } catch { bcRef.current = null }
    const onMsg = (ev) => {
      try { if (ev && ev.data && ev.data.type === 'equipment:changed') { setCurrentPage(1); fetchEquipment({ current: 1, pageSize }) } } catch {}
    }
    try { bcRef.current && bcRef.current.addEventListener('message', onMsg) } catch {}
    return () => { try { bcRef.current && bcRef.current.removeEventListener('message', onMsg); bcRef.current.close() } catch {} }
  }, [])

  const handlePageChange = (page, size) => {
    setCurrentPage(page)
    setPageSize(size)
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

  const renderRFIDCard = (idfn, name) => {
    try {
      const w = 480, h = 300
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      
      // Background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      
      // Border
      ctx.strokeStyle = '#1a1f2e'
      ctx.lineWidth = 4
      ctx.strokeRect(6, 6, w - 12, h - 12)
      
      // Header background
      ctx.fillStyle = '#1a1f2e'
      ctx.fillRect(0, 0, w, 80)
      
      // Title
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('RFID ASSET CARD', w/2, 50)
      
      // IDFN section
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('IDENTIFICATION NUMBER', 24, 130)
      
      ctx.fillStyle = '#1a1f2e'
      ctx.font = 'bold 36px Arial'
      ctx.fillText(String(idfn || ''), 24, 180)
      
      // Equipment name
      if (name) {
        ctx.fillStyle = '#6b7280'
        ctx.font = '16px Arial'
        ctx.fillText('EQUIPMENT', 24, 220)
        
        ctx.fillStyle = '#1f2937'
        ctx.font = '18px Arial'
        const maxWidth = w - 48
        let text = String(name)
        if (ctx.measureText(text).width > maxWidth) {
          while (text.length > 0 && ctx.measureText(text + '…').width > maxWidth) {
            text = text.slice(0, -1)
          }
          text = text + '…'
        }
        ctx.fillText(text, 24, 250)
      }
      
      // Footer
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, h - 40, w, 40)
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('SCAN RFID TAG FOR ASSET INFORMATION', w/2, h - 15)
      
      return canvas.toDataURL('image/png')
    } catch {
      return ''
    }
  }

  const openPreview = async (record) => {
    const idfn = record?.idfn_no
    if (!idfn) { message.warning('No IDFN for this item'); return }
    
    let url = ''
    if (labelType === 'qr') {
      url = `/qrcode/by-idfn/${encodeURIComponent(idfn)}.png?t=${Date.now()}`
    } else if (labelType === 'barcode') {
      url = `/barcode/code128/by-idfn/${encodeURIComponent(idfn)}.png?t=${Date.now()}`
    } else {
      url = renderRFIDCard(idfn, record?.name_of_the_equipment)
      setPreview({ open: true, idfn, imgUrl: url })
      return
    }
    
    try {
      // Fetch the image with authentication headers
      const res = await fetch(url, {
        headers: getAuthHeaders()
      })
      
      if (!res.ok) {
        message.error(`Failed to load ${labelType === 'qr' ? 'QR code' : 'barcode'}`)
        return
      }
      
      // Convert to blob and create data URL
      const blob = await res.blob()
      const dataUrl = URL.createObjectURL(blob)
      setPreview({ open: true, idfn, imgUrl: dataUrl })
    } catch (error) {
      console.error('Error loading preview:', error)
      message.error(`Failed to load ${labelType === 'qr' ? 'QR code' : 'barcode'}`)
    }
  }

  const downloadLabel = async (record) => {
    const { idfn } = record
    try {
      if (labelType === 'qr') {
        const res = await fetch(`/qrcode/by-idfn/${encodeURIComponent(idfn)}.png`, {
          headers: getAuthHeaders()
        })
        if (!res.ok) { message.error('Failed to generate QR code'); return }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `IDFN_${idfn}_QR.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        message.success('QR code downloaded successfully')
      } else if (labelType === 'barcode') {
        const res = await fetch(`/barcode/code128/by-idfn/${encodeURIComponent(idfn)}.png`, {
          headers: getAuthHeaders()
        })
        if (!res.ok) { message.error('Failed to generate barcode'); return }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `IDFN_${idfn}_Barcode.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        message.success('Barcode downloaded successfully')
      } else {
        const dataUrl = renderRFIDCard(idfn, record?.name_of_the_equipment)
        if (!dataUrl) { message.error('Failed to render RFID card'); return }
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `IDFN_${idfn}_RFID.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        message.success('RFID card downloaded successfully')
      }
    } catch {
      message.error('Failed to download label')
    }
  }

  const columns = [
    { 
      title: 'Sl. No.', 
      key: 'sl_no', 
      width: 80, 
      align: 'center',
      render: (_, __, index) => ((currentPage - 1) * pageSize) + index + 1,
    },
    { 
      title: 'Equipment', 
      dataIndex: 'name_of_the_equipment', 
      key: 'name', 
      ellipsis: true,
      width: 200,
      sorter: (a,b) => String(a.name_of_the_equipment||'').localeCompare(String(b.name_of_the_equipment||''))
    },
    { 
      title: 'IDFN', 
      dataIndex: 'idfn_no', 
      key: 'idfn', 
      width: 140, 
      align: 'center',
      render: (v)=> v ? <span className="idfn-badge">{v}</span> : <span style={{ color: '#9ca3af' }}>—</span> 
    },
    { 
      title: 'Last Calibration', 
      dataIndex: 'date_of_last_calibration', 
      key: 'last', 
      width: 140, 
      align: 'center',
      render: (v)=> v ? new Date(v).toLocaleDateString() : <span style={{ color: '#9ca3af' }}>—</span> 
    },
    { 
      title: 'Calibration Due', 
      dataIndex: 'calibration_due', 
      key: 'due', 
      width: 140, 
      align: 'center',
      render: (v)=> v ? new Date(v).toLocaleDateString() : <span style={{ color: '#9ca3af' }}>—</span> 
    },
    {
      title: '', 
      key: 'actions', 
      width: 140,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <button
            className="btn-text btn-text-view"
            onClick={() => openPreview(record)} 
            disabled={!record.idfn_no}
            title="Preview Label"
          >
            <EyeOutlined />
          </button>
          <button
            className="btn-text btn-text-download"
            onClick={() => downloadLabel(record)} 
            disabled={!record.idfn_no}
            title="Download Label"
          >
            <DownloadOutlined />
          </button>
        </Space>
      )
    }
  ]

  return (
    <div className="label-manager-container">
      <style>{styles}</style>

      <div className="page-header">
        <h1 className="page-title">Label Manager</h1>
        <p className="page-subtitle">
          Generate QR codes, barcodes, and RFID cards for equipment based on IDFN.
          Labels encode asset information for easy scanning and identification.
        </p>
      </div>

      <div className="content-card">
        <div className="controls-row">
          <div className="search-box">
            <AutoComplete
              options={suggestions}
              value={q}
              onChange={(val)=> setQ(val)}
              onSearch={fetchSuggest}
              onSelect={(val)=> { 
                setQ(val); 
                setCurrentPage(1); 
                fetchEquipment({ current: 1, pageSize, reset: true }) 
              }}
              style={{ width: '100%' }}
            >
              <Input.Search
                allowClear
                loading={suggestLoading}
                placeholder="Search equipment by name, IDFN, or location"
                onChange={(e)=> setQ(e.target.value)}
                onSearch={()=>{ 
                  setCurrentPage(1); 
                  fetchEquipment({ current: 1, pageSize, reset: true }) 
                }}
                enterButton
                className="custom-search-input"
              />
            </AutoComplete>
          </div>
          
          <div className="controls-group">
            <div className="label-type-dropdown">
              <Select
                value={labelType}
                onChange={setLabelType}
                options={labelTypeOptions}
                style={{ width: '100%' }}
                dropdownStyle={{ minWidth: '180px' }}
                suffixIcon={<DownOutlined />}
              />
            </div>
            
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Table
              rowKey={(r) => `${r.gauge_id}`}
              loading={loading}
              columns={columns}
              dataSource={items}
              pagination={false}
              bordered
              className="label-table"
              scroll={{ x: 1000, y: 'calc(100vh - 450px)' }}
              style={{ flex: 1, height: '100%' }}
              onChange={(_, __, sorter) => {
                const s = Array.isArray(sorter) ? sorter[0] : sorter
                const field = s && s.field ? s.field : null
                const order = s && s.order ? (s.order === 'descend' ? 'desc' : 'asc') : null
                setSortBy(field)
                setSortDir(order)
                setCurrentPage(1)
                fetchEquipment({ current: 1, pageSize })
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

      <Modal
        title={`${labelType === 'qr' ? 'QR Code' : labelType === 'barcode' ? 'Barcode' : 'RFID Card'} Preview`}
        open={preview.open}
        onCancel={() => setPreview({ open: false, idfn: '', imgUrl: '' })}
        footer={
          <div className="modal-footer">
           
            <button 
              className="btn-submit" 
              onClick={() => downloadLabel({ idfn_no: preview.idfn })} 
              disabled={!preview.idfn}
            >
              Download
            </button>
             <button 
              className="btn-cancel" 
              onClick={() => setPreview({ open: false, idfn: '', imgUrl: '' })}
            >
              Close
            </button>
          </div>
        }
        width={500}
        centered
        destroyOnClose
      >
        {preview.imgUrl ? (
          <div className="preview-container">
            <div className="preview-label">
              IDFN: <strong>{preview.idfn}</strong>
            </div>
            <div className="preview-image">
              <Image 
                src={preview.imgUrl} 
                width={labelType === 'rfid' ? 400 : 300} 
                height={labelType === 'rfid' ? 250 : 300} 
                style={{ objectFit: 'contain' }} 
                alt={`${labelType} preview`}
              />
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
              {labelType === 'qr' && 'QR code encodes asset information for easy scanning'}
              {labelType === 'barcode' && 'Barcode contains asset identification number'}
              {labelType === 'rfid' && 'RFID card format for asset management systems'}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
            No preview available
          </div>
        )}
      </Modal>
    </div>
  )
}