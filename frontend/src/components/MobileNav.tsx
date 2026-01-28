import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const mainNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
]

const moreItems = [
  { to: '/stock-movements', label: 'Stock Movements' },
  { to: '/users', label: 'User Management' },
  { to: '/reports/customer-revenue', label: 'Revenue Report' },
  { to: '/profile', label: 'Profile' },
]

export default function MobileNav() {
  const [showMore, setShowMore] = useState(false)
  const navigate = useNavigate()

  const handleMoreItemClick = (to: string) => {
    setShowMore(false)
    navigate(to)
  }

  return (
    <>
      {showMore && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMore(false)}
        >
          <div className="absolute bottom-16 left-0 right-0 bg-card border-t p-4 space-y-2">
            {moreItems.map((item) => (
              <button
                key={item.to}
                onClick={() => handleMoreItemClick(item.to)}
                className="w-full text-left px-4 py-3 hover:bg-accent rounded"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="flex justify-around items-center h-16">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
