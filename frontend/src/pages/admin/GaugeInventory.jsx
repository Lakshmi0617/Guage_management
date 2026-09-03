import React, { useState } from 'react'
import { Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import EquipmentTable from '../../components/EquipmentTable.jsx'
import EquipmentImportModal from '../../components/EquipmentImportModal.jsx'

const styles = `
  .admin-gauge-inventory-page {
    background: #f5f7fa;
    min-height: calc(100vh - 64px);
    padding: 0;
  }

  .import-action-bar {
    background: #ffffff;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .btn-upload {
    background: #1a1f2e;
    border: none;
    color: #fff;
    height: 40px;
    padding: 0 20px;
    border-radius: 6px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .btn-upload:hover {
    background: #252b3d;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(26, 31, 46, 0.2);
  }

  .import-info-text {
    font-size: 13px;
    color: #6b7280;
    font-weight: 400;
  }
`

export default function GaugeInventory() {
  const [openImport, setOpenImport] = useState(false)

  return (
    <div className="admin-gauge-inventory-page">
      <style>{styles}</style>
      
      <div className="import-action-bar">
        <Button 
          icon={<UploadOutlined />} 
          type="primary" 
          onClick={() => setOpenImport(true)}
          className="btn-upload"
        >
          Upload Equipment (Excel/CSV)
        </Button>
        <span className="import-info-text">
          Bulk import equipment data from Excel or CSV files
        </span>
      </div>

      <EquipmentTable mode="admin" />
      
      <EquipmentImportModal 
        open={openImport} 
        onClose={() => setOpenImport(false)} 
      />
    </div>
  )
}