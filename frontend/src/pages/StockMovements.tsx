import { useEffect, useState } from 'react'
import { stockApi, StockMovement, StockMovementCreate } from '@/api/stock'
import { productsApi, Product } from '@/api/products'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, FormField, Select, Textarea } from '@/components/ui/Modal'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export default function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<StockMovementCreate>({
    product_id: 0,
    quantity: 0,
    movement_type: 'purchase',
    total_cost: undefined,
    description: ''
  })

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

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!formData.product_id || formData.quantity === 0) {
      toast.error('Please fill required fields')
      return
    }
    try {
      await stockApi.create(formData)
      toast.success('Stock movement created')
      setShowCreateModal(false)
      setFormData({
        product_id: 0,
        quantity: 0,
        movement_type: 'purchase',
        total_cost: undefined,
        description: ''
      })
      fetchData()
    } catch (error) {
      toast.error('Failed to create stock movement')
    }
  }

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Movements</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Movement
        </Button>
      </div>

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

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add Stock Movement">
        <div className="space-y-4">
          <FormField label="Product" required>
            <Select
              value={String(formData.product_id)}
              onChange={(val) => setFormData({ ...formData, product_id: Number(val) })}
              options={products.map(p => ({ value: String(p.id), label: p.name }))}
              placeholder="Select product"
            />
          </FormField>
          <FormField label="Movement Type" required>
            <Select
              value={formData.movement_type}
              onChange={(val) => setFormData({ ...formData, movement_type: val as any })}
              options={[
                { value: 'purchase', label: 'Purchase' },
                { value: 'manual_adjustment', label: 'Manual Adjustment' },
                { value: 'delivery', label: 'Delivery' },
                { value: 'promotion', label: 'Promotion' },
                { value: 'tester', label: 'Tester' },
                { value: 'waste', label: 'Waste' }
              ]}
            />
          </FormField>
          <FormField label="Quantity" required>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              placeholder="Positive for additions, negative for reductions"
            />
          </FormField>
          <FormField label="Total Cost">
            <Input
              type="number"
              step="0.01"
              value={formData.total_cost || ''}
              onChange={(e) => setFormData({ ...formData, total_cost: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="Optional"
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="flex-1">Create</Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
