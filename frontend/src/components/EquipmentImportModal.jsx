import React, { useMemo, useState } from 'react'
import { Modal, Button, Upload, Alert, Table, Select, Tabs, Descriptions, Tag, message } from 'antd'
import { UploadOutlined, FileExcelOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloudUploadOutlined } from '@ant-design/icons'

const styles = `
  .import-modal .ant-modal-header {
    background: #1a1f2e;
    border-bottom: none;
  }

  .import-modal .ant-modal-title {
    color: #e4e6eb;
    font-size: 18px;
    font-weight: 600;
  }

  .import-modal .ant-modal-close-x {
    color: #e4e6eb;
  }

  .import-modal .ant-btn-primary {
    background: #1a1f2e !important;
    border: none !important;
  }

  .import-modal .ant-btn-primary:hover {
    background: #252b3d !important;
  }

  .import-modal .ant-btn-default {
    background: #fff !important;
    border: 1px solid #d1d5db !important;
  }

  .import-modal .ant-btn-default:hover {
    border-color: #9ca3af !important;
    background: #f9fafb !important;
  }

  .upload-section {
    background: #f9fafb;
    padding: 20px;
    border-radius: 8px;
    border: 2px dashed #d1d5db;
    margin: 16px 0;
  }
`

export default function EquipmentImportModal({ open, onClose }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [validResp, setValidResp] = useState(null)
  const [error, setError] = useState('')
  const [decisions, setDecisions] = useState({})
  const [bulkAction, setBulkAction] = useState('')
  const [committing, setCommitting] = useState(false)

  const conflicts = useMemo(() => validResp?.conflicts || [], [validResp])
  const rowErrors = useMemo(() => validResp?.row_errors || [], [validResp])

  const reset = () => {
    setFile(null)
    setValidResp(null)
    setError('')
    setDecisions({})
    setBulkAction('')
  }

  const beforeUpload = (f) => {
    const ok = f.name.toLowerCase().match(/\.(csv|xlsx)$/)
    if (!ok) {
      setError('Only .csv or .xlsx files')
      return Upload.LIST_IGNORE
    }
    setFile(f)
    setError('')
    return false
  }

  const doValidate = async () => {
    if (!file) return setError('Choose a file')
    try {
      setUploading(true)
      setError('')
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/equipment/import/validate', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await res.text() || 'Validation failed')
      setValidResp(await res.json())
      setDecisions({})
      message.success('File validated')
    } catch (e) {
      setError(e.message)
      message.error('Validation failed')
    } finally {
      setUploading(false)
    }
  }

  const doCommit = async () => {
    if (!validResp?.parsed_payload_id) return setError('Validate first')
    try {
      setCommitting(true)
      setError('')
      const res = await fetch('/api/equipment/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsed_payload_id: validResp.parsed_payload_id,
          file_name: file?.name || null,
          actor: localStorage.getItem('username') || 'admin',
          bulk: bulkAction ? { action: bulkAction } : {},
          decisions: Object.entries(decisions).map(([row_index, action]) => ({ row_index: Number(row_index), action }))
        })
      })
      if (!res.ok) throw new Error(await res.text() || 'Commit failed')
      const data = await res.json()
      Modal.success({
        title: 'Import Completed',
        content: `Created: ${data.created}, Updated: ${data.updated}, Skipped: ${data.skipped}, Errors: ${data.errors}`
      })
      reset()
      onClose?.()
    } catch (e) {
      setError(e.message)
      message.error('Commit failed')
    } finally {
      setCommitting(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <Modal
        open={open}
        title="Upload Equipment (Excel/CSV)"
        onCancel={() => { reset(); onClose?.() }}
        width={1000}
        footer={null}
        className="import-modal"
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Button icon={<FileTextOutlined />} href="/api/equipment/import/template.csv" target="_blank">
            CSV Template
          </Button>
          <Button icon={<FileExcelOutlined />} href="/api/equipment/import/template.xlsx" target="_blank">
            Excel Template
          </Button>
        </div>

        <div className="upload-section">
          <Upload beforeUpload={beforeUpload} maxCount={1} accept=".csv,.xlsx" showUploadList onRemove={() => reset()}>
            <Button icon={<UploadOutlined />}>Choose File</Button>
          </Upload>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button type="primary" icon={<CloudUploadOutlined />} loading={uploading} disabled={!file} onClick={doValidate}>
              Validate
            </Button>
            <span style={{ color: '#6b7280', fontSize: 13 }}>
              Dates must be YYYY-MM-DD
            </span>
          </div>
        </div>

        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} closable onClose={() => setError('')} />}

        {validResp && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Tag color="blue">Total: {validResp.total_rows}</Tag>
              <Tag color="green" icon={<CheckCircleOutlined />}>Valid: {validResp.valid_rows}</Tag>
              <Tag color="red" icon={<ExclamationCircleOutlined />}>Invalid: {validResp.invalid_rows}</Tag>
              <Tag color="orange">Conflicts: {validResp.conflicts_count}</Tag>
            </div>

            <Tabs
              items={[
                {
                  key: 'conflicts',
                  label: `Conflicts (${validResp.conflicts_count})`,
                  children: conflicts.length > 0 ? (
                    <>
                      <div style={{ background: '#eff6ff', padding: 12, borderRadius: 6, marginBottom: 16, display: 'flex', gap: 12 }}>
                        <span style={{ fontWeight: 500 }}>Bulk:</span>
                        <Select
                          style={{ width: 200 }}
                          placeholder="Action"
                          value={bulkAction || undefined}
                          onChange={setBulkAction}
                          allowClear
                          options={[
                            { value: 'discard', label: 'Discard all' },
                            { value: 'override', label: 'Override all' }
                          ]}
                        />
                      </div>
                      <Table
                        rowKey={(r) => `${r.row_index}-${r.pcr_number}`}
                        dataSource={conflicts}
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 800 }}
                        columns={[
                          { title: 'Row', dataIndex: 'row_index', width: 80, align: 'center' },
                          { title: 'PCR', dataIndex: 'pcr_number', width: 100, align: 'center' },
                          {
                            title: 'Existing',
                            width: 300,
                            render: (_, rec) => (
                              <Descriptions size="small" column={1} bordered>
                                <Descriptions.Item label="Name">{rec.existingPreview?.name_of_the_equipment}</Descriptions.Item>
                                <Descriptions.Item label="IDFN">{rec.existingPreview?.idfn_no}</Descriptions.Item>
                              </Descriptions>
                            )
                          },
                          {
                            title: 'Incoming',
                            width: 300,
                            render: (_, rec) => (
                              <Descriptions size="small" column={1} bordered>
                                <Descriptions.Item label="Name">{rec.incomingPreview?.name_of_the_equipment}</Descriptions.Item>
                                <Descriptions.Item label="IDFN">{rec.incomingPreview?.idfn_no}</Descriptions.Item>
                              </Descriptions>
                            )
                          },
                          {
                            title: 'Decision',
                            width: 140,
                            align: 'center',
                            render: (_, rec) => (
                              <Select
                                style={{ width: 120 }}
                                placeholder="Choose"
                                value={decisions[rec.row_index]}
                                onChange={(v) => setDecisions(prev => ({ ...prev, [rec.row_index]: v }))}
                                options={[
                                  { value: 'discard', label: 'Discard' },
                                  { value: 'override', label: 'Override' }
                                ]}
                              />
                            )
                          }
                        ]}
                      />
                    </>
                  ) : <p>No conflicts</p>
                },
                {
                  key: 'errors',
                  label: `Errors (${rowErrors.length})`,
                  children: (
                    <Table
                      rowKey={(r) => r.row_index}
                      dataSource={rowErrors}
                      pagination={{ pageSize: 6 }}
                      columns={[
                        { title: 'Row', dataIndex: 'row_index', width: 80, align: 'center' },
                        { title: 'Message', dataIndex: 'message' }
                      ]}
                    />
                  )
                }
              ]}
            />

            <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
              <Button type="primary" onClick={doCommit} loading={committing} disabled={!validResp.parsed_payload_id}>
                {committing ? 'Committing...' : 'Commit Import'}
              </Button>
              <Button onClick={() => { reset(); onClose?.() }}>Close</Button>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}