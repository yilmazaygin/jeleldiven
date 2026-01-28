import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { LogOut, Moon, Sun } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="font-medium">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Account Created</p>
            <p className="font-medium">{user?.created_at && formatDate(user.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 mr-3" />
            ) : (
              <Sun className="h-5 w-5 mr-3" />
            )}
            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          </Button>

          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
