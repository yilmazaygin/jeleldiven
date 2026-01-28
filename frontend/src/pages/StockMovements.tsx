import { useEffect, useState } from 'react'
import { stockApi, StockMovement } from '@/api/stock'
import { productsApi, Product } from '@/api/products'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

export default function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movementsData, productsData] = await Promise.all([
          stockApi.getAll(),
          productsApi.getAll(),
        ])
        setMovements(movementsData)
        setProducts(productsData)
      } catch (error) {
        toast.error('Failed to load stock movements')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || 'Unknown'
  }

  const getMovementTypeColor = (type: string) => {
    if (type === 'purchase' || type === 'manual_adjustment') return 'default'
    return 'destructive'
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Stock Movements</h1>

      <div className="grid gap-4">
        {movements.map((movement) => (
          <Card key={movement.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{getProductName(movement.product_id)}</h3>
                    <Badge variant={getMovementTypeColor(movement.movement_type)}>
                      {movement.movement_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(movement.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </p>
                </div>
              </div>
              {movement.total_cost && (
                <div className="text-sm text-muted-foreground">
                  Cost: {formatCurrency(movement.total_cost)}
                </div>
              )}
              {movement.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {movement.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {movements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No stock movements found
          </div>
        )}
      </div>
    </div>
  )
}
