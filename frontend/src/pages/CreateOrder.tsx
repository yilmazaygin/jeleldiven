import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersApi, OrderCreate, OrderItemCreate } from '@/api/orders'
import { customersApi, Customer } from '@/api/customers'
import { productsApi, Product } from '@/api/products'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, FormField, Select } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

export default function CreateOrder() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [items, setItems] = useState<OrderItemCreate[]>([])
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [newItem, setNewItem] = useState<OrderItemCreate>({
    product_id: 0,
    quantity: 1,
    unit_price: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, productsData] = await Promise.all([
          customersApi.getAll(),
          productsApi.getAll()
        ])
        setCustomers(customersData)
        setProducts(productsData.filter(p => p.is_active))
      } catch (error) {
        toast.error('Failed to load data')
      }
    }
    fetchData()
  }, [])

  const handleAddItem = () => {
    if (!newItem.product_id || newItem.quantity <= 0 || newItem.unit_price <= 0) {
      toast.error('Please fill all item fields correctly')
      return
    }
    setItems([...items, newItem])
    setNewItem({ product_id: 0, quantity: 1, unit_price: 0 })
    setShowAddItemModal(false)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleCreateOrder = async () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer')
      return
    }
    if (items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    try {
      const orderData: OrderCreate = {
        customer_id: Number(selectedCustomerId),
        items
      }
      const order = await ordersApi.create(orderData)
      toast.success('Order created')
      navigate(`/orders/${order.id}`)
    } catch (error) {
      toast.error('Failed to create order')
    }
  }

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || 'Unknown'
  }

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleCreateOrder}>
          Create Order
        </Button>
      </div>

      <h1 className="text-3xl font-bold">New Order</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <FormField label="Customer" required>
            <Select
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              options={customers.map(c => ({ value: String(c.id), label: c.name }))}
              placeholder="Select customer"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Order Items</h3>
            <Button size="sm" onClick={() => setShowAddItemModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items added yet
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{getProductName(item.product_id)}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × ${item.unit_price.toFixed(2)} = ${(item.quantity * item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="pt-2 border-t">
                <p className="text-right font-semibold">
                  Total: ${getTotalAmount().toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        title="Add Order Item"
      >
        <div className="space-y-4">
          <FormField label="Product" required>
            <Select
              value={String(newItem.product_id)}
              onChange={(val) => setNewItem({ ...newItem, product_id: Number(val) })}
              options={products.map(p => ({ value: String(p.id), label: p.name }))}
              placeholder="Select product"
            />
          </FormField>
          <FormField label="Quantity" required>
            <Input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Unit Price" required>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={newItem.unit_price}
              onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) })}
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleAddItem} className="flex-1">Add</Button>
            <Button variant="outline" onClick={() => setShowAddItemModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
