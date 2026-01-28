import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { customersApi, Customer, CustomerUpdate } from '@/api/customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, FormField, Textarea } from '@/components/ui/Modal'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editForm, setEditForm] = useState<CustomerUpdate>({})
  const [newStatus, setNewStatus] = useState('')
  const [newNote, setNewNote] = useState('')

  const fetchCustomer = async () => {
    try {
      const data = await customersApi.getById(Number(id))
      setCustomer(data)
    } catch (error) {
      toast.error('Failed to load customer')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomer()
  }, [id])

  const handleEdit = async () => {
    try {
      await customersApi.update(Number(id), editForm)
      toast.success('Customer updated')
      setShowEditModal(false)
      fetchCustomer()
    } catch (error) {
      toast.error('Failed to update customer')
    }
  }

  const handleAddStatus = async () => {
    if (!newStatus.trim()) {
      toast.error('Please enter a status')
      return
    }
    try {
      await customersApi.addStatus(Number(id), newStatus)
      toast.success('Status added')
      setNewStatus('')
      setShowStatusModal(false)
      fetchCustomer()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add status')
    }
  }

  const handleRemoveStatus = async (statusId: number) => {
    if (!confirm('Remove this status?')) return
    try {
      await customersApi.removeStatus(Number(id), statusId)
      toast.success('Status removed')
      fetchCustomer()
    } catch (error) {
      toast.error('Failed to remove status')
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }
    try {
      await customersApi.addNote(Number(id), newNote)
      toast.success('Note added')
      setNewNote('')
      setShowNoteModal(false)
      fetchCustomer()
    } catch (error) {
      toast.error('Failed to add note')
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Delete this note?')) return
    try {
      await customersApi.deleteNote(Number(id), noteId)
      toast.success('Note deleted')
      fetchCustomer()
    } catch (error) {
      toast.error('Failed to delete note')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!customer) {
    return <div className="text-center py-8">Customer not found</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => {
          setEditForm({ 
            name: customer.name, 
            primary_phone: customer.primary_phone,
            additional_phones: customer.additional_phones || ''
          })
          setShowEditModal(true)
        }}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <h1 className="text-3xl font-bold">{customer.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Primary Phone</p>
            <p className="font-medium">{customer.primary_phone}</p>
          </div>
          {customer.additional_phones && (
            <div>
              <p className="text-sm text-muted-foreground">Additional Phones</p>
              <p className="font-medium">{customer.additional_phones}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Statuses</CardTitle>
            <Button size="sm" onClick={() => setShowStatusModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {customer.statuses.map((status) => (
              <Badge key={status.id} variant="secondary" className="gap-2">
                {status.status}
                <button
                  onClick={() => handleRemoveStatus(status.id)}
                  className="hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {customer.statuses.length === 0 && (
              <p className="text-sm text-muted-foreground">No statuses assigned</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notes</CardTitle>
            <Button size="sm" onClick={() => setShowNoteModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customer.notes.map((note) => (
              <div key={note.id} className="border-b pb-2 flex justify-between">
                <div className="flex-1">
                  <p className="text-sm">{note.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(note.created_at)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {customer.notes.length === 0 && (
              <p className="text-sm text-muted-foreground">No notes</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Customer">
        <div className="space-y-4">
          <FormField label="Name">
            <Input
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </FormField>
          <FormField label="Primary Phone">
            <Input
              value={editForm.primary_phone || ''}
              onChange={(e) => setEditForm({ ...editForm, primary_phone: e.target.value })}
            />
          </FormField>
          <FormField label="Additional Phones">
            <Input
              value={editForm.additional_phones || ''}
              onChange={(e) => setEditForm({ ...editForm, additional_phones: e.target.value })}
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleEdit} className="flex-1">Save</Button>
            <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Add Status">
        <div className="space-y-4">
          <FormField label="Status" required>
            <Input
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="Enter status"
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleAddStatus} className="flex-1">Add</Button>
            <Button variant="outline" onClick={() => setShowStatusModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Note">
        <div className="space-y-4">
          <FormField label="Note" required>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter note"
              rows={4}
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleAddNote} className="flex-1">Add</Button>
            <Button variant="outline" onClick={() => setShowNoteModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
