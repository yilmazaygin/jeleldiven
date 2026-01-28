import { useEffect, useState } from 'react'
import { productsApi, Product, ProductCreate, ProductUpdate } from '@/api/products'
import { reportsApi, StockReport } from '@/api/reports'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, FormField, Select } from '@/components/ui/Modal'
import { toast } from 'sonner'
import { Plus, Edit } from 'lucide-react'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [stockReport, setStockReport] = useState<StockReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [createForm, setCreateForm] = useState<ProductCreate>({
    name: '',
    category: '',
    is_active: true
  })
  const [editForm, setEditForm] = useState<ProductUpdate>({})

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

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!createForm.name || !createForm.category) {
      toast.error('Please fill required fields')
      return
    }
    try {
      await productsApi.create(createForm)
      toast.success('Product created')
      setShowCreateModal(false)
      setCreateForm({ name: '', category: '', is_active: true })
      fetchData()
    } catch (error) {
      toast.error('Failed to create product')
    }
  }

  const handleEdit = async () => {
    if (!editingProduct) return
    try {
      await productsApi.update(editingProduct.id, editForm)
      toast.success('Product updated')
      setShowEditModal(false)
      setEditingProduct(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to update product')
    }
  }

  const getStockInfo = (productId: number) => {
    return stockReport.find((s) => s.product_id === productId)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products & Stock</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingProduct(product)
                      setEditForm({
                        name: product.name,
                        category: product.category,
                        is_active: product.is_active
                      })
                      setShowEditModal(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add Product">
        <div className="space-y-4">
          <FormField label="Name" required>
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Product name"
            />
          </FormField>
          <FormField label="Category" required>
            <Input
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              placeholder="Category"
            />
          </FormField>
          <FormField label="Status">
            <Select
              value={createForm.is_active ? 'true' : 'false'}
              onChange={(val) => setCreateForm({ ...createForm, is_active: val === 'true' })}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
              ]}
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="flex-1">Create</Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Product">
        <div className="space-y-4">
          <FormField label="Name">
            <Input
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </FormField>
          <FormField label="Category">
            <Input
              value={editForm.category || ''}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
            />
          </FormField>
          <FormField label="Status">
            <Select
              value={editForm.is_active !== undefined ? String(editForm.is_active) : ''}
              onChange={(val) => setEditForm({ ...editForm, is_active: val === 'true' })}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
              ]}
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleEdit} className="flex-1">Save</Button>
            <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
