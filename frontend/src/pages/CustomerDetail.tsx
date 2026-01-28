import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { customersApi, Customer } from '@/api/customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!customer) {
    return <div className="text-center py-8">Customer not found</div>
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/customers')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

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
          <CardTitle>Statuses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {customer.statuses.map((status) => (
              <Badge key={status.id} variant="secondary">
                {status.status}
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
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customer.notes.map((note) => (
              <div key={note.id} className="border-b pb-2">
                <p className="text-sm">{note.note}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(note.created_at)}
                </p>
              </div>
            ))}
            {customer.notes.length === 0 && (
              <p className="text-sm text-muted-foreground">No notes</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
