import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { customersApi, Customer, CustomerCreate } from '@/api/customers'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, FormField } from '@/components/ui/Modal'
import { toast } from 'sonner'
import { ChevronRight, Plus } from 'lucide-react'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<CustomerCreate>({
    name: '',
    primary_phone: '',
    additional_phones: ''
  })

  const fetchCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      setCustomers(data)
    } catch (error) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleCreate = async () => {
    if (!formData.name || !formData.primary_phone) {
      toast.error('Please fill required fields')
      return
    }
    try {
      await customersApi.create(formData)
      toast.success('Customer created')
      setShowCreateModal(false)
      setFormData({ name: '', primary_phone: '', additional_phones: '' })
      fetchCustomers()
    } catch (error) {
      toast.error('Failed to create customer')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-4">
        {customers.map((customer) => (
          <Link key={customer.id} to={`/customers/${customer.id}`}>
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {customer.primary_phone}
                    </p>
                    {customer.statuses.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {customer.statuses.map((status) => (
                          <Badge key={status.id} variant="secondary" className="text-xs">
                            {status.status}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {customers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No customers found
          </div>
        )}
      </div>

      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Add Customer"
      >
        <div className="space-y-4">
          <FormField label="Name" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Customer name"
            />
          </FormField>
          <FormField label="Primary Phone" required>
            <Input
              value={formData.primary_phone}
              onChange={(e) => setFormData({ ...formData, primary_phone: e.target.value })}
              placeholder="+1234567890"
            />
          </FormField>
          <FormField label="Additional Phones">
            <Input
              value={formData.additional_phones}
              onChange={(e) => setFormData({ ...formData, additional_phones: e.target.value })}
              placeholder="+0987654321"
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
    </div>
  )
}
