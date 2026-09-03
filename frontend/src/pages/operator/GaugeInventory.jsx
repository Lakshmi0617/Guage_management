import React from 'react'
import EquipmentTable from '../../components/EquipmentTable.jsx'

const styles = `
  .operator-gauge-inventory-page {
    background: #f5f7fa;
    min-height: calc(100vh - 64px);
    padding: 0;
  }
`

export default function OperatorGaugeInventory() {
  return (
    <div className="operator-gauge-inventory-page">
      <style>{styles}</style>
      <EquipmentTable mode="operator" />
    </div>
  )
}