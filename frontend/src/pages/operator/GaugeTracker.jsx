import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Table, Button, Space, Tag, message, Popover, Select, DatePicker, Pagination, Input, Modal, Radio, AutoComplete } from 'antd'
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

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
  .equipment-table-container {
    padding: 24px;
    background: #f5f7fa;
    min-height: calc(100vh - 64px);
  }

  .table-header {
    margin-bottom: 24px;
  }

  .table-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1f2e;
    margin: 0;
  }

  .table-wrapper {
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

  .table-container {
    overflow-x: auto;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
  }

  .idfn-tag {
    background: #eff6ff;
    color: #2563eb;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 12px;
  }

  .professional-table .ant-table-thead > tr > th {
    background: #f9fafb;
    color: #1a1f2e;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
  }

  .professional-table .ant-table-tbody > tr:hover {
    background: #f9fafb;
  }

  /* Status Badges */
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

  /* Return Condition Badges */
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

  /* Modal Styles */
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

  .ant-modal-footer .ant-btn {
    height: 40px;
    padding: 0 20px;
    border-radius: 6px;
    font-weight: 500;
    min-width: 100px;
  }

  /* Filter Popover Styles */
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

  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .filter-btn {
    height: 32px;
    padding: 0 16px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
  }

  .filter-btn-reset {
    background: #fff;
    border: 1px solid #d1d5db;
    color: #374151;
  }

  .filter-btn-apply {
    background: #1a1f2e;
    border: 1px solid #1a1f2e;
    color: #fff;
  }

  /* Return Modal Specific Styles */
  .return-modal-equipment-info {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 20px;
  }

  .return-modal-equipment-label {
    font-size: 12px;
    color: #075985;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .return-modal-equipment-value {
    font-size: 14px;
    color: #0c4a6e;
    font-weight: 600;
  }

  .return-modal-section {
    margin-bottom: 20px;
  }

  .return-modal-label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 12px;
    display: block;
  }

  .return-modal-label-required {
    color: #ef4444;
  }

  .return-modal-description {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
    margin-bottom: 12px;
  }

  .ant-radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ant-radio-wrapper {
    font-size: 14px;
    color: #374151;
  }

  .ant-input-textarea-show-count::after {
    font-size: 12px;
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    .controls-row {
      flex-direction: column;
      align-items: stretch;
    }
    
    .button-group {
      width: 100%;
    }
  }
`

export default function OperatorGaugeTracker() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState(null)
  const scrollRef = useRef(null)
  const username = (()=>{ try { return localStorage.getItem('username') || '' } catch { return '' } })()
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState(undefined)
  const [dateFilter, setDateFilter] = useState(null)
  const [nameFilter, setNameFilter] = useState('')
  const [nameOptions, setNameOptions] = useState([])
  const nameFetchRef = useRef(0)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [returnModalRow, setReturnModalRow] = useState(null)
  const [returnCondition, setReturnCondition] = useState('Good')
  const [returnRemarks, setReturnRemarks] = useState('')

  const limit = pageSize
  const fetchRows = async (opts = {}) => {
    if (!username) return
    setLoading(true)
    try {
      const cur = typeof opts.page === 'number' ? opts.page : (currentPage - 1)
      const params = new URLSearchParams({ requested_by: username, limit: String(limit), offset: String(cur * limit) })
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
      if (!res.ok) throw new Error(await res.text() || 'Failed to load')
      const data = await res.json()
      const batch = Array.isArray(data) ? data.map(r=>({ ...r, key: r.id })) : []
      const hdr = res.headers ? res.headers.get('X-Total-Count') : null
      const total = hdr ? Number(hdr) : batch.length
      setTotalItems(Number.isFinite(total) ? total : batch.length)
      setRows(batch)
    } catch (e) {
      message.error(typeof e?.message === 'string' ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRows({ page: currentPage - 1 }) }, [username, currentPage, pageSize, sortBy, sortDir, dateFilter, nameFilter])

  const fetchNameSuggest = async (q) => {
    const cur = ++nameFetchRef.current
    try {
      const qs = new URLSearchParams({ q: q || '', limit: '10' }).toString()
      const res = await fetch(`/equipment/suggest?${qs}`)
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

  const onReturn = (row) => {
    setReturnModalRow(row)
    setReturnCondition('Good')
    setReturnRemarks('')
    setReturnModalOpen(true)
  }

  const submitReturn = async () => {
    const row = returnModalRow
    if (!row) return
    
    if ((returnCondition === 'Bad' || returnCondition === 'Needs Repair') && !returnRemarks.trim()) {
      message.warning('Remarks are required for Bad or Needs Repair condition')
      return
    }
    
    setReturnModalOpen(false)
    try {
      const res = await fetch(`/gauge-tracker/${row.id}/return`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          accepted_by: username || 'operator',
          return_status: returnCondition,
          return_remarks: returnRemarks.trim() || null
        })
      })
      if (!res.ok) throw new Error(await res.text() || 'Failed to return')
      message.success('Equipment returned successfully')
      setCurrentPage(1)
      fetchRows({ page: 0, reset: true })
      setReturnCondition('Good')
      setReturnRemarks('')
    } catch (e) {
      message.error(typeof e?.message === 'string' ? e.message : 'Failed to return')
    }
  }

  const columns = useMemo(() => [
    { 
      title: 'Sl. No.', 
      key: 'sl_no', 
      width: 90, 
      align: 'center',
      render: (_val, _row, index) => ((currentPage - 1) * pageSize) + index + 1,
    },
    { 
      title: 'Equipment', 
      dataIndex: 'name_of_the_equipment', 
      key: 'name_of_the_equipment', 
      width: 200, 
      ellipsis: true,
      sorter: true,
      render: (text) => text || <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'IDFN', 
      dataIndex: 'idfn_no', 
      key: 'idfn_no', 
      width: 120, 
      align: 'center',
      ellipsis: true,
      sorter: true,
      render: (text) => text ? <span className="idfn-tag">{text}</span> : <span style={{ color: '#9ca3af' }}>—</span>
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 120, 
      align: 'center',
      sorter: true,
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
      width: 200, 
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
      title: 'Holder', 
      key: 'holder', 
      width: 280, 
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
              <div>Returned on <span style={{ fontWeight: 600, color: '#1a1f2e' }}>{row.returned_at ? new Date(row.returned_at).toLocaleString() : '-'}</span></div>
            </div>
          )
        }
        return <span style={{ color: '#9ca3af' }}>Pending</span>
      }
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      width: 120, 
      fixed: 'right', 
      align: 'center',
      render: (_, row) => {
        const s = (row.status||'').toLowerCase()
        const canReturn = s === 'accepted' && (row.requested_by || '').toLowerCase() === (username||'').toLowerCase()
        return (
          <Space size="small">
            <Button 
              type={canReturn ? 'primary' : 'default'}
              onClick={()=>onReturn(row)} 
              disabled={!canReturn}
              title={canReturn ? 'Return' : 'Only accepted requests can be returned'}
            >
              Return
            </Button>
          </Space>
        )
      }
    },
  ], [username, currentPage, pageSize])

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
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
  }, [rows, statusFilter, dateFilter])

  const handlePageChange = (page, size) => {
    setCurrentPage(page)
    if (size !== pageSize) {
      setPageSize(size)
    }
  }

  const FilterContent = () => (
    <div className="filter-group">
     
      
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
      
      <div className="filter-actions">
       
        <button 
          className="filter-btn filter-btn-apply"
          onClick={()=>{ 
            setCurrentPage(1); 
            fetchRows({ page: 0 }); 
            setFilterOpen(false) 
          }}
        >
          Apply
        </button>

         <button 
          className="filter-btn filter-btn-reset"
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
      </div>
    </div>
  )

  return (
    <div className="equipment-table-container">
      <style>{styles}</style>
      <div className="table-header">
        <h2>My Gauge Requests</h2>
      </div>

      <div className="table-wrapper">
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
        </div>

        <div className="table-container" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Table
            columns={columns}
            dataSource={filteredRows}
            loading={loading}
            pagination={false}
            bordered
            size="middle"
            className="ant-table-striped professional-table"
            rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
            scroll={{ x: 1000, y: 'calc(100vh - 450px)' }}
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
        <div className="pagination-container" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
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

      {/* Return Modal - Redesigned */}
      <Modal
        title="Return Equipment"
        open={returnModalOpen}
        onCancel={() => {
          setReturnModalOpen(false)
          setReturnModalRow(null)
          setReturnCondition('Good')
          setReturnRemarks('')
        }}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={submitReturn}
          >
            Submit Return
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              setReturnModalOpen(false)
              setReturnModalRow(null)
              setReturnCondition('Good')
              setReturnRemarks('')
            }}
          >
            Cancel
          </Button>
          
        ]}
        width={540}
        centered
        destroyOnClose
      >
        <div className="return-modal-equipment-info">
          <div className="return-modal-equipment-label">Equipment</div>
          <div className="return-modal-equipment-value">
            {returnModalRow?.name_of_the_equipment || '—'}
          </div>
          {returnModalRow?.idfn_no && (
            <>
              <div className="return-modal-equipment-label" style={{ marginTop: 8 }}>IDFN</div>
              <div className="return-modal-equipment-value">{returnModalRow.idfn_no}</div>
            </>
          )}
        </div>

        <div className="return-modal-section">
          <label className="return-modal-label">
            Return Condition <span className="return-modal-label-required">*</span>
          </label>
          <Radio.Group
            value={returnCondition}
            onChange={(e) => {
              setReturnCondition(e.target.value)
              if (e.target.value === 'Good') {
                setReturnRemarks('')
              }
            }}
          >
            <Radio value="Good">Good Condition</Radio>
            <Radio value="Bad">Bad Condition</Radio>
            <Radio value="Needs Repair">Needs Repair</Radio>
            <Radio value="Custom">Custom Status</Radio>
          </Radio.Group>
        </div>
        
        <div className="return-modal-section">
          <label className="return-modal-label">
            Remarks
            {(returnCondition === 'Bad' || returnCondition === 'Needs Repair') && (
              <span className="return-modal-label-required"> *</span>
            )}
          </label>
          <p className="return-modal-description">
            {(returnCondition === 'Bad' || returnCondition === 'Needs Repair')
              ? 'Remarks are required for this condition'
              : 'Additional details about the return condition (optional)'}
          </p>
          <TextArea
            value={returnRemarks}
            onChange={(e) => setReturnRemarks(e.target.value)}
            placeholder={
              returnCondition === 'Good' ? 'Optional: Any additional notes...' :
              returnCondition === 'Bad' || returnCondition === 'Needs Repair'
                ? 'Please describe the issue...'
                : 'Enter custom condition details...'
            }
            rows={4}
            maxLength={500}
            showCount
            required={returnCondition === 'Bad' || returnCondition === 'Needs Repair'}
          />
        </div>
      </Modal>
    </div>
  )
}