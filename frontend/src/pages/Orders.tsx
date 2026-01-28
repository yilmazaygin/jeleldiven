import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi, Order } from '@/api/orders'
import { customersApi, Customer } from '@/api/customers'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, customersData] = await Promise.all([
          ordersApi.getAll(),
          customersApi.getAll(),
        ])
        setOrders(ordersData)
        setCustomers(customersData)
      } catch (error) {
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getCustomerName = (customerId: number) => {
    return customers.find((c) => c.id === customerId)?.name || 'Unknown'
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === 'pending') return !order.is_delivered && !order.is_cancelled
    if (filter === 'delivered') return order.is_delivered
    return !order.is_cancelled
  })

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === 'delivered'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`}>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">Order #{order.id}</span>
                      {order.is_delivered && (
                        <Badge variant="secondary">Delivered</Badge>
                      )}
                      {order.is_fully_paid && (
                        <Badge variant="default">Paid</Badge>
                      )}
                      {!order.is_fully_paid && (
                        <Badge variant="destructive">Unpaid</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {getCustomerName(order.customer_id)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                    <div className="mt-2">
                      <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                      {order.remaining_amount > 0 && (
                        <p className="text-sm text-destructive">
                          Remaining: {formatCurrency(order.remaining_amount)}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No orders found
          </div>
        )}
      </div>
    </div>
  )
}
