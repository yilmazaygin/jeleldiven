import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  LogOut,
  User,
  Moon,
  Sun,
  UserCog,
  DollarSign
} from 'lucide-react'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/stock-movements', label: 'Stock', icon: TrendingUp },
  { to: '/reports/customer-revenue', label: 'Revenue Report', icon: DollarSign },
  { to: '/users', label: 'User Management', icon: UserCog },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-card p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Management</h1>
        <p className="text-sm text-muted-foreground">{user?.full_name}</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 mr-3" />
          ) : (
            <Sun className="h-5 w-5 mr-3" />
          )}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
