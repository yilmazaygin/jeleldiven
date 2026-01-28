import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ordersApi, Order } from '@/api/orders'
import { customersApi, Customer } from '@/api/customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, FormField, Textarea } from '@/components/ui/Modal'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import { ArrowLeft, Package, DollarSign, Plus, Trash2 } from 'lucide-react'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentType, setPaymentType] = useState('cash')
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [newNote, setNewNote] = useState('')

  const fetchOrder = async () => {
    try {
      const data = await ordersApi.getById(Number(id))
      setOrder(data)
      const customerData = await customersApi.getById(data.customer_id)
      setCustomer(customerData)
    } catch (error) {
      toast.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleDeliver = async () => {
    if (!order) return
    try {
      await ordersApi.deliver(order.id)
      toast.success('Order delivered successfully')
      fetchOrder()
    } catch (error) {
      toast.error('Failed to deliver order')
    }
  }

  const handleCancel = async () => {
    if (!order || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }
    try {
      await ordersApi.cancel(order.id, cancelReason)
      toast.success('Order cancelled')
      fetchOrder()
      setShowCancelForm(false)
      setCancelReason('')
    } catch (error) {
      toast.error('Failed to cancel order')
    }
  }

  const handleAddPayment = async () => {
    if (!order || !paymentAmount) {
      toast.error('Please enter payment amount')
      return
    }
    try {
      await ordersApi.addPayment(order.id, {
        amount: Number(paymentAmount),
        payment_type: paymentType,
      })
      toast.success('Payment added')
      fetchOrder()
      setShowPaymentForm(false)
      setPaymentAmount('')
    } catch (error) {
      toast.error('Failed to add payment')
    }
  }

  const handleAddNote = async () => {
    if (!order || !newNote.trim()) {
      toast.error('Please enter a note')
      return
    }
    try {
      await ordersApi.addNote(order.id, newNote)
      toast.success('Note added')
      setNewNote('')
      setShowNoteModal(false)
      fetchOrder()
    } catch (error) {
      toast.error('Failed to add note')
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!order || !confirm('Delete this note?')) return
    try {
      await ordersApi.deleteNote(order.id, noteId)
      toast.success('Note deleted')
      fetchOrder()
    } catch (error) {
      toast.error('Failed to delete note')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/orders')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-3xl font-bold">Order #{order.id}</h1>
        {order.is_delivered && <Badge variant="secondary">Delivered</Badge>}
        {order.is_fully_paid && <Badge variant="default">Paid</Badge>}
        {order.is_cancelled && <Badge variant="destructive">Cancelled</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{customer?.name}</p>
          <p className="text-sm text-muted-foreground">{customer?.primary_phone}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start border-b pb-2">
                <div>
                  <p className="font-medium">{item.product_name_snapshot}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(item.total_price)}</p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <p className="font-bold">Total</p>
              <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid Amount</span>
              <span className="font-medium">{formatCurrency(order.paid_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-medium text-destructive">
                {formatCurrency(order.remaining_amount)}
              </span>
            </div>
          </div>

          {order.payments.length > 0 && (
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Payment History</p>
              {order.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">
                    {formatDateTime(payment.created_at)} - {payment.payment_type}
                  </span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {!order.is_cancelled && !order.is_fully_paid && (
            <>
              {!showPaymentForm ? (
                <Button onClick={() => setShowPaymentForm(true)} className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              ) : (
                <div className="space-y-3 border-t pt-4">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                  >
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={handleAddPayment} className="flex-1">
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {!order.is_cancelled && !order.is_delivered && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleDeliver} className="w-full" size="lg">
              <Package className="h-4 w-4 mr-2" />
              Mark as Delivered
            </Button>

            {!showCancelForm ? (
              <Button
                variant="destructive"
                onClick={() => setShowCancelForm(true)}
                className="w-full"
              >
                Cancel Order
              </Button>
            ) : (
              <div className="space-y-3 border-t pt-4">
                <Input
                  placeholder="Cancellation reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleCancel} className="flex-1">
                    Confirm Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelForm(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {order.is_cancelled && (
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{order.cancellation_reason}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Notes</CardTitle>
            {!order.is_cancelled && !order.is_delivered && (
              <Button size="sm" onClick={() => setShowNoteModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.notes.map((note) => (
              <div key={note.id} className="border-b pb-2 flex justify-between">
                <div className="flex-1">
                  <p className="text-sm">{note.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(note.created_at)}
                  </p>
                </div>
                {!order.is_cancelled && !order.is_delivered && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {order.notes.length === 0 && (
              <p className="text-sm text-muted-foreground">No notes</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Order Note">
        <div className="space-y-4">
          <FormField label="Note" required>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter note"
              rows={4}
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleAddNote} className="flex-1">Add</Button>
            <Button variant="outline" onClick={() => setShowNoteModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
