import { useState, useEffect } from 'react'
import { usersApi, User, UserCreate, UserUpdate } from '@/api/users'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, FormField, Select } from '@/components/ui/Modal'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, Edit } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [createForm, setCreateForm] = useState<UserCreate>({
    username: '',
    full_name: '',
    password: ''
  })
  const [editForm, setEditForm] = useState<UserUpdate>({})

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = async () => {
    if (!createForm.username || !createForm.full_name || !createForm.password) {
      toast.error('Please fill all required fields')
      return
    }
    try {
      await usersApi.create(createForm)
      toast.success('User created')
      setShowCreateModal(false)
      setCreateForm({ username: '', full_name: '', password: '' })
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create user')
    }
  }

  const handleEdit = async () => {
    if (!editingUser) return
    try {
      await usersApi.update(editingUser.id, editForm)
      toast.success('User updated')
      setShowEditModal(false)
      setEditingUser(null)
      setEditForm({})
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{user.full_name}</h3>
                    {user.is_active ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Username: {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {formatDateTime(user.created_at)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingUser(user)
                    setEditForm({
                      full_name: user.full_name,
                      is_active: user.is_active
                    })
                    setShowEditModal(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add User">
        <div className="space-y-4">
          <FormField label="Username" required>
            <Input
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              placeholder="Username"
            />
          </FormField>
          <FormField label="Full Name" required>
            <Input
              value={createForm.full_name}
              onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
              placeholder="Full Name"
            />
          </FormField>
          <FormField label="Password" required>
            <Input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="Password"
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="flex-1">Create</Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
        <div className="space-y-4">
          <FormField label="Full Name">
            <Input
              value={editForm.full_name || ''}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            />
          </FormField>
          <FormField label="New Password (leave empty to keep current)">
            <Input
              type="password"
              value={editForm.password || ''}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder="New password"
            />
          </FormField>
          <FormField label="Status">
            <Select
              value={editForm.is_active !== undefined ? String(editForm.is_active) : ''}
              onChange={(val) => setEditForm({ ...editForm, is_active: val === 'true' })}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
              ]}
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleEdit} className="flex-1">Save</Button>
            <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
