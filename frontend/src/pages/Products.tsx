import { useEffect, useState } from 'react'
import { productsApi, Product } from '@/api/products'
import { reportsApi, StockReport } from '@/api/reports'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [stockReport, setStockReport] = useState<StockReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, stockData] = await Promise.all([
          productsApi.getAll(),
          reportsApi.getStock(),
        ])
        setProducts(productsData)
        setStockReport(stockData)
      } catch (error) {
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStockInfo = (productId: number) => {
    return stockReport.find((s) => s.product_id === productId)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Products & Stock</h1>

      <div className="grid gap-4">
        {products.map((product) => {
          const stock = getStockInfo(product.id)
          return (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.is_active ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Category: {product.category}
                    </p>
                    {stock && (
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-semibold">{stock.total_stock}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reserved</p>
                          <p className="font-semibold">{stock.reserved_stock}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-semibold text-primary">
                            {stock.available_stock}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No products found
          </div>
        )}
      </div>
    </div>
  )
}
