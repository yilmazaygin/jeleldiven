import apiClient from './client'

export interface DashboardReport {
  pending_deliveries_count: number
  pending_payments_count: number
  total_revenue: number
}

export interface CustomerRevenueReport {
  customer_id: number
  customer_name: string
  total_revenue: number
}

export interface StockReport {
  product_id: number
  product_name: string
  total_stock: number
  reserved_stock: number
  available_stock: number
}

export const reportsApi = {
  getDashboard: async (): Promise<DashboardReport> => {
    const response = await apiClient.get('/reports/dashboard')
    return response.data
  },

  getCustomerRevenue: async (): Promise<CustomerRevenueReport[]> => {
    const response = await apiClient.get('/reports/customer-revenue')
    return response.data
  },

  getStock: async (): Promise<StockReport[]> => {
    const response = await apiClient.get('/reports/stock')
    return response.data
  },
}
