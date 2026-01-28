import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { customersApi, Customer } from '@/api/customers'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    fetchCustomers()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Customers</h1>

      <div className="grid gap-4">
        {customers.map((customer) => (
          <Link key={customer.id} to={`/customers/${customer.id}`}>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {customer.primary_phone}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {customer.statuses.map((status) => (
                        <Badge key={status.id} variant="secondary">
                          {status.status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
    </div>
  )
}
