import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Table, Button, Input, Space, message, Modal, Pagination, Form } from 'antd'
import { ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ShoppingCartOutlined, DownloadOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { loadJsPDF, buildAutoTablePageHook, formatNow } from '../utils/pdfExport.js'
import EquipmentImportModal from './EquipmentImportModal'

const { TextArea } = Input

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
  .equipment-container {
    padding: 24px;
    background: #f5f7fa;
  }

  .equipment-header {
    margin-bottom: 24px;
  }

  .equipment-title {
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

  .controls-wrapper {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .controls-wrapper input {
    border-color: #d1d5db !important;
  }

  .controls-wrapper input:hover,
  .controls-wrapper input:focus {
    border-color: #1a1f2e !important;
  }

  .btn-primary,
  .ant-btn-primary {
    background: #1a1f2e !important;
    border: none !important;
    color: #fff !important;
    height: 40px;
    padding: 0 16px;
    border-radius: 6px;
    font-weight: 500;
  }

  .btn-primary:hover,
  .ant-btn-primary:hover {
    background: #252b3d !important;
    color: #fff !important;
  }

  .btn-secondary,
  .ant-btn-default {
    background: #fff !important;
    border: 1px solid #d1d5db !important;
    color: #374151 !important;
    height: 40px;
    padding: 0 16px;
    border-radius: 6px;
    font-weight: 500;
  }

  .btn-secondary:hover,
  .ant-btn-default:hover {
    border-color: #9ca3af !important;
    color: #1f2937 !important;
    background: #f9fafb !important;
  }

  .btn-text {
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    width: 32px;
    height: 32px;
  }

  .btn-text-edit {
    color: #3b82f6;
  }

  .btn-text-edit:hover {
    background: #eff6ff;
  }

  .btn-text-delete {
    color: #ef4444;
  }

  .btn-text-delete:hover {
    background: #fef2f2;
  }

  .equipment-table .ant-table-thead > tr > th {
    background: #f3f4f6 !important;
    color: #111827 !important;
    font-weight: 600;
    border-bottom: 2px solid #d1d5db !important;
    padding: 14px 16px;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .equipment-table .ant-table-tbody > tr:hover {
    background: #f9fafb;
  }

  .idfn-badge {
    background: #eff6ff;
    color: #2563eb;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 12px;
  }

  .ant-modal-header {
    background: #1a1f2e;
    border-bottom: none;
    padding: 20px 24px;
    border-radius: 8px 8px 0 0;
  }

  .ant-modal-title {
    color: #e4e6eb;
    font-size: 18px;
    font-weight: 600;
  }

  .ant-modal-close {
    top: 20px;
    right: 24px;
  }

  .ant-modal-close-x {
    color: #e4e6eb;
    font-size: 18px;
    width: 32px;
    height: 32px;
    line-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .ant-modal-close-x:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .ant-modal-content {
    border-radius: 8px;
    overflow: hidden;
  }

  .ant-modal-body {
    padding: 24px;
  }

  .ant-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .ant-form-item-label > label {
    font-weight: 500;
    color: #374151;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .modal-grid .full-width {
    grid-column: 1 / -1;
  }

  /* Purpose Modal Specific Styles */
  .purpose-modal-content {
    padding: 8px 0;
  }

  .purpose-modal-label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 12px;
    display: block;
  }

  .purpose-modal-info {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .purpose-modal-info-label {
    font-size: 12px;
    color: #075985;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .purpose-modal-info-value {
    font-size: 14px;
    color: #0c4a6e;
    font-weight: 600;
  }

  .ant-input-textarea-show-count::after {
    font-size: 12px;
    color: #9ca3af;
  }

  .ant-modal-footer .ant-btn {
    height: 40px;
    padding: 0 20px;
    border-radius: 6px;
    font-weight: 500;
    min-width: 100px;
  }
`

export default function EquipmentTable({ mode = 'admin' }) {
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editRow, setEditRow] = useState(null)
  const [requestedBy] = useState(() => localStorage.getItem('username') || 'operator')
  const [requesting, setRequesting] = useState({})
  const [requestedMap, setRequestedMap] = useState({})
  const [purposeModalOpen, setPurposeModalOpen] = useState(false)
  const [purposeModalGauge, setPurposeModalGauge] = useState(null)
  const [purposeValue, setPurposeValue] = useState('')
  const [holderMap, setHolderMap] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const qDebounceRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/gauge-tracker?limit=500', {
          headers: getAuthHeaders()
        })
        if (!res.ok) return
        const data = await res.json().catch(() => [])
        const map = {}
        for (const r of (Array.isArray(data) ? data : [])) {
          if (r.gauge_id && !r.returned_at && (r.status === 'accepted' || r.status === 'requested')) {
            map[r.gauge_id] = r.requested_by || r.accepted_by || ''
          }
        }
        if (!cancelled) setHolderMap(map)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ 
        limit: String(pageSize), 
        offset: String((currentPage - 1) * pageSize),
        sort_by: 'name_of_the_equipment',
        sort_dir: 'asc'
      })
      if (q.trim()) params.set('q', q.trim())
      const res = await fetch(`/equipment?${params.toString()}`, {
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setTotalItems(data.total || 0)
      setItems((Array.isArray(data.items) ? data.items : []).map(r => ({ ...r, key: r.gauge_id })))
    } catch (err) {
      message.error('Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [currentPage, pageSize])

  useEffect(() => {
    if (qDebounceRef.current) clearTimeout(qDebounceRef.current)
    qDebounceRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchData()
    }, 300)
  }, [q])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/gauge-tracker?requested_by=${encodeURIComponent(requestedBy)}`, {
          headers: getAuthHeaders()
        })
        if (!res.ok) return
        const arr = await res.json().catch(() => [])
        const map = {}
        for (const r of (Array.isArray(arr) ? arr : [])) {
          if (r.gauge_id && !r.returned_at && (r.status === 'requested' || r.status === 'accepted')) {
            map[r.gauge_id] = true
          }
        }
        if (!cancelled) setRequestedMap(map)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [requestedBy])

  const handleAdd = async (values) => {
    setSubmitLoading(true)
    try {
      const res = await fetch('/equipment', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...values,
          ranges: values.ranges ? values.ranges.split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []
        })
      })
      if (!res.ok) throw new Error('Failed')
      message.success('Equipment added')
      setAdding(false)
      form.resetFields()
      fetchData()
    } catch {
      message.error('Failed to add')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleUpdate = async (values) => {
    setSubmitLoading(true)
    try {
      const res = await fetch(`/equipment/${editRow.gauge_id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...values,
          ranges: values.ranges ? values.ranges.split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []
        })
      })
      if (!res.ok) throw new Error('Failed')
      message.success('Equipment updated')
      setEditing(false)
      editForm.resetFields()
      fetchData()
    } catch {
      message.error('Failed to update')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Equipment',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this equipment? This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      centered: true,
      okButtonProps: { style: { order: 1 } },
      cancelButtonProps: { style: { order: 2 } },
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <OkBtn />
          <CancelBtn />
        </>
      ),
      onOk: async () => {
        try {
          await fetch(`/equipment/${id}`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
          })
          message.success('Equipment deleted successfully')
          fetchData()
        } catch (e) {
          message.error(e.message || 'Failed to delete equipment')
        }
      }
    })
  }

  const openEdit = (row) => {
    const toISO = (v) => {
      if (!v) return ''
      const d = new Date(v)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    setEditRow(row)
    editForm.setFieldsValue({
      name_of_the_equipment: row.name_of_the_equipment || '',
      idfn_no: row.idfn_no || '',
      location: row.location || '',
      make_model: row.make_model || '',
      ranges: Array.isArray(row.ranges) ? row.ranges.join(', ') : '',
      overall_measurement_uncertainty: row.overall_measurement_uncertainty || '',
      receipt_date: toISO(row.receipt_date),
      calibration_freq_months: row.calibration_freq_months ?? '',
      date_of_last_calibration: toISO(row.date_of_last_calibration),
      calibration_due: toISO(row.calibration_due),
      pcr_number: row.pcr_number ?? ''
    })
    setEditing(true)
  }

  const submitRequest = async () => {
    const gid = purposeModalGauge?.gauge_id
    
    if (!purposeValue?.trim()) {
      message.warning('Please enter the purpose for requesting this equipment')
      return
    }

    setPurposeModalOpen(false)
    try {
      setRequesting(prev => ({ ...prev, [gid]: true }))
      const res = await fetch('/gauge-tracker', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          gauge_id: gid,
          name_of_the_equipment: purposeModalGauge.name_of_the_equipment,
          idfn_no: purposeModalGauge.idfn_no,
          quantity: 1,
          requested_by: requestedBy,
          purpose: purposeValue?.trim() || null
        })
      })
      if (!res.ok) throw new Error('Failed')
      setRequestedMap(prev => ({ ...prev, [gid]: true }))
      message.success('Request submitted successfully')
      setPurposeValue('')
    } catch {
      message.error('Failed to submit request')
    } finally {
      setRequesting(prev => ({ ...prev, [gid]: false }))
    }
  }

  const exportPDF = async () => {
    try {
      const jsPDF = await loadJsPDF()
      const res = await fetch('/equipment?limit=5000', {
        headers: getAuthHeaders()
      })
      const data = await res.json()
      const all = data.items || []
      if (!all.length) return message.info('No data')
      const doc = new jsPDF({ orientation: 'landscape' })
      doc.autoTable({
        head: [['#', 'Name', 'Make', 'Range', 'Location', 'IDFN', 'Last Cal', 'Due', 'PCR']],
        body: all.map((r, i) => [
          i + 1,
          r.name_of_the_equipment || '',
          r.make_model || '',
          (r.ranges || []).join(', '),
          r.location || '',
          r.idfn_no || '',
          r.date_of_last_calibration ? new Date(r.date_of_last_calibration).toLocaleDateString() : '',
          r.calibration_due ? new Date(r.calibration_due).toLocaleDateString() : '',
          r.pcr_number || ''
        ]),
        styles: { fontSize: 8 },
        margin: { top: 24, bottom: 14, left: 14, right: 14 },
        didDrawPage: buildAutoTablePageHook(doc, 'Gauge Inventory')
      })
      doc.save(`inventory_${formatNow()}.pdf`)
      message.success('PDF exported')
    } catch {
      message.error('Export failed')
    }
  }

  const columns = useMemo(() => {
    const base = [
      { title: 'Sl. No.', width: 80, align: 'center', render: (_, __, i) => ((currentPage - 1) * pageSize) + i + 1 },
      { title: 'Equipment', dataIndex: 'name_of_the_equipment', ellipsis: true, width: 200 },
      { title: 'Location', dataIndex: 'location', width: 100, align: 'center' },
      { title: 'Make/Model', dataIndex: 'make_model', ellipsis: true, width: 140 },
      { 
        title: 'Range', 
        dataIndex: 'ranges', 
        width: 160,
        render: (v) => Array.isArray(v) && v.length ? v.join(', ') : '—'
      },
      { 
        title: 'IDFN', 
        dataIndex: 'idfn_no', 
        width: 110,
        align: 'center',
        render: (t) => t ? <span className="idfn-badge">{t}</span> : ''
      },
      { title: 'PCR', dataIndex: 'pcr_number', width: 90, align: 'center' },
      { 
        title: 'Last Cal', 
        dataIndex: 'date_of_last_calibration', 
        width: 100,
        align: 'center',
        render: (v) => v ? new Date(v).toLocaleDateString() : ''
      },
      { 
        title: 'Due', 
        dataIndex: 'calibration_due', 
        width: 100,
        align: 'center',
        render: (v) => v ? new Date(v).toLocaleDateString() : ''
      }
    ]

    if (mode === 'admin') {
      base.push({
        title: 'Actions',
        width: 100,
        align: 'center',
        render: (_, row) => (
          <Space size="small">
            <button className="btn-text btn-text-edit" onClick={() => openEdit(row)}>
              <EditOutlined />
            </button>
            <button className="btn-text btn-text-delete" onClick={() => handleDelete(row.gauge_id)}>
              <DeleteOutlined />
            </button>
          </Space>
        )
      })
    } else {
      base.push({
        title: 'Request',
        width: 140,  // Increased from 100 to 140 to accommodate longer text
        align: 'center',
        render: (_, row) => {
          const holder = holderMap[row.gauge_id]
          const disabled = !!holder || requestedMap[row.gauge_id] || requesting[row.gauge_id]
          return (
            <Button
              type="primary"
              size="small"
              icon={<ShoppingCartOutlined />}
              onClick={() => { 
                setPurposeModalGauge(row)
                setPurposeValue('')
                setPurposeModalOpen(true)
              }}
              disabled={disabled}
              style={{
                whiteSpace: 'normal',
                height: 'auto',
                minHeight: '32px',
                lineHeight: '1.2',
                padding: '4px 8px',
                minWidth: '100px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: holder ? '#f59e0b' : undefined, // Amber color when tool is with someone
                borderColor: holder ? '#d97706' : undefined,    // Darker amber border
                color: holder ? '#1f2937' : undefined,         // Darker text for better contrast
                opacity: disabled ? 0.6 : 1,
                ':hover': {
                  backgroundColor: holder ? '#d97706' : undefined, // Slightly darker on hover
                  borderColor: holder ? '#b45309' : undefined,
                  color: holder ? '#1f2937' : undefined
                },
                ':active': {
                  backgroundColor: holder ? '#b45309' : undefined, // Even darker when clicked
                  borderColor: holder ? '#92400e' : undefined
                }
              }}
            >
              {holder ? `With ${holder}` : requestedMap[row.gauge_id] ? 'Requested' : 'Request'}
            </Button>
          )
        }
      })
    }
    return base
  }, [mode, holderMap, requestedMap, requesting, currentPage, pageSize])

  return (
    <div className="equipment-container">
      <style>{styles}</style>
      <div className="equipment-header">
        <h1 className="equipment-title">Equipment Used for Calibration</h1>
      </div>
      <div className="content-card">
        <div className="controls-wrapper">
          <Input.Search
            placeholder="Search equipment"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            {mode === 'admin' && (
              <>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setAdding(true)}
                  style={{ height: '40px' }}
                >
                  Add Equipment
                </Button>
                <Button 
                  type="default" 
                  icon={<UploadOutlined />} 
                  onClick={() => setImportModalVisible(true)}
                  style={{ 
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#1a1f2e',
                    fontWeight: '500'
                  }}
                >
                  Import
                </Button>
              </>
            )}
            <Button 
              type="default" 
              icon={<DownloadOutlined />} 
              onClick={exportPDF}
              style={{ height: '40px' }}
            >
              Export PDF
            </Button>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Table
              columns={columns}
              dataSource={items}
              loading={loading}
              pagination={false}
              scroll={{ x: 1100, y: 'calc(100vh - 500px)' }}
              bordered
              className="equipment-table"
              style={{ flex: 1, height: '100%' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
            onChange={(page, size) => { setCurrentPage(page); setPageSize(size) }}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      </div>

      {/* Add Modal */}
      <Modal title="Add Equipment" open={adding} onCancel={() => { setAdding(false); form.resetFields() }} footer={null} width={700}>
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <div className="modal-grid">
            <Form.Item label="Equipment Name" name="name_of_the_equipment" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="IDFN" name="idfn_no" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Location" name="location">
              <Input />
            </Form.Item>
            <Form.Item label="Make/Model" name="make_model">
              <Input />
            </Form.Item>
            <Form.Item label="Ranges" name="ranges" className="full-width">
              <TextArea rows={2} placeholder="Comma separated" />
            </Form.Item>
            <Form.Item label="Uncertainty" name="overall_measurement_uncertainty">
              <Input />
            </Form.Item>
            <Form.Item label="Receipt Date" name="receipt_date">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Cal Freq (months)" name="calibration_freq_months">
              <Input type="number" />
            </Form.Item>
            <Form.Item label="Last Cal Date" name="date_of_last_calibration">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Due Date" name="calibration_due">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="PCR Number" name="pcr_number">
              <Input type="number" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={submitLoading} style={{ width: 100 }}>Save</Button>
            <Button onClick={() => { setAdding(false); form.resetFields() }} style={{ width: 100 }}>Cancel</Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="Edit Equipment" open={editing} onCancel={() => { setEditing(false); editForm.resetFields() }} footer={null} width={700}>
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <div className="modal-grid">
            <Form.Item label="Equipment Name" name="name_of_the_equipment" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="IDFN" name="idfn_no" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Location" name="location">
              <Input />
            </Form.Item>
            <Form.Item label="Make/Model" name="make_model">
              <Input />
            </Form.Item>
            <Form.Item label="Ranges" name="ranges" className="full-width">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Uncertainty" name="overall_measurement_uncertainty">
              <Input />
            </Form.Item>
            <Form.Item label="Receipt Date" name="receipt_date">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Cal Freq (months)" name="calibration_freq_months">
              <Input type="number" />
            </Form.Item>
            <Form.Item label="Last Cal Date" name="date_of_last_calibration">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Due Date" name="calibration_due">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="PCR Number" name="pcr_number">
              <Input type="number" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={submitLoading} style={{ width: 100 }}>Update</Button>
            <Button onClick={() => { setEditing(false); editForm.resetFields() }} style={{ width: 100 }}>Cancel</Button>
          </div>
        </Form>
      </Modal>

      {/* Purpose Modal - Redesigned */}
      <Modal 
        title="Request Equipment" 
        open={purposeModalOpen} 
        onCancel={() => {
          setPurposeModalOpen(false)
          setPurposeValue('')
        }}
        footer={[
          
          <Button
            key="submit"
            type="primary"
            onClick={submitRequest}
          >
            Submit Request
          </Button>,
          
          <Button
            key="cancel"
            onClick={() => {
              setPurposeModalOpen(false)
              setPurposeValue('')
            }}
          >
            Cancel
          </Button>,
        ]}
        width={520}
        centered
      >
        <div className="purpose-modal-content">
          <div className="purpose-modal-info">
            <div className="purpose-modal-info-label">Equipment</div>
            <div className="purpose-modal-info-value">
              {purposeModalGauge?.name_of_the_equipment || '—'}
            </div>
            {purposeModalGauge?.idfn_no && (
              <>
                <div className="purpose-modal-info-label" style={{ marginTop: 8 }}>IDFN</div>
                <div className="purpose-modal-info-value">{purposeModalGauge.idfn_no}</div>
              </>
            )}
          </div>
          
          <label className="purpose-modal-label">
            Purpose for Request <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <TextArea
            value={purposeValue}
            onChange={(e) => setPurposeValue(e.target.value)}
            placeholder="Please specify the purpose for requesting this equipment..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>

      {/* Import Modal */}
      <EquipmentImportModal 
        open={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onSuccess={() => {
          setImportModalVisible(false);
          fetchData(); // Refresh the table after successful import
        }}
      />
    </div>
  )
}