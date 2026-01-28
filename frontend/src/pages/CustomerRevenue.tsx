import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reportsApi, CustomerRevenueReport } from '@/api/reports'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'

export default function CustomerRevenue() {
  const [report, setReport] = useState<CustomerRevenueReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await reportsApi.getCustomerRevenue()
        setReport(data)
      } catch (error) {
        toast.error('Failed to load customer revenue report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const totalRevenue = report.reduce((sum, item) => sum + item.total_revenue, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Revenue Report</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {report.map((item, index) => (
          <Link key={item.customer_id} to={`/customers/${item.customer_id}`}>
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <h3 className="font-semibold">{item.customer_name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customer ID: {item.customer_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(item.total_revenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((item.total_revenue / totalRevenue) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {report.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No revenue data available
          </div>
        )}
      </div>
    </div>
  )
}
