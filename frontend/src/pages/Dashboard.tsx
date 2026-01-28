import { useEffect, useState } from 'react'
import { reportsApi, DashboardReport } from '@/api/reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

export default function Dashboard() {
  const [report, setReport] = useState<DashboardReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await reportsApi.getDashboard()
        setReport(data)
      } catch (error) {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.pending_deliveries_count || 0}</div>
            <p className="text-xs text-muted-foreground">Orders awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.pending_payments_count || 0}</div>
            <p className="text-xs text-muted-foreground">Orders with unpaid balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report?.total_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">All-time revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">System Status</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Operational</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
