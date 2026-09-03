import React, { useEffect, useMemo, useState } from 'react'
import { Table, Button, Input, Space, Modal, Form, message, Pagination, Select } from 'antd'
import { DeleteOutlined, PlusOutlined, EditOutlined, LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

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
  .user-management-container {
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

  .btn-text-password {
    color: #8b5cf6;
  }

  .btn-text-delete {
    color: #ef4444;
  }

  .user-table .ant-table-thead > tr > th {
    background: #f3f4f6 !important;
    color: #111827 !important;
    font-weight: 600;
    border-bottom: 2px solid #d1d5db !important;
    padding: 14px 16px;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .user-table .ant-table-tbody > tr > td {
    padding: 14px 16px;
    color: #1f2937;
  }

  .role-badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    display: inline-block;
  }

  .role-admin {
    background: #fef2f2;
    color: #dc2626;
  }

  .role-operator {
    background: #eff6ff;
    color: #2563eb;
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

  .ant-form-item-label > label {
    font-weight: 500;
    color: #374151;
  }

  .ant-input,
  .ant-input-password,
  .ant-select-selector {
    border-radius: 6px;
    border-color: #d1d5db;
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

export default function CreateUser() {
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [pwdForm] = Form.useForm()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [submitLoading, setSubmitLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/users', {
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers((Array.isArray(data) ? data : []).map(u => ({ ...u, key: u.id })))
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

const handleCreate = async (values) => {
    setSubmitLoading(true)
    try {
      const res = await fetch('/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
          role: values.role,
          employee_id: values.employee_id?.trim() || null
        })
      })
      if (!res.ok) throw new Error('Failed to create user')
      message.success('User created successfully')
      fetchUsers()
      setShowCreate(false)
      form.resetFields()
    } catch (err) {
      message.error(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = async (values) => {
    setSubmitLoading(true)
    try {
      const res = await fetch(`/users/${editingUser.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: values.username.trim(),
          email: values.email.trim(),
          role: values.role,
          employee_id: values.employee_id?.trim() || null
        })
      })
      if (!res.ok) throw new Error('Failed to update user')
      message.success('User updated successfully')
      fetchUsers()
      setShowEdit(false)
      setEditingUser(null)
      editForm.resetFields()
    } catch (err) {
      message.error(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = (userId) => {
    Modal.confirm({
      title: 'Delete User',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      centered: true,
      okButtonProps: { style: { order: 1 } },
      cancelButtonProps: { style: { order: 2 } },
      className: 'custom-delete-modal',
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <OkBtn />
          <CancelBtn />
        </>
      ),
      onOk: async () => {
        try {
          const res = await fetch(`/users/${userId}`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
          })
          if (!res.ok && res.status !== 204) throw new Error('Failed to delete')
          message.success('User deleted successfully')
          fetchUsers()
        } catch (e) {
          message.error(e.message)
        }
      }
    })
  }

  const handlePasswordChange = async (values) => {
    setSubmitLoading(true)
    try {
      const res = await fetch(`/users/${editingUser.id}/password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ new_password: values.new_password })
      })
      if (!res.ok) throw new Error('Failed to update password')
      message.success('Password updated successfully')
      setShowPwd(false)
      pwdForm.resetFields()
    } catch (err) {
      message.error(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      ellipsis: true,
      width: 150
    },
    {
      title: 'Employee ID',
      dataIndex: 'employee_id',
      ellipsis: true,
      width: 140,
      align: 'center',
      render: (text) => text || <span style={{ color: '#9ca3af' }}>—</span>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      ellipsis: true,
      width: 220
    },
    {
      title: 'Role',
      dataIndex: 'role',
      width: 120,
      align: 'center',
      render: (role) => {
        const isAdmin = role?.toUpperCase() === 'ADMIN'
        return (
          <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-operator'}`}>
            {role?.toUpperCase()}
          </span>
        )
      }
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      width: 180,
      align: 'center',
      render: (v) => v ? new Date(v).toLocaleString() : ''
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <button
            className="btn-text btn-text-edit"
            onClick={() => {
              setEditingUser(row)
              editForm.setFieldsValue({
                email: row.email || '',
                role: row.role || 'operator',
                employee_id: row.employee_id || ''
              })
              setShowEdit(true)
            }}
            title="Edit User"
          >
            <EditOutlined />
          </button>
          <button
            className="btn-text btn-text-password"
            onClick={() => {
              setEditingUser(row)
              setShowPwd(true)
            }}
            title="Change Password"
          >
            <LockOutlined />
          </button>
          <button
            className="btn-text btn-text-delete"
            onClick={() => handleDelete(row.id)}
            title="Delete User"
          >
            <DeleteOutlined />
          </button>
        </Space>
      )
    }
  ]

  const filteredUsers = useMemo(() => {
    const term = (searchQuery || '').toLowerCase().trim()
    if (!term) return users
    return users.filter(u =>
      String(u.username || '').toLowerCase().includes(term) ||
      String(u.email || '').toLowerCase().includes(term) ||
      String(u.role || '').toLowerCase().includes(term)
    )
  }, [users, searchQuery])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  return (
    <div className="user-management-container">
      <style>{styles}</style>

      <div className="page-header">
        <h1 className="page-title">User Management</h1>
      </div>

      <div className="content-card">
        <div className="controls-row">
          <div className="search-box">
            <Input.Search
              allowClear
              placeholder="Search by username, email, or role"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={() => setCurrentPage(1)}
            />
          </div>
          <div className="button-group">
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              <PlusOutlined />
              <span>Create User</span>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Table
              columns={columns}
              dataSource={paginatedUsers}
              loading={loading}
              pagination={false}
              bordered
              className="user-table"
              scroll={{ x: 1000, y: 'calc(100vh - 450px)' }}
              style={{ flex: 1, height: '100%' }}
            />
          </div>
        </div>
        <div className="pagination-wrapper" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <Pagination
            current={currentPage}
            total={filteredUsers.length}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} users`}
            onChange={(page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            }}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      </div>

      <Modal
        title="Create New User"
        open={showCreate}
        onCancel={() => {
          setShowCreate(false)
          form.resetFields()
        }}
        footer={
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => {
              setShowCreate(false)
              form.resetFields()
            }}>
              Cancel
            </button>
            <button
              className="btn-submit"
              onClick={() => form.submit()}
              disabled={submitLoading}
            >
              {submitLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        }
        width={520}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Username is required' }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'At least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Role is required' }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="operator">Operator</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Employee ID" name="employee_id">
            <Input placeholder="Enter employee ID (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Edit User - ${editingUser?.username || ''}`}
        open={showEdit}
        onCancel={() => {
          setShowEdit(false)
          setEditingUser(null)
          editForm.resetFields()
        }}
        footer={
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => {
              setShowEdit(false)
              setEditingUser(null)
              editForm.resetFields()
            }}>
              Cancel
            </button>
            <button
              className="btn-submit"
              onClick={() => editForm.submit()}
              disabled={submitLoading}
            >
              {submitLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        }
        width={520}
        centered
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Role is required' }]}
          >
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="operator">Operator</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Employee ID" name="employee_id">
            <Input placeholder="Enter employee ID (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Change Password - ${editingUser?.username || ''}`}
        open={showPwd}
        onCancel={() => {
          setShowPwd(false)
          setEditingUser(null)
          pwdForm.resetFields()
        }}
        footer={
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => {
              setShowPwd(false)
              setEditingUser(null)
              pwdForm.resetFields()
            }}>
              Cancel
            </button>
            <button
              className="btn-submit"
              onClick={() => pwdForm.submit()}
              disabled={submitLoading}
            >
              {submitLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        }
        width={460}
        centered
      >
        <Form form={pwdForm} layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item
            label="New Password"
            name="new_password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'At least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}